<script>
	import favicon from '$lib/assets/favicon-tiny.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
