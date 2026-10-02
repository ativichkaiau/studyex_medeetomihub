import MechanismChain from '../MechanismChain';
import Quiz from '../Quiz';
import RecallGate from '../RecallGate';
import OnePagerModeView from './OnePagerModeView';
import SectionLabel from '../ui/SectionLabel';
import { Findings, Investigations, Traps, Treatment } from '../LectureSections';
import { buildQuickReview, buildTeaching } from '../../lib/concept/modes';
import { pad2 } from '../../lib/paths';
import type { ConceptDepth, OnePagerSections } from '../../lib/concept/types';
import type { Lecture } from '../../lib/types';

// Renders the focused view for a NON-standard concept mode. A pure projection of
// the Lecture (+ pre-built OnePager sections), drawn with the same section
// renderers as the full module.

interface Block {
  key: string;
  label: string;
  tone?: 'danger';
  meta?: string;
  body: React.ReactNode;
}

function Blocks({ id, blocks, toc }: { id: string; blocks: Block[]; toc: boolean }) {
  return (
    <div className="doc">
      {blocks.map((b, i) => (
        <section key={b.key} className="doc-section" aria-labelledby={`${id}--${b.key}`}>
          <SectionLabel id={`${id}--${b.key}`} no={pad2(i + 1)} tone={b.tone} meta={b.meta} toc={toc ? b.label : undefined} as="h3">
            {b.label}
          </SectionLabel>
          {b.body}
        </section>
      ))}
    </div>
  );
}

export default function ConceptModeContentView({
  lecture: l,
  mode,
  onePager,
  toc = false,
}: {
  lecture: Lecture;
  mode: ConceptDepth;
  onePager: OnePagerSections;
  toc?: boolean;
}) {
  if (mode === 'onepager') return <OnePagerModeView onePager={onePager} id={l.id} toc={toc} />;

  if (mode === 'quick_review') {
    return (
      <Blocks
        id={l.id}
        toc={toc}
        blocks={[
          {
            key: 'quick',
            label: 'quick_review',
            meta: 'lead sentence of each high-yield point',
            body: (
              <RecallGate>
                <ul className="doc-list">
                  {buildQuickReview(l).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </RecallGate>
            ),
          },
        ]}
      />
    );
  }

  if (mode === 'mechanism') {
    return <Blocks id={l.id} toc={toc} blocks={[{ key: 'mechanism', label: 'mechanism', body: <MechanismChain chain={l.mechanism} /> }]} />;
  }

  if (mode === 'clinical') {
    return (
      <Blocks
        id={l.id}
        toc={toc}
        blocks={[
          { key: 'findings', label: 'exam_findings', body: <Findings items={l.examFindings} /> },
          { key: 'investigations', label: 'investigations', body: <Investigations items={l.investigations} /> },
          { key: 'treatment', label: 'treatment_logic', body: <Treatment items={l.treatment} /> },
        ]}
      />
    );
  }

  if (mode === 'trap') {
    const blocks: Block[] = [
      { key: 'traps', label: 'exam_traps', tone: 'danger', meta: `${l.traps.length} failure case${l.traps.length === 1 ? '' : 's'}`, body: <Traps items={l.traps} /> },
    ];
    if (l.quiz.length > 0) blocks.push({ key: 'test', label: 'test_the_trap', body: <Quiz questions={l.quiz} moduleId={l.id} /> });
    return <Blocks id={l.id} toc={toc} blocks={blocks} />;
  }

  // teaching
  return (
    <Blocks
      id={l.id}
      toc={toc}
      blocks={[
        {
          key: 'teaching',
          label: 'teaching',
          meta: 'explain it to a junior',
          body: (
            <ol className="doc-ol">
              {buildTeaching(l).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          ),
        },
      ]}
    />
  );
}
