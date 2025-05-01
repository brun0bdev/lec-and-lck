import { getShortTeamName, t } from './utils.js';
import { TEAM_LOGOS, TEAM_COLORS, TEAM_CLASS, HIGH_CONTRAST_COLORS } from './data.js';

export function buildH2HTable(TEAMS, currentData) {
    const table = document.getElementById('h2h-table');
    table.innerHTML = '';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const cornerCell = document.createElement('th');
    cornerCell.innerHTML = '<span style="font-size:0.9em;">VS</span>';
    cornerCell.style.minWidth = "120px";
    headerRow.appendChild(cornerCell);

    TEAMS.forEach(team => {
        const th = document.createElement('th');
        th.style.width = "60px";
        const logo = document.createElement('img');
        logo.src = TEAM_LOGOS[team];
        logo.alt = getShortTeamName(team);
        logo.title = team;
        logo.style.width = "28px"; logo.style.height = "28px";
        logo.style.display = "block"; logo.style.margin = "0 auto 2px auto";
        logo.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.2))";
        th.appendChild(logo);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    TEAMS.forEach(team => {
        const row = document.createElement('tr');
        const teamCell = document.createElement('th');
        const teamContainer = document.createElement('div');
        teamContainer.style.display = 'flex'; teamContainer.style.alignItems = 'center';
        teamContainer.style.gap = '10px';
        const teamLogo = document.createElement('img');
        teamLogo.src = TEAM_LOGOS[team]; teamLogo.alt = `Logo ${team}`;
        teamLogo.style.width = '32px'; teamLogo.style.height = '32px';
        teamLogo.style.borderRadius = '4px'; teamLogo.style.padding = '2px';
        teamLogo.style.border = `1px solid ${TEAM_COLORS[team]}20`;
        teamContainer.appendChild(teamLogo);
        const teamName = document.createElement('span');
        teamName.textContent = team; teamName.style.fontWeight = 'bold';
        teamName.style.color = '#f0f5fa'; teamName.style.letterSpacing = '0.3px';
        teamContainer.appendChild(teamName);
        teamCell.appendChild(teamContainer);
        row.appendChild(teamCell);

        TEAMS.forEach(opponent => {
            const cell = document.createElement('td');
            const result = currentData[team][TEAMS.indexOf(opponent)];
            if (team === opponent) {
                cell.innerHTML = "<span class='diagonal-text'>-</span>";
                cell.classList.add('diagonal');
            } else if (result === null) {
                cell.textContent = "?"; cell.classList.add('unplayed');
            } else {
                if (result === "1-0") { cell.innerHTML = "<span>W</span>"; cell.classList.add('win'); }
                else if (result === "0-1") { cell.innerHTML = "<span>L</span>"; cell.classList.add('loss'); }
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
}

// Mostrar clasificación actual
export function displayCurrentStandings(TEAMS, standings, currentLang, translations) {
    const container = document.getElementById('current-standings-table');
    container.innerHTML = '';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    t(currentLang, translations, 'standingsHeaders').forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const sortedTeams = [...TEAMS].sort((a, b) => {
        if (standings.wins[b] !== standings.wins[a]) return standings.wins[b] - standings.wins[a];
        return standings.winRates[b] - standings.winRates[a];
    });

    sortedTeams.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index < 6) row.classList.add('playoff-team');
        const posCell = document.createElement('td'); posCell.textContent = index + 1; row.appendChild(posCell);
        const teamCell = document.createElement('td');
        const teamContainer = document.createElement('div'); teamContainer.style.display = 'flex'; teamContainer.style.alignItems = 'center';
        const teamLogo = document.createElement('img'); teamLogo.src = TEAM_LOGOS[team]; teamLogo.alt = `Logo ${team}`;
        teamLogo.style.width = '20px'; teamLogo.style.height = '20px'; teamLogo.style.marginRight = '8px'; teamLogo.style.objectFit = 'contain';
        teamContainer.appendChild(teamLogo);
        const teamName = document.createElement('span'); teamName.textContent = team; teamName.style.fontWeight = 'bold';
        teamName.style.color = TEAM_COLORS[team] || 'inherit';
        teamContainer.appendChild(teamName);
        teamCell.appendChild(teamContainer); row.appendChild(teamCell);
        const winsCell = document.createElement('td'); winsCell.textContent = standings.wins[team]; row.appendChild(winsCell);
        const lossesCell = document.createElement('td'); lossesCell.textContent = standings.played[team] - standings.wins[team]; row.appendChild(lossesCell);
        const wrCell = document.createElement('td'); const winRate = standings.winRates[team].toFixed(1);
        wrCell.innerHTML = `<span style="font-size:0.9em;">${winRate}%</span>`; row.appendChild(wrCell);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    if (sortedTeams.length > 6) {
        const playoffsLegend = document.createElement('div');
        playoffsLegend.style.marginTop = '10px'; playoffsLegend.style.fontSize = '0.8em';
        playoffsLegend.style.color = '#666';
        playoffsLegend.textContent = t(currentLang, translations, 'playoffsLegend');
        container.appendChild(playoffsLegend);
    }
}

// Marcar un equipo como ganador visualmente
export function markTeamAsWinner(winnerCard, loserCard) {
    winnerCard.classList.add('team-winner');
    loserCard.classList.add('team-loser');
}

// Actualizar visualización después de un resultado
export function updateMatchDisplay(TEAMS, currentData, OFFICIAL_MATCHES, currentLang, translations, setMatchResultCallback) {
    displayUnplayedMatches(TEAMS, currentData, OFFICIAL_MATCHES, currentLang, translations, setMatchResultCallback);
}

// Buscar y mostrar partidos pendientes
export function displayUnplayedMatches(TEAMS, currentData, OFFICIAL_MATCHES, currentLang, translations, setMatchResultCallback) {
    const container = document.getElementById('unplayed-matches');
    container.innerHTML = '';

    const unplayedMatches = findUnplayedMatches(TEAMS, currentData, OFFICIAL_MATCHES); // Assuming findUnplayedMatches is in logic.js

    if (unplayedMatches.length === 0) {
        container.innerHTML = `<p>${t(currentLang, translations, 'noUnplayed')}</p>`;
        return;
    }

    const weekGroups = {};
    unplayedMatches.forEach(match => {
        const weekKey = match.week;
        if (!weekGroups[weekKey]) weekGroups[weekKey] = [];
        weekGroups[weekKey].push(match);
    });

    Object.keys(weekGroups).sort((a, b) => {
        if (a === "Extra") return 1; if (b === "Extra") return -1;
        return parseInt(a) - parseInt(b);
    }).forEach(week => {
        const weekHeader = document.createElement('div');
        weekHeader.classList.add('week-header');
        weekHeader.textContent = week === 'Extra' ? t(currentLang, translations, 'extraRoundLabel') : t(currentLang, translations, 'roundLabel', { week });
        container.appendChild(weekHeader);

        weekGroups[week].forEach((match, idx) => {
            const { teams, date, day, time } = match;
            const [team1, team2] = teams;
            const matchItem = document.createElement('div'); matchItem.classList.add('match-item');
            const matchHeader = document.createElement('div'); matchHeader.classList.add('match-header');
            if (date && day && time) {
                const matchDate = new Date(date);
                const formattedDate = matchDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                matchHeader.textContent = `${day} ${formattedDate} • ${time}`;
            } else {
                matchHeader.textContent = t(currentLang, translations, 'matchLabel', { index: idx + 1 });
            }
            matchItem.appendChild(matchHeader);
            const matchContainer = document.createElement('div'); matchContainer.classList.add('match-container');

            // Team 1 Card
            const team1Card = document.createElement('div');
            team1Card.classList.add('team-card', TEAM_CLASS[team1] || '');
            const team1Logo = document.createElement('img'); team1Logo.classList.add('team-logo');
            team1Logo.src = TEAM_LOGOS[team1] || ''; team1Logo.alt = `Logo de ${team1}`; team1Card.appendChild(team1Logo);
            const team1Name = document.createElement('div'); team1Name.classList.add('team-name');
            team1Name.textContent = team1;
            // Apply white color override for G2/SK
            if (team1 === 'G2 Esports' || team1 === 'SK Gaming') {
                team1Name.style.color = '#ffffff'; // Direct override
            } else {
                team1Name.style.color = TEAM_COLORS[team1] || '#333';
            }
            team1Card.appendChild(team1Name);
            team1Card.addEventListener('click', () => {
                setMatchResultCallback(team1, team2, true); // Call logic function
                markTeamAsWinner(team1Card, team2Card);
                setTimeout(() => updateMatchDisplay(TEAMS, currentData, OFFICIAL_MATCHES, currentLang, translations, setMatchResultCallback), 1000);
            });

            // VS Badge
            const vsBadge = document.createElement('div'); vsBadge.classList.add('vs-badge'); vsBadge.textContent = 'VS';

            // Team 2 Card
            const team2Card = document.createElement('div');
            team2Card.classList.add('team-card', TEAM_CLASS[team2] || '');
            const team2Logo = document.createElement('img'); team2Logo.classList.add('team-logo');
            team2Logo.src = TEAM_LOGOS[team2] || ''; team2Logo.alt = `Logo de ${team2}`; team2Card.appendChild(team2Logo);
            const team2Name = document.createElement('div'); team2Name.classList.add('team-name');
            team2Name.textContent = team2;
             // Apply white color override for G2/SK
            if (team2 === 'G2 Esports' || team2 === 'SK Gaming') {
                team2Name.style.color = '#ffffff'; // Direct override
            } else {
                team2Name.style.color = TEAM_COLORS[team2] || '#333';
            }
            team2Card.appendChild(team2Name);
            team2Card.addEventListener('click', () => {
                setMatchResultCallback(team1, team2, false); // Call logic function
                markTeamAsWinner(team2Card, team1Card);
                setTimeout(() => updateMatchDisplay(TEAMS, currentData, OFFICIAL_MATCHES, currentLang, translations, setMatchResultCallback), 1000);
            });

            matchContainer.appendChild(team1Card); matchContainer.appendChild(vsBadge); matchContainer.appendChild(team2Card);
            matchItem.appendChild(matchContainer); container.appendChild(matchItem);
        });
    });
}

// Crear gráfico de barras
export function createStandingsChart(chartInstance, TEAMS, labels, values, currentLang, translations, seasonName) {
    try {
        const ctx = document.getElementById('standings-chart').getContext('2d');
        if (chartInstance) chartInstance.destroy();
        const cutoffValue = values[5] || 0;
        const isHighContrast = document.body.classList.contains('high-contrast');
        const colors = labels.map(team => isHighContrast ? HIGH_CONTRAST_COLORS[team] : TEAM_COLORS[team] || `hsl(${TEAMS.indexOf(team)*360/TEAMS.length},70%,60%)`);
        const options = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: t(currentLang, translations, 'chartTitle', { seasonName }), font: { size: 16 } },
                annotation: undefined // Initialize annotation plugin options
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: t(currentLang, translations, 'axisYTitle') } },
                x: { title: { display: true, text: t(currentLang, translations, 'axisXTitle') }, ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } }
            }
        };

        const hasAnnotation = typeof window.ChartAnnotation !== 'undefined';
        if (hasAnnotation) {
            options.plugins.annotation = {
                annotations: {
                    line1: {
                        type: 'line', yMin: cutoffValue, yMax: cutoffValue,
                        borderColor: 'rgba(128,128,128,0.7)', borderWidth: 2, borderDash: [5,5],
                        label: {
                            display: true, content: t(currentLang, translations, 'annotationLabel', { cutoff: cutoffValue }),
                            position: 'end', backgroundColor: 'rgba(255,255,255,0.8)', color: '#333',
                            font: { weight: 'bold' }, padding: 6
                        }
                    }
                }
            };
        }

        const newChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: t(currentLang, translations, 'datasetLabel'), data: values, backgroundColor: colors,
                    borderColor: isHighContrast ? '#000' : 'rgba(0,0,0,0.1)', borderWidth: 1
                }]
            },
            options
        });

        if (!hasAnnotation) {
            const container = document.getElementById('chart-container');
            const old = container.querySelectorAll('.cutoff-label'); old.forEach(e=>e.remove());
            const labelDiv = document.createElement('div'); labelDiv.className = 'cutoff-label';
            labelDiv.style.position='absolute'; labelDiv.style.top='50%'; labelDiv.style.right='20px';
            labelDiv.style.backgroundColor='rgba(255,255,255,0.9)'; labelDiv.style.padding='8px';
            labelDiv.style.borderRadius='4px'; labelDiv.style.boxShadow='0 2px 5px rgba(0,0,0,0.2)';
            labelDiv.style.color='#333'; labelDiv.style.fontWeight='bold';
            labelDiv.innerHTML = t(currentLang, translations, 'annotationLabel', { cutoff: cutoffValue });
            container.style.position='relative'; container.appendChild(labelDiv);
        }
        return newChart; // Return the new chart instance
    } catch (err) {
        console.error('Error al crear el gráfico:', err);
        const container = document.getElementById('chart-container');
        container.innerHTML = `<div style="padding:20px;text-align:center;color:#d32f2f;"><p>Error al crear el gráfico: ${err.message}</p><p>Por favor, intente recargar la página.</p></div>`;
        return null; // Return null on error
    }
}

