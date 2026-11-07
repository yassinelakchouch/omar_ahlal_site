<script lang="ts">
	import { travel } from '#lib/interactions.js';

	let { glyph }: { glyph: '↗' | '→' | '↓' | '←' | '↑' } = $props();
</script>

<!-- Decorative: the link's words carry the meaning; the second copy is the one that travels in. -->
<span class="arrow" aria-hidden="true" {@attach travel}><span>{glyph}</span><span class="in">{glyph}</span></span>

<style>
	.arrow {
		position: relative;
		display: inline-block;
		overflow: hidden;
		vertical-align: baseline;
	}
	.arrow > span {
		display: inline-block;
	}
	.in {
		position: absolute;
		left: 0;
		top: 0;
		opacity: 0;
	}
</style>
