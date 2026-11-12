import { buildApiUrl, withBearerAuth } from "../../core/domain/http.js";
import { requestJson } from "../../core/http/client.js";
import { normalizeRoles } from "./rbac.js";

/**
 * Strapi's refresh-mode access token contains identity but no role claims.
 * Always read current roles from the authenticated account-info endpoint.
 *
 * @param {{ accessToken: string; fetch: typeof fetch }} options
 * @returns {Promise<string[]>}
 */
export async function resolveSessionRoles({ accessToken, fetch }) {
	try {
		const response = await requestJson(buildApiUrl("auth/info"), {
			fetchFn: fetch,
			headers: withBearerAuth(accessToken),
			cache: "no-store"
		});
		if (response.ok && response.data && typeof response.data === "object" && "roles" in response.data) {
			return normalizeRoles(response.data.roles);
		}
	} catch {
		// Missing role status fails closed for protected pages.
	}
	return [];
}
