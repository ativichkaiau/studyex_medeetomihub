export const MOTION_CHANGE_EVENT = 'williamshub:motion-change';
export const MOTION_KEY = 'wh-motion';

// Keep a manual choice for this visit even when storage is unavailable.
let sessionEnabled = true;

export function motionEnabled(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return localStorage.getItem(MOTION_KEY) !== 'paused';
  } catch {
    return sessionEnabled;
  }
}

export const motionScript = `(function(){var on=true;try{on=localStorage.getItem(${JSON.stringify(MOTION_KEY)})!=='paused';}catch(e){}on=on&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.classList.toggle('motion',on);document.documentElement.toggleAttribute('data-motion-paused',!on);})();`;

/** Persist and apply the reader's motion choice; reduced motion still wins. */
export function setMotion(enabled: boolean): void {
  sessionEnabled = enabled;
  try {
    localStorage.setItem(MOTION_KEY, enabled ? 'enabled' : 'paused');
  } catch {}
  const on = enabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('motion', on);
  document.documentElement.toggleAttribute('data-motion-paused', !on);
  window.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: { enabled } }));
}
