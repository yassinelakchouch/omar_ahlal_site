<script lang="ts">
	import { onMount } from 'svelte';
	import { BRAND, NAME } from '#lib/copy.js';
	import { arrived, kit } from '#lib/motion.js';

	let root = $state<HTMLElement>();

	// The letters rise once, after the loader on a full load (O-18 A: the photos now live in the strip beside the name).
	// GSAP sets every start transform itself (fromTo); CSS only hides until then.
	onMount(() => {
		let revert = () => {};
		void Promise.all([kit(), arrived()]).then(([{ gsap }]) => {
			if (!root?.isConnected) return;
			const ctx = gsap.context(() => {
				gsap.set('.clip', { visibility: 'visible' });
				gsap.fromTo('.l', { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.1 });
			}, root);
			revert = () => ctx.revert();
		});
		return () => revert();
	});
</script>

<div class="wordmark" bind:this={root}>
	<h1 class="name" aria-label="{BRAND}, {NAME}"><span class="clip" aria-hidden="true">{#each [...BRAND] as ch, i (i)}<span class="l">{ch}</span>{/each}</span></h1>
</div>

<style>
	.name {
		margin: 0;
		font-family: var(--sans);
		font-weight: 900;
		font-size: 140px;
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
	/* Hidden only while motion is on and until GSAP takes over (app.html turns motion off if GSAP isn't ready in 4 s). */
	:global(html[data-motion='on']) .clip {
		visibility: hidden;
	}
	@media (max-width: 760px) {
		.name {
			font-size: 96px;
		}
	}
</style>
