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
				features : TerrainFeature[]
		}
		interface TerrainFeature {
			id : string,
			geometry: {
				type: string,
				coordinates: number[][][]
			},
			properties: {
				contenance: number
				numero: number
			}
		}
	}
}

export {};
