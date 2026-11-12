import { isObject, objectArray, objectOrNull, textOrEmpty, toFiniteNumber, toNullableFiniteNumber } from "../../core/domain/coerce.js";
import { escapeHtml, sanitizeLegacyHtml, sanitizeUrl } from "./sanitize.js";
import { parsePostcardEditorDocument } from "./contracts.js";
import { adaptGraphqlConnection } from "../../core/graphql/connection.js";

const POSTCARD_FALLBACK_DESCRIPTION = "A travel story from the RomeWithMe community.";

/**
 * @param {unknown} value
 * @returns {string}
 */
function text(value) {
	return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stripMarkup(value) {
	return text(value)
		.replace(/<[^>]*>/gu, " ")
		.replace(/&(?:nbsp|amp|quot|#39);/giu, " ")
		.replace(/\s+/gu, " ")
		.trim();
}

/**
 * @param {unknown} value
 * @param {string} apiUrl
 * @returns {string | null}
 */
function resolveAssetUrl(value, apiUrl) {
	if (typeof value !== "string" || !value.trim()) return null;
	return sanitizeUrl(value, { type: "src", baseUrl: apiUrl });
}

/**
 * @param {unknown} value
 * @returns {import("./types.js").PostcardId | null}
 */
function mapNullableId(value) {
	if (typeof value === "string" && value.trim()) return value.trim();
	return null;
}

/**
 * @param {unknown} value
 * @returns {import("./types.js").PostcardId}
 */
function mapId(value) {
	return mapNullableId(value) ?? "";
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function mapDate(value) {
	if (typeof value !== "string" || !value.trim()) return null;
	return Number.isNaN(Date.parse(value)) ? null : value;
}

/**
 * @param {unknown} value
 * @returns {import("./types.js").PostcardTaxonomy | null}
 */
function mapTaxonomy(value) {
	if (typeof value === "string" && value.trim()) return { id: null, name: value.trim() };
	const item = objectOrNull(value);
	const name = text(item?.name);
	return name ? { id: mapNullableId(item?.id), name } : null;
}

/**
 * @param {unknown} value
 * @returns {import("./types.js").PostcardTaxonomy[]}
 */
function mapTags(value) {
	if (!Array.isArray(value)) return [];
	return value.map(mapTaxonomy).filter((tag) => tag !== null);
}

/**
 * @param {unknown} value
 * @param {string} apiUrl
 * @returns {import("./types.js").PostcardAuthor}
 */
function mapAuthor(value, apiUrl) {
	const author = objectOrNull(value);
	const associatedUser = toNullableFiniteNumber(author?.associated_user ?? author?.associatedUser);
	return {
		name: text(author?.name) || "RomeWithMe Team",
		avatar: resolveAssetUrl(author?.avatar, apiUrl),
		associatedUser,
		href: associatedUser == null ? null : `/profiles/${associatedUser}`
	};
}

/**
 * @param {Record<string, unknown>} postcard
 * @param {{ apiUrl: string }} options
 * @returns {import("./types.js").PostcardCard}
 */
export function mapPostcardCard(postcard, { apiUrl }) {
	const id = mapId(postcard.id);
	const location = objectOrNull(postcard.location);
	return {
		id,
		title: text(postcard.title) || "Untitled postcard",
		description: text(postcard.excerpt) || text(postcard.description) || POSTCARD_FALLBACK_DESCRIPTION,
		author: mapAuthor(postcard.author, apiUrl),
		category: mapTaxonomy(postcard.category),
		tags: mapTags(postcard.tags),
		image: resolveAssetUrl(postcard.banner_img ?? postcard.thumbnail ?? postcard.image, apiUrl),
		featured: Boolean(postcard.featured),
		region: text(postcard.region) || null,
		location: {
			city: text(location?.city) || null,
			country: text(location?.country) || null
		},
		datePublished: mapDate(postcard.date_published ?? postcard.published_at ?? postcard.created_at),
		dateUpdated: mapDate(postcard.updated_at),
		likes: toFiniteNumber(postcard.like_count ?? postcard.likes),
		comments: toFiniteNumber(postcard.comment_count ?? postcard.comments),
		views: toFiniteNumber(postcard.views),
		href: `/postcards/${encodeURIComponent(String(id))}`
	};
}

/**
 * @param {string} value
 * @param {number} index
 * @returns {string}
 */
function headingId(value, index) {
	const slug = value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/gu, "")
		.replace(/[^a-z0-9]+/gu, "-")
		.replace(/^-|-$/gu, "")
		.slice(0, 64);
	return slug ? `${slug}-${index + 1}` : `section-${index + 1}`;
}

/**
 * @param {Record<string, unknown>} block
 * @returns {Record<string, unknown>}
 */
function blockPayload(block) {
	const nested = objectOrNull(block.data) ?? objectOrNull(block.value);
	return nested ? { ...block, ...nested } : block;
}

/**
 * @param {Record<string, unknown>} block
 * @returns {string}
 */
function blockKind(block) {
	return text(block.type ?? block.kind ?? block.block_type)
		.toLowerCase()
		.replace(/[\s-]+/gu, "_");
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function mapListItems(value) {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => {
			if (typeof item === "string") return stripMarkup(item);
			const record = objectOrNull(item);
			return stripMarkup(record?.text ?? record?.content ?? record?.value);
		})
		.filter(Boolean);
}

/**
 * @param {unknown} value
 * @returns {value is "info" | "tip" | "warning" | "success"}
 */
function isCalloutTone(value) {
	return value === "info" || value === "tip" || value === "warning" || value === "success";
}

/**
 * @param {Record<string, unknown>} block
 * @param {number} index
 * @param {string} apiUrl
 * @returns {import("./types.js").PostcardArticleBlock[]}
 */
function mapBlock(block, index, apiUrl) {
	const kind = blockKind(block);
	const data = blockPayload(block);
	const content = text(data.html ?? data.content ?? data.text ?? data.value);

	if (["paragraph", "text", "rich_text", "richtext"].includes(kind)) {
		const html = sanitizeLegacyHtml(content, { baseUrl: apiUrl });
		return html ? [{ kind: "paragraph", html }] : [];
	}

	if (["heading", "header"].includes(kind)) {
		const heading = stripMarkup(data.text ?? data.content ?? data.value);
		if (!heading) return [];
		const requestedLevel = toFiniteNumber(data.level);
		const level = requestedLevel === 3 || requestedLevel === 4 ? requestedLevel : 2;
		return [{ kind: "heading", level, text: heading, id: headingId(heading, index) }];
	}

	if (["image", "photo"].includes(kind)) {
		const file = objectOrNull(data.file);
		const asset = objectOrNull(data.asset);
		const src = resolveAssetUrl(data.src ?? data.url ?? data.image ?? file?.url ?? asset?.public_url, apiUrl);
		if (!src) return [];
		return [{
			kind: "image",
			src,
			alt: text(data.alt ?? data.alt_text) || text(data.caption) || "Postcard article image",
			caption: text(data.caption) || null,
			credit: text(data.credit ?? data.attribution) || null
		}];
	}

	if (kind === "gallery") {
		const images = Array.isArray(data.images) ? data.images : [];
		return images.flatMap((image, imageIndex) => {
			const record = typeof image === "string" ? { src: image } : objectOrNull(image);
			if (!record) return [];
			return mapBlock({ ...record, type: "image" }, index + imageIndex, apiUrl);
		});
	}

	if (["quote", "blockquote"].includes(kind)) {
		const quote = stripMarkup(data.text ?? data.content ?? data.quote ?? data.value);
		return quote ? [{ kind: "quote", text: quote, attribution: text(data.attribution ?? data.author ?? data.caption) || null }] : [];
	}

	if (["list", "bulleted_list", "ordered_list"].includes(kind)) {
		const items = mapListItems(data.items ?? data.values);
		const style = text(data.style ?? data.list_style).toLowerCase();
		const ordered = kind === "ordered_list" || style === "ordered" || style === "numbered";
		return items.length ? [{ kind: "list", ordered, items }] : [];
	}

	if (["callout", "note"].includes(kind)) {
		const calloutText = stripMarkup(data.text ?? data.content ?? data.value);
		const tone = text(data.tone).toLowerCase();
		return calloutText ? [{
			kind: "callout",
			tone: isCalloutTone(tone) ? tone : "info",
			title: stripMarkup(data.title) || null,
			text: calloutText
		}] : [];
	}

	if (["divider", "separator", "delimiter"].includes(kind)) return [{ kind: "divider" }];

	if (["code", "code_block"].includes(kind)) {
		const code = textOrEmpty(data.code ?? data.content ?? data.value);
		return code ? [{ kind: "code", code, language: text(data.language) || null }] : [];
	}

	if (["link", "link_preview"].includes(kind)) {
		const hrefValue = text(data.href ?? data.url);
		const href = hrefValue ? sanitizeUrl(hrefValue, { type: "href" }) : null;
		if (!href) return [];
		return [{
			kind: "link",
			href,
			title: stripMarkup(data.title ?? data.text) || href,
			description: stripMarkup(data.description) || null
		}];
	}

	if (["html", "legacy_html", "rich_html"].includes(kind)) {
		const html = sanitizeLegacyHtml(content, { baseUrl: apiUrl });
		return html ? [{ kind: "legacy_html", html }] : [];
	}

	// Keep readable text from an unfamiliar block while safely dropping unknown media or embeds.
	if (content) return [{ kind: "paragraph", html: escapeHtml(stripMarkup(content)) }];
	return [];
}

/**
 * @param {Record<string, unknown>} postcard
 * @returns {Record<string, unknown>[] | null}
 */
function findBlockArray(postcard) {
	let foundEmptyEnvelope = false;
	for (const candidate of [postcard.blocks, postcard.content_blocks, postcard.article_blocks]) {
		if (Array.isArray(candidate)) {
			const blocks = candidate.filter(isObject);
			if (blocks.length > 0) return blocks;
			foundEmptyEnvelope = true;
		}
	}
	if (Array.isArray(postcard.content)) {
		const blocks = postcard.content.filter(isObject);
		return blocks.length > 0 ? blocks : [];
	}

	for (const envelopeValue of [postcard.content, postcard.article, postcard.body]) {
		const envelope = objectOrNull(envelopeValue);
		if (Array.isArray(envelope?.blocks)) {
			const blocks = envelope.blocks.filter(isObject);
			if (blocks.length > 0) return blocks;
			foundEmptyEnvelope = true;
		}
	}

	if (typeof postcard.content === "string" && /^[\s]*[\[{]/u.test(postcard.content)) {
		try {
			const parsed = JSON.parse(postcard.content);
			if (Array.isArray(parsed)) return parsed.filter(isObject);
			const envelope = objectOrNull(parsed);
			if (Array.isArray(envelope?.blocks)) return envelope.blocks.filter(isObject);
		} catch {
			// CKEditor content can begin with brackets; it remains legacy HTML below.
		}
	}
	// During migration an empty modular field can coexist with the CKEditor body.
	if (foundEmptyEnvelope && typeof postcard.content === "string" && postcard.content.trim()) return null;
	return foundEmptyEnvelope ? [] : null;
}

/**
 * @param {import("./types.js").PostcardArticleBlock[]} blocks
 * @returns {Array<{ src: string; alt: string }>}
 */
function extractGallery(blocks) {
	/** @type {Array<{ src: string; alt: string }>} */
	const gallery = [];
	for (const block of blocks) {
		if (block.kind === "image") gallery.push({ src: block.src, alt: block.alt });
		if (block.kind === "legacy_html" || block.kind === "paragraph") {
			for (const match of block.html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/giu)) {
				const src = (match[1] ?? "").replaceAll("&amp;", "&");
				const alt = /\balt="([^"]*)"/iu.exec(match[0])?.[1]
					?.replaceAll("&quot;", '"')
					.replaceAll("&#39;", "'")
					.replaceAll("&amp;", "&") || "Postcard article image";
				if (src) gallery.push({ src, alt });
			}
		}
	}
	return gallery.filter((image, index) => gallery.findIndex((candidate) => candidate.src === image.src) === index);
}

/**
 * @param {import("./types.js").PostcardArticleBlock[]} blocks
 * @returns {number}
 */
function estimateReadingMinutes(blocks) {
	const content = blocks.map((block) => {
		switch (block.kind) {
			case "paragraph":
			case "legacy_html": return stripMarkup(block.html);
			case "heading":
			case "quote": return block.text;
			case "list": return block.items.join(" ");
			case "callout": return `${block.title ?? ""} ${block.text}`;
			case "code": return block.code;
			case "link": return `${block.title} ${block.description ?? ""}`;
			default: return "";
		}
	}).join(" ");
	const wordCount = content.split(/\s+/u).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 220));
}

