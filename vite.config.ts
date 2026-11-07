import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			// On Vercel the pages re-read the database every 60 s (ISR), so Publish in the admin shows within a minute.
			// Elsewhere (local preview, GitHub Pages) every page is prerendered and 404.html shows Frame 404.
			adapter: process.env.VERCEL ? adapterVercel() : adapterStatic({ fallback: '404.html' }),
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` }
		})
	]
});
