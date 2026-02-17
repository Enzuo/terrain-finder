import { describe, it, expect } from 'vitest'
import { filterTerrainsWithCombinator } from './terrainUtils'

// Dataset for tests
import TestTerrainDataRaw from '../../data/TestTerrainData.json?raw'
/** @type {App.TerrainData} */
var terrainData = JSON.parse(TestTerrainDataRaw)


describe('filterTerrainsWithCombinator', () => {
  it('do not return terrains without combination', () => {
    const result = filterTerrainsWithCombinator(terrainData, 110, 0, 1, 1)
    expect(result).toEqual([])
  })

  it.only('combine 2 adjacent terrains', () => {
    const result = filterTerrainsWithCombinator(terrainData, 110+268, 0, 2, 2)
    expect(result.length).toEqual(1)
  })
  
  it('combine 2 adjacent terrains not sharing a point but a portion of segment', () => {
    const result = filterTerrainsWithCombinator(terrainData, 15+54, 0, 2, 2)
    expect(result.length).toEqual(1)
  })
})
