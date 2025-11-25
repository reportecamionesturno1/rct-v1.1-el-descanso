/********************************************************************
 * config.js – Configuración global del sistema RCT
 * Compatible con:
 *  - Idiomas ES/EN
 *  - Tema claro/oscuro
 *  - Vista previa M3 dinámica
 *  - Guardado localStorage
 ********************************************************************/

// ================================================================
// IDIOMA – Cargar idioma guardado o usar Español por defecto
// ================================================================
const supportedLangs = ["es", "en"];

let currentLang = localStorage.getItem("lang") || "es";
if (!supportedLangs.includes(currentLang)) currentLang = "es";

document.documentElement.setAttribute("lang", currentLang);

// ================================================================
// TEMA (CLARO / OSCURO)
// ================================================================
let savedTheme = localStorage.getItem("theme") || "light";

if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}

// Botón de cambiar tema
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");

            const isDark = document.documentElement.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
});

// ================================================================
// TRADUCCIONES – Cargar JSON dinámico ES/EN
// ================================================================
async function loadTranslations(lang) {
    try {
        const response = await fetch(`${lang}.json`);
        return await response.json();
    } catch (err) {
        console.error("Error cargando archivo de idioma:", err);
        return {};
    }
}

let translations = {};

// Aplicar traducciones a elementos con data-i18n
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) el.textContent = translations[key];
    });

    // Placeholders traducidos
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) el.placeholder = translations[key];
    });

    const label = document.getElementById("langLabel");
    if (label) label.textContent = currentLang.toUpperCase();
}

// Cambiar idioma
document.addEventListener("DOMContentLoaded", async () => {
    translations = await loadTranslations(currentLang);
    applyTranslations();

    const langToggle = document.getElementById("langToggle");
    if (langToggle) {
        langToggle.addEventListener("click", async () => {
            currentLang = currentLang === "es" ? "en" : "es";
            localStorage.setItem("lang", currentLang);

            translations = await loadTranslations(currentLang);
            applyTranslations();
        });
    }
});

// ================================================================
// VARIABLES GLOBALES PARA EL SISTEMA
// (Se usan en script.js para preview, cálculos, historial, etc.)
// ================================================================
window.RCT = {
    version: "3.0",
    maxHistory: 15, // Cantidad de reportes guardados en historial
    previewID: "previewReport",
    busesTable: "tablaBuses",
    equiposTable: "tablaEquipos",
    seguridadTable: "tablaSeguridad",
    // (Más variables pueden agregarse si el preview dinámico las necesita)
};

// ================================================================
// CONFIG BASE PARA FUTURA INTEGRACIÓN CON GOOGLE APPS SCRIPT
// ================================================================
window.RCT_GAS = {
    enabled: false,    // Cuando quieras, lo habilitamos
    endpoint: "",      // Aquí luego pondremos el URL del Apps Script
    sheetID: "",       // ID de Google Sheets
};
