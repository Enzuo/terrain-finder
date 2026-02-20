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

  /** @type {() => void} */
  export let launchCombinator;
  /** @type {boolean} */
  export let isSearchRunning;
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

<div class="form-group" style="display:flex;align-items:center;gap:0.5em;">
  <label class="form-label" style="margin-bottom:0;">
    <input type="checkbox" bind:checked={isUsingTerrainCombinator} />
    Terrain Combinator
  </label>
  {#if isUsingTerrainCombinator}
    <button disabled={isSearchRunning} type="button" class="launch-btn" on:click={launchCombinator}>
      Launch
    </button>
  {/if}
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
.launch-btn {
  font-size: 0.9em;
  padding: 0.3em 0.8em;
  border-radius: 4px;
  border: 1px solid #0077ff;
  background: #f7faff;
  color: #0077ff;
  cursor: pointer;
  margin-left: 0.5em;
  transition: background 0.2s, color 0.2s, opacity 0.2s;
}
.launch-btn:hover:enabled {
  background: #e0f0ff;
}
.launch-btn:disabled {
  background: #eee;
  color: #aaa;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
