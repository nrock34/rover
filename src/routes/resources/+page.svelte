<script>
	import ResourcesView from "$lib/components/resources/ResourcesView.svelte";

	let { data } = $props();
</script>

<div class="app-shell py-8">
	<ResourcesView resourcesByCategory={data.resourcesByCategory} />
</div>
