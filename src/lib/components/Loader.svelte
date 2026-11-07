<script lang="ts">
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import { kit } from '#lib/motion.js';

	let top = $state<HTMLElement>();
	let bottom = $state<HTMLElement>();
	let mark = $state<HTMLElement>();
	let count = $state<HTMLElement>();

	// A1 (O-15, revised 7 Nov: the owner dropped the film strip): every full load opens on the darkroom ink with his mark and a
	// counter, then the ink parts like a shutter onto the page. It also loads GSAP; without it, a CSS safety hides it at 3 s.
	onMount(() => {
		const html = document.documentElement;
		if (!html.classList.contains('first')) return;
		void kit().then(({ gsap }) => {
			const n = { v: 0 };
			gsap.timeline({ onComplete: () => html.classList.remove('first') })
				.to(n, { v: 100, duration: 0.8, ease: 'power2.inOut', onUpdate: () => count && (count.textContent = String(Math.round(n.v)).padStart(3, '0')) })
				.to(mark!, { autoAlpha: 0, duration: 0.15 })
				.to(top!, { yPercent: -100, duration: 0.55, ease: 'power3.inOut' }, '<')
				.to(bottom!, { yPercent: 100, duration: 0.55, ease: 'power3.inOut' }, '<');
		});
	});
</script>

<div class="veil" aria-hidden="true">
	<div class="half top" bind:this={top}></div>
	<div class="half bottom" bind:this={bottom}></div>
	<div class="mark" bind:this={mark}>
		<img src={asset('brand/favicon.svg')} alt="" width="56" height="56" />
		<span class="count" bind:this={count}>000</span>
	</div>
</div>

<style>
	.veil {
		display: none;
	}
	:global(html.first) .veil {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: grid;
		place-items: center;
		animation: away 0s 3s forwards;
	}
	@keyframes away {
		to {
			visibility: hidden;
		}
	}
	.half {
		position: absolute;
		left: 0;
		right: 0;
		height: 50.5%;
		background: var(--ink);
	}
	.top {
		top: 0;
	}
	.bottom {
		bottom: 0;
	}
	.mark {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 14px;
	}
	.count {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.12em;
		color: #a9a9a9;
	}
</style>
