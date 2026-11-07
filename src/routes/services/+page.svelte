<script lang="ts">
	import { resolve } from '$app/paths';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import { NAME } from '#lib/copy.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Services · {NAME}</title>
	<meta name="description" content="Brand, branding, creative shoots and weddings, photographed and filmed in Morocco by {NAME}." />
</svelte:head>

<!-- O-05 06: four services, each a bold label, three photos and a justified line. -->
<h1 class="visually-hidden">Services</h1>
<ul class="services">
	{#each data.site.services as s (s.label)}
		<li>
			<h2>{#each s.label.split('\n') as part, i (i)}{#if i}<br />{/if}{part}{/each}</h2>
			<div class="pics">
				{#each s.photos as p (p.id)}<span class="pic"><Photo photo={p} sizes="(max-width: 760px) 30vw, 190px" /></span>{/each}
			</div>
			<p>{s.text}</p>
		</li>
	{/each}
</ul>

<PhoneBar meta="Four services" label="Book a shoot ↗" href={resolve('/contact')} />

<style>
	.services {
		margin: 0;
		padding: 10px 48px 96px;
		list-style: none;
		display: grid;
		gap: 26px;
	}
	li {
		display: grid;
		grid-template-columns: 220px 1fr minmax(0, 380px);
		gap: 32px;
		align-items: start;
		padding-top: 18px;
		border-top: 1px solid var(--ink);
	}
	h2 {
		margin: 0;
		font-weight: 700;
		font-size: 17px;
		line-height: 1.1;
	}
	.pics {
		display: flex;
		gap: 10px;
	}
	.pic {
		width: 190px;
		height: 130px;
	}
	p {
		margin: 0;
		font-size: 18px;
		line-height: 1.4;
		text-align: justify;
		hyphens: auto;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (max-width: 1100px) {
		li {
			grid-template-columns: 180px 1fr;
		}
		p {
			grid-column: 2;
		}
		.pic {
			flex: 1;
			width: auto;
		}
	}
	@media (max-width: 760px) {
		.services {
			padding: 0 16px 150px;
		}
		li {
			grid-template-columns: 1fr;
			gap: 12px;
		}
		p {
			grid-column: auto;
			text-align: left;
		}
		.pic {
			height: auto;
			aspect-ratio: 19 / 13;
		}
	}
</style>
