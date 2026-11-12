<script>
	import * as Card from "$lib/components/ui/card";
	import { Users } from "lucide-svelte";

	let { stats = [] } = $props();
</script>

<Card.Root class="community-module community-stats">
	<Card.Header class="community-module-heading">
		<Users class="h-8 w-8 text-primary" />
		<h2>Community Stats</h2>
	</Card.Header>

	<Card.Content>
		{#if stats.length === 0}
			<p class="text-sm text-muted-foreground">Community totals are unavailable right now.</p>
		{:else}
			<div class="grid grid-cols-2 gap-4 text-center">
			{#each stats as stat (stat.name)}
				<div>
					<p class="text-xl font-[900] text-primary">{stat.value}</p>
					<p class="text-xs text-secondary-foreground">{stat.name}</p>
				</div>
			{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
