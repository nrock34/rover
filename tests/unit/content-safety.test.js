import { expect, it } from "vitest";
import { sanitizeLegacyHtml } from "../../src/domains/postcards/sanitize.js";

it("preserves readable postcard content and safe media while removing active HTML", () => {
	const html = sanitizeLegacyHtml(`
		<script>stealCookies()</script>
		<p style="position:fixed" onclick="steal()">A morning in <strong>Rome</strong>.</p>
		<a href="jav&#x61;script:alert(1)">Read the story</a>
		<a href="https://example.test/rome">Travel guide</a>
		<figure><img src="/media/rome.jpg" alt="Rome at sunrise" onerror="steal()"><figcaption>Sunrise</figcaption></figure>
		<iframe src="https://untrusted.example.test"></iframe>
	`, { baseUrl: "https://cms.example.test/api/" });

	expect(html).toContain("<p>A morning in <strong>Rome</strong>.</p>");
	expect(html).toContain("<a>Read the story</a>");
	expect(html).toContain('<a href="https://example.test/rome">Travel guide</a>');
	expect(html).toContain('src="https://cms.example.test/media/rome.jpg"');
	expect(html).toContain('alt="Rome at sunrise"');
	expect(html).toContain("<figcaption>Sunrise</figcaption>");
	expect(html).not.toMatch(/script|steal|iframe|onerror|onclick|style=|untrusted\.example/i);
});
