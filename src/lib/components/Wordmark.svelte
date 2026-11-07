<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Photo from './Photo.svelte';
	import { BRAND, NAME } from '#lib/copy.js';
	import { SETTLE, kit } from '#lib/motion.svelte.js';
	import { coverOf, type Photo as P } from '#lib/site.js';

	const covers = page.data.site.chapters.filter((c) => c.photos.length).map(coverOf);
	// The prerendered page shows the first chapter's cover; each visit then picks one of his chapters (O-05: "changes per visit").
	let photo = $state<P>(covers[0]);
	let name = $state<HTMLElement>();
	let over = $state<HTMLElement>();

	// A2 + A3 (O-15): the letters rise once, then the portrait drops onto the name and settles; after the loader on a first visit.
	onMount(() => {
		photo = covers[Math.floor(Math.random() * covers.length)];
		void kit().then(({ gsap }) => {
			const after = document.documentElement.classList.contains('first') ? 1.5 : 0.1;
			gsap.timeline({ delay: after })
				.to(name!.querySelectorAll('.l'), { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 })
				.to(over!, { y: 0, rotation: 0, opacity: 1, ...SETTLE }, 0.15);
		});
	});
</script>

<div class="wordmark">
	<h1 class="name" bind:this={name} aria-label="{BRAND}, {NAME}"><span class="clip" aria-hidden="true">{#each [...BRAND] as ch, i (i)}<span class="l">{ch}</span>{/each}</span></h1>
	<div class="over" bind:this={over} style:aspect-ratio="300 / 452">{#key photo.id}<Photo {photo} eager sizes="(max-width: 760px) 190px, 300px" />{/key}</div>
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
		width: clamp(190px, 20.8vw, 300px);
		translate: -50% -46%;
		box-shadow: 0 24px 50px rgba(17, 17, 17, 0.25);
	}
	/* The starting state, only while motion is on (app.html turns it off if GSAP isn't ready in 4 s). */
	:global(html[data-motion='on']) .l {
		transform: translateY(110%);
	}
	:global(html[data-motion='on']) .over {
		opacity: 0;
		transform: translateY(-60px) rotate(-7deg);
	}
	@media (max-width: 760px) {
		.wordmark {
			place-items: start center;
			height: 330px;
		}
		.over {
			top: 40px;
			translate: -50% 0;
			box-shadow: 0 16px 30px rgba(17, 17, 17, 0.25);
		}
	}
</style>
