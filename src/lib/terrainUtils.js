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
  var terrainmaxSize = terrainSize + terrainMargin
  var terrainminSize = terrainSize - terrainMargin
  var terrainsPool = terrainData.features.filter(f => f.properties.contenance < terrainmaxSize)

  for (let terrain of terrainsPool) {

    let adjTerrains = findAdjacentTerrains(terrain, terrainsPool, terrainmaxSize, 1, combinatorDepth)
    console.log('Adjacent terrains for terrain', terrain.id, 'found:', adjTerrains)
    
    // Fitler duplicates

    // Try out terrains combinations
  }



  return []
}

/**
 * 
 * @param {App.TerrainFeature} terrain 
 * @param {App.TerrainFeature[]} terrainsPool
 * @param {number} terrainmaxSize
 * @param {number} depth
 * @param {number} maxDepth
 * 
 * @returns {App.TerrainFeature[]} 
 */
function findAdjacentTerrains(terrain, terrainsPool, terrainmaxSize, depth, maxDepth = 2, totalContenance = terrain.properties.contenance) {
  if(depth > maxDepth) {
    return []
  }

  terrainsPool = terrainsPool.filter(t => 
    t.id !== terrain.id 
    && t.properties.contenance + totalContenance <= terrainmaxSize
  )
  
  /** @type {App.TerrainFeature[]} */
  let adjacentTerrains = []
  terrainsPool.forEach((otherTerrain) => {
    // if (otherTerrain.id === terrain.id) return // TODO should not be needed if we remove from pool when we find an adjacent terrain
    if (areGeometriesEdgeAdjacent(terrain.geometry.coordinates[0], otherTerrain.geometry.coordinates[0])) {
      console.log('Found adjacent terrain:', terrain.id, otherTerrain.id, depth)
      let adjacentTerrain = JSON.parse(JSON.stringify(otherTerrain)) // Deep copy to avoid mutating original data
      adjacentTerrain.depth = depth
      adjacentTerrain.fromId = terrain.id

      adjacentTerrains.push(adjacentTerrain)
      let contenanceWithAdjacentTerrain = totalContenance + adjacentTerrain.properties.contenance
      let adjacentTerrainsRecursive = findAdjacentTerrains(otherTerrain, terrainsPool, terrainmaxSize, depth + 1, maxDepth, contenanceWithAdjacentTerrain)
      adjacentTerrains = adjacentTerrains.concat(adjacentTerrainsRecursive)
    }
  })
  return adjacentTerrains
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


