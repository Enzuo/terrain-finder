import communesCsv from '../../data/communes.csv?raw';

/**
 * Loads the communes CSV data and returns a map from codeInsee to commune name.
 * @returns {Map<string, string>}
 */
export function loadCommunesMap() {
  // Import CSV as a string using ?raw for Vite/SvelteKit
  return parseCommunesCsv(communesCsv);
}

/**
 * Parse CSV text and return a map from codeInsee to commune name.
 * @param {string} csvText
 * @returns {Map<string, string>}
 */
export function parseCommunesCsv(csvText) {
  const lines = csvText.split('\n');
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Remove quotes and split
    const cols = line.split(',').map(col => col.replace(/^"|"$/g, ''));
    // codeInsee is column 1, name is column 0
    const codeInsee = cols[1];
    const name = cols[0];
    if (codeInsee && name && !map.has(codeInsee)) {
      map.set(codeInsee, name);
    }
  }
  return map;
}
