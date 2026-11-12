import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

/** @type {import("./$types").LayoutServerLoad} */
export const load = async ({ route }) => {
	const isLocalContentPreview = dev && ["/develop-preview/community", "/develop-preview/postcards", "/develop-preview/onboarding"].includes(route.id ?? "");
	if (!isLocalContentPreview && env.ENABLE_PREVIEW_ROUTES !== "true") {
		throw redirect(307, "/");
	}
	return {};
};
