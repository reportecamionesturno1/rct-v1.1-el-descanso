/********************************************************************
 * RCT – Mina El Descanso
 * script.js – PARTE 1/5
 * 
 * En este archivo controlo:
 *  - Estado global del reporte (formulario + tablas dinámicas)
 *  - Lectura y escritura en localStorage (historial)
 *  - Funciones base para KPIs y preview dinámico
 * 
 * NOTA:
 *  Este es solo el INICIO del archivo. Debes unir las PARTES 1/5 a 5/5
 *  en un solo script.js.
 ********************************************************************/

"use strict";

/* ============================================================
   CONSTANTES GLOBALES
============================================================ */

const RCT_STORAGE_KEY = "rct_history_v3"; // Historial de reportes
const RCT_MAX_HISTORY = window.RCT?.maxHistory || 15;

/** Estado actual en memoria del reporte */
let RCT_STATE = {
  header: {
    fecha: "",
    grupo: "",
    turno: "day",
    supervisores: "",
    responsable: "",
    camiones_x_operador: 0,
    equipos_taller: 0,
  },
  indicadores: {
    operativos_camiones: 0,
    down_camiones: 0,
    equipos_livianos: 0,
    equipos_livianos_down: 0,
  },
  tablas: {
    buses: [],    // { bahia, hora }
    equipos: [],  // { equipo, ubicacion, razon }
  },
  observaciones: "",
  meta: {
    createdAt: null,
    updatedAt: null,
  },
};

/** Historial en memoria (además de localStorage) */
let RCT_HISTORY = [];

/* ============================================================
   HELPERS GENERALES
============================================================ */

/**
 * Convierte un valor a número, devolviendo 0 si no es válido.
 */
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Devuelve el texto limpio (string) de un input.
 */
function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return (el.value || "").trim();
}

/**
 * Devuelve el valor numérico (number) de un input.
 */
function getNumber(id) {
  return toNumber(getValue(id));
}

/**
 * Rellena un input (texto) de forma segura.
 */
function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value ?? "";
}

/**
 * Rellena un input numérico de forma segura.
 */
function setNumber(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = toNumber(value);
}

/* ============================================================
   LECTURA DEL DOM → ESTADO (FORM + TABLAS)
============================================================ */

/**
 * Lee el formulario y las tablas dinámicas y construye un objeto
 * de estado completo para este reporte.
 */
function collectStateFromDOM() {
  const header = {
    fecha: getValue("fecha"),
    grupo: getValue("grupo"),
    turno: getValue("turno") || "day",
    supervisores: getValue("supervisores"),
    responsable: getValue("responsable"),
    camiones_x_operador: getNumber("camiones_x_operador"),
    equipos_taller: getNumber("equipos_taller"),
  };

  const indicadores = {
    operativos_camiones: getNumber("operativos_camiones"),
    down_camiones: getNumber("down_camiones"),
    equipos_livianos: getNumber("equipos_livianos"),
    equipos_livianos_down: getNumber("equipos_livianos_down"),
  };

  // === Tabla de buses ===
  const buses = [];
  const busesTableBody = document.querySelector("#tablaBuses tbody");
  if (busesTableBody) {
    busesTableBody.querySelectorAll("tr").forEach((row) => {
      const bahia = (row.children[0]?.innerText || "").trim();
      const hora = (row.children[1]?.innerText || "").trim();
      if (bahia || hora) {
        buses.push({ bahia, hora });
      }
    });
  }

  // === Tabla de equipos varados ===
  const equipos = [];
  const equiposTableBody = document.querySelector("#tablaEquipos tbody");
  if (equiposTableBody) {
    equiposTableBody.querySelectorAll("tr").forEach((row) => {
      const equipo = (row.children[0]?.innerText || "").trim();
      const ubicacion = (row.children[1]?.innerText || "").trim();
      const razon = (row.children[2]?.innerText || "").trim();
      if (equipo || ubicacion || razon) {
        equipos.push({ equipo, ubicacion, razon });
      }
    });
  }

  const observaciones = getValue("observaciones");

  const now = new Date().toISOString();

  const state = {
    header,
    indicadores,
    tablas: { buses, equipos },
    observaciones,
    meta: {
      createdAt: RCT_STATE.meta.createdAt || now,
      updatedAt: now,
    },
  };

  // Actualizo la variable global
  RCT_STATE = state;
  return state;
}

/* ============================================================
   ESCRITURA DEL ESTADO → DOM
============================================================ */

/**
 * Aplica un estado guardado al DOM (form + tablas).
 */
