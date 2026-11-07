<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Photo from './Photo.svelte';
	import { coverOf, frames } from '#lib/site.js';

	const chapters = $derived(page.data.site.chapters.filter((c) => c.photos.length));

	let active = $state(-1);
	let top = $state(0);
	let list = $state<HTMLOListElement>();

	// The pointed row's photo floats beside it, centred on the row.
	function point(i: number, row: HTMLElement) {
		active = i;
		const r = row.getBoundingClientRect();
		const l = list!.getBoundingClientRect();
		top = r.top - l.top + r.height / 2;
	}
</script>

<ol bind:this={list} class="index" onpointerleave={() => (active = -1)}>
	{#each chapters as c, i (c.slug)}
		<li>
			<a
				class="row"
				class:on={i === active}
				href={resolve('/chapters/[slug]', { slug: c.slug })}
				onpointerenter={(e) => point(i, e.currentTarget)}
				onfocus={(e) => point(i, e.currentTarget)}
				onblur={() => (active = -1)}
			>
				<span class="n">{c.n}</span>
				<span class="title">{c.title}</span>
				<span class="note">{frames(c)}</span>
				<span class="thumb" aria-hidden="true"><Photo photo={coverOf(c)} sizes="44px" /></span>
			</a>
		</li>
	{/each}
	{#if active >= 0}
		<li class="float" aria-hidden="true" style:top="{top}px">
			{#key active}<Photo photo={coverOf(chapters[active])} sizes="220px" />{/key}
		</li>
	{/if}
</ol>

<style>
	.index {
		position: relative;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: grid;
		grid-template-columns: 70px 1fr auto;
		align-items: baseline;
		padding: 14px 0;
		border-top: 1px solid var(--ink);
		color: var(--ink);
		text-decoration: none;
	}
	.n,
	.note {
		font-family: var(--mono);
		font-size: 13px;
		letter-spacing: 0.04em;
	}
	.note {
		font-size: 12px;
		color: var(--muted);
	}
	.title {
		font-family: var(--caps);
		font-weight: 500;
		font-size: clamp(36px, 4.7vw, 68px);
		line-height: 0.95;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}
	.row.on,
	.row.on .note {
		color: var(--ember);
	}
	.row:focus-visible {
		outline: 2px solid var(--ember);
		outline-offset: 4px;
	}
	.thumb {
		display: none;
	}
	.float {
		position: absolute;
		left: 57%;
		width: 220px;
		aspect-ratio: 2 / 3;
		translate: 0 -50%;
		rotate: -3deg;
		box-shadow: 0 20px 40px rgba(17, 17, 17, 0.28);
		pointer-events: none;
		transition: top 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		.float {
			transition: none;
		}
	}
	/* Phone: no hover to float a photo, so each row carries a small one. */
	@media (max-width: 760px) {
		.row {
			grid-template-columns: 30px 1fr auto;
			align-items: center;
			padding: 10px 0;
		}
		.n {
			font-size: 12px;
		}
		.note,
		.float {
			display: none;
		}
		.title {
			font-size: 36px;
			line-height: 1;
		}
		.thumb {
			display: block;
			width: 44px;
			height: 54px;
		}
	}
</style>
