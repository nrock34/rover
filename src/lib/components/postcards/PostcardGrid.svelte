<script>
	import PostcardCard from "./PostcardCard.svelte";

	let { postcards = [], compact = false } = $props();
</script>

<div class={compact
	? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
	: "grid w-full grid-cols-1 items-start justify-items-center gap-7 sm:grid-cols-2 xl:grid-cols-3"}>
	{#each postcards as postcard (postcard.id)}
		<PostcardCard {postcard} />
	{/each}
</div>
