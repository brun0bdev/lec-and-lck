import { downloadCSV, t } from './utils.js';
import { LEAGUE_DATA, TRANSLATIONS } from './data.js';
import {
    buildH2HTable, displayCurrentStandings, displayUnplayedMatches, // Importar buildH2HTable
    createStandingsChart, displayTextResults, loadSavedScenariosList,
    translateStaticElements
 } from './ui.js';

// Calcular clasificación
export function calculateStandings(TEAMS, currentData) {
    const wins = {}; const played = {}; const winRates = {};
    TEAMS.forEach(team => { wins[team] = 0; played[team] = 0; });

    TEAMS.forEach(team => {
        TEAMS.forEach(opponent => {
            if (team === opponent) return;
            const result = currentData[team]?.[TEAMS.indexOf(opponent)];
            if (result === "1-0" || result === "0-1") {
                played[team]++;
                if (result === "1-0") wins[team]++;
            }
        });
        winRates[team] = played[team] > 0 ? (wins[team] / played[team] * 100) : 0;
    });
    return { wins, played, winRates };
}

// Establecer resultado de un partido y actualizar UI
export function setMatchResult(state, team1, team2, team1Wins) {
    const team1Idx = state.TEAMS.indexOf(team1);
    const team2Idx = state.TEAMS.indexOf(team2);

    if (team1Idx === -1 || team2Idx === -1) return; // Team not found

    if (team1Wins) {
        state.currentData[team1][team2Idx] = "1-0";
        state.currentData[team2][team1Idx] = "0-1";
    } else {
        state.currentData[team1][team2Idx] = "0-1";
        state.currentData[team2][team1Idx] = "1-0";
    }

    // Actualizar tabla H2H directamente
    buildH2HTable(state.TEAMS, state.currentData);

    // Recalcular y mostrar clasificación
    state.standings = calculateStandings(state.TEAMS, state.currentData);
    displayCurrentStandings(state.TEAMS, state.standings, state.currentLang, TRANSLATIONS);
    // No es necesario llamar a displayUnplayedMatches aquí, ya que el partido desaparecerá en la próxima llamada completa (o se puede optimizar si es necesario)
}


// Calcular y mostrar proyección final
export function calculateProjection(state) {
    state.standings = calculateStandings(state.TEAMS, state.currentData);

    const sortedTeams = [...state.TEAMS].sort((a, b) => {
        if (state.standings.wins[b] !== state.standings.wins[a]) {
            return state.standings.wins[b] - state.standings.wins[a];
        }
        // Desempate simple por WinRate (se puede mejorar con H2H si es necesario)
        const wrA = state.standings.played[a] > 0 ? state.standings.wins[a] / state.standings.played[a] : 0;
        const wrB = state.standings.played[b] > 0 ? state.standings.wins[b] / state.standings.played[b] : 0;
        return wrB - wrA;
    });
    const values = sortedTeams.map(team => state.standings.wins[team]);

    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    setTimeout(() => { resultsSection.classList.add('visible'); }, 10);

    // Pass the current chart instance to be destroyed and updated
    state.chart = createStandingsChart(state.chart, state.TEAMS, sortedTeams, values, state.currentLang, TRANSLATIONS, state.seasonName);
    displayTextResults(state.TEAMS, sortedTeams, values, state.currentLang, TRANSLATIONS);

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Exportar datos a CSV
export function exportToCSV(TEAMS, currentData, standings) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let h2hCSV = 'Team,' + TEAMS.join(',') + '\n';
    TEAMS.forEach(team => {
        let row = team + ',';
        TEAMS.forEach(opponent => {
            const result = currentData[team]?.[TEAMS.indexOf(opponent)];
            row += (result === null ? '' : result) + ',';
        });
        h2hCSV += row.slice(0, -1) + '\n';
    });

    const sortedTeams = [...TEAMS].sort((a, b) => standings.wins[b] - standings.wins[a]);
    let standingsCSV = 'Pos,Team,Wins,Losses,WinRate\n';
    sortedTeams.forEach((team, index) => {
        standingsCSV += `${index + 1},${team},${standings.wins[team]},${standings.played[team] - standings.wins[team]},${standings.winRates[team].toFixed(1)}%\n`;
    });

    downloadCSV(h2hCSV, `h2h_results_${timestamp}.csv`);
    downloadCSV(standingsCSV, `standings_${timestamp}.csv`);
    alert('Los archivos CSV han sido exportados y descargados.'); // Consider using a less intrusive notification
}

// Guardar escenario actual
export function saveScenario(state) {
    const scenarioNameInput = document.getElementById('scenario-name');
    const scenarioName = scenarioNameInput.value.trim();
    const league = document.getElementById('league-switch').checked ? 'LCK' : 'LEC';
    const storageKey = `leagueScenarios_${league}`;

    if (!scenarioName) {
        alert(t(state.currentLang, TRANSLATIONS, 'scenarioNameRequired'));
        return;
    }

    const scenarios = JSON.parse(localStorage.getItem(storageKey) || '{}');
    scenarios[scenarioName] = {
        data: state.currentData,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify(scenarios));
    loadSavedScenariosList(state.currentLang, TRANSLATIONS, league); // Update dropdown
    scenarioNameInput.value = ''; // Clear input
    alert(t(state.currentLang, TRANSLATIONS, 'scenarioSaved', { name: scenarioName }));
}