/**
 * @param {import("./types.js").PostcardEditorDocument | null} document
 * @param {string} apiUrl
 * @returns {import("./types.js").PostcardEditorDocument | null}
 */
function resolveEditorDocumentAssets(document, apiUrl) {
	if (!document) return null;
	const sourceDocument = document;
	/** @param {import("./types.js").PostcardEditorBlock} block */
	const mapBlockAssets = (block) => {
		const data = objectOrNull(block.data);
		if (!data) return block;
		const nextData = { ...data };
		if (block.type === "image") {
			const asset = objectOrNull(data.asset);
			const src = resolveAssetUrl(asset?.public_url ?? data.src, apiUrl);
			if (src) nextData.src = src;
			if (!nextData.alt && asset?.alt_text) nextData.alt = text(asset.alt_text);
			if (!nextData.caption && asset?.caption) nextData.caption = text(asset.caption);
		} else if (block.type === "slideshow" && Array.isArray(data.slides)) {
			nextData.slides = data.slides.map((slide) => {
				const slideAsset = objectOrNull(slide?.asset);
				const src = resolveAssetUrl(slideAsset?.public_url ?? slide?.src, apiUrl);
				return { ...slide, ...(src ? { src } : {}), ...(!slide?.alt && slideAsset?.alt_text ? { alt: text(slideAsset.alt_text) } : {}) };
			});
		} else if (block.type === "layout" && Array.isArray(data.columns)) {
			nextData.columns = data.columns.map((column) => ({ ...column, blocks: Array.isArray(column?.blocks) ? column.blocks.map(mapBlockAssets) : [] }));
		}
		return { ...block, data: nextData };
	};
	return /** @type {import("./types.js").PostcardEditorDocument} */ ({ ...sourceDocument, blocks: sourceDocument.blocks.map(mapBlockAssets) });
}
/**
 * @param {import("./types.js").PostcardEditorDocument} document
 * @returns {Array<{ src: string; alt: string }>}
 */
