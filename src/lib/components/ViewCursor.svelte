<script lang="ts">
	import { onMount } from 'svelte';
	import { kit } from '#lib/motion.js';

	// Over a photo that opens the viewer, a "View" disc follows the mouse in place of the cursor (owner, 8 Nov); mouse-like pointers only.
	let disc: HTMLDivElement;

	onMount(() => {
		if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		const html = document.documentElement;
		let stop = () => {};
		let gone = false;
		kit().then(({ gsap }) => {
			if (gone) return;
			gsap.set(disc, { scale: 0 });
			const toX = gsap.quickTo(disc, 'x', { duration: 0.35, ease: 'power3' });
			const toY = gsap.quickTo(disc, 'y', { duration: 0.35, ease: 'power3' });
			let shown = false;
			const show = (over: boolean) => {
				if (over === shown) return;
				shown = over;
				gsap.to(disc, over ? { scale: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' } : { scale: 0, duration: 0.22, ease: 'power3.in', overwrite: 'auto' });
			};
			const track = (event: PointerEvent) => {
				if (event.pointerType !== 'mouse') return;
				const over = event.target instanceof Element && event.target.closest('[data-photo]') !== null;
				if (over && !shown) gsap.set(disc, { x: event.clientX, y: event.clientY });
				toX(event.clientX);
				toY(event.clientY);
				show(over);
			};
			const away = () => show(false);
			addEventListener('pointermove', track, { passive: true });
			addEventListener('pointerover', track, { passive: true });
			html.addEventListener('pointerleave', away);
			// The cursor hides only once the disc can stand in for it.
			html.dataset.viewCursor = '';
			stop = () => {
				removeEventListener('pointermove', track);
				removeEventListener('pointerover', track);
				html.removeEventListener('pointerleave', away);
				delete html.dataset.viewCursor;
			};
		});
		return () => {
			gone = true;
			stop();
		};
	});
</script>

<div class="view" bind:this={disc} aria-hidden="true">View</div>

<style>
	.view {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 60;
		display: grid;
		place-items: center;
		width: 88px;
		height: 88px;
		margin: -44px 0 0 -44px;
		border-radius: 50%;
		background: var(--ink);
		box-shadow: 0 0 0 1px rgba(250, 250, 248, 0.35);
		color: var(--mat);
		font: 500 12px/1 'IBM Plex Mono', monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		pointer-events: none;
		transform: scale(0);
	}

	:global([data-photo]) {
		cursor: zoom-in;
	}

	:global(html[data-view-cursor] [data-photo]) {
		cursor: none;
	}
</style>
