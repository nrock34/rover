import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handle } from "../../src/hooks.server.js";

// Exercise the app's hook without SvelteKit's request-local store.
vi.mock("@sveltejs/kit/hooks", () => ({
	sequence: (hook) => hook
}));

vi.mock("../../src/lib/auth/server.js", () => ({
	reconcileRequestSession: async (event) => event.locals.token ?? null
}));

const destination = "/scholarships?country=Italy&provider=A%20%26%20B";

function protectedRequest(roles) {
	const url = new URL(destination, "https://app.example.test");
	const event = {
		url,
		locals: roles ? { token: "member-access-token" } : {},
		request: new Request(url),
		fetch: async () => Response.json({ roles })
	};
	const resolve = async () => new Response("Scholarship directory");
	return { event, resolve };
}

describe("protected page access", () => {
	beforeEach(() => vi.stubEnv("API_URL", "https://api.example.test/"));
	afterEach(() => vi.unstubAllEnvs());

	it.each([
		{ visitor: "guests", roles: null, redirectPath: "/auth/login" },
		{ visitor: "members who need onboarding", roles: ["member"], redirectPath: "/onboarding" }
	])("redirects $visitor to $redirectPath and preserves their destination", async ({ roles, redirectPath }) => {
		const request = protectedRequest(roles);
		const redirectUrl = new URL(redirectPath, request.event.url);
		redirectUrl.searchParams.set("redirectTo", destination);

		await expect(handle(request)).rejects.toMatchObject({
			status: 303,
			location: redirectUrl.pathname + redirectUrl.search
		});
	});

	it("serves the protected page to a member whose account confirms onboarding", async () => {
		const response = await handle(protectedRequest(["member", "onboarded-member"]));
		expect(response.status).toBe(200);
		await expect(response.text()).resolves.toBe("Scholarship directory");
	});
});
