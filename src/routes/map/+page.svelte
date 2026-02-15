<script>
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import CollapsibleSidebar from '$lib/CollapsibleSidebar.svelte'
  let map
  let mapContainer
  let leafletLoaded = false
  let error = ''
  let terrainSize = 0
  let polygons = []
  let polygonLayers = []
  /** @type {App.TerrainData | null} */
  let terrainData = null // TerrainData

  function loadTerrainData() {
    try {
      const stored = sessionStorage.getItem('terrainData')
      if (stored) {
        terrainData = JSON.parse(stored)
      } else {
        terrainData = null
      }
    } catch (e) {
      terrainData = null
    }
  }

  onMount(async () => {
    loadTerrainData()
    try {
      map = L.map(mapContainer).setView([46.3105761, 0.1725793], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)
    } catch (e) {
      error = 'Failed to load Leaflet: ' + e.message
    }
  })

  // Watch for terrainSize changes and update polygons
  $: if (map && terrainSize && terrainData) {
    // Remove previous polygons
    polygonLayers.forEach((layer) => map.removeLayer(layer))
    polygonLayers = []
    // Filter polygons by contenance
    polygons = terrainData.features.filter(
      (f) => f.properties && f.properties.contenance == terrainSize
    )
    polygons.forEach((feature) => {
      if (feature.geometry && feature.geometry.type === 'Polygon') {
        // Leaflet expects [lat, lng], but GeoJSON is [lng, lat]
        const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
        console.log('coords', coords)
        const layer = L.polygon(coords, { color: 'red', weight: 2, fillOpacity: 0.3 })
        layer.addTo(map)
        polygonLayers.push(layer)
      }
    })
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</svelte:head>

<CollapsibleSidebar title="Map Controls">
  <div style="margin-bottom: 1.5em;">
    <label for="filter-number" style="font-weight: bold; display: block; margin-bottom: 0.5em;"
      >Filter Number</label
    >
    <input
      id="filter-number"
      type="number"
      bind:value={terrainSize}
      min="0"
      style="width: 100%; padding: 0.5em; border-radius: 4px; border: 1px solid #ccc; font-size: 1rem;"
      placeholder="Enter a number..."
    />
  </div>
  <div style="margin-bottom: 1em;">
    <strong>Matching terrains:</strong>
    {polygons.length}
  </div>
  <p>This is the sidebar content. Add map controls or info here.</p>
</CollapsibleSidebar>

<div class="map-root">
  {#if error}
    <div class="map-error">{error}</div>
  {:else}
    <div bind:this={mapContainer} class="map-fullscreen"></div>
  {/if}
</div>

<style>
  .map-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
  }
  .map-fullscreen {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }
  .map-error {
    color: red;
    position: absolute;
    top: 2rem;
    left: 2rem;
    background: #fff;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
</style>
