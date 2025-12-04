/* ============================================
   JLabEco - JavaScript v2.0
   Calculadora de Huella de Carbono Tecnológica
   ============================================ */

// ==================== STORAGE & CONFIG ====================
const STORAGE_KEY = 'jlabeco_devices';
const HISTORY_KEY = 'jlabeco_history';
const GOALS_KEY = 'jlabeco_goals';
const ACHIEVEMENTS_KEY = 'jlabeco_achievements';
const ECO_POINTS_KEY = 'jlabeco_points';
const REGION_KEY = 'jlabeco_region';

// Carbon Intensity by Country (kg CO2 per kWh)
const CARBON_INTENSITY_BY_COUNTRY = {
    'ES': 0.45,  // España
    'FR': 0.09,  // Francia (nuclear)
    'DE': 0.38,  // Alemania
    'GB': 0.28,  // Reino Unido
    'IT': 0.42,  // Italia
    'PT': 0.35,  // Portugal
    'NL': 0.40,  // Países Bajos
    'BE': 0.20,  // Bélgica
    'SE': 0.01,  // Suecia (hidroeléctrica)
    'NO': 0.02,  // Noruega (hidroeléctrica)
    'DK': 0.15,  // Dinamarca (eólica)
    'PL': 0.78,  // Polonia (carbón)
    'US': 0.42,  // Estados Unidos
    'MX': 0.48,  // México
    'AR': 0.39,  // Argentina
    'CL': 0.42,  // Chile
    'CO': 0.22,  // Colombia (hidroeléctrica)
    'BR': 0.12,  // Brasil (hidroeléctrica)
    'CN': 0.64,  // China (carbón)
    'IN': 0.71,  // India (carbón)
    'JP': 0.50,  // Japón
    'KR': 0.47,  // Corea del Sur
    'AU': 0.73,  // Australia (carbón)
    'NZ': 0.15,  // Nueva Zelanda (renovables)
    'ZA': 0.95,  // Sudáfrica (carbón)
    'DEFAULT': 0.45  // Valor por defecto
};

let CO2_PER_KWH = 0.45; // kg CO2 por kWh (será actualizado por región)
let userCountry = 'ES';
let userRegionName = 'España';

const KM_PER_KG_CO2 = 4.5; // km en coche por kg CO2
const TREES_PER_TON_CO2 = 40; // árboles para absorber 1 ton CO2/año
const FLIGHT_BCN_MAD_CO2 = 77; // kg CO2 vuelo Barcelona-Madrid

// Default devices
const defaultDevices = [
    { type: 'Servidor', brand: 'Dell', model: 'PowerEdge R740', watts: 350, hours: 720, materialCo2: 500, lifespan: 5, location: 'Datacenter', dateAdded: new Date().toISOString() },
    { type: 'Switch', brand: 'HP', model: 'ProCurve 2910', watts: 30, hours: 720, materialCo2: 45, lifespan: 5, location: 'Rack 1', dateAdded: new Date().toISOString() },
    { type: 'Router', brand: 'Cisco', model: 'RV340', watts: 25, hours: 720, materialCo2: 38, lifespan: 5, location: 'Rack 1', dateAdded: new Date().toISOString() }
];

// Material CO2 typical values (kg CO2e)
const TYPICAL_MATERIALS = {
    'Laptop': 270,
    'Desktop': 350,
    'Servidor': 500,
    'Router': 38,
    'Switch': 45,
    'Monitor': 240,
    'Impresora': 120,
    'Smartphone': 70,
    'Tablet': 90,
    'Otro': 100
};

// ==================== STATE ====================
let devices = [];
let currentFilter = 'all';
let currentSort = 'recent';
let charts = {};
let ecoPoints = 0;
let userGoal = null;
let achievements = initAchievements();

// ==================== DOM ELEMENTS ====================
const elements = {
    // Forms
    form: document.getElementById('quick-add-form'),
    deviceType: document.getElementById('device-type'),
    deviceBrand: document.getElementById('device-brand'),
    deviceModel: document.getElementById('device-model'),
    deviceWatts: document.getElementById('device-watts'),
    deviceHours: document.getElementById('device-hours'),
    deviceMaterialCo2: document.getElementById('device-material-co2'),
    deviceLifespan: document.getElementById('device-lifespan'),
    deviceLocation: document.getElementById('device-location'),
    
    // Stats
    statConsumption: document.getElementById('stat-consumption'),
    statCo2: document.getElementById('stat-co2'),
    statMaterials: document.getElementById('stat-materials'),
    totalFootprint: document.getElementById('total-footprint'),
    totalYearly: document.getElementById('total-yearly'),
    co2Equivalence: document.getElementById('co2-equivalence'),
    
    // Tables & Lists
    tableBody: document.getElementById('devices-table-body'),
    deviceCount: document.getElementById('device-count'),
    emptyDevices: document.getElementById('empty-devices'),
    
    // Filters
    filterType: document.getElementById('filter-type'),
    sortBy: document.getElementById('sort-by'),
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Export/Import
    exportDropdownBtn: document.getElementById('export-dropdown-btn'),
    exportMenu: document.getElementById('export-menu'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    importBtn: document.getElementById('import-btn'),
    importFile: document.getElementById('import-file'),
    
    // Recommendations
    recommendationsList: document.getElementById('recommendations-list'),
    recCount: document.getElementById('rec-count'),
    
    // Goals
    setGoalBtn: document.getElementById('set-goal-btn'),
    goalModal: document.getElementById('goal-modal'),
    goalModalClose: document.getElementById('goal-modal-close'),
    goalCancel: document.getElementById('goal-cancel'),
    goalSave: document.getElementById('goal-save'),
    goalValue: document.getElementById('goal-value'),
    goalDeadline: document.getElementById('goal-deadline'),
    goalProgressFill: document.getElementById('goal-progress-fill'),
    goalCurrent: document.getElementById('goal-current'),
    goalTarget: document.getElementById('goal-target'),
    goalMessage: document.getElementById('goal-message'),
    currentFootprintHint: document.getElementById('current-footprint-hint'),
    
    // Region
    regionBtn: document.getElementById('region-btn'),
    regionModal: document.getElementById('region-modal'),
    regionModalClose: document.getElementById('region-modal-close'),
    regionCancel: document.getElementById('region-cancel'),
    regionSave: document.getElementById('region-save'),
    regionSelect: document.getElementById('region-select'),
    regionFlag: document.getElementById('region-flag'),
    regionName: document.getElementById('region-name'),
    scaleMarker: document.getElementById('scale-marker'),
    intensityInfo: document.getElementById('intensity-info'),
    
    // Simulator
    simHoursReduction: document.getElementById('sim-hours-reduction'),
    simHoursValue: document.getElementById('sim-hours-value'),
    simEfficiency: document.getElementById('sim-efficiency'),
    simEfficiencyValue: document.getElementById('sim-efficiency-value'),
    simDevicesOff: document.getElementById('sim-devices-off'),
    simDevicesOffValue: document.getElementById('sim-devices-off-value'),
    
    // Achievements
    achievementsGrid: document.getElementById('achievements-grid'),
    challengesGrid: document.getElementById('challenges-grid'),
    ecoPoints: document.getElementById('eco-points'),
    mobileEcoPoints: document.getElementById('mobile-eco-points'),
    totalEcoPoints: document.getElementById('total-eco-points'),
    userLevel: document.getElementById('user-level'),
    levelTitle: document.getElementById('level-title'),
    levelFill: document.getElementById('level-fill'),
    levelNext: document.getElementById('level-next'),
    
    // Mobile
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    
    // Toast
    toastContainer: document.getElementById('toast-container')
};

// ==================== INITIALIZATION ====================
function init() {
    detectAndLoadRegion();
    loadFromStorage();
    setupEventListeners();
    renderDevices();
    calculateStats();
    updateGoalDisplay();
    updateAchievementsDisplay();
    updateSimulator();
    
    // Load eco points
    ecoPoints = parseInt(localStorage.getItem(ECO_POINTS_KEY) || '0');
    updateEcoPointsDisplay();
    
    // Inicializar notificaciones
    updateNotificationUI();
    
    // Notificación de bienvenida si es primera vez
    const isFirstVisit = !localStorage.getItem('jlabeco_visited');
    if (isFirstVisit) {
        localStorage.setItem('jlabeco_visited', 'true');
        setTimeout(() => {
            addNotification('info', '🌿 Bienvenido a JLabEco', 
                'Empieza agregando tus dispositivos en la sección Dispositivos');
        }, 1000);
    }
}

function setupEventListeners() {
    // Form submission
    elements.form?.addEventListener('submit', handleFormSubmit);
    
    // Navigation
    elements.navItems.forEach(nav => {
        nav.addEventListener('click', () => switchTab(nav.dataset.tab));
    });
    
    // Filters
    elements.filterType?.addEventListener('change', handleFilterChange);
    elements.sortBy?.addEventListener('change', handleSortChange);
    
    // Export/Import
    elements.exportDropdownBtn?.addEventListener('click', toggleExportMenu);
    elements.exportJsonBtn?.addEventListener('click', () => exportData('json'));
    elements.exportCsvBtn?.addEventListener('click', () => exportData('csv'));
    elements.exportPdfBtn?.addEventListener('click', () => exportData('pdf'));
    elements.importBtn?.addEventListener('click', () => elements.importFile.click());
    elements.importFile?.addEventListener('change', importData);
    
    // Goals
    elements.setGoalBtn?.addEventListener('click', openGoalModal);
    elements.goalModalClose?.addEventListener('click', closeGoalModal);
    elements.goalCancel?.addEventListener('click', closeGoalModal);
    elements.goalSave?.addEventListener('click', saveGoal);
    
    // Region
    elements.regionBtn?.addEventListener('click', openRegionModal);
    elements.regionModalClose?.addEventListener('click', closeRegionModal);
    elements.regionCancel?.addEventListener('click', closeRegionModal);
    elements.regionSave?.addEventListener('click', saveRegion);
    elements.regionSelect?.addEventListener('change', updateRegionPreview);
    
    // Mobile menu
    elements.menuToggle?.addEventListener('click', toggleSidebar);
    elements.sidebarToggle?.addEventListener('click', toggleSidebar);
    
    // Reset button
    document.getElementById('reset-btn')?.addEventListener('click', handleReset);
    
    // Device type change - update material hint
    elements.deviceType?.addEventListener('change', updateMaterialHint);
    elements.deviceWatts?.addEventListener('input', updateWattsHint);
    
    // Simulator sliders
    elements.simHoursReduction?.addEventListener('input', updateSimulator);
    elements.simEfficiency?.addEventListener('input', updateSimulator);
    elements.simDevicesOff?.addEventListener('input', updateSimulator);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            elements.exportMenu?.classList.remove('show');
        }
    });
    
    // Close modal when clicking outside
    elements.goalModal?.addEventListener('click', (e) => {
        if (e.target === elements.goalModal) {
            closeGoalModal();
        }
    });
}

