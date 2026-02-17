<script>
  /** @type {number} */
  export let terrainSize;
  /** @type {number} */
  export let terrainMargin;

  /** @type {boolean} */
  export let isUsingTerrainCombinator;
  /** @type {number} */
  export let terrainCombinatorMax;
  /** @type {number} */
  export let terrainCombinatorDepth;
</script>

<div class="form-group">
  <label for="filter-number" class="form-label">
    Terrain Size
  </label>
  <input
    id="filter-number"
    type="number"
    bind:value={terrainSize}
    min="0"
    class="form-input"
    placeholder="Enter a number..."
  />
</div>
<div class="form-group">
  <label for="filter-margin" class="form-label">
    Terrain Margin
  </label>
  <input
    id="filter-margin"
    type="number"
    bind:value={terrainMargin}
    min="0"
    class="form-input"
    placeholder="Enter a number..."
  />
</div>

<div class="form-group">
  <label class="form-label">
    <input type="checkbox" bind:checked={isUsingTerrainCombinator} />
    Use Terrain Combinator
  </label>
</div>

{#if isUsingTerrainCombinator}
  <div class="form-group">
    <label for="combinator-max" class="form-label">
      Combinator Max Terrain
    </label>
    <input
      id="combinator-max"
      type="number"
      bind:value={terrainCombinatorMax}
      min=1
      max=10
      class="form-input"
      placeholder="Enter a number..."
    />
  </div>
  <div class="form-group">
    <label for="combinator-depth" class="form-label">
      Combinator Depth
    </label>
    <input
      id="combinator-depth"
      type="number"
      bind:value={terrainCombinatorDepth}
      min=1
      max=5
      class="form-input"
      placeholder="Enter a number..."
    />
  </div>
{/if}


<style>
.form-group {
  margin-bottom: 1.5em;
}
.form-label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5em;
}
.form-input {
  width: 100%;
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
</style>
