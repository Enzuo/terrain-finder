<script>
  import { onMount } from 'svelte'
  import { createLeafletMap } from '$lib/leafletMap.js'
  import CollapsibleSidebar from '$lib/components/CollapsibleSidebar.svelte'
  import TerrainSearchForm from '$lib/components/TerrainSearchForm.svelte'
  import TerrainList from '$lib/components/TerrainList.svelte'
  import { filterTerrains, filterTerrainsWithCombinator } from '$lib/terrainUtils.js'
  import { loadTerrainData } from '$lib/terrainDb.js'
  import { debounce } from '$lib/utils'

  /** @type {App.TerrainData|null} */
  let terrainData
  /** @type {ReturnType<typeof createLeafletMap>|null} */
  let map = null
  /** @type {HTMLElement} */
  let mapContainer
  let error = ''
  let terrainSize = 0
  let terrainMargin = 0
  /** @type {App.TerrainCombination[]} */
  let terrains = []
  /** @type {string|null} */
  let selectedTerrainId = null
  let isUsingTerrainCombinator = false
  let terrainCombinatorMax = 2
  let terrainCombinatorDepth = 2
  let isSearchRunning = false

  /** @type {string | null} */
  let currentFileKey = null
  let filterDuration = 0;

  onMount(() => {
    currentFileKey = localStorage.getItem('currentFile')
    loadTerrainData(currentFileKey || '').then((data) => {
      terrainData = data
      console.log('Loaded terrain data:', JSON.stringify(terrainData, null, 2))
      var defaultView =
        terrainData && terrainData.features && terrainData.features.length
          ? terrainData.features[0].geometry.coordinates[0][0].toReversed()
          : [46.3105761, 0.1725793]
      map = createLeafletMap(mapContainer, defaultView, 12)
    })

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  // Watch for terrainSize changes and update map
  $: updateTerrains(terrainData, terrainSize, terrainMargin)

  const updateTerrains = debounce((terrainData, terrainSize, terrainMargin, isUsingTerrainCombinator, terrainCombinatorMax, terrainCombinatorDepth) => {
    if (map && terrainData) {
      const start = performance.now();
      if(isUsingTerrainCombinator) {
        // MANUAL Launch
        // TODO with background workers could run default version on change 
        // TODO and more costly versions with button
        // terrains = filterTerrainsWithCombinator(terrainData, terrainSize, terrainMargin, terrainCombinatorMax, terrainCombinatorDepth)
      } else {
        terrains = filterTerrains(terrainData, terrainSize, terrainMargin)
          .map(t => ({ id: t.id, terrains: [t], totalContenance: t.properties.contenance })) 
        map.displayTerrains(terrains, selectedTerrainId)
      }
      filterDuration = Math.round(performance.now() - start);
    }
  }, 500)

  /**
   * Center the map on the given polygon feature and copy its first coordinate to clipboard
   * @param {App.TerrainCombination} terrain
   */
  function selectTerrain(terrain) {
    if (!map) return
    selectedTerrainId = terrain.id
    map.displayTerrains(terrains, selectedTerrainId)
    map.centerOnTerrain(selectedTerrainId)
  }

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyDown(event) {
    if (!terrains.length) return
    const idx = terrains.findIndex((p) => p.id === selectedTerrainId)
    let nextIdx = idx
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      nextIdx = (idx + 1) % terrains.length
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      nextIdx = (idx - 1 + terrains.length) % terrains.length
    }
    if (nextIdx !== idx) selectTerrain(terrains[nextIdx])
  }

  function launchCombinator() {
    if (map && terrainData && !isSearchRunning) {
      isSearchRunning = true;
      const start = performance.now();
      terrains = filterTerrainsWithCombinator(terrainData, terrainSize, terrainMargin, terrainCombinatorMax, terrainCombinatorDepth);
      map.displayTerrains(terrains, selectedTerrainId);
      filterDuration = Math.round(performance.now() - start);
      isSearchRunning = false;
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
    bind:terrainSize 
    bind:terrainMargin 
    bind:isUsingTerrainCombinator 
    bind:terrainCombinatorMax 
    bind:terrainCombinatorDepth
    launchCombinator={launchCombinator}
    isSearchRunning={isSearchRunning}
  />
  <TerrainList
    {terrains}
    {selectedTerrainId}
    onTerrainClick={selectTerrain}
    {terrainListContainer}
    {terrainListItems}
  />
  <div class="perf-bar">
    {#if filterDuration}
      {filterDuration} ms
    {/if}
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
  .perf-bar {
    margin-top: 2em;
    text-align: right;
    font-size: 0.8em;
    color: #888;
  }
</style>