// ==================== STORAGE ====================
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
        saveHistory();
    } catch (error) {
        console.error('Error saving to storage:', error);
        showToast('Error al guardar datos', 'error');
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            devices = JSON.parse(stored);
        } else {
            devices = [];
        }
        
        // Load goal
        const goalStored = localStorage.getItem(GOALS_KEY);
        if (goalStored) {
            userGoal = JSON.parse(goalStored);
        }
        
        // Load achievements
        const achStored = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (achStored) {
            achievements = JSON.parse(achStored);
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
        devices = [];
    }
}

function saveHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        const stats = calculateRawStats();
        
        history.push({
            date: new Date().toISOString(),
            consumption: stats.totalKwh,
            footprint: stats.grandTotal,
            deviceCount: devices.length
        });
        
        // Keep only last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const filtered = history.filter(entry => new Date(entry.date) > ninetyDaysAgo);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// ==================== FORM HANDLING ====================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = elements.deviceType.value;
    const brand = elements.deviceBrand.value.trim();
    const model = elements.deviceModel.value.trim();
    const watts = parseFloat(elements.deviceWatts.value);
    const hours = parseFloat(elements.deviceHours.value) || 720;
    const materialCo2 = parseFloat(elements.deviceMaterialCo2.value) || TYPICAL_MATERIALS[type] || 0;
    const lifespan = parseFloat(elements.deviceLifespan.value) || 5;
    const location = elements.deviceLocation.value.trim();
    
    if (!type || !brand || !model || isNaN(watts) || watts <= 0) {
        showToast('Por favor completa los campos obligatorios', 'warning');
        return;
    }
    
    const newDevice = {
        type,
        brand,
        model,
        watts,
        hours,
        materialCo2,
        lifespan,
        location,
        dateAdded: new Date().toISOString()
    };
    
    devices.push(newDevice);
    saveToStorage();
    renderDevices();
    calculateStats();
    checkAchievements();
    
    elements.form.reset();
    elements.deviceHours.value = 720;
    elements.deviceLifespan.value = 5;
    
    showToast(`✅ ${brand} ${model} agregado correctamente`, 'success');
    addEcoPoints(10);
}

function removeDevice(index) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
        const device = devices[index];
        devices.splice(index, 1);
        saveToStorage();
        renderDevices();
        calculateStats();
        showToast(`🗑️ ${device.brand} ${device.model} eliminado`, 'info');
    }
}

// ==================== RENDERING ====================
function renderDevices() {
    if (!elements.tableBody) return;
    
    // Apply filters and sorting
    let filteredDevices = [...devices];
    
    // Filter by type
    if (currentFilter !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.type === currentFilter);
    }
    
    // Sort
    switch (currentSort) {
        case 'consumption-high':
            filteredDevices.sort((a, b) => (b.watts * b.hours) - (a.watts * a.hours));
            break;
        case 'consumption-low':
            filteredDevices.sort((a, b) => (a.watts * a.hours) - (b.watts * b.hours));
            break;
        case 'footprint-high':
            const calcFootprint = (d) => {
                const kwh = (d.watts * d.hours) / 1000;
                const opCo2 = kwh * CO2_PER_KWH;
                const matCo2 = d.materialCo2 / (d.lifespan * 12);
                return opCo2 + matCo2;
            };
            filteredDevices.sort((a, b) => calcFootprint(b) - calcFootprint(a));
            break;
        case 'name':
            filteredDevices.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
            break;
        case 'recent':
        default:
            filteredDevices.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    }
    
    elements.tableBody.innerHTML = '';
    elements.deviceCount.textContent = `${filteredDevices.length} dispositivo${filteredDevices.length !== 1 ? 's' : ''}`;
    
    if (filteredDevices.length === 0) {
        if (elements.emptyDevices) elements.emptyDevices.style.display = 'block';
        return;
    } else {
        if (elements.emptyDevices) elements.emptyDevices.style.display = 'none';
    }
    
    filteredDevices.forEach((device, originalIndex) => {
        const actualIndex = devices.indexOf(device);
        const kwhMonth = (device.watts * device.hours) / 1000;
        const opCo2 = kwhMonth * CO2_PER_KWH;
        const matCo2Month = device.materialCo2 / (device.lifespan * 12);
        const total = opCo2 + matCo2Month;
        
        // Status class based on total footprint
        let statusClass = 'val-low';
        if (total > 50) statusClass = 'val-high';
        else if (total > 20) statusClass = 'val-medium';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="device-name">${device.brand} ${device.model}</span>
                <span class="device-sub">${getDeviceIcon(device.type)} ${device.type}</span>
                ${device.location ? `<span class="device-location">📍 ${device.location}</span>` : ''}
            </td>
            <td>
                <div class="val-primary">${kwhMonth.toFixed(1)}</div>
                <div class="device-sub">kWh/mes</div>
            </td>
            <td>
                <div class="val-orange">${opCo2.toFixed(1)}</div>
                <div class="device-sub">kg CO₂e</div>
            </td>
            <td>
                <div class="val-green">${matCo2Month.toFixed(1)}</div>
                <div class="device-sub">kg CO₂e</div>
            </td>
            <td>
                <div class="${statusClass}">${total.toFixed(1)}</div>
                <div class="device-sub">kg CO₂e</div>
            </td>
            <td>
                <button class="btn-delete" onclick="removeDevice(${actualIndex})" title="Eliminar" aria-label="Eliminar ${device.brand} ${device.model}">🗑️</button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

function getDeviceIcon(type) {
    const icons = {
        'Laptop': '💻',
        'Desktop': '🖥️',
        'Servidor': '🗄️',
        'Router': '📶',
        'Switch': '🔀',
        'Access Point': '📡',
        'Monitor': '🖥️',
        'Impresora': '🖨️',
        'Proyector': '📽️',
        'Smartphone': '📱',
        'Tablet': '📲',
        'Otro': '📦'
    };
    return icons[type] || '📦';
}

// ==================== CALCULATIONS ====================
function calculateRawStats() {
    let totalKwh = 0;
    let totalOpCo2 = 0;
    let totalMatCo2 = 0;
    
    devices.forEach(d => {
        const kwh = (d.watts * d.hours) / 1000;
        totalKwh += kwh;
        totalOpCo2 += kwh * CO2_PER_KWH;
        totalMatCo2 += d.materialCo2 / (d.lifespan * 12);
    });
    
    const grandTotal = totalOpCo2 + totalMatCo2;
    const yearlyTon = (grandTotal * 12) / 1000;
    
    return { totalKwh, totalOpCo2, totalMatCo2, grandTotal, yearlyTon };
}

function calculateStats() {
    const stats = calculateRawStats();
    
    // Update stats display
    if (elements.statConsumption) elements.statConsumption.textContent = stats.totalKwh.toFixed(1);
    if (elements.statCo2) elements.statCo2.textContent = stats.totalOpCo2.toFixed(1);
    if (elements.statMaterials) elements.statMaterials.textContent = stats.totalMatCo2.toFixed(1);
    
    if (elements.totalFootprint) elements.totalFootprint.textContent = `${stats.grandTotal.toFixed(1)} kg CO₂e`;
    if (elements.totalYearly) elements.totalYearly.textContent = `≈ ${stats.yearlyTon.toFixed(2)} toneladas CO₂e al año`;
    
    // Update carbon intensity badge
    const intensityBadge = document.getElementById('intensity-value');
    if (intensityBadge) {
        intensityBadge.textContent = CO2_PER_KWH.toFixed(2);
    }
    
    // Update equivalences
    const kmEquiv = stats.grandTotal * KM_PER_KG_CO2;
    if (elements.co2Equivalence) {
        elements.co2Equivalence.textContent = `🚗 Equivale a ${kmEquiv.toFixed(0)} km en coche`;
    }
    
    // Trees needed
    const treesNeeded = Math.ceil((stats.yearlyTon * TREES_PER_TON_CO2));
    const equivTrees = document.getElementById('equiv-trees');
    if (equivTrees) {
        equivTrees.innerHTML = `🌳 <span>${treesNeeded}</span> árboles necesarios para absorberlo`;
    }
    
    // Flight percentage
    const flightPercent = (stats.grandTotal / FLIGHT_BCN_MAD_CO2 * 100).toFixed(0);
    const equivFlights = document.getElementById('equiv-flights');
    if (equivFlights) {
        equivFlights.innerHTML = `✈️ <span>${flightPercent}%</span> de un vuelo Madrid-Barcelona`;
    }
    
    // Update status colors
    updateStatCardStatus(stats);
    
    // Update charts
    updateAllCharts(stats);
    
    // Update recommendations
    generateRecommendations();
    
    // Update goal
    updateGoalDisplay();
    
    // Update simulator
    updateSimulator();
}

function updateStatCardStatus(stats) {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const value = parseFloat(card.querySelector('.stat-value')?.textContent || 0);
        
        // Simple thresholds - adjust based on your needs
        if (card.querySelector('.icon-box.orange')) { // CO2 card
            if (stats.grandTotal < 30) card.dataset.status = 'good';
            else if (stats.grandTotal < 80) card.dataset.status = 'warning';
            else card.dataset.status = 'danger';
        }
    });
}

