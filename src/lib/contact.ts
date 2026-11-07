export const KINDS = [
	{ value: 'portrait', label: 'Portrait' },
	{ value: 'wedding', label: 'Wedding' },
	{ value: 'brand', label: 'Brand' },
	{ value: 'event', label: 'Event · night' },
	{ value: 'video', label: 'Video' }
] as const;
export type Kind = (typeof KINDS)[number]['value'];

const URL_ = import.meta.env.VITE_SUPABASE_URL ?? '';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

// The visitor's request lands in the admin's Messages: anonymous insert is the only thing the publishable key allows there.
export async function send(m: { kind: Kind; name: string; reach: string; when: string; idea: string }): Promise<{ ok: true } | { ok: false; message: string }> {
	if (!URL_ || !KEY) return { ok: false, message: `Sending isn’t set up on this copy of the site. Write to hello@pente.ma instead.` };
	const body = [m.idea.trim(), m.when.trim() && `When: ${m.when.trim()}`].filter(Boolean).join('\n\n');
	try {
		const r = await fetch(`${URL_}/rest/v1/messages`, {
			method: 'POST',
			headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'content-type': 'application/json', Prefer: 'return=minimal' },
			body: JSON.stringify({ name: m.name.trim(), contact: m.reach.trim(), shoot_type: m.kind === 'video' ? 'other' : m.kind, body })
		});
		if (r.ok) return { ok: true };
		// The database's own limit (20 messages in 10 minutes) raises P0001; anything else is a plain failure.
		const code = ((await r.json().catch(() => ({}))) as { code?: string }).code;
		if (code === 'P0001') return { ok: false, message: 'Too many messages in a short time. Wait a few minutes, or write by email.' };
		return { ok: false, message: 'It didn’t send. Try again, or write by email.' };
	} catch {
		return { ok: false, message: 'No connection. Check it and try again; nothing was lost.' };
	}
}
