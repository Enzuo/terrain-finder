// src/lib/terrainUtils.js
/**
 * Filters and sorts polygons by terrain size and margin.
 * @param {App.TerrainData} terrainData
 * @param {number} terrainSize
 * @param {number} terrainMargin
 * @returns {App.TerrainFeature[]}
 */
export function filterTerrains(terrainData, terrainSize, terrainMargin) {
  if (!terrainData || !terrainData.features) return [];
  let filtered = terrainData.features.filter(
    (f) =>
      f.properties &&
      f.properties.contenance >= terrainSize - terrainMargin &&
      f.properties.contenance <= terrainSize + terrainMargin
  );
  return filtered.sort(
    (a, b) =>
      Math.abs(a.properties.contenance - terrainSize) -
      Math.abs(b.properties.contenance - terrainSize)
  );
}

/**
 * 
 * @param {App.TerrainData} terrainData 
 * @param {number} terrainSize 
 * @param {number} terrainMargin 
 * @param {number} combinatorMax 
 * @param {number} combinatorDepth 
 */
export function filterTerrainsWithCombinator(terrainData, terrainSize, terrainMargin, combinatorMax, combinatorDepth) {
  for (let i = 0; i < terrainData.features.length - 1; i++) {
    let terrain = terrainData.features[i]
    findAdjacentTerrains(terrain, terrainData)
  }

  return []
}

/**
 * 
 * @param {App.TerrainFeature} terrain 
 * @param {App.TerrainData} terrainData 
 */
function findAdjacentTerrains(terrain, terrainData) {
  terrainData.features.forEach((other) => {
    if (other.id === terrain.id) return
    if (areGeometriesEdgeAdjacent(terrain.geometry.coordinates[0], other.geometry.coordinates[0])) {
      console.log('Found adjacent terrains:', terrain.id, other.id)
    }
  })
}

/**
 * Check if two geometries (arrays of [lng, lat]) are edge-adjacent (share a segment).
 * @param {Array<[number, number]>} coordsA
 * @param {Array<[number, number]>} coordsB
 * @param {number} [tolerance=1e-7]
 * @returns {boolean}
 */
function areGeometriesEdgeAdjacent(coordsA, coordsB, tolerance = 1e-7) {
  function pointsEqual([lng1, lat1], [lng2, lat2]) {
    return Math.abs(lng1 - lng2) < tolerance && Math.abs(lat1 - lat2) < tolerance;
  }
  for (let i = 0; i < coordsA.length - 1; i++) {
    const segA1 = coordsA[i];
    const segA2 = coordsA[i + 1];
    for (let j = 0; j < coordsB.length - 1; j++) {
      const segB1 = coordsB[j];
      const segB2 = coordsB[j + 1];
      // Check if segments are the same (either direction)
      if (
        (pointsEqual(segA1, segB1) && pointsEqual(segA2, segB2)) ||
        (pointsEqual(segA1, segB2) && pointsEqual(segA2, segB1))
      ) {
        return true;
      }
    }
  }
  return false;
}


