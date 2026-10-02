import SectionLabel from '../ui/SectionLabel';
import { pad2 } from '../../lib/paths';
import type { OnePagerSections } from '../../lib/concept/types';

// The OnePager, compiled from the module: seven fixed sections. An empty
// section prints what is missing, so the structure is always complete.

const SECTIONS: { key: keyof OnePagerSections; label: string; fallback: string }[] = [
  { key: 'coreMechanism', label: 'core_mechanism', fallback: 'mechanism chain not captured for this module' },
  { key: 'mustKnowFacts', label: 'must_know', fallback: 'no high-yield facts captured' },
  { key: 'clinicalSigns', label: 'clinical_signs', fallback: 'no clinical signs listed' },
  { key: 'diagnosisManagement', label: 'diagnosis_management', fallback: 'no investigation or management logic listed' },
  { key: 'examTraps', label: 'exam_traps', fallback: 'no exam traps captured' },
  { key: 'blockIntegrations', label: 'block_integrations', fallback: 'no cross-module integrations mapped yet' },
  { key: 'memoryHooks', label: 'memory_hooks', fallback: 'no mnemonics for this module' },
];

export default function OnePagerModeView({ onePager, id = 'onepager', toc = false }: { onePager: OnePagerSections; id?: string; toc?: boolean }) {
  const filled = SECTIONS.filter((s) => onePager[s.key]?.length).length;
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">onepager_artifact</span>
        <span className="panel-meta">
          compiled · {filled}/{SECTIONS.length} sections
        </span>
      </div>
      <div className="doc grid gap-7 p-5 text-[14.5px]">
        {SECTIONS.map(({ key, label, fallback }, i) => {
          const items = onePager[key];
          const empty = !items || items.length === 0;
          return (
            <section key={key} aria-labelledby={`${id}--op-${key}`}>
              <SectionLabel id={`${id}--op-${key}`} no={pad2(i + 1)} toc={toc ? label : undefined} as="h3">
                {label}
              </SectionLabel>
              {empty ? (
                <p className="font-mono text-[12px] text-fg-3">∅ {fallback}</p>
              ) : (
                <ul className="doc-list">
                  {items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
