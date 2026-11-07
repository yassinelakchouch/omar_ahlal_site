import { loadSite } from '#lib/site.js';
import type { LayoutServerLoad } from './$types';

// Prerendered from the database at build; on Vercel each page is regenerated at most every 60 s instead (ISR).
export const prerender = !process.env.VERCEL;
export const config = { isr: { expiration: 60 } };

export const load: LayoutServerLoad = async ({ fetch }) => ({ site: await loadSite(fetch) });
