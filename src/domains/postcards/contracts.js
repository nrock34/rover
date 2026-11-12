import * as yup from "yup";
import { assertArray, assertObject, assertString } from "../../core/domain/contracts.js";
import { createDomainError } from "../../core/domain/errors.js";

export const POSTCARD_EMBED_KINDS = Object.freeze(["spotify", "youtube", "map"]);
export const POSTCARD_TEXT_FONT_SIZES = Object.freeze(["sm", "md", "lg"]);
export const POSTCARD_EDITOR_FORMAT = "editorjs";
export const POSTCARD_EDITOR_VERSION = 1;

/** @param {number} max @param {string} label */
function optionalTrimmedString(max, label) {
	return yup.string()
		.transform((value) => (typeof value === "string" ? value.trim() : value))
		.max(max, `${label} must be ${max} characters or fewer.`)
		.optional();
}

const requiredTextSchema = yup.string()
	.transform((value) => (typeof value === "string" ? value.trim() : ""))
	.min(1, "Text is required.")
	.required("Text is required.");

const assetReferenceSchema = yup.object({
	id: yup.mixed().test("asset-id", "Asset id is required.", (value) => value == null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0) || (typeof value === "string" && value.trim().length > 0)),
	public_url: yup.string().trim().url("Asset URL must be valid.").notRequired(),
	alt_text: optionalTrimmedString(255, "Asset alt text"),
	caption: optionalTrimmedString(500, "Asset caption")
}).notRequired();

const imageDataSchema = yup.object({
	src: yup.string().trim().url("Image source must be a valid URL.").required("Image source is required."),
	assetId: yup.mixed().test("asset-id", "Asset id must be a number or string.", (value) => value == null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0) || (typeof value === "string" && value.trim().length > 0)),
	asset: assetReferenceSchema.optional(),
	alt: optionalTrimmedString(180, "Image alt text"),
	caption: optionalTrimmedString(280, "Image caption"),
	withBorder: yup.boolean().optional(),
	withBackground: yup.boolean().optional(),
	stretched: yup.boolean().optional()
});

const slideSchema = yup.object({
	src: yup.string().trim().url("Slide source must be a valid URL.").required("Slide source is required."),
	assetId: yup.mixed().test("asset-id", "Asset id must be a number or string.", (value) => value == null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0) || (typeof value === "string" && value.trim().length > 0)),
	asset: assetReferenceSchema.optional(),
	alt: optionalTrimmedString(180, "Slide alt text"),
	caption: optionalTrimmedString(280, "Slide caption")
});

const pollOptionSchema = yup.object({
	id: yup.string().trim().required("Poll option id is required."),
	label: requiredTextSchema.max(120, "Poll option labels must be 120 characters or fewer.")
});

const marginBottomSchema = optionalTrimmedString(120, "Block margin bottom");

/** @param {boolean} allowLayout @returns {yup.Lazy<any>} */
function createPostcardBlockSchema(allowLayout) {
	return yup.lazy((value) => {
		const type = value && typeof value === "object" && !Array.isArray(value)
			? /** @type {{ type?: unknown }} */ (value).type
			: null;
		const baseFields = {
			id: yup.string().trim().required("Block id is required."),
			mb: marginBottomSchema,
			type: yup.string().required("Block type is required.")
		};
		switch (type) {
			case "header": return yup.object({ ...baseFields, type: yup.string().oneOf(["header"]).required(), data: yup.object({ text: requiredTextSchema.max(180), fontSize: yup.string().oneOf(POSTCARD_TEXT_FONT_SIZES).optional() }).required() });
			case "subtext": return yup.object({ ...baseFields, type: yup.string().oneOf(["subtext"]).required(), data: yup.object({ text: requiredTextSchema.max(360), fontSize: yup.string().oneOf(POSTCARD_TEXT_FONT_SIZES).optional() }).required() });
			case "paragraph": return yup.object({ ...baseFields, type: yup.string().oneOf(["paragraph"]).required(), data: yup.object({ text: requiredTextSchema.max(4000) }).required() });
			case "smallText": return yup.object({ ...baseFields, type: yup.string().oneOf(["smallText"]).required(), data: yup.object({ text: requiredTextSchema.max(1200) }).required() });
			case "image": return yup.object({ ...baseFields, type: yup.string().oneOf(["image"]).required(), data: imageDataSchema.required() });
			case "quote": return yup.object({ ...baseFields, type: yup.string().oneOf(["quote"]).required(), data: yup.object({ text: requiredTextSchema.max(1500), attribution: optionalTrimmedString(180, "Quote attribution") }).required() });
			case "embed": return yup.object({ ...baseFields, type: yup.string().oneOf(["embed"]).required(), data: yup.object({ kind: yup.string().oneOf(POSTCARD_EMBED_KINDS).required(), url: yup.string().trim().url().required(), caption: optionalTrimmedString(280, "Embed caption") }).required() });
			case "slideshow": return yup.object({ ...baseFields, type: yup.string().oneOf(["slideshow"]).required(), data: yup.object({ slides: yup.array().of(slideSchema.required()).min(1).required() }).required() });
			case "poll": return yup.object({ ...baseFields, type: yup.string().oneOf(["poll"]).required(), data: yup.object({ question: requiredTextSchema.max(220), options: yup.array().of(pollOptionSchema.required()).min(2).required() }).required() });
			case "layout":
				if (!allowLayout) return yup.object({ ...baseFields, type: yup.string().oneOf(["header", "subtext", "paragraph", "smallText", "image", "quote", "embed", "slideshow", "poll"]).required(), data: yup.mixed().required() });
				return yup.object({ ...baseFields, type: yup.string().oneOf(["layout"]).required(), data: yup.object({ style: optionalTrimmedString(600, "Layout style"), columns: yup.array().of(yup.object({ width: optionalTrimmedString(20, "Layout column width"), style: optionalTrimmedString(600, "Layout column style"), blocks: yup.array().of(postcardLayoutChildBlockSchema).min(1).required() }).required()).min(2).required() }).required() });
			default: return yup.object({ ...baseFields, type: yup.string().oneOf(allowLayout ? ["header", "subtext", "paragraph", "smallText", "image", "quote", "embed", "slideshow", "poll", "layout"] : ["header", "subtext", "paragraph", "smallText", "image", "quote", "embed", "slideshow", "poll"]).required(), data: yup.mixed().required() });
		}
	});
}

