let allCitas = [];
let filteredCitas = [];

// Función para verificar si una cita está expirada
function isCitaExpirada(fechaCita, horaCita) {
    try {
        // Parsear fecha (formato DD/MM/YYYY)
        const [dia, mes, anio] = fechaCita.split('/');
        const citaDate = new Date(anio, mes - 1, dia);
        
        // Parsear hora (formato HH:MM)
        const [horas, minutos] = horaCita.split(':');
        citaDate.setHours(parseInt(horas), parseInt(minutos), 0, 0);
        
        // Comparar con fecha/hora actual
        const ahora = new Date();
        
        return citaDate < ahora;
    } catch (error) {
        console.error('Error al verificar fecha de cita:', error);
        return false;
    }
}

// Verificar sesión al cargar
window.addEventListener('load', function() {
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const workerName = localStorage.getItem('workerName') || 'Usuario';
    
    if (!userEmail && !userId) {
        alert('No has iniciado sesión. Serás redirigido a la página de inicio.');
        window.location.href = 'index.html';
        return;
    }

    // Personalizar navbar
    const initials = workerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-initials').textContent = initials;

    // Mostrar email temporalmente mientras carga
    if (userEmail) {
        document.getElementById('user-email-display').innerHTML = `
            ⏳ Cargando información de <strong>${userEmail}</strong>...
        `;
    } else {
        document.getElementById('user-email-display').innerHTML = `
            ⏳ Cargando información del paciente...
        `;
    }

    // Cargar historial
    loadHistorial();
});

// Menu de usuario
document.getElementById('user-menu-button').addEventListener('click', function(e) {
    const menu = document.getElementById('user-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.clear();
        alert("Sesión cerrada correctamente.");
        window.location.href = 'index.html';
    }
});

document.addEventListener('click', function(e) {
    const menu = document.getElementById('user-menu');
    const button = document.getElementById('user-menu-button');
    if (!menu.contains(e.target) && e.target !== button) {
        menu.style.display = 'none';
    }
});

// Función principal para cargar historial
async function loadHistorial() {
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const workerName = localStorage.getItem('workerName');

    if (!userEmail && !userId) {
        showError('No se encontró información de sesión');
        return;
    }

    // Mostrar loader
    document.getElementById('loader').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('citas-container').innerHTML = '';
    document.getElementById('stats-container').style.display = 'none';
    document.getElementById('filters-container').style.display = 'none';

    try {
        const response = await fetch('https://cirochat.duckdns.org/api/obtener_historial_citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: userEmail || userId
            })
        });

        const data = await response.json();

        document.getElementById('loader').style.display = 'none';

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al obtener historial');
        }

        // Actualizar información del paciente en el header
        if (data.citas.length > 0) {
            const primeraCita = data.citas[0];
            const nombrePaciente = primeraCita.paciente.nombre_completo;
            const telefonoPaciente = primeraCita.paciente.telefono;
            
            document.getElementById('user-email-display').innerHTML = `
                <strong>Paciente:</strong> ${nombrePaciente} | 
                <strong>Correo:</strong> ${userEmail || 'No disponible'} | 
                <strong>Teléfono:</strong> ${telefonoPaciente}
            `;
        } else {
            // Si no hay citas, mostrar solo email
            document.getElementById('user-email-display').innerHTML = `
                <strong>Correo:</strong> ${userEmail || userId}
            `;
        }

        if (data.citas.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }

        // Guardar citas
        allCitas = data.citas;
        filteredCitas = [...allCitas];

        // Debug: Imprimir estados en consola
        console.log('📊 Análisis de estados de citas:');
        const estadosConteo = {};
        allCitas.forEach(cita => {
            const estado = cita.estado.nombre;
            estadosConteo[estado] = (estadosConteo[estado] || 0) + 1;
        });
        console.table(estadosConteo);

        // Mostrar estadísticas (siempre recalcular para asegurar)
        displayStats(data.estadisticas);

        // Poblar filtros
        populateFilters();

        // Mostrar citas
        displayCitas(filteredCitas);

        // Mostrar controles
        document.getElementById('stats-container').style.display = 'grid';
        document.getElementById('filters-container').style.display = 'block';

        // Cargar notificaciones
        loadNotifications();

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loader').style.display = 'none';
        showError(error.message);
    }
}

