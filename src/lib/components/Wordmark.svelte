<script lang="ts">
	import { onMount } from 'svelte';
	import Photo from './Photo.svelte';
	import { page } from '$app/state';
	import { BRAND, NAME } from '#lib/copy.js';
	import { coverOf, type Photo as P } from '#lib/site.js';

	const covers = page.data.site.chapters.filter((c) => c.photos.length).map(coverOf);
	// The prerendered page shows the first chapter's cover; each visit then picks one of his chapters (O-05: "changes per visit").
	let photo = $state<P>(covers[0]);
	onMount(() => (photo = covers[Math.floor(Math.random() * covers.length)]));
</script>

<div class="wordmark">
	<h1 class="name" aria-label="{BRAND}, {NAME}">{BRAND}</h1>
	<div class="over" style:aspect-ratio="300 / 452">{#key photo.id}<Photo {photo} eager sizes="(max-width: 760px) 190px, 300px" />{/key}</div>
</div>

<style>
	.wordmark {
		position: relative;
		display: grid;
		place-items: center;
	}
	.name {
		margin: 0;
		font-family: var(--sans);
		font-weight: 900;
		font-size: clamp(128px, 22.9vw, 330px);
		line-height: 0.8;
		letter-spacing: -0.065em;
		color: var(--ink);
	}
	.over {
		position: absolute;
		left: 50%;
		top: 50%;
		width: clamp(190px, 20.8vw, 300px);
		translate: -50% -46%;
		box-shadow: 0 24px 50px rgba(17, 17, 17, 0.25);
	}
	@media (max-width: 760px) {
		.wordmark {
			place-items: start center;
			height: 330px;
		}
		.over {
			top: 40px;
			translate: -50% 0;
			box-shadow: 0 16px 30px rgba(17, 17, 17, 0.25);
		}
	}
</style>
