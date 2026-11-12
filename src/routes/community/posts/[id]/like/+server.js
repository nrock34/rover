import { error, redirect, json } from "@sveltejs/kit";
import { sanitizeRelativeRedirectTarget } from "$lib/auth/redirect.js";
import { buildLoginRedirectUrl } from "$lib/auth/redirect.js";
import { getValidatedAccessToken } from "$lib/auth/server.js";
import { loadCommunityPostDetail, toggleCommunityPostLike } from "$domains/community";

/**
 * @param {import("@sveltejs/kit").RequestEvent} event
 */
export async function POST(event) {
 const wantsJson = event.request?.headers.get('accept')?.includes('application/json') ?? false;
 const headers = { 'Cache-Control': 'private, no-store', Vary: 'Accept' };
	const postId = event.params.id;
	if (!postId) {
		throw error(400, "Missing post id.");
	}

	const accessToken = getValidatedAccessToken(event);
	const redirectTarget = sanitizeRelativeRedirectTarget(
		event.url.searchParams.get("redirectTo"),
		`/community/posts/${postId}`
	);

	if (!accessToken) {
		const loginHref = buildLoginRedirectUrl(new URL(redirectTarget, event.url));
        if (wantsJson) return json({error: 'Log in to like a post.', loginHref}, {status:401,headers});
        throw redirect(303, loginHref);
	}

	const postResult = await loadCommunityPostDetail(postId, {
		fetch: event.fetch,
		accessToken
	});
	if (!postResult.ok) {
        if (wantsJson) return json({error: 'This post is unavailable.'}, {status:postResult.error.status || 502,headers});
		throw error(postResult.error.status || 500, postResult.error.message);
	}
	if (!postResult.data.restId) {
        if (wantsJson) return json({error:'Likes are temporarily unavailable for this post.'}, {status:502,headers});
		throw error(502, "The post write identifier is unavailable.");
	}

	const result = await toggleCommunityPostLike(postResult.data.restId, {
		fetch: event.fetch,
		accessToken
	});

	if (!result.ok) {
		if (result.error.code === "unauthorized") {
			const loginHref = buildLoginRedirectUrl(new URL(redirectTarget, event.url));
        if (wantsJson) return json({error: 'Log in to like a post.', loginHref}, {status:401,headers});
        throw redirect(303, loginHref);
		}
		if (wantsJson) return json({error: 'Your like could not be updated. Please try again.'}, {status:result.error.status || 502,headers});
        throw error(result.error.status || 500, result.error.message);
	}

	if (wantsJson) return json({liked: result.data.liked}, {headers});
    throw redirect(303, redirectTarget);
}
