<script lang="ts">
	import '@fontsource-variable/archivo';
	import '@fontsource/oswald/500.css';
	import '@fontsource/oswald/600.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import { asset } from '$app/paths';
	import Nav from '#lib/components/Nav.svelte';
	import { BRAND, NAME, STATEMENT } from '#lib/copy.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={asset('brand/pente-mark.svg')} />
	<meta name="description" content={STATEMENT} />
	<meta property="og:site_name" content="{BRAND} · {NAME}" />
</svelte:head>

<a class="skip" href="#main">Skip to the work</a>
<Nav />
<main id="main">{@render children()}</main>

<style>
	:global(:root) {
		--paper: #ececec;
		--stone: #cfcfcf;
		--ink: #111;
		--muted: #555;
		--mat: #fafaf8;
		--ember: #8a4b2e;
		--sans: 'Archivo Variable', system-ui, sans-serif;
		--caps: 'Oswald', 'Arial Narrow', sans-serif;
		--mono: 'IBM Plex Mono', ui-monospace, monospace;
		--serif: 'Bodoni Moda', Didot, serif;
		color-scheme: light;
	}
	:global(body) {
		margin: 0;
		background: var(--paper);
		color: var(--ink);
		font: 16px/1.5 var(--sans);
		-webkit-font-smoothing: antialiased;
	}
	:global(:focus-visible) {
		outline: 2px solid var(--ember);
		outline-offset: 2px;
	}
	/* The image viewer's buttons (shared with the admin) use the pill. */
	:global(.pill) {
		height: 44px;
		padding: 0 18px;
		border: 1.5px solid var(--ink);
		border-radius: 99px;
		background: transparent;
		font-family: var(--mono);
		font-size: 13px;
		cursor: pointer;
	}
	:global(.mono) {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.skip {
		position: absolute;
		left: 16px;
		top: -60px;
		z-index: 9;
		padding: 10px 14px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--mono);
		font-size: 12px;
	}
	.skip:focus {
		top: 12px;
	}
</style>
