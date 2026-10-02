import { Rich } from './Rich';
import { pad2 } from '../lib/paths';
import type { ExamFinding, Investigation, Mnemonic, TrapCard, TreatmentLogic } from '../lib/types';

// Section renderers for module content, shared by the full module view
// (LectureBody) and the focused concept modes. Presentational only.

export function HighYieldList({ items }: { items: string[] }) {
  return (
    <ul className="doc-list">
      {items.map((h, i) => (
        <li key={i}>
          <Rich text={h} />
        </li>
      ))}
    </ul>
  );
}

export function Findings({ items }: { items: ExamFinding[] }) {
  return (
    <div className="entry-list" data-layout="split">
      {items.map((f, i) => (
        <div key={i} className="entry">
          <span className="entry-term">
            {f.significance === 'key' ? <span className="tag tag-accent mr-2 align-[2px]">key</span> : null}
            {f.sign}
          </span>
          <span className="entry-body">{f.mechanism}</span>
        </div>
      ))}
    </div>
  );
}

export function Investigations({ items }: { items: Investigation[] }) {
  return (
    <div className="entry-list" data-layout="split">
      {items.map((iv, i) => (
        <div key={i} className="entry">
          <span className="entry-term">{iv.clue}</span>
          <span className="entry-body">{iv.meaning}</span>
        </div>
      ))}
    </div>
  );
}

export function Treatment({ items }: { items: TreatmentLogic[] }) {
  return (
    <div className="entry-list" data-layout="split">
      {items.map((t, i) => (
        <div key={i} className="entry">
          <span className="entry-term">{t.logic}</span>
          <span className="entry-body">{t.detail ? <Rich text={t.detail} /> : <span className="font-mono text-[12px] text-fg-3">—</span>}</span>
        </div>
      ))}
    </div>
  );
}

export function Mnemonics({ items }: { items: Mnemonic[] }) {
  return (
    <div>
      {items.map((m, i) => (
        <div key={i} className="mnemonic">
          <div className="mnemonic-hook">“{m.hook}”</div>
          <div className="mnemonic-body">{m.expansion.join(' · ')}</div>
        </div>
      ))}
    </div>
  );
}

export function Traps({ items }: { items: TrapCard[] }) {
  return (
    <div>
      {items.map((t, i) => (
        <div key={i} className="trap">
          <div className="trap-head">
            <span>exam_trap {pad2(i + 1)}</span>
            <span className="trap-category">category: {t.questionCategory}</span>
          </div>
          <div className="trap-row">
            <span className="trap-key" data-tone="danger">
              ✗ instinct
            </span>
            <span className="trap-wrong">{t.wrongInstinct}</span>
          </div>
          <div className="trap-row">
            <span className="trap-key" data-tone="ok">
              ✓ answer
            </span>
            <span className="font-medium text-fg">{t.rightAnswer}</span>
          </div>
          <div className="trap-row">
            <span className="trap-key">why</span>
            <span className="text-fg-2">{t.why}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
