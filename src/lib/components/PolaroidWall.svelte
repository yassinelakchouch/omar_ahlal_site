<script lang="ts">
	import { onMount } from 'svelte';
	import Photo from './Photo.svelte';
	import { SETTLE, kit } from '#lib/motion.svelte.js';
	import type { Chapter } from '#lib/site.js';

	type Props = { chapter: Chapter; count: string; onopen: (index: number, from: DOMRect) => void };
	let { chapter, count, onopen }: Props = $props();
	// O-05 05: polaroids pinned to the paper, as left, top, width, height, turn on the 1440 page; a second wall mirrors the first.
	const WALL = [
		[220, 130, 270, 260, -2],
		[560, 330, 440, 270, 1],
		[300, 540, 180, 170, -1],
		[990, 170, 240, 150, 2]
	];
	const MIRROR = WALL.map(([x, y, w, h, r]) => [1440 - x - w, y, w, h, -r]);
	const slot = (i: number) => (i < 4 ? WALL[i] : MIRROR[i - 4]);
	let section = $state<HTMLElement>();
	const tilt = (el: Element) => parseFloat((el as HTMLElement).style.getPropertyValue('--r')) || 0;

	// W3 (O-15): each polaroid lands as it comes into view, then its pin goes in.
	onMount(() => {
		let batch: { kill: () => void }[] = [];
		void kit().then(({ gsap, ScrollTrigger }) => {
			batch = ScrollTrigger.batch(section!.querySelectorAll('li'), {
				onEnter: (els) =>
					void els.forEach((el, i) =>
						gsap.timeline({ delay: i * 0.09 })
							// Lands on its own hand-placed tilt (GSAP folds the CSS rotate into its transform, so the tilt is the end value).
							.fromTo(el, { y: -50, rotation: tilt(el) - 8 }, { y: 0, rotation: tilt(el), opacity: 1, ...SETTLE, duration: 0.55 })
							.fromTo(el.querySelector('.pin'), { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, '-=0.1')
					),
				once: true,
				start: 'top 92%'
			});
		});
		return () => batch.forEach((t) => t.kill());
	});
</script>

<section class="wall" aria-labelledby="chapter-title" bind:this={section}>
	<div class="note">
		<span class="bar" aria-hidden="true"></span>
		<p class="hello">Congratulations</p>
		<p class="text">Takchita, henna, the zaffa: the whole day, in black and white.</p>
	</div>
	<ul>
		{#each chapter.photos.slice(0, 8) as p, i (p.id)}
			{@const [x, y, w, h, r] = slot(i)}
			<li class:second={i >= 4} style:--x="{(x / 1440) * 100}%" style:--y="{y + (i >= 4 ? 760 : 0)}px" style:--w="{(w / 1440) * 100}%" style:--ratio="{w} / {h}" style:--r="{r}deg" style:--i={i}>
				<button class="polaroid" data-photo={p.id} aria-label="Open: {p.alt}" onclick={(e) => onopen(i, e.currentTarget.getBoundingClientRect())}>
					<span class="pin" aria-hidden="true"></span>
					<span class="pic"><Photo photo={p} gray sizes="(max-width: 760px) 90vw, 30vw" eager={i < 2} /></span>
				</button>
			</li>
		{/each}
	</ul>
	<h1 id="chapter-title">{chapter.title} photography</h1>
	<p class="count mono">{count}</p>
</section>

<style>
	.wall {
		position: relative;
		height: 1540px;
	}
	.note {
		position: absolute;
		left: 38.9%;
		top: 62px;
		width: 340px;
		display: grid;
		gap: 10px;
	}
	.bar {
		width: 70px;
		height: 6px;
		background: var(--ink);
	}
	.hello,
	.text {
		margin: 0;
		font-family: var(--mono);
	}
	.hello {
		font-weight: 500;
		font-size: 26px;
	}
	.text {
		font-size: 15px;
		line-height: 1.5;
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
		rotate: var(--r);
	}
	:global(html[data-motion='on']) li {
		opacity: 0;
	}
	:global(html[data-motion='on']) .pin {
		transform: scale(0);
	}

	.polaroid {
		position: relative;
		display: block;
		width: 100%;
		padding: 14px 14px 46px;
		border: 0;
		background: var(--mat);
		box-shadow: 0 14px 28px rgba(17, 17, 17, 0.18);
		cursor: zoom-in;
	}
	.pic {
		display: block;
		aspect-ratio: var(--ratio);
	}
	.pin {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: 4px;
		width: 22px;
		height: 22px;
		translate: -50% 0;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fff, #cfcfcf);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
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
	/* Phone: the note, then the polaroids one under another, still turned. */
	@media (max-width: 760px) {
		.wall {
			height: auto;
			display: grid;
			gap: 28px;
			padding: 8px 24px 150px;
		}
		.note,
		h1,
		.count {
			position: static;
			width: auto;
		}
		h1 {
			order: -2;
			text-align: left;
			font-size: 24px;
			letter-spacing: 0.12em;
		}
		.count {
			order: -1;
		}
		ul {
			display: grid;
			gap: 28px;
		}
		li {
			position: static;
			width: auto;
		}
	}
</style>
