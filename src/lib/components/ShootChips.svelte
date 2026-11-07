<script lang="ts">
	import { KINDS, type Kind } from '#lib/contact.js';

	let { value = $bindable() }: { value: Kind } = $props();
</script>

<!-- Single choice, so a radio group: arrows move the choice, one tab stop. -->
<fieldset class="chips">
	<legend class="visually-hidden">Kind of shoot</legend>
	{#each KINDS as k (k.value)}
		<label class:on={value === k.value}>
			<input type="radio" name="kind" value={k.value} bind:group={value} />
			<span>{k.label}</span>
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
	}
	label.on {
		background: var(--ink);
		color: var(--paper);
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
