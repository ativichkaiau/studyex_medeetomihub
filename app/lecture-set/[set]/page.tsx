import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { lectureSets, lectureSetBySlug, lectureSetRedirects, subjectOfSource, subjectSlug, subjectByCode, referenceFrameworkByCode } from '../../../content';
import LectureBody from '../../../components/LectureBody';
import ActiveIntegrationPanel from '../../../components/ActiveIntegrationPanel';
import ConceptModeController from '../../../components/concept/ConceptModeController';
import DocIndex from '../../../components/DocIndex';
import Page from '../../../components/ui/Page';
import Meta from '../../../components/ui/Meta';
import Cmd from '../../../components/ui/Cmd';
import { SeenCount, SeenMarker } from '../../../components/library/Seen';
import { onePagerForModule } from '../../../lib/concept/onepagerForModule';
import { getModuleBank } from '../../../lib/questions/bank';
import { lectureCode, lectureName, pad2, snake } from '../../../lib/paths';
import type { Crumb } from '../../../lib/paths';
import { pageMeta } from '../../../lib/meta';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return lectureSets.map((s) => ({ set: s.slug }));
}

export function generateMetadata({ params }: { params: { set: string } }) {
  const s = lectureSetBySlug[lectureSetRedirects[params.set] ?? params.set];
  if (!s) return { title: 'not found' };
  const where = [subjectOfSource[s.source], lectureCode(s.source)].filter(Boolean).join('/');
  const description = `${where} · ${s.items.length} module${s.items.length === 1 ? '' : 's'} on one study scroll: ${s.items.map((l) => l.title).join(', ')}.`;
  return pageMeta({ title: s.source, description, path: `/lecture-set/${s.slug}` });
}

// The whole lecture on one scroll — the primary study view. Every module in
// full, in order, each with its own concept-mode switch.
export default function LectureSetPage({ params }: { params: { set: string } }) {
  const redirect = lectureSetRedirects[params.set];
  if (redirect) permanentRedirect(`/lecture-set/${redirect}`);
  const set = lectureSetBySlug[params.set];
  if (!set) notFound();

  const subjectCode = subjectOfSource[set.source];
  const subject = subjectCode ? subjectByCode[subjectCode] : undefined;
  const framework = subjectCode ? referenceFrameworkByCode[subjectCode] : undefined;
  const unit = subject?.yearLabel === 'Reference' ? 'chapter' : 'lecture';
  const code = lectureCode(set.source);
  const ids = set.items.map((l) => l.id);
  const traps = set.items.reduce((n, l) => n + l.traps.length, 0);
  const questions = set.items.reduce((n, l) => n + getModuleBank(l.id).length, 0);

  const crumbs: Crumb[] = [
    { label: 'library', href: '/library' },
    ...(subjectCode ? [{ label: subjectCode, href: `/subject/${subjectSlug(subjectCode)}` }] : []),
    { label: code },
  ];

  return (
    <Page crumbs={crumbs} width="max-w-[1060px]" aside={<SeenCount ids={ids} label="seen " />}>
      <SeenMarker />
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-12">
        <article className="min-w-0">
          <header className="mb-10">
            <div className="kicker">
              <strong>{unit}</strong>
              <span>{[subjectCode, code].filter(Boolean).join('/')}</span>
              <span>·</span>
              <span>
                {set.items.length} module{set.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <h1 className="page-title">{lectureName(set.source)}</h1>
            <p className="page-lede">
              Every module of this {unit} on one scroll, in order. Switch a module&apos;s view to drill a single angle.
              {framework ? ` Original study notes aligned to ${framework.source}; read alongside the source chapter.` : ''}
            </p>
            <Meta
              className="mt-5"
              rows={[
                ...(subjectCode
                  ? ([
                      [
                        'block',
                        <Link key="b" href={`/subject/${subjectSlug(subjectCode)}`} className="xref">
                          {subjectCode}
                          {subject?.name ? ` — ${subject.name}` : ''}
                        </Link>,
                      ],
                    ] as [string, React.ReactNode][])
                  : []),
                [unit, `${code} — ${lectureName(set.source)}`],
                ['modules', String(set.items.length)],
                ['exam_traps', String(traps)],
                ['questions', questions.toLocaleString('en-US')],
                ['seen', <SeenCount key="s" ids={ids} />],
              ]}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/practice/lecture/${params.set}`} className="btn btn-primary">
                run practice <span aria-hidden="true">→</span>
              </Link>
              {subjectCode ? (
                <Link href={`/flashcards/block/${subjectSlug(subjectCode)}`} className="btn">
                  {subjectCode} cards <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>

            <nav aria-label="Modules in this lecture" className="mt-8 xl:hidden">
              <p className="label mb-2">modules</p>
              <ol className="tree">
                {set.items.map((l, i) => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} className="tree-row gap-2 pr-2" data-mid={l.id}>
                      <span className="tree-glyph">{i === set.items.length - 1 ? '└──' : '├──'}</span>
                      <span className="seen-dot" aria-hidden="true" />
                      <span className="font-sans text-[13.5px] text-fg">{l.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </header>

          <div className="grid gap-16">
            {set.items.map((l, i) => (
              <section key={l.id} id={l.id} data-toc={snake(l.id)} aria-labelledby={`${l.id}--title`} className="min-w-0">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-line-strong pt-7">
                  <div className="min-w-0">
                    <p className="kicker">
                      <span>
                        module {pad2(i + 1)}/{pad2(set.items.length)}
                      </span>
                      <span>·</span>
                      <span className="normal-case tracking-normal">{snake(l.id)}</span>
                    </p>
                    <h2 id={`${l.id}--title`} className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.015em] text-fg">
                      {l.title}
                    </h2>
                  </div>
                  <Cmd href={`/lecture/${l.id}`}>open module</Cmd>
                </div>
                <ConceptModeController lecture={l} onePager={onePagerForModule(l)}>
                  <LectureBody lecture={l} />
                </ConceptModeController>
                <ActiveIntegrationPanel moduleId={l.id} compact />
              </section>
            ))}
          </div>
        </article>

        <aside className="hidden xl:block" aria-label="Lecture index">
          <div className="sticky top-[calc(var(--pathbar-h)+28px)]">
            <DocIndex title="modules" />
          </div>
        </aside>
      </div>
    </Page>
  );
}