// Mostrar resultados en formato texto
export function displayTextResults(TEAMS, teams, values, currentLang, translations) {
    const container = document.getElementById('text-results');
    container.innerHTML = '';
    const title = document.createElement('h3');
    title.textContent = t(currentLang, translations, 'finalStandingsTitle');
    container.appendChild(title);
    const list = document.createElement('div');
    list.classList.add('standings-list'); // Add class for potential styling

    teams.forEach((team, index) => {
        const item = document.createElement('div'); item.classList.add('standings-item');
        const posDiv = document.createElement('div'); posDiv.classList.add('team-position');
        posDiv.textContent = index + 1; item.appendChild(posDiv);
        const teamNameContainer = document.createElement('div'); teamNameContainer.classList.add('standings-team-name');
        const logoContainer = document.createElement('div'); logoContainer.classList.add('team-mini-logo-container');
        const miniLogo = document.createElement('img'); miniLogo.classList.add('team-mini-logo');
        miniLogo.src = TEAM_LOGOS[team]; miniLogo.alt = `${team} logo`; logoContainer.appendChild(miniLogo);
        teamNameContainer.appendChild(logoContainer);
        const teamText = document.createElement('span'); teamText.textContent = team;
        teamText.style.color = TEAM_COLORS[team] || '#333'; teamNameContainer.appendChild(teamText);
        item.appendChild(teamNameContainer);
        const winsContainer = document.createElement('div'); winsContainer.classList.add('standings-wins');
        winsContainer.textContent = t(currentLang, translations, 'winsLabel');
        const winsBadge = document.createElement('div'); winsBadge.classList.add('wins-badge');
        winsBadge.textContent = values[index]; winsContainer.appendChild(winsBadge);
        item.appendChild(winsContainer);
        const isPlayoff = index < 6;
        const statusText = isPlayoff ? t(currentLang, translations, 'statusPlayoffs') : t(currentLang, translations, 'statusEliminated');
        const statusDiv = document.createElement('div'); statusDiv.classList.add('standings-status');
        statusDiv.classList.add(isPlayoff ? 'status-playoff' : 'status-eliminated');
        statusDiv.textContent = statusText; item.appendChild(statusDiv);
        list.appendChild(item);
    });
    container.appendChild(list);

    const cutoffValue = values[5] || 0; // Get the wins of the 6th place team
    const cutoffText = document.createElement('div');
    cutoffText.classList.add('playoff-cutoff');
    cutoffText.innerHTML = `<strong>${t(currentLang, translations, 'cutoffLabel')}</strong> ${cutoffValue}`;
    container.appendChild(cutoffText);
}