function applyStateToDOM(state) {
  if (!state) return;

  const { header, indicadores, tablas, observaciones, meta } = state;

  // HEADER
  setValue("fecha", header?.fecha || "");
  setValue("grupo", header?.grupo || "");
  setValue("turno", header?.turno || "day");
  setValue("supervisores", header?.supervisores || "");
  setValue("responsable", header?.responsable || "");
  setNumber("camiones_x_operador", header?.camiones_x_operador || 0);
  setNumber("equipos_taller", header?.equipos_taller || 0);

  // INDICADORES
  setNumber("operativos_camiones", indicadores?.operativos_camiones || 0);
  setNumber("down_camiones", indicadores?.down_camiones || 0);
  setNumber("equipos_livianos", indicadores?.equipos_livianos || 0);
  setNumber("equipos_livianos_down", indicadores?.equipos_livianos_down || 0);

  // TABLA BUSES
  const busesBody = document.querySelector("#tablaBuses tbody");
  if (busesBody) {
    busesBody.innerHTML = "";
    (tablas?.buses || []).forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.bahia || ""}</td>
        <td>${b.hora || ""}</td>
        <td><button type="button" class="btn-delete-row">✕</button></td>
      `;
      busesBody.appendChild(tr);
    });
  }

  // TABLA EQUIPOS
  const equiposBody = document.querySelector("#tablaEquipos tbody");
  if (equiposBody) {
    equiposBody.innerHTML = "";
    (tablas?.equipos || []).forEach((e) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${e.equipo || ""}</td>
        <td>${e.ubicacion || ""}</td>
        <td>${e.razon || ""}</td>
        <td><button type="button" class="btn-delete-row">✕</button></td>
      `;
      equiposBody.appendChild(tr);
    });
  }

  // OBSERVACIONES
  const obsEl = document.getElementById("observaciones");
  if (obsEl) obsEl.value = observaciones || "";

  // Actualizo estado global y KPIs + Preview
  RCT_STATE = state;
  updateKpisFromState(RCT_STATE);
  renderPreview(RCT_STATE);
}

/* ============================================================
   KPIs – CÁLCULO Y ACTUALIZACIÓN
   (Operativos, Down, Hallazgos, Disponibilidad)
============================================================ */

/**
 * Calcula KPIs a partir del estado completo.
 * Devuelve un objeto { operativos, down, hallazgos, disponibilidad }
 */
function computeKpis(state) {
  if (!state) state = collectStateFromDOM();

  const ind = state.indicadores || {};
  const tablas = state.tablas || {};

  const operativos = toNumber(ind.operativos_camiones);
  const down = toNumber(ind.down_camiones);
  const totalCamiones = operativos + down;

  // Hallazgos: por ahora asociamos cada equipo varado como un hallazgo.
  const hallazgos = (tablas.equipos || []).length;

  let disponibilidad = 0;
  if (totalCamiones > 0) {
    disponibilidad = (operativos / totalCamiones) * 100;
  }

  return {
    operativos,
    down,
    hallazgos,
    disponibilidad: disponibilidad,
  };
}

/**
 * Actualiza los KPI en las tarjetas superiores a partir del estado.
 */
function updateKpisFromState(state) {
  const kpis = computeKpis(state);

  const elOp = document.getElementById("cardOperativos");
  const elDown = document.getElementById("cardDown");
  const elHall = document.getElementById("cardHallazgos");
  const elDisp = document.getElementById("cardDisp");

  if (elOp) elOp.textContent = kpis.operativos.toString();
  if (elDown) elDown.textContent = kpis.down.toString();
  if (elHall) elHall.textContent = kpis.hallazgos.toString();
  if (elDisp) elDisp.textContent = kpis.disponibilidad.toFixed(1);
}

/* ============================================================
   HISTORIAL – LECTURA Y ESCRITURA EN LOCALSTORAGE
============================================================ */

/**
 * Carga el historial desde localStorage a memoria.
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(RCT_STORAGE_KEY);
    if (!raw) {
      RCT_HISTORY = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      RCT_HISTORY = parsed;
    } else {
      RCT_HISTORY = [];
    }
  } catch (err) {
    console.error("Error leyendo historial:", err);
    RCT_HISTORY = [];
  }
}

/**
 * Guarda el historial completo en localStorage.
 */
function saveHistory() {
  try {
    const limited = RCT_HISTORY.slice(-RCT_MAX_HISTORY);
    localStorage.setItem(RCT_STORAGE_KEY, JSON.stringify(limited));
  } catch (err) {
    console.error("Error guardando historial:", err);
  }
}

/**
 * Agrega el estado actual al historial.
 */
function pushCurrentStateToHistory() {
  const state = collectStateFromDOM();
  const entry = {
    id: state.meta.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    state,
  };

  RCT_HISTORY.push(entry);
  // Mantener solo los últimos N
  if (RCT_HISTORY.length > RCT_MAX_HISTORY) {
    RCT_HISTORY = RCT_HISTORY.slice(-RCT_MAX_HISTORY);
  }

  saveHistory();
  return entry;
}

