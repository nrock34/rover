import { describe, expect, it } from "vitest";
import { directoryHref } from "../../src/lib/components/directory/directory-url.js";

describe("directory URLs", () => {
	it("serializes selected filters without keeping cleared or default values", () => {
		const url = new URL("https://app.example.test/scholarships?provider=Old&category=merit");
		const href = directoryHref(url, {
			provider: "Arts & Culture + Travel",
			category: "all",
			q: "études abroad",
			page: 1
		});

		const next = new URL(href, url);
		expect(next.pathname).toBe("/scholarships");
		expect(Object.fromEntries(next.searchParams)).toEqual({
			provider: "Arts & Culture + Travel",
			q: "études abroad"
		});
	});

	it("resets pagination after a filter change while retaining other selections", () => {
		const url = new URL("https://app.example.test/scholarships?country=Italy&category=merit&sort_by=deadline&page=4&cursor=old");
		const next = new URL(directoryHref(url, { country: "Spain" }), url);

		expect(Object.fromEntries(next.searchParams)).toEqual({
			country: "Spain",
			category: "merit",
			sort_by: "deadline"
		});
	});

	it("keeps filters and sorting when moving to another page", () => {
		const url = new URL("https://app.example.test/programs?provider=IES+Abroad&country=Italy&sort_by=cost&page=2&cursor=old");
		const next = new URL(directoryHref(url, { page: 3 }, false), url);

		expect(Object.fromEntries(next.searchParams)).toEqual({
			provider: "IES Abroad",
			country: "Italy",
			sort_by: "cost",
			page: "3"
		});
	});
});
