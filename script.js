const API_BASE_URL = (() => {
    const hostname = location.hostname;
    const protocol = location.protocol;
    const port = location.port;
    
    // Desarrollo local directo a la API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Si estamos en puerto 3000 (frontend), usar proxy
        if (port === '3000') {
            return `${protocol}//${hostname}:${port}/api`;
        }
        // Si estamos en otro puerto, acceso directo a API
        return 'http://127.0.0.1:8000';
    }
    
    // Producción - usar proxy reverso para ambas URLs
    // Tanto para feriadosbursatiles.ddns.net como para 50.18.187.142
    return `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
})();

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidaysData = {};
let currentSection = 'dashboard';

const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),

    totalFeriados: document.getElementById('total-feriados'),
    proximosFeriados: document.getElementById('proximos-feriados'),
    anioActual: document.getElementById('anio-actual'),
    yearSelect: document.getElementById('year-select'),
    dateInput: document.getElementById('date-input'),
    searchBtn: document.getElementById('search-btn'),

    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    resultsTitle: document.getElementById('results-title'),
    resultsContent: document.getElementById('results-content'),
    error: document.getElementById('error'),
    errorText: document.getElementById('error-text'),

    upcomingFeriados: document.getElementById('upcoming-feriados'),

    currentMonthDisplay: document.getElementById('current-month'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    calendarGrid: document.getElementById('calendar-grid'),

    addHolidayForm: document.getElementById('add-holiday-form'),
    deleteHolidayForm: document.getElementById('delete-holiday-form'),
    adminMessage: document.getElementById('admin-message'),

    toastContainer: document.getElementById('toast-container'),

    swaggerLink: document.getElementById('swagger-link'),
    apiBaseUrlDisplay: document.getElementById('api-base-url-display')
};

document.addEventListener('DOMContentLoaded', function () {
    if (elements.swaggerLink) {
        const swaggerUrl = API_BASE_URL.replace(/\/$/, '') + '/docs';
        elements.swaggerLink.href = swaggerUrl;
    }
    if (elements.apiBaseUrlDisplay) {
        elements.apiBaseUrlDisplay.textContent = API_BASE_URL;
    }
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        await loadAllHolidays();
        await loadUpcomingHolidays();

        updateStats();

        setupYearSelect();

        setupCalendar();

        showToast('Aplicación cargada correctamente', 'success');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showToast('Error al cargar los datos', 'error');
    }
}

function setupEventListeners() {
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });

    elements.searchBtn.addEventListener('click', handleSearch);
    elements.yearSelect.addEventListener('change', handleYearSelect);
    elements.dateInput.addEventListener('change', handleDateInput);

    elements.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    elements.nextMonthBtn.addEventListener('click', () => changeMonth(1));

    elements.addHolidayForm.addEventListener('submit', handleAddHoliday);
    elements.deleteHolidayForm.addEventListener('submit', handleDeleteHoliday);
}

function switchSection(sectionName) {
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });

    elements.sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionName);
    });

    currentSection = sectionName;

    if (sectionName === 'calendar') {
        renderCalendar();
    }
}

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

async function loadAllHolidays() {
    try {
        holidaysData = await apiRequest('/feriados/all');
        return holidaysData;
    } catch (error) {
        throw new Error('Error al cargar los feriados');
    }
}

async function loadUpcomingHolidays() {
    try {
        const upcoming = await apiRequest('/feriados/proximos?cantidad=5');
        renderUpcomingHolidays(upcoming);
        return upcoming;
    } catch (error) {
        throw new Error('Error al cargar próximos feriados');
    }
}

async function searchHolidaysByYear(year) {
    try {
        const data = await apiRequest(`/feriados/${year}`);
        return data;
    } catch (error) {
        throw new Error(`Error al buscar feriados del año ${year}`);
    }
}

async function checkDate(date) {
    try {
        const data = await apiRequest(`/feriados/consultar/${date}`);
        return data;
    } catch (error) {
        throw new Error(`Error al consultar la fecha ${date}`);
    }
}

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

        await loadAllHolidays();
        await loadUpcomingHolidays();
        updateStats();

        return data;
    } catch (error) {
        throw new Error('Error al agregar el feriado');
    }
}

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

        await loadAllHolidays();
        await loadUpcomingHolidays();
        updateStats();

        return data;
    } catch (error) {
        throw new Error('Error al eliminar el feriado');
    }
}

function updateStats() {
    const totalHolidays = Object.values(holidaysData).reduce((total, yearHolidays) => {
        return total + yearHolidays.length;
    }, 0);
    elements.totalFeriados.textContent = totalHolidays;

    elements.anioActual.textContent = currentYear;

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

        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }

        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        const dateStr = date.toISOString().split('T')[0];
        const holiday = holidays.find(h => h.fecha === dateStr);
        if (holiday) {
            dayElement.classList.add('holiday');
            dayElement.title = holiday.nombre;

            const holidayName = document.createElement('div');
            holidayName.className = 'holiday-name';
            holidayName.textContent = holiday.nombre;
            dayElement.appendChild(holidayName);

            dayElement.addEventListener('click', () => {
                showHolidayDetails(holiday);
            });
        }

        elements.calendarGrid.appendChild(dayElement);
    }
}

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

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });

    document.addEventListener('keydown', function closeModal(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    });
}