/* ============================================================
   NOTA:
   - En la PARTE 2/5 añadiremos:
     • Manejo de pestañas
     • Manejo de filas dinámicas (buses y equipos)
     • Botones de agregar/eliminar filas
   - En la PARTE 3/5 añadiremos:
     • renderPreview(state) COMPLETO (formato tipo Excel dinámico)
   - En la PARTE 4/5:
     • Exportar a PDF/JPG/Excel/CSV/JSON
   - En la PARTE 5/5:
     • Eventos DOMContentLoaded
     • Manejo de modal de historial
****************************************************************/
// ================================================================
/* ============================================================
   MANEJO DE PESTAÑAS (TABS)
============================================================ */

/**
 * Inicializa el comportamiento de las pestañas.
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      if (!targetId) return;

      // Quitar activo de todos los botones
      tabButtons.forEach((b) => b.classList.remove("active"));
      // Poner activo al actual
      btn.classList.add("active");

      // Mostrar/ocultar paneles
      tabPanels.forEach((panel) => {
        if (panel.id === targetId) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });
}

/* ============================================================
   FILAS DINÁMICAS – BUSES
============================================================ */

/**
 * Agrega una fila a la tabla de buses usando los inputs.
 */
function addBusRow() {
  const bahia = getValue("busBahia");
  const hora = getValue("busHora");

  if (!bahia && !hora) {
    alert("Por favor llena al menos Bahía u Hora para agregar un bus.");
    return;
  }

  const tbody = document.querySelector("#tablaBuses tbody");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${bahia}</td>
    <td>${hora}</td>
    <td><button type="button" class="btn-delete-row">✕</button></td>
  `;
  tbody.appendChild(tr);

  // Limpio inputs
  setValue("busBahia", "");
  setValue("busHora", "");

  // Actualizo estado, KPI y preview
  collectStateFromDOM();
  updateKpisFromState(RCT_STATE);
  renderPreview(RCT_STATE);
}

/* ============================================================
   FILAS DINÁMICAS – EQUIPOS VARADOS
============================================================ */

/**
 * Agrega una fila a la tabla de equipos varados.
 */
function addEquipoRow() {
  const equipo = getValue("equipoCamion");
  const ubicacion = getValue("equipoUbicacion");
  const razon = getValue("equipoRazon");

  if (!equipo && !ubicacion && !razon) {
    alert("Por favor llena al menos un campo para agregar un equipo.");
    return;
  }

  const tbody = document.querySelector("#tablaEquipos tbody");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${equipo}</td>
    <td>${ubicacion}</td>
    <td>${razon}</td>
    <td><button type="button" class="btn-delete-row">✕</button></td>
  `;
  tbody.appendChild(tr);

  // Limpio inputs
  setValue("equipoCamion", "");
  setValue("equipoUbicacion", "");
  setValue("equipoRazon", "");

  // Actualizo estado, KPI y preview
  collectStateFromDOM();
  updateKpisFromState(RCT_STATE);
  renderPreview(RCT_STATE);
}

/* ============================================================
   ELIMINAR FILAS – DELEGACIÓN DE EVENTOS
============================================================ */

/**
 * Inicializa la delegación para los botones de eliminar fila en
 * las tablas de buses y equipos.
 */
function initDynamicTablesDeletion() {
  document.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains("btn-delete-row")) {
      const tr = target.closest("tr");
      if (tr && tr.parentElement) {
        tr.parentElement.removeChild(tr);

        // Actualizamos estado, KPI y preview
        collectStateFromDOM();
        updateKpisFromState(RCT_STATE);
        renderPreview(RCT_STATE);
      }
    }
  });
}

/* ============================================================
   REACCIONAR A CAMBIOS EN LOS CAMPOS NUMÉRICOS / TEXTO
   PARA ACTUALIZAR KPIs Y PREVIEW EN TIEMPO REAL
============================================================ */

function initRealtimeFormListeners() {
  const inputsToWatch = [
    "fecha",
    "grupo",
    "turno",
    "supervisores",
    "responsable",
    "camiones_x_operador",
    "equipos_taller",
    "operativos_camiones",
    "down_camiones",
    "equipos_livianos",
    "equipos_livianos_down",
    "observaciones",
  ];

  inputsToWatch.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("change", () => {
      collectStateFromDOM();
      updateKpisFromState(RCT_STATE);
      renderPreview(RCT_STATE);
    });

    // Para que también responda a escritura continua en algunos campos
    el.addEventListener("input", () => {
      collectStateFromDOM();
      updateKpisFromState(RCT_STATE);
      renderPreview(RCT_STATE);
    });
  });
}

/* ============================================================
   INICIALIZACIÓN PARCIAL (PARTE 2/5)
   (Lo completamos en PARTE 5/5 con DOMContentLoaded)
============================================================ */

