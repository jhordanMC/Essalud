// Verificar sesión al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('No has iniciado sesión. Serás redirigido a la página de inicio.');
        window.location.href = 'index.html';
        return;
    }
    personalizeScripts();
    loadHospitals();
    
    // Inicializar mapa después de que la página esté completamente cargada
    setTimeout(() => {
        initializeMap();
    }, 100);
});

// Datos de hospitales con información completa - SOLO 4 CENTROS
const hospitalData = {
    'Policlinico Los Olivos': {
        direccion: 'Av. Alfredo Mendiola 3540, Los Olivos, Lima',
        telefono: '(01) 715-2500',
        distrito: 'Los Olivos',
        horarios: 'Lunes a Viernes: 7:00 AM - 8:00 PM<br>Sábados: 8:00 AM - 2:00 PM',
        lat: -11.9704,
        lng: -77.0676,
        transporte: 'Metropolitano, múltiples líneas de buses y combis',
        buses: [
            {
                nombre: 'Metropolitano - Estación Naranjal',
                ruta: 'Naranjal - Matellini',
                tiempo: '10 min caminando desde estación',
                tipo: 'BRT',
                imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Metropolitano_Lima_Bus.jpg/300px-Metropolitano_Lima_Bus.jpg'
            },
            {
                nombre: 'Bus 38 - Av. Alfredo Mendiola',
                ruta: 'Los Olivos - Centro de Lima',
                tiempo: 'Paradero frente al policlínico',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "Los Olivos Express"',
                ruta: 'Independencia - Los Olivos',
                tiempo: '3 min caminando',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Colectivo "Naranjal Directo"',
                ruta: 'Comas - Los Olivos',
                tiempo: '5 min caminando',
                tipo: 'Colectivo',
                imagen: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Bus 95 - Línea Verde',
                ruta: 'San Martín de Porres - Los Olivos',
                tiempo: '2 min caminando',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=300&h=200&fit=crop'
            }
        ],
        recomendaciones: [
            'Llegar 20 minutos antes de su cita',
            'Traer DNI original y tarjeta de seguro',
            'El policlínico cuenta con estacionamiento gratuito',
            'Hay farmacia en el primer piso',
            'Atención preferencial para adultos mayores'
        ]
    },
    'UBAP Villa Sol': {
        direccion: 'Av. Villa Sol 195, Los Olivos, Lima',
        telefono: '(01) 715-3600',
        distrito: 'Los Olivos',
        horarios: 'Lunes a Viernes: 7:00 AM - 7:00 PM<br>Sábados: 8:00 AM - 1:00 PM',
        lat: -11.9850,
        lng: -77.0720,
        transporte: 'Buses urbanos, combis de Los Olivos',
        buses: [
            {
                nombre: 'Bus 24 - Villa Sol',
                ruta: 'Los Olivos - San Martín de Porres',
                tiempo: 'Paradero en la puerta',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "Villa Sol Express"',
                ruta: 'Centro Los Olivos - Villa Sol',
                tiempo: 'Paradero frente al centro',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Colectivo "Los Olivos Norte"',
                ruta: 'Independencia - Los Olivos',
                tiempo: '4 min caminando',
                tipo: 'Colectivo',
                imagen: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Bus 102 - Línea Azul',
                ruta: 'Comas - Los Olivos',
                tiempo: '6 min caminando',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=300&h=200&fit=crop'
            }
        ],
        recomendaciones: [
            'Centro de atención básica',
            'Ideal para consultas de medicina general',
            'Servicio de toma de muestras de laboratorio',
            'Horario extendido de lunes a viernes',
            'Estacionamiento limitado, usar transporte público'
        ]
    },
    'Policlinico El Trébol': {
        direccion: 'Av. Carlos Izaguirre 175, Independencia, Lima',
        telefono: '(01) 715-4700',
        distrito: 'Independencia',
        horarios: 'Lunes a Viernes: 6:30 AM - 8:00 PM<br>Sábados: 7:00 AM - 3:00 PM',
        lat: -11.9890,
        lng: -77.0560,
        transporte: 'Metropolitano, buses urbanos, combis y colectivos',
        buses: [
            {
                nombre: 'Metropolitano - Estación Izaguirre',
                ruta: 'Naranjal - Matellini',
                tiempo: '5 min caminando desde estación',
                tipo: 'BRT',
                imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Metropolitano_Lima_Bus.jpg/300px-Metropolitano_Lima_Bus.jpg'
            },
            {
                nombre: 'Bus 72 - Av. Carlos Izaguirre',
                ruta: 'Independencia - Comas',
                tiempo: 'Paradero frente al policlínico',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "El Trébol Directo"',
                ruta: 'Centro - Independencia',
                tiempo: '2 min caminando',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Colectivo "Independencia Express"',
                ruta: 'Lima Centro - Independencia',
                tiempo: '3 min caminando',
                tipo: 'Colectivo',
                imagen: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Bus 85 - Línea Roja',
                ruta: 'San Martín de Porres - Independencia',
                tiempo: '7 min caminando',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "Túpac Amaru"',
                ruta: 'Comas - Independencia',
                tiempo: '4 min caminando',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            }
        ],
        recomendaciones: [
            'Uno de los policlínicos más completos de la zona',
            'Cuenta con múltiples especialidades médicas',
            'Fácil acceso desde el Metropolitano',
            'Amplio estacionamiento disponible',
            'Cafetería y farmacia en el primer piso'
        ]
    },
    'Policlinico Pro Lima': {
        direccion: 'Av. Tomas Valle 1750, San Martín de Porres, Lima',
        telefono: '(01) 715-5800',
        distrito: 'San Martín de Porres',
        horarios: 'Lunes a Viernes: 7:00 AM - 7:00 PM<br>Sábados: 8:00 AM - 2:00 PM',
        lat: -12.0100,
        lng: -77.0630,
        transporte: 'Buses urbanos, combis de la Av. Tomas Valle',
        buses: [
            {
                nombre: 'Bus 56 - Av. Tomas Valle',
                ruta: 'Callao - San Martín de Porres',
                tiempo: 'Paradero frente al policlínico',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "Tomas Valle"',
                ruta: 'Callao - Pro Lima',
                tiempo: 'Paradero en la puerta',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Colectivo "Pro Lima Express"',
                ruta: 'Centro - San Martín de Porres',
                tiempo: '3 min caminando',
                tipo: 'Colectivo',
                imagen: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Bus 33 - Línea Verde SMP',
                ruta: 'Los Olivos - Callao',
                tiempo: '5 min caminando',
                tipo: 'Bus',
                imagen: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=300&h=200&fit=crop'
            },
            {
                nombre: 'Combi "Los Portales SMP"',
                ruta: 'Independencia - San Martín de Porres',
                tiempo: '6 min caminando',
                tipo: 'Combi',
                imagen: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop'
            }
        ],
        recomendaciones: [
            'Policlínico moderno con equipamiento actualizado',
            'Buena conectividad con transporte público',
            'Servicio de emergencias 24 horas',
            'Estacionamiento amplio y seguro',
            'Zona comercial cercana con bancos y farmacias'
        ]
    }
};

