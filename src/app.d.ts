// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface TerrainData {
      features: TerrainFeature[]
    }
    interface TerrainFeature {
      id: string
      geometry: {
        type?: string
        coordinates: [number, number][][]
      }
      properties: {
        contenance: number
        numero?: number
      }
    }
    interface TerrainFeatureWithAdjacents extends TerrainFeature {
      fromId?: string // Id of the terrain from which this terrain is adjacent (undefined for original terrains)
      depth: number // Depth of the terrain in the combination (0 for original terrains, 1 for terrains adjacent to original terrains, etc.)
    } 
    interface TerrainCombination {
      id: string // Unique ID for the combination
      terrains: TerrainFeature[]
      totalContenance: number
    }
  }
}

export {}
