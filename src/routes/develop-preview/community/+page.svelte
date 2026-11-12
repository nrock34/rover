<script>
 import { setContext } from 'svelte';
 import CommunityPage from '../../community/+page.svelte';
 import PostCard from '$lib/components/community/socialFeed/PostCard.svelte';
 import { POST_CLIENT_CONTEXT, PostRequestError } from '$lib/components/community/socialFeed/post-client.js';
 let { data, form } = $props();
 const sampleLikes = new Map();
 const sampleComments = new Map();
 setContext(POST_CLIENT_CONTEXT, async (path, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const url = new URL(path, 'http://preview.local');
  const id = url.pathname.split('/')[3];
  const post = data.summary.posts.find(item => item.id === id);
  const mode = data.interactionMode;
  const mutation = options.method === 'POST';
  if (mode === 'error' || (mutation && mode === 'save-error')) throw new PostRequestError('Sample service failure. Your changes have not been saved.');
  if (mutation && mode === 'signed-out') throw new PostRequestError('Log in to join the conversation.', '/auth/login?redirectTo=%2Fcommunity');
  if (url.pathname.endsWith('/like')) {
   const liked = !(sampleLikes.get(id) ?? post.viewerLiked); sampleLikes.set(id, liked); return {liked};
  }
  if (!sampleComments.has(id)) sampleComments.set(id, Array.from({length:Math.min(post.comments,8)},(_,i)=>({
   id:`${id}-comment-${i}`,restId:null,author:{id:`sample-${i}`,name:['Leila Hassan','Marco Silva','Eva Nowak'][i%3],avatar:null,associatedUser:null},
   content:['The student housing office helped me find a room. It’s worth checking their noticeboard before committing to a lease.','Thanks for sharing this. I had the same question and this is really helpful.','Happy to share my experience — feel free to ask a follow-up here.'][i%3],
   createdAt:'2026-09-08T12:00:00Z',updatedAt:'2026-09-08T12:00:00Z',timestampLabel:`${i+1}h ago`
  })));
  const comments = sampleComments.get(id);
  if (mutation) {
   const comment={id:`sample-new-${Date.now()}`,restId:null,author:{id:'preview-viewer',name:'You',avatar:null,associatedUser:null},content:String(options.body.get('content')),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),timestampLabel:'Just now'};
   comments.unshift(comment); return {comment};
  }
  const cursor=Number(url.searchParams.get('cursor') || 0);
  return {comments:comments.slice(cursor,cursor+3),nextCursor:cursor+3 < comments.length ? String(cursor+3) : null,isAuthenticated:mode !== 'signed-out',loginHref:'/auth/login?redirectTo=%2Fcommunity'};
 });
 function guardPreviewWrite(event) {
  if (event.target instanceof HTMLFormElement && new URL(event.target.action).pathname.startsWith('/community/posts/')) event.preventDefault();
 }
</script>
<div class="app-shell py-2 text-sm">Development preview · Sample data · Likes and comments are simulated</div>
<div onsubmitcapture={guardPreviewWrite}>
 {#if data.previewMode === 'post' && data.summary.posts[1]}
  <div class="app-shell py-6"><div style="max-width: 42rem"><PostCard post={data.summary.posts[1]} currentPath="/develop-preview/community?view=post" /></div></div>
 {:else}<CommunityPage {data} {form} />{/if}
</div>
