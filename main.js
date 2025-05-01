import { LEAGUE_DATA, TRANSLATIONS } from './data.js'; // Importar LEAGUE_DATA
import {
    calculateStandings, setMatchResult, calculateProjection, exportToCSV,
    saveScenario, loadScenario, resetApp, loadLeagueData, translatePage
 } from './logic.js';
import { loadSavedScenariosList } from './ui.js';

// --- Application State ---
const state = {
    TEAMS: [],
    H2H_DATA: {}, // Initial H2H data for the current league (for reset)
    OFFICIAL_MATCHES: [],
    seasonName: '',
    currentData: {}, // Current state of H2H data (mutable)
    standings: {},
    chart: null,
    currentLang: 'ES' // Default language
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded.");
    if (window.Chart && window.ChartAnnotation) {
        Chart.register(ChartAnnotation);
        console.log("Plugin de anotaciones registrado correctamente");
    } else {
        console.warn("El plugin de anotaciones no está disponible");
    }

    // --- Initialize LEC Data State ---
    const initialLeague = 'LEC';
    console.log(`Setting up initial state for ${initialLeague}...`);
    const cfg = LEAGUE_DATA[initialLeague];
    state.TEAMS = cfg.teams;
    state.H2H_DATA = JSON.parse(JSON.stringify(cfg.h2h)); 
    state.OFFICIAL_MATCHES = cfg.schedule;
    state.seasonName = cfg.seasonName;
    state.currentData = JSON.parse(JSON.stringify(state.H2H_DATA)); // Initial mutable data
    // state.currentLang is already defaulted to 'ES'
    document.body.className = 'league-' + initialLeague; // Set initial body class

    // Calculate initial standings *after* setting up data
    console.log("Calculating initial standings...");
    state.standings = calculateStandings(state.TEAMS, state.currentData);
    console.log("Initial standings calculated:", state.standings);
    console.log("Initial state set.");

    // --- Setup Event Listeners (after initial state is partially set) ---
    // We need state.currentLang and initialLeague for setting switches
    setupEventListeners(initialLeague);
    console.log("Event listeners set up.");


    // --- Initial Render ---
    console.log("Performing initial page render...");
    translatePage(state); // Render the page with the initial state
    console.log("Initial page render complete.");
});

// --- Event Listeners Setup ---
// Pass initialLeague to set the switch correctly
function setupEventListeners(initialLeague) {
    document.getElementById('calculate-btn').addEventListener('click', () => calculateProjection(state));
    document.getElementById('export-csv-btn').addEventListener('click', () => exportToCSV(state.TEAMS, state.currentData, state.standings));
    document.getElementById('reset-btn').addEventListener('click', () => resetApp(state)); // resetApp now calls translatePage

    // Set initial state of switches
    document.getElementById('league-switch').checked = initialLeague === 'LCK';
    document.getElementById('lang-switch').checked = state.currentLang === 'EN';


    document.getElementById('league-switch').addEventListener('change', e => {
        const newLeague = e.target.checked ? 'LCK' : 'LEC';
        console.log(`Switching league to ${newLeague}...`); // Log
        loadLeagueData(state, newLeague); // Cargar datos de la nueva liga
        translatePage(state); // Disparar actualización completa de la UI después de cargar datos
        console.log(`League switched to ${newLeague}.`); // Log
    });

    document.getElementById('lang-switch').addEventListener('change', e => {
        state.currentLang = e.target.checked ? 'EN' : 'ES';
        console.log(`Switching language to ${state.currentLang}...`); // Log
        translatePage(state); // Traducir todo
        console.log(`Language switched to ${state.currentLang}.`); // Log
    });

    // Scenario Buttons (guard for missing elements)
    document.getElementById('save-scenario-btn')?.addEventListener('click', () => saveScenario(state));
    document.getElementById('load-scenario-btn')?.addEventListener('click', () => loadScenario(state));

    // Note: Click handlers for individual matches are added dynamically in ui.js/displayUnplayedMatches
}

// --- High Contrast (Example - if you have a button for it) ---
// function toggleHighContrast() {
//     document.body.classList.toggle('high-contrast');
//     if (state.chart) {
//         calculateProjection(state); // Redraw chart with new colors
//     }
// }
// Example: document.getElementById('contrast-toggle-btn')?.addEventListener('click', toggleHighContrast);