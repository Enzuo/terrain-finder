<script>
	import favicon from '$lib/assets/favicon-tiny.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
  <title>Terrain Finder</title>
</svelte:head>

{@render children()}
