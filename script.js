// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Estado global de la aplicación
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidaysData = {};
let currentSection = 'dashboard';

// Elementos del DOM
const elements = {
    // Navegación
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),

    // Dashboard
    totalFeriados: document.getElementById('total-feriados'),
    proximosFeriados: document.getElementById('proximos-feriados'),
    anioActual: document.getElementById('anio-actual'),
    yearSelect: document.getElementById('year-select'),
    dateInput: document.getElementById('date-input'),
    searchBtn: document.getElementById('search-btn'),

    // Resultados
    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    resultsTitle: document.getElementById('results-title'),
    resultsContent: document.getElementById('results-content'),
    error: document.getElementById('error'),
    errorText: document.getElementById('error-text'),

    // Próximos feriados
    upcomingFeriados: document.getElementById('upcoming-feriados'),

    // Calendario
    currentMonthDisplay: document.getElementById('current-month'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    calendarGrid: document.getElementById('calendar-grid'),

    // Admin
    addHolidayForm: document.getElementById('add-holiday-form'),
    deleteHolidayForm: document.getElementById('delete-holiday-form'),
    adminMessage: document.getElementById('admin-message'),

    // Toast
    toastContainer: document.getElementById('toast-container')
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
});

// Inicializar la aplicación
async function initializeApp() {
    try {
        // Cargar datos iniciales
        await loadAllHolidays();
        await loadUpcomingHolidays();

        // Actualizar estadísticas
        updateStats();

        // Configurar años disponibles
        setupYearSelect();

        // Configurar calendario
        setupCalendar();

        showToast('Aplicación cargada correctamente', 'success');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showToast('Error al cargar los datos', 'error');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });

    // Búsqueda
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.yearSelect.addEventListener('change', handleYearSelect);
    elements.dateInput.addEventListener('change', handleDateInput);

    // Calendario
    elements.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    elements.nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Admin forms
    elements.addHolidayForm.addEventListener('submit', handleAddHoliday);
    elements.deleteHolidayForm.addEventListener('submit', handleDeleteHoliday);
}

// Navegación entre secciones
function switchSection(sectionName) {
    // Actualizar botones de navegación
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });

    // Mostrar sección correspondiente
    elements.sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionName);
    });

    currentSection = sectionName;

    // Cargar datos específicos de la sección
    if (sectionName === 'calendar') {
        renderCalendar();
    }
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error en API request ${endpoint}:`, error);
        throw error;
    }
}

// Cargar todos los feriados
async function loadAllHolidays() {
    try {
        holidaysData = await apiRequest('/feriados/all');
        return holidaysData;
    } catch (error) {
        throw new Error('Error al cargar los feriados');
    }
}

// Cargar próximos feriados
async function loadUpcomingHolidays() {
    try {
        const upcoming = await apiRequest('/feriados/proximos?cantidad=5');
        renderUpcomingHolidays(upcoming);
        return upcoming;
    } catch (error) {
        throw new Error('Error al cargar próximos feriados');
    }
}

// Buscar feriados por año
async function searchHolidaysByYear(year) {
    try {
        const data = await apiRequest(`/feriados/${year}`);
        return data;
    } catch (error) {
        throw new Error(`Error al buscar feriados del año ${year}`);
    }
}

// Consultar fecha específica
async function checkDate(date) {
    try {
        const data = await apiRequest(`/feriados/consultar/${date}`);
        return data;
    } catch (error) {
        throw new Error(`Error al consultar la fecha ${date}`);
    }
}

// Agregar feriado
async function addHoliday(year, date, name, apiKey) {
    try {
        const params = new URLSearchParams({
            anio: year,
            fecha: date,
            nombre: name
        });

        const data = await apiRequest(`/feriados/agregar/?${params}`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey
            }
        });

        // Recargar datos
        await loadAllHolidays();
        await loadUpcomingHolidays();
        updateStats();

        return data;
    } catch (error) {
        throw new Error('Error al agregar el feriado');
    }
}

// Eliminar feriado
async function deleteHoliday(year, date, apiKey) {
    try {
        const params = new URLSearchParams({
            anio: year,
            fecha: date
        });

        const data = await apiRequest(`/feriados/eliminar/?${params}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': apiKey
            }
        });

        // Recargar datos
        await loadAllHolidays();
        await loadUpcomingHolidays();
        updateStats();

        return data;
    } catch (error) {
        throw new Error('Error al eliminar el feriado');
    }
}

