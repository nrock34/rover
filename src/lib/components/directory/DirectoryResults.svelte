<script>
    let {
        title,
        countLabel,
        hasResults,
        busy = false,
        loadingLabel = "Loading results",
        emptyTitle,
        emptyDescription,
        dimWhenBusy = true,
        meta = undefined,
        actions = undefined,
        emptyAction = undefined,
        children
    } = $props();
</script>

<section class="mt-8" aria-labelledby="directory-results-heading">
    <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
            <p class="text-sm text-muted-foreground">{countLabel}</p>
            <h2 id="directory-results-heading" class="text-2xl font-semibold">{title}</h2>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3">
            {#if meta}{@render meta()}{/if}
            {#if actions}{@render actions()}{/if}
        </div>
    </div>

    <div class="mt-6 transition-opacity" class:opacity-60={busy && dimWhenBusy} aria-busy={busy}>
        {#if busy}
            <p class="sr-only" role="status" aria-live="polite">{loadingLabel}</p>
        {/if}

        {#if hasResults}
            {@render children()}
        {:else}
            <div class="rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
                <h3 class="text-xl font-semibold">{emptyTitle}</h3>
                <p class="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
                {#if emptyAction}
                    <div class="mt-5">{@render emptyAction()}</div>
                {/if}
            </div>
        {/if}
    </div>
</section>
