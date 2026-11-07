<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';

	let sheet = $state<HTMLDialogElement>();
	const links = [
		{ label: 'Work', href: resolve('/') + '#chapters', key: 'work' },
		{ label: 'Services', href: resolve('/services'), key: 'services' },
		{ label: 'About', href: resolve('/about'), key: 'about' },
		{ label: 'Contact', href: resolve('/contact'), key: 'contact' }
	];
	const current = $derived(page.route.id?.startsWith('/chapters') ? 'work' : (page.route.id?.slice(1) ?? ''));
</script>

<header class="nav">
	<a class="mark" href={resolve('/')} aria-label="pénte, home"><img src={asset('brand/pente-mark.svg')} alt="" width="34" height="36" /></a>
	<nav aria-label="Main">
		<ul>
			{#each links as l (l.key)}<li><a href={l.href} aria-current={current === l.key ? 'page' : undefined}>{l.label}</a></li>{/each}
		</ul>
	</nav>
	<a class="book" href={resolve('/contact')}>Book a shoot ↗</a>
	<button class="open" aria-haspopup="dialog" onclick={() => sheet?.showModal()}>Menu</button>
</header>

<dialog bind:this={sheet} class="sheet" aria-label="Menu" onclick={(e) => e.target === sheet && sheet?.close()}>
	<nav aria-label="Main">
		<ul>
			{#each links as l (l.key)}<li><a href={l.href} aria-current={current === l.key ? 'page' : undefined} onclick={() => sheet?.close()}>{l.label}</a></li>{/each}
		</ul>
	</nav>
	<a class="book wide" href={resolve('/contact')} onclick={() => sheet?.close()}>Book a shoot ↗</a>
	<button class="close" onclick={() => sheet?.close()}>Close</button>
</dialog>

<style>
	.nav {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 26px 48px;
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
	.close {
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	ul a[aria-current='page'] {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.book {
		justify-self: end;
		height: 34px;
		padding: 0 16px;
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
		font-family: var(--caps);
		font-size: 36px;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0;
	}
	.sheet ul a[aria-current='page'] {
		color: var(--ember);
		text-decoration: none;
	}
	.book.wide {
		display: flex;
		height: 50px;
		justify-content: center;
		font-size: 13px;
	}
	.close {
		display: block;
		width: 100%;
		min-height: 44px;
		margin-top: 8px;
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
		.nav > .book {
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
