import { resolveApiUrl } from '../core/env/server.js'
import { requestJson } from '../core/http/client.js'
import { newConfig } from '$lib/stores/config.svelte.js'
import { contentServiceUnavailableStatus } from '$lib/server/content-service-status.js'
import {
    decodeAccessTokenClaims,
    getSessionState,
    validateAccessToken
} from '$domains/auth/index.js'
import { ONBOARDED_ROLE } from '$lib/auth/rbac.js';
import { resolveSessionRoles } from '$lib/auth/session-roles.js';
import { analyticsLayout } from '$lib/server/analytics.js';

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

/**
 * @param {unknown} value
 * @param {boolean} isAuthenticated
 * @returns {{ isAuthenticated: boolean; name: string | null; avatar: string | null; username: string | null }}
 */
function mapViewer(value, isAuthenticated) {
    if (!isObject(value)) {
        return {
            isAuthenticated,
            name: null,
            avatar: null,
            username: null
        }
    }

    const profile = isObject(value.profile) ? value.profile : null

    return {
        isAuthenticated,
        name: typeof value.name === "string" ? value.name : null,
        avatar: profile && typeof profile.avatar === "string" ? profile.avatar : null,
        username: typeof value.username === "string" ? value.username : null
    }
}

/** @type {import("./$types").LayoutServerLoad} */
export const load = async (event) => {
    const { cookies, fetch, locals } = event;

    const session = getSessionState(cookies)
    /** @type {string | null} */
    let accessToken = null
    /** @type {Record<string, unknown> | null} */
    let claims = null
    /** @type {string[]} */
    let roles = []
    /** @type {{ isAuthenticated: boolean; name: string | null; avatar: string | null; username: string | null }} */
    let viewer = {
        isAuthenticated: false,
        name: null,
        avatar: null,
        username: null
    }

    if (session.accessToken) {
        const tokenValidation = validateAccessToken(session.accessToken)
        if (tokenValidation.ok) {
            accessToken = session.accessToken
            claims = decodeAccessTokenClaims(session.accessToken)
            roles = locals?.roles ?? await resolveSessionRoles({ accessToken, fetch })
            viewer.isAuthenticated = true

            try {
                const response = await requestJson(resolveApiUrl("users/me"), {
                    fetchFn: fetch,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                if (response.ok) {
                    viewer = mapViewer(response.data, true)
                }
            } catch {
                // Keep auth state even if the profile summary fetch fails.
            }
        }
    }

    const properties = newConfig()
    /** @type {import("$lib/server/content-service-status.js").ContentServiceStatus | null} */
    let contentService = null
    try {
        await properties.loadConfig(fetch)
    } catch {
        // Allow the app to render with local fallbacks when site settings are unavailable.
        contentService = contentServiceUnavailableStatus()
    }

    return {
        analytics: await analyticsLayout(event),
        config: properties.config,
        contentService,
        acs_tkn: accessToken,
        auth: {
            isAuthenticated: Boolean(accessToken),
            isOnboarded: roles.includes(ONBOARDED_ROLE),
            roles,
            claims
        },
        viewer
    }

}
