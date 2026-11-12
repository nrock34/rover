<script>
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import { Calendar, Clock, ExternalLink, Globe, MapPin, Star, Users } from "lucide-svelte";
	import { getDeadlineLabel } from "$domains/community/mappers.js";


	let { programs = [], limit = 3, cardClass = "", selectedRegion = $bindable("all") } = $props();

	const regions = [
		{ id: "all", name: "All" },
		{ id: "europe", name: "Europe" },
		{ id: "asia", name: "Asia" },
		{ id: "americas", name: "Americas" },
		{ id: "oceania", name: "Oceania" },
		{ id: "africa", name: "Africa" },
		{ id: "other", name: "Other" }
	];

	const filteredPrograms = $derived(
		selectedRegion === "all"
			? programs
			: programs.filter((program) => program.region === selectedRegion)
	);
</script>

<Card.Root class={`community-module community-opportunities ${cardClass}`.trim()}>
	<Card.Header class="community-module-heading">
		<div class="flex items-center gap-2">
			<Globe class="h-5 w-5 text-primary sm:h-6 sm:w-6" />
			<h2 class="text-sm font-bold text-foreground sm:text-base md:text-lg">Study Abroad Programs</h2>
		</div>
		<Button href="/programs" variant="ghost" class="community-module-link">
			<span class="flex items-center gap-1 text-xs font-medium">View All</span>
			<ExternalLink class="h-3 w-3" />
		</Button>
	</Card.Header>

	<Card.Content>
		<div class="community-module-filters">
			{#each regions as region}
				<Button aria-pressed={selectedRegion === region.id} onclick={() => (selectedRegion = region.id)} variant={selectedRegion === region.id ? "secondary" : "outline"} class="community-filter-option">
					{region.name}
				</Button>
			{/each}
		</div>

		<div class="space-y-3">
			{#if filteredPrograms.length > 0}
				{#each filteredPrograms.slice(0, limit) as program (program.id)}
					<div class={`community-opportunity rounded-(--radius) border p-4 ${program.featured ? "border-ring/40 bg-ring/5" : "border-border bg-card"}`}>
						<div class="mb-2 flex items-start justify-between gap-3">
							<div class="flex-1">
								<div class="mb-1 flex items-center gap-1">
									<h3 class="text-card-title-sm font-semibold text-foreground sm:text-sm">{program.title}</h3>
									{#if program.featured}
										<Badge class="bg-primary/15 px-1.5 py-0 text-meta-xs font-medium text-accent-foreground/80 sm:text-xs">Featured</Badge>
									{/if}
								</div>
								<p class="mb-1 text-meta-xs text-secondary-foreground sm:text-xs">{program.provider}</p>
								<div class="mb-1 flex items-center gap-1">
									<MapPin class="h-3 w-3 text-muted-foreground" />
									<span class="text-meta-xs text-muted-foreground sm:text-xs">{program.location}</span>
								</div>
								<p class="mb-2 text-meta-xs text-muted-foreground sm:text-xs">{program.description}</p>
							</div>
							<div class="flex items-center gap-1">
								<Star class="tone-star h-3 w-3 fill-current" />
								<span>{program.rating}</span>
							</div>
						</div>

						<div class="mb-2 grid grid-cols-2 gap-2 text-xs text-secondary-foreground">
							<div class="flex items-center gap-1">
								<Clock class="h-3 w-3" />
								<span>{program.duration}</span>
							</div>
							<div class="flex items-center gap-1">
								<Users class="h-3 w-3" />
								<span>{program.participants}</span>
							</div>
								<div class="flex items-center gap-1">
									<span class="text-meta-xs font-medium sm:text-xs">{program.cost}</span>
								</div>
								<div class="flex items-center gap-1">
									<Calendar class="h-3 w-3" />
									<span class="text-meta-xs sm:text-xs">{getDeadlineLabel(program.deadline)}</span>
								</div>
							</div>

							<div class="my-3 flex flex-wrap items-center gap-1">
								{#each program.highlights as highlight}
									<span class="rounded-(--radius) border bg-muted px-1.5 py-0.25 text-meta-xs sm:text-xs">{highlight}</span>
								{/each}
							</div>

							<div class="flex items-center justify-between">
								<span class="text-meta-xs text-muted-foreground sm:text-xs">
									Deadline: {program.deadline ? new Date(program.deadline).toLocaleDateString() : "TBD"}
								</span>
								<Button href={program.href} class="text-meta-xs sm:text-xs">Learn More</Button>
							</div>
						</div>
					{/each}
			{:else}
				<p class="text-sm text-muted-foreground">No featured programs are available for this region right now.</p>
			{/if}
		</div>
	</Card.Content>

	<div class="community-module-footer">
		<Button href="/programs" class="text-action-sm sm:text-[0.9rem]">Explore All Programs</Button>
	</div>
</Card.Root>
