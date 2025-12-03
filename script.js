// Storage Key
const STORAGE_KEY = 'jlabeco_devices';

// Initial Data (fallback)
const defaultDevices = [
    { type: 'Servidor', brand: 'Dell', model: 'PowerEdge R740', watts: 350, hours: 720, materialCo2: 20.8, lifespan: 5, location: 'Datacenter' },
    { type: 'Switch', brand: 'HP', model: 'ProCurve 2910', watts: 30, hours: 720, materialCo2: 0.6, lifespan: 5, location: 'Rack 1' },
    { type: 'Router', brand: 'Cisco', model: 'RV340', watts: 25, hours: 720, materialCo2: 0.8, lifespan: 5, location: 'Rack 1' }
];

let devices = [];
let mainChart = null;

// DOM Elements
const form = document.getElementById('quick-add-form');
const tableBody = document.getElementById('devices-table-body');
const deviceCount = document.getElementById('device-count');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Stats Elements
const statConsumption = document.getElementById('stat-consumption');
const statCo2 = document.getElementById('stat-co2');
const statMaterials = document.getElementById('stat-materials');
const totalFootprint = document.getElementById('total-footprint');
const totalYearly = document.getElementById('total-yearly');
const recommendationsList = document.getElementById('recommendations-list');

// Initialize
function init() {
    loadFromStorage();
    renderTable();
    calculateStats();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addDevice();
    });

    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importData);
}

// LocalStorage Functions
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
        console.log('Datos guardados en localStorage');
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            devices = JSON.parse(stored);
            console.log('Datos cargados desde localStorage');
        } else {
            devices = [...defaultDevices];
            saveToStorage();
        }
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        devices = [...defaultDevices];
    }
}

// Export to JSON
function exportData() {
    const dataStr = JSON.stringify(devices, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jlabeco_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import from JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                devices = imported;
                saveToStorage();
                renderTable();
                calculateStats();
                alert(`✅ Se importaron ${devices.length} dispositivos correctamente.`);
            } else {
                alert('❌ Formato de archivo JSON inválido.');
            }
        } catch (error) {
            alert('❌ Error al leer el archivo JSON.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// Add Device
function addDevice() {
    const type = document.getElementById('device-type').value;
    const brand = document.getElementById('device-brand').value;
    const model = document.getElementById('device-model').value;
    const watts = parseFloat(document.getElementById('device-watts').value);
    const hours = parseFloat(document.getElementById('device-hours').value) || 720;
    const materialCo2 = parseFloat(document.getElementById('device-material-co2').value) || 0;
    const lifespan = parseFloat(document.getElementById('device-lifespan').value) || 5;
    const location = document.getElementById('device-location').value || '';

    if (!brand || !model || isNaN(watts)) {
        alert('Por favor completa los campos obligatorios (Marca, Modelo, Consumo).');
        return;
    }

    const newDevice = { type, brand, model, watts, hours, materialCo2, lifespan, location };
    devices.push(newDevice);

    saveToStorage();
    renderTable();
    calculateStats();
    form.reset();
}

// Remove Device
window.removeDevice = (index) => {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
        devices.splice(index, 1);
        saveToStorage();
        renderTable();
        calculateStats();
    }
};

// Render Table
function renderTable() {
    tableBody.innerHTML = '';
    deviceCount.textContent = `${devices.length} dispositivos total`;

    devices.forEach((device, index) => {
        // Calculations per device
        const kwhMonth = (device.watts * device.hours) / 1000;
        const opCo2 = kwhMonth * 0.45; // 0.45 kg CO2/kWh
        const matCo2Month = device.materialCo2 / (device.lifespan * 12);
        const total = opCo2 + matCo2Month;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="device-name">${device.brand} ${device.model}</span>
                <span class="device-sub">${device.type}</span>
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
                <div class="val-primary">${total.toFixed(1)}</div>
                <div class="device-sub">kg CO₂e</div>
            </td>
            <td>
                <button class="btn-delete" onclick="removeDevice(${index})" title="Eliminar">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Calculate Global Stats
function calculateStats() {
    let totalKwh = 0;
    let totalOpCo2 = 0;
    let totalMatCo2 = 0;

    devices.forEach(d => {
        const kwh = (d.watts * d.hours) / 1000;
        totalKwh += kwh;
        totalOpCo2 += kwh * 0.45;
        totalMatCo2 += d.materialCo2 / (d.lifespan * 12);
    });

    const grandTotal = totalOpCo2 + totalMatCo2;
    const yearlyTon = (grandTotal * 12) / 1000;

    // Update DOM
    statConsumption.textContent = totalKwh.toFixed(1);
    statCo2.textContent = totalOpCo2.toFixed(1);
    statMaterials.textContent = totalMatCo2.toFixed(1);

    totalFootprint.textContent = `${grandTotal.toFixed(1)} kg CO₂e`;
    totalYearly.textContent = `≈ ${yearlyTon.toFixed(2)} toneladas CO₂e al año`;

    updateChart(totalOpCo2, totalMatCo2);
    generateRecommendations(devices);
}

// Chart
function updateChart(opCo2, matCo2) {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Huella Operativa', 'Huella Materiales'],
            datasets: [{
                label: 'Emisiones (kg CO₂e)',
                data: [opCo2, matCo2],
                backgroundColor: ['#F97316', '#10B981'],
                borderRadius: 6,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: {
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

// Recommendations
function generateRecommendations(devices) {
    recommendationsList.innerHTML = '';

    if (devices.length === 0) {
        recommendationsList.innerHTML = '<p style="color: var(--text-muted);">Agrega dispositivos para obtener recomendaciones personalizadas.</p>';
        return;
    }

    // Logic: Find highest consumer
    const sorted = [...devices].sort((a, b) => (b.watts * b.hours) - (a.watts * a.hours));
    const top = sorted[0];

    const recs = [];

    if (top) {
        recs.push({
            title: `⚡ Atención con ${top.brand} ${top.model}`,
            text: `Representa tu mayor consumo. Considera programar su apagado automático o reducir horas de uso.`
        });
    }

    recs.push({
        title: "🖥️ Optimización de Servidores",
        text: "Virtualizar servidores puede reducir la huella física y energética hasta un 40%."
    });

    recs.push({
        title: "♻️ Ciclo de Vida Extendido",
        text: "Extender la vida útil de los equipos 2 años más reduce significativamente la huella de materiales."
    });

    recs.push({
        title: "💡 Eficiencia Energética",
        text: "Utiliza equipos certificados Energy Star y ajusta configuraciones de ahorro de energía."
    });

    recs.forEach(r => {
        const div = document.createElement('div');
        div.className = 'rec-item';
        div.innerHTML = `<h4>${r.title}</h4><p>${r.text}</p>`;
        recommendationsList.appendChild(div);
    });
}

// Start
init();
