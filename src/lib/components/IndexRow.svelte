<script lang="ts">
	import Arrow from './Arrow.svelte';
	import Roll from './Roll.svelte';
	import { finePointer } from '#lib/motion.js';

	type RowEvent = Event & { currentTarget: EventTarget & HTMLAnchorElement };
	type Props = {
		n: string;
		title: string;
		note: string;
		href: string;
		/** Rolled by the parent (the chapter index points one row at a time); otherwise the row rolls on its own hover. */
		on?: boolean;
		external?: boolean;
		size?: 'channel' | 'hero';
		tone?: 'paper' | 'ink';
		onpointerenter?: (e: RowEvent) => void;
		onfocus?: (e: RowEvent) => void;
		onblur?: (e: RowEvent) => void;
	};
	let { n, title, note, href, on, external = false, size = 'channel', tone = 'paper', onpointerenter, onfocus, onblur }: Props = $props();
	let hover = $state(false);
	const rolled = $derived(on ?? hover);
</script>

<a
	class="row"
	class:on={rolled}
	data-size={size}
	data-tone={tone}
	{href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener' : undefined}
	onpointerenter={(e) => {
		if (finePointer()) hover = true;
		onpointerenter?.(e);
	}}
	onpointerleave={() => (hover = false)}
	onfocus={(e) => {
		hover = true;
		onfocus?.(e);
	}}
	onblur={(e) => {
		hover = false;
		onblur?.(e);
	}}
>
	<span class="n">{n}</span>
	<span class="title"><Roll text={title} on={rolled} /></span>
	<span class="note">{note}{#if external}&nbsp;<Arrow glyph="↗" />{/if}{#if size === 'hero'}<span class="go" aria-hidden="true">→</span>{/if}</span>
</a>

<style>
	.row {
		--fg: var(--ink);
		--line: var(--ink);
		--quiet: var(--muted);
		--lit: var(--ember);
		display: grid;
		grid-template-columns: 70px 1fr auto;
		align-items: baseline;
		padding: 14px 0;
		border-top: 1px solid var(--line);
		color: var(--fg);
		text-decoration: none;
		transition: color 0.2s;
	}
	/* On the dark footer ember is 2.8:1, too faint for words: the roll and the arrow carry the hover, the note brightens. */
	.row[data-tone='ink'] {
		--fg: var(--paper);
		--line: rgba(236, 236, 236, 0.3);
		--quiet: #a9a9a9;
		--lit: var(--paper);
	}
	.n,
	.note {
		font-family: var(--mono);
		font-size: 13px;
		letter-spacing: 0.04em;
	}
	.note {
		font-size: 12px;
		color: var(--quiet);
	}
	.title {
		font-family: var(--caps);
		font-weight: 500;
		font-size: clamp(36px, 4.7vw, 68px);
		line-height: 0.95;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}
	.row[data-size='channel'] .title {
		font-size: clamp(32px, 3.9vw, 56px);
	}
	.row.on,
	.row.on .note {
		color: var(--lit);
	}
	/* O-18 A: the hero's index beside the strip. Quiet until its chapter is open, then ink with → travelled in. */
	.row[data-size='hero'] {
		grid-template-columns: 36px minmax(0, 1fr) 84px;
		min-height: 34px;
		padding: 0;
		border-top: 0;
		color: var(--quiet);
	}
	.row[data-size='hero'] .n {
		font-size: 12px;
	}
	.row[data-size='hero'] .title {
		font-size: 20px;
		line-height: 1.35;
	}
	.row[data-size='hero'].on,
	.row[data-size='hero'].on .note {
		color: var(--fg);
	}
	.go {
		display: inline-block;
		margin-left: 6px;
		opacity: 0;
		translate: -14px 0;
		transition:
			opacity 0.33s cubic-bezier(0.22, 1, 0.36, 1),
			translate 0.33s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.row.on .go {
		opacity: 1;
		translate: 0 0;
	}
	.row:focus-visible {
		outline: 2px solid var(--ember);
		outline-offset: 4px;
	}
	.row[data-tone='ink']:focus-visible {
		outline-color: var(--paper);
	}
	/* Phone: a channel row shows its number or handle under the name. */
	@media (max-width: 760px) {
		.row {
			grid-template-columns: 30px 1fr auto;
			align-items: center;
			padding: 10px 0;
		}
		.n {
			font-size: 12px;
		}
		.note {
			display: none;
		}
		.title,
		.row[data-size='channel'] .title {
			font-size: 36px;
			line-height: 1;
		}
		.row[data-size='channel'] {
			grid-template-columns: 30px 1fr;
		}
		.row[data-size='channel'] .title {
			font-size: 28px;
		}
		.row[data-size='channel'] .note {
			display: block;
			grid-column: 2;
			margin-top: 4px;
		}
		.row[data-size='hero'] {
			grid-template-columns: 30px minmax(0, 1fr) auto;
			min-height: 44px;
		}
		.row[data-size='hero'] .title {
			font-size: 19px;
			line-height: 1.35;
		}
		.row[data-size='hero'] .note {
			display: inline;
		}
	}
</style>
