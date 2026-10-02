export type AppearanceMode = 'auto' | 'light' | 'dark';

export const APPEARANCE_KEY = 'wh-theme';
export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 18;

// Preserve manual choices; a missing or invalid preference follows local time.
export function appearanceMode(value: string | null): AppearanceMode {
  return value === 'light' || value === 'dark' ? value : 'auto';
}

export function isNight(mode: AppearanceMode, now = new Date()): boolean {
  return mode === 'dark' || (mode === 'auto' && (now.getHours() < DAY_START_HOUR || now.getHours() >= NIGHT_START_HOUR));
}

export function nextAppearanceCheck(now = new Date()): number {
  const boundary = new Date(now);
  const hour = now.getHours();
  boundary.setHours(hour < DAY_START_HOUR ? DAY_START_HOUR : hour < NIGHT_START_HOUR ? NIGHT_START_HOUR : 24 + DAY_START_HOUR, 0, 0, 0);
  // Hit the boundary precisely; also notice a changed clock/time zone while open.
  return Math.max(1, Math.min(60_000, boundary.getTime() - now.getTime()));
}

// Pre-paint counterpart to isNight, using the same schedule constants. Storage
// failure must not prevent the local-time default from being applied.
export const appearanceScript = `(function(){var m='auto';try{var s=localStorage.getItem(${JSON.stringify(APPEARANCE_KEY)});if(s==='light'||s==='dark')m=s;}catch(e){}var h=new Date().getHours();var d=m==='dark'||(m==='auto'&&(h<${DAY_START_HOUR}||h>=${NIGHT_START_HOUR}));document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.themeMode=m;})();`;

// ── Runtime ──────────────────────────────────────────────────────────────
// One ThemeRuntime (components/shell/ThemeRuntime.tsx) owns the schedule; the
// controls only write the choice and announce it.
export const APPEARANCE_CHANGE_EVENT = 'williamshub:appearance-change';

export interface AppearanceState {
  mode: AppearanceMode;
  dark: boolean;
}

export function savedAppearance(): AppearanceMode {
  try {
    return appearanceMode(localStorage.getItem(APPEARANCE_KEY));
  } catch {
    return 'auto';
  }
}

/** Apply a mode to the document and tell every control what is now showing. */
export function applyAppearance(mode: AppearanceMode, now = new Date()): AppearanceState {
  const dark = isNight(mode, now);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.dataset.themeMode = mode;
  window.dispatchEvent(new CustomEvent<AppearanceState>(APPEARANCE_CHANGE_EVENT, { detail: { mode, dark } }));
  return { mode, dark };
}

export function setAppearance(mode: AppearanceMode): AppearanceState {
  try {
    localStorage.setItem(APPEARANCE_KEY, mode);
  } catch {}
  return applyAppearance(mode);
}
