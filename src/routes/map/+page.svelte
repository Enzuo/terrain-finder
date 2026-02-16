<script>
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import CollapsibleSidebar from '$lib/CollapsibleSidebar.svelte'
  import TerrainSearchForm from '$lib/TerrainSearchForm.svelte'
  import TerrainList from '$lib/TerrainList.svelte'
  import { filterAndSortPolygons } from '$lib/terrainUtils.js'
  import { loadTerrainData } from '$lib/terrainDb.js'

  /** @type {App.TerrainData|null} */
  let terrainData
  let map
  let mapContainer
  let error = ''
  let terrainSize = 0
  let terrainMargin = 0
  /** @type {App.TerrainFeature[]} */
  let polygons = []
  /** @type {string|null} */
  let selectedPolygonId = null
  let polygonLayers = []
  let currentFileKey = null

  onMount(async () => {
    currentFileKey = localStorage.getItem('currentFile')
    console.log('Attempting to load terrain data for current file...', currentFileKey)
    const stored = await loadTerrainData(currentFileKey)
    terrainData = stored || null

    var defaultView =
      terrainData && terrainData.features.length
        ? terrainData.features[0].geometry.coordinates[0][0].reverse()
        : [46.3105761, 0.1725793]
    try {
      map = L.map(mapContainer, { maxZoom: 19 }).setView(defaultView, 12)
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      })
      const esriSat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        }
      )
      const baseMaps = {
        OpenStreetMap: osm,
        'Satellite (Esri)': esriSat
      }
      osm.addTo(map)
      L.control.layers(baseMaps, undefined, { position: 'bottomleft' }).addTo(map)
    } catch (e) {
      error = 'Failed to load Leaflet: ' + e.message
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  // Watch for terrainSize changes and update polygons
  $: if (map && terrainSize) {
    if (!terrainData) {
      console.warn('No terrain data available to filter polygons.')
    }
    // Remove previous polygons
    polygonLayers.forEach((layer) => map.removeLayer(layer))
    polygonLayers = []
    // Use filtering logic from +page.js
    polygons = filterAndSortPolygons(terrainData, terrainSize, terrainMargin)

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
  /**
   * Center the map on the given polygon feature and copy its first coordinate to clipboard
   * @param {App.TerrainFeature} feature
   */
  function centerOnPolygon(feature) {
    if (!map || !feature.geometry || feature.geometry.type !== 'Polygon') return
    selectedPolygonId = feature.id
    const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
    const bounds = L.latLngBounds(coords)
    map.fitBounds(bounds, { maxZoom: 19, animate: true })
    // Copy only the first coordinate pair (lat, lng) to clipboard
    try {
      const coordinates = coords[0]
      console.log('Copying coordinates to clipboard:', coordinates)
      if (coordinates) {
        navigator.clipboard.writeText(`${coordinates[0]}, ${coordinates[1]}`)
      }
    } catch (e) {
      // Optionally handle clipboard error
    }
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
      centerOnPolygon(polygons[currentPolygonIndex])
    } else if (event.key === 'ArrowUp') {
      var currentPolygonIndex = polygons.findIndex((p) => p.id === selectedPolygonId)
      event.preventDefault()
      if (currentPolygonIndex > 0) {
        currentPolygonIndex--
      } else {
        currentPolygonIndex = polygons.length - 1
      }
      selectedPolygonId = polygons[currentPolygonIndex].id
      centerOnPolygon(polygons[currentPolygonIndex])
    }
  }

  // For scrolling selected polygon into view
  let terrainListContainer
  /** @type {HTMLLIElement[]} */
  let terrainListItems = []

  $: {
    if (selectedPolygonId && polygons.length && terrainListItems.length) {
      const idx = polygons.findIndex((p) => p.id === selectedPolygonId)
      if (idx !== -1 && terrainListItems[idx]) {
        terrainListItems[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</svelte:head>

<CollapsibleSidebar title="Map {currentFileKey}">
  <TerrainSearchForm
    bind:terrainSize={terrainSize}
    bind:terrainMargin={terrainMargin}
  />
  <TerrainList
    {polygons}
    selectedTerrainId={selectedPolygonId}
    onTerrainClick={centerOnPolygon}
    {terrainListContainer}
    {terrainListItems}
  />
  {terrainSize}
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
