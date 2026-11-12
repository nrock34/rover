<script>
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import ResilientImage from "$lib/components/shared/ResilientImage.svelte";
    import { getDaysUntil } from "$lib/helper-funcs/funcs";
    import { ArrowRight, CalendarClock, Heart, MapPin } from "lucide-svelte";

    let { scholarships = [] } = $props();

    const editorialImages = [
        "/landing-test/rome-street.webp",
        "/landing-test/community-strip.webp",
        "/landing-test/rome-sunset.webp",
        "/landing-test/origin-collage.webp"
    ];

    function getEditorialImage(scholarship) {
        const key = String(scholarship.id ?? scholarship.title ?? "scholarship");
        const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
        return editorialImages[hash % editorialImages.length];
    }
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[84rem]:grid-cols-4">
    {#each scholarships as scholarship (scholarship.id)}
        {@const daysLeft = getDaysUntil(scholarship.deadline)}
        {@const editorialImage = getEditorialImage(scholarship)}
        <Card.Root class="group h-full gap-0 overflow-hidden rounded-lg border-[#123e72]/10 bg-white py-0 shadow-[0_3px_12px_rgb(18_62_114/0.08)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(18_62_114/0.13)] motion-reduce:transform-none motion-reduce:transition-none">
            <div class="relative aspect-[1.8/1] overflow-hidden bg-muted">
                <ResilientImage src={editorialImage} fallbackSrc="/landing-test/rome-sunset.webp" alt="" loading="lazy" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <div class="absolute inset-0 bg-gradient-to-t from-[#123e72]/75 via-transparent to-transparent" aria-hidden="true"></div>
                {#if scholarship.featured}<Badge class="absolute left-2.5 top-2.5 text-[0.58rem]">Featured</Badge>{/if}
                <span class="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/88 text-[#123e72] shadow-sm backdrop-blur" aria-hidden="true"><Heart class="size-4" /></span>
                <div class="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-2 text-white">
                    <div><p class="text-[0.56rem] font-medium uppercase tracking-[0.08em] text-white/75">Award</p><p class="text-base font-bold leading-none">{scholarship.amount || "Amount varies"}</p></div>
                </div>
            </div>

            <div class="flex min-h-[12.6rem] flex-1 flex-col p-2.5">
                <a href={scholarship.href} class="line-clamp-2 text-[0.76rem] font-bold leading-snug text-[#123e72] transition-colors hover:text-primary">{scholarship.title}</a>
                <p class="mt-1 truncate text-[0.62rem] text-[#123e72]/58">{scholarship.provider}</p>
                <p class="mt-1.5 line-clamp-2 text-[0.66rem] leading-[1.35] text-[#123e72]/68">{scholarship.description}</p>
                <div class="mt-1.5 flex items-center gap-1 truncate text-[0.62rem] text-[#123e72]/58"><MapPin class="size-3 shrink-0 text-primary" /> {scholarship.location || "Multiple destinations"}</div>
                <div class="mt-1 flex items-center gap-1 text-[0.62rem] text-[#123e72]/58"><CalendarClock class="size-3 shrink-0 text-primary" /> <span class="truncate">{scholarship.deadlineLabel ?? "Open deadline"}</span>{#if typeof daysLeft === "number" && daysLeft > 0}<span class="ml-auto shrink-0 font-semibold text-primary">{daysLeft}d</span>{/if}</div>
                <div class="mt-2 flex min-h-5 flex-wrap gap-1">{#each scholarship.eligibility.slice(0, 2) as requirement}<Badge variant="outline" class="border-primary/15 bg-primary/5 px-1.5 py-0 text-[0.56rem] text-[#123e72]">{requirement}</Badge>{/each}</div>
                <Button href={scholarship.href} variant="outline" size="sm" class="mt-auto h-8 w-full border-[#123e72]/22 text-[0.65rem] font-semibold text-[#123e72] hover:border-primary hover:bg-primary/5 hover:text-primary">View Scholarship <ArrowRight class="ml-auto size-3.5" /></Button>
            </div>
        </Card.Root>
    {/each}
</div>