const postcardLayoutChildBlockSchema = createPostcardBlockSchema(false);
const postcardEditorBlockSchema = createPostcardBlockSchema(true);

export const postcardEditorDocumentSchema = yup.object({
	format: yup.string().oneOf([POSTCARD_EDITOR_FORMAT]).required(),
	version: yup.number().oneOf([POSTCARD_EDITOR_VERSION]).required(),
	blocks: yup.array().of(postcardEditorBlockSchema).min(1).required()
});

/** @param {unknown} value @returns {import("./types.js").PostcardEditorDocument} */
export function assertPostcardEditorDocument(value) {
	return /** @type {import("./types.js").PostcardEditorDocument} */ (postcardEditorDocumentSchema.validateSync(value, { abortEarly: false, stripUnknown: true }));
}

/** @param {unknown} value @returns {import("./types.js").PostcardEditorDocument | null} */
export function parsePostcardEditorDocument(value) {
	if (value == null) return null;
	try { return assertPostcardEditorDocument(value); } catch { return null; }
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {number | string}
 */
function assertId(value, label) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) return value;
	throw createDomainError("invalid_response", 502, `${label} must be a string or number.`, value);
}

/**
 * Validate a modular block envelope without coupling the frontend to one CMS.
 * Supported producers use `type`, `kind`, or `block_type` as the discriminator.
 *
 * @param {unknown} value
 * @param {string} label
 * @returns {Record<string, unknown>[]}
 */
function assertBlockArray(value, label) {
	return assertArray(value, label).map((entry, index) => {
		const block = assertObject(entry, `${label}[${index}]`);
		const discriminator = block.type ?? block.kind ?? block.block_type;
		if (typeof discriminator !== "string" || !discriminator.trim()) {
			throw createDomainError(
				"invalid_response",
				502,
				`${label}[${index}] must include a block type.`,
				entry
			);
		}
		return block;
	});
}

/**
 * @param {Record<string, unknown>} postcard
 */
function validateModularContent(postcard) {
	const directKeys = ["blocks", "content_blocks", "article_blocks"];
	for (const key of directKeys) {
		if (postcard[key] != null) assertBlockArray(postcard[key], `postcard.${key}`);
	}

	if (Array.isArray(postcard.content)) {
		assertBlockArray(postcard.content, "postcard.content");
	} else if (postcard.content != null && typeof postcard.content !== "string") {
		const content = assertObject(postcard.content, "postcard.content");
		if (content.blocks != null) assertBlockArray(content.blocks, "postcard.content.blocks");
	}

	for (const key of ["article", "body"]) {
		if (postcard[key] == null) continue;
		const envelope = assertObject(postcard[key], `postcard.${key}`);
		if (envelope.blocks != null) assertBlockArray(envelope.blocks, `postcard.${key}.blocks`);
	}
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
export function assertPostcardSummary(value) {
	const postcard = assertObject(value, "postcard");
	assertId(postcard.id, "postcard.id");
	const title = assertString(postcard.title, "postcard.title");
	if (!title.trim()) {
		throw createDomainError("invalid_response", 502, "postcard.title cannot be empty.", value);
	}
	return postcard;
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
export function assertPostcardDetailPayload(value) {
	const postcard = assertPostcardSummary(value);
	validateModularContent(postcard);
	return postcard;
}

/**
 * @param {unknown} value
 * @returns {{ count: number; next: string | null; previous: string | null; results: Record<string, unknown>[] }}
 */
export function assertPostcardListPage(value) {
	if (Array.isArray(value)) {
		return {
			count: value.length,
			next: null,
			previous: null,
			results: value.map(assertPostcardSummary)
		};
	}

	const page = assertObject(value, "postcard list page");
	const results = assertArray(page.results, "postcard list page.results").map(assertPostcardSummary);
	const count = page.count == null ? results.length : page.count;
	if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
		throw createDomainError("invalid_response", 502, "postcard list page.count must be a non-negative number.", count);
	}

	return {
		count,
		next: typeof page.next === "string" ? page.next : null,
		previous: typeof page.previous === "string" ? page.previous : null,
		results
	};
}
