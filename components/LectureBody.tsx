import MechanismChain from './MechanismChain';
import EcgStrip from './EcgStrip';
import MurmurStrip from './MurmurStrip';
import Quiz from './Quiz';
import RecallGate from './RecallGate';
import SectionLabel from './ui/SectionLabel';
import { Findings, HighYieldList, Investigations, Mnemonics, Traps, Treatment } from './LectureSections';
import { pad2 } from '../lib/paths';
import type { Figure, Lecture } from '../lib/types';

// The full content of one module, read as documentation: each section is a
// labelled block (HIGH_YIELD, MECHANISM, EXAM_TRAPS …) rather than a card.
// Shared by the module page and the whole-lecture scroll; the section
// renderers live in LectureSections so the concept modes can reuse them.

export function Figures({ items }: { items: Figure[] }) {
  return (
    <div>
      {items.map((f, i) => (
        <figure key={i} className="fig">
          <figcaption className="fig-head">
            <strong>{f.title}</strong>
            <span>FIG_{pad2(i + 1)}</span>
          </figcaption>
          <div className="fig-body">
            {f.ecg ? <EcgStrip rhythm={f.ecg} /> : f.murmur ? <MurmurStrip murmur={f.murmur} /> : f.svg ? <div dangerouslySetInnerHTML={{ __html: f.svg }} /> : null}
          </div>
          {f.caption ? <p className="fig-caption">{f.caption}</p> : null}
        </figure>
      ))}
    </div>
  );
}

interface Section {
  key: string;
  label: string;
  tone?: 'danger';
  meta?: string;
  body: React.ReactNode;
}

export default function LectureBody({ lecture: l, toc = false }: { lecture: Lecture; toc?: boolean }) {
  const pathology = l.system === 'pathology';
  const sections: Section[] = [
    {
      key: 'high-yield',
      label: 'high_yield',
      body: (
        <RecallGate>
          <HighYieldList items={l.highYield} />
        </RecallGate>
      ),
    },
    { key: 'mechanism', label: 'mechanism', body: <MechanismChain chain={l.mechanism} /> },
  ];
  if (l.figures && l.figures.length > 0) {
    sections.push({ key: 'figures', label: 'figures', meta: `${l.figures.length}`, body: <Figures items={l.figures} /> });
  }
  if (l.examFindings.length > 0) {
    sections.push({ key: 'findings', label: pathology ? 'pathological_findings' : 'exam_findings', body: <Findings items={l.examFindings} /> });
  }
  if (l.investigations.length > 0) {
    sections.push({ key: 'investigations', label: 'investigations', body: <Investigations items={l.investigations} /> });
  }
  if (l.treatment.length > 0) {
    sections.push({ key: 'treatment', label: pathology ? 'clinical_implications' : 'treatment_logic', body: <Treatment items={l.treatment} /> });
  }
  if (l.mnemonics.length > 0) sections.push({ key: 'mnemonics', label: 'mnemonics', body: <Mnemonics items={l.mnemonics} /> });
  if (l.traps.length > 0) {
    sections.push({ key: 'traps', label: 'exam_traps', tone: 'danger', meta: `${l.traps.length} failure case${l.traps.length === 1 ? '' : 's'}`, body: <Traps items={l.traps} /> });
  }
  if (l.quiz.length > 0) {
    sections.push({ key: 'recall', label: 'active_recall', meta: `${l.quiz.length} q`, body: <Quiz questions={l.quiz} moduleId={l.id} /> });
  }

  return (
    <div className="doc lecture-body">
      {sections.map((s, i) => (
        <section key={s.key} className="doc-section" aria-labelledby={`${l.id}--${s.key}`}>
          <SectionLabel id={`${l.id}--${s.key}`} no={pad2(i + 1)} tone={s.tone} meta={s.meta} toc={toc ? s.label : undefined} as="h3">
            {s.label}
          </SectionLabel>
          {s.body}
        </section>
      ))}
    </div>
  );
}
