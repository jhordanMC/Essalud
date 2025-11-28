// Variables globales
let regiones = [];
let centros = [];
let especialidades = [];
let doctores = [];

// Verificar sesión
window.addEventListener('load', function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('No has iniciado sesión. Serás redirigido a la página de inicio.');
        window.location.href = 'index.html';
        return;
    }
    personalizeScripts();
    cargarRegiones();
});

function personalizeScripts() {
    const workerName = localStorage.getItem('workerName') || 'Usuario';
    const initials = workerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-initials').textContent = initials;
}

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

// ========== FUNCIONES DE CARGA DE DATOS ==========

async function cargarRegiones() {
    try {
        const response = await fetch('https://cirochat.duckdns.org/api/obtener_ubicaciones');
        const data = await response.json();

        if (data.success) {
            regiones = data.ubicaciones;
            const select = document.getElementById('region-select');
            select.innerHTML = '<option value="" disabled selected>Selecciona una región</option>';
            
            regiones.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando regiones:', error);
        alert('Error al cargar las regiones');
    }
}

async function cargarCentros(idRegion) {
    try {
        const response = await fetch('https://cirochat.duckdns.org/api/obtener_centros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_region: idRegion })
        });

        const data = await response.json();

        if (data.success) {
            centros = data.centros;
            const select = document.getElementById('centro-select');
            select.innerHTML = '<option value="" disabled selected>Selecciona un centro</option>';
            select.disabled = false;
            
            centros.forEach(centro => {
                const option = document.createElement('option');
                option.value = centro.id;
                option.textContent = centro.nombre;
                option.dataset.centro = JSON.stringify(centro);
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando centros:', error);
        alert('Error al cargar los centros de salud');
    }
}

async function cargarEspecialidades(idCentro) {
    try {
        const response = await fetch('https://cirochat.duckdns.org/api/obtener_especialidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_centro: idCentro })
        });

        const data = await response.json();

        if (data.success) {
            especialidades = data.especialidades;
            const select = document.getElementById('especialidad-select');
            select.innerHTML = '<option value="" disabled selected>Selecciona una especialidad</option>';
            select.disabled = false;
            
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id;
                option.textContent = esp.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando especialidades:', error);
        alert('Error al cargar las especialidades');
    }
}

async function cargarDoctores(idEspecialidad, idCentro) {
    try {
        const response = await fetch('https://cirochat.duckdns.org/api/obtener_doctores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id_especialidad: idEspecialidad,
                id_centro: idCentro
            })
        });

        const data = await response.json();

        if (data.success) {
            doctores = data.doctores;
            const select = document.getElementById('doctor-select');
            select.innerHTML = '<option value="">Todos los doctores</option>';
            select.disabled = false;
            
            doctores.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = doc.nombre_completo;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando doctores:', error);
    }
}

// ========== EVENT LISTENERS ==========

document.getElementById('region-select').addEventListener('change', function() {
    const idRegion = this.value;
    
    // Reset campos dependientes
    document.getElementById('centro-select').innerHTML = '<option value="" disabled selected>Cargando...</option>';
    document.getElementById('centro-select').disabled = true;
    document.getElementById('especialidad-select').innerHTML = '<option value="" disabled selected>Primero selecciona un centro</option>';
    document.getElementById('especialidad-select').disabled = true;
    document.getElementById('doctor-select').innerHTML = '<option value="">Todos los doctores</option>';
    document.getElementById('doctor-select').disabled = true;
    document.getElementById('fecha-input').disabled = true;
    document.getElementById('buscar-btn').disabled = true;
    
    // Ocultar mapa
    document.getElementById('map-container').style.display = 'none';
    
    cargarCentros(idRegion);
});

document.getElementById('centro-select').addEventListener('change', function() {
    const idCentro = this.value;
    const centroData = JSON.parse(this.options[this.selectedIndex].dataset.centro);
    
    // Reset campos dependientes
    document.getElementById('especialidad-select').innerHTML = '<option value="" disabled selected>Cargando...</option>';
    document.getElementById('especialidad-select').disabled = true;
    document.getElementById('doctor-select').innerHTML = '<option value="">Todos los doctores</option>';
    document.getElementById('doctor-select').disabled = true;
    document.getElementById('fecha-input').disabled = true;
    document.getElementById('buscar-btn').disabled = true;
    
    // Mostrar información del centro y mapa
    mostrarInformacionCentro(centroData);
    
    cargarEspecialidades(idCentro);
});

document.getElementById('especialidad-select').addEventListener('change', function() {
    const idEspecialidad = this.value;
    const idCentro = document.getElementById('centro-select').value;
    
    // Habilitar fecha
    document.getElementById('fecha-input').disabled = false;
    
    // Configurar fecha mínima (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-input').min = hoy;
    document.getElementById('fecha-input').value = hoy;
    
    cargarDoctores(idEspecialidad, idCentro);
    verificarFormulario();
});

document.getElementById('doctor-select').addEventListener('change', verificarFormulario);
document.getElementById('fecha-input').addEventListener('change', verificarFormulario);

function verificarFormulario() {
    const region = document.getElementById('region-select').value;
    const centro = document.getElementById('centro-select').value;
    const especialidad = document.getElementById('especialidad-select').value;
    const fecha = document.getElementById('fecha-input').value;
    
    const btn = document.getElementById('buscar-btn');
    btn.disabled = !(region && centro && especialidad && fecha);
}

// ========== BÚSQUEDA Y RESULTADOS ==========

document.getElementById('buscar-btn').addEventListener('click', buscarDisponibilidad);

async function buscarDisponibilidad() {
    const idCentro = document.getElementById('centro-select').value;
    const idEspecialidad = document.getElementById('especialidad-select').value;
    const idDoctor = document.getElementById('doctor-select').value;
    const fecha = document.getElementById('fecha-input').value;

    // Mostrar loader
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('loader-state').style.display = 'block';

    try {
        // Si hay doctor específico, buscar solo sus horarios
        if (idDoctor) {
            const response = await fetch('https://cirochat.duckdns.org/api/obtener_horarios_disponibles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_empleado: idDoctor,
                    fecha: fecha,
                    id_especialidad: idEspecialidad
                })
            });

            const data = await response.json();
            
            document.getElementById('loader-state').style.display = 'none';

            if (data.success && data.horarios.length > 0) {
                const doctor = doctores.find(d => d.id == idDoctor);
                mostrarResultadosUnDoctor(doctor, data.horarios, fecha);
            } else {
                mostrarSinResultados();
            }
        } else {
            // Buscar todos los doctores de la especialidad
            const promesas = doctores.map(doc => 
                fetch('https://cirochat.duckdns.org/api/obtener_horarios_disponibles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: doc.id,
                        fecha: fecha,
                        id_especialidad: idEspecialidad
                    })
                }).then(r => r.json())
            );

            const resultados = await Promise.all(promesas);
            
            document.getElementById('loader-state').style.display = 'none';

            const doctoresDisponibles = [];
            resultados.forEach((data, index) => {
                if (data.success && data.horarios.length > 0) {
                    doctoresDisponibles.push({
                        doctor: doctores[index],
                        horarios: data.horarios
                    });
                }
            });

            if (doctoresDisponibles.length > 0) {
                mostrarResultadosTodosDoctores(doctoresDisponibles, fecha);
            } else {
                mostrarSinResultados();
            }
        }

    } catch (error) {
        console.error('Error en búsqueda:', error);
        document.getElementById('loader-state').style.display = 'none';
        alert('Error al buscar disponibilidad');
    }
}

