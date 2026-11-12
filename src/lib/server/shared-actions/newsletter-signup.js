import { addContact } from "$lib/server/newsletter/add-contact";
import { fail } from "@sveltejs/kit";
import { recordOutcome } from '$lib/server/analytics.js';

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
export const newsletterSignup = async (event) => {
	const { request } = event;
	const data = await request.formData();
	const emailValue = data.get("email");
	const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
		return fail(400, {
			error: "invalid_email",
			description: "Enter a valid email address."
		});
	}

	let result;
	try {
		result = await addContact(email);
	} catch {
		return fail(503, {
			error: "newsletter_unavailable",
			description: "Newsletter signup is temporarily unavailable. Please try again later."
		});
	}

	if (result && typeof result === "object" && "errors" in result && Array.isArray(result.errors) && result.errors[0]) {
		return fail(422, {
			error: result.errors[0].title,
			description: result.errors[0].detail
		});
	}

	if (typeof result !== 'string' || !result) {
		return fail(503, { error: 'newsletter_unavailable', description: 'The subscription could not be confirmed. Please try again later.' });
	}
	await recordOutcome(event, 'newsletter_completed', { source: 'newsletter_form' });
	return {
		status: "success",
		id: typeof result === "string" ? result : ""
	};
};
