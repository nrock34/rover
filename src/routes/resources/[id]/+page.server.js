import { error } from "@sveltejs/kit";
import { loadResourceDetailPage } from "$domains/resources";

/** @type {import("./$types").PageServerLoad} */
export const load = async ({ params, fetch }) => {
	const id = params.id.trim();
	if (!id) {
		throw error(404, "Resource not found");
	}

	const result = await loadResourceDetailPage(id, { fetch });
	if (!result.ok) {
		throw error(result.error.status || 500, result.error.message);
	}

	return result.data;
};