/**
 * Esta función se llamará en DOMContentLoaded (Parte 5/5),
 * junto a otras inicializaciones.
 */
function initDynamicParts() {
  // Tabs
  initTabs();

  // Botones de agregar filas
  const btnAddBus = document.getElementById("btnAddBus");
  if (btnAddBus) btnAddBus.addEventListener("click", addBusRow);

  const btnAddEquipo = document.getElementById("btnAddEquipo");
  if (btnAddEquipo) btnAddEquipo.addEventListener("click", addEquipoRow);

  // Eliminar filas
  initDynamicTablesDeletion();

  // Listeners en campos del formulario
  initRealtimeFormListeners();
}

/* ============================================================
   NOTA:
   - En la PARTE 3/5 definiremos la función:
       renderPreview(state)
     con TODO el formato tipo Excel, secciones dinámicas
     (solo aparecen si tienen datos) y 1 hoja horizontal.
============================================================ */
// ================================================================
/* ============================================================
   INTERNACIONALIZACIÓN (i18n) BÁSICA
============================================================ */

/* ============================================================
   PREVIEW DINÁMICO – FORMATO RCT (M3)
   - Una sola hoja
   - Estilo moderno
   - Secciones solo si tienen datos
============================================================ */

function renderPreview(state) {
  // Si no recibo estado, lo recojo del DOM
  if (!state) {
    state = collectStateFromDOM();
  }

  const { header, indicadores, tablas, observaciones } = state;

  const fecha = header?.fecha || "";
  const turnoRaw = header?.turno || "day";
  const turno = turnoRaw === "day" ? "DÍA" : "NOCHE";
  const supervisores = header?.supervisores || "";
  const responsable = header?.responsable || "";
  const grupo = header?.grupo || "";

  const camionesXOperador = header?.camiones_x_operador || 0;
  const equiposTaller = header?.equipos_taller || 0;

  const operativosCam = indicadores?.operativos_camiones || 0;
  const downCam = indicadores?.down_camiones || 0;
  const totalCamiones = operativosCam + downCam;

  const totalLivianos = indicadores?.equipos_livianos || 0;
  const downLivianos = indicadores?.equipos_livianos_down || 0;
  const operativosLivianos = totalLivianos - downLivianos;

  const kpis = computeKpis(state); // Ya calcula operativos, down, hallazgos y disponibilidad

  const buses = tablas?.buses || [];
  const equipos = tablas?.equipos || [];

  const hasBuses = buses.length > 0;
  const hasEquipos = equipos.length > 0;
  const hasObs = !!(observaciones && observaciones.trim().length > 0);

  // ==========================
  // 1. CSS EXCLUSIVO DEL REPORTE
  // ==========================
  const css = `
    <style>
      #previewReport {
        font-family: Arial, Helvetica, sans-serif;
        color: #222;
        -webkit-print-color-adjust: exact !important;
      }

      .rct-report {
        width: 100%;
        background: #ffffff;
        padding: 8px;
        box-sizing: border-box;
        font-size: 11px;
      }

      .rct-report table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-bottom: 6px;
      }

      .rct-report th,
      .rct-report td {
        border: 1px solid #444;
        padding: 3px 4px;
        vertical-align: top;
        word-wrap: break-word;
      }

      .rct-report th {
        background: #e8e8e8;
        font-weight: bold;
        text-align: center;
      }

      .rct-header-table td {
        border: none;
      }

      .rct-header-table .logo-left img {
        width: 90px;
        height: auto;
      }

      .rct-header-table .logo-right img {
        width: 80px;
        height: auto;
      }

      .rct-header-table .title-cell {
        text-align: center;
        font-weight: bold;
        vertical-align: middle;
      }

      .rct-header-table .title-main {
        font-size: 18px;
        margin: 0;
      }

      .rct-header-table .title-sub {
        font-size: 13px;
        margin: 0;
        font-weight: normal;
      }

      .rct-subheader-row td {
        background: #f4f4f4;
        font-weight: bold;
        border: 1px solid #444;
      }

      .rct-section-title {
        background: #dcdcdc;
        text-align: center;
        font-weight: bold;
      }

      .rct-no-border td {
        border: none !important;
      }

      .rct-kpi-table th,
      .rct-kpi-table td {
        font-size: 10px;
      }

      @media print {
        @page {
          size: A4 landscape;
          margin: 8mm;
        }
        #previewReport .rct-report {
          zoom: 0.9;
        }
      }
    </style>
  `;

  // ==========================
  // 2. SECCIONES DINÁMICAS
  // ==========================

  // 2.1 – ENCABEZADO CON LOGOS
  const headerHTML = `
    <table class="rct-header-table">
      <tr>
        <td class="logo-left" style="width: 20%;">
          <img src="assets/img/logo-drummond.png" alt="Drummond" />
        </td>
        <td class="title-cell" style="width: 60%;">
          <p class="title-main">REPORTE CAMBIO DE TURNO</p>
          <p class="title-sub">MINA EL DESCANSO</p>
        </td>
        <td class="logo-right" style="width: 20%; text-align:right;">
          <img src="assets/img/yo-estoy-con.png" alt="Yo estoy con Drummond" />
        </td>
      </tr>

      <tr class="rct-subheader-row">
        <td><b>FECHA:</b> ${fecha}</td>
        <td><b>TURNO:</b> ${turno}${grupo ? " – Grupo " + grupo : ""}</td>
        <td><b>SUPERVISORES:</b> ${supervisores}</td>
      </tr>

      <tr class="rct-subheader-row">
        <td><b>RESPONSABLE RCT:</b> ${responsable}</td>
        <td colspan="2"><b>CAMIONES X OPERADOR (1ra hr):</b> ${camionesXOperador}</td>
      </tr>
    </table>
  `;

  // 2.2 – PRODUCTIVIDAD / INDICADORES (bloque tipo resumen)
  const indicadoresHTML = `
    <table class="rct-kpi-table">
      <tr>
        <th colspan="4" class="rct-section-title">PRODUCTIVIDAD / INDICADORES</th>
      </tr>
      <tr>
        <td><b>Camiones operativos:</b> ${operativosCam}</td>
        <td><b>Camiones DOWN:</b> ${downCam}</td>
        <td><b>Total camiones:</b> ${totalCamiones}</td>
        <td><b>Disponibilidad:</b> ${kpis.disponibilidad.toFixed(1)} %</td>
      </tr>
      <tr>
        <td><b>Equipos livianos total:</b> ${totalLivianos}</td>
        <td><b>Livianos DOWN:</b> ${downLivianos}</td>
        <td><b>Livianos operativos:</b> ${operativosLivianos}</td>
        <td><b>Equipos en taller:</b> ${equiposTaller}</td>
      </tr>
      <tr>
        <td colspan="4"><b>N° hallazgos (asociados a equipos varados):</b> ${kpis.hallazgos}</td>
      </tr>
    </table>
  `;

  // 2.3 – BUSES (solo si hay datos)
  let busesHTML = "";
  if (hasBuses) {
    const rows = buses
      .map((b) => {
        return `
          <tr>
            <td>${b.bahia || ""}</td>
            <td>${b.hora || ""}</td>
          </tr>
        `;
      })
      .join("");

    busesHTML = `
      <table>
        <tr>
          <th colspan="2" class="rct-section-title">HORA LLEGADA BUSES A BAHÍAS</th>
        </tr>
        <tr>
          <th>Bahía</th>
          <th>Hora</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  // 2.4 – EQUIPOS VARADOS (solo si hay datos)
  let equiposHTML = "";
  if (hasEquipos) {
    const rows = equipos
      .map((e) => {
        return `
          <tr>
            <td>${e.equipo || ""}</td>
            <td>${e.ubicacion || ""}</td>
            <td>${e.razon || ""}</td>
          </tr>
        `;
      })
      .join("");

    equiposHTML = `
      <table>
        <tr>
          <th colspan="3" class="rct-section-title">EQUIPOS VARADOS EN CAMPO</th>
        </tr>
        <tr>
          <th>Camión / Equipo</th>
          <th>Ubicación</th>
          <th>Razón</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  // 2.5 – OBSERVACIONES / COMENTARIOS (solo si hay texto)
  let obsHTML = "";
  if (hasObs) {
    obsHTML = `
      <table>
        <tr>
          <th class="rct-section-title">OBSERVACIONES / COMENTARIOS</th>
        </tr>
        <tr>
          <td>${(observaciones || "").replace(/\n/g, "<br>")}</td>
        </tr>
      </table>
    `;
  }

  // 2.6 – (Opcional) Podríamos agregar aquí más secciones
  //       como "SEGURIDAD", "INCIDENTES", etc., cuando se
  //       creen los campos específicos en el formulario.

  // ==========================
  // 3. ENSAMBLAR TODO
  // ==========================
  const finalHTML = `
    ${css}
    <div class="rct-report">
      ${headerHTML}
      ${indicadoresHTML}
      ${busesHTML}
      ${equiposHTML}
      ${obsHTML}
    </div>
  `;

  const container = document.getElementById("previewReport");
  if (container) {
    container.innerHTML = finalHTML;
  }
}
// ================================================================
/* ============================================================
   INICIALIZACIÓN GENERAL (PARTE 5/5)
============================================================ */
/* ============================================================
   EXPORTACIONES: PRINT, PDF, JPG, EXCEL, CSV, JSON
============================================================ */

/**
 * Obtiene un nombre base de archivo usando la fecha del reporte.
 */
function getReportFileNameBase() {
  const state = collectStateFromDOM();
  const fecha = state.header?.fecha || "";
  if (!fecha) return "RCT_Mina_El_Descanso";

  // fecha viene en formato YYYY-MM-DD
  return `RCT_Mina_El_Descanso_${fecha}`;
}

/**
 * Verifica que exista contenido en el preview.
 */
function ensurePreviewHasContent() {
  const preview = document.getElementById("previewReport");
  if (!preview) {
    alert("No se encontró el contenedor de previsualización.");
    return false;
  }
  if (!preview.innerHTML || preview.innerHTML.trim().length === 0) {
    // Intento reconstruir preview
    renderPreview();
  }
  if (!preview.innerHTML || preview.innerHTML.trim().length === 0) {
    alert("El reporte aún no tiene información suficiente para previsualizar.");
    return false;
  }
  return true;
}

/* ============================================================
   IMPRIMIR / PDF – ABRIR SOLO EL REPORTE EN OTRA VENTANA
============================================================ */

/**
 * Abre una ventana nueva con solo el contenido del preview
 * y lanza el diálogo de impresión.
 */
function openPrintWindow() {
  if (!ensurePreviewHasContent()) return;

  const preview = document.getElementById("previewReport");
  const win = window.open("", "_blank", "width=1200,height=800");

  if (!win) {
    alert("El navegador bloqueó la ventana de impresión. Permite popups para continuar.");
    return;
  }

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>Reporte RCT – Impresión</title>
        <meta charset="UTF-8" />
      </head>
      <body>
        ${preview.innerHTML}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        <\/script>
      </body>
    </html>
  `);
  win.document.close();
}

/**
 * Maneja el botón de imprimir (Impresora).
 */
function handlePrint() {
  openPrintWindow();
}

/**
 * Maneja el botón de PDF.
 * Técnicamente se apoya en el mismo flujo de impresión,
 * y el usuario elige "Guardar como PDF" en el cuadro de diálogo.
 */
function handlePDF() {
  openPrintWindow();
}

/* ============================================================
   EXPORTAR JPG – usando html2canvas sobre el preview
============================================================ */

function handleJPG() {
  if (!ensurePreviewHasContent()) return;

  const preview = document.getElementById("previewReport");

  html2canvas(preview, { scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    const baseName = getReportFileNameBase();
    link.download = `${baseName}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  }).catch((err) => {
    console.error("Error al generar JPG:", err);
    alert("Ocurrió un error al generar la imagen JPG.");
  });
}