// UI Functions
function updateStats() {
    // Total de feriados
    const totalHolidays = Object.values(holidaysData).reduce((total, yearHolidays) => {
        return total + yearHolidays.length;
    }, 0);
    elements.totalFeriados.textContent = totalHolidays;

    // Año actual
    elements.anioActual.textContent = currentYear;

    // Próximos feriados (se actualiza en loadUpcomingHolidays)
}

function setupYearSelect() {
    const years = Object.keys(holidaysData).sort((a, b) => b - a);
    elements.yearSelect.innerHTML = '<option value="">Seleccionar año</option>';

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        elements.yearSelect.appendChild(option);
    });
}

function renderUpcomingHolidays(upcoming) {
    elements.upcomingFeriados.innerHTML = '';
    elements.proximosFeriados.textContent = upcoming.length;

    if (upcoming.length === 0) {
        elements.upcomingFeriados.innerHTML = '<p style="color: white; text-align: center;">No hay próximos feriados</p>';
        return;
    }

    upcoming.forEach(holiday => {
        const card = document.createElement('div');
        card.className = 'upcoming-card';

        const daysText = holiday.dias_restantes === 0 ? 'Hoy' :
            holiday.dias_restantes === 1 ? 'Mañana' :
                `${holiday.dias_restantes} días`;

        card.innerHTML = `
            <h4>${holiday.nombre}</h4>
            <div class="date">${formatDate(holiday.fecha)}</div>
            <div class="days-left">${daysText}</div>
        `;

        elements.upcomingFeriados.appendChild(card);
    });
}

function renderResults(data, title) {
    elements.resultsTitle.textContent = title;
    elements.resultsContent.innerHTML = '';

    if (Array.isArray(data)) {
        // Lista de feriados
        data.forEach(holiday => {
            const card = document.createElement('div');
            card.className = 'holiday-card';
            card.innerHTML = `
                <h4>${holiday.nombre}</h4>
                <p>Fecha: ${formatDate(holiday.fecha)}</p>
            `;
            elements.resultsContent.appendChild(card);
        });
    } else if (data.feriados) {
        // Feriados por año
        data.feriados.forEach(holiday => {
            const card = document.createElement('div');
            card.className = 'holiday-card';
            card.innerHTML = `
                <h4>${holiday.nombre}</h4>
                <p>Fecha: ${formatDate(holiday.fecha)}</p>
            `;
            elements.resultsContent.appendChild(card);
        });
    } else if (data.es_feriado !== undefined) {
        // Consulta de fecha específica
        const card = document.createElement('div');
        card.className = 'holiday-card';
        card.innerHTML = `
            <h4>${data.es_feriado ? 'Es feriado' : 'No es feriado'}</h4>
            <p>Fecha: ${formatDate(data.fecha)}</p>
            ${data.nombre ? `<p>Nombre: ${data.nombre}</p>` : ''}
        `;
        elements.resultsContent.appendChild(card);
    }

    showElement(elements.results);
    hideElement(elements.error);
}

function showError(message) {
    elements.errorText.textContent = message;
    showElement(elements.error);
    hideElement(elements.results);
}

function showLoading() {
    showElement(elements.loading);
    hideElement(elements.results);
    hideElement(elements.error);
}

function hideLoading() {
    hideElement(elements.loading);
}

