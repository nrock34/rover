<script>
	import { CalendarDays, Eye, Heart, MapPin } from "lucide-svelte";
	import Stamp from "$lib/assets/stamp.svelte";
	import ResilientImage from "$lib/components/shared/ResilientImage.svelte";

	const FALLBACK_IMAGE = "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg";

	let { postcard, basePath = "/postcards" } = $props();

	function formatDate(value) {
		if (!value || Number.isNaN(new Date(value).getTime())) return "Date unavailable";
		return new Intl.DateTimeFormat("en", {
			year: "numeric",
			month: "short",
			day: "numeric"
		}).format(new Date(value));
	}

	function initials(name) {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}

	let city = $derived(postcard.location?.city?.trim() ?? "");
	let country = $derived(postcard.location?.country?.trim() ?? "");
	let location = $derived([city, country].filter(Boolean).join(", "));
</script>

<article class="postcard-paper w-full border border-border/80 bg-card p-2 shadow-sm">
	<div class="flex h-full flex-col overflow-hidden border border-foreground/15 bg-background">
		<a href={postcard.href} class="postcard-photo relative block shrink-0 overflow-hidden bg-muted" aria-label={`Read ${postcard.title}`}>
			<ResilientImage
				src={postcard.image ?? FALLBACK_IMAGE}
				fallbackSrc={FALLBACK_IMAGE}
				alt=""
				class="size-full object-cover object-center"
				loading="lazy"
			/>

			<div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
				{#if postcard.region}
					<span class="inline-flex items-center gap-1 border border-white/35 bg-background/90 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
						<MapPin class="size-3.5 fill-primary text-primary" aria-hidden="true" />
						{postcard.region}
					</span>
				{:else}
					<span></span>
				{/if}
				<Stamp class="size-10 shrink-0 fill-primary drop-shadow-sm" aria-hidden="true" />
			</div>
		</a>

		<div class="postcard-message grid min-h-0 shrink-0 grid-cols-[minmax(0,1.7fr)_minmax(6.5rem,0.9fr)] border-t border-foreground/15 bg-background">
			<div class="flex min-w-0 flex-col gap-1 px-3 py-2 sm:px-4">
				{#if postcard.featured || postcard.category}
					<div class="flex flex-wrap items-baseline gap-x-1 text-xs font-semibold">
						{#if postcard.featured}<span class="text-primary">Featured</span>{/if}
						{#if postcard.category}
							<a href={`${basePath}?category=${encodeURIComponent(postcard.category.name)}`} class="text-muted-foreground hover:text-primary focus-visible:underline">
								{postcard.category.name}
							</a>
						{/if}
					</div>
				{/if}

				<h2 class="line-clamp-2 text-balance text-sm font-semibold leading-tight sm:text-base">
					<a href={postcard.href} class="outline-none hover:text-primary focus-visible:underline">{postcard.title}</a>
				</h2>

				<p class="line-clamp-2 text-pretty text-xs leading-snug text-muted-foreground">{postcard.description}</p>

				<div class="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 text-[0.7rem] leading-tight text-muted-foreground">
					<span class="inline-flex min-w-0 items-center gap-1.5 text-foreground">
						{#if postcard.author.avatar}
							<ResilientImage src={postcard.author.avatar} fallbackSrc={null} hideOnError={true} alt="" class="size-6 shrink-0 rounded-full object-cover" loading="lazy" />
						{:else}
							<span class="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[0.6rem] font-semibold" aria-hidden="true">{initials(postcard.author.name)}</span>
						{/if}
						<span class="max-w-28 truncate font-medium">{postcard.author.name}</span>
					</span>
					<span class="inline-flex items-center gap-1">
						<CalendarDays class="size-3" aria-hidden="true" />
						<time datetime={postcard.datePublished ?? undefined}>{formatDate(postcard.datePublished)}</time>
					</span>
					<span class="inline-flex items-center gap-1 tabular-nums" title={`${postcard.likes} likes`}>
						<Heart class="size-3" aria-hidden="true" />
						{postcard.likes}
					</span>
					{#if postcard.views > 0}
						<span class="inline-flex items-center gap-1 tabular-nums" title={`${postcard.views} views`}>
							<Eye class="size-3" aria-hidden="true" />
							{postcard.views}
						</span>
					{/if}
				</div>
			</div>

			<div class="flex min-w-0 flex-col gap-2 border-l border-foreground/15 px-3 py-2 sm:px-4">
				<div class="flex items-center gap-1.5 text-primary" aria-hidden="true">
					<span class="h-px flex-1 bg-primary"></span>
					<span class="size-2 rounded-full border border-primary bg-background"></span>
					<span class="h-px flex-1 bg-primary"></span>
				</div>

				<div class="flex flex-col gap-1 font-display text-lg leading-none text-foreground" aria-label={location ? `Postcard sent from ${location}` : "Postcard location"}>
					<p class="truncate border-b border-foreground/45 pb-1 text-center font-semibold">{city || postcard.region || "From abroad"}</p>
					<p class="truncate border-b border-foreground/45 pb-1 text-center font-semibold">{country || "RomeWithMe"}</p>
				</div>

				<a href={postcard.href} class="mt-auto text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:underline">Read more</a>
			</div>
		</div>
	</div>
</article>

<style>
 .postcard-paper { min-width:0;padding:.5rem;border-radius:2px; }
 .postcard-photo { aspect-ratio:16/10; }
 .postcard-message { flex:1;min-height:12rem; }
 .postcard-message > div { padding:.75rem; }
 .postcard-message h2 { font-family:var(--font-display);line-height:1.4; }
 .postcard-message p { overflow-wrap:anywhere; }
 .postcard-message > div:first-child { gap:.4rem; }
 .postcard-message > div:last-child { background:color-mix(in srgb,var(--secondary) 18%,var(--background)); }
 .postcard-message > div:first-child > div:last-child { margin-top:auto;padding-top:.4rem; }
 .postcard-paper a:focus-visible { outline:2px solid var(--ring);outline-offset:2px; }
 .postcard-photo:focus-visible { outline-offset:-3px; }
</style>