/* ============================================================
   EXPORTAR EXCEL – usando SheetJS (XLSX)
============================================================ */

function handleExcel() {
  const state = collectStateFromDOM();
  const baseName = getReportFileNameBase();

  // Construyo un libro con varias secciones básicas
  const wb = XLSX.utils.book_new();

  // Hoja 1 – Encabezado + Indicadores
  const headerSheetData = [
    ["REPORTE CAMBIO DE TURNO – MINA EL DESCANSO"],
    [],
    ["Fecha", state.header.fecha],
    ["Turno", state.header.turno === "day" ? "DÍA" : "NOCHE"],
    ["Grupo", state.header.grupo],
    ["Supervisores", state.header.supervisores],
    ["Responsable RCT", state.header.responsable],
    ["Camiones x operador (1ra hr)", state.header.camiones_x_operador],
    ["Equipos en taller", state.header.equipos_taller],
    [],
    ["Camiones operativos", state.indicadores.operativos_camiones],
    ["Camiones DOWN", state.indicadores.down_camiones],
    ["Equipos livianos", state.indicadores.equipos_livianos],
    ["Equipos livianos DOWN", state.indicadores.equipos_livianos_down],
  ];

  const wsHeader = XLSX.utils.aoa_to_sheet(headerSheetData);
  XLSX.utils.book_append_sheet(wb, wsHeader, "Resumen");

  // Hoja 2 – Buses
  if (state.tablas.buses && state.tablas.buses.length > 0) {
    const busesData = [
      ["Bahía", "Hora"],
      ...state.tablas.buses.map((b) => [b.bahia, b.hora]),
    ];
    const wsBuses = XLSX.utils.aoa_to_sheet(busesData);
    XLSX.utils.book_append_sheet(wb, wsBuses, "Buses");
  }

  // Hoja 3 – Equipos varados
  if (state.tablas.equipos && state.tablas.equipos.length > 0) {
    const eqData = [
      ["Equipo", "Ubicación", "Razón"],
      ...state.tablas.equipos.map((e) => [e.equipo, e.ubicacion, e.razon]),
    ];
    const wsEq = XLSX.utils.aoa_to_sheet(eqData);
    XLSX.utils.book_append_sheet(wb, wsEq, "Equipos");
  }

  // Hoja 4 – Observaciones
  if (state.observaciones && state.observaciones.trim()) {
    const obsData = [
      ["OBSERVACIONES"],
      [state.observaciones],
    ];
    const wsObs = XLSX.utils.aoa_to_sheet(obsData);
    XLSX.utils.book_append_sheet(wb, wsObs, "Observaciones");
  }

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   EXPORTAR CSV – usamos también SheetJS para simplificar
============================================================ */

function handleCSV() {
  const state = collectStateFromDOM();
  const baseName = getReportFileNameBase();

  // Tomamos solo una vista tipo "Resumen" en CSV
  const rows = [
    ["Campo", "Valor"],
    ["Fecha", state.header.fecha],
    ["Turno", state.header.turno === "day" ? "DÍA" : "NOCHE"],
    ["Grupo", state.header.grupo],
    ["Supervisores", state.header.supervisores],
    ["Responsable RCT", state.header.responsable],
    ["Camiones x operador (1ra hr)", state.header.camiones_x_operador],
    ["Camiones operativos", state.indicadores.operativos_camiones],
    ["Camiones DOWN", state.indicadores.down_camiones],
    ["Equipos livianos", state.indicadores.equipos_livianos],
    ["Equipos livianos DOWN", state.indicadores.equipos_livianos_down],
  ];

  // Convertimos a sheet y luego a CSV
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   EXPORTAR JSON – Estado completo
============================================================ */

function handleJSON() {
  const state = collectStateFromDOM();
  const baseName = getReportFileNameBase();

  const jsonStr = JSON.stringify(state, null, 2);

  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
/* ============================================================
   NOTA:
   - En la PARTE 5/5
      • Inicializaremos todo en DOMContentLoaded
      • Añadiremos manejo del modal de historial
      • Añadiremos eventos a los botones de exportación
****************************************************************/ // ================================================================
/* ============================================================
   UTILIDADES BÁSICAS DE LECTURA/ESCRITURA DE VALORES
============================================================ */ 
/* ============================================================
   HISTORIAL – UI (MODAL, LISTA Y CARGA DE REPORTES)
============================================================ */

/**
 * Llena la lista del historial en el modal.
 */
function populateHistoryList() {
  const list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";

  if (!Array.isArray(RCT_HISTORY) || RCT_HISTORY.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay reportes guardados en este navegador.";
    list.appendChild(li);
    return;
  }

  RCT_HISTORY.forEach((entry, index) => {
    const li = document.createElement("li");
    const st = entry.state || {};
    const fecha = st.header?.fecha || "Sin fecha";
    const turno = st.header?.turno === "day" ? "DÍA" : "NOCHE";
    const savedAt = entry.savedAt || entry.id || "";

    li.innerHTML = `
      <button type="button"
              class="secondary-button"
              data-history-id="${entry.id}">
        ${index + 1}. ${fecha} – ${turno} <br>
        <span style="font-size:10px;opacity:0.8;">Guardado: ${savedAt}</span>
      </button>
    `;
    list.appendChild(li);
  });
}

/**
 * Abre el modal de historial.
 */
function openHistoryModal() {
  const modal = document.getElementById("historyModal");
  if (!modal) return;
  modal.classList.add("show");
}

/**
 * Cierra el modal de historial.
 */
function closeHistoryModal() {
  const modal = document.getElementById("historyModal");
  if (!modal) return;
  modal.classList.remove("show");
}

/**
 * Inicializa listeners del modal de historial.
 */
function initHistoryUI() {
  const historyBtn = document.getElementById("historyBtn");
  const historyClose = document.getElementById("historyClose");
  const historyBackdrop = document.getElementById("historyBackdrop");
  const historyList = document.getElementById("historyList");

  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      populateHistoryList();
      openHistoryModal();
    });
  }

  if (historyClose) {
    historyClose.addEventListener("click", closeHistoryModal);
  }

  if (historyBackdrop) {
    historyBackdrop.addEventListener("click", closeHistoryModal);
  }

  // Delegación para seleccionar un reporte del historial
  if (historyList) {
    historyList.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;

      const btn = target.closest("button[data-history-id]");
      if (!btn) return;

      const id = btn.getAttribute("data-history-id");
      if (!id) return;

      const entry = RCT_HISTORY.find((e) => e.id === id);
      if (!entry) return;

      // Confirmamos con el usuario
      const ok = confirm("¿Cargar este reporte y reemplazar la información actual?");
      if (!ok) return;

      applyStateToDOM(entry.state);
      closeHistoryModal();

      // Cambiar a pestaña Resumen para que vea el reporte
      const tabResumenBtn = document.getElementById("tabResumen");
      if (tabResumenBtn) tabResumenBtn.click();
    });
  }
}

