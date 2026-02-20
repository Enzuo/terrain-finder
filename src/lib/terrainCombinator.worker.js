import { filterTerrainsWithCombinator } from './terrainUtils.js';

self.onmessage = function(e) {
  const { terrainData, terrainSize, terrainMargin, terrainCombinatorMax, terrainCombinatorDepth } = e.data;
  // Run the combinator
  const result = filterTerrainsWithCombinator(terrainData, terrainSize, terrainMargin, terrainCombinatorMax, terrainCombinatorDepth);
  self.postMessage({ result });
};