function extractEditorGallery(document) {
	/** @type {Array<{ src: string; alt: string }>} */
	const images = [];
	/** @param {import("./types.js").PostcardEditorBlock} block */
	const visit = (block) => {
		const data = objectOrNull(block.data);
		if (!data) return;
		if (block.type === "image") {
			const asset = objectOrNull(data.asset);
			const src = text(data.src ?? asset?.public_url);
			if (src) images.push({ src, alt: text(data.alt ?? asset?.alt_text) || "Postcard article image" });
		} else if (block.type === "slideshow" && Array.isArray(data.slides)) {
			data.slides.forEach((slide) => {
				const asset = objectOrNull(slide?.asset);
				const src = text(slide?.src ?? asset?.public_url);
				if (src) images.push({ src, alt: text(slide?.alt ?? asset?.alt_text) || "Postcard article image" });
			});
		} else if (block.type === "layout" && Array.isArray(data.columns)) data.columns.forEach((column) => (column.blocks ?? []).forEach(visit));
	};

	document.blocks.forEach(visit);
	return images;
}
/**
 * @param {import("./types.js").PostcardEditorDocument} document
 * @returns {number}
 */
function estimateEditorReadingMinutes(document) {
	/** @type {string[]} */
	const words = [];
	/** @param {import("./types.js").PostcardEditorBlock} block */
	const visit = (block) => {
		const data = objectOrNull(block.data);
		if (!data) return;
		for (const value of [data.text, data.question, data.attribution]) if (typeof value === "string") words.push(value);
		if (Array.isArray(data.options)) data.options.forEach((option) => { if (typeof option?.label === "string") words.push(option.label); });
		if (block.type === "layout" && Array.isArray(data.columns)) data.columns.forEach((column) => (column.blocks ?? []).forEach(visit));
	};
	document.blocks.forEach(visit);
	return Math.max(1, Math.ceil(words.join(" ").split(/\s+/u).filter(Boolean).length / 220));
}


