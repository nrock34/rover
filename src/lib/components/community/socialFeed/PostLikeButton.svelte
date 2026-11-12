<script>
 import { getContext } from 'svelte';
 import { Button } from '$lib/components/ui/button';
 import { Heart, LoaderCircle } from 'lucide-svelte';
 import { POST_CLIENT_CONTEXT, requestPost } from './post-client.js';
 let { post, currentPath = '/community' } = $props();
 const request = getContext(POST_CLIENT_CONTEXT) ?? requestPost;
 let override = $state(null);
 let pending = $state(false);
 let message = $state('');
 let loginHref = $state(null);
 const liked = $derived(override?.id === post.id ? override.liked : post.viewerLiked);
 const likes = $derived(override?.id === post.id ? override.likes : post.likes);
 const action = $derived(`/community/posts/${post.id}/like?redirectTo=${encodeURIComponent(currentPath)}`);
 $effect(() => { post.id; post.viewerLiked; post.likes; override = null; message = ''; loginHref = null; });
 async function toggle(event) {
  event.preventDefault();
  if (pending) return;
  const id = post.id;
  const before = {id,liked,likes};
  pending = true; message = ''; loginHref = null;
  override = {id,liked:!before.liked,likes:Math.max(0,before.likes + (before.liked ? -1 : 1))};
  try {
   const result = await request(action, {method:'POST',body:new FormData()});
   if (post.id !== id) return;
   override = {id,liked:result.liked,likes:Math.max(0,before.likes + Number(result.liked) - Number(before.liked))};
   message = result.liked ? 'Post liked.' : 'Like removed.';
  } catch (error) {
   if (post.id !== id) return;
   override = before;
   message = error.message || 'Your like could not be updated.';
   loginHref = error.loginHref || null;
  } finally { pending = false; }
 }
</script>
<div class="post-like-control">
 <form method="POST" {action} onsubmit={toggle} aria-busy={pending}>
  <Button type="submit" variant="ghost" class="post-engagement-button" aria-pressed={liked} disabled={pending}
   aria-label={`${liked ? 'Unlike' : 'Like'} post, ${likes} likes`}>
   {#if pending}<LoaderCircle class="community-pending-icon" aria-hidden="true" />{:else}<Heart fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />{/if}
   <span>{liked ? 'Liked' : 'Like'}</span><span class="post-action-count">{likes}</span>
  </Button>
 </form>
 <span class="sr-only" role="status" aria-live="polite">{pending ? 'Updating like…' : message}</span>
 {#if message && !pending && message !== 'Post liked.' && message !== 'Like removed.'}
  <div class="post-interaction-error" role="alert">{message}
   {#if loginHref}<a href={loginHref}>Log in</a>{:else}<a href={post.href}>Open post</a>{/if}
  </div>
 {/if}
</div>
