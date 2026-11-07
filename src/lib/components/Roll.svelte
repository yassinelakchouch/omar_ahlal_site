<script lang="ts">
	import { ROLL, kit, motion } from '#lib/motion.svelte.js';

	let { text, on }: { text: string; on: boolean } = $props();
	let mask = $state<HTMLSpanElement>();

	// W1 · The title rolls to a second copy of itself while its row is pointed at; the words never disappear.
	$effect(() => {
		const rolled = on;
		void kit().then(({ gsap }) => {
			if (mask && motion.on) gsap.to(mask.children, { yPercent: rolled ? -100 : 0, ...ROLL, overwrite: true });
		});
	});
</script>

<span class="roll" bind:this={mask}><span>{text}</span><span aria-hidden="true">{text}</span></span>

<style>
	.roll {
		display: inline-grid;
		overflow: hidden;
		height: 1em;
		line-height: 1;
		vertical-align: top;
	}
	.roll > span {
		display: block;
		white-space: nowrap;
	}
</style>
