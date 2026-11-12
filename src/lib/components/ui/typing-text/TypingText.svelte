<script>
	import { onMount } from 'svelte';

	let {
		words = [],
		timing = 100,
		timeout = 1000,
		accessibleLabel,
		class: className
	} = $props();

	let wordIndex = $state(0);
	let charIndex = $state(1);
	let isDeleting = $state(false);
	let word = $state('');
	let prefersReducedMotion = $state(false);

	const normalizedWords = $derived(words.filter((candidate) => typeof candidate === 'string' && candidate.length > 0));
	const stableWord = $derived(normalizedWords[0] ?? '');
	const longestWord = $derived(normalizedWords.reduce((longest, candidate) => candidate.length > longest.length ? candidate : longest, ''));
	const typeDelay = $derived(Math.max(30, Number.isFinite(timing) ? timing : 100));
	const pauseDelay = $derived(Math.max(0, Number.isFinite(timeout) ? timeout : 1000));

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		let timer;

		function clearTimer() {
			if (timer) clearTimeout(timer);
			timer = undefined;
		}

		function resetToStableWord() {
			wordIndex = 0;
			charIndex = stableWord.length;
			isDeleting = false;
			word = stableWord;
		}

		function typeEffect() {
			const currentWord = normalizedWords[wordIndex] ?? '';
			word = currentWord.substring(0, charIndex);

			if (!isDeleting && charIndex < currentWord.length) {
				charIndex++;
				timer = setTimeout(typeEffect, typeDelay);
			} else if (isDeleting && charIndex > 0) {
				charIndex--;
				timer = setTimeout(typeEffect, typeDelay / 2);
			} else {
				isDeleting = !isDeleting;
				wordIndex = !isDeleting ? (wordIndex + 1) % normalizedWords.length : wordIndex;
				timer = setTimeout(typeEffect, isDeleting ? pauseDelay : Math.min(typeDelay, 80));
			}
		}

		function startTyping() {
			clearTimer();
			if (normalizedWords.length <= 1) {
				resetToStableWord();
				return;
			}

			wordIndex = 0;
			charIndex = Math.min(1, stableWord.length);
			isDeleting = false;
			typeEffect();
		}

		function handleMotionPreference(event) {
			prefersReducedMotion = event.matches;
			if (prefersReducedMotion) {
				clearTimer();
				resetToStableWord();
			} else {
				startTyping();
			}
		}

		prefersReducedMotion = motionQuery.matches;
		if (prefersReducedMotion) resetToStableWord();
		else startTyping();

		motionQuery.addEventListener('change', handleMotionPreference);

		return () => {
			clearTimer();
			motionQuery.removeEventListener('change', handleMotionPreference);
		};
	});
</script>

<span class={`${className ?? ''} relative inline-grid`}>
	<span class="sr-only">{accessibleLabel ?? stableWord}</span>
	<span class="invisible col-start-1 row-start-1" aria-hidden="true">{longestWord}|</span>
	<span class="col-start-1 row-start-1 inline-flex gap-x-2" aria-hidden="true">
		{prefersReducedMotion ? stableWord : word}
		{#if !prefersReducedMotion && normalizedWords.length > 1}
			<span class={`font-extralight ${normalizedWords[wordIndex]?.length === charIndex || charIndex === 0
				? 'animate-[pulse_0.8s_ease-in-out_infinite]' : ''}`}>|</span>
		{/if}
	</span>
</span>
