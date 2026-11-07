import { loadSite } from '#lib/site.js';
import type { LayoutServerLoad } from './$types';

// Every page is prerendered: the database is read once per build (on Publish), and the result is written into the HTML.
export const prerender = true;

export const load: LayoutServerLoad = async ({ fetch }) => ({ site: await loadSite(fetch) });