/**
 * @param {Record<string, unknown>} postcard
 * @param {{ apiUrl: string }} options
 * @returns {import("./types.js").PostcardDetail}
 */
export function mapPostcardDetail(postcard, { apiUrl }) {
	const card = mapPostcardCard(postcard, { apiUrl });
	const parsedEditorDocument = parsePostcardEditorDocument(postcard.content);
	const editorDocument = resolveEditorDocumentAssets(parsedEditorDocument, apiUrl);
	const rawBlocks = editorDocument ? null : findBlockArray(postcard);
	/** @type {import("./types.js").PostcardArticleBlock[]} */
	let articleBlocks = [];
	/** @type {"editorjs" | "modular" | "legacy_html" | "empty"} */
	let contentFormat = "empty";

	if (editorDocument) {
		contentFormat = "editorjs";
	} else if (rawBlocks) {
		articleBlocks = rawBlocks.flatMap((block, index) => mapBlock(block, index, apiUrl));
		contentFormat = "modular";
	} else if (typeof postcard.content === "string" && postcard.content.trim()) {
		const html = sanitizeLegacyHtml(postcard.content, { baseUrl: apiUrl });
		if (html) {
			articleBlocks = [{ kind: "legacy_html", html }];
			contentFormat = "legacy_html";
		}
	}

	const seoDescription = stripMarkup(card.description).slice(0, 160) || POSTCARD_FALLBACK_DESCRIPTION;
	return {
		...card,
		articleBlocks,
		contentFormat,
		editorDocument,
		gallery: editorDocument ? extractEditorGallery(editorDocument) : extractGallery(articleBlocks),
		readingMinutes: editorDocument ? estimateEditorReadingMinutes(editorDocument) : estimateReadingMinutes(articleBlocks),
		seoDescription
	};
}
/** @param {unknown} value @returns {Record<string, unknown> | null} */
function adaptTaxonomy(value) {
	const item = objectOrNull(value);
	return item ? { ...item, id: item.documentId } : null;
}

