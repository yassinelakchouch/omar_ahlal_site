<script lang="ts">
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import Arrow from './Arrow.svelte';
	import { magnet } from '#lib/interactions.js';
	import { kit, motion, setMotion } from '#lib/motion.svelte.js';

	let sheet = $state<HTMLDialogElement>();
	let header = $state<HTMLElement>();
	const links = [
		{ label: 'Work', href: resolve('/') + '#chapters', key: 'work' },
		{ label: 'Services', href: resolve('/services'), key: 'services' },
		{ label: 'About', href: resolve('/about'), key: 'about' },
		{ label: 'Contact', href: resolve('/contact'), key: 'contact' }
	];
	const current = $derived(page.route.id?.startsWith('/chapters') ? 'work' : (page.route.id?.slice(1) ?? ''));

	// N1 (O-15), the owner's rule for every project: the header hides going down and slides back going up.
	// It stays at the top of the page, never hides while focus is inside it or the menu is open, and moves by transform only.
	onMount(() => {
		let last = scrollY;
		let hidden = false;
		const show = (on: boolean) => {
			if (hidden === !on) return;
			hidden = !on;
			void kit().then(({ gsap }) => gsap.to(header!, { yPercent: on ? 0 : -100, duration: 0.3, ease: 'power2.out' }));
		};
		const scroll = () => {
			const y = scrollY;
			if (y < 80 || header!.contains(document.activeElement) || sheet?.open) show(true);
			else if (Math.abs(y - last) > 6) show(y < last);
			last = y;
		};
		addEventListener('scroll', scroll, { passive: true });
		header!.addEventListener('focusin', () => show(true));
		return () => removeEventListener('scroll', scroll);
	});
</script>

<header class="nav" bind:this={header}>
	<a class="mark" href={resolve('/')} aria-label="pénte, home"><img src={asset('brand/pente-mark.svg')} alt="" width="34" height="36" /></a>
	<nav aria-label="Main">
		<ul>
			{#each links as l (l.key)}<li><a href={l.href} aria-current={current === l.key ? 'page' : undefined}>{l.label}</a></li>{/each}
		</ul>
	</nav>
	<div class="end">
		<button class="switch" aria-pressed={motion.on} onclick={() => setMotion(!motion.on)}>Motion {motion.on ? 'on' : 'off'}</button>
		<a class="book" href={resolve('/contact')} {@attach magnet}>Book a shoot <Arrow glyph="↗" /></a>
	</div>
	<button class="open" aria-haspopup="dialog" onclick={() => sheet?.showModal()}>Menu</button>
</header>

<dialog bind:this={sheet} class="sheet" aria-label="Menu" onclick={(e) => e.target === sheet && sheet?.close()}>
	<nav aria-label="Main">
		<ul>
			{#each links as l (l.key)}<li><a href={l.href} aria-current={current === l.key ? 'page' : undefined} onclick={() => sheet?.close()}>{l.label}</a></li>{/each}
		</ul>
	</nav>
	<a class="book wide" href={resolve('/contact')} onclick={() => sheet?.close()}>Book a shoot ↗</a>
	<div class="row">
		<button class="switch" aria-pressed={motion.on} onclick={() => setMotion(!motion.on)}>Motion {motion.on ? 'on' : 'off'}</button>
		<button class="close" onclick={() => sheet?.close()}>Close</button>
	</div>
</dialog>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 5;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 26px 48px;
		background: var(--paper);
	}
	.mark img {
		display: block;
		height: 36px;
		width: auto;
	}
	ul {
		display: flex;
		gap: 28px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	ul a,
	.open,
	.close,
	.switch {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	ul a {
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		padding-bottom: 3px;
		transition: background-size 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	ul a:hover,
	ul a[aria-current='page'] {
		background-size: 100% 1px;
	}
	.end {
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.switch {
		min-height: 34px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--muted);
		cursor: pointer;
	}
	.book {
		height: 34px;
		padding: 0 16px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-decoration: none;
	}
	.open {
		display: none;
		justify-self: end;
		min-height: 44px;
		padding: 0 4px;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.sheet {
		margin: auto 0 0;
		width: 100%;
		max-width: none;
		padding: 24px 16px calc(16px + env(safe-area-inset-bottom));
		border: 0;
		border-radius: 16px 16px 0 0;
		background: var(--mat);
		color: var(--ink);
	}
	.sheet::backdrop {
		background: rgba(17, 17, 17, 0.4);
	}
	.sheet ul {
		flex-direction: column;
		gap: 0;
		margin-bottom: 16px;
	}
	.sheet ul a {
		display: block;
		padding: 10px 0;
		border-top: 1px solid var(--ink);
		background: none;
		font-family: var(--caps);
		font-size: 36px;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0;
	}
	.sheet ul a[aria-current='page'] {
		color: var(--ember);
	}
	.book.wide {
		display: flex;
		height: 50px;
		justify-content: center;
		font-size: 13px;
	}
	.row {
		display: flex;
		justify-content: space-between;
		margin-top: 8px;
	}
	.close {
		min-height: 44px;
		border: 0;
		background: none;
		cursor: pointer;
	}
	@media (max-width: 760px) {
		.nav {
			grid-template-columns: 1fr auto;
			padding: 18px 16px;
		}
		.nav > nav,
		.nav > .end {
			display: none;
		}
		.mark img {
			height: 32px;
		}
		.open {
			display: block;
		}
	}
</style>
