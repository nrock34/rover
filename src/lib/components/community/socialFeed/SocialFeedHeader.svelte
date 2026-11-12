<script>
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Plus, Search, X } from "lucide-svelte";
	import { Input } from "$lib/components/ui/input";

	let {
		searchQuery = $bindable(),
		activeFilter = $bindable("all"),
		activeContentType = $bindable("all"),
		filters = /** @type {ReadonlyArray<{id: string, label: string}>} */ ([]),
		contentTypes = /** @type {ReadonlyArray<{id: string, label: string}>} */ ([]),
		createPostHref = "/community/posts/new",
		hasFilters = false, clearFilters = () => {}
	} = $props();
</script>

<div>
	<Card.Root class="community-feed-header">
		<Card.Header>
			<div class="community-feed-heading">
				<div>
					<h1 class="community-feed-title">Social Feed</h1>
						<p class="community-feed-description">Connect, share, and discover with fellow students and alumni.</p>
				</div>
				<Button href={createPostHref} class="community-create-post">
					<Plus class="h-4 w-4" />
					<span>Create Post</span>
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="relative community-feed-search">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pb-[2px]">
					<Search class="size-4 text-muted-foreground" />
				</div>
				<Input aria-label="Search recent posts" bind:value={searchQuery} type="text" placeholder="Search recent posts, topics, or tags…" class="block w-full pl-9 pr-3" />
			</div>

			<div class="community-filter-row" role="group" aria-label="Filter by topic">
                <span class="community-filter-label">Topic</span>
                <div class="community-filter-options">
                {#each filters as filter}
                    <Button aria-pressed={activeFilter === filter.id} onclick={() => (activeFilter = filter.id)} variant="ghost" class="community-filter-option">{filter.label}</Button>
                {/each}
                </div>
            </div>
            <div class="community-filter-row" role="group" aria-label="Filter by post type">
                <span class="community-filter-label">Type</span>
                <div class="community-filter-options">
                {#each contentTypes as contentType}
                    <Button aria-pressed={activeContentType === contentType.id} onclick={() => (activeContentType = contentType.id)} variant="ghost" class="community-filter-option">{contentType.label}</Button>
                {/each}
                </div>
            </div>
			{#if hasFilters}<Button variant="ghost" onclick={clearFilters} class="community-filter-reset"><X aria-hidden="true" />Clear filters</Button>{/if}
		</Card.Content>
	</Card.Root>
</div>
