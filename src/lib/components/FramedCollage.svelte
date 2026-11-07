<script lang="ts">
	import { onMount } from 'svelte';
	import Photo from './Photo.svelte';
	import { kit } from '#lib/motion.svelte.js';
	import type { Chapter } from '#lib/site.js';

	type Props = { chapter: Chapter; count: string; onopen: (index: number, from: DOMRect) => void };
	let { chapter, count, onopen }: Props = $props();
	// O-05 03: his frame with photos placed by hand, as left, top, width, height on the 1440 × 900 page.
	const SLOTS = [
		[250, 170, 210, 320],
		[760, 130, 150, 190],
		[560, 190, 240, 350],
		[700, 520, 190, 108],
		[260, 540, 230, 140],
		[980, 330, 210, 300]
	];
	const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
	let section = $state<HTMLElement>();

	// W2 (O-15): the frame draws, then his photos are placed by hand, one by one as they come into view.
	onMount(() => {
		let batch: { kill: () => void }[] = [];
		void kit().then(({ gsap, ScrollTrigger }) => {
			gsap.to(section!.querySelector('.frame'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'power2.out' });
			batch = ScrollTrigger.batch(section!.querySelectorAll('li'), {
				onEnter: (els) => {
					gsap.fromTo(els, { y: -40, rotation: () => gsap.utils.random(-8, 8) }, { y: 0, rotation: 0, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.07, delay: 0.2 });
					gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none', stagger: 0.07, delay: 0.2 });
				},
				once: true,
				start: 'top 92%'
			});
		});
		return () => batch.forEach((t) => t.kill());
	});
</script>

<section class="collage" aria-labelledby="chapter-title" bind:this={section}>
	<div class="frame" aria-hidden="true"></div>
	<ul>
		{#each chapter.photos.slice(0, 6) as p, i (p.id)}
			{@const [x, y, w, h] = SLOTS[i]}
			<li style:--x={pct(x, 1440)} style:--y={pct(y - 88, 812)} style:--w={pct(w, 1440)} style:--h={pct(h, 812)}>
				<button data-photo={p.id} aria-label="Open: {p.alt}" onclick={(e) => onopen(i, e.currentTarget.getBoundingClientRect())}><Photo photo={p} sizes="(max-width: 760px) 50vw, 20vw" eager={i < 3} /></button>
			</li>
		{/each}
	</ul>
	<h1 id="chapter-title">{chapter.title}</h1>
	<p class="count mono">{count}</p>
</section>

<style>
	.collage {
		position: relative;
		height: calc(100dvh - 88px);
		min-height: 560px;
	}
	:global(html[data-motion='on']) .frame {
		clip-path: inset(0% 100% 100% 0%);
	}
	:global(html[data-motion='on']) li {
		opacity: 0;
	}
	.frame {
		position: absolute;
		left: 11.1%;
		right: 11.1%;
		top: 1%;
		bottom: 11.8%;
		border: 1.5px solid var(--ink);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
		height: var(--h);
	}
	button {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	h1 {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 34px;
		margin: 0;
		text-align: center;
		font-family: var(--caps);
		font-weight: 500;
		font-size: 30px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}
	.count {
		position: absolute;
		right: 48px;
		top: 22px;
		margin: 0;
	}
	/* Phone (O-05 P3): the title and count first, then the photos stacked two, one, two. */
	@media (max-width: 760px) {
		.collage {
			height: auto;
			min-height: 0;
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: baseline;
			gap: 10px;
			padding: 0 16px 150px;
		}
		.frame {
			display: none;
		}
		h1,
		.count {
			position: static;
			grid-row: 1;
			font-size: 28px;
			letter-spacing: 0.12em;
			text-align: left;
		}
		.count {
			font-size: 12px;
			letter-spacing: 0.04em;
		}
		ul {
			grid-column: 1 / -1;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}
		li {
			position: static;
			width: auto;
			height: auto;
			aspect-ratio: 174 / 250;
		}
		li:nth-child(3),
		li:nth-child(6) {
			grid-column: 1 / -1;
			aspect-ratio: 358 / 200;
		}
		li:nth-child(4),
		li:nth-child(5) {
			aspect-ratio: 174 / 110;
		}
	}
</style>
