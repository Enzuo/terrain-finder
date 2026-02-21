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
 * Runs filterTerrainsWithCombinator in a Web Worker
 * @param {App.TerrainData} terrainData 
 * @param {number} terrainSize 
 * @param {number} terrainMargin 
 * @param {number} combinatorMax 
 * @param {number} combinatorDepth 
 * @param {function(string):void} onLog - callback to receive log messages from the worker
 * @return {Promise<App.TerrainCombination[]>}
 */
export function filterTerrainsWithCombinatorAsync(terrainData, terrainSize, terrainMargin, combinatorMax, combinatorDepth, onLog) {
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker(new URL('./terrainCombinator.worker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      reject(e);
      return;
    }
    worker.onmessage = (e) => {
      if(e.data.type === 'log') {
        onLog(e.data.message)
        return
      }
      resolve(e.data.result)
      worker.terminate();
    };
    worker.onerror = (e) => {
      reject(e);
      worker.terminate();
    };
    var params = { terrainData, terrainSize, terrainMargin, terrainCombinatorMax: combinatorMax, terrainCombinatorDepth: combinatorDepth }
    worker.postMessage(params);
  });
}

/**
 * 
 * @param {App.TerrainData} terrainData 
 * @param {number} terrainSize 
 * @param {number} terrainMargin 
 * @param {number} combinatorMax 
 * @param {number} combinatorDepth 
 * @return {App.TerrainCombination[]}
 */
export function filterTerrainsWithCombinator(terrainData, terrainSize, terrainMargin, combinatorMax, combinatorDepth) {
  var terrainmaxSize = terrainSize + terrainMargin
  var terrainminSize = terrainSize - terrainMargin
  var terrainsPool = terrainData.features.filter(f => f.properties.contenance < terrainmaxSize)

  // Optimize by only trying combinations with terrains that are big enough to reach the terrainminSize when combined 
  // (otherwise we would combine a lot of small terrains that would never reach the desired size)
  // 10x increase when looking for large terrains (3000m2) with default 2 combinatorMax
  var initialTerrainsPool = terrainsPool.filter(f => f.properties.contenance >= terrainminSize/(combinatorMax+1))

  /** @type {App.TerrainCombination[]} */
  let combinations = []
  for (let i = 0; i < initialTerrainsPool.length; i++) {
    let terrain = initialTerrainsPool[i];
    if (typeof self !== 'undefined') {
      self.postMessage({ type : 'log', message : `${i}/${initialTerrainsPool.length}` });
    }

    let adjTerrains = findAdjacentTerrains(terrain, terrainsPool, terrainmaxSize, 1, combinatorDepth)
    // console.log('Adjacent terrains for terrain', terrain.id, 'found:', adjTerrains.map(t => t.id))
    
    // Fitler duplicates
    // adjTerrains = adjTerrains.filter((t, index, self) =>
    //   index === self.findIndex((t2) => t2.id === t.id)
    // )
    // console.log('Adjacent terrains for terrain', terrain.id, 'after filtering duplicates:', adjTerrains.map(t => ({ id: t.id, depth: t.depth, fromId: t.fromId })))

    // Try out terrains combinations
    /** @type {App.TerrainCombination} */
    let initialCombination = {
      id: terrain.id,
      terrains: [terrain],
      totalContenance: terrain.properties.contenance
    }
    let newCombinations = tryTerrainCombinations(initialCombination, adjTerrains, terrainminSize, terrainmaxSize, 1, combinatorMax)
    // console.log('Combinations for terrain', terrain.id, 'found:', newCombinations.map(c => c.terrains.map(t => t.id)))
    combinations = combinations.concat(newCombinations)
  }

  // Filter duplicates combinations (same terrains in different order)
  combinations = combinations.filter((c, index, self) =>
    index === self.findIndex((c2) => {
      const ids1 = c.terrains.map(t => t.id).sort().join(',')
      const ids2 = c2.terrains.map(t => t.id).sort().join(',')
      return ids1 === ids2
    })
  )
  // console.log('Combinations after filtering duplicates:', combinations.map(c => c.terrains.map(t => t.id)))

  return combinations.sort(
    (a, b) =>
      Math.abs(a.totalContenance - terrainSize) -
      Math.abs(b.totalContenance - terrainSize)
  );
}

/**
 * 
 * @param {App.TerrainFeature} terrain 
 * @param {App.TerrainFeature[]} terrainsPool
 * @param {number} terrainmaxSize
 * @param {number} depth
 * @param {number} maxDepth
 * 
 * @returns {App.TerrainFeatureWithAdjacents[]} 
 */
