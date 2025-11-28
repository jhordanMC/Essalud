// ===============================================
// CONFIGURACIÓN
// ===============================================
const API_URL = 'https://cirochat.duckdns.org';

// ===============================================
// VARIABLES GLOBALES
// ===============================================
let datosUsuario = null;
let citaGenerada = null;

// ===============================================
// ELEMENTOS DEL DOM
// ===============================================
const ubicacionSelect = document.getElementById('ubicacion');
const centroSelect = document.getElementById('centro');
const centroInfo = document.getElementById('centroInfo');
const especialidadSelect = document.getElementById('especialidad');
const doctorSelect = document.getElementById('doctor');
const doctorInfo = document.getElementById('doctorInfo');
const fechaInput = document.getElementById('fecha');
const horaSelect = document.getElementById('hora');
const citaForm = document.getElementById('citaForm');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const modal = document.getElementById('modal');
const ticketDisplay = document.getElementById('ticketDisplay');
const closeModal = document.getElementById('closeModal');
const imprimirBtn = document.getElementById('imprimirBtn');
const descargarPdfBtn = document.getElementById('descargarPdfBtn');
const userMenuButton = document.getElementById('userMenuButton');
const userMenu = document.getElementById('userMenu');
const logoutLink = document.getElementById('logoutLink');
const userInitials = document.getElementById('userInitials');

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================
function showLoading(show = true) {
    loadingMessage.classList.toggle('active', show);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    setTimeout(() => errorMessage.classList.remove('active'), 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('active');
    setTimeout(() => successMessage.classList.remove('active'), 5000);
}

async function fetchAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }

        return result;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

// ===============================================
// INICIALIZACIÓN
// ===============================================
async function inicializar() {
    // Obtener ID del usuario de localStorage
    const userId = localStorage.getItem('userId');
    console.log('🔍 DEBUG - userId:', userId);
    console.log('🔍 DEBUG - Tipo:', typeof userId);
    
    if (!userId) {
        alert('Debes iniciar sesión primero');
        window.location.href = 'index.html';
        return;
    }

    datosUsuario = { id_paciente: userId };
    console.log('🔍 DEBUG - datosUsuario:', datosUsuario);
    
    // Actualizar iniciales del usuario
    const userName = localStorage.getItem('workerName') || 'Usuario';
    if (userName) {
        const nombres = userName.split(' ');
        userInitials.textContent = nombres[0].charAt(0).toUpperCase();
    }

    // Configurar fecha mínima (hoy)
    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split('T')[0];
    
    // Fecha máxima (3 meses adelante)
    const maxFecha = new Date();
    maxFecha.setMonth(maxFecha.getMonth() + 3);
    fechaInput.max = maxFecha.toISOString().split('T')[0];

    // Cargar ubicaciones
    await cargarUbicaciones();
}

