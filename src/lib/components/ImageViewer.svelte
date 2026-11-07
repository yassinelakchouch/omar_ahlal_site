<script lang="ts" module>
	import type { LinkInfo } from '#lib/video.js';
	// src: undefined while it is being fetched, null when it couldn't be.
	export type ViewerItem = {
		id: string;
		kind: 'photo' | 'clip' | 'link';
		src: string | null | undefined;
		video?: string | null;
		link?: LinkInfo | null;
		tone: string | null;
		alt: string;
		width: number | null;
		height: number | null;
	};
</script>

<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import { embedUrl } from '#lib/video.js';

	type Props = {
		items: ViewerItem[];
		index: number;
		origin?: DOMRect | null;
		onindex: (i: number) => void;
		onclose: () => void;
		onneed?: (i: number, retry: boolean) => void;
		panel?: Snippet;
	};
	let { items, index, origin = null, onindex, onclose, onneed, panel }: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	let frame = $state<HTMLDivElement>();
	let status = $state<'loading' | 'loaded' | 'failed'>('loading');
	let online = $state(navigator.onLine);
	let scale = $state(1);
	let x = $state(0);
	let y = $state(0);
	let playing = $state('');
	const item = $derived(items[index]);
	const last = $derived(items.length - 1);
	const ratio = $derived(item?.width && item?.height ? item.width / item.height : 4 / 5);
	const pointers = new Map<number, { x: number; y: number }>();
	let gesture: { x: number; y: number; dist: number; scale: number; tx: number; ty: number } | null = null;

	onMount(() => {
		dialog?.showModal();
		// Opening grows the box from the tile it came from. Always, as the rest of the site (owner, 7 Nov).
		if (origin && frame) {
			const to = frame.getBoundingClientRect();
			const t = `translate(${origin.left - to.left}px, ${origin.top - to.top}px) scale(${origin.width / to.width}, ${origin.height / to.height})`;
			frame.animate([{ transform: t, transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
		}
		const back = () => {
			online = true;
			if (status === 'failed') retry();
		};
		const gone = () => (online = false);
		addEventListener('online', back);
		addEventListener('offline', gone);
		return () => (removeEventListener('online', back), removeEventListener('offline', gone));
	});

	$effect(() => {
		void item?.id;
		untrack(() => {
			// A clip shows its poster and the browser's controls, and a film its poster and ▶: neither waits on a load.
			status = item?.kind === 'photo' ? 'loading' : 'loaded';
			playing = '';
			reset();
			onneed?.(index, false);
			if (index < last) onneed?.(index + 1, false);
			// A cached photo can fire load before this reset runs; it is already there, so don't wait for a second load.
			queueMicrotask(() => {
				const img = frame?.querySelector('img');
				if (img?.complete && img.naturalWidth) status = 'loaded';
			});
		});
	});

	function go(i: number) {
		if (i >= 0 && i <= last && i !== index) onindex(i);
	}
	function retry() {
		status = 'loading';
		onneed?.(index, true);
	}
	function reset() {
		scale = 1;
		x = 0;
		y = 0;
	}
	function zoom(to: number, at?: { x: number; y: number }) {
		const next = Math.min(4, Math.max(1, to));
		if (at && frame) {
			const r = frame.getBoundingClientRect();
			const cx = at.x - (r.left + r.width / 2);
			const cy = at.y - (r.top + r.height / 2);
			x = (x - cx) * (next / scale) + cx;
			y = (y - cy) * (next / scale) + cy;
		}
		scale = next;
		if (scale === 1) reset();
	}

	function keys(e: KeyboardEvent) {
		if ((e.target as HTMLElement).closest('textarea, input, select')) return;
		if (e.key === 'ArrowRight') go(index + 1);
		else if (e.key === 'ArrowLeft') go(index - 1);
		else if (e.key === '+' || e.key === '=') zoom(scale + 0.5);
		else if (e.key === '-') zoom(scale - 0.5);
		else if (e.key === '0') reset();
		else return;
		e.preventDefault();
	}

	// One finger swipes (or pans when zoomed); two fingers pinch.
	function down(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button')) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		const p = [...pointers.values()];
		gesture = { x: e.clientX, y: e.clientY, dist: p.length === 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0, scale, tx: x, ty: y };
	}
	function move(e: PointerEvent) {
		if (!pointers.has(e.pointerId) || !gesture) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const p = [...pointers.values()];
		if (p.length === 2 && gesture.dist) zoom((gesture.scale * Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)) / gesture.dist);
		else if (scale > 1) {
			x = gesture.tx + e.clientX - gesture.x;
			y = gesture.ty + e.clientY - gesture.y;
		}
	}
	function up(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) return;
		pointers.delete(e.pointerId);
		if (gesture && scale === 1 && pointers.size === 0) {
			const dx = e.clientX - gesture.x;
			const dy = e.clientY - gesture.y;
			if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
			else if (dy > 90) onclose();
		}
		if (pointers.size === 0) gesture = null;
	}
</script>

<dialog
	bind:this={dialog}
	class="viewer"
	class:with-panel={!!panel}
	aria-label="Photo {index + 1} of {items.length}"
	oncancel={(e) => (e.preventDefault(), onclose())}
	onkeydown={keys}
>
	<div
		class="stage"
		role="presentation"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		ondblclick={(e) => status === 'loaded' && item?.kind === 'photo' && zoom(scale > 1 ? 1 : 2.5, { x: e.clientX, y: e.clientY })}
	>
		<p class="counter mono" aria-live="polite">{index + 1} / {items.length}</p>
		<button class="close mono" onclick={onclose}>Close · Esc</button>
		<div bind:this={frame} class="frame" style:--tone={item?.tone ?? '#1c1c1c'} style:--ratio={ratio}>
			{#if item?.kind === 'clip' && status !== 'failed'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={item.video ?? undefined} poster={item.src ?? undefined} controls playsinline preload="none" aria-label={item.alt || 'Clip'} onerror={() => (status = 'failed')}></video>
			{:else if item?.kind === 'link' && item.link}
				{#if playing === item.id}
					<iframe src={embedUrl(item.link)} title="{item.alt || 'Film'} on {item.link.host}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
				{:else}
					{#if item.src}<img src={item.src} alt="" class="shown" draggable="false" />{/if}
					<button class="play" aria-label="Play the film from {item.link.host}" onclick={() => (playing = item.id)}>▶</button>
					<p class="from mono">Plays from {item.link.host} · loads on click</p>
				{/if}
			{:else if item?.src && status !== 'failed'}
				<img
					src={item.src}
					alt={item.alt}
					draggable="false"
					class:shown={status === 'loaded'}
					style:transform="translate({x}px, {y}px) scale({scale})"
					onload={() => (status = 'loaded')}
					onerror={() => (status = 'failed')}
				/>
			{/if}
			{#if status === 'loading' && item?.src !== null}<span class="bar" aria-hidden="true"></span>{/if}
			{#if status === 'failed' || item?.src === null}
				<div class="fail" role="alert">
					<p>{!online ? 'You’re offline. It comes back by itself.' : item?.kind === 'clip' ? 'This video didn’t play.' : 'This photo didn’t load.'}</p>
					<div>
						{#if online}<button class="pill" onclick={retry}>Retry</button>{/if}
						{#if index < last}<button class="pill" onclick={() => go(index + 1)}>Skip this photo</button>{/if}
					</div>
				</div>
			{/if}
		</div>
		{#if index > 0}<button class="arrow prev" aria-label="Previous photo" onclick={() => go(index - 1)}>←</button>{/if}
		{#if index < last}<button class="arrow next" aria-label="Next photo" onclick={() => go(index + 1)}>→</button>{/if}
		<p class="caption">{item?.alt || ' '}</p>
		<p class="hint mono">Swipe ← → · pinch or double-tap to zoom · swipe down to close</p>
	</div>
	{#if panel}<aside class="panel">{@render panel()}</aside>{/if}
</dialog>

<style>
	.viewer {
		width: 100vw;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: #111;
		color: #ececec;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		overflow: hidden;
	}
	.viewer.with-panel {
		grid-template-columns: minmax(0, 1fr) 300px;
	}
	.viewer::backdrop {
		background: #111;
	}
	.stage {
		position: relative;
		min-width: 0;
		display: grid;
		place-items: center;
		touch-action: none;
		user-select: none;
	}
	.counter,
	.close {
		position: absolute;
		top: 16px;
		margin: 0;
		color: #cfcfcf;
		font-size: 13px;
	}
	.counter {
		left: 20px;
	}
	.close {
		right: 12px;
		min-height: 40px;
		padding: 0 10px;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.frame {
		position: relative;
		width: min(calc(100% - 176px), calc((100dvh - 150px) * var(--ratio)));
		aspect-ratio: var(--ratio);
		background: var(--tone);
		overflow: hidden;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		opacity: 0;
		transition: opacity 0.18s;
		cursor: zoom-in;
	}
	img.shown {
		opacity: 1;
	}
	video,
	iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
		background: #000;
	}
	.play {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 72px;
		height: 72px;
		border: 0;
		border-radius: 99px;
		background: #ececec;
		color: #111;
		font-size: 24px;
		cursor: pointer;
	}
	.from {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 12px;
		margin: 0;
		text-align: center;
		color: #ececec;
		text-shadow: 0 1px 2px #000;
	}
	.bar {
		position: absolute;
		left: 0;
		top: 0;
		height: 2px;
		width: 40%;
		background: #ececec;
		animation: slide 1s ease-in-out infinite;
	}
	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(250%);
		}
	}
	.fail {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 12px;
		padding: 16px;
		text-align: center;
	}
	.fail p {
		margin: 0;
	}
	.fail div {
		display: flex;
		gap: 12px;
	}
	.fail .pill {
		color: #ececec;
		border-color: #ececec;
	}
	.arrow {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		width: 56px;
		height: 56px;
		border: 0;
		border-radius: 99px;
		background: rgba(236, 236, 236, 0.12);
		color: #ececec;
		font-size: 20px;
		cursor: pointer;
	}
	.prev {
		left: 20px;
	}
	.next {
		right: 20px;
	}
	.caption {
		position: absolute;
		left: 20px;
		right: 20px;
		bottom: 16px;
		margin: 0;
		font-size: 14px;
		color: #ececec;
		text-wrap: pretty;
	}
	.hint {
		display: none;
	}
	.panel {
		min-width: 0;
		overflow-y: auto;
		background: var(--mat);
		color: var(--ink);
	}
	/* Phone: the photo fills the width; the admin's panel follows below it. */
	@media (max-width: 700px) {
		.viewer.with-panel {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: 62dvh auto;
			overflow-y: auto;
		}
		.frame {
			width: min(100%, calc((62dvh - 150px) * var(--ratio)));
		}
		.viewer:not(.with-panel) .frame {
			width: min(100%, calc((100dvh - 150px) * var(--ratio)));
		}
		/* Swipes replace the arrows on a phone, but screen readers own swipes there, so the arrows stay reachable. */
		.arrow {
			width: 1px;
			height: 1px;
			padding: 0;
			overflow: hidden;
			white-space: nowrap;
			clip-path: inset(50%);
		}
		/* The caption and the gesture hint follow the photo in order, so a long caption never runs into the hint. */
		.stage {
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 8px;
			padding: 60px 16px 14px;
		}
		.frame {
			align-self: center;
		}
		.caption {
			position: static;
		}
		.hint {
			display: block;
			margin: 0;
			font-size: 12px;
			color: #9a9a9a;
		}
	}
</style>
