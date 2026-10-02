'use client';

import { CONCEPT_MODES } from '../../lib/concept/modes';
import type { ConceptDepth } from '../../lib/concept/types';

// view: quick_review · standard · mechanism · clinical · traps · teaching · onepager
// Controlled by ConceptModeController, which owns the persisted value.
export const modeName = (label: string) => label.toLowerCase().replace(/\s+/g, '_');

export default function ConceptDepthSelector({
  value,
  onChange,
}: {
  value: ConceptDepth;
  onChange: (mode: ConceptDepth) => void;
}) {
  const active = CONCEPT_MODES.find((m) => m.mode === value);
  return (
    <div className="mb-7">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="label">view</span>
        {active ? <span className="font-mono text-[11px] text-fg-3">// {active.blurb.toLowerCase()}</span> : null}
      </div>
      <div className="modebar" role="tablist" aria-label="Concept depth mode">
        {CONCEPT_MODES.map((m) => (
          <button key={m.mode} type="button" role="tab" aria-selected={m.mode === value} onClick={() => onChange(m.mode)}>
            {modeName(m.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
