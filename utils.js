export function getShortTeamName(fullName) {
    const abbreviations = {
        "Fnatic": "FNC", "G2 Esports": "G2", "GIANTX": "GX", "Karmine Corp": "KC",
        "Movistar KOI": "MKOI", "Rogue": "RGE", "SK Gaming": "SK", "Team BDS": "BDS",
        "Team Heretics": "TH", "Team Vitality": "VIT",
        "BNK FEARX":"BNK","DN Freecs":"DNF","Dplus KIA":"DK", "DRX":"DRX",
        "Gen.G":"GEN","Hanwha Life Esports":"HLE", "KT Rolster":"KT",
        "Nongshim RedForce":"NS","OKSavingsBank BRION":"BRION","T1":"T1"
    };
    return abbreviations[fullName] || fullName.substring(0, 3);
}

export function t(currentLang, translations, key, vars = {}) {
    let text = (translations[currentLang] && translations[currentLang][key]) ? translations[currentLang][key] : '';
    Object.keys(vars).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        text = text.replace(regex, vars[k]);
    });
    return text;
}

export function downloadCSV(csvContent, fileName) {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}