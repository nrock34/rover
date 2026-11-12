<script>
    import * as Select from '$lib/components/ui/select';
    let { label, compactLabel = label, icon: Icon, options = [], value = $bindable('all'), onValueChange, disabled = false } = $props();
    const selected = $derived(options.find(option => option.id === value)?.name ?? (value !== 'all' ? value : options[0]?.name) ?? 'Any');
</script>

<Select.Root type="single" bind:value {onValueChange} {disabled}>
    <Select.Trigger aria-label={`${label}: ${selected}`} title={`${label}: ${selected}`} data-active={value !== 'all'} class="directory-filter-trigger">
        <span class="filter-copy">
            <span class="filter-label"><Icon aria-hidden="true" /><span class="filter-label-text">{label}</span></span>
            <span class="filter-value">{selected}</span>
            <span class="filter-compact-label" aria-hidden="true">{compactLabel}</span>
        </span>
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            <Select.Label>{label}</Select.Label>
            {#each options as option (option.id)}
                <Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
</Select.Root>

<style>
    :global(.directory-filter-trigger[data-slot="select-trigger"]) { width:100%;height:4rem;min-width:0;gap:.5rem;padding:.65rem .85rem;border:0;border-radius:0;box-shadow:none;background:var(--card);text-align:left; }
    :global(.directory-filter-trigger:hover) { background:var(--muted); }
    .filter-copy { display:flex;flex-direction:column;gap:.3rem;min-width:0;flex:1; }
    .filter-label { display:flex;align-items:center;min-width:0;gap:.4rem;font-size:.75rem;line-height:1.2;color:var(--muted-foreground); }
    .filter-label-text { overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .filter-label :global(svg) { width:.9rem;height:.9rem;flex-shrink:0;color:var(--primary); }
    .filter-value { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8125rem;line-height:1.3;font-weight:600;color:var(--foreground); }
    .filter-compact-label { display:none; }
    @media (min-width:768px) and (max-width:1100px) {
        :global(.directory-filter-trigger[data-slot="select-trigger"]) { gap:.25rem;padding:.65rem .5rem; }
        .filter-label { gap:.25rem;font-size:.6875rem; }
        .filter-value { font-size:.75rem; }
    }
    @media (max-width:767px) {
        :global(.directory-filter-trigger[data-slot="select-trigger"]) { position:relative;flex-direction:column;justify-content:center;height:3.5rem;gap:.125rem;padding:.25rem .125rem; }
        :global(.directory-filter-trigger[data-slot="select-trigger"] > svg) { display:block;align-self:center;width:.875rem;height:.875rem;opacity:1; }
        :global(.directory-filter-trigger[data-active="true"])::after { content:"";position:absolute;top:.375rem;right:.375rem;width:.3rem;height:.3rem;border-radius:50%;background:var(--primary); }
        .filter-copy { flex:none;width:100%;align-items:center;gap:.25rem; }
        .filter-label { justify-content:center; }
        .filter-label :global(svg) { width:1rem;height:1rem; }
        .filter-label-text,.filter-value { display:none; }
        .filter-compact-label { display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.625rem;line-height:1.2;font-weight:600;color:var(--foreground); }
    }
</style>
