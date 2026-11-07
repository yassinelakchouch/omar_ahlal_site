<script lang="ts">
	import { onMount } from 'svelte';
	import { KINDS, type Kind } from '#lib/contact.js';
	import type { Flip as FlipType } from 'gsap/Flip';
	import { kit } from '#lib/motion.svelte.js';

	let { value = $bindable() }: { value: Kind } = $props();
	let group = $state<HTMLFieldSetElement>();
	let flip: typeof FlipType | null = null;
	let before: ReturnType<(typeof FlipType)["getState"]> | null = null;

	onMount(() => void kit().then((k) => (flip = k.Flip)));

	// B1 (O-15): the one fill slides from the old choice to the new; the labels never hide (it passes under them).
	$effect.pre(() => {
		void value;
		if (flip && group) before = flip.getState(group.querySelector('.fill'));
	});
	$effect(() => {
		void value;
		if (flip && before && group) flip.from(before, { targets: group.querySelector('.fill'), duration: 0.26, ease: 'power3.out' });
		before = null;
	});
</script>

<!-- Single choice, so a radio group: arrows move the choice, one tab stop. -->
<fieldset class="chips" bind:this={group}>
	<legend class="visually-hidden">Kind of shoot</legend>
	{#each KINDS as k (k.value)}
		<label class:on={value === k.value}>
			{#if value === k.value}<span class="fill" data-flip-id="chip-fill" aria-hidden="true"></span>{/if}
			<input type="radio" name="kind" value={k.value} bind:group={value} />
			<span class="text">{k.label}</span>
		</label>
	{/each}
</fieldset>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		border: 0;
	}
	label {
		position: relative;
		height: 34px;
		padding: 0 14px;
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--ink);
		border-radius: 999px;
		font-family: var(--mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		transition: color 0.2s;
	}
	label.on {
		color: var(--paper);
	}
	.fill {
		position: absolute;
		inset: -1px;
		border-radius: 999px;
		background: var(--ink);
	}
	.text {
		position: relative;
	}
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	label:has(input:focus-visible) {
		outline: 2px solid var(--ember);
		outline-offset: 2px;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
