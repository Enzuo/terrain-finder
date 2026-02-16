<script>
  /** @type {number} */
  export let terrainSize;
  /** @type {number} */
  export let terrainMargin;
</script>

<div style="margin-bottom: 1.5em;">
  <label for="filter-number" style="font-weight: bold; display: block; margin-bottom: 0.5em;">
    Terrain Size
  </label>
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
  <label for="filter-margin" style="font-weight: bold; display: block; margin-bottom: 0.5em;">
    Terrain Margin
  </label>
  <input
    id="filter-margin"
    type="number"
    bind:value={terrainMargin}
    min="0"
    style="width: 100%; padding: 0.5em; border-radius: 4px; border: 1px solid #ccc; font-size: 1rem;"
    placeholder="Enter a number..."
  />
</div>
