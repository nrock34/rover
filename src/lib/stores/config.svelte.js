import { query } from "gql-query-builder";
import { requestGraphql } from "../../core/graphql/client.js";

/** @typedef {Record<string, unknown>} SiteConfig */

const SITE_PROPERTY_REQUEST = query({
	operation: "siteProperty",
	fields: ["key", "value", "type", "is_public"]
}, null, { operationName: "SiteProperty" });

/**
 * @param {{ key?: unknown; value?: unknown; type?: unknown; is_public?: unknown } | null} property
 * @returns {SiteConfig}
 */
function adaptSiteProperty(property) {
	if (!property || property.is_public !== true || typeof property.key !== "string" || typeof property.value !== "string") {
		return {};
	}

	let value = /** @type {unknown} */ (property.value);
	if (property.type === "bool") {
		value = property.value === "true";
	} else if (property.type === "json") {
		try {
			value = JSON.parse(property.value);
		} catch {
			throw new Error("Site configuration contains invalid JSON");
		}
		if (value && typeof value === "object" && !Array.isArray(value)) {
			return /** @type {SiteConfig} */ (value);
		}
	}

	return { [property.key]: value };
}

/** @type {SiteConfig | null} */
let cachedConfig = null;

export function newConfig() {
	/** @type {SiteConfig | null} */
	let config = cachedConfig;

	/**
	 * @param {typeof fetch} fetchFn
	 */
	async function loadConfig(fetchFn) {
		if (cachedConfig) return;

		const response = await requestGraphql({
			fetchFn,
			query: SITE_PROPERTY_REQUEST.query,
			variables: SITE_PROPERTY_REQUEST.variables,
			operationName: "SiteProperty"
		});
		if (!response.ok) {
			throw new Error(`Failed site configuration fetch (${response.error.status})`);
		}

		const payload = /** @type {{ siteProperty?: Parameters<typeof adaptSiteProperty>[0] }} */ (response.data);
		cachedConfig = adaptSiteProperty(payload.siteProperty ?? null);
		config = cachedConfig;
	}

	return {
		get config() {
			return cachedConfig ?? config;
		},
		loadConfig
	};
}
