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

/**
 * Approximate search for commune names.
 * Returns a list of { codeInsee, name, score } sorted by best match.
 * @param {string} query
 * @param {Map<string, string>} communesMap
 * @param {number} [maxResults=10]
 * @returns {Array<{ codeInsee: string, name: string, score: number }>}
 */
export function searchCommunesByName(query, communesMap, maxResults = 10) {
  if (!query || !communesMap) return [];
  const normalizedQuery = query.trim().toLowerCase();
  // Simple Levenshtein distance implementation
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
  const results = [];
  for (const [codeInsee, name] of communesMap.entries()) {
    const normalizedName = name.toLowerCase();
    let score = levenshtein(normalizedQuery, normalizedName);
    // Bonus for substring match
    if (normalizedName.includes(normalizedQuery)) score -= 10;
    results.push({ codeInsee, name, score });
  }
  results.sort((a, b) => a.score - b.score);
  return results.slice(0, maxResults);
}

