'use client';

import { useId, useState } from 'react';

// Recall-first: content renders blurred until the reader chooses to reveal.
// Operationalizes "active recall over passive reading" (priority #3).
export default function RecallGate({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  // React 18 needs the native boolean attribute serialized as an empty string.
  const inertProps: Record<string, string> = revealed ? {} : { inert: '' };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRevealed((v) => !v)} className="btn btn-sm" aria-expanded={revealed} aria-controls={id}>
          {revealed ? 'hide' : 'reveal'}
        </button>
        <span className="font-mono text-[11px] text-fg-3">{revealed ? 'answers visible' : 'recall first, then reveal'}</span>
      </div>
      <div id={id} aria-hidden={!revealed} {...inertProps} className={`recall-body ${revealed ? '' : 'recall-hidden'}`}>{children}</div>
    </div>
  );
}
