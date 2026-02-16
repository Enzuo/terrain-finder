<script>
  import { onMount } from 'svelte'
  import { createLeafletMap } from '$lib/leafletMap.js'
  import CollapsibleSidebar from '$lib/CollapsibleSidebar.svelte'
  import TerrainSearchForm from '$lib/TerrainSearchForm.svelte'
  import TerrainList from '$lib/TerrainList.svelte'
  import { filterAndSortPolygons } from '$lib/terrainUtils.js'
  import { loadTerrainData } from '$lib/terrainDb.js'

  /** @type {App.TerrainData|null} */
  let terrainData
  let map = null
  /** @type {HTMLElement | null} */
  let mapContainer = null
  let error = ''
  let terrainSize = 0
  let terrainMargin = 0
  /** @type {App.TerrainFeature[]} */
  let terrains = []
  /** @type {string|null} */
  let selectedTerrainId = null

  /** @type {string | null} */
  let currentFileKey = null

  onMount(() => {
    currentFileKey = localStorage.getItem('currentFile')
    loadTerrainData(currentFileKey || '').then(data => {
      terrainData = data

      var defaultView =
        terrainData && terrainData.features && terrainData.features.length
          ? terrainData.features[0].geometry.coordinates[0][0].reverse()
          : [46.3105761, 0.1725793]
        map = createLeafletMap(mapContainer, defaultView, 12)
    })

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  // Watch for terrainSize changes and update map
  $: if (map && terrainSize && terrainData) {
    terrains = filterAndSortPolygons(terrainData, terrainSize, terrainMargin)
    map.displayPolygons(terrains, selectedTerrainId)
  }

  /**
   * Center the map on the given polygon feature and copy its first coordinate to clipboard
   * @param {App.TerrainFeature} feature
   */
  function selectTerrain(feature) {
    if (!map) return
    selectedTerrainId = feature.id
    map.centerOnTerrain(selectedTerrainId)
  }

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyDown(event) {
    if (!terrains.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      var currentPolygonIndex = terrains.findIndex((p) => p.id === selectedTerrainId)
      if (currentPolygonIndex < terrains.length - 1) {
        currentPolygonIndex++
      } else {
        currentPolygonIndex = 0
      }
      selectTerrain(terrains[currentPolygonIndex])
    } else if (event.key === 'ArrowUp') {
      var currentPolygonIndex = terrains.findIndex((p) => p.id === selectedTerrainId)
      event.preventDefault()
      if (currentPolygonIndex > 0) {
        currentPolygonIndex--
      } else {
        currentPolygonIndex = terrains.length - 1
      }
      selectTerrain(terrains[currentPolygonIndex])
    }
  }

  // For scrolling selected polygon into view
  let terrainListContainer
  /** @type {HTMLLIElement[]} */
  let terrainListItems = []

  $: {
    if (selectedTerrainId && terrains.length && terrainListItems.length) {
      const idx = terrains.findIndex((p) => p.id === selectedTerrainId)
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
    {terrains}
    selectedTerrainId={selectedTerrainId}
    onTerrainClick={selectTerrain}
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
