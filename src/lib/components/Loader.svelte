<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { kit } from '#lib/motion.js';
	import { coverOf } from '#lib/site.js';

	const covers = page.data.site.chapters.filter((c) => c.photos.length).map(coverOf);
	let veil = $state<HTMLElement>();
	let strip = $state<HTMLElement>();

	// A1 (O-15, the loader picked on O-06): every full load, marked by app.html before the first paint; never on a move inside
	// the site. It also loads GSAP for the page. Frames run up the strip, then it leaves; without GSAP, a CSS safety hides it at 3 s.
	onMount(() => {
		const html = document.documentElement;
		if (!html.classList.contains('first')) return;
		void kit().then(({ gsap }) => {
			gsap.timeline({ onComplete: () => html.classList.remove('first') })
				.to(strip!, { yPercent: -50, duration: 1.0, ease: 'power2.inOut' })
				.to(veil!, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }, '-=0.15');
		});
	});
</script>

<div class="veil" bind:this={veil} aria-hidden="true">
	<div class="strip" bind:this={strip}>
		{#each [...covers, ...covers] as p, i (i)}<span class="frame"><img src={p.small} alt="" width="100" height="125" /></span>{/each}
	</div>
</div>

<style>
	.veil {
		display: none;
	}
	:global(html.first) .veil {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: grid;
		justify-items: center;
		background: var(--paper);
		overflow: hidden;
		animation: away 0s 3s forwards;
	}
	@keyframes away {
		to {
			visibility: hidden;
		}
	}
	.strip {
		--holes: repeating-linear-gradient(to bottom, var(--paper) 0 8px, transparent 8px 19px);
		width: 150px;
		padding: 12vh 24px 0;
		display: grid;
		gap: 10px;
		align-content: start;
		background:
			var(--holes) left 7px top 0 / 8px 100% no-repeat,
			var(--holes) right 7px top 0 / 8px 100% no-repeat,
			#111;
	}
	.frame {
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: #1c1c1c;
	}
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
