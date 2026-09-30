'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { DEPTH_CHANGE_EVENT, DEPTH_KEY, depthEnabled } from '../lib/depth';
import HubIcon from './HubIcon';

// The live swap. Every depth rule in globals.css is a multiple of one custom
// property, --depth, so the whole UI changes dimension in place with scroll
// position and state intact.
//
// --depth is inherited by every element, so changing it restyles the whole
// document (~13ms on a long lecture page). It is therefore never animated: a
// swap applies it in a single frame, and the motion is a View Transition — the
// browser crossfades a snapshot of the old interface into the new one on the
// compositor, with a short camera move, at the same cost on any page. Where
// View Transitions are missing, or motion is off, the swap is instant. A
// sideways drag still dials the property by hand and settles with a short
// crossfade when let go.

const SCRUB_PX = 120; // drag distance for a full swing between flat and 3D

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export default function DepthToggle() {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<{ id: number; x: number; from: number; active: boolean } | null>(null);
  const swallowClick = useRef(false);
  const swapToken = useRef(0);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (event?: Event) => {
      const requested = (event as CustomEvent<{ enabled: boolean }> | undefined)?.detail?.enabled;
      setEnabled(!preference.matches && (requested ?? depthEnabled()));
      setReduced(preference.matches);
    };
    sync();
    preference.addEventListener('change', sync);
    window.addEventListener(DEPTH_CHANGE_EVENT, sync);
    return () => {
      preference.removeEventListener('change', sync);
      window.removeEventListener(DEPTH_CHANGE_EVENT, sync);
    };
  }, []);

  function commit(next: boolean) {
    try {
      localStorage.setItem(DEPTH_KEY, next ? 'on' : 'flat');
    } catch {}
    // Apply immediately even where preferences cannot be persisted.
    const root = document.documentElement;
    root.classList.toggle('depth', next);
    root.dataset.depth = next ? '3d' : 'flat';
    window.dispatchEvent(new CustomEvent(DEPTH_CHANGE_EVENT, { detail: { enabled: next } }));
  }

  // `kind` picks the camera move in globals.css ("The swap"); `prepare` runs
  // inside the update, after the old interface has been captured.
  function swap(next: boolean, kind: 'rise' | 'flatten' | 'settle', prepare?: () => void) {
    const root = document.documentElement;
    const apply = () => {
      prepare?.();
      commit(next);
    };
    const doc = document as ViewTransitionDocument;
    if (!root.classList.contains('motion') || typeof doc.startViewTransition !== 'function') {
      apply();
      return;
    }
    const token = ++swapToken.current;
    root.dataset.depthSwap = kind;
    const transition = doc.startViewTransition(apply);
    const done = () => {
      if (swapToken.current === token) delete root.dataset.depthSwap;
    };
    // A swap started mid-swap skips the first one; that is expected, not an error.
    transition.ready.catch(() => {});
    transition.finished.then(done, done);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    swallowClick.current = false;
    if (reduced || event.button !== 0) return;
    // Capture from the press, so a quick flick that leaves the 40px button on
    // its first move still reaches this control.
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--depth'));
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      from: Number.isFinite(current) ? current : enabled ? 1 : 0,
      active: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || event.pointerId !== d.id) return;
    const dx = event.clientX - d.x;
    const root = document.documentElement;
    if (!d.active) {
      if (Math.abs(dx) < 6) return;
      d.active = true;
      root.setAttribute('data-depth-scrub', '');
    }
    const value = Math.max(0, Math.min(1, d.from + dx / SCRUB_PX));
    root.style.setProperty('--depth', value.toFixed(3));
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || event.pointerId !== d.id) return;
    drag.current = null;
    if (!d.active) return;
    swallowClick.current = true;
    const root = document.documentElement;
    const value = parseFloat(root.style.getPropertyValue('--depth'));
    // Hand the property back to the class, settling from where the hand left it.
    swap(Number.isFinite(value) ? value >= 0.5 : enabled, 'settle', () => {
      root.removeAttribute('data-depth-scrub');
      root.style.removeProperty('--depth');
    });
  }

  function onClick() {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    const next = !enabled;
    swap(next, next ? 'rise' : 'flatten');
  }

  const label = reduced
    ? 'Depth disabled by your system motion setting'
    : enabled
      ? 'Flatten the interface'
      : 'Rebuild the interface in 3D';

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="header-tool depth-toggle"
      aria-label={label}
      title={reduced ? label : `${label} · drag sideways to dial the depth`}
      aria-pressed={enabled}
      disabled={reduced}
    >
      <HubIcon name={enabled ? 'cube' : 'plane'} />
    </button>
  );
}
