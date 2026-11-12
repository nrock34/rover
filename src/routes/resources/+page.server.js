import { error } from "@sveltejs/kit";
import { loadResourceCollections } from "$domains/resources";
import { contentServiceUnavailableStatus, isContentServiceUnavailable } from "$lib/server/content-service-status.js";

/** @type {import("./$types").PageServerLoad} */
export const load = async ({ fetch }) => {
	const result = await loadResourceCollections({ fetch });
	if (!result.ok) {
		if (isContentServiceUnavailable(result.error)) {
			return {
				resourcesByCategory: {},
				contentService: contentServiceUnavailableStatus()
			};
		}

		throw error(result.error.status || 500, result.error.message);
	}

	return {
		resourcesByCategory: result.data
	};
};
