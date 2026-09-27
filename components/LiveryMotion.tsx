'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MOTION_CHANGE_EVENT, motionEnabled } from '../lib/motion';

// Drives the livery motion defined in globals.css:
//   · --scroll-progress (0→1) feeds the header timing stripe and the
//     parallax drift on the page-edge hatch.
//   · [data-reveal] sections get data-revealed as they enter the viewport,
//     once each — the CSS handles the actual transition.
//
// Decorative motion follows the system setting and the user's pause control.
// Reading progress and reveal bookkeeping stay active in either mode.

export default function LiveryMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = (event?: Event) => {
      const requested = (event as CustomEvent<{ enabled: boolean }> | undefined)?.detail?.enabled;
      const enabled = !preference.matches && (requested ?? motionEnabled());
      root.classList.toggle('motion', enabled);
      root.toggleAttribute('data-motion-paused', !enabled);
    };
    syncMotion();
    preference.addEventListener('change', syncMotion);
    window.addEventListener(MOTION_CHANGE_EVENT, syncMotion);
    const cleanPreferences = () => {
      preference.removeEventListener('change', syncMotion);
      window.removeEventListener(MOTION_CHANGE_EVENT, syncMotion);
    };

    // ── Lap progress ──────────────────────────────────────────────────
    let frame = 0;
    const setProgress = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      root.style.setProperty('--scroll-progress', p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(setProgress);
    };
    setProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // ── Pointer tilt ──────────────────────────────────────────────────
    // One delegated listener writes the pointer's position within the hovered
    // surface as --px/--py (-1..1), and within the enclosing scene as
    // --sx/--sy; the CSS multiplies those by --depth. --tilt is the surface's
    // angle budget: a fixed angle swings a wide panel's edges much further
    // than a small card's, so wide surfaces get proportionally less. Flat, or
    // with motion paused, nothing is written at all. Only fine pointers tilt —
    // a touch drag should scroll, not rotate the card.
    // Kept in step with the interactive-surface list in globals.css.
    const TILT_TARGETS = 'a.subject-card, a.clay, a.clay-node, .featured-module, .depth-tilt';
    const SCENES = '.home-hero, .depth-scene';
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let tilted: HTMLElement | null = null;
    let scene: HTMLElement | null = null;
    let tiltFrame = 0;
    let lastEvent: PointerEvent | null = null;

    const clearTilt = () => {
      if (!tilted) return;
      tilted.style.removeProperty('--px');
      tilted.style.removeProperty('--py');
      tilted.style.removeProperty('--tilt');
      tilted = null;
    };
    const clearScene = () => {
      if (!scene) return;
      scene.style.removeProperty('--sx');
      scene.style.removeProperty('--sy');
      scene = null;
    };
    const clearAll = () => {
      clearTilt();
      clearScene();
    };

    const pointerIn = (el: HTMLElement, event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return {
        r,
        x: Math.max(-1, Math.min(1, ((event.clientX - r.left) / r.width) * 2 - 1)).toFixed(3),
        y: Math.max(-1, Math.min(1, ((event.clientY - r.top) / r.height) * 2 - 1)).toFixed(3),
      };
    };

    const applyTilt = () => {
      tiltFrame = 0;
      const event = lastEvent;
      if (!event) return;
      const from = event.target as Element | null;

      const target = from?.closest<HTMLElement>(TILT_TARGETS) ?? null;
      if (target !== tilted) clearTilt();
      if (target) {
        const p = pointerIn(target, event);
        if (p) {
          tilted = target;
          target.style.setProperty('--px', p.x);
          target.style.setProperty('--py', p.y);
          target.style.setProperty('--tilt', Math.max(2.5, 8 * Math.min(1, 340 / Math.max(p.r.width, p.r.height))).toFixed(2));
        }
      }

      const stage = from?.closest<HTMLElement>(SCENES) ?? null;
      if (stage !== scene) clearScene();
      if (stage) {
        const p = pointerIn(stage, event);
        if (p) {
          scene = stage;
          stage.style.setProperty('--sx', p.x);
          stage.style.setProperty('--sy', p.y);
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      if (!root.classList.contains('depth') || !root.classList.contains('motion')) {
        clearAll();
        return;
      }
      lastEvent = event;
      if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    // A card scrolled out from under a stationary pointer must not stay tilted.
    window.addEventListener('scroll', clearTilt, { passive: true });
    document.addEventListener('pointerleave', clearAll);

    const cleanTilt = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', clearTilt);
      document.removeEventListener('pointerleave', clearAll);
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      clearAll();
    };

    // ── Reveal on entry ───────────────────────────────────────────────
    // If an observer is throttled, bypass only the entrance choreography.
    // This leaves the content visible without permanently disabling motion.
    const revealAll = () => {
      root.classList.add('reveal-fallback');
      for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')) {
        el.dataset.revealed = '';
      }
    };

    // No observer, no hiding: show everything rather than gate content on an
    // API that isn't there.
    if (typeof IntersectionObserver === 'undefined') {
      revealAll();
      return () => {
        cleanPreferences();
        cleanTilt();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = '';
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    // Re-scan on a rAF so a burst of DOM changes costs one query, not many.
    let scan = 0;
    const observeAll = () => {
      scan = 0;
      for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')) {
        io.observe(el);
      }
    };
    observeAll();

    // Client-side navigation and interactive lists mount new sections after
    // this effect runs, so keep watching for them.
    const mo = new MutationObserver(() => {
      if (!scan) scan = requestAnimationFrame(observeAll);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net. Observer callbacks are delivered on the rendering steps, so
    // anywhere those are starved (throttled webviews, headless capture) they
    // may never arrive — and reveal styling would leave the page permanently
    // blank. If something is on screen and *nothing* has revealed, or a known
    // nested choreography is still at its hidden first frame, take that as
    // proof the observer/animation timeline isn't delivering and show all
    // content. On a healthy browser the top section reveals in ~50ms and the
    // nested choreography settles before this check runs, so it never fires.
    const safety = window.setTimeout(() => {
      const pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')];
      const onScreen = pending.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      const choreography = document.querySelectorAll<HTMLElement>(
        '.hero-title, .library-stats > div, .mechanism-preview > li, .grid-stagger > *, .lecture-body > *',
      );
      const nestedHidden = [...choreography].some((el) => {
        if (!el.closest('[data-reveal][data-revealed]')) return false;
        return getComputedStyle(el).opacity === '0';
      });
      if (onScreen || nestedHidden) revealAll();
    }, 1200);

    return () => {
      cleanPreferences();
      cleanTilt();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (scan) cancelAnimationFrame(scan);
      window.clearTimeout(safety);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
