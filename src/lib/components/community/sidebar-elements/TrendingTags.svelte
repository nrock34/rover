<script>
	import * as Card from "$lib/components/ui/card";
	import { TrendingUp } from "lucide-svelte";

	let { tags = [] } = $props();
</script>

<Card.Root class="community-module community-trending">
	<Card.Header class="community-module-heading">
		<TrendingUp class="h-4 w-4 text-primary/80 sm:h-6 sm:w-6" />
		<h2>Trending Topics</h2>
	</Card.Header>
	<Card.Content class="p-0">
		{#if tags.length === 0}
			<p class="py-2 text-xs text-muted-foreground">No trending topics yet.</p>
		{:else}
		{#each tags as tag (tag.tag)}
				<a href={`/community/posts?tag=${encodeURIComponent(tag.tag)}`} class="flex items-center rounded-(--radius) hover:bg-border/15">
					<span class="text-micro-xs pr-1.5 sm:pr-2 sm:text-xs">#</span>
					<div class="flex w-full items-center justify-between">
						<span class="text-meta-xs pr-4 font-medium text-accent-foreground sm:text-xs md:text-action-sm lg:text-sm">{tag.tag}</span>
						<span class="text-micro-xs text-muted-foreground sm:text-meta-xs md:text-xs">{tag.posts} posts</span>
					</div>
				</a>
		{/each}
		{/if}
	</Card.Content>
</Card.Root>
