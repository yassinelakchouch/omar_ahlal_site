import { finePointer, kit, motion } from './motion.svelte';

// N3 · A magnetic pill: within 60 px it follows the pointer a third of the way, and returns with an elastic settle.
export function magnet(node: HTMLElement) {
	if (!finePointer()) return;
	let near = false;
	const move = (e: PointerEvent) => {
		if (!motion.on) return;
		const r = node.getBoundingClientRect();
		const dx = e.clientX - (r.left + r.width / 2);
		const dy = e.clientY - (r.top + r.height / 2);
		const inside = Math.abs(dx) < r.width / 2 + 60 && Math.abs(dy) < r.height / 2 + 60;
		if (!inside && !near) return;
		near = inside;
		void kit().then(({ gsap }) =>
			inside
				? gsap.to(node, { x: dx / 3, y: dy / 3, duration: 0.4, ease: 'power3.out', overwrite: true })
				: gsap.to(node, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true })
		);
	};
	addEventListener('pointermove', move, { passive: true });
	return () => removeEventListener('pointermove', move);
}

// N2 · Arrows travel: the arrow leaves along its own direction and a copy comes in behind it. The label never moves.
const DIR = { '↗': [1, -1], '→': [1, 0], '↓': [0, 1], '←': [-1, 0] } as const;
export function travel(node: HTMLElement) {
	const control = node.closest<HTMLElement>('a, button');
	const [a, b] = [...node.children] as HTMLElement[];
	const glyph = (a?.textContent ?? '→') as keyof typeof DIR;
	const [dx, dy] = DIR[glyph] ?? DIR['→'];
	if (!control || !a || !b) return;
	const go = () =>
		void kit().then(({ gsap }) => {
			if (!motion.on) return;
			gsap.timeline({ defaults: { duration: 0.32, ease: 'power3.out' } })
				.fromTo(a, { x: 0, y: 0, opacity: 1 }, { x: dx * 12, y: dy * 12, opacity: 0 }, 0)
				.fromTo(b, { x: -dx * 12, y: -dy * 12, opacity: 0 }, { x: 0, y: 0, opacity: 1 }, 0.06)
				.set(a, { x: 0, y: 0, opacity: 1 })
				.set(b, { opacity: 0 });
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
