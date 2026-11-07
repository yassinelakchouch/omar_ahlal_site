<script lang="ts">
	import '@fontsource/bodoni-moda/400.css';
	import { resolve } from '$app/paths';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { NAME } from '#lib/copy.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const a = $derived(data.site.about);
	const [first, ...last] = NAME.split(' ');
</script>

<svelte:head>
	<title>About · {NAME}</title>
	<meta name="description" content={a.text} />
</svelte:head>

<!-- O-05 09: his portrait, his name in the serif he uses, a recent portrait pinned to it. -->
<section class="about">
	<div class="portrait">
		<Photo photo={a.portrait} eager sizes="(max-width: 760px) 100vw, 560px" />
		<span class="pinned"><span class="pin" aria-hidden="true"></span><Photo photo={a.pinned} sizes="150px" /></span>
	</div>
	<div class="text">
		<h1>{first}<br />{last.join(' ')}</h1>
		<p>{a.text}</p>
		<ul class="facts">{#each a.facts as f (f)}<li class="mono">{f}</li>{/each}</ul>
		<a class="work" href={resolve('/contact')}>Work with me ↗</a>
	</div>
</section>

<PhoneBar meta="Five years · since 15" label="Work with me ↗" href={resolve('/contact')} />

<style>
	.about {
		display: grid;
		grid-template-columns: minmax(0, 560px) 1fr;
		gap: 64px;
		padding: 6px 48px 96px;
	}
	.portrait {
		position: relative;
		aspect-ratio: 560 / 720;
	}
	.pinned {
		position: absolute;
		right: -40px;
		bottom: -20px;
		width: 150px;
		height: 150px;
		padding: 10px 10px 34px;
		rotate: 4deg;
		background: var(--mat);
		box-shadow: 0 14px 28px rgba(17, 17, 17, 0.22);
	}
	.pin {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: 2px;
		width: 22px;
		height: 22px;
		translate: -50% 0;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fff, #cfcfcf);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
	}
	.text {
		display: grid;
		gap: 24px;
		align-content: center;
		justify-items: start;
	}
	h1 {
		margin: 0;
		font-family: var(--serif);
		font-weight: 400;
		font-size: clamp(64px, 8.3vw, 120px);
		line-height: 0.9;
		letter-spacing: -0.01em;
		text-transform: uppercase;
	}
	p {
		max-width: 560px;
		margin: 0;
		font-size: 19px;
		line-height: 1.5;
	}
	.facts {
		display: flex;
		gap: 28px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.work {
		height: 40px;
		padding: 0 18px;
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-decoration: none;
	}
	@media (max-width: 760px) {
		.about {
			grid-template-columns: 1fr;
			gap: 40px;
			padding: 0 16px 150px;
		}
		.pinned {
			right: 8px;
			width: 110px;
			height: 110px;
		}
		.work {
			display: none;
		}
	}
</style>