// Event Handlers
async function handleSearch() {
    const year = elements.yearSelect.value;
    const date = elements.dateInput.value;

    if (!year && !date) {
        showToast('Selecciona un año o una fecha', 'error');
        return;
    }

    showLoading();

    try {
        if (year) {
            const data = await searchHolidaysByYear(year);
            renderResults(data, `Feriados del año ${year}`);
        } else if (date) {
            const data = await checkDate(date);
            renderResults(data, `Consulta de fecha ${formatDate(date)}`);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function handleYearSelect() {
    const year = elements.yearSelect.value;
    if (year) {
        elements.dateInput.value = '';
    }
}

function handleDateInput() {
    const date = elements.dateInput.value;
    if (date) {
        elements.yearSelect.value = '';
    }
}

async function handleAddHoliday(event) {
    event.preventDefault();

    const year = document.getElementById('add-year').value;
    const date = document.getElementById('add-date').value;
    const name = document.getElementById('add-name').value;
    const apiKey = document.getElementById('api-key').value;

    // Validar que todos los campos estén completos
    if (!year || !date || !name || !apiKey) {
        showAdminMessage('Todos los campos son obligatorios', 'error');
        showToast('Completa todos los campos', 'error');
        return;
    }

    try {
        await addHoliday(year, date, name, apiKey);
        showAdminMessage('Feriado agregado correctamente', 'success');
        event.target.reset();
        showToast('Feriado agregado exitosamente', 'success');
    } catch (error) {
        showAdminMessage(error.message, 'error');
        showToast('Error al agregar feriado', 'error');
    }
}

async function handleDeleteHoliday(event) {
    event.preventDefault();

    const year = document.getElementById('delete-year').value;
    const date = document.getElementById('delete-date').value;
    const apiKey = document.getElementById('delete-api-key').value;

    // Validar que todos los campos estén completos
    if (!year || !date || !apiKey) {
        showAdminMessage('Todos los campos son obligatorios', 'error');
        showToast('Completa todos los campos', 'error');
        return;
    }

    try {
        await deleteHoliday(year, date, apiKey);
        showAdminMessage('Feriado eliminado correctamente', 'success');
        event.target.reset();
        showToast('Feriado eliminado exitosamente', 'success');
    } catch (error) {
        showAdminMessage(error.message, 'error');
        showToast('Error al eliminar feriado', 'error');
    }
}

// Calendar Functions
function setupCalendar() {
    renderCalendar();
}

function changeMonth(delta) {
    currentMonth += delta;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    renderCalendar();
}

function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    elements.currentMonthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    elements.calendarGrid.innerHTML = '';

    const today = new Date();
    const currentYearStr = currentYear.toString();
    const holidays = holidaysData[currentYearStr] || [];

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();

        // Marcar días de otros meses
        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }

        // Marcar día actual
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Marcar feriados
        const dateStr = date.toISOString().split('T')[0];
        const holiday = holidays.find(h => h.fecha === dateStr);
        if (holiday) {
            dayElement.classList.add('holiday');
            dayElement.title = holiday.nombre;

            // Agregar el nombre del feriado como tooltip más visible
            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday.nombre;
            dayElement.appendChild(holidayName);

            // Agregar evento de clic para mostrar más detalles
            dayElement.addEventListener('click', () => {
                showHolidayDetails(holiday);
            });
        }

        elements.calendarGrid.appendChild(dayElement);
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getMonthName(month) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
}

function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showAdminMessage(message, type) {
    elements.adminMessage.textContent = message;
    elements.adminMessage.className = `admin-message ${type}`;
    showElement(elements.adminMessage);
    
    setTimeout(() => {
        hideElement(elements.adminMessage);
    }, 5000);
}

// Función para mostrar detalles del feriado
function showHolidayDetails(holiday) {
    const modal = document.createElement('div');
    modal.className = 'holiday-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Feriado</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="holiday-detail">
                    <strong>Nombre:</strong> ${holiday.nombre}
                </div>
                <div class="holiday-detail">
                    <strong>Fecha:</strong> ${formatDate(holiday.fecha)}
                </div>
                <div class="holiday-detail">
                    <strong>Año:</strong> ${new Date(holiday.fecha).getFullYear()}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic en el botón X o fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', function closeModal(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    });
} 