/**
 * Reshapes the GraphQL Article into the existing postcard mapper input.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
export function adaptGraphqlPostcard(value) {
	const article = objectOrNull(value) ?? {};
	const author = objectOrNull(article.author);
	const banner = objectOrNull(article.banner_img);
	return {
		...article,
		id: article.documentId,
		category: adaptTaxonomy(article.category),
		tags: objectArray(article.tags).map(adaptTaxonomy).filter((item) => item !== null),
		author: author ? { ...author, id: author.documentId } : null,
		banner_img: banner?.public_url ?? null,
		gallery: objectArray(article.gallery).map((asset) => ({ ...asset, id: asset.documentId })),
		created_at: article.createdAt,
		updated_at: article.updatedAt,
		published_at: article.publishedAt
	};
}

/**
 * @param {unknown} value
 * @returns {{ nodes: Record<string, unknown>[]; pageInfo: { total: number; page: number; pageSize: number; pageCount: number }; categories: string[]; tags: string[] }}
 */
export function adaptPostcardDirectoryEnvelope(value) {
	const data = objectOrNull(value) ?? {};
	const taxonomyNames = (/** @type {unknown} */ root) => objectArray(objectOrNull(root)?.nodes)
		.map((item) => typeof item.name === "string" ? item.name.trim() : "")
		.filter(Boolean);
	return {
		...adaptGraphqlConnection(data, "articles", adaptGraphqlPostcard),
		categories: taxonomyNames(data.articleCategories),
		tags: taxonomyNames(data.articleTags)
	};
}

/** @param {unknown} value @returns {Record<string, unknown> | null} */
export function adaptPostcardDetailEnvelope(value) {
	const data = objectOrNull(value);
	const articles = objectOrNull(data?.articles);
	const first = objectArray(articles?.nodes)[0];
	return first ? adaptGraphqlPostcard(first) : null;
}
