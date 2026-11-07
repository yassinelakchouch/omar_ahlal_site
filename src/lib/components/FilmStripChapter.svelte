<script lang="ts">
	import { onMount } from 'svelte';
	import Photo from './Photo.svelte';
	import { kit } from '#lib/motion.js';
	import type { Chapter } from '#lib/site.js';

	type Props = { chapter: Chapter; count: string; onopen: (index: number, from: DOMRect) => void };
	let { chapter, count, onopen }: Props = $props();
	const [hero, ...rest] = $derived(chapter.photos);
	let section = $state<HTMLElement>();
	let strip = $state<HTMLElement>();
	let frames = $state<HTMLElement>();

	// W4 (O-15): scrolling moves the strip frame by frame (ScrollTrigger scrub); if GSAP never loads, it stays and scrolls on its own.
	onMount(() => {
		if (matchMedia('(max-width: 760px)').matches) return;
		let kill = () => {};
		void kit().then(({ gsap }) => {
			const tween = gsap.to(frames!, {
				y: () => -Math.max(0, frames!.scrollHeight - strip!.clientHeight),
				ease: 'none',
				scrollTrigger: { trigger: section!, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
			});
			kill = () => (tween.scrollTrigger?.kill(), tween.kill());
		});
		return () => kill();
	});
</script>

<section bind:this={section} class="cinematic" style:--frames={rest.length} aria-labelledby="chapter-title">
	<div class="stage">
		<button class="hero" data-photo={hero.id} aria-label="Open: {hero.alt}" onclick={(e) => onopen(0, e.currentTarget.getBoundingClientRect())}><Photo photo={hero} eager sizes="82vw" /></button>
		<div class="film" bind:this={strip}>
			<ol class="frames" bind:this={frames}>
				{#each rest as p, i (p.id)}
					<li>
						<span class="code mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}A</span>
						<button data-photo={p.id} aria-label="Open: {p.alt}" onclick={(e) => onopen(i + 1, e.currentTarget.getBoundingClientRect())}><Photo photo={p} sizes="(max-width: 760px) 40vw, 230px" /></button>
					</li>
				{/each}
			</ol>
		</div>
		<h1 id="chapter-title">{chapter.title}</h1>
		<p class="count mono">{count} · Scroll moves the strip</p>
	</div>
</section>

<style>
	.cinematic {
		height: calc(100dvh + var(--frames) * 160px);
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100dvh;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		/* The row is the screen's height: a tall hero photo must not stretch it (that left the strip nothing to travel). */
		grid-template-rows: minmax(0, 1fr);
		overflow: hidden;
	}
	.hero {
		position: relative;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	.hero :global(img) {
		filter: grayscale(1);
	}
	.film {
		position: relative;
		overflow: hidden;
		background: #111;
		--holes: repeating-linear-gradient(to bottom, var(--paper) 0 9px, transparent 9px 21px);
		background:
			var(--holes) left 7px top 0 / 9px 100% no-repeat,
			var(--holes) right 7px top 0 / 9px 100% no-repeat,
			#111;
	}
	.frames {
		margin: 0;
		padding: 12px 26px;
		list-style: none;
		display: grid;
		gap: 12px;
	}
	li {
		position: relative;
		aspect-ratio: 4 / 5;
	}
	li button {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	.code {
		position: absolute;
		left: -20px;
		top: 50%;
		rotate: -90deg;
		font-size: 10px;
		color: #c9a227;
	}
	h1 {
		position: absolute;
		right: 260px;
		top: 24px;
		margin: 0;
		transform: rotate(-90deg) translateX(-100%);
		transform-origin: right top;
		translate: 0 -100%;
		font-family: var(--caps);
		font-weight: 600;
		font-size: 64px;
		letter-spacing: 0.04em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--ink);
		mix-blend-mode: difference;
		filter: invert(1);
	}
	.count {
		position: absolute;
		left: 48px;
		bottom: 40px;
		margin: 0;
		color: var(--paper);
	}
	/* GSAP never loaded (wide screens; the phone has its own layout below): no pinned scroll; the strip scrolls on its own. */
	@media (min-width: 761px) {
		:global(html[data-motion='off']) .cinematic {
			height: auto;
		}
		:global(html[data-motion='off']) .stage {
			position: relative;
			height: calc(100dvh - 88px);
		}
		:global(html[data-motion='off']) .film {
			overflow-y: auto;
		}
	}
	/* Phone: the sea, then the strip across the width, swiped. */
	@media (max-width: 760px) {
		.cinematic {
			height: auto;
			padding-bottom: 150px;
		}
		.stage {
			position: relative;
			height: auto;
			grid-template-columns: 1fr;
			overflow: visible;
		}
		.hero {
			aspect-ratio: 3 / 4;
		}
		.film {
			overflow-x: auto;
			--holes: repeating-linear-gradient(to right, var(--paper) 0 9px, transparent 9px 21px);
			background:
				var(--holes) left 0 top 6px / 100% 9px no-repeat,
				var(--holes) left 0 bottom 6px / 100% 9px no-repeat,
				#111;
		}
		.frames {
			grid-auto-flow: column;
			grid-auto-columns: 40vw;
			padding: 22px 12px;
			translate: none !important;
		}
		.code {
			display: none;
		}
		h1 {
			position: static;
			order: -1;
			transform: none;
			translate: none;
			padding: 0 16px 12px;
			font-size: 28px;
			letter-spacing: 0.12em;
			mix-blend-mode: normal;
			filter: none;
		}
		.count {
			left: 16px;
			bottom: auto;
			top: 12px;
		}
	}
</style>
