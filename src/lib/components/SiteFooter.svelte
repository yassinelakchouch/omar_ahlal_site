<script lang="ts">
	import Arrow from './Arrow.svelte';
	import IndexRow from './IndexRow.svelte';
	import Roll from './Roll.svelte';
	import { BRAND, EMAIL, INSTAGRAM, NAME, WHATSAPP } from '#lib/copy.js';
	import { finePointer } from '#lib/motion.js';

	// O-16 B, the darkroom sign-off: every page ends on the channels Omar answers, on its own ground so it never reads as more chapters.
	const year = new Date().getFullYear();
	const phone = `+${WHATSAPP.slice(0, 3)} ${WHATSAPP.slice(3, 4)} ${WHATSAPP.slice(4).replace(/(\d{2})(?=\d)/g, '$1 ')}`;
	const channels = [
		{ n: '01', title: 'WhatsApp', note: phone, href: `https://wa.me/${WHATSAPP}` },
		{ n: '02', title: 'Instagram', note: `@${INSTAGRAM}`, href: `https://www.instagram.com/${INSTAGRAM}/` },
		{ n: '03', title: 'Email', note: EMAIL, href: `mailto:${EMAIL}` }
	];
	let up = $state(false);

	function top() {
		scrollTo({ top: 0, behavior: 'smooth' });
		document.querySelector<HTMLElement>('header .mark')?.focus({ preventScroll: true });
	}
</script>

<footer class="footer">
	<p class="lead mono"><span>Write to Omar</span><span class="quiet">He answers within two days</span></p>
	<nav aria-label="Write to Omar">
		{#each channels as c (c.n)}<IndexRow {...c} external={!c.href.startsWith('mailto:')} size="channel" tone="ink" />{/each}
	</nav>
	<div class="colophon mono">
		<span>© {year} {NAME} · {BRAND}</span>
		<span class="quiet where">Photographer &amp; videographer in Morocco</span>
		<button
			class="top"
			onclick={top}
			onpointerenter={() => finePointer() && (up = true)}
			onpointerleave={() => (up = false)}
			onfocus={() => (up = true)}
			onblur={() => (up = false)}><Roll text="Back to top" on={up} />&nbsp;<Arrow glyph="↑" /></button
		>
	</div>
</footer>

<style>
	.footer {
		display: grid;
		gap: 28px;
		padding: 64px 48px 28px;
		background: var(--ink);
		color: var(--paper);
	}
	.mono {
		margin: 0;
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.lead,
	.colophon {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 24px;
	}
	.quiet {
		color: #a9a9a9;
	}
	.colophon {
		padding-top: 18px;
		border-top: 1px solid rgba(236, 236, 236, 0.3);
	}
	.top {
		display: inline-flex;
		align-items: baseline;
		min-height: 32px;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		cursor: pointer;
	}
	.top:focus-visible {
		outline: 2px solid var(--paper);
		outline-offset: 4px;
	}
	/* Phone: one column, and room under it for the fixed bar. */
	@media (max-width: 760px) {
		.footer {
			gap: 22px;
			padding: 44px 16px calc(128px + env(safe-area-inset-bottom));
		}
		.lead,
		.colophon {
			flex-direction: column;
			gap: 6px;
		}
		.where {
			display: none;
		}
		.top {
			min-height: 44px;
		}
	}
</style>
