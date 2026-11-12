import * as yup from "yup";
import YupPassword from "yup-password";

YupPassword(yup);

/** @type {(username: string) => Promise<{ exists: boolean }>} */
const usernameCheck = async (username) => {
    // Keep schema exports synchronous. Load server dependencies only when a
    // username is validated, not while the signup route module is evaluating.
    if (import.meta.env.SSR) {
        const { userCheck } = await import("./username-check.js");
        return userCheck(username);
    }
	const checkResp = await fetch("/api/username-check", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username }),
        signal: AbortSignal.timeout(5000)
	});
	if (!checkResp.ok) {
		throw new Error("Username check unavailable");
	}
	return /** @type {Promise<{ exists: boolean }>} */ (checkResp.json());
};

export const schema = yup.object({
	first_name: yup.string().min(2).required(),
	last_name: yup.string().min(2).required(),
	username: yup
		.string()
		.min(3, "Username must be at least 3 characters.")
		.test("username_check", "This username already exists.", async function (value) {
			if (typeof value !== "string" || value.length < 3) {
				return true;
			}
			try {
                return !(await usernameCheck(value)).exists;
            } catch {
                return this.createError({ message: "We couldn't check this username. Please try again." });
            }
		})
		.required(),
	email: yup.string().email().min(4).required(),
	password: yup.string().password().min(8).minUppercase(1).minSymbols(1).maxRepeating(3).required()
});
