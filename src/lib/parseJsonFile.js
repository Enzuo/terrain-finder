// src/lib/parseJsonFile.js

/**
 * Reads a File object and parses its contents as JSON.
 * @param {File} file - The file to parse.
 * @returns {Promise<any>} - Resolves with the parsed JSON object, or rejects on error.
 */
export function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}
