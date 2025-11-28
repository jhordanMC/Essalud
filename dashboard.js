let charts = {};

const datosBase = {
    especialidades: [
        { nombre: 'Gastroenterología', cantidad: 950 },
        { nombre: 'Psiquiatría', cantidad: 920 },
        { nombre: 'Cardiología', cantidad: 890 },
        { nombre: 'Ginecología', cantidad: 860 },
        { nombre: 'Traumatología', cantidad: 840 },
        { nombre: 'Pediatría', cantidad: 810 },
        { nombre: 'Neurología', cantidad: 780 },
        { nombre: 'Nefrología', cantidad: 750 },
        { nombre: 'Rehabilitación', cantidad: 720 },
        { nombre: 'Otorrinolaringología', cantidad: 690 },
        { nombre: 'Endocrinología', cantidad: 660 },
        { nombre: 'Medicina General', cantidad: 640 },
        { nombre: 'Dermatología', cantidad: 610 },
        { nombre: 'Oftalmología', cantidad: 580 },
        { nombre: 'Oncología', cantidad: 550 }
    ],
    evolucion: [
        { mes: 'Diciembre', cantidad: 4400 },
        { mes: 'Enero', cantidad: 4300 },
        { mes: 'Febrero', cantidad: 4200 },
        { mes: 'Marzo', cantidad: 4250 },
        { mes: 'Abril', cantidad: 4100 },
        { mes: 'Mayo', cantidad: 4050 },
        { mes: 'Junio', cantidad: 4000 },
        { mes: 'Julio', cantidad: 3950 },
        { mes: 'Agosto', cantidad: 3900 },
        { mes: 'Septiembre', cantidad: 3850 },
        { mes: 'Octubre', cantidad: 3800 },
        { mes: 'Noviembre', cantidad: 3850 }
    ],
    estados: {
        pendiente: 4000,
        confirmada: 5000,
        atendida: 3000
    },
    centrosSalud: [
        { nombre: 'Policlínico Los Olivos', cantidad: 3200 },
        { nombre: 'UBAP Villa Sol', cantidad: 2800 },
        { nombre: 'Policlínico El Trébol', cantidad: 3500 },
        { nombre: 'Policlínico Pro Lima', cantidad: 2500 }
    ]
};

// Configuración global de Chart.js
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.color = '#2c3e50';

function inicializarCharts() {
    crearChartEspecialidades();
    crearChartEvolucion();
    crearChartEstados();
    crearChartCentros();
}

function crearChartEspecialidades() {
    const ctx = document.getElementById('chartEspecialidades');
    
    if (charts.especialidades) {
        charts.especialidades.destroy();
    }

    charts.especialidades = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datosBase.especialidades.map(e => e.nombre),
            datasets: [{
                label: 'Cantidad de Citas',
                data: datosBase.especialidades.map(e => e.cantidad),
                backgroundColor: 'rgba(0, 120, 215, 0.8)',
                borderColor: 'rgba(0, 120, 215, 1)',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(0, 94, 166, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 120, 215, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 120, 215, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        font: {
                            size: 11,
                            weight: '500'
                        }
                    }
                }
            }
        }
    });
}

function crearChartEvolucion() {
    const ctx = document.getElementById('chartEvolucion');
    
    if (charts.evolucion) {
        charts.evolucion.destroy();
    }

    charts.evolucion = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datosBase.evolucion.map(e => e.mes),
            datasets: [{
                label: 'Citas por Mes',
                data: datosBase.evolucion.map(e => e.cantidad),
                borderColor: 'rgba(0, 120, 215, 1)',
                backgroundColor: 'rgba(0, 120, 215, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(0, 120, 215, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: 'rgba(0, 94, 166, 1)',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 120, 215, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 120, 215, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 120, 215, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function crearChartEstados() {
    const ctx = document.getElementById('chartEstados');
    
    if (charts.estados) {
        charts.estados.destroy();
    }

    const total = datosBase.estados.pendiente + datosBase.estados.confirmada + datosBase.estados.atendida;

    charts.estados = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendiente', 'Confirmada', 'Atendida'],
            datasets: [{
                data: [datosBase.estados.pendiente, datosBase.estados.confirmada, datosBase.estados.atendida],
                backgroundColor: [
                    'rgba(255, 167, 38, 0.85)',
                    'rgba(38, 198, 218, 0.85)',
                    'rgba(66, 165, 245, 0.85)'
                ],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 120, 215, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed;
                            const porcentaje = ((valor / total) * 100).toFixed(2);
                            return context.label + ': ' + valor.toLocaleString() + ' (' + porcentaje + '%)';
                        }
                    }
                }
            }
        }
    });
}

