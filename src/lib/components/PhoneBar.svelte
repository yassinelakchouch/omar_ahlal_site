<script lang="ts">
	type Props = { meta: string; label: string; href?: string; onclick?: () => void; type?: 'button' | 'submit'; disabled?: boolean };
	let { meta, label, href, onclick, type = 'button', disabled = false }: Props = $props();
</script>

<!-- Phone only: the one action sits where the thumb rests (O-05). -->
<div class="bar">
	<p class="meta"><span>{meta}</span><span class="muted">↓ Scroll</span></p>
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
			background: linear-gradient(transparent, var(--paper) 30%);
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
		}
		.act {
			height: 50px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 0;
			border-radius: 999px;
			background: var(--ink);
			color: var(--paper);
			font-family: var(--mono);
			font-size: 13px;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			text-decoration: none;
			cursor: pointer;
		}
		.act:disabled {
			opacity: 0.5;
		}
	}
</style>
