import { beforeEach, describe, expect, it, vi } from "vitest";
import { schema } from "../../src/lib/components/forms/auth/signup-schema.js";
import { userCheck } from "../../src/lib/components/forms/auth/username-check.js";

vi.mock("../../src/lib/components/forms/auth/username-check.js", () => ({
	userCheck: vi.fn()
}));

const account = {
	first_name: "Avery",
	last_name: "Rivera",
	username: "averyrivera",
	email: "avery@example.test",
	password: "Strong123!"
};

describe("signup validation", () => {
	beforeEach(() => userCheck.mockReset());

	it("accepts a complete signup with an available username", async () => {
		userCheck.mockResolvedValue({ exists: false });
		await expect(schema.validate(account)).resolves.toEqual(account);
	});

	it("reports required, invalid, and already-taken values against their fields", async () => {
		userCheck.mockResolvedValue({ exists: true });
		await expect(schema.validate({
			...account,
			first_name: undefined,
			email: "avery",
			password: "weak"
		}, { abortEarly: false })).rejects.toMatchObject({
			name: "ValidationError",
			inner: expect.arrayContaining([
				expect.objectContaining({ path: "first_name" }),
				expect.objectContaining({ path: "email" }),
				expect.objectContaining({ path: "password" }),
				expect.objectContaining({ path: "username", type: "username_check" })
			])
		});
	});
});
