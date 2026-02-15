<script>
  import { parseJsonFile } from '$lib/parseJsonFile.js';
  import { goto } from '$app/navigation';
  import { saveTerrainData } from '$lib/terrainDb.js';
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
        // Store parsed data in IndexedDB and navigate
        await saveTerrainData('terrainData', json);
        goto('/display');
      } catch (err) {
        error = err.message;
      }
    }
  }
</script>

<main style="max-width: 500px; margin: 2rem auto; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: #fff;">
  Télécharger les parcelles depuis : <a href="https://files.data.gouv.fr/cadastre/etalab-cadastre/2023-01-01/geojson/communes/" target="_blank">https://files.data.gouv.fr/cadastre/etalab-cadastre/2023-01-01/geojson/communes/</a>
  <h1>Upload a File</h1>
  <input type="file" accept="application/json,application/gzip,.json,.gz" on:change={handleFileChange} />
  {#if fileName}
    <p><strong>Selected file:</strong> {fileName}</p>
    {#if error}
      <p style="color: red;"><strong>Error:</strong> {error}</p>
    {/if}
  {/if}
</main>
