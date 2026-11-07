<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Photo from './Photo.svelte';
	import { BRAND, NAME } from '#lib/copy.js';
	import { SETTLE, arrived, kit } from '#lib/motion.js';
	import { coverOf, type Photo as P } from '#lib/site.js';

	const covers = page.data.site.chapters.filter((c) => c.photos.length).map(coverOf);
	// The prerendered page shows the first chapter's cover; each visit then picks one of his chapters (O-05: "changes per visit").
	let photo = $state<P>(covers[0]);
	let root = $state<HTMLElement>();

	// A2 + A3 (O-15): the letters rise once, then the portrait drops onto the name and settles (after the loader on a full load).
	// GSAP sets every start transform itself (fromTo); CSS only hides until then. The portrait's centring lives on .over,
	// its drop on .drop, so the tween never touches the centring.
	onMount(() => {
		photo = covers[Math.floor(Math.random() * covers.length)];
		let revert = () => {};
		void Promise.all([kit(), arrived()]).then(([{ gsap }]) => {
			if (!root?.isConnected) return;
			const ctx = gsap.context(() => {
				gsap.set(['.clip', '.drop'], { visibility: 'visible' });
				gsap.timeline({ delay: 0.1 })
					.fromTo('.l', { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 })
					.fromTo('.drop', { y: -60, rotation: -7 }, { y: 0, rotation: 0, ...SETTLE }, 0.15)
					.fromTo('.drop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: 'none' }, 0.15);
			}, root);
			revert = () => ctx.revert();
		});
		return () => revert();
	});
</script>

<div class="wordmark" bind:this={root}>
	<h1 class="name" aria-label="{BRAND}, {NAME}"><span class="clip" aria-hidden="true">{#each [...BRAND] as ch, i (i)}<span class="l">{ch}</span>{/each}</span></h1>
	<div class="over" style:aspect-ratio="300 / 452">
		<div class="drop">{#key photo.id}<Photo {photo} eager sizes="(max-width: 760px) 190px, 300px" />{/key}</div>
	</div>
</div>

<style>
	.wordmark {
		position: relative;
		display: grid;
		place-items: center;
	}
	.name {
		margin: 0;
		font-family: var(--sans);
		font-weight: 900;
		font-size: clamp(128px, 22.9vw, 330px);
		line-height: 0.8;
		letter-spacing: -0.065em;
		color: var(--ink);
	}
	/* Room for the accent and the descender, so the rise is clipped by the line, not the glyphs. */
	.clip {
		display: inline-block;
		overflow: hidden;
		padding: 0.14em 0.06em 0.16em 0;
		margin: -0.14em -0.06em -0.16em 0;
	}
	.l {
		display: inline-block;
	}
	.over {
		position: absolute;
		left: 50%;
		top: 50%;
		/* Never taller than its row: on a laptop 704 px high the portrait ran under the fold. */
		width: min(clamp(190px, 20.8vw, 300px), calc((100dvh - 290px) * 0.63));
		translate: -50% -46%;
	}
	.drop {
		height: 100%;
		box-shadow: 0 24px 50px rgba(17, 17, 17, 0.25);
	}
	/* Hidden only while motion is on and until GSAP takes over (app.html turns motion off if GSAP isn't ready in 4 s). */
	:global(html[data-motion='on']) .clip,
	:global(html[data-motion='on']) .drop {
		visibility: hidden;
	}
	@media (max-width: 760px) {
		.wordmark {
			place-items: start center;
			height: 330px;
		}
		.over {
			top: 40px;
			translate: -50% 0;
		}
		.drop {
			box-shadow: 0 16px 30px rgba(17, 17, 17, 0.25);
		}
	}
</style>