// Variables globales
let map = null;
let userLocation = null;
let hospitalMarker = null;
let userMarker = null;
let routeControl = null;
let selectedHospital = null;

// Elementos del DOM
const hospitalSelect = document.getElementById('hospital-select');
const locationStatus = document.getElementById('location-status');
const hospitalDetails = document.getElementById('hospital-details');
const actionButtons = document.getElementById('action-buttons');
const recommendations = document.getElementById('recommendations');
const generateRouteBtn = document.getElementById('generate-route-btn');
const showBusesBtn = document.getElementById('show-buses-btn');
const enableLocationBtn = document.getElementById('enable-location-btn');
const busesModal = document.getElementById('buses-modal');
const closeBusesModal = document.getElementById('close-buses-modal');
const busesContainer = document.getElementById('buses-container');
const mapLoading = document.getElementById('map-loading');
const mapDiv = document.getElementById('map');
const userMenuButton = document.getElementById('user-menu-button');
const userMenu = document.getElementById('user-menu');
const logoutLink = document.getElementById('logout');
const homeBtn = document.getElementById('home-btn');

// Personalizar iniciales del usuario
function personalizeScripts() {
    const workerName = localStorage.getItem('workerName') || 'Usuario';
    const initials = workerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-initials').textContent = initials;
}

