# RCT – Mina El Descanso (rct-v1.1-el-descanso)

Esta es la **versión 1.1** del sistema digital **Reporte de Cambio de Turno (RCT)** para la mina **El Descanso**.  
Incluye mejoras visuales, mayor estabilidad, optimización en la vista previa tipo reporte oficial y ajustes en las funcionalidades principales.

> Proyecto desarrollado de forma colaborativa por **Alex Ramírez** y **Diego Fuentes**, trabajando juntos en la construcción, mejora continua y evolución del sistema hasta alcanzar la versión final.

---

## 🌐 Demo en línea (GitHub Pages)

Visualiza esta versión directamente aquí:

👉 **https://reportecamionesturno1.github.io/rct-v1.1-el-descanso/**

Repositorio oficial:

👉 **https://github.com/reportecamionesturno1/rct-v1.1-el-descanso**

---

## 📄 Archivos principales de esta versión

- **index.html** (estructura visual del sistema)  
  :contentReference[oaicite:3]{index=3}

- **script.js** (lógica completa del sistema, formularios, preview, historial y exportaciones)  
  :contentReference[oaicite:4]{index=4}

- **style.css** (diseño, variables, modo claro/oscuro, responsive y estilo general)  
  :contentReference[oaicite:5]{index=5}

---

## 🚀 Mejoras en la versión 1.1

### ✔ Vista previa del reporte (Preview RCT) más limpia y profesional
- Estructura tipo formato oficial de Drummond.
- Secciones que aparecen solo si contienen datos.
- Tablas ampliadas y estilos más equilibrados.
- Mejor distribución de columnas y tamaños.

### ✔ Optimización de KPIs
- Cálculo más preciso.
- Actualización en tiempo real.
- Sincronización inmediata con el formulario.

### ✔ Exportaciones refinadas
- PDF
- Impresión directa con diseño optimizado
- JPG (alta resolución)
- Excel con varias hojas
- CSV
- JSON completo

### ✔ Ajustes en:
- Dinámica de tablas (agregar/eliminar filas)
- Historial local (hasta 15 versiones)
- Manejo de pestañas
- Tema claro/oscuro
- Interacción mobile-friendly

---

## 🧾 Funcionalidades principales

- Formulario multipestaña (Encabezado – Equipos – Observaciones – Resumen).
- Tablas dinámicas:
  - Buses por bahía.
  - Equipos varados con ubicación y razón.
- KPIs automáticos:
  - Operativos
  - Down
  - Hallazgos
  - Disponibilidad %
- Exportaciones: PDF, JPG, Excel, CSV, JSON.
- Historial de versiones guardadas.
- Vista previa profesional tipo “formato mina”.

---

## 🧱 Estructura del proyecto

rct-v1.1-el-descanso/
│
├── index.html
├── script.js
├── style.css
├── config.js
└── assets/
├── img/
│ ├── logo-drummond.png
│ └── yo-estoy-con.png
└── lang/
├── es.json
└── en.json


---

## 🛠 Tecnologías utilizadas

- **HTML5 / CSS3 / JavaScript**
- **SheetJS (XLSX)** para exportar a Excel
- **html2canvas** para JPG
- **jsPDF** para documentos PDF
- **Bootstrap (CDN)** para soporte visual
- **LocalStorage API** para historial
- **ES Modules** internos organizados

---

## ▶️ Ejecución en local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/reportecamionesturno1/rct-v1.1-el-descanso.git
   cd rct-v1.1-el-descanso

Abrir index.html en el navegador.

Comenzar a usar, guardar y exportar reportes.

👥 Colaboradores

Este proyecto es creado y mantenido por:

Alex Ramírez

Diego Fuentes

Ambos trabajando de manera colaborativa, constante y orientada a resultados para construir una herramienta sólida y profesional para la operación minera.

Este mismo estilo de colaboración se aplicará para todas las futuras versiones y repositorios asociados al sistema RCT.

🧭 Roadmap hacia la versión 1.2 / 2.0

Cálculo automático de más indicadores.

Modulo de firmas digitales.

Integración con Apps Script (backend) para enviar datos.

Descarga de evidencias e integración de fotos.

Historial en la nube.

Sincronización entre turnos.

⚠️ Nota

Este sistema es un apoyo digital en desarrollo. No sustituye los formatos oficiales de la empresa, pero busca facilitar el proceso de reporte, análisis y soporte operativo del turno.


---