function showError(message) {
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

function displayStats(stats) {
    // Siempre recalcular manualmente para incluir citas expiradas
    const total = allCitas.length;
    let programadas = 0;
    let completadas = 0;
    let canceladas = 0;
    let expiradas = 0;

    allCitas.forEach(cita => {
        const estadoNormalizado = cita.estado.nombre.toUpperCase();
        const estaExpirada = isCitaExpirada(cita.fecha_cita, cita.hora_cita);
        
        // Si la cita está expirada y aún está programada, contarla como expirada
        if (estaExpirada && (estadoNormalizado.includes('PROGRAMADA') || estadoNormalizado.includes('CONFIRMADA'))) {
            expiradas++;
        } else if (estadoNormalizado.includes('PROGRAMADA') || estadoNormalizado.includes('CONFIRMADA')) {
            programadas++;
        } else if (estadoNormalizado.includes('COMPLETADA') || estadoNormalizado.includes('ATENDIDA')) {
            completadas++;
        } else if (estadoNormalizado.includes('CANCELADA')) {
            canceladas++;
        }
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-programadas').textContent = programadas;
    document.getElementById('stat-completadas').textContent = completadas;
    document.getElementById('stat-canceladas').textContent = canceladas;
    
    // Agregar estadística de expiradas si hay
    if (expiradas > 0) {
        const statsContainer = document.getElementById('stats-container');
        
        // Verificar si ya existe la tarjeta de expiradas
        let expiradaCard = document.getElementById('stat-expiradas-card');
        if (!expiradaCard) {
            expiradaCard = document.createElement('div');
            expiradaCard.id = 'stat-expiradas-card';
            expiradaCard.className = 'stat-card';
            expiradaCard.innerHTML = `
                <div class="stat-card-header">⚠️ Expiradas</div>
                <div class="stat-card-value" id="stat-expiradas" style="color: #ffc107;">0</div>
            `;
            statsContainer.appendChild(expiradaCard);
        }
        
        document.getElementById('stat-expiradas').textContent = expiradas;
    }
}

function populateFilters() {
    // Obtener especialidades únicas
    const especialidades = [...new Set(allCitas.map(c => c.especialidad.nombre))].sort();
    
    const selectEsp = document.getElementById('filter-especialidad');
    selectEsp.innerHTML = '<option value="">Todas las especialidades</option>';
    
    especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        selectEsp.appendChild(option);
    });
}

function displayCitas(citas) {
    const container = document.getElementById('citas-container');
    container.innerHTML = '';

    if (citas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No se encontraron citas</div>
                <div class="empty-state-text">Intenta ajustar los filtros</div>
            </div>
        `;
        return;
    }

    citas.forEach(cita => {
        const card = createCitaCard(cita);
        container.appendChild(card);
    });
}

function createCitaCard(cita) {
    const card = document.createElement('div');
    const estadoNormalizado = cita.estado.nombre.toUpperCase();
    
    // Verificar si la cita está expirada
    const estaExpirada = isCitaExpirada(cita.fecha_cita, cita.hora_cita);
    const esProgramada = estadoNormalizado.includes('PROGRAMADA') || estadoNormalizado.includes('CONFIRMADA');
    
    let estadoClass = 'programada';
    let estadoBadgeClass = 'estado-programada';
    let estadoMostrar = cita.estado.nombre;
    
    // Si está expirada y aún está programada, mostrar como expirada
    if (estaExpirada && esProgramada) {
        estadoClass = 'expirada';
        estadoBadgeClass = 'estado-expirada';
        estadoMostrar = 'EXPIRADA';
    } else if (estadoNormalizado.includes('COMPLETADA') || estadoNormalizado.includes('ATENDIDA')) {
        estadoClass = 'completada';
        estadoBadgeClass = 'estado-completada';
    } else if (estadoNormalizado.includes('CANCELADA')) {
        estadoClass = 'cancelada';
        estadoBadgeClass = 'estado-cancelada';
    }

    // Determinar si se pueden mostrar botones de acción
    // Solo mostrar botones si está programada Y NO ha expirado
    const showActions = esProgramada && !estaExpirada;

    card.className = `cita-card ${estadoClass}`;
    card.innerHTML = `
        <div class="cita-header">
            <div class="cita-id">🏥 ${cita.codigo_cita}</div>
            <div class="cita-estado ${estadoBadgeClass}">${estadoMostrar}</div>
        </div>
        <div class="cita-details">
            <div class="detail-item">
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                    <div class="detail-label">Fecha y Hora</div>
                    <div class="detail-value">${cita.fecha_cita} - ${cita.hora_cita}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">👨‍⚕️</div>
                <div class="detail-content">
                    <div class="detail-label">Doctor</div>
                    <div class="detail-value">${cita.doctor.nombre_completo}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">🏥</div>
                <div class="detail-content">
                    <div class="detail-label">Especialidad</div>
                    <div class="detail-value">${cita.especialidad.nombre}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">📍</div>
                <div class="detail-content">
                    <div class="detail-label">Centro de Salud</div>
                    <div class="detail-value">${cita.centro.nombre}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">🗺️</div>
                <div class="detail-content">
                    <div class="detail-label">Dirección</div>
                    <div class="detail-value">${cita.centro.direccion_completa}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">📞</div>
                <div class="detail-content">
                    <div class="detail-label">Teléfono</div>
                    <div class="detail-value">${cita.centro.telefono}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">💰</div>
                <div class="detail-content">
                    <div class="detail-label">Precio</div>
                    <div class="detail-value">S/. ${cita.precio.toFixed(2)}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">⏱️</div>
                <div class="detail-content">
                    <div class="detail-label">Duración</div>
                    <div class="detail-value">${cita.duracion_minutos} minutos</div>
                </div>
            </div>
        </div>
        ${cita.motivo_consulta ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
                <div class="detail-label" style="margin-bottom: 5px;">📝 Motivo de Consulta:</div>
                <div style="color: #666; font-size: 14px;">${cita.motivo_consulta}</div>
            </div>
        ` : ''}
        ${cita.observaciones ? `
            <div style="margin-top: 10px;">
                <div class="detail-label" style="margin-bottom: 5px;">📋 Observaciones:</div>
                <div style="color: #666; font-size: 14px;">${cita.observaciones}</div>
            </div>
        ` : ''}
        ${estaExpirada && esProgramada ? `
            <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <div style="color: #856404; font-size: 14px; font-weight: 500;">
                    ⚠️ Esta cita ha expirado. La fecha y hora ya pasaron.
                </div>
            </div>
        ` : ''}
        ${showActions ? `
            <div class="cita-actions">
                <button class="action-button btn-reschedule" onclick="rescheduleAppointment('${cita.id_cita}', '${cita.codigo_cita}')">
                    📅 Reprogramar
                </button>
                <button class="action-button btn-cancel" onclick="cancelAppointment('${cita.id_cita}', '${cita.codigo_cita}')">
                    ❌ Cancelar Cita
                </button>
            </div>
        ` : ''}
    `;
    return card;
}

function applyFilters() {
    const codigo = document.getElementById('filter-codigo').value.toLowerCase().trim();
    const estado = document.getElementById('filter-estado').value;
    const especialidad = document.getElementById('filter-especialidad').value;

    filteredCitas = allCitas.filter(cita => {
        let match = true;

        if (codigo && !cita.codigo_cita.toLowerCase().includes(codigo)) {
            match = false;
        }

        if (estado) {
            const estadoNormalizado = cita.estado.nombre.toUpperCase();
            const estaExpirada = isCitaExpirada(cita.fecha_cita, cita.hora_cita);
            const esProgramada = estadoNormalizado.includes('PROGRAMADA') || estadoNormalizado.includes('CONFIRMADA');
            
            if (estado === 'EXPIRADA') {
                // Filtrar solo las expiradas
                if (!(estaExpirada && esProgramada)) {
                    match = false;
                }
            } else if (estado === 'PROGRAMADA') {
                // Filtrar solo las programadas que NO están expiradas
                if (!(esProgramada && !estaExpirada)) {
                    match = false;
                }
            } else {
                // Para otros estados (COMPLETADA, CANCELADA)
                if (!estadoNormalizado.includes(estado)) {
                    match = false;
                }
            }
        }

        if (especialidad && cita.especialidad.nombre !== especialidad) {
            match = false;
        }

        return match;
    });

    displayCitas(filteredCitas);
}

function resetFilters() {
    document.getElementById('filter-codigo').value = '';
    document.getElementById('filter-estado').value = '';
    document.getElementById('filter-especialidad').value = '';
    
    filteredCitas = [...allCitas];
    displayCitas(filteredCitas);
}

// ============ NOTIFICACIONES ============
let currentNotifications = [];

function loadNotifications() {
    // Simular notificaciones de citas próximas
    currentNotifications = [];
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    allCitas.forEach(cita => {
        const estadoNormalizado = cita.estado.nombre.toUpperCase();
        if (estadoNormalizado.includes('PROGRAMADA') || estadoNormalizado.includes('CONFIRMADA')) {
            // Parsear fecha de cita (formato DD/MM/YYYY)
            const [dia, mes, anio] = cita.fecha_cita.split('/');
            const fechaCita = new Date(anio, mes - 1, dia);
            fechaCita.setHours(0, 0, 0, 0);
            
            const diffTime = fechaCita - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays <= 7) {
                let mensaje = '';
                if (diffDays === 0) {
                    mensaje = `¡Tienes una cita HOY a las ${cita.hora_cita}!`;
                } else if (diffDays === 1) {
                    mensaje = `Tienes una cita MAÑANA a las ${cita.hora_cita}`;
                } else {
                    mensaje = `Tienes una cita en ${diffDays} días (${cita.fecha_cita} a las ${cita.hora_cita})`;
                }
                
                currentNotifications.push({
                    title: `${cita.especialidad.nombre}`,
                    text: mensaje,
                    doctor: cita.doctor.nombre_completo,
                    centro: cita.centro.nombre,
                    time: `${cita.fecha_cita} - ${cita.hora_cita}`,
                    priority: diffDays === 0 ? 'high' : 'normal'
                });
            }
        }
    });

    // Actualizar badge
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (currentNotifications.length > 0) {
        badge.textContent = currentNotifications.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    const isActive = panel.classList.contains('active');
    
    if (isActive) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        renderNotifications();
    }
}

function closeNotifications() {
    document.getElementById('notifications-panel').classList.remove('active');
}

function renderNotifications() {
    const body = document.getElementById('notifications-body');
    
    if (currentNotifications.length === 0) {
        body.innerHTML = `
            <div class="notification-empty">
                <p style="font-size: 16px; margin-bottom: 10px;">🔭</p>
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    body.innerHTML = '';
    currentNotifications.forEach((notif, index) => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.priority === 'high' ? 'unread' : ''}`;
        item.innerHTML = `
            <div class="notification-title">${notif.title}</div>
            <div class="notification-text">${notif.text}</div>
            <div class="notification-text" style="font-size: 12px;">👨‍⚕️ ${notif.doctor}</div>
            <div class="notification-text" style="font-size: 12px;">🏥 ${notif.centro}</div>
            <div class="notification-time">${notif.time}</div>
        `;
        body.appendChild(item);
    });
}

document.getElementById('notifications-button').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleNotifications();
});

