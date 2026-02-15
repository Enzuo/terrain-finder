// src/lib/terrainDb.js

/**
 * Open (or create) the IndexedDB database for terrain data.
 * @returns {Promise<IDBDatabase>}
 */
export function openTerrainDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('terrainDb', 1);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('terrain')) {
        db.createObjectStore('terrain');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store terrain data in IndexedDB under the given key.
 * @param {string} key
 * @param {any} data
 * @returns {Promise<void>}
 */
export async function saveTerrainData(key, data) {
  const db = await openTerrainDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('terrain', 'readwrite');
    const store = tx.objectStore('terrain');
    store.put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load terrain data from IndexedDB by key.
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function loadTerrainData(key) {
  const db = await openTerrainDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('terrain', 'readonly');
    const store = tx.objectStore('terrain');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
