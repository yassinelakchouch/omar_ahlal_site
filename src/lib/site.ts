import { ABOUT, NAME, NOTES, SERVICES } from './copy';

export type Photo = { id: string; src: string; small: string; width: number; height: number; tone: string; alt: string; gray: boolean };
export type Chapter = { slug: string; n: string; title: string; note: string; layout: 'spread' | 'strip' | 'polaroid'; cover: string | null; photos: Photo[] };
export type Site = {
	chapters: Chapter[];
	services: { label: string; text: string; photos: Photo[] }[];
	about: { portrait: Photo; pinned: Photo; text: string; facts: string[] };
};

// O-05 drew Cinematic as a film strip and Wedding as polaroids; the rest are spreads (O-19: the name and frame index beside the photos).
const LAYOUT: Record<string, Chapter['layout']> = { cinematic: 'strip', wedding: 'polaroid' };

type ChapterRow = { id: string; slug: string; title: string; look: string; cover_media_id: string | null };
type MediaRow = { id: string; chapter_id: string; storage_path: string; width: number | null; height: number | null; tone: string | null; alt: string };

// The site is built from the admin's database: the visitor key reads published rows only (row-level security), and
// photo files come from the public bucket the publish job fills. Nothing about the content lives in this repository.
export async function loadSite(fetch: typeof globalThis.fetch): Promise<Site> {
	const base = import.meta.env.VITE_SUPABASE_URL;
	const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
	if (!base || !key) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY: the site is built from the admin’s database.');
	const get = async <T>(query: string): Promise<T[]> => {
		const r = await fetch(`${base}/rest/v1/${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
		if (!r.ok) throw new Error(`Reading ${query.split('?')[0]} failed (${r.status})`);
		return r.json();
	};
	const [chapterRows, mediaRows] = await Promise.all([
		get<ChapterRow>('chapters?select=id,slug,title,look,cover_media_id&order=position'),
		get<MediaRow>('media?select=id,chapter_id,storage_path,width,height,tone,alt&kind=eq.photo&order=position,created_at')
	]);
	const file = (path: string) => `${base}/storage/v1/object/public/published/${path}`;
	const photo = (m: MediaRow, gray: boolean): Photo => ({
		id: m.id,
		src: file(m.storage_path),
		small: file(m.storage_path.replace(/\.(webp|jpg)$/, '.thumb.$1')),
		width: m.width ?? 1600,
		height: m.height ?? 2000,
		tone: m.tone ?? '#cfcfcf',
		alt: m.alt,
		gray
	});
	const chapters = chapterRows.map(
		(c, i): Chapter => ({
			slug: c.slug,
			n: String(i + 1).padStart(2, '0'),
			title: c.title,
			note: NOTES[c.slug] ?? '',
			layout: LAYOUT[c.slug] ?? 'spread',
			cover: c.cover_media_id,
			photos: mediaRows.filter((m) => m.chapter_id === c.id).map((m) => photo(m, c.look === 'silver'))
		})
	);
	const site: Photo = { id: '', src: '', small: '', width: 1600, height: 2000, tone: '#9a9a9a', alt: '', gray: false };
	return {
		chapters,
		services: SERVICES.map((s) => ({ label: s.label, text: s.text, photos: chapters.find((c) => c.slug === s.chapter)?.photos.slice(0, 3) ?? [] })),
		about: {
			portrait: { ...site, id: 'about', src: file('site/about.webp'), small: file('site/about.webp'), alt: `${NAME} in a grey jacket and glasses`, gray: true },
			pinned: { ...site, id: 'pinned', src: file('site/pinned.webp'), small: file('site/pinned.webp'), width: 1600, height: 1600, tone: '#c96a2a', alt: `${NAME} against an orange wall` },
			...ABOUT
		}
	};
}

// A spread opens on a landscape across both columns (O-19): the first one moves to the front; the rest keep his order.
export const leadFirst = (photos: Photo[]) => {
	const i = photos.findIndex((p) => p.width > p.height);
	return i <= 0 ? photos : [photos[i], ...photos.slice(0, i), ...photos.slice(i + 1)];
};

export const coverOf = (c: Chapter) => c.photos.find((p) => p.id === c.cover) ?? c.photos[0];
export const frames = (c: Chapter) => `${String(c.photos.length).padStart(2, '0')} frames${c.note ? ` · ${c.note}` : ''}`;
export const pad = (n: number) => String(n).padStart(2, '0');