/* ============================================================
   BOTONES PRINCIPALES – GUARDAR Y NUEVO DÍA
============================================================ */

/**
 * Maneja clic en botón "Guardar" (solo localStorage por ahora).
 */
function handleSave() {
  const entry = pushCurrentStateToHistory();
  populateHistoryList();
  alert("Reporte guardado en el historial de este navegador.");
  return entry;
}

/**
 * Limpia el formulario para iniciar un nuevo día.
 */
function handleNewDay() {
  const ok = confirm("¿Borrar la información actual para iniciar un nuevo día?");
  if (!ok) return;

  // Reseteo campos principales
  setValue("fecha", "");
  setValue("grupo", "");
  setValue("turno", "day");
  setValue("supervisores", "");
  setValue("responsable", "");
  setNumber("camiones_x_operador", 0);
  setNumber("equipos_taller", 0);
  setNumber("operativos_camiones", 0);
  setNumber("down_camiones", 0);
  setNumber("equipos_livianos", 0);
  setNumber("equipos_livianos_down", 0);

  // Limpio tablas
  const busesBody = document.querySelector("#tablaBuses tbody");
  if (busesBody) busesBody.innerHTML = "";
  const equiposBody = document.querySelector("#tablaEquipos tbody");
  if (equiposBody) equiposBody.innerHTML = "";

  // Limpio observaciones
  const obsEl = document.getElementById("observaciones");
  if (obsEl) obsEl.value = "";

  // Reseteo estado global
  RCT_STATE = {
    header: {
      fecha: "",
      grupo: "",
      turno: "day",
      supervisores: "",
      responsable: "",
      camiones_x_operador: 0,
      equipos_taller: 0,
    },
    indicadores: {
      operativos_camiones: 0,
      down_camiones: 0,
      equipos_livianos: 0,
      equipos_livianos_down: 0,
    },
    tablas: {
      buses: [],
      equipos: [],
    },
    observaciones: "",
    meta: {
      createdAt: null,
      updatedAt: null,
    },
  };

  // Fecha por defecto: hoy
  const today = new Date().toISOString().slice(0, 10);
  setValue("fecha", today);
  RCT_STATE.header.fecha = today;

  updateKpisFromState(RCT_STATE);
  renderPreview(RCT_STATE);
}

