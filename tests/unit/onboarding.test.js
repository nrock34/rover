import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actions } from "../../src/routes/onboarding/+page.server.js";
import { CURRENT_GRADUATION_YEAR } from "../../src/domains/onboarding/index.js";

vi.mock("../../src/lib/server/analytics.js", () => ({
	recordOutcome: async () => {}
}));

const academicAnswers = {
	studentLevel: "ungrd",
	university: "7",
	major: " Art History ",
	year: String(CURRENT_GRADUATION_YEAR + 1)
};

function formRequest(url, fields, regions = []) {
	const body = new FormData();
	for (const [field, value] of Object.entries(fields)) body.set(field, value);
	for (const region of regions) body.append("interestedRegions", region);
	return new Request(url, { method: "POST", body });
}

describe("onboarding submission", () => {
	const url = new URL("https://app.example.test/onboarding?redirectTo=%2Fscholarships%3Fcountry%3DItaly");

	beforeEach(() => vi.stubEnv("API_URL", "https://api.example.test/"));
	afterEach(() => vi.unstubAllEnvs());

	it("combines both steps into the saved payload and returns to the requested page", async () => {
		const academic = await actions.academicBackground({
			request: formRequest(url, academicAnswers)
		});
		const request = formRequest(url, {
			academicPayload: JSON.stringify(academic.onboardingDraft.academic_background),
			travelExperience: "4to7",
			hasTraveledEdu: "false",
			otherLanguageSpoken: " Italian "
		}, ["seurope", "easia"]);

		const fetch = vi.fn(async (_endpoint, _init) =>
			Response.json({ user: { roles: ["onboarded-member"] } })
		);
		await expect(actions.globalBackground({
			request, url, locals: { token: "member-access-token" }, fetch
		})).rejects.toMatchObject({ status: 303, location: "/scholarships?country=Italy" });

		expect(fetch).toHaveBeenCalledOnce();
		const [endpoint, init] = fetch.mock.calls[0];
		expect(String(endpoint)).toBe("https://api.example.test/users/me/onboarding");
		expect(init.method).toBe("POST");
		expect(new Headers(init.headers).get("Authorization")).toBe("Bearer member-access-token");
		expect(JSON.parse(init.body)).toEqual({
			academic_background: {
				student_level: "ungrd",
				university_id: 7,
				university_name: null,
				major: "Art History",
				graduation_year: CURRENT_GRADUATION_YEAR + 1
			},
			global_background: {
				travel_experience: "4to7",
				has_traveled_edu: false,
				other_language_spoken: "Italian",
				interested_regions: ["seurope", "easia"]
			},
			completed_steps: ["academic_background", "global_background"]
		});
	});

	it("returns field errors for an invalid travel answer and missing regions", async () => {
		const academic = await actions.academicBackground({
			request: formRequest(url, academicAnswers)
		});
		const request = formRequest(url, {
			academicPayload: JSON.stringify(academic.onboardingDraft.academic_background),
			travelExperience: "unknown",
			hasTraveledEdu: "false"
		});
		const fetch = async () => Response.json({ user: { roles: ["onboarded-member"] } });

		await expect(actions.globalBackground({
			request, url, locals: { token: "member-access-token" }, fetch
		})).resolves.toMatchObject({
			status: 400,
			data: {
				form: {
					valid: false,
					errors: {
						travelExperience: expect.arrayContaining([expect.any(String)]),
						interestedRegions: { _errors: expect.arrayContaining([expect.any(String)]) }
					}
				}
			}
		});
	});
});
