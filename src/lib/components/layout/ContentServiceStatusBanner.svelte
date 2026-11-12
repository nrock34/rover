<script>
	import { AlertTriangle } from "lucide-svelte";

	let { status = null } = $props();
</script>

{#if status && status.ok === false}
	<section class="border-b border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)]" aria-live="polite">
		<div class="app-shell flex items-start gap-3 py-3 text-[var(--tone-yellow-fg)]">
			<AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
			<div class="min-w-0 space-y-0.5">
				<p class="text-sm font-semibold text-foreground">{status.title}</p>
				<p class="text-xs leading-5 text-foreground/75 sm:text-sm">{status.message}</p>
			</div>
		</div>
	</section>
{/if}