// Traducir elementos estáticos de la página
export function translateStaticElements(currentLang, translations, seasonName) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(currentLang, translations, key, { seasonName });
        if (text) {
            // Use innerHTML carefully, only for trusted keys like footerData
            if (key === 'footerData') {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    });
     document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(currentLang, translations, key);
        if (text) {
            el.placeholder = text;
        }
    });
    document.title = t(currentLang, translations, 'headerTitle', { seasonName });
}

// Cargar lista de escenarios guardados
export function loadSavedScenariosList(currentLang, translations, league) {
    const selectElement = document.getElementById('load-scenario-select');
    const storageKey = `leagueScenarios_${league}`;
    const selectedValue = selectElement.value; // Save current selection

    selectElement.innerHTML = `<option value="">${t(currentLang, translations, 'selectScenarioOption')}</option>`; // Use translation

    const scenarios = JSON.parse(localStorage.getItem(storageKey) || '{}');

    Object.keys(scenarios).sort().forEach(name => { // Sort alphabetically
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    });

    // Restore selection if it still exists
    if (selectElement.querySelector(`option[value="${selectedValue}"]`)) {
        selectElement.value = selectedValue;
    }
}

// Helper function to find unplayed matches (moved here as it's UI related)
function findUnplayedMatches(TEAMS, currentData, OFFICIAL_MATCHES) {
    const unplayed = [];
    const seen = new Set();

    OFFICIAL_MATCHES.forEach(day => {
        day.matches.forEach(match => {
            const team1 = match.team1;
            const team2 = match.team2;
            const pair = [team1, team2].sort().join('-');
            if (!seen.has(pair) && currentData[team1]?.[TEAMS.indexOf(team2)] === null) {
                unplayed.push({
                    teams: [team1, team2], week: day.week, date: day.date,
                    day: day.day, time: match.time
                });
                seen.add(pair);
            }
        });
    });

    TEAMS.forEach(team1 => {
        TEAMS.forEach(team2 => {
            if (team1 === team2) return;
            const pair = [team1, team2].sort().join('-');
            if (!seen.has(pair) && currentData[team1]?.[TEAMS.indexOf(team2)] === null) {
                unplayed.push({
                    teams: [team1, team2], week: "Extra", date: null, day: null, time: null
                });
                seen.add(pair);
            }
        });
    });
    return unplayed;
}