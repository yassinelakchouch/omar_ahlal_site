<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ChapterIndex from '#lib/components/ChapterIndex.svelte';
	import ChapterStrip from '#lib/components/ChapterStrip.svelte';
	import IndexRow from '#lib/components/IndexRow.svelte';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';
	import { NAME, STATEMENT } from '#lib/copy.js';
	import { finePointer } from '#lib/motion.js';
	import { pad } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const chapters = $derived(data.site.chapters.filter((c) => c.photos.length));
	const total = $derived(pad(chapters.length));

	// O-18 A: seven chapters on the first screen, one open. The prerendered page opens the first; each visit then opens another.
	let open = $state(0);
	let rows = $state<HTMLOListElement>();
	onMount(() => {
		open = Math.floor(Math.random() * chapters.length);
	});

	// The index rows are the links: arrows move between them, Home and End jump, and focus opens the chapter's print.
	function keys(e: KeyboardEvent) {
		const links = [...(rows?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
		const at = links.indexOf(document.activeElement as HTMLAnchorElement);
		if (at < 0) return;
		const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
		let to = -1;
		if (step) to = (at + step + links.length) % links.length;
		if (e.key === 'Home') to = 0;
		if (e.key === 'End') to = links.length - 1;
		if (to < 0) return;
		e.preventDefault();
		links[to].focus();
	}
</script>

<svelte:head>
	<title>{NAME} · photographer & videographer in Morocco</title>
</svelte:head>

<section class="hero" aria-label="{NAME}">
	<div class="side">
		<div class="name"><Wordmark /></div>
		<p class="statement">{STATEMENT}</p>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ol class="index" aria-label="Chapters" bind:this={rows} onkeydown={keys}>
			{#each chapters as c, i (c.slug)}
				<li>
					<IndexRow
						n={pad(i + 1)}
						title={c.title}
						note="{pad(c.photos.length)} fr."
						href={resolve('/chapters/[slug]', { slug: c.slug })}
						size="hero"
						on={i === open}
						onpointerenter={() => finePointer() && (open = i)}
						onfocus={() => (open = i)}
					/>
				</li>
			{/each}
		</ol>
	</div>
	<div class="strip"><ChapterStrip {chapters} {open} onopen={(i) => (open = i)} /></div>
</section>

<section id="chapters" class="chapters" aria-label="Chapters">
	<ChapterIndex />
</section>

<PhoneBar meta="({total}) Chapters" label="Book a shoot ↗" href={resolve('/contact')} />

<style>
	/* O-18 A: the name, the statement and the index beside the strip; the photos take the larger half of the first screen. */
	.hero {
		height: calc(100dvh - 88px);
		min-height: 520px;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 400px minmax(0, 1fr);
		gap: 24px;
		padding: 8px 48px 44px;
	}
	.side {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.statement {
		max-width: 400px;
		margin: 28px 0 0;
		font-weight: 600;
		font-size: 20px;
		line-height: 1.25;
		letter-spacing: -0.005em;
		text-transform: uppercase;
	}
	.index {
		margin: auto 0 0;
		padding: 0;
		list-style: none;
	}
	.strip {
		min-width: 0;
		min-height: 0;
	}
	.chapters {
		padding: 40px 48px 96px;
		scroll-margin-top: 16px;
	}
	@media (max-width: 760px) {
		.hero {
			height: auto;
			min-height: 0;
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
			padding: 8px 16px 0;
		}
		.side {
			display: contents;
		}
		.name {
			order: 1;
		}
		/* The strip fills to the fold so the whole statement clears the 104 px phone bar. */
		.strip {
			order: 2;
			height: clamp(300px, calc(100svh - 428px), 560px);
		}
		.statement {
			order: 3;
			margin: 0;
			font-size: 19px;
		}
		.index {
			order: 4;
			margin: 8px 0 0;
		}
		.chapters {
			padding: 32px 16px 150px;
		}
	}
</style>
