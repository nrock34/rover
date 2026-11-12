<script>
	import { enhance } from '$app/forms';
	import { ArrowRight, Landmark } from 'lucide-svelte';
	import GlobeLogo from '$lib/assets/logos/VX78WS01.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TypingText } from '$lib/components/ui/typing-text';

	let { form } = $props();

	const destinations = ['Rome', 'Tokyo', 'Barcelona', 'Paris', 'London'];
	const currentYear = new Date().getFullYear();

	const pathways = [
		{
			number: '01',
			note: 'Ask + connect',
			title: 'Community',
			description: 'Ask the awkward question.',
			href: '/community',
			image: '/landing-test/waterfront-walk.webp',
			width: 1600,
			height: 2134,
			position: '47% 82%',
			tone: 'charcoal'
		},
		{
			number: '02',
			note: 'Find your fit',
			title: 'Programs',
			description: 'Find the place that fits.',
			href: '/programs',
			image: '/landing-test/venice-canal.webp',
			width: 1100,
			height: 1466,
			position: '58% 52%',
			tone: 'paper'
		},
		{
			number: '03',
			note: 'Fund the plan',
			title: 'Scholarships',
			description: 'Make the numbers work.',
			href: '/scholarships',
			image: '/landing-test/pastry-case.webp',
			width: 900,
			height: 1200,
			position: '50% 42%',
			tone: 'orange'
		},
		{
			number: '04',
			note: 'Know before you go',
			title: 'Resources',
			description: 'Handle the stuff nobody mentions.',
			href: '/resources',
			image: '/landing-test/rainy-steps.webp',
			width: 900,
			height: 1200,
			position: '68% 32%',
			tone: 'paper-bright'
		}
	];

	const questions = [
		{
			topic: 'Budgeting',
			copy: 'How much should I really budget?',
			image: '/landing-test/pizza-table.webp',
			width: 800,
			height: 1066,
			position: '50% 60%'
		},
		{
			topic: 'Finding home',
			copy: 'Where do people actually live?',
			image: '/landing-test/rome-street-sunset.webp',
			width: 1100,
			height: 1466,
			position: '50% 58%'
		},
		{
			topic: 'Making friends',
			copy: "What if I haven't met anyone yet?",
			image: '/landing-test/park-afternoon.webp',
			width: 900,
			height: 1200,
			position: '60% 72%'
		},
		{
			topic: 'Real life',
			copy: 'Is this homesickness or a bad week?',
			image: '/landing-test/florence-street.webp',
			width: 900,
			height: 1200,
			position: '50% 56%'
		}
	];

	const polaroids = [
		{
			img: { src: '/landing-test/lake-view.webp', alt: '', width: 900, height: 1200 },
			caption: 'weekend escape'
		}
	]

	function reveal(node, { delay = 0 } = {}) {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (reducedMotion.matches) {
			node.classList.remove('reveal-pending');
			return;
		}

		node.style.setProperty('--reveal-delay', `${delay}ms`);
		node.classList.add('reveal-pending');

		function finish() {
			cancelAnimationFrame(frame);
			observer.disconnect();
			node.removeEventListener('transitionend', handleTransitionEnd);
			reducedMotion.removeEventListener('change', handleMotionChange);
			node.classList.remove('reveal-pending', 'reveal-visible');
			node.style.removeProperty('--reveal-delay');
		}

		function handleTransitionEnd(event) {
			if (event.target === node && event.propertyName === 'transform') finish();
		}

		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return;
			node.classList.add('reveal-visible');
			observer.disconnect();
		}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

		const frame = requestAnimationFrame(() => observer.observe(node));

		function handleMotionChange(event) {
			if (!event.matches) return;
			finish();
		}

		node.addEventListener('transitionend', handleTransitionEnd);
		reducedMotion.addEventListener('change', handleMotionChange);

		return {
			destroy() {
				finish();
			}
		};
	}
</script>

<svelte:head>
	<title>RomeWithMe — Belong there</title>
	<meta
		name="description"
		content="Real study abroad stories, useful answers, and people who know what the brochure leaves out."
	/>
</svelte:head>

