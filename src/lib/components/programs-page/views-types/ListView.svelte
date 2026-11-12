<script>
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import ResilientImage from "$lib/components/shared/ResilientImage.svelte";
    import { ArrowRight, Calendar, DollarSign, MapPin, Star } from "lucide-svelte";

    let { sortedPrograms, durations } = $props();

    const formatCost = (cost) => {
        const value = Number(cost);
        return Number.isFinite(value) && value > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
            : "Ask provider";
    };
</script>

<div class="flex flex-col gap-5">
    {#each sortedPrograms as program (program.id)}
        {@const durationLabel = durations.find((option) => option.id === program.duration)?.name.split("-")[0] ?? program.duration}

        <Card.Root class="group grid min-h-64 grid-cols-1 gap-0 overflow-hidden rounded-xl border-border bg-card p-0 shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md motion-reduce:transition-none md:grid-cols-[minmax(14rem,0.34fr)_minmax(0,0.66fr)]">
            <div class="relative min-h-72 overflow-hidden bg-muted md:min-h-full">
                <ResilientImage src={program.image} fallbackSrc="https://images.pexels.com/photos/28838309/pexels-photo-28838309.jpeg" alt={program.title} loading="lazy" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" aria-hidden="true"></div>
                {#if program.featured}<Badge class="absolute left-4 top-4 bg-primary text-primary-foreground">Featured</Badge>{/if}
            </div>

            <div class="flex min-w-0 flex-col justify-between gap-4 p-[clamp(1.25rem,2.5vw,2rem)]">
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{program.provider}</p>
                        <a href={program.href} class="mt-2 block text-2xl font-semibold leading-tight tracking-tight transition-colors hover:text-primary">{program.title}</a>
                        <p class="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin class="size-4 text-primary" /> {program.location}</p>
                    </div>
                    {#if Number(program.rating) > 0}<span class="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold"><Star class="size-3.5 fill-current text-yellow-500" /> {program.rating}</span>{/if}
                </div>

                <p class="line-clamp-2 text-sm leading-6 text-muted-foreground">{program.description}</p>

                <div class="grid items-center gap-4 border-t border-border pt-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span class="flex items-center gap-1.5"><Calendar class="size-4 text-primary" /><strong class="text-foreground">{durationLabel}</strong></span>
                        <span class="flex items-center gap-1.5"><DollarSign class="size-4 text-primary" /><strong class="text-foreground">{formatCost(program.cost)}</strong></span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 lg:justify-end">{#each program.highlights.slice(0, 2) as highlight}<Badge variant="outline" class="text-xs">{highlight}</Badge>{/each}</div>
                    <Button href={program.href} variant="ghost" class="h-auto justify-start px-0 py-1 text-sm font-semibold text-primary shadow-none">View program <ArrowRight class="size-4" /></Button>
                </div>
            </div>
        </Card.Root>
    {/each}
</div>
