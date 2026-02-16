<script>
  /** @type {App.TerrainFeature[]} */
  export let terrains = [];
  /** @type {string|null} */
  export let selectedTerrainId = null;
  /** @type {(terrain: App.TerrainFeature) => void} */
  export let onTerrainClick;
  export let terrainListContainer;
  export let terrainListItems;
</script>

<div style="margin-bottom: 1em;">
  <strong>Matching terrains:</strong>
  {terrains.length}
  {#if selectedTerrainId}
    {#if terrains.length}
      &nbsp;|&nbsp;Selected: {terrains.findIndex((p) => p.id === selectedTerrainId) + 1} / {terrains.length}
    {/if}
  {/if}
</div>
<div
  style="margin-bottom: 1em; max-height: 200px; overflow-y: auto;"
  bind:this={terrainListContainer}
>
  <strong>All terrains (sorted by closest size):</strong>
  <ul style="margin: 0; padding-left: 1em;">
    {#each terrains as poly, i (poly.id)}
      <li style="list-style: none; margin-bottom: 0.25em;" bind:this={terrainListItems[i]}>
        <button
          type="button"
          style="cursor:pointer; text-decoration:underline; border:none; background:none; padding:0; font:inherit; {selectedTerrainId ===
          poly.id
            ? 'background:#e0f0ff; color:#0057b8; font-weight:bold;'
            : 'color:#0077ff;'}"
          on:click={() => onTerrainClick(poly)}
        >
          {poly.id} — {poly.properties.contenance} m2 - {poly.properties.numero}
        </button>
      </li>
    {/each}
  </ul>
</div>
