<script>
	import favicon from '$lib/assets/favicon.svg';
	export const prerender = false;
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