function findAdjacentTerrains(terrain, terrainsPool, terrainmaxSize, depth, maxDepth = 2, totalContenance = terrain.properties.contenance) {
  if(depth > maxDepth) {
    return []
  }

  terrainsPool = terrainsPool.filter(t => 
    t.id !== terrain.id 
    && t.properties.contenance + totalContenance <= terrainmaxSize
  )
  
  /** @type {App.TerrainFeatureWithAdjacents[]} */
  let adjacentTerrains = []
  terrainsPool.forEach((otherTerrain) => {
    // if (otherTerrain.id === terrain.id) return // TODO should not be needed if we remove from pool when we find an adjacent terrain
    if (polygonsShareEdge(terrain.geometry.coordinates[0], otherTerrain.geometry.coordinates[0])) {
      // console.log('Found adjacent terrain:', terrain.id, otherTerrain.id, depth)
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
 * 
 * @param {App.TerrainCombination} terrainCombination 
 * @param {App.TerrainFeatureWithAdjacents[]} terrainsPool 
 * @param {number} terrainMinSize 
 * @param {number} terrainMaxSize 
 * @param {number} terrainCount
 * @param {number} maxTerrainCount 
 * @returns {App.TerrainCombination[]}
 */
function tryTerrainCombinations(terrainCombination, terrainsPool, terrainMinSize, terrainMaxSize, terrainCount, maxTerrainCount ) {
  if(terrainCount > maxTerrainCount) {
    if(terrainCombination.totalContenance >= terrainMinSize) {
      return [terrainCombination]
    }
    return []
  }

  // should be able to return terrain combination without going to the maxTerrainCount if the totalContenance is already in the desired range (between terrainMinSize and terrainMaxSize)
  if(terrainCombination.totalContenance >= terrainMinSize && terrainCount > 1) {
    return [terrainCombination]
  }

  /** @type {App.TerrainCombination[]} */
  let combinations = []

  for (let i = 0; i < terrainsPool.length; i++) {
    const otherTerrain = terrainsPool[i]

    // Only adjacent terrains to terrain already in the combination can be added to the combination
    if(!terrainCombination.terrains.some(t => t.id === otherTerrain.fromId)) {
      continue
    }

    // Only terrains not already in the combination can be added to the combination
    if(terrainCombination.terrains.some(t => t.id === otherTerrain.id)) {
      continue
    }

    const combinedContenance = terrainCombination.totalContenance + otherTerrain.properties.contenance
    if(combinedContenance <= terrainMaxSize) {
      const newCombination = {
        id: terrainCombination.id + '-' + i,
        terrains: [...terrainCombination.terrains, otherTerrain],
        totalContenance: combinedContenance
      }
      if (combinedContenance === terrainMaxSize) {
        combinations.push(newCombination)
      }
      else if (combinedContenance < terrainMaxSize) {
        const remainingTerrains = terrainsPool.filter((t, index) => index !== i)
        const subCombinations = tryTerrainCombinations(newCombination, remainingTerrains, terrainMinSize, terrainMaxSize, terrainCount + 1, maxTerrainCount)
        combinations = combinations.concat(subCombinations)
      }
    }
  }

  return combinations
}

/**
 * Check if two geometries (arrays of [lng, lat]) are edge-adjacent (share a segment).
 * @param {Array<[number, number]>} coordsA
 * @param {Array<[number, number]>} coordsB
 * @param {number} [tolerance=1e-7]
 * @returns {boolean}
 */
function areGeometriesEdgeAdjacent(coordsA, coordsB, tolerance = 1e-5) {
  /** @type {(a: [number, number], b: [number, number]) => boolean} */
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



/**
 * 
 * @param {Array<[number, number]>} polygon
 * @returns {[[number, number], [number, number]][]}
 */
function getEdges(polygon) {
  const edges = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    edges.push([a, b]);
  }
  return edges;
}

/**
 * 
 * @param {[number, number]} p1 
 * @param {[number, number]} p2 
 * @param {[number, number]} p3 
 * @returns 
 */
function cross(p1, p2, p3) {
  return (p2[0] - p1[0]) * (p3[1] - p1[1]) -
         (p2[1] - p1[1]) * (p3[0] - p1[0]);
}

/**
 * 
 * @param {[number, number]} a 
 * @param {[number, number]} b 
 * @param {[number, number]} c 
 * @param {[number, number]} d 
 * @returns 
 */
function areCollinear(a, b, c, d) {
  const precision = 1e-12;
  return Math.abs(cross(a, b, c)) < precision && Math.abs(cross(a, b, d)) < precision;
}

/**
 * 
 * @param {number} a1 
 * @param {number} a2 
 * @param {number} b1 
 * @param {number} b2 
 * @returns 
 */
function overlap1D(a1, a2, b1, b2) {
  const minA = Math.min(a1, a2);
  const maxA = Math.max(a1, a2);
  const minB = Math.min(b1, b2);
  const maxB = Math.max(b1, b2);

  return Math.max(minA, minB) < Math.min(maxA, maxB);
}

/**
 * 
 * @param {[[number, number], [number, number]]} seg1 
 * @param {[[number, number], [number, number]]} seg2 
 * @returns 
 */
function segmentsShareEdge(seg1, seg2) {
  const [a, b] = seg1;
  const [c, d] = seg2;

  // Must be collinear
  if (!areCollinear(a, b, c, d)) return false;

  // Check overlap in X or Y direction
  if (a[0] !== b[0]) {
    return overlap1D(a[0], b[0], c[0], d[0]);
  } else {
    return overlap1D(a[1], b[1], c[1], d[1]);
  }
}

/** 
 * @param {Array<[number, number]>} poly1
 * @param {Array<[number, number]>} poly2
*/
function polygonsShareEdge(poly1, poly2) {
  const edges1 = getEdges(poly1);
  const edges2 = getEdges(poly2);

  for (const e1 of edges1) {
    for (const e2 of edges2) {
      if (segmentsShareEdge(e1, e2)) {
        return true;
      }
    }
  }
  return false;
}