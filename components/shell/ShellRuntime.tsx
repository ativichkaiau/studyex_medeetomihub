'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MOTION_CHANGE_EVENT, MOTION_KEY, motionEnabled } from '../../lib/motion';
import { isTypingTarget, openSearch, openShortcuts } from '../../lib/events';
import { NAV } from './nav';
import { setScrollProgress } from './progressStore';

// The shell's background work, mounted once:
//   · keeps .motion in step with the system setting and the reader's choice;
//   · measures reading progress for the path bar's rule (ScrollProgress);
//   · the keyboard: g + key jumps to a section, / searches, ? lists the keys.
// Single-key shortcuts stand down while you type, and while a study session
// that owns the letter keys is on screen ([data-keyscope]).

const SEQUENCE_MS = 1200;

export default function ShellRuntime() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      const on = motionEnabled();
      root.classList.toggle('motion', on);
      root.toggleAttribute('data-motion-paused', !on);
    };
    syncMotion();
    const onStorage = (event: StorageEvent) => {
      if (event.key === MOTION_KEY || event.key === null) syncMotion();
    };
    preference.addEventListener('change', syncMotion);
    window.addEventListener(MOTION_CHANGE_EVENT, syncMotion);
    window.addEventListener('storage', onStorage);

    // Reading progress, shown by every mounted ScrollProgress rule.
    let frame = 0;
    const draw = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      setScrollProgress((max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    onScroll();
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      preference.removeEventListener('change', syncMotion);
      window.removeEventListener(MOTION_CHANGE_EVENT, syncMotion);
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    let armed = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      if (event.key === '?') {
        event.preventDefault();
        openShortcuts();
        return;
      }
      if (event.key === '/') {
        event.preventDefault();
        openSearch();
        return;
      }
      if (document.querySelector('[data-keyscope]')) return;

      const key = event.key.toLowerCase();
      if (armed && performance.now() - armed < SEQUENCE_MS) {
        armed = 0;
        const target = NAV.find((item) => item.key === key);
        if (target) {
          event.preventDefault();
          router.push(target.href);
        }
        return;
      }
      armed = key === 'g' && !event.shiftKey ? performance.now() : 0;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return null;
}
