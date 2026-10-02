import Link from 'next/link';
import SectionLabel from './ui/SectionLabel';
import type { LearningPathView, PathStep } from '../lib/integrations/learningPath';

// The suggested study route through this module: foundations before it,
// applications after. Server component, fully static.

function Node({ s, role }: { s: PathStep; role: 'before' | 'current' | 'after' }) {
  const label = role === 'before' ? 'review' : role === 'after' ? 'next' : 'current';
  const inner = (
    <>
      <span className={`block font-mono text-[10px] uppercase tracking-[0.08em] ${role === 'current' ? 'text-accent' : 'text-fg-3'}`}>
        {label}
        {s.subjectCode ? ` · ${s.subjectCode}` : ''}
      </span>
      <span className="mt-0.5 block text-[13px] font-medium leading-snug text-fg">{s.title}</span>
    </>
  );
  if (role === 'current') {
    return (
      <div className="w-full rounded-sm border border-accent/60 bg-accent/10 px-3 py-2 sm:w-[11.5rem]" aria-current="step">
        {inner}
      </div>
    );
  }
  return (
    <Link href={`/lecture/${s.id}`} className="block w-full rounded-sm border border-line bg-panel px-3 py-2 hover:border-line-strong hover:bg-raised sm:w-[11.5rem]" data-mid={s.id}>
      {inner}
    </Link>
  );
}

export default function LearningPath({ view, id }: { view: LearningPathView; id?: string }) {
  if (!view.hasPath) return null;

  const nodes: { s: PathStep; role: 'before' | 'current' | 'after' }[] = [
    ...view.before.map((s) => ({ s, role: 'before' as const })),
    { s: view.current, role: 'current' as const },
    ...view.after.map((s) => ({ s, role: 'after' as const })),
  ];

  return (
    <section className="doc-section mt-12" aria-labelledby={id}>
      <SectionLabel id={id} toc={id ? 'learning_path' : undefined} meta="suggested route">
        learning_path
      </SectionLabel>
      <ol className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:overflow-x-auto sm:pb-2">
        {nodes.map((n, i) => (
          <li key={`${n.role}-${n.s.id}`} className="flex flex-col items-stretch gap-1 sm:shrink-0 sm:flex-row sm:items-center">
            <Node s={n.s} role={n.role} />
            {i < nodes.length - 1 ? (
              <span aria-hidden="true" className="chain-arrow px-1 text-center">
                <span className="hidden sm:inline">→</span>
                <span className="sm:hidden">↓</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
