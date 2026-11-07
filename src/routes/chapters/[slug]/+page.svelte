<script lang="ts">
	import { resolve } from '$app/paths';
	import FilmStripChapter from '#lib/components/FilmStripChapter.svelte';
	import FramedCollage from '#lib/components/FramedCollage.svelte';
	import ImageViewer from '#lib/components/ImageViewer.svelte';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import PolaroidWall from '#lib/components/PolaroidWall.svelte';
	import { NAME, STATEMENT } from '#lib/copy.js';
	import { frames, pad } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.chapter);
	const count = $derived(`${data.chapter.n} / ${pad(data.total)}`);
	let viewing = $state<{ index: number; origin: DOMRect | null } | null>(null);
	const items = $derived(c.photos.map((p) => ({ id: p.id, kind: 'photo' as const, src: p.src, tone: p.tone, alt: p.alt, width: p.width, height: p.height })));
	const open = (index: number, origin: DOMRect) => (viewing = { index, origin });

	function close() {
		const id = viewing ? c.photos[viewing.index]?.id : undefined;
		viewing = null;
		queueMicrotask(() => document.querySelector<HTMLElement>(`[data-photo="${id}"]`)?.focus());
	}
</script>

<svelte:head>
	<title>{c.title} · {NAME}</title>
	<meta name="description" content="{c.title}: {frames(c)}. {STATEMENT}" />
</svelte:head>

{#if c.layout === 'strip'}
	<FilmStripChapter chapter={c} {count} onopen={open} />
{:else if c.layout === 'polaroid'}
	<PolaroidWall chapter={c} {count} onopen={open} />
{:else}
	<FramedCollage chapter={c} {count} onopen={open} />
{/if}

<nav class="next" aria-label="Next chapter">
	<a href={resolve('/chapters/[slug]', { slug: data.next.slug })}><span class="mono">Next · {data.next.n}</span><span class="title">{data.next.title} →</span></a>
</nav>

<PhoneBar meta={frames(c)} label="Next · {data.next.title} →" href={resolve('/chapters/[slug]', { slug: data.next.slug })} />

{#if viewing}
	<ImageViewer {items} index={viewing.index} origin={viewing.origin} onindex={(i) => viewing && (viewing.index = i)} onclose={close} />
{/if}

<style>
	.next {
		padding: 40px 48px 72px;
	}
	.next a {
		display: grid;
		gap: 8px;
		padding-top: 18px;
		border-top: 1px solid var(--ink);
		color: var(--ink);
		text-decoration: none;
	}
	.next .title {
		font-family: var(--caps);
		font-weight: 500;
		font-size: clamp(36px, 4.7vw, 68px);
		line-height: 0.95;
		text-transform: uppercase;
	}
	.next a:hover .title {
		color: var(--ember);
	}
	@media (max-width: 760px) {
		.next {
			display: none;
		}
	}
</style>