/* ============================================================
   INICIALIZAR BOTONES DE ACCIÓN
============================================================ */

function initActionButtons() {
  const btnSave = document.getElementById("btnSave");
  const btnNew = document.getElementById("btnNew");
  const btnPrint = document.getElementById("btnPrint");
  const btnPDF = document.getElementById("btnPDF");
  const btnJPG = document.getElementById("btnJPG");
  const btnExcel = document.getElementById("btnExcel");
  const btnCSV = document.getElementById("btnCSV");
  const btnJSON = document.getElementById("btnJSON");

  if (btnSave) btnSave.addEventListener("click", handleSave);
  if (btnNew) btnNew.addEventListener("click", handleNewDay);
  if (btnPrint) btnPrint.addEventListener("click", handlePrint);
  if (btnPDF) btnPDF.addEventListener("click", handlePDF);
  if (btnJPG) btnJPG.addEventListener("click", handleJPG);
  if (btnExcel) btnExcel.addEventListener("click", handleExcel);
  if (btnCSV) btnCSV.addEventListener("click", handleCSV);
  if (btnJSON) btnJSON.addEventListener("click", handleJSON);
}

/* ============================================================
   INICIALIZACIÓN GLOBAL – DOMContentLoaded
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cargar historial desde localStorage
  loadHistory();

  // 2. Inicializar pestañas, tablas dinámicas y listeners del form
  initDynamicParts();

  // 3. Inicializar UI de historial
  initHistoryUI();

  // 4. Inicializar botones de acción (Guardar, Nuevo, Exportar)
  initActionButtons();

  // 5. Si la fecha está vacía, colocar la de hoy
  const fechaEl = document.getElementById("fecha");
  if (fechaEl && !fechaEl.value) {
    const today = new Date().toISOString().slice(0, 10);
    fechaEl.value = today;
    RCT_STATE.header.fecha = today;
  }

  // 6. Sincronizar estado inicial → KPIs y Preview
  collectStateFromDOM();
  updateKpisFromState(RCT_STATE);
  renderPreview(RCT_STATE);
});
/**
 * Guarda el estado actual del formulario en el historial.
 * @returns {object} La entrada de historial creada.
 */
function pushCurrentStateToHistory() {
  const state = collectStateFromDOM();
  const entry = {
    id: state.meta.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    state,
  };

  RCT_HISTORY.push(entry);
  if (RCT_HISTORY.length > RCT_MAX_HISTORY) {
    RCT_HISTORY = RCT_HISTORY.slice(-RCT_MAX_HISTORY);
  }

  saveHistory();
  return entry;
}