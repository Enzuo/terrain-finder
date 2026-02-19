import { describe, it, expect } from 'vitest'
import { filterTerrainsWithCombinator } from './terrainUtils'

// Dataset for tests
import TestTerrainDataRaw from '../../data/TestTerrainData.json?raw'
/** @type {App.TerrainData} */
var realTerrainData = JSON.parse(TestTerrainDataRaw)


describe('filterTerrainsWithCombinator', () => {
  it('do not return terrains without combination', () => {
    const result = filterTerrainsWithCombinator(realTerrainData, 110, 0, 1, 1)
    expect(result).toEqual([])
  })

  it('combine 2 adjacent terrains', () => {
    const result = filterTerrainsWithCombinator(realTerrainData, 110+268, 0, 2, 2)
    expect(result.length).toEqual(1)
  })
  
  it('combine 2 adjacent terrains not sharing a point but a portion of segment', () => {
    const result = filterTerrainsWithCombinator(realTerrainData, 15+54, 0, 2, 2)
    expect(result.length).toEqual(1)
  })


  /**
   * Adjacent terrains combinations test dataset:
   *  __ __ __ __ _
   * |A |B |C |D |E|
   * |__|__|__|__|_|
   * 
   */
  describe('adjacent terrains combinations', () => {

    /** @type {App.TerrainData} */
    const terrainDataTest = {
      features: [
        {
          id: 'A',
          properties: { contenance: 10 },
          geometry: { coordinates: [[[0,0],[0,1],[1,1],[1,0],[0,0]]] }
        },
        {
          id: 'B',
          properties: { contenance: 10 },
          geometry: { coordinates: [[[1,0],[1,1],[2,1],[2,0],[1,0]]] }
        },
        {
          id: 'C',
          properties: { contenance: 10 },
          geometry: { coordinates: [[[2,0],[2,1],[3,1],[3,0],[2,0]]] }
        },
        {
          id: 'D',
          properties: { contenance: 10 },
          geometry: { coordinates: [[[3,0],[3,1],[4,1],[4,0],[3,0]]] }
        },
        {
          id: 'E',
          properties: { contenance: 5 },
          geometry: { coordinates: [[[4,0],[4,1],[5,1],[5,0],[4,0]]] }
        }
      ]
    }
    it.only('combine 4 adjacent terrains', () => {
      const result = filterTerrainsWithCombinator(terrainDataTest, 35, 0, 4, 2)
      expect(result.length).toEqual(1)
      expect(result[0].terrains.map(t => t.id).sort()).toEqual(['B', 'C', 'D', 'E'])
    })
  })


})



