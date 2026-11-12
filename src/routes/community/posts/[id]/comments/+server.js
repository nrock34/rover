import { json } from '@sveltejs/kit';
import { getValidatedAccessToken } from '$lib/auth/server.js';
import { buildLoginRedirectUrl, sanitizeRelativeRedirectTarget } from '$lib/auth/redirect.js';
import { loadCommunityPostComments, loadCommunityPostDetail, createCommunityPostComment } from '$domains/community';
import { commentSchema } from '$lib/components/forms/community/comment-schema.js';

const headers = { 'Cache-Control': 'private, no-store' };
/** @param {import('@sveltejs/kit').RequestEvent} event */
function loginHref(event) {
 const target = sanitizeRelativeRedirectTarget(event.url.searchParams.get('redirectTo'), `/community/posts/${event.params.id}`);
 return buildLoginRedirectUrl(new URL(target, event.url));
}

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
 const accessToken = getValidatedAccessToken(event);
 const result = await loadCommunityPostComments(event.params.id, {
  cursor: event.url.searchParams.get('cursor'), sort_by: 'newest'
 }, { fetch: event.fetch, accessToken });
 if (!result.ok) return json({ error: 'Comments could not be loaded. Please try again.' }, {status: result.error.status || 502, headers});
 return json({ comments: result.data.results, nextCursor: result.data.nextCursor,
  isAuthenticated: Boolean(accessToken), loginHref: loginHref(event) }, {headers});
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
 const accessToken = getValidatedAccessToken(event);
 if (!accessToken) return json({error:'Log in to comment.',loginHref:loginHref(event)}, {status:401,headers});
 let content;
 try {
  const data = await event.request.formData();
  const validated = await commentSchema.validate({content:data.get('content')});
  content = validated.content;
 } catch {
  return json({error:'Write a comment between 1 and 500 characters.'}, {status:400,headers});
 }
 const post = await loadCommunityPostDetail(event.params.id, {fetch:event.fetch,accessToken});
 if (!post.ok) return json({error:'This post is unavailable.'}, {status:post.error.status || 502,headers});
 if (!post.data.restId) return json({error:'Commenting is temporarily unavailable for this post.'}, {status:502,headers});
 const result = await createCommunityPostComment(post.data.restId,{content},{fetch:event.fetch,accessToken});
 if (!result.ok) {
  if (result.error.code === 'unauthorized') return json({error:'Log in to comment.',loginHref:loginHref(event)}, {status:401,headers});
  return json({error:'Your comment could not be saved. Your draft is still here.'}, {status:result.error.status || 502,headers});
 }
 return json({comment:result.data}, {status:201,headers});
}
