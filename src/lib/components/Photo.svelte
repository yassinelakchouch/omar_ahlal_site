<script lang="ts">
	import type { Photo } from '#lib/site.js';

	type Props = { photo: Photo; sizes?: string; eager?: boolean; gray?: boolean; fit?: 'cover' | 'contain' };
	let { photo, sizes = '100vw', eager = false, gray, fit = 'cover' }: Props = $props();
</script>

<!-- The tone colour shows until the photo paints, with no script: the prerendered page never waits on JavaScript to reveal it. -->
<span class="photo" style:--tone={photo.tone}>
	<img
		src={photo.src}
		srcset="{photo.small} 480w, {photo.src} 2400w"
		{sizes}
		alt={photo.alt}
		width={photo.width}
		height={photo.height}
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'high' : 'auto'}
		decoding="async"
		class:gray={gray ?? photo.gray}
		style:object-fit={fit}
	/>
</span>

<style>
	.photo {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--tone);
	}
	img {
		display: block;
		width: 100%;
		height: 100%;
	}
	.gray {
		filter: grayscale(1);
	}
</style>
