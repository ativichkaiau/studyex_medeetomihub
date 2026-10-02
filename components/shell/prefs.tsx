'use client';

import { useEffect, useState } from 'react';
import {
  APPEARANCE_CHANGE_EVENT,
  APPEARANCE_KEY,
  applyAppearance,
  nextAppearanceCheck,
  savedAppearance,
  setAppearance,
  type AppearanceMode,
  type AppearanceState,
} from '../../lib/appearance';
import { MOTION_CHANGE_EVENT, MOTION_KEY, motionEnabled, setMotion } from '../../lib/motion';

// Preferences: appearance (auto · light · dark) and motion (on · off).
// ThemeRuntime is mounted once and owns the day/night schedule; the controls
// can appear in several places (sidebar, drawer, palette) without each
// running its own timer.

export function ThemeRuntime() {
  useEffect(() => {
    let mode = savedAppearance();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      const now = new Date();
      applyAppearance(mode, now);
      // Auto follows local time: re-check exactly at the next boundary.
      if (mode === 'auto') timer = setTimeout(sync, nextAppearanceCheck(now));
    };
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<AppearanceState>).detail?.mode;
      if (next && next !== mode) {
        mode = next;
        sync();
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== APPEARANCE_KEY && event.key !== null) return;
      mode = savedAppearance();
      sync();
    };
    const resume = () => {
      if (document.visibilityState === 'visible') sync();
    };
    sync();
    window.addEventListener(APPEARANCE_CHANGE_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', resume);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener(APPEARANCE_CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', resume);
    };
  }, []);
  return null;
}

/** What is showing now; null until mounted (the server cannot know). */
export function useAppearance(): AppearanceState | null {
  const [state, setState] = useState<AppearanceState | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const mode = root.dataset.themeMode;
    setState({
      mode: mode === 'light' || mode === 'dark' ? mode : 'auto',
      dark: root.classList.contains('dark'),
    });
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<AppearanceState>).detail;
      if (detail) setState(detail);
    };
    window.addEventListener(APPEARANCE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(APPEARANCE_CHANGE_EVENT, onChange);
  }, []);
  return state;
}

export function useMotionPref(): { enabled: boolean | null; reduced: boolean } {
  const [state, setState] = useState<{ enabled: boolean | null; reduced: boolean }>({ enabled: null, reduced: false });
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setState({ enabled: motionEnabled(), reduced: preference.matches });
    const onStorage = (event: StorageEvent) => {
      if (event.key === MOTION_KEY || event.key === null) sync();
    };
    sync();
    preference.addEventListener('change', sync);
    window.addEventListener(MOTION_CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      preference.removeEventListener('change', sync);
      window.removeEventListener(MOTION_CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return state;
}

const MODES: { mode: AppearanceMode; label: string; title: string }[] = [
  { mode: 'auto', label: 'auto', title: 'Follow local time: light 06:00–18:00, dark otherwise' },
  { mode: 'light', label: 'light', title: 'Always light' },
  { mode: 'dark', label: 'dark', title: 'Always dark' },
];

export function ThemeControl() {
  const state = useAppearance();
  return (
    <div className="seg" role="group" aria-label="Theme">
      {MODES.map((m) => (
        <button
          key={m.mode}
          type="button"
          title={m.title}
          aria-pressed={state?.mode === m.mode}
          disabled={!state}
          onClick={() => setAppearance(m.mode)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function MotionControl() {
  const { enabled, reduced } = useMotionPref();
  const title = reduced ? 'Reduced by your system setting' : undefined;
  return (
    <div className="seg" role="group" aria-label="Motion" title={title}>
      <button type="button" aria-pressed={enabled === true} disabled={enabled === null || reduced} onClick={() => setMotion(true)}>
        on
      </button>
      <button type="button" aria-pressed={enabled === false} disabled={enabled === null || reduced} onClick={() => setMotion(false)}>
        off
      </button>
    </div>
  );
}

/** The two preference rows, as the sidebar and the drawer show them. */
export function PrefsRows() {
  return (
    <div className="grid gap-2 font-mono text-[11.5px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-3">theme</span>
        <ThemeControl />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-3">motion</span>
        <MotionControl />
      </div>
    </div>
  );
}
