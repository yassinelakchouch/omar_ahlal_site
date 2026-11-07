<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Photo from './Photo.svelte';
	import IndexRow from './IndexRow.svelte';
	import { finePointer, kit } from '#lib/motion.js';
	import { coverOf, frames } from '#lib/site.js';

	const chapters = $derived(page.data.site.chapters.filter((c) => c.photos.length));
	let active = $state(-1);
	let shown = $state(-1);
	let list = $state<HTMLOListElement>();
	let float = $state<HTMLElement>();
	let follow: ((y: number, start?: number) => unknown) | null = null;
	let lastY = 0;

	onMount(() => {
		void kit().then(({ gsap }) => {
			if (float) follow = gsap.quickTo(float, 'y', { duration: 0.45, ease: 'power3.out' });
		});
	});

	// W1 (O-15): the pointed row's photo glides to it with weight and leans the way it travels, clamped to ±4°.
	function point(i: number, row: HTMLElement) {
		active = i;
		shown = i;
		const r = row.getBoundingClientRect();
		const l = list!.getBoundingClientRect();
		const y = r.top - l.top + r.height / 2;
		void kit().then(({ gsap }) => {
			if (!float || !follow) return;
			// A hidden photo appears at the row; a visible one glides there. Measured, not remembered: a quick return used to jump.
			const gliding = Number(gsap.getProperty(float, 'opacity')) > 0;
			const lean = gliding ? Math.max(-4, Math.min(4, (y - lastY) / 12)) : 0;
			follow(y, gliding ? undefined : y);
			gsap.to(float, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
			gsap.to(float, { keyframes: [{ rotation: -3 + lean, duration: 0.25, ease: 'power2.out' }, { rotation: -3, duration: 0.5, ease: 'power3.out' }], overwrite: 'auto' });
			lastY = y;
		});
	}
	function leave() {
		active = -1;
		void kit().then(({ gsap }) => float && gsap.to(float, { opacity: 0, scale: 0.92, duration: 0.25, ease: 'power2.out', overwrite: 'auto' }));
	}
</script>

<ol bind:this={list} class="index" onpointerleave={leave}>
	{#each chapters as c, i (c.slug)}
		<li>
			<IndexRow
				n={c.n}
				title={c.title}
				note={frames(c)}
				href={resolve('/chapters/[slug]', { slug: c.slug })}
				on={i === active}
				onpointerenter={(e) => finePointer() && point(i, e.currentTarget)}
				onfocus={(e) => point(i, e.currentTarget)}
				onblur={leave}
			>
				{#snippet thumb()}<Photo photo={coverOf(c)} sizes="44px" />{/snippet}
			</IndexRow>
		</li>
	{/each}
	<li class="float" bind:this={float} aria-hidden="true">
		{#each chapters as c, i (c.slug)}<span class="shot" class:shown={i === shown}><Photo photo={coverOf(c)} sizes="220px" /></span>{/each}
	</li>
</ol>

<style>
	.index {
		position: relative;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.float {
		position: absolute;
		left: 57%;
		top: 0;
		width: 220px;
		aspect-ratio: 2 / 3;
		margin-top: -165px;
		opacity: 0;
		box-shadow: 0 20px 40px rgba(17, 17, 17, 0.28);
		pointer-events: none;
	}
	/* Every cover stays mounted and loaded: rebuilding the image per row showed its grey tone first. */
	.shot {
		position: absolute;
		inset: 0;
		visibility: hidden;
	}
	.shot.shown {
		visibility: visible;
	}
	/* Phone: no hover to float a photo; each row carries a small one instead (IndexRow). */
	@media (max-width: 760px) {
		.float {
			display: none;
		}
	}
</style>
