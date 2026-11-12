<script>
 import { Button } from '$lib/components/ui/button';
 import * as Card from '$lib/components/ui/card';
 import { ArrowRight } from 'lucide-svelte';
 import PostCard from './PostCard.svelte';
 import { matchRecentPosts, communityPostsHref } from './feed-filters.js';
 let { posts = [], activeFilter = 'all', activeContentType = 'all', searchQuery = '', limit = 6,
  currentPath = '/community', hasFilters = false, clearFilters = () => {} } = $props();
 const filters = $derived({query: searchQuery, topic: activeFilter, type: activeContentType});
 const matches = $derived(matchRecentPosts(posts, filters));
 const visiblePosts = $derived(matches.slice(0, limit));
 const seeMoreHref = $derived(communityPostsHref(filters));
</script>

<div class="community-feed-posts">
 <p class="community-support text-sm" role="status" aria-live="polite" aria-atomic="true">
  Showing {visiblePosts.length} of {matches.length} {hasFilters ? 'matching ' : ''}recent posts
 </p>
 {#each visiblePosts as post (post.id)}
  <PostCard {post} {currentPath} preview />
 {:else}
  <Card.Root class="community-card community-empty">
   <h2 class="text-lg font-semibold">{posts.length ? 'No recent posts match these filters' : 'No community posts yet'}</h2>
   <p class="community-support text-sm">{posts.length ? 'Try another topic or search the full community.' : 'Have a question or something to share? Start the conversation.'}</p>
   {#if posts.length}<Button onclick={clearFilters} variant="outline">Clear filters</Button>
   {:else}<Button href="/community/posts/new">Create post</Button>{/if}
  </Card.Root>
 {/each}
 <div class="community-feed-more">
  <Button href={seeMoreHref} variant="outline" class="community-control">{hasFilters ? 'Search all posts' : 'View all posts'}<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>
 </div>
</div>
