'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { DEPTH_CHANGE_EVENT, DEPTH_KEY, depthEnabled } from '../lib/depth';
import HubIcon from './HubIcon';

// The live swap. Flipping this does not re-render the interface into a second
// stylesheet — it moves one registered custom property, and every depth rule in
// globals.css is expressed as a multiple of it, so the whole UI travels between
// flat and three dimensions in place with scroll position and state intact.
// A click swaps, with a one-shot camera move on the page; a sideways drag dials
// the property by hand and settles on whichever side it is let go.

const MORPH_MS = 1000;
const SCRUB_PX = 120; // drag distance for a full swing between flat and 3D

export default function DepthToggle() {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<{ id: number; x: number; from: number; active: boolean } | null>(null);
  const swallowClick = useRef(false);
  const morphTimer = useRef(0);

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
      window.clearTimeout(morphTimer.current);
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

  // The camera move pivots on the middle of the viewport, so the part of the
  // page being looked at is what swings — not a point a long way below it.
  function morph(next: boolean) {
    const root = document.documentElement;
    const main = document.querySelector('main');
    if (main) {
      const top = main.getBoundingClientRect().top;
      root.style.setProperty('--morph-oy', `${Math.round(window.innerHeight * 0.45 - top)}px`);
    }
    window.clearTimeout(morphTimer.current);
    delete root.dataset.depthMorph;
    void root.offsetWidth; // restart the move if a swap is already running
    root.dataset.depthMorph = next ? 'rise' : 'flatten';
    morphTimer.current = window.setTimeout(() => {
      delete root.dataset.depthMorph;
      root.style.removeProperty('--morph-oy');
    }, MORPH_MS);
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
    // Hand the property back to the class in the same frame, with the
    // transition re-armed, so it glides from where the hand left it.
    root.removeAttribute('data-depth-scrub');
    root.style.removeProperty('--depth');
    commit(Number.isFinite(value) ? value >= 0.5 : enabled);
  }

  function onClick() {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    const next = !enabled;
    morph(next);
    commit(next);
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