document.addEventListener('click', function(e) {
    const panel = document.getElementById('notifications-panel');
    const button = document.getElementById('notifications-button');
    if (!panel.contains(e.target) && e.target !== button && !button.contains(e.target)) {
        closeNotifications();
    }
});

// ============ MODAL Y ACCIONES ============
let currentAction = null;
let currentCitaId = null;
let currentCitaCodigo = null;

function openModal(title, text, action, citaId, citaCodigo, buttonClass = 'primary') {
    currentAction = action;
    currentCitaId = citaId;
    currentCitaCodigo = citaCodigo;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;
    
    const confirmButton = document.getElementById('modal-confirm-button');
    confirmButton.className = `modal-button ${buttonClass}`;
    
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    currentAction = null;
    currentCitaId = null;
    currentCitaCodigo = null;
}

async function confirmAction() {
    if (currentAction === 'cancel') {
        await executeCancelAppointment();
    } else if (currentAction === 'reschedule') {
        executeRescheduleAppointment();
    }
}

function rescheduleAppointment(citaId, citaCodigo) {
    openModal(
        '📅 Reprogramar Cita',
        `¿Deseas reprogramar la cita ${citaCodigo}? Serás redirigido a la página de gestión de citas.`,
        'reschedule',
        citaId,
        citaCodigo,
        'primary'
    );
}

function executeRescheduleAppointment() {
    closeModal();
    // Guardar en localStorage la cita a reprogramar
    localStorage.setItem('reschedule_cita_id', currentCitaId);
    localStorage.setItem('reschedule_cita_codigo', currentCitaCodigo);
    
    // Redirigir a página de gestión de citas
    window.location.href = 'GenerarCita.html';
}

function cancelAppointment(citaId, citaCodigo) {
    openModal(
        '❌ Cancelar Cita',
        `¿Estás seguro de que deseas cancelar la cita ${citaCodigo}? Esta acción no se puede deshacer.`,
        'cancel',
        citaId,
        citaCodigo,
        'danger'
    );
}

async function executeCancelAppointment() {
    try {
        const response = await fetch('https://cirochat.duckdns.org/api/cancelar_cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id_cita: currentCitaId,
                usuario: localStorage.getItem('userEmail') || 'PACIENTE'
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al cancelar');
        }

        closeModal();
        alert(`✅ ${data.message}\nCita: ${data.cita.codigo}`);
        loadHistorial();
        
    } catch (error) {
        closeModal();
        alert('❌ Error al cancelar la cita: ' + error.message);
    }
}

// Cerrar modal al hacer clic fuera
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});