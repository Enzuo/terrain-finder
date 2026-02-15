<script>
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import CollapsibleSidebar from '$lib/CollapsibleSidebar.svelte'
  let map
  let mapContainer
  let leafletLoaded = false
  let error = ''
  let terrainSize = 0
  let terrainMargin = 0
  /** @type {App.TerrainFeature[]} */
  let polygons = []
  /** @type {string|null} */
  let selectedPolygonId = null
  let polygonLayers = []
  /** @type {App.TerrainData | null} */
  let terrainData = null // TerrainData


  import { loadTerrainData } from '$lib/terrainDb.js';
  async function loadTerrainDataFromDb() {
    try {
      const stored = await loadTerrainData('terrainData');
      if (stored) {
        terrainData = stored;
      } else {
        terrainData = null;
      }
    } catch (e) {
      terrainData = null;
    }
  }

  onMount(async () => {
    await loadTerrainDataFromDb()
    try {
      map = L.map(mapContainer).setView([46.3105761, 0.1725793], 13)
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      });
      const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      const baseMaps = {
        "OpenStreetMap": osm,
        "Satellite (Esri)": esriSat
      };
      osm.addTo(map);
      L.control.layers(baseMaps, undefined, { position: 'bottomleft' }).addTo(map);
    } catch (e) {
      error = 'Failed to load Leaflet: ' + e.message
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  // Watch for terrainSize changes and update polygons
  $: if (map && terrainSize && terrainData) {
    // Remove previous polygons
    polygonLayers.forEach((layer) => map.removeLayer(layer))
    polygonLayers = []
    // Filter polygons by contenance
    polygons = terrainData.features.filter(
      (f) =>
        f.properties &&
        f.properties.contenance >= terrainSize - terrainMargin &&
        f.properties.contenance <= terrainSize + terrainMargin
    )
    // Sorted list filtered polygons by distance to terrainSize
    polygons = polygons.sort(
      (a, b) =>
        Math.abs(a.properties.contenance - terrainSize) -
        Math.abs(b.properties.contenance - terrainSize)
    )

    polygons.forEach((feature) => {
      if (feature.geometry && feature.geometry.type === 'Polygon') {
        // Leaflet expects [lat, lng], but GeoJSON is [lng, lat]
        const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
        const isSelected = feature.id === selectedPolygonId
        const layer = L.polygon(coords, {
          color: isSelected ? 'blue' : 'red',
          weight: isSelected ? 4 : 2,
          fillOpacity: isSelected ? 0.5 : 0.3
        })
        layer.addTo(map)
        polygonLayers.push(layer)
      }
    })
  }

  // Center the map on the selected polygon
  function centerOnPolygon(feature) {
    if (!map || !feature.geometry || feature.geometry.type !== 'Polygon') return
    selectedPolygonId = feature.id
    const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
    const bounds = L.latLngBounds(coords)
    map.fitBounds(bounds, { maxZoom: 18, animate: true })
  }

  // Keyboard navigation for terrain list
  function handleKeyDown(event) {
    if (!polygons.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      var currentPolygonIndex = polygons.findIndex((p) => p.id === selectedPolygonId)
      if (currentPolygonIndex < polygons.length - 1) {
        currentPolygonIndex++
      } else {
        currentPolygonIndex = 0
      }
      selectedPolygonId = polygons[currentPolygonIndex].id
    } else if (event.key === 'ArrowUp') {
      var currentPolygonIndex = polygons.findIndex((p) => p.id === selectedPolygonId)
      event.preventDefault()
      if (currentPolygonIndex > 0) {
        currentPolygonIndex--
      } else {
        currentPolygonIndex = polygons.length - 1
      }
      selectedPolygonId = polygons[currentPolygonIndex].id
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</svelte:head>

<CollapsibleSidebar title="Map Controls">
  <div style="margin-bottom: 1.5em;">
    <label for="filter-number" style="font-weight: bold; display: block; margin-bottom: 0.5em;"
      >Terrain Size</label
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
  <div style="margin-bottom: 1.5em;">
    <label for="filter-number" style="font-weight: bold; display: block; margin-bottom: 0.5em;"
      >Terrain Margin</label
    >
    <input
      id="filter-number"
      type="number"
      bind:value={terrainMargin}
      min="0"
      style="width: 100%; padding: 0.5em; border-radius: 4px; border: 1px solid #ccc; font-size: 1rem;"
      placeholder="Enter a number..."
    />
  </div>
  <div style="margin-bottom: 1em;">
    <strong>Matching terrains:</strong>
    {polygons.length}
  </div>
  <div style="margin-bottom: 1em; max-height: 200px; overflow-y: auto;">
    <strong>All terrains (sorted by closest size):</strong>
    <ul style="margin: 0; padding-left: 1em;">
      {#each polygons as poly}
        <li style="list-style: none; margin-bottom: 0.25em;">
          <button
            type="button"
            style="cursor:pointer; text-decoration:underline; border:none; background:none; padding:0; font:inherit; {selectedPolygonId ===
            poly.id
              ? 'background:#e0f0ff; color:#0057b8; font-weight:bold;'
              : 'color:#0077ff;'}"
            on:click={() => centerOnPolygon(poly)}
          >
            {poly.id} — {poly.properties.contenance} m2 - {poly.properties.numero}
          </button>
        </li>
      {/each}
    </ul>
  </div>
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
