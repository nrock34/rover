<script>
    let {
        title,
        helper = undefined,
        variant = "default",
        collapsible = false,
        sticky = false,
        activeCount = 0,
        icon = undefined,
        search = undefined,
        chips = undefined,
        children,
        class: className = ""
    } = $props();

    let open = $state(false);
    const panelId = $derived(`directory-filters-${variant}`);
</script>

<section class={`rounded-xl border border-border bg-card shadow-sm ${sticky ? "lg:sticky lg:top-[6.5rem]" : ""} ${className}`}>
    <div class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div class="flex items-center gap-3">
            {#if icon}<span class="text-primary">{@render icon()}</span>{/if}
            <div>
                <h2 class="font-semibold">{title}</h2>
                {#if helper}<p class="mt-0.5 text-xs text-muted-foreground">{helper}</p>{/if}
            </div>
        </div>
        {#if activeCount > 0}<span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{activeCount}</span>{/if}
    </div>

    {#if search}<div class="px-5 pt-5">{@render search()}</div>{/if}
    {#if chips}<div class="px-5 pt-4">{@render chips()}</div>{/if}

    {#if collapsible}
        <button class="mx-5 mt-4 flex min-h-11 w-[calc(100%-2.5rem)] items-center gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm lg:hidden" type="button" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
            <span>{open ? "Hide filters" : "More filters"}</span>
            <i class={`ml-auto size-2 border-b-2 border-r-2 border-current ${open ? "rotate-[225deg]" : "rotate-45"}`} aria-hidden="true"></i>
        </button>
    {/if}

    <div id={panelId} class={`p-5 ${collapsible && !open ? "max-lg:hidden" : ""}`}>
        {@render children()}
    </div>
</section>
