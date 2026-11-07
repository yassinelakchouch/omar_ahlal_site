// 50 MB is Supabase Free's per-file ceiling (O-12): a short loop fits, a film goes to YouTube or Vimeo as a link.
export const CLIP_LIMIT = 50 * 1024 * 1024;

export const isClip = (f: File) => f.type === 'video/mp4' || f.type === 'video/quicktime' || /\.(mp4|mov)$/i.test(f.name);

export type ClipInfo = { poster: Blob | null; duration: number | null; width: number | null; height: number | null; tone: string | null };

const wait = (v: HTMLVideoElement, event: 'loadedmetadata' | 'seeked') =>
	new Promise<void>((resolve, reject) => {
		const t = setTimeout(() => reject(new Error('timeout')), 8000);
		v.addEventListener(event, () => (clearTimeout(t), resolve()), { once: true });
		v.addEventListener('error', () => (clearTimeout(t), reject(new Error('decode'))), { once: true });
	});

// Reads length, size, a poster frame and its tone in the browser. A codec this browser can't play (HEVC .mov in Chrome)
// returns nulls: the clip still uploads, and the publish job's ffmpeg makes the poster.
export async function readClip(file: File): Promise<ClipInfo> {
	const url = URL.createObjectURL(file);
	const v = document.createElement('video');
	v.muted = true;
	v.playsInline = true;
	v.preload = 'auto';
	v.src = url;
	try {
		await wait(v, 'loadedmetadata');
		const duration = Number.isFinite(v.duration) ? Math.round(v.duration * 100) / 100 : null;
		v.currentTime = duration ? Math.min(1, duration / 2) : 0;
		await wait(v, 'seeked');
		const w = v.videoWidth;
		const h = v.videoHeight;
		const k = Math.min(1, 1600 / Math.max(w, h));
		const c = document.createElement('canvas');
		c.width = Math.round(w * k);
		c.height = Math.round(h * k);
		c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
		const poster = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.85));
		const one = document.createElement('canvas');
		one.width = one.height = 1;
		const ctx = one.getContext('2d')!;
		ctx.drawImage(c, 0, 0, 1, 1);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		const tone = `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
		return { poster, duration, width: w || null, height: h || null, tone };
	} catch {
		return { poster: null, duration: null, width: null, height: null, tone: null };
	} finally {
		URL.revokeObjectURL(url);
		v.removeAttribute('src');
	}
}

export const clock = (s: number | null) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);

export type LinkInfo = { host: 'YouTube' | 'Vimeo'; id: string; url: string };

// Any common form of a YouTube or Vimeo address, reduced to the one the database accepts.
export function parseLink(raw: string): LinkInfo | null {
	let u: URL;
	try {
		u = new URL(raw.trim());
	} catch {
		return null;
	}
	if (u.protocol !== 'https:') return null;
	const host = u.hostname.replace(/^www\.|^m\./, '');
	if (host === 'youtube.com' || host === 'youtu.be') {
		const id = host === 'youtu.be' ? u.pathname.slice(1) : u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
		return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? { host: 'YouTube', id, url: `https://www.youtube.com/watch?v=${id}` } : null;
	}
	if (host === 'vimeo.com' || host === 'player.vimeo.com') {
		const id = u.pathname.match(/(\d{5,12})/)?.[1];
		return id ? { host: 'Vimeo', id, url: `https://vimeo.com/${id}` } : null;
	}
	return null;
}

const vimeoThumbs = new Map<string, Promise<string | null>>();

// YouTube's poster is a known address; Vimeo's comes from its public oEmbed answer, asked once per film.
export function hostPoster(info: LinkInfo): Promise<string | null> {
	if (info.host === 'YouTube') return Promise.resolve(`https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`);
	let p = vimeoThumbs.get(info.id);
	if (!p) {
		p = fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(info.url)}&width=1280`)
			.then((r) => (r.ok ? r.json() : null))
			.then((j: { thumbnail_url?: string } | null) => j?.thumbnail_url ?? null)
			.catch(() => null);
		vimeoThumbs.set(info.id, p);
	}
	return p;
}

// The player loads only after a click, from the hosts' privacy-friendly addresses.
export const embedUrl = (info: LinkInfo) =>
	info.host === 'YouTube' ? `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${info.id}?autoplay=1&dnt=1`;
