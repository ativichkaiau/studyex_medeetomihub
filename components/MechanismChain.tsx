'use client';

import { useState } from 'react';
import type { MechanismChain as Chain, MechanismStep, Emphasis } from '../lib/types';

// Cause → effect, left to right, then the labelled branches. 'key' steps are
// exam-critical, 'danger' steps lethal. A step with a detail opens it in place.

const FLAG: Record<Emphasis, string | null> = { normal: null, key: 'key', danger: 'lethal' };

function Node({ step }: { step: MechanismStep }) {
  const [open, setOpen] = useState(false);
  const e = step.emphasis ?? 'normal';
  const flag = FLAG[e];
  const body = (
    <>
      {flag ? <span className="chain-flag">{flag}</span> : null}
      <span>{step.label}</span>
      {step.detail ? (
        <span className="chain-more" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      ) : null}
    </>
  );
  if (!step.detail) {
    return (
      <span className="chain-node" data-emphasis={e}>
        {body}
      </span>
    );
  }
  return (
    <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} data-emphasis={e} className="mechanism-node chain-node">
      {body}
      {open ? <span className="chain-detail reveal-in">{step.detail}</span> : null}
    </button>
  );
}

function Steps({ steps }: { steps: MechanismStep[] }) {
  return (
    <div className="chain">
      {steps.map((s, i) => (
        <span key={s.id} className="chain-step">
          <Node step={s} />
          {i < steps.length - 1 ? (
            <span className="chain-arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export default function MechanismChain({ chain }: { chain: Chain }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[12px] text-fg-3"># {chain.title}</p>
      <Steps steps={chain.steps} />
      {chain.branches?.map((b, bi) => (
        <div key={bi} className="chain-branch">
          {b.title ? <p className="mb-2 font-mono text-[11px] text-fg-3">↳ {b.title}</p> : null}
          <Steps steps={b.steps} />
        </div>
      ))}
    </div>
  );
}
