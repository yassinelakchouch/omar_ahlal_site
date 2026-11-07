import type { gsap as GSAP } from 'gsap';

type Kit = { gsap: typeof GSAP; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger; Flip: typeof import('gsap/Flip').Flip };
let loading: Promise<Kit> | null = null;

// GSAP loads after the first paint, only in the browser. A chunk that never arrives shows the page still.
export function kit(): Promise<Kit> {
	if (!loading) {
		loading = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/Flip')]).then(([{ gsap }, { ScrollTrigger }, { Flip }]) => {
			gsap.registerPlugin(ScrollTrigger, Flip);
			(window as unknown as { __motionReady: boolean }).__motionReady = true;
			return { gsap, ScrollTrigger, Flip };
		});
		loading.catch(() => {
			document.documentElement.dataset.motion = 'off';
			document.documentElement.classList.remove('first');
		});
	}
	return loading;
}

// Resolves once the loader has handed the page over; at once on a move inside the site.
export function arrived(): Promise<void> {
	const html = document.documentElement;
	if (!html.classList.contains('first')) return Promise.resolve();
	return new Promise((done) => {
		const watch = new MutationObserver(() => {
			if (html.classList.contains('first')) return;
			watch.disconnect();
			done();
		});
		watch.observe(html, { attributes: true, attributeFilter: ['class'] });
	});
}

// The owner's roll and settle, shared by every moment (board O-15).
export const ROLL = { duration: 0.33, ease: 'power3.inOut' } as const;
export const SETTLE = { duration: 0.8, ease: 'back.out(1.4)' } as const;

// Fine pointer only: magnets and hover rolls never run on touch.
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
