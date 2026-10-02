'use client';

import { useEffect, useState } from 'react';
import Dialog from '../ui/Dialog';
import { SHORTCUTS_OPEN_EVENT } from '../../lib/events';
import { NAV } from './nav';

// The keyboard reference, opened with ? or from the sidebar. Lists only
// shortcuts that are actually bound.
const GLOBAL: [string, string][] = [
  ['⌘K  ·  /', 'search & commands'],
  ['⌘J', 'ask the tutor'],
  ['?', 'this list'],
  ['esc', 'close an overlay'],
];
const SESSIONS: [string, string][] = [
  ['space · enter', 'cards: reveal, then good'],
  ['1 · 2', 'cards: again · good'],
  ['a–e · 1–5', 'practice: answer'],
  ['enter', 'practice: next question'],
];

function Keys({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="kv">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-fg">{k}</dt>
          <dd className="text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(SHORTCUTS_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(SHORTCUTS_OPEN_EVENT, onOpen);
  }, []);

  if (!open) return null;
  return (
    <Dialog label="Keyboard shortcuts" onClose={() => setOpen(false)} className="max-w-[520px]">
        <div className="dialog-head">
          <span className="flex-1 uppercase">keyboard</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Close keyboard shortcuts">
            esc
          </button>
        </div>
        <div className="grid gap-6 overflow-y-auto p-5 sm:grid-cols-2">
          <div>
            <p className="label mb-3">global</p>
            <Keys rows={GLOBAL} />
          </div>
          <div>
            <p className="label mb-3">go to</p>
            <Keys rows={NAV.map((item) => [`g ${item.key}`, item.label])} />
          </div>
          <div className="sm:col-span-2">
            <p className="label mb-3">sessions</p>
            <Keys rows={SESSIONS} />
          </div>
        </div>
    </Dialog>
  );
}
