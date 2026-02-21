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



<div class="combinator-group">
  <div style="display:flex;align-items:center;gap:0.5em;">
    <input type="checkbox" bind:checked={isUsingTerrainCombinator} id="combinator-checkbox" />
    <label for="combinator-checkbox" class="form-label" style="margin-bottom:0;">Terrain Combinator</label>
  </div>
  {#if isUsingTerrainCombinator}
    <div class="combinator-params">
      <label for="combinator-max" class="combinator-param-label">Max</label>
      <input
        id="combinator-max"
        type="number"
        bind:value={terrainCombinatorMax}
        min=1
        max=10
        class="combinator-input"
        aria-label="Combinator Max Terrain"
      />
      <label for="combinator-depth" class="combinator-param-label">Depth</label>
      <input
        id="combinator-depth"
        type="number"
        bind:value={terrainCombinatorDepth}
        min=1
        max=5
        class="combinator-input"
        aria-label="Combinator Depth"
      />
    </div>
    <div class="launch-btn-row">
      <button disabled={isSearchRunning} type="button" class="launch-btn blue" on:click={launchCombinator}>
        Launch
      </button>
    </div>
  {/if}
</div>


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
.combinator-group {
  margin-bottom: 1.5em;
}
.combinator-params {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.5em;
}
.combinator-param-label {
  font-size: 0.9em;
  margin-right: 0.2em;
}
.combinator-input {
  width: 3em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.9em;
  text-align: center;
}
.launch-btn-row {
  margin-top: 0.5em;
}
.launch-btn {
  font-size: 0.95em;
  padding: 0.4em 1.2em;
  border-radius: 4px;
  border: 1px solid #0077ff;
  background: #0077ff;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, opacity 0.2s;
  margin-left: 0;
}
.launch-btn.blue {
  background: #0077ff;
  color: #fff;
  border-color: #0077ff;
}
.launch-btn:hover:enabled {
  background: #005fd1;
}
.launch-btn:disabled {
  background: #eee;
  color: #aaa;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