<div class="landing-page">
	<main>
		<section class="hero" aria-labelledby="landing-hero-heading">
			<div class="hero-copy">
				<span class="hero-watermark" aria-hidden="true">ROMA</span>
				<div class="hero-frame" aria-hidden="true"></div>
				<div class="hero-meta" aria-hidden="true">
					<span>01 / Plan</span>
				</div>
				<div class="hero-message">
					<p class="hero-kicker">
						From Travel Blog to Your Gateway
						<span class="hero-destination">
							to <TypingText timing={120} timeout={1200} words={destinations} accessibleLabel="Rome" />
						</span>
					</p>
					<h1 id="landing-hero-heading">
						<span>Don’t just</span>
						<span>go abroad,</span>
						<em>Belong there!</em>
					</h1>
					<span class="ink-stroke hero-stroke" aria-hidden="true"></span>
					<p class="hero-lede">Real stories, useful answers, and people who know what the brochure leaves out.</p>
					<div class="hero-actions">
						<a class="button button-orange" href="/community">
							Find your people
							<ArrowRight aria-hidden="true" />
						</a>
						<a class="button button-outline" href="/programs">
							Start planning
							<ArrowRight aria-hidden="true" />
						</a>
					</div>
				</div>
				<p class="hero-field-note" aria-hidden="true">est. 2025</p>
			</div>

			<div class="hero-media">
				<div class="hero-media-backdrop" aria-hidden="true"></div>
				<div class="hero-image-frame">
					<img
						class="object-cover"
						src="/landing-test/hero-students.webp"
						alt="Students walking together through a sunlit street"
						width="1600"
						height="2134"
						fetchpriority="high"
						decoding="async"
					/>
				</div>
				<figure class="hero-polaroid">
					<img src={polaroids[0].img.src} alt={polaroids[0].img.alt} width={polaroids[0].img.width} height={polaroids[0].img.height} decoding="async" />
					<figcaption>{polaroids[0].caption}</figcaption>
				</figure>
				<div class="hero-photo-rail" aria-hidden="true">
					<span>OUTSIDE THE CLASSROOM</span>
					<small>2026</small>
				</div>
			</div>
		</section>

		<section class="origin">
			<div class="section-rail origin-rail" aria-hidden="true">
				<span>02</span><i></i><small>THE ORIGIN</small><em></em>
			</div>
			<figure class="origin-media reveal-pending" data-reveal="image" use:reveal>
				<div class="origin-image">
					<img
						src="/landing-test/beach-sunset.webp"
						alt="Students gathered along a beach at sunset"
						width="1600"
						height="2134"
						loading="lazy"
						decoding="async"
					/>
				</div>
				<figcaption><span>THE FIRST SUNSET</span><small>The moment a new city started to feel familiar.</small></figcaption>
			</figure>

			<div class="origin-copy reveal-pending" use:reveal={{ delay: 100 }}>
				<p class="section-eyebrow">How it started</p>
				<h2>Built from a semester that changed everything.</h2>
				<span class="ink-stroke" aria-hidden="true"></span>
				<p>
					I made RomeWithMe after studying in Rome because the best advice never came from a brochure. It came from the people who had already figured it out.
				</p>
				<div class="origin-signoff">
					<p class="signature">— Naeem</p>
					<a class="text-link" href="/postcards?q=Naeem">
						Read the story
						<ArrowRight aria-hidden="true" />
					</a>
				</div>
			</div>
		</section>

		<section class="pathways">
			<div class="section-heading" use:reveal>
				<div class="section-rail" aria-hidden="true">
					<span>03</span><i></i><small>•</small><em>YOUR ROUTE</em>
				</div>
				<p class="section-eyebrow">Four ways in</p>
				<h2>Pick a place to start.</h2>
				<span class="ink-stroke" aria-hidden="true"></span>
			</div>

			<div class="path-grid">
				{#each pathways as path, index}
					<a class={`pathway ${path.tone}`} href={path.href} use:reveal={{ delay: 70 * index }}>
						<div class="path-copy">
							<div class="path-topline">
								<span class="path-number">{path.number}</span>
								<small>{path.note}</small>
							</div>
							<div class="path-main">
								<span class="path-number-ghost" aria-hidden="true">{path.number}</span>
								<h3>{path.title}</h3>
								<p>{path.description}</p>
							</div>
							<span class="path-link">
								Explore
								<ArrowRight aria-hidden="true" />
							</span>
						</div>
						<div class="path-media">
							<img
								src={path.image}
								alt=""
								width={path.width}
								height={path.height}
								style={`object-position: ${path.position}`}
								loading="lazy"
								decoding="async"
							/>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section hidden id="questions" class="questions">
			<div class="questions-intro" use:reveal>
				<div class="section-rail light" aria-hidden="true">
					<span>04</span><i></i><small>•</small><em>QUESTIONS</em>
				</div>
				<span class="questions-mark" aria-hidden="true">?</span>
				<p class="section-eyebrow">Ask what the brochure skips</p>
				<h2>The questions don’t stop when you land.</h2>
				<span class="ink-stroke" aria-hidden="true"></span>
				<p>Ask the thing you cannot find in a brochure. Someone here has probably lived it.</p>
			</div>

			<div class="question-slices" data-reveal="image" use:reveal={{ delay: 100 }}>
				{#each questions as question, index}
					<a class={`question question-${index + 1}`} href="/community">
						<img
							class="question-image"
							src={question.image}
							alt=""
							width={question.width}
							height={question.height}
							style={`object-position: ${question.position}`}
							loading="lazy"
							decoding="async"
						/>
						<div class="question-content">
							<div class="question-meta" aria-hidden="true">
								<span></span><small>{question.topic}</small>
							</div>
							<span class="question-title-wrap">
								<span class="question-title question-title-horizontal">{question.copy}</span>
								<span class="question-title question-title-vertical" aria-hidden="true">{question.copy}</span>
							</span>
							<strong>
								Join the conversation
								<ArrowRight aria-hidden="true" />
							</strong>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section class="closing">
			<div class="closing-copy" use:reveal>
				<div class="closing-frame" aria-hidden="true"></div>
				<span class="closing-watermark" aria-hidden="true">GO</span>
				<div class="section-rail light closing-rail" aria-hidden="true">
					<span>04</span><i></i><small>YOUR NEXT CHAPTER</small>
				</div>
				<p class="section-eyebrow light">Make the move</p>
				<div class="closing-stamp" aria-hidden="true">
					<span>GO</span>
					<Landmark />
					<small>GLOBAL</small>
				</div>
				<h2>The next version of you is <em>out there.</em></h2>
				<span class="ink-stroke light" aria-hidden="true"></span>
				<p>Start with one honest question. We’ll help with the rest.</p>
				<div class="closing-actions">
					<a class="button button-paper" href="/auth/signup" data-analytics-event="signup_clicked">Join RomeWithMe</a>
					<a class="closing-link" href="/postcards">Browse postcards</a>
				</div>
			</div>

			<div class="closing-media" use:reveal={{ delay: 120 }}>
				<div class="closing-media-backdrop" aria-hidden="true"></div>
				<img
					src="/landing-test/campus-hallway.webp"
					alt="Students walking together through a university hallway"
					width="1600"
					height="2134"
					loading="lazy"
					decoding="async"
				/>
				<p class="closing-caption" aria-hidden="true">A NEW CHAPTER</p>
			</div>
		</section>

		<section class="newsletter" aria-labelledby="newsletter-heading">
			<div class="dispatch-rule" aria-hidden="true"><i></i><i></i><i></i><span></span></div>
			<div class="newsletter-inner" use:reveal>
				<div class="newsletter-copy">
					<p class="newsletter-kicker">Weekly highlights / Issue 01</p>
					<h2 id="newsletter-heading">A little less searching every week.</h2>
					<p>New postcards, useful resources, program updates, and scholarships—straight to your inbox.</p>
				</div>

				<form data-analytics-form="newsletter" use:enhance method="POST" action="?/newsletterSignup" class="newsletter-form">
					<label for="landing-newsletter-email">Email address</label>
					<div class="newsletter-controls">
						<Input
							id="landing-newsletter-email"
							class="newsletter-input"
							name="email"
							type="email"
							value={form?.email ?? ''}
							placeholder="you@example.com"
							autocomplete="email"
							required
							aria-invalid={form?.error ? 'true' : undefined}
							aria-describedby={form?.error ? 'newsletter-error' : form?.status === 'success' ? 'newsletter-success' : 'newsletter-note'}
						/>
						<Button type="submit" class="newsletter-submit">
							Subscribe
							<ArrowRight aria-hidden="true" />
						</Button>
					</div>

					{#if form?.error}
						<p id="newsletter-error" class="newsletter-feedback error" role="alert">
							{form.description ?? 'Enter a valid email address.'}
						</p>
					{:else if form?.status === 'success'}
						<p id="newsletter-success" class="newsletter-feedback success" role="status">
							You’re subscribed. Watch your inbox for the next dispatch.
						</p>
					{:else}
						<p id="newsletter-note" class="newsletter-note">Free to join. Unsubscribe anytime.</p>
					{/if}
				</form>
			</div>
		</section>
	</main>

	<footer class="landing-footer">
		<div class="footer-main">
			<div class="footer-intro">
				<a class="footer-brand" href="/" aria-label="RomeWithMe — Grow Roots in New Places, home">
					<span class="footer-brand-icon"><GlobeLogo fill="currentColor" /></span>
					<span class="footer-brand-copy brand-lockup-tight">
						<strong>RomeWithMe</strong>
						<small>Grow Roots in New Places</small>
					</span>
				</a>
				<p>Real advice, honest stories, and people who have already figured out the hard parts.</p>
				<a class="footer-email" href="mailto:info@romewithme.com">info@romewithme.com</a>
			</div>

			<nav class="footer-navigation" aria-label="Footer navigation">
				<div>
					<h2>Explore</h2>
					<a href="/postcards">Postcards</a>
					<a href="/programs">Programs</a>
					<a href="/community">Community</a>
				</div>
				<div>
					<h2>Plan</h2>
					<a href="/scholarships">Scholarships</a>
					<a href="/resources">Resources</a>
					<a href="/about">About us</a>
				</div>
				<div>
					<h2>Get started</h2>
					<a href="/auth/signup" data-analytics-event="signup_clicked">Join the community</a>
					<a href="/auth/login">Log in</a>
				</div>
			</nav>
		</div>

		<div class="footer-bottom">
			<p>© {currentYear} RomeWithMe. Made for students finding their place abroad.</p>
			<nav aria-label="Legal">
				<a href="/privacy-policy">Privacy</a>
				<a href="/terms-of-service">Terms</a>
			</nav>
		</div>
	</footer>
</div>

<style>
	@reference "../../app.css";

	:global(body) {
		@apply bg-[#f4efe6];
	}

	.landing-page {
		--paper: #f4efe6;
		--paper-bright: #fffaf1;
		--ink: #19212a;
		--orange: #d95d32;
		--orange-action: #b94722;
		--orange-text: #a83b20;
		--orange-on-dark: #e66b42;
		--charcoal: #1d2226;
		--landing-shell: 96rem;
		--landing-gutter: clamp(1.25rem, 3vw, 2.5rem);
		--landing-header-height: calc(5.75rem + 3px);
		--hero-copy-gutter: clamp(1.5rem, 4vw, 4rem);
		--section-space: clamp(4rem, 7vw, 7.5rem);
		--motion-fast: 180ms;
		--motion-medium: 280ms;
		--motion-slow: 420ms;
		--motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
		@apply min-w-0 overflow-x-clip bg-[#f4efe6] font-sans text-[#19212a];
		background-image: url('/landing-test/paper-noise.svg');
		font-synthesis: none;
		letter-spacing: 0;
	}

	.hero h1,
	.origin h2,
	.section-heading h2,
	.questions h2,
	.closing h2,
	.newsletter h2,
	.path-copy h3,
	.question-title {
		@apply m-0 text-balance font-display font-semibold;
		letter-spacing: -0.035em;
	}

	.section-rail {
		@apply mb-4 grid w-full items-center gap-3.5 font-sans not-italic uppercase;
		grid-template-columns: auto minmax(2rem, 1fr) auto auto;
		letter-spacing: 0.12em;
	}

	.section-rail > span {
		@apply text-xs font-extrabold text-[#a83b20];
	}

	.section-rail > i {
		@apply block h-px bg-current opacity-20;
	}

	.section-rail > small,
	.section-rail > em {
		@apply text-[0.66rem] font-bold not-italic;
	}

	.section-rail > em {
		@apply opacity-50;
	}

	.section-rail.light,
	.section-rail.light > span {
		@apply text-[#fffaf1];
	}

	.section-eyebrow {
		@apply mb-2.5 mt-0 text-[0.72rem] font-extrabold uppercase text-[#a83b20];
		letter-spacing: 0.16em;
	}

	.section-eyebrow.light {
		@apply text-[#fffaf1];
	}

	.ink-stroke {
		@apply mt-4 block h-[0.3rem] w-[min(18rem,56%)] bg-[#d95d32];
		clip-path: polygon(0 28%, 95% 0, 100% 55%, 4% 100%);
	}

	.hero-actions,
	.closing-actions {
		@apply mt-5 flex flex-wrap items-center gap-3;
	}

	.button {
		@apply inline-flex min-h-12 items-center justify-center gap-4 rounded-[0.15rem] border border-transparent px-5 py-2.5 text-[0.9rem] font-bold no-underline;
		transition:
			background-color var(--motion-fast) var(--motion-ease),
			color var(--motion-fast) var(--motion-ease);
	}

	.button :global(svg),
	.text-link :global(svg),
	.path-link :global(svg),
	.question strong :global(svg) {
		@apply size-[1.15rem];
		transition: transform var(--motion-fast) var(--motion-ease);
	}

	.button:hover :global(svg),
	.button:focus-visible :global(svg),
	.text-link:hover :global(svg),
	.text-link:focus-visible :global(svg),
	.pathway:hover .path-link :global(svg),
	.pathway:focus-visible .path-link :global(svg),
	.question:hover strong :global(svg),
	.question:focus strong :global(svg) {
		transform: translateX(0.22rem);
	}

	.button-orange {
		@apply bg-[#b94722] text-[#fffaf1] hover:bg-[#19212a] focus-visible:bg-[#19212a];
	}

	.button-outline {
		@apply border-[#19212a] text-[#19212a] hover:bg-[#19212a] hover:text-[#fffaf1] focus-visible:bg-[#19212a] focus-visible:text-[#fffaf1];
	}

	.text-link,
	.closing-link {
		@apply mt-5 inline-flex items-center gap-8 border-b-2 border-current py-2 font-bold text-[#a83b20] no-underline;
	}

	@keyframes hero-line-in {
		from {
			opacity: 0;
			transform: translateY(1.2rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes hero-image-in {
		from {
			opacity: 0.35;
			transform: scale(1.045);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes hero-frame-in {
		from {
			clip-path: inset(0 100% 0 0);
			transform: scale(1.035);
		}
		to {
			clip-path: inset(0 0 0 0);
			transform: scale(1);
		}
	}

	@keyframes hero-polaroid-in {
		from {
			opacity: 0;
			transform: translateY(-1rem) rotate(-8deg);
		}
		to {
			opacity: 1;
			transform: translateY(0) rotate(-2.5deg);
		}
	}

	.hero {
		@apply mx-auto grid max-w-[96rem];
		height: calc(100dvh - var(--landing-header-height));
		min-height: 38rem;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	.hero-copy {
		@apply relative isolate flex min-w-0 items-center;
		padding: 5rem var(--hero-copy-gutter);
	}

	.hero-frame {
		@apply pointer-events-none absolute inset-x-5 inset-y-6 -z-10;
	}

	.hero-frame::after {
		@apply absolute -bottom-px -right-px h-1 w-[32%] bg-[#d95d32] content-[''];
	}

	.hero-watermark {
		@apply absolute -bottom-[0.12em] -right-[0.04em] -z-10 font-display font-bold leading-none text-[#19212a]/[0.04];
		font-size: clamp(11rem, 20vw, 20rem);
		letter-spacing: -0.08em;
	}

	.hero-message {
		@apply relative z-10 w-full max-w-[42rem];
	}

	.hero-meta {
		@apply absolute top-8 flex items-center gap-4 text-[0.68rem] font-extrabold uppercase;
		left: var(--hero-copy-gutter);
		letter-spacing: 0.13em;
		animation: hero-line-in 500ms var(--motion-ease) both;
	}

	.hero-meta span {
		@apply text-[#a83b20];
	}

	.hero-meta small {
		@apply text-[inherit] opacity-55;
	}

	.hero-kicker {
		@apply mb-5 mt-0 grid max-w-[29rem] gap-2 text-[0.76rem] font-extrabold uppercase leading-[1.35];
		letter-spacing: 0.12em;
		animation: hero-line-in 540ms 70ms var(--motion-ease) both;
	}

	.hero-destination {
		@apply block min-h-[1.35em] font-display text-[#a83b20] italic normal-case;
		font-size: clamp(1.6rem, 2.5vw, 2.4rem);
		font-weight: 600;
		letter-spacing: -0.015em;
	}

	.hero h1 {
		@apply text-balance whitespace-normal font-semibold;
		font-size: clamp(3.75rem, min(6.1vw, 9.6dvh), 6.5rem);
		line-height: 0.94;
		letter-spacing: -0.055em;
	}

	.hero h1 span,
	.hero h1 em {
		@apply block w-fit not-italic;
		animation: hero-line-in 650ms var(--motion-ease) both;
	}

	.hero h1 span:first-child {
		animation-delay: 120ms;
	}

	.hero h1 span:nth-child(2) {
		animation-delay: 190ms;
	}

	.hero h1 em {
		@apply relative z-10 mt-[0.08em] text-[#a83b20] italic;
		margin-left: 0.1em;
		font-size: 1.04em;
		font-weight: 600;
		animation-delay: 270ms;
	}

	.hero h1 em::after {
		@apply absolute -bottom-[0.05em] -right-[0.1em] left-[0.04em] -z-10 h-[0.18em] bg-[#d95d32]/15 content-[''];
		transform: skewX(-12deg);
	}

	.hero-stroke {
		@apply relative mt-5 h-[0.22rem] w-[min(15rem,48%)];
	}

	.hero-stroke::after {
		@apply absolute left-8 right-[-1.5rem] top-[0.34rem] h-px bg-[#19212a] opacity-30 content-[''];
		transform: rotate(-1deg);
	}

	.hero-lede {
		@apply mt-5 max-w-[32rem] text-pretty;
		font-size: clamp(1rem, 1.2vw, 1.125rem);
		line-height: 1.55;
		animation: hero-line-in 600ms 350ms var(--motion-ease) both;
	}

	.hero-actions {
		margin-top: 1.75rem;
		animation: hero-line-in 600ms 430ms var(--motion-ease) both;
	}

	.hero-actions .button {
		min-height: 3.4rem;
		padding-inline: 1.4rem;
		font-size: 0.95rem;
	}

	.hero-field-note {
		@apply absolute bottom-7 m-0 font-script text-[1.05rem] opacity-70;
		left: var(--hero-copy-gutter);
		transform: rotate(-1deg);
	}

	.hero-media {
		@apply relative min-h-0 min-w-0 overflow-visible;
		padding: 1.7rem 1.8rem 2.8rem 1.1rem;
	}

	.hero-media-backdrop {
		@apply absolute bg-[#b94722];
		inset: 2.5rem 0.7rem 1.7rem -0.2rem;
		clip-path: polygon(4% 0, 100% 0, 100% 94%, 95% 100%, 0 100%, 0 7%);
		animation: hero-frame-in 760ms 240ms var(--motion-ease) both;
	}

	.hero-image-frame {
		@apply relative h-full overflow-hidden border border-[#fffaf1]/40;
		box-shadow: 0 2rem 4rem rgb(9 12 14 / 32%);
		clip-path: polygon(3% 0, 100% 0, 100% 94%, 96% 100%, 0 100%, 0 7%);
		animation: hero-frame-in 900ms 320ms var(--motion-ease) both;
	}

	.hero-image-frame::after {
		@apply pointer-events-none absolute inset-0 content-[''];
		background:
			linear-gradient(90deg, rgb(185 71 34 / 24%), transparent 28%),
			linear-gradient(0deg, rgb(14 18 21 / 38%), transparent 42%),
			url('/landing-test/paper-noise.svg');
		background-blend-mode: normal, normal, soft-light;
	}

	.hero-image-frame img {
		@apply block h-full w-full object-cover;
		object-position: 50% 85%;
		animation: hero-image-in 1s var(--motion-ease) both;
	}

	.hero-polaroid {
		@apply absolute bottom-[3.3rem] left-[-3.2rem] z-20 m-0 w-[clamp(10rem,15vw,14rem)] bg-[#fffaf1] p-[0.72rem] pb-[2.55rem];
		box-shadow: 0 1.4rem 2.7rem rgb(9 12 14 / 28%);
		transform: rotate(-2.5deg);
		animation: hero-polaroid-in 700ms 720ms var(--motion-ease) both;
	}

	.hero-polaroid::before {
		@apply absolute -top-[0.7rem] left-[32%] h-[1.35rem] w-16 bg-[#f0dcb4]/60 content-[''];
		box-shadow: 0 1px 2px rgb(25 33 42 / 12%);
		transform: rotate(4deg);
	}

	.hero-polaroid img {
		@apply block w-full object-cover saturate-[0.88] contrast-[1.04];
		aspect-ratio: 1.2 / 0.78;
		object-position: 50% 50%;
	}

	.hero-polaroid figcaption {
		@apply absolute inset-x-3 bottom-2 text-center font-script text-base;
	}

	.hero-photo-rail {
		@apply absolute bottom-3 left-9 right-8 flex items-center justify-between gap-4 text-[0.63rem] font-bold uppercase text-[#19212a];
		letter-spacing: 0.12em;
	}

	.hero-photo-rail small {
		@apply text-[inherit] opacity-60;
	}

	.origin {
		@apply relative grid items-center;
		padding: var(--section-space) max(var(--landing-gutter), calc((100vw - var(--landing-shell)) / 2)) calc(var(--section-space) / 2);
		grid-template-columns: minmax(0, 1.15fr) minmax(24rem, 0.85fr);
		column-gap: clamp(3rem, 6vw, 6rem);
		row-gap: 2.25rem;
	}

	.origin-rail {
		@apply col-span-full mb-0;
	}

	.origin-media {
		@apply relative m-0 mr-5 flex min-h-0 flex-col self-stretch bg-[#fffaf1] p-3;
		box-shadow: 0.65rem 0.75rem 0 rgb(25 33 42 / 8%), 0 1rem 2rem rgb(25 33 42 / 10%);
	}

	.origin-media::after {
		@apply absolute -right-2 -top-2 size-12 border-r-[5px] border-t-[5px] border-[#d95d32] content-[''];
	}

	.origin-image {
		@apply relative flex-1;
		min-height: clamp(17rem, 26vw, 25rem);
	}

	.origin-media img {
		@apply absolute inset-0 block h-full w-full object-cover saturate-[0.94] contrast-[1.03];
		object-position: 50% 48%;
	}

	.origin-media figcaption {
		@apply flex items-center justify-between gap-4 px-1 pb-1 pt-3 text-[0.68rem] uppercase;
		letter-spacing: 0.09em;
	}

	.origin-media figcaption span {
		@apply font-extrabold text-[#a83b20];
	}

	.origin-media figcaption small {
		@apply text-right text-[inherit] opacity-60;
	}

	.origin-copy {
		@apply relative;
		padding: .5rem 0 .75rem clamp(1rem, 2vw, 2rem);
	}

	.origin-copy h2 {
		@apply max-w-[14ch];
		font-size: clamp(2.4rem, 3.2vw, 3.65rem);
		line-height: 1.02;
	}

	.origin-copy > p:not(.signature):not(.section-eyebrow) {
		@apply mt-3 max-w-lg text-base;
		line-height: 1.45;
	}

	.origin-copy > p:not(.signature):not(.section-eyebrow)::first-letter {
		@apply float-left mr-[0.1em] mt-[0.08em] font-display font-semibold leading-[0.78] text-[#a83b20];
		font-size: 2.8em;
	}

	.signature {
		@apply m-0 font-script text-[1.35rem];
	}

	.origin-signoff {
		@apply mt-4 flex flex-wrap items-end justify-between gap-3;
	}

	.origin-signoff .text-link {
		@apply mt-0;
	}

	.pathways {
		padding-block: calc(var(--section-space) / 2) var(--section-space);
	}

	.section-heading {
		@apply mx-auto max-w-[96rem];
		padding: 0 var(--landing-gutter) 2.25rem;
	}

	.section-heading h2 {
		font-size: clamp(2.5rem, 3.8vw, 4.25rem);
		line-height: 0.92;
	}

	.path-grid {
		@apply mx-auto grid max-w-[96rem] grid-cols-4;
		padding: 0 var(--landing-gutter);
		gap: clamp(0.9rem, 1.5vw, 1.5rem);
	}

	.pathway {
		@apply relative grid overflow-visible border border-[#19212a]/50 bg-[#f4efe6] text-[#19212a] no-underline;
		grid-template-rows: minmax(15rem, 1fr) auto;
		box-shadow: 0.45rem 0.55rem 0 rgb(25 33 42 / 9%);
		transition:
			transform var(--motion-medium) var(--motion-ease),
			box-shadow var(--motion-medium) var(--motion-ease);
	}

	.pathway:nth-child(even) {
		grid-template-rows: auto minmax(15rem, 1fr);
	}

	.pathway:nth-child(even) .path-copy {
		@apply row-start-2;
	}

	.pathway:nth-child(even) .path-media {
		@apply row-start-1;
	}

	.pathway:hover,
	.pathway:focus-visible {
		transform: translateY(-0.45rem);
		box-shadow: 0.7rem 0.9rem 0 var(--orange), 0 1.5rem 2.5rem rgb(25 33 42 / 14%);
	}

	.path-copy {
		@apply relative z-10 flex min-w-0 flex-col justify-between overflow-hidden px-6 pb-6 pt-5;
		min-height: 15rem;
	}

	.path-topline {
		@apply flex items-center justify-between gap-3;
	}

	.path-topline small,
	.path-number {
		@apply text-[0.62rem] font-extrabold uppercase;
		letter-spacing: 0.11em;
	}

	.path-topline small {
		@apply opacity-60;
	}

	.path-number {
		@apply text-[0.76rem] tabular-nums;
		letter-spacing: 0.12em;
	}

	.path-main {
		@apply relative mt-4;
	}

	.path-number-ghost {
		@apply pointer-events-none absolute -bottom-[0.26em] -right-[0.12em] font-display text-[8rem] font-bold leading-none opacity-[0.055];
	}

	.path-copy h3 {
		@apply relative;
		font-size: clamp(1.65rem, 2vw, 2.3rem);
		line-height: 1.05;
	}

	.path-copy p {
		@apply relative mb-0 mt-2 max-w-[24ch] text-[0.875rem] leading-[1.4];
	}

	.path-link {
		@apply relative mt-auto inline-flex w-fit items-center gap-4 border-b-2 border-[#d95d32] pb-2 text-[0.9rem] font-bold;
	}

	.path-media {
		@apply relative z-20 -mt-3 mb-3 ml-3 mr-3 min-w-0 overflow-hidden border border-[#19212a]/30;
		aspect-ratio: 1.25 / 1;
		box-shadow: 0 0.7rem 1.2rem rgb(25 33 42 / 15%);
	}

	.pathway:nth-child(even) .path-media {
		@apply -mb-3 mt-3;
	}

	.path-media img {
		@apply block h-full w-full scale-[1.01] object-cover;
		transition:
			opacity var(--motion-medium) var(--motion-ease),
			transform var(--motion-slow) var(--motion-ease);
	}

	.pathway:hover .path-media img,
	.pathway:focus-visible .path-media img {
		@apply scale-[1.035] opacity-90;
	}

	.pathway.charcoal .path-copy {
		@apply bg-[#1d2226] text-[#fffaf1];
	}

	.pathway.charcoal .path-link {
		@apply border-[#e66b42];
	}

	.pathway.orange .path-copy {
		@apply bg-[#b94722] text-[#fffaf1];
	}

	.pathway.orange .path-link {
		@apply border-[#fffaf1];
	}

	.pathway.paper-bright .path-copy {
		@apply bg-[#fffaf1];
	}

	.questions {
		@apply relative bg-[#1d2226] text-[#f4efe6];
		padding-top: 3.5rem; /* clamp(4.5rem, 7vw, 7rem); */
	}

	.questions-intro {
		@apply relative z-10 mx-auto max-w-[96rem] px-[var(--landing-gutter)] pb-10;
	}

	.questions-mark {
		@apply absolute -bottom-[0.28em] right-8 -z-10 font-display font-bold leading-[0.8] text-[#fffaf1]/[0.06];
		font-size: clamp(12rem, 23vw, 23rem);
	}

	.questions-intro h2 {
		@apply max-w-[13ch];
		font-size: clamp(2.65rem, 4.4vw, 4.75rem);
		line-height: 0.9;
	}

	.questions-intro > p:last-child {
		@apply mb-0 mt-3 max-w-[34rem] text-base leading-[1.45];
	}

	.question-slices {
		@apply flex min-h-[31rem] overflow-hidden;
	}

	.question {
		@apply relative isolate flex min-w-0 flex-1 overflow-hidden border-r border-[#f4efe6]/80 text-[#fffaf1] no-underline;
		transition: flex-grow var(--motion-slow) var(--motion-ease);
	}

	.question-1 {
		flex-grow: 2.15;
	}

	.question-slices:has(.question:not(.question-1):hover) .question-1,
	.question-slices:has(.question:focus) .question:not(:focus) {
		flex-grow: 1;
	}

	.question-slices .question:hover,
	.question-slices .question:focus {
		flex-grow: 2.15;
	}

	.question:last-child {
		@apply border-r-0;
	}

	.question::before {
		@apply absolute inset-x-0 bottom-0 z-30 h-1 origin-left scale-x-0 bg-[#e66b42] content-[''];
		transition: transform var(--motion-slow) var(--motion-ease);
	}

	.question:hover::before,
	.question:focus::before {
		@apply scale-x-100;
	}

	.question::after {
		@apply absolute inset-0 content-[''];
		background: linear-gradient(0deg, rgb(8 11 13 / 78%) 0%, rgb(8 11 13 / 15%) 66%, rgb(185 71 34 / 14%) 100%);
		transition: background-color var(--motion-fast) var(--motion-ease);
	}

	.question:hover::after,
	.question:focus::after {
		background: linear-gradient(0deg, rgb(8 11 13 / 70%) 0%, rgb(8 11 13 / 5%) 62%, rgb(185 71 34 / 22%) 100%);
	}

	.question-image {
		@apply pointer-events-none absolute inset-0 block h-full w-full scale-[1.015] overflow-hidden object-cover;
		filter: grayscale(0.82) sepia(0.22) brightness(0.67) contrast(1.08);
		transition:
			filter var(--motion-slow) var(--motion-ease),
			transform 700ms var(--motion-ease);
	}

	.question:hover .question-image,
	.question:focus .question-image {
		filter: grayscale(0) sepia(0) brightness(0.92) contrast(1.03) saturate(1.08);
		transform: scale(1.055) translateX(-0.4%);
	}

	.question-content {
		@apply relative z-10 flex w-full flex-col justify-end p-7;
	}

	.question-meta {
		@apply absolute left-6 right-6 top-6 flex items-center justify-between gap-4 text-[0.65rem] font-extrabold uppercase;
		letter-spacing: 0.11em;
		transition: transform var(--motion-medium) var(--motion-ease);
	}

	.question-meta span {
		@apply text-[#e66b42];
	}

	.question-meta small {
		@apply text-[inherit] opacity-75;
	}

	.question:hover .question-meta,
	.question:focus .question-meta {
		transform: translateY(-0.2rem);
	}

	.question-title-wrap {
		@apply relative flex min-h-[clamp(8rem,14vw,12rem)] items-end;
	}

	.question-title {
		@apply max-w-[10ch];
		font-size: clamp(1.4rem, 1.85vw, 2.05rem);
		line-height: 1.05;
		letter-spacing: -0.025em;
		transition:
			opacity var(--motion-medium) var(--motion-ease),
			transform var(--motion-medium) var(--motion-ease);
	}

	.question-title-horizontal {
		@apply translate-y-2 opacity-0;
	}

	.question-title-vertical {
		@apply absolute bottom-0 right-0 max-h-48 opacity-100;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
	}

	.question-1 .question-title-horizontal,
	.question:hover .question-title-horizontal,
	.question:focus .question-title-horizontal {
		@apply translate-y-0 opacity-100;
	}

	.question-1 .question-title-vertical,
	.question:hover .question-title-vertical,
	.question:focus .question-title-vertical {
		@apply opacity-0;
		transform: rotate(180deg) translateY(-0.5rem);
	}

	.question-slices:has(.question:hover) .question-1:not(:hover) .question-title-horizontal,
	.question-slices:has(.question:focus) .question:not(:focus) .question-title-horizontal {
		@apply translate-y-2 opacity-0;
	}

	.question-slices:has(.question:hover) .question-1:not(:hover) .question-title-vertical,
	.question-slices:has(.question:focus) .question:not(:focus) .question-title-vertical {
		@apply opacity-100;
		transform: rotate(180deg);
	}

	.question strong {
		@apply invisible mt-5 inline-flex w-fit translate-y-2 items-center gap-8 bg-[#b94722] px-4 py-3 text-[0.9rem] font-bold opacity-0;
		transition:
			opacity var(--motion-medium) var(--motion-ease),
			transform var(--motion-medium) var(--motion-ease),
			visibility 0s linear var(--motion-medium);
	}

	.question-1 strong,
	.question:hover strong,
	.question:focus strong,
	.question-slices:has(.question:hover) .question:hover strong,
	.question-slices:has(.question:focus) .question:focus strong {
		@apply visible translate-y-0 opacity-100;
		transition-delay: 80ms, 80ms, 0s;
	}

	.question-slices:has(.question:hover) .question-1:not(:hover) strong,
	.question-slices:has(.question:focus) .question:not(:focus) strong {
		@apply invisible translate-y-2 opacity-0;
	}

	.closing {
		@apply relative grid min-h-[40rem] overflow-hidden bg-[#b94722] text-[#fffaf1];
		width: calc(100% - 2 * var(--landing-gutter));
		max-width: calc(var(--landing-shell) - 2 * var(--landing-gutter));
		margin-inline: auto;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		grid-template-rows: 1fr;
	}

	.closing-copy {
		@apply relative z-20 isolate overflow-hidden;
		padding: clamp(2.5rem, 4vw, 4.5rem) clamp(2rem, 3vw, 3rem);
	}

	.closing-frame {
		@apply absolute -z-10 border border-[#fffaf1]/40;
		inset: 1.25rem;
	}

	.closing-watermark {
		@apply absolute -bottom-[0.22em] -right-[0.04em] -z-20 font-display font-bold leading-none text-[#fffaf1]/[0.07];
		font-size: clamp(12rem, 23vw, 23rem);
	}

	.closing-rail {
		@apply max-w-[34rem];
	}

	.closing h2 {
		@apply max-w-[11ch];
		font-size: clamp(3rem, 4.7vw, 5.25rem);
		line-height: 1;
	}

	.closing h2 em {
		@apply block italic;
		font-weight: 600;
	}

	.closing-copy > p:not(.section-eyebrow) {
		@apply mb-0 mt-4 max-w-md text-base leading-[1.45];
	}

	.ink-stroke.light {
		@apply bg-[#fffaf1];
	}

	.button-paper {
		@apply bg-[#fffaf1] text-[#19212a] hover:bg-[#19212a] hover:text-[#fffaf1] focus-visible:bg-[#19212a] focus-visible:text-[#fffaf1];
	}

	.closing-link {
		@apply mt-0 text-[#fffaf1];
	}

	.closing-stamp {
		@apply absolute bottom-8 right-4 grid aspect-square w-32 rotate-[9deg] place-items-center rounded-full border-[3px] border-current font-extrabold text-[#fffaf1]/30;
	}

	.closing-stamp::before {
		@apply absolute inset-1.5 rounded-[inherit] border border-current content-[''];
	}

	.closing-stamp span {
		@apply self-end text-[0.8rem];
	}

	.closing-stamp small {
		@apply self-start text-[0.66rem] font-extrabold;
	}

	.closing-stamp :global(svg) {
		@apply size-10;
	}

	.closing-media {
		@apply relative col-start-2 row-start-1 overflow-visible;
		clip-path: polygon(13% 0, 100% 0, 100% 100%, 0 100%, 4% 64%);
	}

	.closing-media-backdrop {
		@apply absolute -z-10 bg-[#fffaf1];
		inset: 1.2rem 1.2rem -1rem -0.6rem;
		clip-path: inherit;
	}

	.closing-media::after {
		@apply pointer-events-none absolute inset-0 content-[''];
		background:
			linear-gradient(90deg, rgb(185 71 34 / 38%), transparent 35%),
			linear-gradient(0deg, rgb(15 18 20 / 28%), transparent 48%);
	}

	.closing-media img {
		@apply absolute inset-0 block h-full w-full object-cover saturate-[0.92] contrast-[1.04];
		object-position: 50% 20%;
	}

	.closing-caption {
		@apply absolute bottom-4 right-5 z-20 m-0 bg-[#fffaf1] px-3 py-2 text-[0.62rem] font-extrabold uppercase text-[#19212a];
		letter-spacing: 0.1em;
	}

	.newsletter {
		@apply text-[#19212a];
		padding-block: var(--section-space);
	}

	.dispatch-rule {
		@apply mx-auto mb-10 grid max-w-[96rem] items-center gap-1.5 px-[var(--landing-gutter)] opacity-35;
		grid-template-columns: 1.2fr 0.45fr 0.8fr auto;
	}

	.dispatch-rule i {
		@apply block h-px bg-[#1d2226];
	}

	.dispatch-rule i:nth-child(2) {
		@apply bg-[#d95d32];
	}

	.dispatch-rule i:nth-child(3) {
		@apply opacity-35;
	}

	.dispatch-rule span {
		@apply ml-2 text-[0.62rem] font-extrabold;
		letter-spacing: 0.12em;
	}

	.newsletter-inner {
		@apply mx-auto grid max-w-[96rem] items-center px-[var(--landing-gutter)];
		grid-template-columns: minmax(18rem, 0.9fr) minmax(25rem, 1.1fr);
		gap: clamp(3rem, 7vw, 7rem);
	}

	.newsletter-kicker {
		@apply mb-2 mt-0 text-[0.78rem] font-extrabold uppercase leading-tight text-[#a83b20];
	}

	.newsletter h2 {
		@apply max-w-[17ch];
		font-size: clamp(2rem, 2.7vw, 2.9rem);
		line-height: 1.02;
	}

	.newsletter-copy > p:last-child {
		@apply mb-0 mt-2 max-w-2xl text-[0.9rem] leading-[1.4];
	}

	.newsletter-form {
		@apply min-w-0 border border-[#19212a]/30 bg-[#f4efe6] p-5;
		box-shadow: 0.55rem 0.55rem 0 rgb(25 33 42 / 8%);
	}

	.newsletter-form label {
		@apply mb-2 block text-[0.8rem] font-bold;
	}

	.newsletter-controls {
		@apply grid gap-2.5;
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.newsletter-form :global(.newsletter-input) {
		@apply h-[3.15rem] rounded-[0.15rem] border border-[#19212a] bg-white text-[0.95rem] font-medium text-[#19212a];
	}

	.newsletter-form :global(.newsletter-input:focus-visible) {
		@apply border-[#d95d32] shadow-none outline-3 outline-offset-1 outline-[#d95d32]/30;
	}

	.newsletter-form :global(.newsletter-input[aria-invalid='true']) {
		@apply border-[#a83b20];
	}

	.newsletter-form :global(.newsletter-submit) {
		@apply h-[3.15rem] rounded-[0.15rem] bg-[#b94722] px-5 text-[0.9rem] font-extrabold text-[#fffaf1] hover:bg-[#19212a] focus-visible:bg-[#19212a];
		transition:
			background-color var(--motion-fast) var(--motion-ease),
			color var(--motion-fast) var(--motion-ease);
	}

	.newsletter-form :global(.newsletter-submit svg) {
		@apply size-4;
	}

	.newsletter-feedback,
	.newsletter-note {
		@apply mb-0 mt-2 text-[0.78rem] leading-snug;
	}

	.newsletter-note {
		@apply text-[#19212a]/70;
	}

	.newsletter-feedback.error {
		@apply text-[#a83b20];
	}

	.newsletter-feedback.success {
		@apply text-[#276247];
	}

	.landing-footer {
		@apply relative overflow-hidden bg-[#1d2226] text-[#fffaf1];
	}

	.landing-footer::before {
		@apply pointer-events-none absolute -bottom-[0.28em] -left-[0.08em] font-display text-[18rem] font-bold leading-none text-[#fffaf1]/[0.035] content-['RWM'];
	}

	.footer-main,
	.footer-bottom {
		@apply relative z-10 mx-auto max-w-[96rem];
	}

	.footer-main {
		@apply grid px-[var(--landing-gutter)] pb-10 pt-12;
		grid-template-columns: minmax(19rem, 0.9fr) minmax(30rem, 1.35fr);
		gap: clamp(4rem, 8vw, 9rem);
	}

	.footer-brand {
		@apply inline-flex w-fit items-center gap-1 text-inherit no-underline;
	}

	.footer-brand-icon {
		@apply block size-[4.5rem] shrink-0 text-[#e66b42] leading-none;
	}

	.footer-brand-icon :global(svg) {
		@apply block size-full;
	}

	.footer-brand-copy {
		@apply flex min-w-0 flex-col whitespace-nowrap;
	}

	.footer-brand-copy strong {
		@apply text-[1.45rem] font-bold leading-[1.15];
	}

	.footer-brand-copy small {
		@apply text-[0.84rem] leading-tight text-[#f4efe6]/80;
	}

	.footer-intro > p {
		@apply mb-2 mt-2 max-w-[40ch] text-[0.9rem] leading-[1.4] text-[#f4efe6]/75;
	}

	.footer-email {
		@apply inline-flex min-h-9 items-center border-b border-[#d95d32] pb-1 text-[0.9rem] font-bold text-inherit no-underline hover:text-[#e66b42] focus-visible:text-[#e66b42];
		transition: color var(--motion-fast) var(--motion-ease);
	}

	.footer-navigation {
		@apply grid grid-cols-3;
		gap: clamp(2rem, 5vw, 5rem);
	}

	.footer-navigation > div + div {
		@apply border-l border-[#fffaf1]/20;
		padding-left: clamp(1rem, 2vw, 2rem);
	}

	.footer-navigation h2 {
		@apply mb-2 mt-0 text-[0.78rem] font-extrabold uppercase leading-tight text-[#e66b42];
	}

	.footer-navigation a {
		@apply flex min-h-9 w-fit items-center text-[0.95rem] font-semibold leading-tight text-[#fffaf1] no-underline hover:text-[#e66b42] focus-visible:text-[#e66b42];
		transition: color var(--motion-fast) var(--motion-ease);
	}

	.footer-bottom {
		@apply flex items-center justify-between gap-8 border-t border-[#fffaf1]/25 px-[var(--landing-gutter)] py-4 text-[0.8rem] text-[#f4efe6]/65;
	}

	.footer-bottom p {
		@apply m-0 leading-snug;
	}

	.footer-bottom nav {
		@apply flex gap-6;
	}

	.footer-bottom a {
		@apply inline-flex min-h-8 items-center text-inherit no-underline hover:text-[#e66b42] focus-visible:text-[#e66b42];
		transition: color var(--motion-fast) var(--motion-ease);
	}

	.landing-page :global(.reveal-pending) {
		opacity: 0;
		transform: translate3d(0, 1.1rem, 0);
		transition: none;
		will-change: opacity, transform;
	}

	.landing-page :global(.reveal-pending[data-reveal='image']) {
		transform: translate3d(0, 0.6rem, 0) scale(0.99);
	}

	.landing-page :global(.reveal-pending.reveal-visible) {
		opacity: 1;
		transform: none;
		transition:
			opacity 650ms var(--motion-ease) var(--reveal-delay, 0ms),
			transform 650ms var(--motion-ease) var(--reveal-delay, 0ms);
	}

	.landing-page a:focus-visible,
	.landing-page button:focus-visible {
		@apply outline-3 outline-offset-4 outline-[#d95d32];
	}

	.questions a:focus-visible,
	.closing a:focus-visible {
		@apply outline-[#fffaf1];
	}

	.questions .question:focus {
		@apply -outline-offset-4;
	}

	@media (max-width: 76rem) {
		.path-grid {
			@apply grid-cols-2;
		}

		.pathway {
			grid-template-rows: minmax(15rem, 1fr) auto;
		}

		.pathway:nth-child(even) {
			grid-template-rows: auto minmax(15rem, 1fr);
		}

		.path-copy {
			min-height: 15rem;
		}
	}

	@media (max-width: 64rem) {
		.landing-page {
			--landing-header-height: calc(5.25rem + 3px);
		}

		.hero {
			@apply h-auto grid-cols-1;
			min-height: calc(100dvh - var(--landing-header-height));
			grid-template-rows: 1fr auto;
		}

		.hero-copy {
			@apply min-h-0 justify-center;
		}

		.hero-media {
			@apply h-[25rem] min-h-0 overflow-visible px-8 pb-10 pt-5;
		}

		.hero-image-frame img {
			object-position: 50% 76%;
		}

		.hero-polaroid {
			@apply bottom-10 left-2 w-40;
		}

		.origin {
			@apply grid-cols-1 gap-6 px-8;
		}

		.origin-copy {
			@apply max-w-[46rem] pl-0;
		}

		.origin-copy h2,
		.closing h2 {
			max-width: 18ch;
		}

		.origin-media {
			@apply mb-5 w-[calc(100%-1.25rem)] max-w-none;
		}

		.origin-image {
			@apply flex-none;
			height: clamp(14rem, 28vw, 17rem);
			min-height: 0;
		}

		.closing {
			@apply grid-cols-1;
			grid-template-rows: auto 30rem;
		}

		.closing-copy {
			@apply px-8 py-10;
		}

		.closing-frame {
			@apply inset-6;
		}

		.closing-media {
			@apply col-start-1 row-start-2;
			clip-path: polygon(0 7%, 62% 0, 100% 4%, 100% 100%, 0 100%);
		}

		.footer-main {
			@apply grid-cols-1 gap-12 px-8;
		}

		.footer-intro > p {
			@apply max-w-[44ch];
		}

		.footer-bottom,
		.newsletter-inner {
			@apply px-8;
		}

		.newsletter-inner {
			@apply gap-10;
		}
	}

	@media (max-width: 50rem) {
		.hero-copy {
			@apply box-border w-full;
			padding: 4.5rem var(--hero-copy-gutter) 4rem;
		}

		.hero-message,
		.hero-lede,
		.hero-actions,
		.hero-actions .button {
			@apply box-border w-full min-w-0 max-w-full;
		}

		.hero h1 {
			@apply whitespace-normal text-balance;
			font-size: clamp(2.65rem, 10.8vw, 4.5rem);
		}

		.hero-kicker {
			@apply text-[0.72rem];
		}

		.hero-destination {
			font-size: clamp(1.4rem, 5.5vw, 1.85rem);
		}

		.hero-lede {
			@apply text-[0.9375rem];
		}

		.hero-actions {
			@apply mt-4 flex-col items-stretch gap-3;
		}

		.button {
			@apply min-h-12 w-full justify-between px-4 py-3;
		}

		.hero-media {
			@apply min-h-0 px-5 pb-10 pt-4;
			height: clamp(18rem, 70vw, 22rem);
		}

		.hero-image-frame img {
			object-position: 50% 80%;
		}

		.hero-media-backdrop {
			inset: 1.6rem 0.5rem;
		}

		.hero-polaroid {
			@apply bottom-9 left-1.5 w-30 p-2 pb-7;
		}

		.hero-polaroid figcaption {
			@apply bottom-1 text-[0.72rem];
		}

		.hero-photo-rail {
			@apply inset-x-5;
		}

		.hero-photo-rail small {
			@apply hidden;
		}

		.origin,
		.section-heading,
		.questions-intro {
			@apply px-5;
		}

		.origin {
			@apply grid-cols-1 gap-6;
		}

		.origin-image {
			height: clamp(11rem, 42vw, 13rem);
		}

		.origin-copy {
			@apply py-3 pl-0;
		}

		.origin-copy h2 {
			font-size: clamp(1.85rem, 7vw, 2.2rem);
		}

		.origin-copy > p:not(.signature):not(.section-eyebrow) {
			@apply mt-3 text-[0.9375rem] leading-[1.4];
		}

		.origin-copy > p:not(.signature):not(.section-eyebrow)::first-letter {
			float: none;
			margin: 0;
			font: inherit;
			color: inherit;
		}

		.closing-copy > p:not(.section-eyebrow) {
			font-size: 0.9375rem;
			line-height: 1.4;
		}

		.origin-signoff {
			@apply flex-col items-start;
		}

		.section-heading {
			@apply pb-8;
		}

		.section-heading h2,
		.questions-intro h2 {
			font-size: clamp(1.95rem, 7vw, 2.3rem);
		}

		.path-grid {
			@apply grid-cols-1;
		}

		.pathway,
		.pathway:nth-child(even) {
			@apply grid min-h-[13rem];
			grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
			grid-template-rows: 1fr;
		}

		.pathway .path-copy,
		.pathway:nth-child(even) .path-copy {
			@apply col-start-1 row-start-1;
			min-height: 0;
		}

		.pathway .path-media,
		.pathway:nth-child(even) .path-media {
			@apply col-start-2 row-start-1 m-3 ml-0;
			aspect-ratio: auto;
		}

		.path-media img {
			@apply absolute inset-0;
		}

		.path-number-ghost {
			@apply hidden;
		}

		.path-copy {
			@apply min-h-0 p-5;
		}

		.path-number {
			@apply text-[0.7rem];
		}

		.path-copy h3 {
			@apply text-[1.3rem];
		}

		.path-copy p {
			@apply mt-1.5 text-[0.84rem];
		}

		.path-link {
			@apply text-[0.82rem];
		}

		.question-slices {
			@apply grid min-h-0 grid-cols-1 bg-none;
		}

		.question {
			@apply min-h-56 flex-none border-b border-r-0 border-[#f4efe6]/70;
		}

		.question-title-wrap {
			@apply min-h-0;
		}

		.question-title-horizontal,
		.question-1 .question-title-horizontal,
		.question:hover .question-title-horizontal,
		.question:focus .question-title-horizontal,
		.question-slices:has(.question:hover) .question-1:not(:hover) .question-title-horizontal,
		.question-slices:has(.question:focus) .question:not(:focus) .question-title-horizontal {
			@apply max-w-[12ch] translate-y-0 text-[1.55rem] opacity-100;
		}

		.question-title-vertical {
			@apply hidden;
		}

		.question-content {
			@apply p-5;
		}

		.question strong,
		.question-1 strong,
		.question:hover strong,
		.question:focus strong,
		.question-slices:has(.question:hover) .question-1:not(:hover) strong,
		.question-slices:has(.question:focus) .question:not(:focus) strong {
			@apply visible translate-y-0 opacity-100;
		}

		.closing {
			grid-template-rows: auto 22rem;
		}

		.closing-copy {
			@apply px-5 py-9;
		}

		.closing h2 {
			font-size: clamp(2.15rem, 7.8vw, 2.65rem);
		}

		.closing-stamp {
			@apply -right-10 bottom-4 w-32;
		}

		.closing-actions {
			@apply flex-col items-stretch;
		}

		.closing-link {
			@apply w-fit;
		}

		.newsletter-inner {
			@apply grid-cols-1 items-start gap-6 px-5;
		}

		.newsletter h2 {
			font-size: clamp(1.85rem, 6.8vw, 2.3rem);
		}

		.section-rail {
			grid-template-columns: auto minmax(2rem, 1fr) auto;
		}

		.section-rail > em {
			@apply hidden;
		}

		.questions-mark {
			@apply -right-[0.1em] text-[12rem];
		}

		.question-meta {
			@apply inset-x-5 top-4;
		}

		.closing-frame {
			@apply inset-4;
		}

		.closing-watermark {
			@apply text-[12rem];
		}

		.footer-main {
			@apply gap-8 px-5 pb-8 pt-10;
		}

		.footer-brand-icon {
			@apply size-16;
		}

		.footer-navigation {
			@apply gap-6;
		}

		.footer-navigation > div + div {
			@apply border-l-0 pl-0;
		}

		.footer-bottom {
			@apply flex-col items-start gap-2 px-5 py-3.5;
		}
	}

	@media (max-width: 24rem) {
		.pathway,
		.pathway:nth-child(even) {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		}

		.path-copy {
			@apply p-4;
		}
	}

	@media (max-width: 36rem) {
		.footer-navigation {
			@apply grid-cols-2;
		}

		.footer-navigation > div:last-child {
			@apply col-span-full;
		}

		.newsletter-controls {
			@apply grid-cols-1;
		}

		.newsletter-form :global(.newsletter-submit) {
			@apply w-full;
		}
	}

	@media (prefers-reduced-motion: reduce), (scripting: none) {
		.landing-page :global(.reveal-pending),
		.landing-page :global(.reveal-pending[data-reveal='image']) {
			opacity: 1;
			transform: none;
			will-change: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.landing-page *,
		.landing-page *::before,
		.landing-page *::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			scroll-behavior: auto !important;
			transition-delay: 0s !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
