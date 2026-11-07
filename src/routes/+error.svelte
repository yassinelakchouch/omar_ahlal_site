<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const lost = $derived(page.status === 404);
</script>

<svelte:head><title>{lost ? 'Frame 404' : 'Something went wrong'} · Omar Ahallal</title></svelte:head>

<!-- O-05 08: an empty frame of film. -->
<section class="lost">
	<div class="frame" aria-hidden="true"><span class="mono">{lost ? 'No frame' : `Error ${page.status}`}</span></div>
	<h1>{lost ? 'Frame 404' : 'This frame broke'}</h1>
	<p class="mono">{lost ? 'This one never left the camera.' : 'The page stopped while loading.'} <a href={resolve('/') + '#chapters'}>← back to the work</a></p>
</section>

<style>
	.lost {
		min-height: calc(100dvh - 88px);
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 16px;
		padding: 0 16px 48px;
		text-align: center;
	}
	.frame {
		width: 160px;
		height: 220px;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		background: #1a1a1a;
		border: 10px solid #1a1a1a;
		box-shadow: inset 0 0 0 1px #444;
		color: #999;
	}
	h1 {
		margin: 0;
		font-family: var(--caps);
		font-weight: 500;
		font-size: 64px;
		line-height: 1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	p {
		margin: 0;
		font-size: 13px;
	}
	a {
		color: var(--ink);
	}
</style>