// ==================== CHARTS ====================

// Helper function to show empty chart messages
function showEmptyChartMessage(canvas, message) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, width, height);
    
    // Icon
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📊', width / 2, height / 2 - 30);
    
    // Message
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(message, width / 2, height / 2 + 20);
    
    ctx.restore();
}

function updateAllCharts(stats) {
    updateDonutChart(stats);
    updateMainChart();
    updateHistoryChart();
    updateDevicePieChart();
    updateStackedChart(stats);
}

function updateDonutChart(stats) {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    
    if (charts.donut) charts.donut.destroy();
    
    const ctx = canvas.getContext('2d');
    charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Operativa', 'Materiales'],
            datasets: [{
                data: [stats.totalOpCo2, stats.totalMatCo2],
                backgroundColor: ['#F97316', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed.toFixed(1)} kg CO₂e`
                    }
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('donut-legend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background-color: #F97316;"></div>
                <span>Operativa: ${stats.totalOpCo2.toFixed(1)} kg</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #10B981;"></div>
                <span>Materiales: ${stats.totalMatCo2.toFixed(1)} kg</span>
            </div>
        `;
    }
}

function updateMainChart() {
    const canvas = document.getElementById('mainChart');
    if (!canvas) return;
    
    // Check if we have devices
    if (!devices || devices.length === 0) {
        showEmptyChartMessage(canvas, 'Agrega al menos un dispositivo para visualizar esta gráfica');
        if (charts.main) charts.main.destroy();
        return;
    }
    
    // Group by device type
    const grouped = {};
    devices.forEach(d => {
        if (!grouped[d.type]) grouped[d.type] = 0;
        const kwh = (d.watts * d.hours) / 1000;
        grouped[d.type] += kwh * CO2_PER_KWH + (d.materialCo2 / (d.lifespan * 12));
    });
    
    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    
    if (charts.main) charts.main.destroy();
    
    const ctx = canvas.getContext('2d');
    charts.main = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Huella Total (kg CO₂e)',
                data,
                backgroundColor: '#10B981',
                borderRadius: 6,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)} kg CO₂e`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#1E293B' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function updateHistoryChart() {
    const canvas = document.getElementById('historyChart');
    if (!canvas) return;
    
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        
        if (history.length === 0) {
            showEmptyChartMessage(canvas, 'El historial se registrará automáticamente conforme uses la app');
            if (charts.history) charts.history.destroy();
            return;
        }
        
        const range = parseInt(document.getElementById('history-range')?.value || 30);
        const filtered = history.slice(-range);
        
        const labels = filtered.map(h => new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
        const data = filtered.map(h => h.footprint);
        
        if (charts.history) charts.history.destroy();
        
        const ctx = canvas.getContext('2d');
        charts.history = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Huella Total (kg CO₂e)',
                    data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#1E293B' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating history chart:', error);
    }
}

function updateDevicePieChart() {
    const canvas = document.getElementById('devicePieChart');
    if (!canvas) return;
    
    if (!devices || devices.length === 0) {
        showEmptyChartMessage(canvas, 'Registra dispositivos para ver su distribución');
        if (charts.devicePie) charts.devicePie.destroy();
        return;
    }
    
    const deviceData = {};
    devices.forEach(d => {
        const key = `${d.brand} ${d.model}`;
        const kwh = (d.watts * d.hours) / 1000;
        deviceData[key] = kwh * CO2_PER_KWH + (d.materialCo2 / (d.lifespan * 12));
    });
    
    const labels = Object.keys(deviceData).slice(0, 8); // Top 8
    const data = Object.values(deviceData).slice(0, 8);
    
    if (charts.devicePie) charts.devicePie.destroy();
    
    const ctx = canvas.getContext('2d');
    charts.devicePie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#10B981', '#F59E0B', '#F97316', '#3B82F6',
                    '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 } }
                }
            }
        }
    });
}

function updateStackedChart(stats) {
    const canvas = document.getElementById('stackedChart');
    if (!canvas) return;
    
    if (charts.stacked) charts.stacked.destroy();
    
    const ctx = canvas.getContext('2d');
    charts.stacked = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Mensual'],
            datasets: [
                {
                    label: 'Operativa',
                    data: [stats.totalOpCo2],
                    backgroundColor: '#F97316'
                },
                {
                    label: 'Materiales',
                    data: [stats.totalMatCo2],
                    backgroundColor: '#10B981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    stacked: true,
                    grid: { color: '#1E293B' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// ==================== RECOMMENDATIONS ====================
function generateRecommendations() {
    if (!elements.recommendationsList) return;
    
    elements.recommendationsList.innerHTML = '';
    
    if (devices.length === 0) {
        elements.recommendationsList.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Agrega dispositivos para obtener recomendaciones personalizadas.</p>';
        if (elements.recCount) elements.recCount.textContent = '0';
        return;
    }
    
    const recs = [];
    const stats = calculateRawStats();
    
    // Find highest consumer
    const sorted = [...devices].sort((a, b) => (b.watts * b.hours) - (a.watts * a.hours));
    const top = sorted[0];
    
    if (top) {
        const topConsumption = (top.watts * top.hours / 1000).toFixed(1);
        recs.push({
            title: `⚡ Atención: ${top.brand} ${top.model}`,
            text: `Consume ${topConsumption} kWh/mes, tu mayor gasto energético. Considera programar apagado automático o reducir horas de uso.`,
            type: 'warning'
        });
    }
    
    // High footprint warning
    if (stats.grandTotal > 100) {
        recs.push({
            title: '🔴 Huella Elevada Detectada',
            text: `Tu huella de ${stats.grandTotal.toFixed(0)} kg CO₂e/mes está por encima del promedio. Prioriza acciones de reducción.`,
            type: 'danger'
        });
    }
    
    // Servidor virtualization
    const servers = devices.filter(d => d.type === 'Servidor').length;
    if (servers > 2) {
        recs.push({
            title: '🖥️ Virtualización de Servidores',
            text: `Tienes ${servers} servidores. La virtualización puede consolidarlos y reducir la huella física y energética hasta un 40%.`,
            type: 'normal'
        });
    }
    
    // Material footprint
    if (stats.totalMatCo2 > stats.totalOpCo2 * 0.3) {
        recs.push({
            title: '♻️ Extiende la Vida Útil',
            text: 'Tu huella de materiales es significativa. Extender la vida útil de los equipos 2 años más reduce considerablemente esta métrica.',
            type: 'normal'
        });
    }
    
    // General tips
    recs.push({
        title: '💡 Eficiencia Energética',
        text: 'Utiliza equipos certificados Energy Star. Activa modos de ahorro de energía y apaga dispositivos no esenciales fuera del horario laboral.',
        type: 'normal'
    });
    
    recs.push({
        title: '🌡️ Control de Temperatura',
        text: 'Mantén los servidores en ambientes frescos. Cada grado Celsius de reducción en el datacenter puede ahorrar hasta 4% de energía en climatización.',
        type: 'normal'
    });
    
    if (elements.recCount) elements.recCount.textContent = recs.length.toString();
    
    recs.forEach(r => {
        const div = document.createElement('div');
        div.className = `rec-item ${r.type === 'warning' ? 'warning' : ''} ${r.type === 'danger' ? 'danger' : ''}`;
        div.innerHTML = `<h4>${r.title}</h4><p>${r.text}</p>`;
        elements.recommendationsList.appendChild(div);
    });
}

// ==================== FILTERS & SORTING ====================
function handleFilterChange(e) {
    currentFilter = e.target.value;
    renderDevices();
}

function handleSortChange(e) {
    currentSort = e.target.value;
    renderDevices();
}

// ==================== NAVIGATION ====================
function switchTab(tabName) {
    // Update nav items
    elements.navItems.forEach(nav => {
        if (nav.dataset.tab === tabName) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
    
    // Update tab contents
    elements.tabContents.forEach(tab => {
        if (tab.id === `tab-${tabName}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Close mobile menu
    elements.sidebar?.classList.remove('open');
}

