import type { gsap as GSAP } from 'gsap';
import { finePointer, kit } from './motion';

// N3 · A magnetic pill: within 60 px it follows the pointer a third of the way, and returns with an elastic settle.
export function magnet(node: HTMLElement) {
	if (!finePointer()) return;
	let g: typeof GSAP | null = null;
	let near = false;
	void kit().then((k) => (g = k.gsap));
	const move = (e: PointerEvent) => {
		if (!g) return;
		// Measured where the pill rests, not where the pull has moved it: it chased its own offset and shook at the edge.
		const r = node.getBoundingClientRect();
		const dx = e.clientX - (r.left + r.width / 2 - Number(g.getProperty(node, 'x')));
		const dy = e.clientY - (r.top + r.height / 2 - Number(g.getProperty(node, 'y')));
		const inside = Math.abs(dx) < r.width / 2 + 60 && Math.abs(dy) < r.height / 2 + 60;
		if (!inside && !near) return;
		near = inside;
		if (inside) g.to(node, { x: dx / 3, y: dy / 3, duration: 0.4, ease: 'power3.out', overwrite: true });
		else g.to(node, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true });
	};
	addEventListener('pointermove', move, { passive: true });
	return () => removeEventListener('pointermove', move);
}

// N2 · Arrows travel: the arrow leaves along its own direction and a copy comes in behind it. The label never moves.
const DIR = { '↗': [1, -1], '→': [1, 0], '↓': [0, 1], '←': [-1, 0], '↑': [0, -1] } as const;
export function travel(node: HTMLElement) {
	const control = node.closest<HTMLElement>('a, button');
	const [a, b] = [...node.children] as HTMLElement[];
	const glyph = (a?.textContent ?? '→') as keyof typeof DIR;
	const [dx, dy] = DIR[glyph] ?? DIR['→'];
	if (!control || !a || !b) return;
	// One timeline, restarted: a new one per hover left the old one's end snapping the arrow back mid-travel.
	let run: ReturnType<typeof GSAP.timeline> | null = null;
	const go = () =>
		void kit().then(({ gsap }) => {
			run ??= gsap
				.timeline({ paused: true, defaults: { duration: 0.32, ease: 'power3.out' } })
				.fromTo(a, { x: 0, y: 0, opacity: 1 }, { x: dx * 12, y: dy * 12, opacity: 0, immediateRender: false }, 0)
				.fromTo(b, { x: -dx * 12, y: -dy * 12, opacity: 0 }, { x: 0, y: 0, opacity: 1, immediateRender: false }, 0.06)
				.set(a, { x: 0, y: 0, opacity: 1 })
				.set(b, { opacity: 0 });
			run.restart();
		});
	const enter = (e: PointerEvent) => e.pointerType === 'mouse' && go();
	const focus = () => control.matches(':focus-visible') && go();
	control.addEventListener('pointerenter', enter);
	control.addEventListener('focus', focus);
	return () => {
		control.removeEventListener('pointerenter', enter);
		control.removeEventListener('focus', focus);
	};
}