// ===============================================
// CARGAR DATOS DESDE LA BD
// ===============================================
async function cargarUbicaciones() {
    showLoading(true);
    try {
        const result = await fetchAPI('/api/obtener_ubicaciones');
        
        ubicacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una región</option>';
        
        result.ubicaciones.forEach(ubicacion => {
            const option = document.createElement('option');
            option.value = ubicacion.id;
            option.textContent = ubicacion.nombre;
            ubicacionSelect.appendChild(option);
        });
        
    } catch (error) {
        showError('Error al cargar ubicaciones: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function cargarCentros(idRegion) {
    showLoading(true);
    try {
        const result = await fetchAPI('/api/obtener_centros', 'POST', { id_region: idRegion });
        
        centroSelect.innerHTML = '<option value="" disabled selected>Selecciona un centro de salud</option>';
        centroSelect.disabled = false;
        centroInfo.textContent = '';
        
        if (result.centros.length === 0) {
            centroSelect.innerHTML = '<option value="" disabled selected>No hay centros disponibles</option>';
            centroSelect.disabled = true;
            return;
        }
        
        result.centros.forEach(centro => {
            const option = document.createElement('option');
            option.value = centro.id;
            option.textContent = centro.nombre;
            option.dataset.info = JSON.stringify(centro);
            centroSelect.appendChild(option);
        });
        
    } catch (error) {
        showError('Error al cargar centros: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function cargarEspecialidades(idCentro) {
    showLoading(true);
    try {
        const result = await fetchAPI('/api/obtener_especialidades', 'POST', { id_centro: idCentro });
        
        especialidadSelect.innerHTML = '<option value="" disabled selected>Selecciona una especialidad</option>';
        especialidadSelect.disabled = false;
        
        if (result.especialidades.length === 0) {
            especialidadSelect.innerHTML = '<option value="" disabled selected>No hay especialidades disponibles</option>';
            especialidadSelect.disabled = true;
            return;
        }
        
        result.especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id;
            option.textContent = esp.nombre;
            especialidadSelect.appendChild(option);
        });
        
    } catch (error) {
        showError('Error al cargar especialidades: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function cargarDoctores(idEspecialidad, idCentro) {
    showLoading(true);
    try {
        const result = await fetchAPI('/api/obtener_doctores', 'POST', { 
            id_especialidad: idEspecialidad,
            id_centro: idCentro
        });
        
        doctorSelect.innerHTML = '<option value="" disabled selected>Selecciona un médico</option>';
        doctorSelect.disabled = false;
        doctorInfo.textContent = '';
        
        if (result.doctores.length === 0) {
            doctorSelect.innerHTML = '<option value="" disabled selected>No hay médicos disponibles</option>';
            doctorSelect.disabled = true;
            return;
        }
        
        result.doctores.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.nombre_completo;
            option.dataset.info = JSON.stringify(doc);
            doctorSelect.appendChild(option);
        });
        
    } catch (error) {
        showError('Error al cargar doctores: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function cargarHorarios(idEmpleado, fecha, idEspecialidad) {
    showLoading(true);
    try {
        const result = await fetchAPI('/api/obtener_horarios_disponibles', 'POST', {
            id_empleado: idEmpleado,
            fecha: fecha,
            id_especialidad: idEspecialidad
        });
        
        horaSelect.innerHTML = '<option value="" disabled selected>Selecciona un horario</option>';
        horaSelect.disabled = false;
        
        if (result.horarios.length === 0) {
            horaSelect.innerHTML = '<option value="" disabled selected>No hay horarios disponibles</option>';
            horaSelect.disabled = true;
            showError(result.message || 'No hay horarios disponibles para esta fecha');
            return;
        }
        
        result.horarios.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario.hora;
            option.textContent = horario.hora;
            horaSelect.appendChild(option);
        });
        
    } catch (error) {
        showError('Error al cargar horarios: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ===============================================
// EVENT LISTENERS
// ===============================================
ubicacionSelect.addEventListener('change', function() {
    const idRegion = this.value;
    
    centroSelect.innerHTML = '<option value="" disabled selected>Cargando centros...</option>';
    centroSelect.disabled = true;
    especialidadSelect.innerHTML = '<option value="" disabled selected>Primero selecciona un centro</option>';
    especialidadSelect.disabled = true;
    doctorSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una especialidad</option>';
    doctorSelect.disabled = true;
    fechaInput.disabled = true;
    horaSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una fecha</option>';
    horaSelect.disabled = true;
    
    cargarCentros(idRegion);
});

centroSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const centroData = JSON.parse(selectedOption.dataset.info);
    
    centroInfo.innerHTML = `
        📍 ${centroData.direccion}<br>
        📞 ${centroData.telefono}<br>
        🕒 Horario: ${centroData.horario_apertura} - ${centroData.horario_cierre}
    `;
    
    especialidadSelect.innerHTML = '<option value="" disabled selected>Cargando especialidades...</option>';
    especialidadSelect.disabled = true;
    doctorSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una especialidad</option>';
    doctorSelect.disabled = true;
    fechaInput.disabled = true;
    horaSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una fecha</option>';
    horaSelect.disabled = true;
    
    cargarEspecialidades(this.value);
});

especialidadSelect.addEventListener('change', function() {
    const idCentro = centroSelect.value;
    
    doctorSelect.innerHTML = '<option value="" disabled selected>Cargando doctores...</option>';
    doctorSelect.disabled = true;
    fechaInput.disabled = true;
    horaSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una fecha</option>';
    horaSelect.disabled = true;
    
    cargarDoctores(this.value, idCentro);
});

doctorSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const doctorData = JSON.parse(selectedOption.dataset.info);
    
    doctorInfo.innerHTML = `
        🩺 ${doctorData.cargo}<br>
        📋 CMP: ${doctorData.colegiatura}<br>
        ⏱️ Experiencia: ${doctorData.experiencia} años
    `;
    
    fechaInput.disabled = false;
    horaSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una fecha</option>';
    horaSelect.disabled = true;
});

fechaInput.addEventListener('change', function() {
    const fecha = this.value;
    const idEmpleado = doctorSelect.value;
    const idEspecialidad = especialidadSelect.value;
    
    if (!fecha || !idEmpleado || !idEspecialidad) {
        return;
    }
    
    horaSelect.innerHTML = '<option value="" disabled selected>Cargando horarios...</option>';
    horaSelect.disabled = true;
    
    cargarHorarios(idEmpleado, fecha, idEspecialidad);
});

// ===============================================
// ENVÍO DEL FORMULARIO
// ===============================================
citaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const datosF = {
        id_paciente: datosUsuario.id_paciente,
        id_empleado: parseInt(doctorSelect.value),
        id_especialidad: parseInt(especialidadSelect.value),
        id_centro: parseInt(centroSelect.value),
        fecha_cita: fechaInput.value,
        hora_cita: horaSelect.value,
        motivo_consulta: document.getElementById('motivo').value || 'Consulta general',
        observaciones: document.getElementById('observaciones').value || ''
    };
    
    console.log('📤 Datos a enviar:', datosF);
    console.log('📤 id_paciente:', datosF.id_paciente, 'Tipo:', typeof datosF.id_paciente);
    
    showLoading(true);
    
    try {
        const result = await fetchAPI('/api/registrar_cita', 'POST', datosF);
        
        citaGenerada = result.cita;
        mostrarTicket(result.cita);
        showSuccess('¡Cita registrada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        showError('Error al registrar cita: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// ===============================================
// GENERAR Y MOSTRAR TICKET
// ===============================================
function mostrarTicket(cita) {
    const ticketHTML = `
        <div class="ticket-container">
            <div class="ticket-header">
                <h2 style="margin: 0 0 10px 0; color: #0078D7;">CITA MÉDICA CONFIRMADA</h2>
                <div class="ticket-number">${cita.codigo_cita}</div>
                <p style="margin: 5px 0; font-size: 0.9rem;">Sistema de Citas EsSalud</p>
            </div>
            
            <div class="ticket-info">
                <div class="info-group">
                    <div class="info-label">PACIENTE:</div>
                    <div class="info-value">${cita.paciente}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">ESPECIALIDAD:</div>
                    <div class="info-value">${cita.especialidad}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">MÉDICO:</div>
                    <div class="info-value">${cita.doctor}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">CENTRO MÉDICO:</div>
                    <div class="info-value">${cita.centro}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">FECHA:</div>
                    <div class="info-value">${cita.fecha}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">HORA:</div>
                    <div class="info-value">${cita.hora}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">DIRECCIÓN:</div>
                    <div class="info-value">${cita.direccion}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">TELÉFONO:</div>
                    <div class="info-value">${cita.telefono}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">MOTIVO:</div>
                    <div class="info-value">${cita.motivo || 'Consulta general'}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">ESTADO:</div>
                    <div class="info-value" style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 15px; display: inline-block;">${cita.estado}</div>
                </div>
            </div>
            
            <div class="ticket-footer">
                <p><strong>📌 INFORMACIÓN IMPORTANTE:</strong></p>
                <p>• Presentarse 15 minutos antes de la hora programada</p>
                <p>• Traer DNI original y este comprobante</p>
                <p>• En caso de no poder asistir, cancelar con 24 horas de anticipación</p>
                <p>• Para reprogramar llamar al ${cita.telefono}</p>
                <hr style="margin: 15px 0; border: 1px dashed #0078D7;">
                <p style="font-size: 0.8rem; margin: 0;">
                    <strong>Generado:</strong> ${new Date().toLocaleString('es-PE')}<br>
                    <strong>Número de Cita:</strong> ${cita.codigo_cita}<br>
                    <strong>Sistema EsSalud</strong> - Todos los derechos reservados
                </p>
            </div>
        </div>
    `;
    
    ticketDisplay.innerHTML = ticketHTML;
    modal.style.display = 'flex';
}

// ===============================================
// FUNCIONES DE TICKET
// ===============================================
imprimirBtn.addEventListener('click', function() {
    window.print();
});

descargarPdfBtn.addEventListener('click', function() {
    if (!citaGenerada) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(0, 120, 215);
    doc.text('CITA MÉDICA - ESSALUD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Número de Cita: ${citaGenerada.codigo_cita}`, 105, 30, { align: 'center' });
    
    doc.setDrawColor(0, 120, 215);
    doc.line(20, 35, 190, 35);
    
    let yPos = 50;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const datos = [
        ['PACIENTE:', citaGenerada.paciente],
        ['ESPECIALIDAD:', citaGenerada.especialidad],
        ['MÉDICO:', citaGenerada.doctor],
        ['CENTRO:', citaGenerada.centro],
        ['FECHA:', citaGenerada.fecha],
        ['HORA:', citaGenerada.hora],
        ['DIRECCIÓN:', citaGenerada.direccion],
        ['TELÉFONO:', citaGenerada.telefono]
    ];
    
    datos.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 20, yPos + 5);
        yPos += 15;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORMACIÓN IMPORTANTE:', 20, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const instrucciones = [
        '• Presentarse 15 minutos antes',
        '• Traer DNI original',
        '• Cancelar con 24 horas de anticipación si no puede asistir'
    ];
    
    instrucciones.forEach(inst => {
        doc.text(inst, 20, yPos);
        yPos += 7;
    });
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 20, 280);
    doc.text('Sistema EsSalud', 105, 285, { align: 'center' });
    
    doc.save(`Cita_${citaGenerada.codigo_cita}.pdf`);
});

function resetForm() {
    modal.style.display = 'none';
    citaForm.reset();
    citaGenerada = null;
    
    centroSelect.disabled = true;
    especialidadSelect.disabled = true;
    doctorSelect.disabled = true;
    fechaInput.disabled = true;
    horaSelect.disabled = true;
    
    centroInfo.textContent = '';
    doctorInfo.textContent = '';
}

document.getElementById('nuevaCitaBtn').addEventListener('click', resetForm);

closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ===============================================
// MENÚ DE USUARIO
// ===============================================
userMenuButton.addEventListener('click', function(e) {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

logoutLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.clear();
        alert("Sesión cerrada correctamente.");
        window.location.href = 'index.html';
    }
    userMenu.style.display = 'none';
});

document.addEventListener('click', function(e) {
    if (!userMenu.contains(e.target) && e.target !== userMenuButton) {
        userMenu.style.display = 'none';
    }
});

// ===============================================
// INICIAR APLICACIÓN
// ===============================================
inicializar();