function toggleSidebar() {
    elements.sidebar?.classList.toggle('open');
}

// ==================== EXPORT / IMPORT ====================
function toggleExportMenu(e) {
    e.stopPropagation();
    elements.exportMenu?.classList.toggle('show');
}

// ==================== RESET FUNCTIONALITY ====================
function handleReset() {
    // Confirmación con el usuario
    const confirmation = confirm(
        '⚠️ ADVERTENCIA: Esta acción eliminará todos los datos\n\n' +
        '• Todos los dispositivos\n' +
        '• Historial de métricas\n' +
        '• Logros y puntos ecológicos\n' +
        '• Metas configuradas\n' +
        '• Progreso de ayuda\n\n' +
        '¿Estás seguro de que deseas restablecer todo?'
    );
    
    if (!confirmation) return;
    
    // Segunda confirmación
    const finalConfirmation = confirm(
        '⚠️ ÚLTIMA CONFIRMACIÓN\n\n' +
        'Esta acción NO se puede deshacer.\n' +
        '¿Proceder con el restablecimiento?'
    );
    
    if (!finalConfirmation) return;
    
    // Limpiar todos los datos de localStorage
    const keysToRemove = [
        STORAGE_KEY,
        HISTORY_KEY,
        GOALS_KEY,
        ACHIEVEMENTS_KEY,
        ECO_POINTS_KEY,
        'help_step_1',
        'help_step_2',
        'help_step_3',
        'help_step_4',
        'jlabeco_visited',
        'jlabeco_notifications'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // NO eliminamos REGION_KEY para mantener la configuración de región
    
    // Resetear variables globales
    devices = [];
    ecoPoints = 0;
    userGoal = null;
    achievements = initAchievements();
    
    // Destruir gráficas existentes
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    // Reinicializar la aplicación
    renderDevices();
    calculateStats();
    updateGoalDisplay();
    updateAchievementsDisplay();
    updateSimulator();
    updateEcoPointsDisplay();
    updateNotificationUI();
    
    // Reinicializar progreso de ayuda
    if (typeof updateHelpProgress === 'function') {
        updateHelpProgress();
    }
    
    // Mostrar notificación de éxito
    addNotification('info', '✅ Restablecimiento Completo', 
        'Todas las métricas han sido restablecidas. ¡Empieza de nuevo!');
    
    // Mostrar toast de confirmación
    showToast('🔄 Datos restablecidos correctamente', 'success');
    
    // Log para debugging
    console.log('✅ Sistema restablecido correctamente');
}

function exportData(format) {
    elements.exportMenu?.classList.remove('show');
    
    switch (format) {
        case 'json':
            exportJSON();
            break;
        case 'csv':
            exportCSV();
            break;
        case 'pdf':
            exportPDF();
            break;
    }
}

function exportJSON() {
    const dataStr = JSON.stringify(devices, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, `jlabeco_data_${getDateString()}.json`);
    showToast('📄 Datos exportados en formato JSON', 'success');
    addEcoPoints(5);
}

function exportCSV() {
    const headers = ['Tipo', 'Marca', 'Modelo', 'Consumo (W)', 'Horas/mes', 'kWh/mes', 'Huella Operativa (kg CO₂e)', 'Huella Materiales (kg CO₂e)', 'Total (kg CO₂e)', 'Ubicación'];
    
    const rows = devices.map(d => {
        const kwh = (d.watts * d.hours) / 1000;
        const opCo2 = kwh * CO2_PER_KWH;
        const matCo2 = d.materialCo2 / (d.lifespan * 12);
        const total = opCo2 + matCo2;
        
        return [
            d.type,
            d.brand,
            d.model,
            d.watts,
            d.hours,
            kwh.toFixed(2),
            opCo2.toFixed(2),
            matCo2.toFixed(2),
            total.toFixed(2),
            d.location || ''
        ].map(field => `"${field}"`).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(dataBlob, `jlabeco_reporte_${getDateString()}.csv`);
    showToast('📊 Reporte exportado en formato CSV', 'success');
    addEcoPoints(5);
}

function exportPDF() {
    // Simple HTML-based PDF export (browser print)
    const stats = calculateRawStats();
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>JLabEco - Reporte ${getDateString()}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #10b981; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #10b981; color: white; }
                .summary { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .summary h2 { margin-top: 0; }
            </style>
        </head>
        <body>
            <h1>🍃 JLabEco - Reporte de Huella de Carbono</h1>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div class="summary">
                <h2>Resumen</h2>
                <p><strong>Consumo Eléctrico:</strong> ${stats.totalKwh.toFixed(1)} kWh/mes</p>
                <p><strong>Huella Operativa:</strong> ${stats.totalOpCo2.toFixed(1)} kg CO₂e/mes</p>
                <p><strong>Huella de Materiales:</strong> ${stats.totalMatCo2.toFixed(1)} kg CO₂e/mes</p>
                <p><strong>Huella Total:</strong> ${stats.grandTotal.toFixed(1)} kg CO₂e/mes (${stats.yearlyTon.toFixed(2)} toneladas/año)</p>
                <p><strong>Dispositivos Registrados:</strong> ${devices.length}</p>
            </div>
            
            <h2>Dispositivos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Marca/Modelo</th>
                        <th>Consumo (W)</th>
                        <th>kWh/mes</th>
                        <th>Huella Total (kg CO₂e)</th>
                        <th>Ubicación</th>
                    </tr>
                </thead>
                <tbody>
                    ${devices.map(d => {
                        const kwh = (d.watts * d.hours) / 1000;
                        const total = kwh * CO2_PER_KWH + (d.materialCo2 / (d.lifespan * 12));
                        return `
                            <tr>
                                <td>${d.type}</td>
                                <td>${d.brand} ${d.model}</td>
                                <td>${d.watts}</td>
                                <td>${kwh.toFixed(1)}</td>
                                <td>${total.toFixed(1)}</td>
                                <td>${d.location || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #666; font-size: 12px;">
                Generado por JLabEco - Calculadora de Huella de Carbono Tecnológica
            </p>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
    
    showToast('📑 Reporte PDF preparado para imprimir', 'success');
    addEcoPoints(10);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                devices = imported.map(d => ({
                    ...d,
                    dateAdded: d.dateAdded || new Date().toISOString()
                }));
                saveToStorage();
                renderDevices();
                calculateStats();
                showToast(`✅ ${devices.length} dispositivos importados correctamente`, 'success');
                addEcoPoints(15);
                checkAchievements();
            } else {
                showToast('❌ Formato de archivo JSON inválido', 'error');
            }
        } catch (error) {
            showToast('❌ Error al leer el archivo JSON', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function getDateString() {
    return new Date().toISOString().split('T')[0];
}

// ==================== GOALS ====================
function openGoalModal() {
    const stats = calculateRawStats();
    if (elements.currentFootprintHint) {
        elements.currentFootprintHint.textContent = stats.grandTotal.toFixed(1);
    }
    
    if (userGoal) {
        elements.goalValue.value = userGoal.target;
        elements.goalDeadline.value = userGoal.deadline || '';
    }
    
    elements.goalModal?.classList.add('show');
}

function closeGoalModal() {
    elements.goalModal?.classList.remove('show');
}

function saveGoal() {
    const target = parseFloat(elements.goalValue.value);
    const deadline = elements.goalDeadline.value;
    
    if (!target || target <= 0) {
        showToast('Por favor ingresa una meta válida', 'warning');
        return;
    }
    
    userGoal = {
        target,
        deadline: deadline || null,
        setDate: new Date().toISOString()
    };
    
    localStorage.setItem(GOALS_KEY, JSON.stringify(userGoal));
    updateGoalDisplay();
    closeGoalModal();
    showToast('🎯 Meta configurada correctamente', 'success');
    addEcoPoints(20);
}

function updateGoalDisplay() {
    if (!userGoal) {
        if (elements.goalProgressFill) elements.goalProgressFill.style.width = '0%';
        if (elements.goalCurrent) elements.goalCurrent.textContent = '0 kg CO₂e';
        if (elements.goalTarget) elements.goalTarget.textContent = 'Meta: -- kg CO₂e';
        if (elements.goalMessage) {
            elements.goalMessage.textContent = 'Configura una meta para ver tu progreso';
            elements.goalMessage.className = 'goal-message';
        }
        return;
    }
    
    const stats = calculateRawStats();
    const current = isNaN(stats.grandTotal) ? 0 : stats.grandTotal;
    const target = parseFloat(userGoal.target) || 0;
    
    if (target === 0) return;
    
    const progress = Math.max(0, Math.min(100, (1 - (current / target)) * 100 + 50)); // Scale from 0-100
    
    if (elements.goalProgressFill) {
        elements.goalProgressFill.style.width = `${progress}%`;
    }
    
    if (elements.goalCurrent) elements.goalCurrent.textContent = `${current.toFixed(1)} kg CO₂e`;
    if (elements.goalTarget) {
        const targetText = `Meta: ${target.toFixed(1)} kg CO₂e`;
        const badge = userGoal.source === 'simulator' ? ' <span class="goal-badge simulator">🎯 Del Simulador</span>' : '';
        elements.goalTarget.innerHTML = targetText + badge;
    }
    
    if (elements.goalMessage) {
        if (current <= target) {
            elements.goalMessage.textContent = `🎉 ¡Felicidades! Has alcanzado tu meta de ${target.toFixed(1)} kg CO₂e`;
            elements.goalMessage.className = 'goal-message success';
            unlockAchievement('goal_reached');
        } else {
            const diff = current - target;
            const extraInfo = userGoal.annualSavings ? ` (Ahorro anual proyectado: ${userGoal.annualSavings.toFixed(1)} kg CO₂e)` : '';
            elements.goalMessage.textContent = `Reduce ${diff.toFixed(1)} kg CO₂e más para alcanzar tu meta${extraInfo}`;
            elements.goalMessage.className = 'goal-message warning';
        }
    }
}

// ==================== SIMULATOR ====================
function updateSimulator() {
    const stats = calculateRawStats();
    
    if (!stats || stats.totalKwh === 0) {
        return;
    }
    
    // Scenario 1: Hours reduction
    const hoursReduction = parseFloat(elements.simHoursReduction?.value || 0);
    if (elements.simHoursValue) {
        elements.simHoursValue.textContent = `${hoursReduction} hora${hoursReduction !== 1 ? 's' : ''} menos/día`;
    }
    
    const monthlyHoursReduced = hoursReduction * 30;
    const totalWatts = devices.reduce((sum, d) => sum + d.watts, 0);
    const kwhSaved = (totalWatts * monthlyHoursReduced) / 1000;
    const co2Saved = kwhSaved * CO2_PER_KWH;
    
    if (document.getElementById('sim-kwh-saved')) document.getElementById('sim-kwh-saved').textContent = `${kwhSaved.toFixed(1)} kWh`;
    if (document.getElementById('sim-co2-saved')) document.getElementById('sim-co2-saved').textContent = `${co2Saved.toFixed(1)} kg CO₂e`;
    
    // Scenario 2: Efficiency improvement
    const efficiency = parseFloat(elements.simEfficiency?.value || 0);
    if (elements.simEfficiencyValue) {
        elements.simEfficiencyValue.textContent = `${efficiency}% más eficiente`;
    }
    
    const newConsumption = stats.totalKwh * (1 - efficiency / 100);
    const footprintReduction = (stats.totalKwh - newConsumption) * CO2_PER_KWH;
    
    if (document.getElementById('sim-new-consumption')) document.getElementById('sim-new-consumption').textContent = `${newConsumption.toFixed(1)} kWh`;
    if (document.getElementById('sim-footprint-reduction')) document.getElementById('sim-footprint-reduction').textContent = `${footprintReduction.toFixed(1)} kg CO₂e`;
    
    // Scenario 3: Automatic shutdown
    const devicesPercent = parseFloat(elements.simDevicesOff?.value || 0);
    if (elements.simDevicesOffValue) {
        elements.simDevicesOffValue.textContent = `${devicesPercent}% de equipos`;
    }
    
    const nightHours = 9;
    const nightHoursMonth = nightHours * 30;
    const affectedWatts = totalWatts * (devicesPercent / 100);
    const yearlySaved = (affectedWatts * nightHoursMonth * 12 / 1000) * CO2_PER_KWH;
    const treesEquivalent = Math.ceil(yearlySaved / (1000 / TREES_PER_TON_CO2));
    
    if (document.getElementById('sim-yearly-saved')) document.getElementById('sim-yearly-saved').textContent = `${yearlySaved.toFixed(1)} kg CO₂e`;
    if (document.getElementById('sim-equivalent')) document.getElementById('sim-equivalent').textContent = `🌳 ${treesEquivalent} árboles plantados`;
    
    // Total summary
    const totalSavings = (co2Saved + footprintReduction) * 12 + yearlySaved;
    const percentReduction = (totalSavings / (stats.grandTotal * 12) * 100);
    
    if (document.getElementById('sim-total-savings')) {
        document.getElementById('sim-total-savings').textContent = `${totalSavings.toFixed(1)} kg CO₂e`;
    }
    if (document.getElementById('sim-total-percent')) {
        document.getElementById('sim-total-percent').textContent = `${percentReduction.toFixed(1)}%`;
    }
}

// ==================== ACHIEVEMENTS & GAMIFICATION ====================
function initAchievements() {
    return [
        { id: 'first_device', title: 'Primer Paso', desc: 'Registra tu primer dispositivo', icon: '🌱', points: 10, unlocked: false },
        { id: 'devices_5', title: 'Inventario Básico', desc: 'Registra 5 dispositivos', icon: '📋', points: 25, unlocked: false },
        { id: 'devices_10', title: 'Auditor Ecológico', desc: 'Registra 10 dispositivos', icon: '🔍', points: 50, unlocked: false },
        { id: 'first_export', title: 'Documentador', desc: 'Exporta tus primeros datos', icon: '📤', points: 15, unlocked: false },
        { id: 'goal_reached', title: 'Meta Cumplida', desc: 'Alcanza tu objetivo de reducción', icon: '🎯', points: 100, unlocked: false },
        { id: 'eco_warrior', title: 'Guerrero Eco', desc: 'Alcanza 200 puntos ecológicos', icon: '⚔️', points: 50, unlocked: false },
        { id: 'week_streak', title: 'Compromiso Semanal', desc: 'Usa la app durante 7 días', icon: '📅', points: 30, unlocked: false },
        { id: 'low_footprint', title: 'Huella Ligera', desc: 'Mantén tu huella bajo 30 kg CO₂e', icon: '🦋', points: 75, unlocked: false }
    ];
}

function checkAchievements() {
    let newUnlocks = [];
    
    // First device
    if (!achievements[0].unlocked && devices.length >= 1) {
        unlockAchievement('first_device');
        newUnlocks.push(achievements[0]);
    }
    
    // 5 devices
    if (!achievements[1].unlocked && devices.length >= 5) {
        unlockAchievement('devices_5');
        newUnlocks.push(achievements[1]);
    }
    
    // 10 devices
    if (!achievements[2].unlocked && devices.length >= 10) {
        unlockAchievement('devices_10');
        newUnlocks.push(achievements[2]);
    }
    
    // Check eco warrior (200 points)
    const achIndex = achievements.findIndex(a => a.id === 'eco_warrior');
    if (achIndex >= 0 && !achievements[achIndex].unlocked && ecoPoints >= 200) {
        unlockAchievement('eco_warrior');
        newUnlocks.push(achievements[achIndex]);
    }
    
    // Low footprint
    const stats = calculateRawStats();
    const lowIndex = achievements.findIndex(a => a.id === 'low_footprint');
    if (lowIndex >= 0 && !achievements[lowIndex].unlocked && stats.grandTotal < 30 && devices.length > 0) {
        unlockAchievement('low_footprint');
        newUnlocks.push(achievements[lowIndex]);
    }
    
    // Show notifications for new unlocks
    newUnlocks.forEach(ach => {
        showToast(`🏆 ¡Logro desbloqueado! ${ach.title}`, 'success');
    });
    
    updateAchievementsDisplay();
}

function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        addEcoPoints(achievement.points);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    }
}

function addEcoPoints(points) {
    ecoPoints += points;
    localStorage.setItem(ECO_POINTS_KEY, ecoPoints.toString());
    updateEcoPointsDisplay();
    checkAchievements();
}

function updateEcoPointsDisplay() {
    if (elements.ecoPoints) elements.ecoPoints.textContent = ecoPoints;
    if (elements.mobileEcoPoints) elements.mobileEcoPoints.textContent = ecoPoints;
    if (elements.totalEcoPoints) elements.totalEcoPoints.textContent = ecoPoints;
    
    // Update level
    const level = getUserLevel(ecoPoints);
    if (elements.userLevel) elements.userLevel.textContent = level.icon;
    if (elements.levelTitle) elements.levelTitle.textContent = level.title;
    
    const progressInLevel = (ecoPoints - level.min) / (level.max - level.min) * 100;
    if (elements.levelFill) elements.levelFill.style.width = `${progressInLevel}%`;
    if (elements.levelNext) elements.levelNext.textContent = `Siguiente nivel: ${level.max} pts`;
}

function getUserLevel(points) {
    if (points < 50) return { title: 'Eco Novato', icon: '🌱', min: 0, max: 50 };
    if (points < 100) return { title: 'Eco Aprendiz', icon: '🌿', min: 50, max: 100 };
    if (points < 200) return { title: 'Eco Consciente', icon: '♻️', min: 100, max: 200 };
    if (points < 400) return { title: 'Eco Experto', icon: '🌳', min: 200, max: 400 };
    if (points < 600) return { title: 'Eco Maestro', icon: '🌲', min: 400, max: 600 };
    return { title: 'Eco Leyenda', icon: '🏆', min: 600, max: 99999 };
}

function updateAchievementsDisplay() {
    if (!elements.achievementsGrid) return;
    
    elements.achievementsGrid.innerHTML = '';
    
    achievements.forEach(ach => {
        const div = document.createElement('div');
        div.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
            <div class="achievement-points">+${ach.points} pts</div>
        `;
        elements.achievementsGrid.appendChild(div);
    });
    
    updateChallengesDisplay();
}

function updateChallengesDisplay() {
    if (!elements.challengesGrid) return;
    
    const stats = calculateRawStats();
    
    const challenges = [
        {
            icon: '⚡',
            title: 'Reducir 10% este mes',
            desc: 'Disminuye tu consumo energético',
            progress: 0,
            target: 100
        },
        {
            icon: '📱',
            title: 'Registra 20 dispositivos',
            desc: 'Completa tu inventario tecnológico',
            progress: devices.length,
            target: 20
        },
        {
            icon: '🌳',
            title: 'Huella bajo 50 kg CO₂e',
            desc: 'Optimiza tu impacto ambiental',
            progress: Math.max(0, 50 - stats.grandTotal),
            target: 50
        }
    ];
    
    elements.challengesGrid.innerHTML = '';
    
    challenges.forEach(ch => {
        const progressPercent = Math.min(100, (ch.progress / ch.target) * 100);
        
        const div = document.createElement('div');
        div.className = 'challenge-item';
        div.innerHTML = `
            <div class="challenge-header">
                <span class="challenge-icon">${ch.icon}</span>
                <span class="challenge-title">${ch.title}</span>
            </div>
            <div class="challenge-desc">${ch.desc}</div>
            <div class="challenge-progress">
                <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="challenge-meta">
                <span>${ch.progress}/${ch.target}</span>
                <span>${progressPercent.toFixed(0)}%</span>
            </div>
        `;
        elements.challengesGrid.appendChild(div);
    });
}

// ==================== HELPERS ====================
function updateMaterialHint() {
    const type = elements.deviceType?.value;
    if (type && TYPICAL_MATERIALS[type]) {
        const hint = document.getElementById('material-hint');
        if (hint) {
            hint.textContent = `Típico: ${TYPICAL_MATERIALS[type]} kg CO₂e`;
        }
    }
}

function updateWattsHint() {
    const watts = parseFloat(elements.deviceWatts?.value || 0);
    const hint = document.getElementById('watts-hint');
    if (hint && watts > 0) {
        if (watts < 50) hint.textContent = '✅ Consumo bajo';
        else if (watts < 200) hint.textContent = '⚠️ Consumo moderado';
        else hint.textContent = '🔴 Consumo alto';
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    elements.toastContainer?.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==================== MAKE FUNCTIONS GLOBAL ====================
window.removeDevice = removeDevice;
window.switchTab = switchTab;

// ==================== ENHANCED FEATURES ====================

// Notification System
let notifications = [];
const notificationTrigger = document.getElementById('notification-trigger');
const notificationCenter = document.getElementById('notification-center');
const notificationClose = document.getElementById('notification-close');
const notificationList = document.getElementById('notification-list');
const notificationBadge = document.getElementById('notification-badge');

function addNotification(type, title, text) {
    const notification = {
        id: Date.now(),
        type: type,
        title: title,
        text: text,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        read: false
    };
    
    notifications.unshift(notification);
    updateNotificationUI();
}

function updateNotificationUI() {
    if (!notificationList) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    if (notificationBadge) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <div class="empty-icon">🔔</div>
                <p>No tienes notificaciones</p>
                <span>Aquí aparecerán tus logros y actualizaciones</span>
            </div>
        `;
        return;
    }
    
    notificationList.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.type} ${n.read ? 'read' : ''}" data-id="${n.id}">
            <div class="notification-icon">${getNotificationIcon(n.type)}</div>
            <div class="notification-content">
                <span class="notification-title">${n.title}</span>
                <span class="notification-text">${n.text}</span>
                <span class="notification-time">${n.time}</span>
            </div>
        </div>
    `).join('');
    
    // Mark as read when clicked
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const notification = notifications.find(n => n.id === id);
            if (notification) {
                notification.read = true;
                updateNotificationUI();
            }
        });
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'achievement': '🏆',
        'milestone': '🎯',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || '📢';
}

if (notificationTrigger) {
    notificationTrigger.addEventListener('click', () => {
        notificationCenter?.classList.toggle('active');
    });
}

if (notificationClose) {
    notificationClose.addEventListener('click', () => {
        notificationCenter?.classList.remove('active');
    });
}

// Chart Filters
const applyChartFiltersBtn = document.getElementById('apply-chart-filters');
if (applyChartFiltersBtn) {
    applyChartFiltersBtn.addEventListener('click', () => {
        updateAllCharts();
        showToast('success', 'Filtros aplicados correctamente');
    });
}

// Apply Simulation Button
const applySimulationBtn = document.getElementById('apply-simulation-btn');
if (applySimulationBtn) {
    applySimulationBtn.addEventListener('click', () => {
        const totalSavingsEl = document.getElementById('sim-total-savings');
        const totalSavings = totalSavingsEl?.textContent || '0';
        const savingsValue = parseFloat(totalSavings.replace(/[^\d.]/g, ''));
        
        if (!savingsValue || savingsValue <= 0 || isNaN(savingsValue)) {
            showToast('warning', 'Ajusta los parámetros del simulador para generar una meta válida');
            return;
        }
        
        const stats = calculateRawStats();
        const targetCo2 = Math.max(0, stats.totalCo2e - (savingsValue / 12)); // Monthly target
        
        userGoal = {
            target: targetCo2,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `Meta del simulador: reducir ${(savingsValue / 12).toFixed(2)} kg CO₂e/mes`,
            source: 'simulator',
            annualSavings: savingsValue
        };
        
        localStorage.setItem(GOALS_KEY, JSON.stringify(userGoal));
        updateGoalDisplay();
        
        // Visual feedback - highlight button
        applySimulationBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
        applySimulationBtn.innerHTML = '✓ Meta Aplicada con Éxito';
        applySimulationBtn.disabled = true;
        
        setTimeout(() => {
            applySimulationBtn.style.background = '';
            applySimulationBtn.innerHTML = '🎯 Aplicar como Meta Personal';
            applySimulationBtn.disabled = false;
        }, 3000);
        
        // Multiple notifications
        showToast('success', `¡Meta establecida! Objetivo: ${targetCo2.toFixed(2)} kg CO₂e/mes`);
        addNotification('milestone', '🎯 Meta del Simulador Activada', 
            `Tu nuevo objetivo es reducir a ${targetCo2.toFixed(2)} kg CO₂e/mes. Ahorro anual proyectado: ${savingsValue.toFixed(2)} kg CO₂e`);
        
        addEcoPoints(50);
        
        // Scroll to goals section or switch to dashboard
        switchTab('dashboard');
        setTimeout(() => {
            document.getElementById('goal-display')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
}

// Savings Projection Chart
let savingsChart = null;

function updateSimulator() {
    const hoursReduction = parseFloat(document.getElementById('sim-hours-reduction')?.value || 0);
    const efficiency = parseFloat(document.getElementById('sim-efficiency')?.value || 0);
    const devicesOff = parseFloat(document.getElementById('sim-devices-off')?.value || 0);
    
    // Validar que haya dispositivos
    if (!devices || devices.length === 0) {
        // Mostrar mensaje de no disponible
        ['sim-kwh-saved', 'sim-co2-saved', 'sim-new-consumption', 'sim-footprint-reduction', 
         'sim-yearly-saved', 'sim-equivalent', 'sim-total-savings', 'sim-total-percent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '—';
        });
        return;
    }
    
    const stats = calculateRawStats();
    const monthlyKwh = isNaN(stats.totalKwhMonth) ? 0 : stats.totalKwhMonth;
    const monthlyCo2 = isNaN(stats.totalCo2e) ? 0 : stats.totalCo2e;
    
    // Validar que haya datos válidos
    if (monthlyKwh === 0 || monthlyCo2 === 0) {
        ['sim-kwh-saved', 'sim-co2-saved', 'sim-new-consumption', 'sim-footprint-reduction', 
         'sim-yearly-saved', 'sim-equivalent', 'sim-total-savings', 'sim-total-percent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '—';
        });
        return;
    }
    
    // Scenario 1: Reduce hours
    const hoursPerDay = devices.length > 0 ? (stats.totalHours / devices.length) / 30 : 0;
    const reductionFactor = hoursPerDay > 0 ? hoursReduction / hoursPerDay : 0;
    const kwhSaved = monthlyKwh * reductionFactor;
    const co2Saved1 = kwhSaved * CO2_PER_KWH;
    
    if (document.getElementById('sim-kwh-saved')) {
        document.getElementById('sim-kwh-saved').textContent = `${isNaN(kwhSaved) ? 0 : kwhSaved.toFixed(2)} kWh`;
    }
    if (document.getElementById('sim-co2-saved')) {
        document.getElementById('sim-co2-saved').textContent = `${isNaN(co2Saved1) ? 0 : co2Saved1.toFixed(2)} kg CO₂e`;
    }
    
    // Scenario 2: Efficiency
    const newConsumption = monthlyKwh * (1 - efficiency / 100);
    const footprintReduction = (monthlyKwh - newConsumption) * CO2_PER_KWH;
    
    if (document.getElementById('sim-new-consumption')) {
        document.getElementById('sim-new-consumption').textContent = `${isNaN(newConsumption) ? 0 : newConsumption.toFixed(2)} kWh`;
    }
    if (document.getElementById('sim-footprint-reduction')) {
        document.getElementById('sim-footprint-reduction').textContent = `${isNaN(footprintReduction) ? 0 : footprintReduction.toFixed(2)} kg CO₂e`;
    }
    
    // Scenario 3: Nighttime shutdown
    const nightHours = 9;
    const affectedDevices = devicesOff / 100;
    const yearlySaved = (monthlyKwh * affectedDevices * (nightHours / 24) * 12) * CO2_PER_KWH;
    const treesEquivalent = Math.floor(isNaN(yearlySaved) ? 0 : yearlySaved / (1000 / TREES_PER_TON_CO2));
    
    if (document.getElementById('sim-yearly-saved')) {
        document.getElementById('sim-yearly-saved').textContent = `${isNaN(yearlySaved) ? 0 : yearlySaved.toFixed(2)} kg CO₂e`;
    }
    if (document.getElementById('sim-equivalent')) {
        document.getElementById('sim-equivalent').textContent = `🌳 ${treesEquivalent} árboles plantados`;
    }
    
    // Total
    const totalSavings = (co2Saved1 * 12) + (footprintReduction * 12) + yearlySaved;
    const totalPercent = monthlyCo2 > 0 ? (totalSavings / (monthlyCo2 * 12)) * 100 : 0;
    
    if (document.getElementById('sim-total-savings')) {
        document.getElementById('sim-total-savings').textContent = `${isNaN(totalSavings) ? 0 : totalSavings.toFixed(2)} kg CO₂e`;
    }
    if (document.getElementById('sim-total-percent')) {
        document.getElementById('sim-total-percent').textContent = `${isNaN(totalPercent) ? 0 : totalPercent.toFixed(1)}%`;
    }
    
    // Update projection chart only if we have valid data
    if (!isNaN(monthlyCo2) && !isNaN(totalSavings)) {
        updateSavingsProjectionChart(monthlyCo2, totalSavings / 12);
    }
}

function updateSavingsProjectionChart(currentMonthly, monthlySavings) {
    const canvas = document.getElementById('savingsProjectionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (savingsChart) {
        savingsChart.destroy();
    }
    
    const months = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];
    const currentData = months.map(() => currentMonthly);
    const improvedData = months.map((_, i) => Math.max(0, currentMonthly - (monthlySavings * (i + 1))));
    
    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Sin mejoras',
                    data: currentData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Con mejoras',
                    data: improvedData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kg CO₂e`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// Enhanced Chart Interactivity
function enhanceChartTooltips() {
    Chart.defaults.plugins.tooltip.callbacks.title = function(context) {
        return context[0].label;
    };
    
    Chart.defaults.plugins.tooltip.callbacks.afterLabel = function(context) {
        const dataset = context.dataset;
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((context.parsed.y / total) * 100).toFixed(1);
        return `(${percentage}% del total)`;
    };
}

// Motivational Messages
function checkForMilestones() {
    const stats = calculateRawStats();
    
    // Check if reduced footprint
    if (userGoal && stats.totalCo2e < userGoal.target) {
        addNotification('success', '🎉 ¡Meta Alcanzada!', 
            `Has logrado reducir tu huella de carbono por debajo de tu objetivo. ¡Genial!`);
    }
    
    // Check device count milestone
    if (devices.length === 5) {
        addNotification('milestone', '🏆 Primer Inventario', 
            `Has registrado 5 dispositivos. ¡Excelente comienzo!`);
        addEcoPoints(25);
    }
    
    // Check 10% reduction
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length >= 2) {
        const recent = history[history.length - 1];
        const previous = history[history.length - 2];
        const reduction = ((previous.co2 - recent.co2) / previous.co2) * 100;
        
        if (reduction >= 10) {
            addNotification('achievement', '📉 ¡Reducción del 10%!', 
                `Has reducido tu huella en un ${reduction.toFixed(1)}% desde la última medición. ¡Increíble!`);
            addEcoPoints(100);
        }
    }
}

// Enhanced achievement display with progress bars
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = achievements.map(ach => {
        const progress = calculateAchievementProgress(ach);
        const progressPercent = Math.min(100, (progress / ach.requirement) * 100);
        
        return `
            <div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-points">+${ach.points}</span>
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.description}</div>
                ${!ach.unlocked ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar">
                            <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="achievement-progress-text">
                            <span>${progress} / ${ach.requirement}</span>
                            <span class="progress-percentage">${progressPercent.toFixed(0)}%</span>
                        </div>
                    </div>
                ` : '<div class="achievement-unlocked-badge">🎉 ¡Desbloqueado!</div>'}
            </div>
        `;
    }).join('');
}

function calculateAchievementProgress(achievement) {
    if (!devices || devices.length === 0) return 0;
    
    const stats = calculateRawStats();
    const totalCo2e = isNaN(stats.totalCo2e) ? 0 : stats.totalCo2e;
    
    switch (achievement.id) {
        case 'first-device': return devices.length >= 1 ? 1 : 0;
        case 'eco-warrior': return devices.length || 0;
        case 'energy-saver': return totalCo2e < 100 ? 1 : 0;
        case 'green-master': return Math.floor(totalCo2e / 10) || 0;
        case 'data-lover': return devices.length >= 20 ? 1 : 0;
        case 'consistent': {
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            return history.filter(h => new Date(h.timestamp) > sevenDaysAgo).length || 0;
        }
        default: return 0;
    }
}

// Initialize sliders with event listeners
const simSliders = [
    { input: 'sim-hours-reduction', display: 'sim-hours-value', format: (v) => `${v} hora${v !== 1 ? 's' : ''} menos/día` },
    { input: 'sim-efficiency', display: 'sim-efficiency-value', format: (v) => `${v}% más eficiente` },
    { input: 'sim-devices-off', display: 'sim-devices-off-value', format: (v) => `${v}% de equipos` }
];

simSliders.forEach(slider => {
    const input = document.getElementById(slider.input);
    const display = document.getElementById(slider.display);
    
    if (input && display) {
        input.addEventListener('input', (e) => {
            display.textContent = slider.format(e.target.value);
            updateSimulator();
        });
    }
});

// ==================== REGION / CARBON INTENSITY ====================

const COUNTRY_NAMES = {
    'ES': 'España', 'FR': 'Francia', 'DE': 'Alemania', 'GB': 'Reino Unido',
    'IT': 'Italia', 'PT': 'Portugal', 'NL': 'Países Bajos', 'BE': 'Bélgica',
    'SE': 'Suecia', 'NO': 'Noruega', 'DK': 'Dinamarca', 'PL': 'Polonia',
    'US': 'Estados Unidos', 'MX': 'México', 'AR': 'Argentina', 'CL': 'Chile',
    'CO': 'Colombia', 'BR': 'Brasil', 'CN': 'China', 'IN': 'India',
    'JP': 'Japón', 'KR': 'Corea del Sur', 'AU': 'Australia', 'NZ': 'Nueva Zelanda',
    'ZA': 'Sudáfrica'
};

const COUNTRY_FLAGS = {
    'ES': '🇪🇸', 'FR': '🇫🇷', 'DE': '🇩🇪', 'GB': '🇬🇧', 'IT': '🇮🇹', 'PT': '🇵🇹',
    'NL': '🇳🇱', 'BE': '🇧🇪', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'PL': '🇵🇱',
    'US': '🇺🇸', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'BR': '🇧🇷',
    'CN': '🇨🇳', 'IN': '🇮🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'ZA': '🇿🇦'
};

async function detectAndLoadRegion() {
    try {
        // Check if region is already stored
        const stored = localStorage.getItem(REGION_KEY);
        if (stored) {
            const regionData = JSON.parse(stored);
            userCountry = regionData.country;
            userRegionName = regionData.name;
            CO2_PER_KWH = regionData.intensity;
            updateRegionDisplay();
            return;
        }
        
        // Try to detect region via geolocation API (free)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
            const countryCode = data.country_code.toUpperCase();
            if (CARBON_INTENSITY_BY_COUNTRY[countryCode]) {
                userCountry = countryCode;
                userRegionName = COUNTRY_NAMES[countryCode] || data.country_name;
                CO2_PER_KWH = CARBON_INTENSITY_BY_COUNTRY[countryCode];
                
                // Save detected region
                localStorage.setItem(REGION_KEY, JSON.stringify({
                    country: userCountry,
                    name: userRegionName,
                    intensity: CO2_PER_KWH
                }));
                
                updateRegionDisplay();
                
                // Show notification
                addNotification('info', '🌍 Región Detectada', 
                    `Hemos detectado tu ubicación en ${userRegionName}. Factor CO₂: ${CO2_PER_KWH} kg/kWh. Puedes cambiarlo en la esquina superior.`);
            }
        }
    } catch (error) {
        console.log('Could not detect region, using default:', error);
        // Use default Spain if detection fails
        userCountry = 'ES';
        userRegionName = 'España';
        CO2_PER_KWH = 0.45;
        updateRegionDisplay();
    }
}

function updateRegionDisplay() {
    if (elements.regionFlag) {
        elements.regionFlag.textContent = COUNTRY_FLAGS[userCountry] || '🌍';
    }
    if (elements.regionName) {
        elements.regionName.textContent = userRegionName;
    }
}

function openRegionModal() {
    if (elements.regionModal) {
        elements.regionModal.classList.add('show');
        // Set current selection
        if (elements.regionSelect) {
            elements.regionSelect.value = userCountry;
            updateRegionPreview();
        }
    }
}

function closeRegionModal() {
    if (elements.regionModal) {
        elements.regionModal.classList.remove('show');
    }
}

function updateRegionPreview() {
    if (!elements.regionSelect) return;
    
    const selectedOption = elements.regionSelect.options[elements.regionSelect.selectedIndex];
    const intensity = parseFloat(selectedOption.dataset.intensity);
    
    // Update scale marker position (0.0 to 1.0 scale)
    if (elements.scaleMarker) {
        const position = (intensity / 1.0) * 100;
        elements.scaleMarker.style.left = `${Math.min(100, position)}%`;
    }
    
    // Update intensity info
    if (elements.intensityInfo) {
        let level = 'baja';
        let emoji = '🟢';
        if (intensity > 0.6) {
            level = 'alta';
            emoji = '🔴';
        } else if (intensity > 0.3) {
            level = 'media';
            emoji = '🟡';
        }
        
        elements.intensityInfo.innerHTML = `
            ${emoji} La región seleccionada tiene una intensidad <strong>${level}</strong> de carbono (${intensity} kg CO₂/kWh).
            ${intensity < 0.2 ? ' ¡Excelente! Usa principalmente energías renovables.' : ''}
            ${intensity > 0.6 ? ' Considera que tus cálculos reflejarán un impacto mayor.' : ''}
        `;
    }
}

function saveRegion() {
    if (!elements.regionSelect) return;
    
    const selectedOption = elements.regionSelect.options[elements.regionSelect.selectedIndex];
    const countryCode = elements.regionSelect.value;
    const intensity = parseFloat(selectedOption.dataset.intensity);
    const countryName = COUNTRY_NAMES[countryCode] || 'Región';
    
    // Update global variables
    userCountry = countryCode;
    userRegionName = countryName;
    const oldIntensity = CO2_PER_KWH;
    CO2_PER_KWH = intensity;
    
    // Save to localStorage
    localStorage.setItem(REGION_KEY, JSON.stringify({
        country: userCountry,
        name: userRegionName,
        intensity: CO2_PER_KWH
    }));
    
    // Update UI
    updateRegionDisplay();
    
    // Recalculate all stats with new intensity
    calculateStats();
    updateAllCharts();
    updateSimulator();
    
    // Show notification
    const change = ((intensity - oldIntensity) / oldIntensity * 100).toFixed(1);
    const changeText = change > 0 ? `+${change}%` : `${change}%`;
    
    showToast('success', `Región actualizada a ${countryName}`);
    addNotification('success', '🌍 Región Actualizada', 
        `Se ha cambiado a ${countryName} (${intensity} kg CO₂/kWh). ${changeText !== '0.0%' ? `Cambio en cálculos: ${changeText}` : ''}`);
    
    // Award points for configuration
    addEcoPoints(10);
    
    closeRegionModal();
}

// ==================== HELP SECTION FUNCTIONALITY ====================
function initHelpSection() {
    // Navegación lateral
    const helpNavLinks = document.querySelectorAll('.help-nav-link');
    helpNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Actualizar enlace activo
                helpNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // FAQ Acordeón
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Cerrar todos los demás
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle actual
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Completar pasos
    const completeStepButtons = document.querySelectorAll('.btn-complete-step');
    completeStepButtons.forEach(button => {
        const stepNumber = button.getAttribute('data-step');
        const isCompleted = localStorage.getItem(`help_step_${stepNumber}`) === 'true';
        
        if (isCompleted) {
            markStepAsCompleted(stepNumber);
        }
        
        button.addEventListener('click', () => {
            if (!button.closest('.help-step').classList.contains('completed')) {
                localStorage.setItem(`help_step_${stepNumber}`, 'true');
                markStepAsCompleted(stepNumber);
                showToast('✓ Paso marcado como completado', 'success');
                updateHelpProgress();
            }
        });
    });

    // Actualizar progreso inicial
    updateHelpProgress();

    // Botón de feedback
    const feedbackBtn = document.getElementById('feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            const message = prompt('💬 Comparte tu feedback sobre JLabEco:');
            if (message && message.trim()) {
                showToast('¡Gracias por tu feedback! 💚', 'success');
                console.log('Feedback:', message);
            }
        });
    }

    // Observer para actualizar navegación según scroll
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                helpNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Observar todas las secciones
    document.querySelectorAll('.help-section').forEach(section => {
        observer.observe(section);
    });
}

