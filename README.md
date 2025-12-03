# 🍃 JLabEco - Calculadora de Huella de Carbono Tecnológica

<div align="center">

![JLabEco Logo](https://img.shields.io/badge/JLabEco-v1.0.0-10b981?style=for-the-badge&logo=leaf&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Monitorea y reduce tu huella de carbono tecnológica** 🌍💚

[✨ Demo en Vivo](https://deepdevjose.github.io/Calculadora-Ecologica) | [📖 Documentación](#características) | [🐛 Reportar Bug](https://github.com/deepdevjose/Calculadora-Ecologica/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características Principales](#-características-principales)
- [Demostración](#-demostración)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Metodología de Cálculo](#-metodología-de-cálculo)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🌱 Acerca del Proyecto

**JLabEco** es una aplicación web progresiva (PWA) diseñada para ayudar a individuos y organizaciones a **monitorear, analizar y reducir su huella de carbono tecnológica**. 

En la era digital, nuestros dispositivos electrónicos generan emisiones de CO₂ tanto en su fabricación como en su uso diario. JLabEco te permite:

- 📊 **Visualizar** el impacto ambiental de tus dispositivos
- 🎯 **Establecer metas** de reducción de emisiones
- 💡 **Simular escenarios** para optimizar tu consumo
- 🏆 **Gamificación** con logros y puntos ecológicos
- 📈 **Analizar tendencias** con gráficas interactivas

### 🎓 Contexto Académico

Proyecto desarrollado como parte de estudios universitarios, enfocado en sostenibilidad, cálculo de huella de carbono y desarrollo web moderno.

---

## ✨ Características Principales

### 📊 Dashboard Completo
- **Resumen en tiempo real** de tu huella de carbono
- **Estadísticas diarias, semanales y mensuales**
- **Comparativas** con promedios y mejores prácticas
- **Indicadores visuales** de intensidad de carbono por región

### 💻 Gestión de Dispositivos
- **100+ tipos de dispositivos** preconfigurados
- **Cálculo automático** de consumo energético
- **Estimación de huella de fabricación**
- **Filtrado y ordenamiento** avanzado
- **Importación/Exportación** de datos (JSON, CSV, PDF)

### 📈 Visualización de Datos
- **Gráficas interactivas** con Chart.js
- **Distribución por dispositivo** (dona)
- **Historial temporal** (líneas)
- **Consumo por categoría** (barras)
- **Filtros dinámicos** por período y tipo

### 🎯 Simulador de Impacto
- **Proyecciones a 6 meses** de ahorro de CO₂e
- **Escenarios personalizables** de reducción
- **Cálculo de ahorro económico**
- **Aplicación directa** como meta de reducción

### 🏆 Sistema de Gamificación
- **25+ logros desbloqueables**
- **Sistema de puntos ecológicos**
- **5 niveles de progresión** (Novato → Gurú)
- **Retos activos** con recompensas
- **Notificaciones motivacionales**

### 🌍 Configuración Regional
- **25 países preconfigurados**
- **Detección automática** de región por IP
- **Factores de emisión actualizados** por país
- **Comparativa visual** de intensidades de carbono

### ❓ Centro de Ayuda Interactivo
- **Guía paso a paso** para nuevos usuarios
- **Seguimiento de progreso** con checkmarks
- **FAQ con acordeón** colapsable
- **Navegación contextual** fija
- **Palabras clave resaltadas**

### ℹ️ Sección "Acerca de"
- **Fórmulas científicas detalladas**
- **Metodología de cálculo explicada**
- **Ejemplos prácticos** con valores reales
- **Fuentes de datos** y referencias
- **Consideraciones importantes**

### 🔔 Sistema de Notificaciones
- **Alertas en tiempo real** de logros
- **Notificaciones de hitos** alcanzados
- **Consejos personalizados**
- **Centro de notificaciones** organizado

---

## 🎬 Demostración

### 🖼️ Capturas de Pantalla

#### Dashboard Principal
```
📊 Vista general con métricas clave, gráficas y progreso de metas
```

#### Gestión de Dispositivos
```
💻 Lista completa con 100+ tipos de dispositivos y filtros avanzados
```

#### Simulador de Impacto
```
🎯 Proyecciones interactivas con gráficas de ahorro proyectado
```

#### Sistema de Logros
```
🏆 Gamificación con niveles, puntos y retos activos
```

---

## 🚀 Instalación

### Opción 1: Uso Directo (Recomendado)

1. **Clona el repositorio:**
```bash
git clone https://github.com/deepdevjose/Calculadora-Ecologica.git
cd Calculadora-Ecologica
```

2. **Abre en tu navegador:**
```bash
# Simplemente abre index.html en tu navegador
# O usa un servidor local:
python -m http.server 8000
# o
npx serve
```

3. **Accede a:**
```
http://localhost:8000
```

### Opción 2: Deploy en GitHub Pages

El proyecto está configurado para funcionar automáticamente en GitHub Pages:

```bash
# Ya está publicado en:
https://deepdevjose.github.io/Calculadora-Ecologica
```

### Requisitos

- ✅ Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- ✅ JavaScript habilitado
- ✅ Conexión a internet (solo para detección automática de región)

---

## 📖 Uso

### Inicio Rápido

1. **Configura tu región:**
   - Haz clic en el botón 🌍 en la parte superior
   - Selecciona tu país (o déjalo detectar automáticamente)
   - Guarda los cambios

2. **Agrega tus dispositivos:**
   - Ve a la sección **💻 Dispositivos**
   - Haz clic en **"+ Agregar Dispositivo"**
   - Completa el formulario:
     - Nombre (ej: "Laptop Trabajo")
     - Tipo (selecciona de 100+ opciones)
     - Marca y Modelo
     - Consumo en Watts (autocompletado)
     - Horas de uso diario
   - Guarda el dispositivo

3. **Monitorea tu huella:**
   - Regresa al **📊 Resumen**
   - Observa tus estadísticas en tiempo real
   - Revisa las gráficas de distribución
   - Compara con promedios y mejores prácticas

4. **Establece una meta:**
   - Haz clic en **"🎯 Configurar Meta"**
   - Define tu objetivo de reducción
   - Monitorea tu progreso

5. **Usa el simulador:**
   - Ve a **🎯 Simulador**
   - Ajusta los parámetros de reducción
   - Visualiza el ahorro proyectado
   - Aplica como meta si te convence

### Funciones Avanzadas

#### Exportar Datos
- **JSON**: Respaldo completo de tus datos
- **CSV**: Para análisis en Excel/Sheets
- **PDF**: Reporte imprimible

#### Importar Datos
- Carga un archivo JSON previamente exportado
- Útil para migrar entre dispositivos

#### Filtros y Ordenamiento
- Filtra dispositivos por tipo
- Ordena por consumo, fecha, nombre
- Búsqueda en tiempo real

---

## 🧮 Metodología de Cálculo

### 1️⃣ Huella Operativa (Consumo Eléctrico)

```
Huella Operativa (kg CO₂e) = Consumo (kWh) × Factor de emisión (kg CO₂e/kWh)

Donde:
  Consumo (kWh) = Potencia (W) × Horas de uso mensual ÷ 1000
  Factor de emisión = Variable por país (0.01 - 0.95 kg CO₂e/kWh)
```

**Ejemplo:**
- Laptop 65W, 8h/día, México (0.48 kg CO₂e/kWh)
- Consumo = 65 × 240 ÷ 1000 = **15.6 kWh/mes**
- Huella = 15.6 × 0.48 = **7.49 kg CO₂e/mes**

### 2️⃣ Huella de Materiales (Fabricación)

```
Huella de Materiales (kg CO₂e/mes) = Huella total de fabricación ÷ Vida útil (meses)

Valores estimados:
  - Laptop: ~200 kg CO₂e
  - Smartphone: ~80 kg CO₂e
  - Router: ~45.5 kg CO₂e
  - Monitor: ~150 kg CO₂e
  - Servidor: ~1000 kg CO₂e
```

**Ejemplo:**
- Laptop con vida útil de 4 años (48 meses)
- Huella = 200 ÷ 48 = **4.17 kg CO₂e/mes**

### 3️⃣ Huella Total

```
Huella Total = Huella Operativa + Huella de Materiales
```

**Ejemplo completo:**
- Operativa: 7.49 kg CO₂e/mes
- Materiales: 4.17 kg CO₂e/mes
- **Total: 11.66 kg CO₂e/mes** (139.92 kg CO₂e/año)

### 📚 Fuentes

- Factores de emisión: **IEA** (International Energy Agency)
- Huella de fabricación: **EPA**, estudios ACV
- Consumo de dispositivos: Especificaciones de fabricantes
- Estándar: **GHG Protocol**, **ISO 14040**

---

## 🛠️ Tecnologías

<div align="center">

| Tecnología | Uso | Versión |
|------------|-----|---------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | Estructura | HTML5 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | Estilos | CSS3 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | Lógica | ES6+ |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white) | Gráficas | 4.x |
| ![LocalStorage](https://img.shields.io/badge/LocalStorage-000000?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bS0yIDE1bC01LTUgMS40MS0xLjQxTDEwIDE0LjE3bDcuNTktNy41OUwxOSA4bC05IDl6Ii8+PC9zdmc+) | Persistencia | Web API |
| ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white) | App Progressive | Manifest |

</div>

### Características Técnicas

- ✅ **Vanilla JavaScript** (sin frameworks)
- ✅ **Responsive Design** (mobile-first)
- ✅ **PWA Ready** (instalable)
- ✅ **LocalStorage** (datos persistentes)
- ✅ **No Backend** requerido
- ✅ **Offline-first** (funciona sin internet)
- ✅ **Chart.js** para visualizaciones
- ✅ **CSS Variables** para temas
- ✅ **Semantic HTML5**
- ✅ **Accesibilidad** (ARIA labels)

---

## 📁 Estructura del Proyecto

```
Calculadora-Ecologica/
├── index.html           # Página principal con todas las secciones
├── style.css            # Estilos completos (3200+ líneas)
├── script.js            # Lógica de la aplicación (2300+ líneas)
├── manifest.json        # Configuración PWA
├── LICENSE             # Licencia MIT
└── README.md           # Este archivo
```

### Componentes Principales

```javascript
// script.js - Estructura modular
├── Data Management
│   ├── localStorage handling
│   ├── Import/Export (JSON, CSV, PDF)
│   └── Region detection (ipapi.co)
├── Calculations
│   ├── Carbon footprint (operational + materials)
│   ├── Statistics (daily, weekly, monthly)
│   └── Projections (6-month simulator)
├── UI Components
│   ├── Dashboard cards & charts
│   ├── Device management
│   ├── Charts (Chart.js integration)
│   ├── Simulator interface
│   ├── Achievements & gamification
│   ├── Help center (interactive)
│   ├── About section (formulas)
│   └── Notifications center
└── Event Handlers
    ├── Form submissions
    ├── Tab navigation
    ├── Modal controls
    ├── Filter & sort
    └── Real-time updates
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas y apreciadas. Si deseas mejorar JLabEco:

### Proceso de Contribución

1. **Fork el proyecto**
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit tus cambios** (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Ideas para Contribuir

- 🌍 Agregar más países y factores de emisión
- 📱 Mejorar responsive design
- ♿ Mejorar accesibilidad
- 🎨 Nuevos temas visuales
- 📊 Más tipos de gráficas
- 🔧 Optimizaciones de rendimiento
- 🌐 Traducciones a otros idiomas
- 📚 Mejorar documentación
- 🐛 Reportar y corregir bugs

### Directrices

- ✅ Código limpio y comentado
- ✅ Seguir el estilo existente
- ✅ Probar en múltiples navegadores
- ✅ Actualizar README si es necesario

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**. Ver `LICENSE` para más información.

```
MIT License - Copyright (c) 2025 José Luis López Hernández

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

## 👤 Contacto

**José Luis López Hernández** - [@deepdevjose](https://github.com/deepdevjose)

🔗 **Link del Proyecto:** [https://github.com/deepdevjose/Calculadora-Ecologica](https://github.com/deepdevjose/Calculadora-Ecologica)

🌐 **Demo en Vivo:** [https://deepdevjose.github.io/Calculadora-Ecologica](https://deepdevjose.github.io/Calculadora-Ecologica)

---

## 🙏 Agradecimientos

- [Chart.js](https://www.chartjs.org/) - Librería de gráficas
- [IEA](https://www.iea.org/) - Datos de factores de emisión
- [EPA](https://www.epa.gov/) - Estudios de huella de carbono
- [ipapi.co](https://ipapi.co/) - Detección de región
- [Font Awesome](https://fontawesome.com/) - Íconos (emojis nativos usados)
- [Google Fonts](https://fonts.google.com/) - Fuente Inter

---

## 📊 Estadísticas del Proyecto

![GitHub repo size](https://img.shields.io/github/repo-size/deepdevjose/Calculadora-Ecologica?style=flat-square)
![GitHub language count](https://img.shields.io/github/languages/count/deepdevjose/Calculadora-Ecologica?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/deepdevjose/Calculadora-Ecologica?style=flat-square)

---

<div align="center">

### 🌍 Hecho con 💚 para un planeta más sostenible

**[⬆ Volver arriba](#-jlabeco---calculadora-de-huella-de-carbono-tecnológica)**

</div>
