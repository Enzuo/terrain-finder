// src/lib/terrainUtils.js
/**
 * Filters and sorts polygons by terrain size and margin.
 * @param {App.TerrainData} terrainData
 * @param {number} terrainSize
 * @param {number} terrainMargin
 * @returns {App.TerrainFeature[]}
 */
export function filterAndSortPolygons(terrainData, terrainSize, terrainMargin) {
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