function markStepAsCompleted(stepNumber) {
    const helpStep = document.querySelector(`.help-step[data-step="${stepNumber}"]`);
    if (helpStep) {
        helpStep.classList.add('completed');
        const status = helpStep.querySelector('.step-status');
        if (status) {
            status.textContent = 'Completado';
            status.setAttribute('data-status', 'completed');
        }
        const button = helpStep.querySelector('.btn-complete-step');
        if (button) {
            button.textContent = '✓ Completado';
            button.style.cursor = 'default';
        }
    }
}

function updateHelpProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(step => {
        const stepNumber = step.getAttribute('data-step');
        const isCompleted = localStorage.getItem(`help_step_${stepNumber}`) === 'true';
        
        if (isCompleted) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });

    // También verificar progreso basado en datos reales
    const devices = JSON.parse(localStorage.getItem('devices')) || [];
    const userGoal = JSON.parse(localStorage.getItem('userGoal'));
    
    // Verificar paso 2 (dispositivos añadidos)
    if (devices.length > 0) {
        const step2 = document.querySelector('.progress-step[data-step="2"]');
        if (step2) step2.classList.add('completed');
    }
    
    // Verificar paso 3 (meta establecida)
    if (userGoal) {
        const step3 = document.querySelector('.progress-step[data-step="3"]');
        if (step3) step3.classList.add('completed');
    }
}

// ==================== START APP ====================
document.addEventListener('DOMContentLoaded', () => {
    init();
    enhanceChartTooltips();
    updateSimulator();
    checkForMilestones();
    renderAchievements();
    initHelpSection();
});
