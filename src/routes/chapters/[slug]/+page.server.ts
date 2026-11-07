import { error } from '@sveltejs/kit';
import { loadSite } from '#lib/site.js';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per published chapter that has photos, read from the database at build.
export const entries: EntryGenerator = async () => (await loadSite(fetch)).chapters.filter((c) => c.photos.length).map((c) => ({ slug: c.slug }));

export const load: PageServerLoad = async ({ params, parent }) => {
	const chapters = (await parent()).site.chapters.filter((c) => c.photos.length);
	const at = chapters.findIndex((c) => c.slug === params.slug);
	if (at < 0) error(404, 'No such chapter');
	return { chapter: chapters[at], total: chapters.length, next: chapters[(at + 1) % chapters.length] };
};
