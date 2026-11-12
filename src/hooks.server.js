import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { json, redirect } from "@sveltejs/kit";
import { buildLoginRedirectUrl, buildOnboardingRedirectUrl } from "$lib/auth/redirect.js";
import { reconcileRequestSession } from "$lib/auth/server.js";
import { ONBOARDED_ROLE } from "$lib/auth/rbac.js";
import { isOnboardedOnlyPath } from "$lib/auth/protected-routes.js";
import { resolveSessionRoles } from "$lib/auth/session-roles.js";


const authRoutes = [
	"/profile",
	"/onboarding"
];

const sessionMutationRoutes = new Set([
	"/auth/logout",
	"/auth/refresh"
]);

/**
 * @param {string} pathName
 * @param {readonly string[]} routes
 * @returns {boolean}
 */
const isAuthRoute = (pathName, routes) => {
	return routes.some((route) =>
		pathName === route || pathName.startsWith(`${route}/`)
	);
};

/** @type {import("@sveltejs/kit").Handle} */
export const handle = sequence(async ({ event, resolve }) => {
	let accessToken = event.locals.token ?? null;
	if (!sessionMutationRoutes.has(event.url.pathname)) {
		accessToken = await reconcileRequestSession(event);
	}

	const requiresOnboarded = isOnboardedOnlyPath(event.url.pathname);
	const isJsonCommunityInteraction = requiresOnboarded &&
		(event.url.pathname.endsWith("/comments") || event.url.pathname.endsWith("/like")) &&
		event.request.headers.get("accept")?.includes("application/json");
	if (isAuthRoute(event.url.pathname, authRoutes) || requiresOnboarded) {
		if (!accessToken) {
			const loginHref = buildLoginRedirectUrl(event.url);
			if (isJsonCommunityInteraction) {
				return json(
					{ error: "Sign in to use community features.", loginHref },
					{ status: 401, headers: { "Cache-Control": "private, no-store" } }
				);
			}
			throw redirect(303, loginHref);
		}
	}

	if (accessToken) {
		event.locals.roles = await resolveSessionRoles({ accessToken, fetch: event.fetch });
	}

	if (requiresOnboarded && !event.locals.roles?.includes(ONBOARDED_ROLE)) {
		const onboardingHref = buildOnboardingRedirectUrl(event.url);
		if (isJsonCommunityInteraction) {
			return json(
				{ error: "Finish onboarding to use community features.", onboardingHref },
				{ status: 403, headers: { "Cache-Control": "private, no-store" } }
			);
		}
		throw redirect(303, onboardingHref);
	}

	if (
		(event.url.pathname.startsWith("/community/news/") || event.url.pathname === "/community/news") ||
		event.url.pathname.startsWith("/community/updates")
	) {
		throw redirect(308, "/community/news-and-updates");
	}

	if (event.url.pathname === "/tos") {
		throw redirect(308, "/terms-of-service");
	}

	if (event.url.pathname == "/pp") {
		throw redirect(308, "/privacy-policy");
	}

	const response = await resolve(event);
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("X-Frame-Options", "SAMEORIGIN");
	response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
	response.headers.set(
		"Content-Security-Policy",
		"base-uri 'self'; object-src 'none'; frame-ancestors 'self'"
	);
	if (event.url.protocol === "https:") {
		response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	}
	return response;
});


export const handleError = Sentry.handleErrorWithSentry();
