<script>
    import { ExternalLink, MapPin } from "lucide-svelte";

    let { programs = [] } = $props();
    let selectedId = $state(null);
    let selectedProgram = $derived(programs.find((program) => program.id === selectedId) ?? programs[0] ?? null);
    let mapQuery = $derived(selectedProgram?.location || selectedProgram?.title || "Study abroad");
    let embedUrl = $derived(`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`);
    let externalUrl = $derived(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`);
</script>

{#if selectedProgram}
    <div class="grid min-h-[36rem] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm min-[54rem]:grid-cols-[20rem_minmax(0,1fr)]">
        <div class="max-h-72 overflow-y-auto border-b border-border min-[54rem]:max-h-[36rem] min-[54rem]:border-b-0 min-[54rem]:border-r" aria-label="Program locations">
            <div class="z-10 border-b border-border bg-card/95 p-5 backdrop-blur min-[54rem]:sticky min-[54rem]:top-0">
                <h3 class="text-lg font-semibold text-foreground">Explore by location</h3>
                <p class="mt-1 text-xs leading-5 text-muted-foreground">Select a program to update the map.</p>
            </div>
            <div>
                {#each programs as program (program.id)}
                    <button type="button" class={`w-full border-b border-border px-4 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 motion-reduce:transition-none ${selectedProgram.id === program.id ? "bg-primary/10" : "bg-transparent"}`} aria-pressed={selectedProgram.id === program.id} onclick={() => selectedId = program.id}>
                        <strong class="block truncate text-sm font-semibold text-foreground">{program.title}</strong>
                        <span class="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin class="size-3.5 text-primary" /> {program.location}</span>
                    </button>
                {/each}
            </div>
        </div>

        <div class="relative min-h-[25rem] bg-muted min-[54rem]:min-h-[30rem]">
            <iframe src={embedUrl} title={`Map showing ${selectedProgram.location}`} class="absolute inset-0 h-full w-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-background/90 px-4 py-3 text-foreground shadow-md backdrop-blur max-sm:flex-col max-sm:items-start">
                <span class="text-xs font-semibold">{selectedProgram.location}</span>
                <a href={externalUrl} target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Open full map <ExternalLink class="size-3.5" /></a>
            </div>
        </div>
    </div>
{:else}
    <div class="grid min-h-56 place-items-center rounded-xl border border-border bg-card text-center text-muted-foreground">
        <div><MapPin class="mx-auto size-8" /><h3 class="mt-2 font-semibold">No program locations to display</h3></div>
    </div>
{/if}