// Inicializar mapa
function initializeMap() {
    try {
        console.log('Iniciando mapa...');
        
        // Verificar que Leaflet esté disponible
        if (typeof L === 'undefined') {
            throw new Error('Leaflet no está cargado');
        }
        
        // Crear el mapa
        map = L.map('map', {
            center: [-12.0464, -77.0428], // Lima como centro por defecto
            zoom: 11,
            zoomControl: true
        });
        
        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        console.log('Mapa creado correctamente');
        
        // Ocultar loading y mostrar mapa
        mapLoading.style.display = 'none';
        mapDiv.style.display = 'block';
        
        // Invalidar tamaño después de mostrar
        setTimeout(() => {
            map.invalidateSize();
        }, 250);

        // Solicitar ubicación del usuario
        requestUserLocation();
        
    } catch (error) {
        console.error('Error inicializando mapa:', error);
        mapLoading.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: red; margin-bottom: 10px;">⚠️ Error cargando el mapa</p>
                <p style="color: #666; font-size: 0.9rem;">${error.message}</p>
                <button onclick="initializeMap()" class="button" style="margin-top: 10px; width: auto; padding: 8px 16px;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// Cargar lista de hospitales
function loadHospitals() {
    Object.keys(hospitalData).forEach(hospital => {
        const option = document.createElement('option');
        option.value = hospital;
        option.textContent = hospital;
        hospitalSelect.appendChild(option);
    });
}

// Solicitar ubicación del usuario
function requestUserLocation() {
    if (navigator.geolocation) {
        locationStatus.style.display = 'block';
        locationStatus.className = 'location-status';
        locationStatus.innerHTML = '<div class="spinner"></div>Obteniendo su ubicación...';

        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                locationStatus.className = 'location-status location-granted';
                locationStatus.innerHTML = '✅ Ubicación obtenida correctamente';
                
                // Agregar marcador del usuario
                userMarker = L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup('📍 Su ubicación actual')
                    .openPopup();

                // Centrar mapa en la ubicación del usuario
                map.setView([userLocation.lat, userLocation.lng], 13);
            },
            function(error) {
                locationStatus.className = 'location-status location-denied';
                let message = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = '❌ Ubicación denegada por el usuario';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '❌ Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        message = '❌ Tiempo agotado obteniendo ubicación';
                        break;
                    default:
                        message = '❌ Error desconocido obteniendo ubicación';
                        break;
                }
                locationStatus.innerHTML = message;
                enableLocationBtn.style.display = 'block';
            }
        );
    } else {
        locationStatus.style.display = 'block';
        locationStatus.className = 'location-status location-denied';
        locationStatus.innerHTML = '❌ Geolocalización no soportada por este navegador';
    }
}

// Mostrar información del hospital seleccionado
function showHospitalInfo(hospitalName) {
    const hospital = hospitalData[hospitalName];
    selectedHospital = hospitalName;
    
    document.getElementById('hospital-name').textContent = hospitalName;
    document.getElementById('hospital-address').textContent = hospital.direccion;
    document.getElementById('hospital-phone').textContent = hospital.telefono;
    document.getElementById('hospital-district').textContent = hospital.distrito;
    document.getElementById('hospital-hours').innerHTML = hospital.horarios;
    document.getElementById('hospital-transport').textContent = hospital.transporte;
    
    hospitalDetails.style.display = 'block';
    actionButtons.style.display = 'block';
    
    // Mostrar recomendaciones
    showRecommendations(hospital.recomendaciones);
    
    // Agregar marcador del hospital al mapa
    if (hospitalMarker) {
        map.removeLayer(hospitalMarker);
    }
    
    hospitalMarker = L.marker([hospital.lat, hospital.lng])
        .addTo(map)
        .bindPopup(`🏥 ${hospitalName}<br>${hospital.direccion}`)
        .openPopup();
    
    // Centrar mapa en el hospital
    map.setView([hospital.lat, hospital.lng], 15);
    
    // Habilitar botón de ruta si hay ubicación del usuario
    if (userLocation) {
        generateRouteBtn.disabled = false;
    }
}

// Mostrar recomendaciones
function showRecommendations(recommendationsList) {
    const recommendationsListEl = document.getElementById('recommendations-list');
    recommendationsListEl.innerHTML = '';
    
    recommendationsList.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsListEl.appendChild(li);
    });
    
    recommendations.style.display = 'block';
}

// Generar ruta
function generateRoute() {
    if (!userLocation || !selectedHospital) {
        alert('Se necesita la ubicación del usuario y un hospital seleccionado');
        return;
    }

    if (!map) {
        alert('El mapa no está disponible');
        return;
    }

    const hospital = hospitalData[selectedHospital];
    
    try {
        // Remover ruta anterior si existe
        if (routeControl) {
            map.removeControl(routeControl);
        }

        // Verificar si Leaflet Routing Machine está disponible
        if (typeof L.Routing === 'undefined') {
            // Fallback: crear línea directa si no hay routing
            const routeLine = L.polyline([
                [userLocation.lat, userLocation.lng],
                [hospital.lat, hospital.lng]
            ], {
                color: '#0078D7',
                weight: 4,
                opacity: 0.7
            }).addTo(map);
            
            // Ajustar vista
            const group = new L.featureGroup([userMarker, hospitalMarker]);
            map.fitBounds(group.getBounds().pad(0.1));
            
            alert('Ruta básica generada. Para rutas detalladas, verifique su conexión a internet.');
            return;
        }

        // Crear nueva ruta con Leaflet Routing Machine
        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(hospital.lat, hospital.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: function() { return null; }, // No crear marcadores adicionales
            lineOptions: {
                styles: [{ color: '#0078D7', weight: 4, opacity: 0.7 }]
            },
            show: false, // Ocultar instrucciones por defecto
            collapsible: true
        }).addTo(map);

        // Ajustar vista para mostrar toda la ruta
        setTimeout(() => {
            const group = new L.featureGroup([userMarker, hospitalMarker]);
            map.fitBounds(group.getBounds().pad(0.1));
        }, 1000);
        
    } catch (error) {
        console.error('Error generando ruta:', error);
        alert('Error al generar la ruta. Intente nuevamente.');
    }
}

