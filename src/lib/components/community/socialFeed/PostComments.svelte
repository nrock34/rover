<script>
 import { getContext, onMount, onDestroy } from 'svelte';
 import { Button } from '$lib/components/ui/button';
 import { Textarea } from '$lib/components/ui/textarea';
 import { LoaderCircle, Send, X } from 'lucide-svelte';
 import { POST_CLIENT_CONTEXT, requestPost } from './post-client.js';
 let { post, currentPath = '/community', onposted = () => {}, onclose = () => {} } = $props();
 const request = getContext(POST_CLIENT_CONTEXT) ?? requestPost;
 const id = $props.id();
 const endpoint = $derived(`/community/posts/${post.id}/comments?redirectTo=${encodeURIComponent(currentPath)}`);
 let comments = $state([]);
 let visible = $state(3);
 let nextCursor = $state(null);
 let loading = $state(false);
 let loaded = $state(false);
 let loadError = $state('');
 let authenticated = $state(false);
 let loginHref = $state('');
 let draft = $state('');
 let submitting = $state(false);
 let submitError = $state('');
 let sessionExpired = $state(false);
 let notice = $state('');
 const controller = new AbortController();
 let disposed = false;
 onMount(() => { load(); });
 onDestroy(() => { disposed = true; controller.abort(); });
 async function load(more = false) {
  if (loading) return;
  loading = true; loadError = '';
  try {
   const data = await request(endpoint + (more && nextCursor ? `&cursor=${encodeURIComponent(nextCursor)}` : ''), {signal:controller.signal});
   if (disposed) return;
   const existing = new Set(comments.map(comment => comment.id));
   comments = more ? [...comments, ...data.comments.filter(comment => !existing.has(comment.id))] : data.comments;
   if (more) visible += 3;
   nextCursor = data.nextCursor; authenticated = data.isAuthenticated; loginHref = data.loginHref; loaded = true;
  } catch (error) { if (!disposed) loadError = error.message || 'Comments could not be loaded.'; }
  finally { if (!disposed) loading = false; }
 }
 function moreComments() {
  if (visible < comments.length) visible += 3;
  else load(true);
 }
 async function submit(event) {
  event.preventDefault();
  if (submitting || !draft.trim()) return;
  submitting = true; submitError = ''; sessionExpired = false; notice = '';
  const body = new FormData(); body.set('content', draft.trim());
  try {
   const data = await request(endpoint,{method:'POST',body});
   if (disposed) return;
   comments = [data.comment,...comments.filter(comment => comment.id !== data.comment.id)];
   draft = ''; notice = 'Comment posted.'; onposted();
  } catch (error) {
   if (!disposed) {
    submitError = error.message || 'Your comment could not be saved. Your draft is still here.';
    if (error.loginHref) { loginHref = error.loginHref; sessionExpired = true; }
   }
  } finally { if (!disposed) submitting = false; }
 }
 const initials = name => name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
</script>
<section class="post-comments" aria-label={`Comments on ${post.title || 'this post'}`} aria-busy={loading}>
 <div class="post-comments-heading"><h3>Comments</h3><Button variant="ghost" size="icon" onclick={onclose} aria-label="Close comments"><X aria-hidden="true" /></Button></div>
 {#if loadError}
  <div class="post-comment-feedback" role="alert"><p>{loadError}</p><Button variant="outline" onclick={() => load(Boolean(loaded))}>Try again</Button><a href={`${post.href}#comments`}>Open discussion</a></div>
 {/if}
 {#if loading}<p class="post-comment-loading" role="status"><LoaderCircle class="community-pending-icon" aria-hidden="true" />Loading comments…</p>{/if}
 {#if loaded}
  {#if comments.length}
   <ol class="post-comment-list">
    {#each comments.slice(0,visible) as comment (comment.id)}
     <li class="post-comment">
      <span class="post-comment-avatar" aria-hidden="true">{initials(comment.author.name)}</span>
      <div class="min-w-0">
       <div class="post-comment-meta"><span>{comment.author.name}</span><time datetime={comment.createdAt}>{comment.timestampLabel}</time></div>
       <p>{comment.content}</p>
      </div>
     </li>
    {/each}
   </ol>
  {:else}<p class="community-support text-sm">No comments yet. Be the first to join in.</p>{/if}
  {#if visible < comments.length || nextCursor}<Button variant="ghost" class="post-more-comments" disabled={loading} onclick={moreComments}>Show more comments</Button>{/if}
  {#if authenticated}
   <form class="post-comment-form" method="POST" action={`/community/posts/${post.id}?/comment`} onsubmit={submit} aria-busy={submitting}>
    <label for={`${id}-comment`}>Write a comment</label>
    <Textarea id={`${id}-comment`} name="content" bind:value={draft} required maxlength={500} rows={2}
     placeholder="Share an answer or ask a follow-up…" aria-describedby={`${id}-limit ${id}-feedback`} aria-invalid={Boolean(submitError)} />
    <div class="post-comment-compose-footer"><span id={`${id}-limit`} class="community-support">{draft.length}/500</span>
     <Button type="submit" disabled={submitting || !draft.trim()}>{#if submitting}<LoaderCircle class="community-pending-icon" aria-hidden="true" />{:else}<Send aria-hidden="true" />{/if}{submitting ? 'Posting…' : 'Post comment'}</Button>
    </div>
   </form>
  {:else}<a class="post-comment-login" href={loginHref}>Log in to join the conversation <span aria-hidden="true">→</span></a>{/if}
 {/if}
 <div id={`${id}-feedback`} aria-live="polite" aria-atomic="true">
  {#if submitError}<p class="post-comment-feedback">{submitError} {#if sessionExpired}<a href={loginHref}>Log in again</a>{/if}</p>{:else if notice}<p class="post-comment-feedback">{notice}</p>{/if}
 </div>
</section>
