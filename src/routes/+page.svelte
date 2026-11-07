<script lang="ts">
	import { resolve } from '$app/paths';
	import Arrow from '#lib/components/Arrow.svelte';
	import ChapterIndex from '#lib/components/ChapterIndex.svelte';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';
	import { NAME, STATEMENT } from '#lib/copy.js';
	import { coverOf, pad } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const chapters = $derived(data.site.chapters.filter((c) => c.photos.length));
	const total = $derived(pad(chapters.length));

	// The phone's three chapters to tap (O-05 P1): night, wedding and street, for range.
	const three = $derived(['night-party', 'wedding', 'uk-street'].flatMap((s) => chapters.filter((c) => c.slug === s)));
</script>

<svelte:head>
	<title>{NAME} · photographer & videographer in Morocco</title>
</svelte:head>

<section class="home">
	<Wordmark />
	<div class="foot">
		<p class="statement">{STATEMENT}</p>
		<a class="cue" href="#chapters"><span>{NAME}</span><span class="muted">({total}) Chapters <Arrow glyph="↓" /></span></a>
	</div>
	<ul class="three" aria-label="Three chapters">
		{#each three as c (c.slug)}<li><a href={resolve('/chapters/[slug]', { slug: c.slug })} aria-label={c.title}><Photo photo={coverOf(c)} sizes="112px" /></a></li>{/each}
	</ul>
</section>

<section id="chapters" class="chapters" aria-label="Chapters">
	<ChapterIndex />
</section>

<PhoneBar meta="({total}) Chapters" label="Book a shoot ↗" href={resolve('/contact')} />

<style>
	.home {
		min-height: calc(100dvh - 88px);
		box-sizing: border-box;
		display: grid;
		grid-template-rows: 1fr auto;
		padding: 56px 48px 44px;
	}
	.foot {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 32px;
	}
	.statement {
		max-width: 560px;
		margin: 0;
		font-weight: 600;
		font-size: 20px;
		line-height: 1.25;
		letter-spacing: -0.005em;
		text-transform: uppercase;
	}
	.cue {
		display: grid;
		justify-items: end;
		gap: 6px;
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.muted {
		color: var(--muted);
	}
	.three {
		display: none;
	}
	.chapters {
		padding: 40px 48px 96px;
		scroll-margin-top: 16px;
	}
	@media (max-width: 760px) {
		.home {
			min-height: 0;
			display: grid;
			grid-template-rows: none;
			gap: 22px;
			padding: 24px 16px 0;
		}
		.statement {
			font-size: 19px;
		}
		.cue {
			display: none;
		}
		.three {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin: 0;
			padding: 0;
			list-style: none;
		}
		.three a {
			display: block;
			aspect-ratio: 4 / 5;
		}
		.chapters {
			padding: 32px 16px 150px;
		}
	}
</style>
