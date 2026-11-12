<script>
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import ResilientImage from "$lib/components/shared/ResilientImage.svelte";
    import { ArrowRight, Heart, MapPin } from "lucide-svelte";

    let { durations, sortedPrograms } = $props();
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[84rem]:grid-cols-4">
    {#each sortedPrograms as program (program.id)}
        {@const durationLabel = durations.find((option) => option.id === program.duration)?.name.split("-")[0] ?? program.duration}
        <Card.Root class="group h-full gap-0 overflow-hidden rounded-lg border-[#123e72]/10 bg-white py-0 shadow-[0_3px_12px_rgb(18_62_114/0.08)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(18_62_114/0.13)] motion-reduce:transform-none motion-reduce:transition-none">
            <div class="relative aspect-[1.8/1] overflow-hidden bg-muted">
                <ResilientImage src={program.image} fallbackSrc="https://images.pexels.com/photos/28838309/pexels-photo-28838309.jpeg" alt={program.title} loading="lazy" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span class="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/88 text-[#123e72] shadow-sm backdrop-blur" aria-hidden="true"><Heart class="size-4" /></span>
            </div>
            <div class="flex flex-1 flex-col p-2.5">
                <a href={program.href} class="line-clamp-2 text-[0.76rem] font-bold leading-snug text-[#123e72] transition-colors hover:text-primary">{program.title}</a>
                <p class="mt-1 flex items-center gap-1 truncate text-[0.62rem] text-[#123e72]/58"><MapPin class="size-3 shrink-0" /> {program.location}</p>
                <p class="mt-1.5 line-clamp-2 text-[0.66rem] leading-[1.35] text-[#123e72]/68">{program.description}</p>
                <div class="mb-3 mt-2 flex min-h-5 flex-wrap gap-1">
                    <Badge variant="outline" class="border-primary/15 bg-primary/5 px-1.5 py-0 text-[0.56rem] text-[#123e72]">{durationLabel}</Badge>
                    {#if program.highlights[0]}<Badge variant="outline" class="border-primary/15 bg-primary/5 px-1.5 py-0 text-[0.56rem] text-[#123e72]">{program.highlights[0]}</Badge>{/if}
                    {#if program.fields?.[0]}<Badge variant="outline" class="border-primary/15 bg-primary/5 px-1.5 py-0 text-[0.56rem] text-[#123e72]">{program.fields[0]}</Badge>{/if}
                </div>
                <Button href={program.href} variant="outline" size="sm" class="mt-auto h-8 w-full border-[#123e72]/22 text-[0.65rem] font-semibold text-[#123e72] hover:border-primary hover:bg-primary/5 hover:text-primary">View Program <ArrowRight class="ml-auto size-3.5" /></Button>
            </div>
        </Card.Root>
    {/each}
</div>
