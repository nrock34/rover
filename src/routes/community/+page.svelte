<script>
	import NewsUpdates from "$lib/components/community/CommunityNewsUpdates/NewsUpdates.svelte";
	import CommunityStats from "$lib/components/community/sidebar-elements/CommunityStats.svelte";
	import NewsletterSignup from "$lib/components/community/sidebar-elements/NewsletterSignup.svelte";
	import TrendingTags from "$lib/components/community/sidebar-elements/TrendingTags.svelte";
	import SocialFeed from "$lib/components/community/socialFeed/SocialFeed.svelte";
	import StudyAbroadSection from "$lib/components/community/StudyAbroad/ProgramsSection.svelte";
	import ScholarshipSection from "$lib/components/community/StudyAbroad/ScholarshipSection.svelte";
	import { Button } from "$lib/components/ui/button";
	import { ArrowRight } from "lucide-svelte";
	import { innerWidth } from "svelte/reactivity/window";
	let { data, form } = $props();
	let selectedRegion = $state("all");
	let selectedCategory = $state("all");
	let xl = $derived(innerWidth.current < 1150);
	const posts = $derived(data.summary.posts);
	const updates = $derived(data.summary.updates);
	const featuredPrograms = $derived(data.summary.featuredPrograms);
	const featuredScholarships = $derived(data.summary.featuredScholarships);
	const upcomingDeadlines = $derived(data.summary.upcomingDeadlines);
</script>
<div class="community-page">
	<h1 class="sr-only md:hidden">Community</h1>
	<div class="community-news-band">
			<NewsUpdates {updates} deadlines={upcomingDeadlines} />
	</div>
	<div class="app-shell">
		<div class="grid w-full grid-cols-10 gap-8 items-start">
				<div class="col-span-10 md:hidden">
					<Button href="/community/posts" variant="ghost" class="community-mobile-entry">
                        <span class="flex min-w-0 flex-col gap-1 text-left">
                            <span class="font-semibold text-foreground">Social Feed</span>
                            <span class="community-support text-sm whitespace-normal">Browse discussions, questions, and announcements.</span>
                        </span>
                        <ArrowRight aria-hidden="true" />
					</Button>
				</div>
			<div class="order-first col-span-10 min-w-0 hidden flex-col md:flex md:col-span-7">
						<SocialFeed {posts} currentPath={data.currentPath} limit={xl ? 2 : 6} />
			</div>
			<div class="community-sidebar order-3 col-span-10 min-w-0 grid grid-cols-1 gap-8 gap-y-6 md:order-2 md:col-span-3 md:flex md:flex-col">
				<div>
					<NewsletterSignup result={form} />
				</div>
				<div>
					<TrendingTags tags={data.trendingTags} />
				</div>
					<div class="hidden md:block">
						<CommunityStats stats={data.stats} />
					</div>
				{#if !xl}
					<div>
							<ScholarshipSection bind:selectedCategory scholarships={featuredScholarships} cardClass="w-full min-w-0" limit={2} />
					</div>
					<div>
							<StudyAbroadSection bind:selectedRegion programs={featuredPrograms} cardClass="w-full min-w-0" limit={2} />
					</div>
				{/if}
			</div>
			{#if xl}
				<div class="community-opportunities order-2 col-span-10 flex w-full flex-col justify-between gap-4 sm:flex-row md:order-3">
						<StudyAbroadSection bind:selectedRegion programs={featuredPrograms} cardClass="w-full min-w-0" limit={2} />
						<ScholarshipSection bind:selectedCategory scholarships={featuredScholarships} cardClass="w-full min-w-0" limit={2} />
				</div>
			{/if}
		</div>
	</div>
</div>
