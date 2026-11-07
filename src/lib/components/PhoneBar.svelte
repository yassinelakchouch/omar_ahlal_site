<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { meta: string; label: string; href?: string; onclick?: () => void; type?: 'button' | 'submit'; disabled?: boolean };
	let { meta, label, href, onclick, type = 'button', disabled = false }: Props = $props();
	let bar = $state<HTMLElement>();
	let dark = $state(false);

	// Over the darkroom footer the bar darkens with it and its button develops to paper: a black button on black vanished.
	onMount(() => {
		const footer = document.querySelector('footer');
		if (!footer || !bar) return;
		const watch = new IntersectionObserver(([e]) => (dark = e.isIntersecting), { rootMargin: `0px 0px -${Math.round(bar.offsetHeight / 2)}px 0px` });
		watch.observe(footer);
		return () => watch.disconnect();
	});
</script>

<!-- Phone only: the one action sits where the thumb rests (O-05). -->
<div class="bar" bind:this={bar} data-tone={dark ? 'ink' : 'paper'}>
	<p class="meta"><span>{meta}</span><span class="muted">{dark ? 'Last frame' : '↓ Scroll'}</span></p>
	{#if href}<a class="act" {href}>{label}</a>{:else}<button class="act" {type} {onclick} {disabled}>{label}</button>{/if}
</div>

<style>
	.bar {
		display: none;
	}
	@media (max-width: 760px) {
		.bar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 3;
			display: grid;
			gap: 10px;
			padding: 12px 16px calc(14px + env(safe-area-inset-bottom));
			color: var(--ink);
			transition: color 0.3s;
		}
		/* Two grounds crossfade (a gradient can't transition itself); stacked, the paper fade showed as a pale band over the ink. */
		.bar::before,
		.bar::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background: linear-gradient(transparent, var(--paper) 30%);
			transition: opacity 0.3s;
		}
		.bar::after {
			background: linear-gradient(transparent, var(--ink) 30%);
			opacity: 0;
		}
		.bar[data-tone='ink'] {
			color: var(--paper);
		}
		.bar[data-tone='ink']::before {
			opacity: 0;
		}
		.bar[data-tone='ink']::after {
			opacity: 1;
		}
		.meta {
			display: flex;
			justify-content: space-between;
			margin: 0;
			font-family: var(--mono);
			font-size: 12px;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}
		.muted {
			color: var(--muted);
			transition: color 0.3s;
		}
		.bar[data-tone='ink'] .muted {
			color: #a9a9a9;
		}
		.act {
			height: 50px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 0;
			border-radius: 999px;
			/* Develops: paper wipes in from the left like the contact page's fill, and the words turn ink. */
			background: linear-gradient(var(--paper), var(--paper)) 0 0 / 0% 100% no-repeat, var(--ink);
			color: var(--paper);
			transition:
				background-size 0.45s cubic-bezier(0.65, 0, 0.35, 1),
				color 0.25s 0.12s;
			font-family: var(--mono);
			font-size: 13px;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			text-decoration: none;
			cursor: pointer;
		}
		/* Both layers listed: one value set the colour layer's 'auto' to 100% too, which can't animate, so the wipe jumped. */
		.bar[data-tone='ink'] .act {
			background-size: 100% 100%, auto;
			color: var(--ink);
		}
		.act:disabled {
			opacity: 0.5;
		}
	}
</style>
