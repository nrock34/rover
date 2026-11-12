<script>
    import { Button } from '$lib/components/ui/button';
    import { RotateCcw } from 'lucide-svelte';
    let { activeCount = 0, onReset, children } = $props();
    const id = $props.id();
</script>
<section class="filter-bar" aria-label="Filter results">
    <div class="filter-bar-heading">
        <span>Filters{#if activeCount} <span class="filter-count">({activeCount})</span>{/if}</span>
        <div class="filter-actions">
            <Button type="button" variant="ghost" size="sm" disabled={!activeCount} onclick={onReset}><RotateCcw aria-hidden="true" />Reset filters</Button>
        </div>
    </div>
    <div {id} class="filter-grid">{@render children()}</div>
</section>
<style>
    .filter-bar { min-width:0;max-width:100%;overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm); }
    .filter-bar-heading { display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem .85rem;font-size:.8rem;font-weight:600; }
    .filter-count { margin-left:.25rem;color:var(--muted-foreground);font-weight:400; }
    .filter-actions { display:flex;align-items:center;gap:.25rem; }
    .filter-grid { display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);grid-template-rows:auto;border-top:1px solid var(--border);padding:0;gap:1px;background:var(--border); }
    .filter-grid :global([data-slot="select-trigger"]:focus-visible) { outline:2px solid var(--ring);outline-offset:-3px; }
</style>
