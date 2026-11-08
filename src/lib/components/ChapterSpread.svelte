<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Arrow from './Arrow.svelte';
	import Photo from './Photo.svelte';
	import { SETTLE, arrived, kit } from '#lib/motion.js';
	import { frames, pad, type Chapter } from '#lib/site.js';

	type Props = { chapter: Chapter; count: string; next: Chapter; onopen: (index: number, from: DOMRect) => void };
	let { chapter, count, next, onopen }: Props = $props();

	let section = $state<HTMLElement>();
	let lit = $state(-1);
	// Landscapes span both columns and portraits pair up; the page hands the photos lead first, so 01 opens the spread.
	const wide = (i: number) => chapter.photos[i].width > chapter.photos[i].height;
	const name = (i: number) => chapter.photos[i].alt || `Frame ${pad(i + 1)}`;

	function openAt(i: number) {
		const button = section?.querySelector<HTMLElement>(`[data-photo="${chapter.photos[i].id}"]`);
		if (button) onopen(i, button.getBoundingClientRect());
	}

	// O-19 B: the photos settle in as they come into view (the owner's weighty settle); GSAP owns every start.
	onMount(() => {
		let batch: { kill: () => void }[] = [];
		let alive = true;
		void Promise.all([kit(), arrived()]).then(([{ gsap, ScrollTrigger }]) => {
			if (!alive || !section) return;
			gsap.set(section.querySelectorAll('.shot'), { visibility: 'visible' });
			batch = ScrollTrigger.batch(section.querySelectorAll('.shot'), {
				onEnter: (els) => {
					gsap.fromTo(els, { y: 48 }, { y: 0, ...SETTLE, stagger: 0.08 });
					gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', stagger: 0.08 });
				},
				once: true,
				start: 'top 94%'
			});
		});
		return () => {
			alive = false;
			batch.forEach((t) => t.kill());
		};
	});
</script>

<!-- Board O-19 B, the spread: the chapter's name and frame index beside its photos, as the home hero; no box around them. -->
<section class="spread" aria-labelledby="chapter-title" bind:this={section}>
	<div class="side">
		<p class="count mono">{count}</p>
		<h1 id="chapter-title" class="title">{chapter.title}</h1>
		<p class="meta mono">{frames(chapter)}</p>
		<ol class="index" aria-label="Frames">
			{#each chapter.photos as p, i (p.id)}
				<li>
					<button class="row" class:on={lit === i} onpointerenter={() => (lit = i)} onpointerleave={() => (lit = -1)} onfocus={() => (lit = i)} onblur={() => (lit = -1)} onclick={() => openAt(i)}>
						<span class="n mono">{pad(i + 1)}</span><span class="label">{name(i)}</span>
					</button>
				</li>
			{/each}
		</ol>
		<a class="next" href={resolve('/chapters/[slug]', { slug: next.slug })}>
			<span class="mono">Next · {next.n}</span><span class="nextTitle">{next.title} <Arrow glyph="→" /></span>
		</a>
	</div>
	<ul class="photos">
		{#each chapter.photos as p, i (p.id)}
			<li class="shot" class:wide={wide(i)} class:lit={lit === i} style:aspect-ratio="{p.width} / {p.height}">
				<button data-photo={p.id} aria-label="Open: {name(i)}" onpointerenter={() => (lit = i)} onpointerleave={() => (lit = -1)} onclick={(e) => onopen(i, e.currentTarget.getBoundingClientRect())}>
					<Photo photo={p} eager={i < 3} sizes={wide(i) ? '(max-width: 760px) 100vw, 66vw' : '(max-width: 760px) 50vw, 33vw'} />
				</button>
				<span class="frameNo mono" aria-hidden="true">{pad(i + 1)}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.spread {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 24px;
		padding: 8px 48px 96px;
	}
	/* The words stay beside the photos while they scroll (O-19 H2, H5). */
	.side {
		position: sticky;
		top: 96px;
		align-self: start;
		height: calc(100dvh - 140px);
		min-height: 480px;
		display: flex;
		flex-direction: column;
	}
	.mono {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.count {
		margin: 0;
	}
	.title {
		margin: 18px 0 0;
		font-family: var(--caps);
		font-weight: 500;
		font-size: 64px;
		line-height: 0.95;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}
	.meta {
		margin: 14px 0 0;
		color: var(--muted);
	}
	.index {
		margin: auto 0 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: grid;
		grid-template-columns: 30px minmax(0, 1fr);
		align-items: baseline;
		width: 100%;
		min-height: 30px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--muted);
		text-align: left;
		cursor: pointer;
		transition: color 0.2s;
	}
	.row.on {
		color: var(--ink);
	}
	.label {
		font-family: var(--caps);
		font-weight: 500;
		font-size: 18px;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.next {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		margin-top: 22px;
		padding-top: 14px;
		border-top: 1px solid var(--ink);
		color: var(--ink);
		text-decoration: none;
	}
	.nextTitle {
		font-family: var(--caps);
		font-weight: 500;
		font-size: 22px;
		text-transform: uppercase;
	}
	.next:hover .nextTitle {
		color: var(--ember);
	}
	.photos {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-flow: row dense;
		gap: 8px;
		align-items: start;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.shot {
		position: relative;
		overflow: hidden;
		border-radius: 2px;
		background: var(--stone, #cfcfcf);
	}
	.shot.wide {
		grid-column: 1 / -1;
	}
	.shot button {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
	}
	.shot button :global(.photo),
	.shot button :global(img) {
		width: 100%;
		height: 100%;
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.shot.lit button :global(img) {
		transform: scale(1.02);
	}
	.frameNo {
		position: absolute;
		left: 12px;
		bottom: 10px;
		color: var(--paper);
		text-shadow: 0 1px 2px rgba(17, 17, 17, 0.6);
		pointer-events: none;
	}
	/* Hidden only while motion is on and until GSAP takes over (app.html turns motion off if GSAP isn't ready in 4 s). */
	:global(html[data-motion='on']) .shot {
		visibility: hidden;
	}
	@media (max-width: 760px) {
		.spread {
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
			padding: 8px 16px 150px;
		}
		.side {
			position: static;
			height: auto;
			min-height: 0;
		}
		.title {
			margin-top: 10px;
			font-size: 44px;
		}
		.index,
		.next {
			display: none;
		}
		.photos {
			gap: 6px;
		}
	}
</style>