// Cargar escenario guardado
export function loadScenario(state) {
    const selectElement = document.getElementById('load-scenario-select');
    const scenarioName = selectElement.value;
    const league = document.getElementById('league-switch').checked ? 'LCK' : 'LEC';
    const storageKey = `leagueScenarios_${league}`;

    if (!scenarioName) {
        alert(t(state.currentLang, TRANSLATIONS, 'scenarioSelectRequired'));
        return;
    }

    const scenarios = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (!scenarios[scenarioName]) {
        alert(t(state.currentLang, TRANSLATIONS, 'scenarioNotFound', { name: scenarioName }));
        return;
    }

    state.currentData = scenarios[scenarioName].data;

    // Re-render everything with loaded data
    buildH2HTable(state.TEAMS, state.currentData);
    state.standings = calculateStandings(state.TEAMS, state.currentData);
    displayCurrentStandings(state.TEAMS, state.standings, state.currentLang, TRANSLATIONS);
    // Pass the callback for match clicks
    displayUnplayedMatches(state.TEAMS, state.currentData, state.OFFICIAL_MATCHES, state.currentLang, TRANSLATIONS, (t1, t2, t1Wins) => setMatchResult(state, t1, t2, t1Wins));


    // Optional: Clear results and chart if they were visible
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
    document.getElementById('text-results').innerHTML = '';
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('visible');
    resultsSection.style.display = 'none';

    alert(t(state.currentLang, TRANSLATIONS, 'scenarioLoaded', { name: scenarioName }));
}

// Restablecer la aplicación al estado inicial de la liga actual
export function resetApp(state) {
    state.currentData = JSON.parse(JSON.stringify(state.H2H_DATA)); // Reset to initial H2H of current league
    state.standings = calculateStandings(state.TEAMS, state.currentData); // Recalcular standings

    // Limpiar resultados y gráfico
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
    document.getElementById('text-results').innerHTML = '';
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('visible');
    resultsSection.style.display = 'none';
    const cutoffLabels = document.querySelectorAll('.cutoff-label');
    cutoffLabels.forEach(label => label.remove());

    // Después de resetear datos, disparar actualización completa de UI vía translatePage
    translatePage(state);
}

// Cargar datos de la liga seleccionada (solo actualiza estado)
export function loadLeagueData(state, league) {
    const cfg = LEAGUE_DATA[league];
    state.TEAMS = cfg.teams;
    state.H2H_DATA = JSON.parse(JSON.stringify(cfg.h2h)); // Store initial H2H for reset
    state.OFFICIAL_MATCHES = cfg.schedule;
    state.seasonName = cfg.seasonName;
    state.currentData = JSON.parse(JSON.stringify(state.H2H_DATA)); // Reset currentData for the new league
    state.standings = calculateStandings(state.TEAMS, state.currentData); // Recalculate standings

    document.body.className = 'league-' + league; // Apply league-specific class

    // Limpiar sección de resultados al cambiar de liga
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
    document.getElementById('text-results').innerHTML = '';
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('visible');
    resultsSection.style.display = 'none';
    const cutoffLabels = document.querySelectorAll('.cutoff-label');
    cutoffLabels.forEach(label => label.remove());

    // El llamador (event listener en main.js) debe llamar a translatePage después de esto
}

// Traducir toda la página (estática y dinámica) y renderizar contenido dinámico
export function translatePage(state) {
    translateStaticElements(state.currentLang, TRANSLATIONS, state.seasonName);

    // Renderizar/Re-renderizar contenido dinámico
    buildH2HTable(state.TEAMS, state.currentData); // Renderizar tabla H2H
    if (Object.keys(state.standings).length > 0) {
         displayCurrentStandings(state.TEAMS, state.standings, state.currentLang, TRANSLATIONS); // Renderizar standings
    }
     // Pass the callback for match clicks
    displayUnplayedMatches(state.TEAMS, state.currentData, state.OFFICIAL_MATCHES, state.currentLang, TRANSLATIONS, (t1, t2, t1Wins) => setMatchResult(state, t1, t2, t1Wins)); // Renderizar partidos

    // Actualizar títulos del gráfico si existe y los resultados son visibles
    const resultsSection = document.getElementById('results');
    if (state.chart && resultsSection.classList.contains('visible')) {
        // Recalcular proyección para actualizar texto del gráfico (o solo actualizar opciones)
        // Opción 1: Recalcular todo (más simple)
        calculateProjection(state);
        // Opción 2: Solo actualizar textos (más eficiente si no cambian los datos)
        // state.chart.options.plugins.title.text = t(state.currentLang, TRANSLATIONS, 'chartTitle', { seasonName: state.seasonName });
        // state.chart.options.scales.y.title.text = t(state.currentLang, TRANSLATIONS, 'axisYTitle');
        // state.chart.options.scales.x.title.text = t(state.currentLang, TRANSLATIONS, 'axisXTitle');
        // state.chart.data.datasets[0].label = t(state.currentLang, TRANSLATIONS, 'datasetLabel');
        // // Actualizar anotación si existe
        // if (state.chart.options.plugins.annotation) {
        //     const cutoffValue = state.chart.options.plugins.annotation.annotations.line1.yMin; // Asumiendo que no cambia
        //     state.chart.options.plugins.annotation.annotations.line1.label.content = t(state.currentLang, TRANSLATIONS, 'annotationLabel', { cutoff: cutoffValue });
        // }
        // state.chart.update();
    }
    // Actualizar traducciones del dropdown de escenarios
    const league = document.getElementById('league-switch').checked ? 'LCK' : 'LEC';
    // Guard scenario dropdown translation to avoid errors if elements are missing
    if (document.getElementById('load-scenario-select')) {
        loadSavedScenariosList(state.currentLang, TRANSLATIONS, league);
    }
}