function mostrarResultadosUnDoctor(doctor, horarios, fecha) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    container.style.display = 'block';

    const card = crearDoctorCard(doctor, horarios, fecha);
    container.appendChild(card);
}

function mostrarResultadosTodosDoctores(doctoresDisponibles, fecha) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
            Se encontraron <strong>${doctoresDisponibles.length}</strong> médicos disponibles
        </p>
    `;
    container.style.display = 'block';

    doctoresDisponibles.forEach(({doctor, horarios}) => {
        const card = crearDoctorCard(doctor, horarios, fecha);
        container.appendChild(card);
    });
}

function crearDoctorCard(doctor, horarios, fecha) {
    const card = document.createElement('div');
    card.className = 'doctor-card';

    const iniciales = doctor.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2);

    card.innerHTML = `
        <div class="doctor-header">
            <div class="doctor-avatar">${iniciales}</div>
            <div class="doctor-info">
                <h3>${doctor.nombre_completo}</h3>
                <p>${doctor.cargo || 'Médico Especialista'}</p>
            </div>
        </div>

        <div class="doctor-details">
            <div class="detail-item">
                <span class="detail-icon">🏥</span>
                <span>Colegiatura: ${doctor.colegiatura}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span>Experiencia: ${doctor.experiencia} años</span>
            </div>
        </div>

        <div class="horarios-container">
            <div class="horarios-title">⏰ Horarios disponibles para ${formatearFecha(fecha)}:</div>
            <div class="horarios-grid" id="horarios-${doctor.id}">
                ${horarios.map(h => `
                    <button class="horario-btn" onclick="seleccionarHorario('${doctor.id}', '${doctor.nombre_completo}', '${h.hora}', '${fecha}')">
                        ${h.hora}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    return card;
}

function mostrarSinResultados() {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">😞</div>
            <p style="font-size: 16px; margin-bottom: 10px; font-weight: 500;">No hay disponibilidad</p>
            <p style="font-size: 14px;">No se encontraron médicos disponibles para los criterios seleccionados.</p>
            <p style="font-size: 14px; margin-top: 10px;">Intenta con otra fecha o especialidad.</p>
        </div>
    `;
    container.style.display = 'block';
}

function seleccionarHorario(idDoctor, nombreDoctor, hora, fecha) {
    const mensaje = `
¿Deseas agendar una cita con ${nombreDoctor}?

📅 Fecha: ${formatearFecha(fecha)}
⏰ Hora: ${hora}

Serás redirigido a la página de gestión de citas.
    `;

    if (confirm(mensaje)) {
        // Guardar información para pre-llenar el formulario
        localStorage.setItem('cita_prellenado', JSON.stringify({
            id_empleado: idDoctor,
            nombre_doctor: nombreDoctor,
            fecha: fecha,
            hora: hora,
            id_especialidad: document.getElementById('especialidad-select').value,
            id_centro: document.getElementById('centro-select').value
        }));

        window.location.href = 'GenerarCita.html';
    }
}

function formatearFecha(fecha) {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

function mostrarInformacionCentro(centro) {
    const infoBox = document.getElementById('hospital-info-box');
    infoBox.innerHTML = `
        <h4>${centro.nombre}</h4>
        <p><strong>📍 Dirección:</strong> ${centro.direccion_completa}</p>
        <p><strong>📞 Teléfono:</strong> ${centro.telefono}</p>
        <p><strong>🕒 Horario:</strong> ${centro.horario_apertura} - ${centro.horario_cierre}</p>
        <p><strong>🏥 Tipo:</strong> ${centro.tipo} - Nivel ${centro.nivel_atencion}</p>
    `;

    // Mostrar mapa (usando OpenStreetMap)
    const mapFrame = document.getElementById('map-frame');
    // Aquí deberías usar las coordenadas reales del centro si las tienes en la BD
    // Por ahora usamos un mapa general de Perú
    mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=-77.1%2C-12.2%2C-77.0%2C-12.0&layer=mapnik`;
    
    document.getElementById('map-container').style.display = 'block';
}