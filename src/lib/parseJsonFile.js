// src/lib/parseJsonFile.js

// Supports plain JSON and gzip-compressed JSON files
import { ungzip } from 'pako';

/**
 * Reads a File object and parses its contents as JSON.
 * Supports .json and .gz (gzip-compressed JSON) files.
 * @param {File} file - The file to parse.
 * @returns {Promise<any>} - Resolves with the parsed JSON object, or rejects on error.
 */
export function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text;
        if (file.name.endsWith('.gz')) {
          // Decompress gzip and decode as UTF-8
          const uint8 = new Uint8Array(e.target.result);
          text = new TextDecoder('utf-8').decode(ungzip(uint8));
        } else {
          text = e.target.result;
        }
        const json = JSON.parse(text);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON or gzip file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    if (file.name.endsWith('.gz')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}
