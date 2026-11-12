import { sentrySvelteKit } from "@sentry/sveltekit";
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode, command }) => {
    const shouldAnalyze = mode === "analyze" || process.env.ANALYZE === "true";
    // Local UI review must not upload source maps or send bundler telemetry.
    const enableSentryUpload = command === "build" && process.env.SENTRY_UPLOAD_DISABLED !== "true";
    return {
	plugins: [...(enableSentryUpload ? [sentrySvelteKit({
        sourceMapsUploadOptions: {
            org: "romewithme",
            project: "javascript-sveltekit"
        }
    })] : []), tailwindcss(), enhancedImages(), sveltekit(), ...(shouldAnalyze ? [visualizer({
        emitFile: true,
        filename: 'bundle-stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
    })] : [])],
	optimizeDeps: {
		// Keep Svelte's DOM state shared by the app and unbundled UI components.
		exclude: ['svelte-sonner']
	}
    };
});
