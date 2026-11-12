/**
 * @typedef {{ id: string; name: string }} FilterOption
 * @typedef {{ providers: FilterOption[]; categories: FilterOption[]; countries: FilterOption[]; levels: FilterOption[]; fields: FilterOption[] }} ScholarshipFilterOptions
 */

/**
 * @param {Array<{ provider?: string; categories?: string[]; category?: string; country?: string; location?: string; level?: string; field?: string }>} [items]
 * @returns {ScholarshipFilterOptions}
 */
export function buildScholarshipOptions(items = []) {
	/** @type {Record<keyof ScholarshipFilterOptions, Map<string, string>>} */
	const values = { providers: new Map(), categories: new Map(), countries: new Map(), levels: new Map(), fields: new Map() };
	/** @param {Map<string, string>} map @param {string | undefined} name @param {string | undefined} [value] */
	function add(map, name, value = name) {
		const id = (value ?? "").trim().toLowerCase();
		if (id && id !== "all" && !map.has(id)) map.set(id, (name ?? value ?? "").trim());
	}
	for (const item of items) {
		add(values.providers, item.provider);
		for (const category of item.categories?.length ? item.categories : [item.category]) add(values.categories, category);
		add(values.countries, item.location || item.country, item.country || item.location);
		add(values.levels, item.level);
		add(values.fields, item.field);
	}
	/** @param {Map<string, string>} map @param {string} label @returns {FilterOption[]} */
	function options(map, label) {
		return [{ id: "all", name: label }, ...[...map].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))];
	}
	return {
		providers: options(values.providers, "All providers"),
		categories: options(values.categories, "All categories"),
		countries: options(values.countries, "All destinations"),
		levels: options(values.levels, "All education levels"),
		fields: options(values.fields, "All fields")
	};
}
