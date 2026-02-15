<script>
  import { onMount } from 'svelte';
  let data = null;
  let error = '';
  onMount(() => {
    try {
      const stored = sessionStorage.getItem('terrainData');
      if (stored) {
        data = JSON.parse(stored);
      } else {
        error = 'No parsed data found. Please upload a file first.';
      }
    } catch (e) {
      error = 'Failed to load parsed data.';
    }
  });
</script>

<main style="max-width: 700px; margin: 2rem auto; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: #fff;">
  <h1>Parsed JSON Data</h1>
  {#if error}
    <p style="color: red;">{error}</p>
  {:else if data}
    <button on:click={() => window.location.href = '/map'} style="margin-bottom: 1em; padding: 0.5em 1.5em; background: #0077ff; color: #fff; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;">Go to Map</button>
    <pre style="max-height: 500px; overflow: auto; background: #f8f8f8; padding: 1em; border-radius: 4px;">{JSON.stringify(data, null, 2)}</pre>
  {/if}
</main>
