<script>
  import { parseJsonFile } from '$lib/parseJsonFile.js';
  import { goto } from '$app/navigation';
  import { listTerrainKeys, saveTerrainData } from '$lib/terrainDb.js';
  import { onMount } from 'svelte';
  import { loadCommunesMap } from '$lib/communes.js';

  let dbKeys = [];
  let communesMap = new Map();

  onMount(async () => {
    dbKeys = await listTerrainKeys();
    communesMap = await loadCommunesMap();
  });

  async function selectKey(key) {
    localStorage.setItem('currentFile', key);
    goto('/map');
  }
  let file;
  let fileName = '';
  let fileContent = '';
  let parsedJson = null;
  let error = '';

  async function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    fileContent = '';
    parsedJson = null;
    error = '';
    if (selectedFile) {
      file = selectedFile;
      fileName = file.name;
      try {
        const json = await parseJsonFile(file);
        parsedJson = json;
        fileContent = JSON.stringify(json, null, 2);
        // Extract number from filename (e.g., 12345.json or 12345.gz)
        const match = file.name.match(/(\d+)/);
        const key = match ? match[1] : 'terrainData';
        await saveTerrainData(key, json);
        localStorage.setItem('currentFile', key);
        goto('/map');
      } catch (err) {
        error = err.message;
      }
    }
  }
</script>

<main style="max-width: 500px; margin: 2rem auto; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: #fff;">
  <img src="/src/lib/assets/favicon.png" alt="App Icon" style="width:48px;height:48px;margin-bottom:1rem;display:block;margin-left:auto;margin-right:auto;" />
  Télécharger les parcelles depuis : <a href="https://files.data.gouv.fr/cadastre/etalab-cadastre/2023-01-01/geojson/communes/" target="_blank">https://files.data.gouv.fr/cadastre/etalab-cadastre/2023-01-01/geojson/communes/</a>
  <h1>Upload a File</h1>
  <input type="file" accept="application/json,application/gzip,.json,.gz" on:change={handleFileChange} />
  {#if fileName}
    <p><strong>Selected file:</strong> {fileName}</p>
    {#if error}
      <p style="color: red;"><strong>Error:</strong> {error}</p>
    {/if}
  {/if}

  <h2>Available Files in Database</h2>
  <ul style="margin-bottom: 2em;">
      {#each dbKeys as key}
        <li>
          <button 
            style="cursor:pointer; border:none; background:none; color:#0077ff; text-decoration:underline; font-size:1em;" 
            on:click={() => selectKey(key)}>
              {key}
              {#if communesMap && communesMap.get(key)}
                <span style="margin-left: 0.5em; color: #333;">({communesMap.get(key)})</span>
              {/if}
          </button>
        </li>
      {/each}
  </ul>
</main>
