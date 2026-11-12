<script>
    import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-svelte";
    import DirectoryFilterPanel from "$lib/components/directory/DirectoryFilterPanel.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";
    import {
        SCHOLARSHIP_AMOUNT_OPTIONS,
        SCHOLARSHIP_DEADLINE_OPTIONS
    } from "./scholarship-directory.js";

    let {
        searchQuery = $bindable(),
        filters = $bindable(),
        categoryOptions,
        countryOptions,
        activeFilters = [],
        onRemove,
        onReset
    } = $props();

    const selectedCategory = $derived(categoryOptions.find((option) => option.id === filters.category)?.name ?? "All categories");
    const selectedCountry = $derived(countryOptions.find((option) => option.id === filters.country)?.name ?? "All destinations");
    const selectedAmount = $derived(SCHOLARSHIP_AMOUNT_OPTIONS.find((option) => option.id === filters.amount)?.name ?? "Any award amount");
    const selectedDeadline = $derived(SCHOLARSHIP_DEADLINE_OPTIONS.find((option) => option.id === filters.deadline)?.name ?? "Any deadline");
</script>

<DirectoryFilterPanel
    title="Build a funding shortlist"
    helper="Search first, then narrow the award and deadline."
    variant="scholarships"
    collapsible
    sticky
    activeCount={activeFilters.length}
>
    {#snippet icon()}<SlidersHorizontal class="size-4" aria-hidden="true" />{/snippet}

    {#snippet search()}
        <label for="scholarship-search" class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Search funding</label>
        <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" aria-hidden="true" />
            <Input
                id="scholarship-search"
                type="text"
                placeholder="Award, provider, or destination"
                class="h-12 border-foreground/20 bg-background/80 pl-10 text-base"
                value={searchQuery}
                oninput={(event) => searchQuery = event.target.value}
            />
        </div>
    {/snippet}

    {#snippet chips()}
        {#if activeFilters.length > 0}
            <div class="flex flex-wrap gap-2">
                {#each activeFilters as filter (filter.key)}
                    <button type="button" class="inline-flex items-center gap-1 border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-semibold" onclick={() => onRemove(filter.key)}>
                        {filter.label}<X class="size-3" aria-hidden="true" />
                    </button>
                {/each}
            </div>
        {/if}
    {/snippet}

    <div class="space-y-5">
        <Select.Root type="single" bind:value={filters.category}>
            <Select.Label class="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Category</Select.Label>
            <Select.Trigger class="mt-2 w-full">{selectedCategory}</Select.Trigger>
            <Select.Content>{#each categoryOptions as option}<Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>{/each}</Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={filters.country}>
            <Select.Label class="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Destination</Select.Label>
            <Select.Trigger class="mt-2 w-full">{selectedCountry}</Select.Trigger>
            <Select.Content>{#each countryOptions as option}<Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>{/each}</Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={filters.amount}>
            <Select.Label class="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Award amount</Select.Label>
            <Select.Trigger class="mt-2 w-full">{selectedAmount}</Select.Trigger>
            <Select.Content>{#each SCHOLARSHIP_AMOUNT_OPTIONS as option}<Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>{/each}</Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={filters.deadline}>
            <Select.Label class="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Deadline</Select.Label>
            <Select.Trigger class="mt-2 w-full">{selectedDeadline}</Select.Trigger>
            <Select.Content>{#each SCHOLARSHIP_DEADLINE_OPTIONS as option}<Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>{/each}</Select.Content>
        </Select.Root>

        <Button type="button" variant="ghost" class="w-full justify-start border-t border-border px-0 pt-4" onclick={onReset}>
            <RotateCcw class="size-4" /> Reset all
        </Button>
    </div>
</DirectoryFilterPanel>
