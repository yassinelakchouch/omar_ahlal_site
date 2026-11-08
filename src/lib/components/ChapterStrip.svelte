<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Photo from './Photo.svelte';
	import { SETTLE, arrived, kit } from '#lib/motion.js';
	import { coverOf, type Chapter } from '#lib/site.js';

	type Props = { chapters: Chapter[]; open: number; onopen: (i: number) => void };
	let { chapters, open, onopen }: Props = $props();

	let strip = $state<HTMLElement>();
	let ready = $state(false);
	let gsapRef: typeof import('gsap').gsap | null = null;
	const phone = () => matchMedia('(max-width: 760px)').matches;
	const grow = () => (phone() ? 9 : 7);

	// The photo keeps the open width while its panel grows, so it is uncovered like a print, never squeezed (O-18 A).
	function sizeOpen() {
		if (!strip) return;
		const n = chapters.length;
		const free = strip.clientWidth - (n - 1) * parseFloat(getComputedStyle(strip).columnGap || '6');
		strip.style.setProperty('--open', `${Math.round((free * grow()) / (n - 1 + grow()))}px`);
	}

	function settle(i: number, instant = false) {
		if (!gsapRef || !strip) return;
		const panels = strip.querySelectorAll<HTMLElement>('.panel');
		panels.forEach((p, k) => gsapRef!.to(p, { flexGrow: k === i ? grow() : 1, ...(instant ? { duration: 0 } : SETTLE), overwrite: 'auto' }));
	}

	// The open chapter is the parent's (the index rows open it too); the strip only shows it.
	$effect(() => {
		const i = open;
		if (ready) settle(i);
	});

	onMount(() => {
		sizeOpen();
		const observer = new ResizeObserver(() => {
			sizeOpen();
			settle(open, true);
		});
		if (strip) observer.observe(strip);
		let revert = () => {};
		void Promise.all([kit(), arrived()]).then(([{ gsap }]) => {
			if (!strip?.isConnected) return;
			gsapRef = gsap;
			const ctx = gsap.context(() => {
				// Every panel starts even; the prints rise in a row, then one chapter opens and settles (the owner's weighty settle).
				gsap.set('.panel', { flexGrow: 1 });
				gsap.set('.print', { visibility: 'visible' });
				gsap.fromTo('.print', { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.25 });
				gsap.delayedCall(0.75, () => {
					ready = true;
					settle(open);
				});
			}, strip);
			revert = () => ctx.revert();
		});
		return () => {
			observer.disconnect();
			revert();
		};
	});

	// A mouse opens what it points at; a finger slides along the strip like a contact strip, or taps a closed print to open it.
	let downX = 0;
	let moved = false;
	let kind = 'mouse';
	const panelOf = (el: Element | null) => el?.closest<HTMLElement>('.panel') ?? null;
	const indexOf = (panel: HTMLElement) => Number(panel.dataset.i);

	function down(e: PointerEvent) {
		kind = e.pointerType;
		downX = e.clientX;
		moved = false;
	}
	function move(e: PointerEvent) {
		if (e.pointerType === 'mouse') {
			const p = panelOf(e.target as Element);
			if (p) onopen(indexOf(p));
			return;
		}
		if (Math.abs(e.clientX - downX) > 8) moved = true;
		if (!moved) return;
		const p = panelOf(document.elementFromPoint(e.clientX, e.clientY));
		if (p) onopen(indexOf(p));
	}
	function click(e: MouseEvent) {
		const p = panelOf(e.target as Element);
		if (!p) return;
		const i = indexOf(p);
		if (moved || (kind !== 'mouse' && i !== open)) {
			e.preventDefault();
			onopen(i);
		}
		moved = false;
	}
</script>

<!-- The index rows are the links for keyboards and screen readers; the strip is their pointer twin. -->
<div class="strip" bind:this={strip} aria-hidden="true" onpointerdown={down} onpointermove={move} onclick={click} role="presentation">
	{#each chapters as c, i (c.slug)}
		<a class="panel" class:open={i === open} href={resolve('/chapters/[slug]', { slug: c.slug })} tabindex="-1" data-i={i} draggable="false">
			<span class="print"><Photo photo={coverOf(c)} eager={i < 3} sizes="(max-width: 760px) 80vw, 45vw" /></span>
		</a>
	{/each}
</div>

<style>
	.strip {
		--open: 480px;
		display: flex;
		gap: 6px;
		min-width: 0;
		height: 100%;
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
	}
	.panel {
		position: relative;
		flex: 1 1 0;
		min-width: 0;
		overflow: hidden;
		border-radius: 2px;
		background: var(--stone, #cfcfcf);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	/* Without GSAP the first chapter is open in CSS and nothing moves; with it, GSAP owns every panel's grow. */
	.panel.open {
		flex-grow: 7;
	}
	.print {
		position: absolute;
		top: 0;
		left: 50%;
		width: var(--open);
		height: 100%;
		translate: -50% 0;
		pointer-events: none;
	}
	.print :global(.photo),
	.print :global(img) {
		width: 100%;
		height: 100%;
	}
	/* Hidden only while motion is on and until GSAP takes over (app.html turns motion off if GSAP isn't ready in 4 s). */
	:global(html[data-motion='on']) .print {
		visibility: hidden;
	}
	@media (max-width: 760px) {
		.strip {
			gap: 4px;
		}
		.panel.open {
			flex-grow: 9;
		}
	}
</style>
