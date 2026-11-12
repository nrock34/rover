/** @param {string | undefined} value */
export function getBlockMarginBottom(value) {
	const margin = value?.trim();
	if (!margin || /[;{}]/.test(margin)) return undefined;
	const utility = margin.match(/^(-?)mb-(\d+(?:\.\d+)?)$/);
	if (utility) return `calc(var(--spacing) * ${(utility[1] ? -1 : 1) * Number(utility[2])})`;
	if (margin === "mb-px") return "1px";
	if (margin === "mb-auto") return "auto";
	return margin.match(/^mb-\[(.+)\]$/)?.[1]?.replace(/_/g, " ") ?? margin;
}
