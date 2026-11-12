import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signCookieValue } from "../../src/core/cookies/signed-cookie.js";
import { getValidatedAccessToken, reconcileRequestSession } from "../../src/lib/auth/server.js";

function accessToken(expiresInSeconds) {
	return jwt.sign({ sub: "traveler-42" }, "test-jwt-secret", {
		expiresIn: expiresInSeconds
	});
}

function sessionRequest(token, fetch) {
	const signedAccess = signCookieValue(token);
	const stored = new Map([
		["acs_tkn", signedAccess],
		["rwm_refresh", "original:signature"],
		["theme", "dark"]
	]);

	return {
		stored,
		event: {
			url: new URL("https://app.example.test/profile/dashboard"),
			locals: { token: "stale-request-token" },
			fetch,
			cookies: {
				get: (name) => stored.get(name),
				set: (name, value) => stored.set(name, value),
				delete: (name) => stored.delete(name)
			}
		}
	};
}

describe("request sessions", () => {
	beforeEach(() => {
		vi.stubEnv("API_URL", "https://api.example.test/");
		vi.stubEnv("ACS_JWT_SECRET", "test-jwt-secret");
		vi.stubEnv("COOKIE_SECRET", "test-cookie-secret");
	});

	afterEach(() => vi.unstubAllEnvs());

	it("retains a valid session even if the refresh service is unavailable", async () => {
		const token = accessToken(300);
		const fetch = vi.fn().mockRejectedValue(new Error("Refresh service unavailable"));
		const { event, stored } = sessionRequest(token, fetch);
		const originalCookies = new Map(stored);

		await expect(reconcileRequestSession(event)).resolves.toBe(token);
		expect(event.locals.token).toBe(token);
		expect(stored).toEqual(originalCookies);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("refreshes an expired session and makes the rotated credentials usable on the next request", async () => {
		const replacement = accessToken(300);
		const fetch = async () => Response.json({ acs_tkn: replacement }, {
			headers: {
				"Set-Cookie": "rwm_refresh=rotated:signature; Path=/; HttpOnly; Secure; SameSite=Lax"
			}
		});
		const { event, stored } = sessionRequest(accessToken(-60), fetch);

		await expect(reconcileRequestSession(event)).resolves.toBe(replacement);
		expect(event.locals.token).toBe(replacement);
		expect(stored.get("rwm_refresh")).toBe("rotated:signature");
		expect(getValidatedAccessToken({ ...event, locals: {} })).toBe(replacement);
	});

	it("clears both auth cookies and the request identity after a rejected refresh", async () => {
		const fetch = async () => Response.json({ error: "Invalid refresh token" }, { status: 401 });
		const { event, stored } = sessionRequest(accessToken(-60), fetch);

		await expect(reconcileRequestSession(event)).resolves.toBeNull();
		expect(event.locals.token).toBeUndefined();
		expect(stored).toEqual(new Map([["theme", "dark"]]));
	});
});
