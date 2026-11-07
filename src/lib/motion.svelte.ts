import type { gsap as GSAP } from 'gsap';

const KEY = 'motion';

// The stored switch decides, not the OS flag (as on the owner's sites): Windows' "Animation effects: off" reports
// reduce in every browser. app.html sets data-motion before the first paint from the same key.
function stored(): boolean {
	try {
		return localStorage.getItem(KEY) !== 'off';
	} catch {
		return true;
	}
}

export const motion = $state({ on: typeof localStorage === 'undefined' ? true : stored() });

type Kit = { gsap: typeof GSAP; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger; Flip: typeof import('gsap/Flip').Flip };
let loading: Promise<Kit> | null = null;

// GSAP loads after the first paint, only in the browser; off makes every tween end on its next frame.
export function kit(): Promise<Kit> {
	loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/Flip')]).then(([{ gsap }, { ScrollTrigger }, { Flip }]) => {
		gsap.registerPlugin(ScrollTrigger, Flip);
		gsap.globalTimeline.timeScale(motion.on ? 1 : 1000);
		(window as unknown as { __motionReady: boolean }).__motionReady = true;
		return { gsap, ScrollTrigger, Flip };
	});
	// A chunk that never arrives: show this page still rather than leave anything in its starting state.
	loading.catch(() => (document.documentElement.dataset.motion = 'off'));
	return loading;
}

export function setMotion(on: boolean) {
	motion.on = on;
	try {
		localStorage.setItem(KEY, on ? 'on' : 'off');
	} catch {
		// Storage blocked: the choice lasts until the page is left.
	}
	document.documentElement.dataset.motion = on ? 'on' : 'off';
	if (loading) void loading.then(({ gsap }) => gsap.globalTimeline.timeScale(on ? 1 : 1000));
}

// The owner's roll and settle, shared by every moment (board O-15).
export const ROLL = { duration: 0.33, ease: 'power3.inOut' } as const;
export const SETTLE = { duration: 0.8, ease: 'back.out(1.4)' } as const;

// Fine pointer only: magnets and hover rolls never run on touch.
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
