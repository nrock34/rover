<script>
 import SocialFeedHeader from './SocialFeedHeader.svelte';
 import SocialFeedPosts from './SocialFeedPosts.svelte';
 import { POST_TOPIC_FILTER_OPTIONS, POST_TYPE_FILTER_OPTIONS } from './post-options.js';
 let { posts = [], limit = 6, currentPath = '/community' } = $props();
 let searchQuery = $state('');
 let activeContentType = $state('all');
 let activeFilter = $state('all');
 const hasFilters = $derived(Boolean(searchQuery.trim()) || activeContentType !== 'all' || activeFilter !== 'all');
 function clearFilters() { searchQuery = ''; activeContentType = 'all'; activeFilter = 'all'; }
</script>

<section class="community-feed" aria-label="Social feed">
 <SocialFeedHeader filters={POST_TOPIC_FILTER_OPTIONS} contentTypes={POST_TYPE_FILTER_OPTIONS}
  bind:activeContentType bind:activeFilter bind:searchQuery {hasFilters} {clearFilters} />
 <SocialFeedPosts {posts} {limit} {activeFilter} {activeContentType} {searchQuery} {currentPath} {hasFilters} {clearFilters} />
</section>