// Mostrar buses
function showBuses() {
    if (!selectedHospital) {
        alert('Primero selecciona un hospital');
        return;
    }

    const hospital = hospitalData[selectedHospital];
    busesContainer.innerHTML = '';

    // Agregar título con contador
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
        <p style="text-align: center; color: #666; margin-bottom: 20px;">
            <strong>${hospital.buses.length} opciones de transporte disponibles</strong>
        </p>
    `;
    busesContainer.appendChild(titleDiv);

    hospital.buses.forEach((bus, index) => {
        const busCard = document.createElement('div');
        busCard.className = 'bus-card';
        
        // Determinar clase de tipo
        let tipoClass = '';
        switch(bus.tipo.toLowerCase()) {
            case 'metro':
                tipoClass = 'metro';
                break;
            case 'combi':
                tipoClass = 'combi';
                break;
            case 'colectivo':
                tipoClass = 'colectivo';
                break;
            case 'brt':
                tipoClass = 'brt';
                break;
            default:
                tipoClass = '';
        }
        
        busCard.innerHTML = `
            <img src="${bus.imagen}" alt="${bus.nombre}" class="bus-image" onerror="this.src='https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop'">
            <div class="bus-info">
                <div class="bus-name">
                    ${bus.nombre}
                    <span class="bus-type ${tipoClass}">${bus.tipo}</span>
                </div>
                <div class="bus-route">🚏 Ruta: ${bus.ruta}</div>
                <div class="bus-time">⏱️ Tiempo: ${bus.tiempo}</div>
            </div>
        `;
        
        busesContainer.appendChild(busCard);
    });

    // Agregar información adicional
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
        <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #0078D7;">
            <h4 style="margin: 0 0 10px 0; color: #0078D7;">💡 Consejos de Transporte</h4>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
                <li>Verifique horarios de operación antes de viajar</li>
                <li>Mantenga su dinero en efectivo para el pasaje</li>
                <li>En horas punta, considere tiempo adicional de viaje</li>
                <li>Para el Metropolitano y Metro, puede usar tarjeta Lima Pass</li>
                <li>Pregunte al conductor si el vehículo pasa por el centro médico</li>
            </ul>
        </div>
    `;
    busesContainer.appendChild(infoDiv);

    busesModal.style.display = 'flex';
}

// Event Listeners
hospitalSelect.addEventListener('change', function() {
    const hospitalName = this.value;
    if (hospitalName) {
        showHospitalInfo(hospitalName);
    }
});

generateRouteBtn.addEventListener('click', generateRoute);
showBusesBtn.addEventListener('click', showBuses);

enableLocationBtn.addEventListener('click', function() {
    requestUserLocation();
    this.style.display = 'none';
});

closeBusesModal.addEventListener('click', function() {
    busesModal.style.display = 'none';
});

busesModal.addEventListener('click', function(e) {
    if (e.target === busesModal) {
        busesModal.style.display = 'none';
    }
});

// Menú de usuario
userMenuButton.addEventListener('click', function(e) {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

// Cerrar sesión
logoutLink.addEventListener('click', function(e) {
    e.preventDefault();
    const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
        localStorage.clear();
        alert("Sesión cerrada correctamente.");
        window.location.href = 'index.html';
    }
    userMenu.style.display = 'none';
});

// Cerrar menú de usuario al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!userMenu.contains(e.target) && e.target !== userMenuButton) {
        userMenu.style.display = 'none';
    }
});

// Botón Volver
homeBtn.addEventListener('click', function() {
    window.location.href = 'PrimerModulo.html';
});

// Manejar errores de imágenes de buses
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('bus-image')) {
        e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop';
    }
}, true);

// Precargar el hospital si viene de otra página
window.addEventListener('load', function() {
    // Asegurar que el mapa esté completamente inicializado
    if (!map) {
        setTimeout(() => {
            loadHospitalFromParams();
        }, 1000);
    } else {
        loadHospitalFromParams();
    }
});

function loadHospitalFromParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const hospital = urlParams.get('hospital');
    if (hospital && hospitalData[hospital]) {
        hospitalSelect.value = hospital;
        showHospitalInfo(hospital);
    }
}

// Función global para reintentar inicialización del mapa
window.initializeMap = initializeMap;