function crearChartCentros() {
    const ctx = document.getElementById('chartCentros');
    
    if (charts.centros) {
        charts.centros.destroy();
    }

    charts.centros = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datosBase.centrosSalud.map(c => c.nombre),
            datasets: [{
                label: 'Citas por Centro',
                data: datosBase.centrosSalud.map(c => c.cantidad),
                backgroundColor: [
                    'rgba(0, 120, 215, 0.8)',
                    'rgba(38, 198, 218, 0.8)',
                    'rgba(66, 165, 245, 0.8)',
                    'rgba(255, 167, 38, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 120, 215, 1)',
                    'rgba(38, 198, 218, 1)',
                    'rgba(66, 165, 245, 1)',
                    'rgba(255, 167, 38, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 120, 215, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        font: {
                            size: 11,
                            weight: '500'
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 120, 215, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function aplicarFiltros() {
    const genero = document.getElementById('filtroGenero').value;
    const anio = document.getElementById('filtroAnio').value;
    const mes = document.getElementById('filtroMes').value;
    const centro = document.getElementById('filtroCentro').value;

    const loadingSpinner = document.getElementById('loadingSpinner');
    const dashboardContent = document.getElementById('dashboardContent');

    loadingSpinner.classList.add('active');
    dashboardContent.style.opacity = '0.3';
    dashboardContent.style.pointerEvents = 'none';

    setTimeout(() => {
        const factorAleatorio = 0.7 + Math.random() * 0.6;
        
        const totalCitas = Math.floor(1096 * factorAleatorio);
        const porcentajeAsistencia = (21.92 + (Math.random() * 10 - 5)).toFixed(2);
        const porcentajePrimeras = (49.92 + (Math.random() * 10 - 5)).toFixed(2);

        document.getElementById('totalCitas').textContent = totalCitas.toLocaleString();
        document.getElementById('porcentajeAsistencia').textContent = porcentajeAsistencia + '%';
        document.getElementById('porcentajePrimeras').textContent = porcentajePrimeras + '%';

        datosBase.especialidades = datosBase.especialidades.map(e => ({
            nombre: e.nombre,
            cantidad: Math.floor(e.cantidad * (0.8 + Math.random() * 0.4))
        }));

        datosBase.evolucion = datosBase.evolucion.map(e => ({
            mes: e.mes,
            cantidad: Math.floor(e.cantidad * (0.85 + Math.random() * 0.3))
        }));

        const totalEstados = totalCitas * 10;
        datosBase.estados = {
            pendiente: Math.floor(totalEstados * 0.35),
            confirmada: Math.floor(totalEstados * 0.42),
            atendida: Math.floor(totalEstados * 0.23)
        };

        datosBase.centrosSalud = datosBase.centrosSalud.map(c => ({
            nombre: c.nombre,
            cantidad: Math.floor(c.cantidad * (0.85 + Math.random() * 0.3))
        }));

        inicializarCharts();

        loadingSpinner.classList.remove('active');
        dashboardContent.style.opacity = '1';
        dashboardContent.style.pointerEvents = 'auto';
    }, 800);

    console.log('Filtros aplicados:', { genero, anio, mes, centro });
}

function limpiarFiltros() {
    document.getElementById('filtroGenero').value = 'Todos';
    document.getElementById('filtroAnio').value = '2024';
    document.getElementById('filtroMes').value = 'Noviembre';
    document.getElementById('filtroCentro').value = 'Todos';

    datosBase.especialidades = [
        { nombre: 'Gastroenterología', cantidad: 950 },
        { nombre: 'Psiquiatría', cantidad: 920 },
        { nombre: 'Cardiología', cantidad: 890 },
        { nombre: 'Ginecología', cantidad: 860 },
        { nombre: 'Traumatología', cantidad: 840 },
        { nombre: 'Pediatría', cantidad: 810 },
        { nombre: 'Neurología', cantidad: 780 },
        { nombre: 'Nefrología', cantidad: 750 },
        { nombre: 'Rehabilitación', cantidad: 720 },
        { nombre: 'Otorrinolaringología', cantidad: 690 },
        { nombre: 'Endocrinología', cantidad: 660 },
        { nombre: 'Medicina General', cantidad: 640 },
        { nombre: 'Dermatología', cantidad: 610 },
        { nombre: 'Oftalmología', cantidad: 580 },
        { nombre: 'Oncología', cantidad: 550 }
    ];

    datosBase.evolucion = [
        { mes: 'Diciembre', cantidad: 4400 },
        { mes: 'Enero', cantidad: 4300 },
        { mes: 'Febrero', cantidad: 4200 },
        { mes: 'Marzo', cantidad: 4250 },
        { mes: 'Abril', cantidad: 4100 },
        { mes: 'Mayo', cantidad: 4050 },
        { mes: 'Junio', cantidad: 4000 },
        { mes: 'Julio', cantidad: 3950 },
        { mes: 'Agosto', cantidad: 3900 },
        { mes: 'Septiembre', cantidad: 3850 },
        { mes: 'Octubre', cantidad: 3800 },
        { mes: 'Noviembre', cantidad: 3850 }
    ];

    datosBase.estados = {
        pendiente: 4000,
        confirmada: 5000,
        atendida: 3000
    };

    datosBase.centrosSalud = [
        { nombre: 'Policlínico Los Olivos', cantidad: 3200 },
        { nombre: 'UBAP Villa Sol', cantidad: 2800 },
        { nombre: 'Policlínico El Trébol', cantidad: 3500 },
        { nombre: 'Policlínico Pro Lima', cantidad: 2500 }
    ];

    document.getElementById('totalCitas').textContent = '1096';
    document.getElementById('porcentajeAsistencia').textContent = '21.92%';
    document.getElementById('porcentajePrimeras').textContent = '49.92%';

    inicializarCharts();
}

// Inicialización al cargar la página
window.addEventListener('load', function() {
    inicializarCharts();
    
    // Animación de entrada para los elementos
    const elementos = document.querySelectorAll('.kpi-card, .chart-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    elementos.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Redimensionamiento responsive de charts
window.addEventListener('resize', function() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.resize();
    });
});