export const DEPTH_KEY = 'wh-depth';
export const DEPTH_CHANGE_EVENT = 'williamshub:depth-change';

// Depth is the default: the interface is built in three dimensions and the flat
// treatment is the opt-out. Reduced motion always wins, because the swap itself
// is an animation and because parallax is the classic vestibular trigger.
export function depthEnabled(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return localStorage.getItem(DEPTH_KEY) !== 'flat';
  } catch {
    return true;
  }
}

// Pre-paint counterpart. Without this the first frame paints flat and then
// everything lurches forward, which is worse than either end state.
export const depthScript = `(function(){try{var on=window.matchMedia('(prefers-reduced-motion: no-preference)').matches&&localStorage.getItem(${JSON.stringify(DEPTH_KEY)})!=='flat';document.documentElement.classList.toggle('depth',on);document.documentElement.dataset.depth=on?'3d':'flat';}catch(e){document.documentElement.classList.add('depth');document.documentElement.dataset.depth='3d';}})();`;
