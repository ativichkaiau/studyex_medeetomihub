import Link from 'next/link';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import {
  lecturesBySubject,
  subjectBySlug,
  subjectSlug,
  lectureSetSlug,
  partOfSource,
  referenceFrameworkByCode,
} from '../../../content';
import { onePagerGroups } from '../../../content/onepagers';
import { buildBlockGraph } from '../../../lib/integrations/graphView';
import { keystonesForSubject } from '../../../lib/integrations/centrality';
import { getModuleBank } from '../../../lib/questions/bank';
import { stripMarkup } from '../../../lib/concept/modes';
import { lectureCode, lectureName, pad2, yearCode } from '../../../lib/paths';
import BlockMap from '../../../components/BlockMap';
import Page from '../../../components/ui/Page';
import PageHeader from '../../../components/ui/PageHeader';
import Panel from '../../../components/ui/Panel';
import Meta from '../../../components/ui/Meta';
import { SeenCount, SeenMarker } from '../../../components/library/Seen';
import type { Lecture } from '../../../lib/types';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...new Set([...Object.keys(lecturesBySubject), ...Object.keys(referenceFrameworkByCode)])].map((code) => ({ code: subjectSlug(code) }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const s = subjectBySlug[params.code];
  return { title: s ? `${s.code} ${s.name}` : 'block' };
}

const LECTURE_COLS = '64px minmax(0,1fr) auto 56px';

export default function SubjectPage({ params }: { params: { code: string } }) {
  const subject = subjectBySlug[params.code];
  if (!subject) notFound();

  const items = lecturesBySubject[subject.code] ?? [];
  const framework = referenceFrameworkByCode[subject.code];
  if (items.length === 0 && !framework) notFound();

  const block = buildBlockGraph(subject.code);
  const keystones = keystonesForSubject(subject.code, 4);

  // Group this subject's modules by source lecture (L1 → Ln).
  const groups = items.reduce<Record<string, Lecture[]>>((acc, l) => {
    (acc[l.source] ??= []).push(l);
    return acc;
  }, {});
  const sources = Object.entries(groups).sort(([a], [b]) => {
    // "Additional Topics" always sorts to the very end of the block.
    const aAdd = a.startsWith('Additional Topics');
    const bAdd = b.startsWith('Additional Topics');
    if (aAdd !== bAdd) return aAdd ? 1 : -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  // Group sources into parts (e.g. HGA Part 1–5) while preserving order.
  // Subjects without a part mapping fall into one unlabelled group.
  const partedGroups: { part: string | undefined; sources: typeof sources }[] = [];
  for (const entry of sources) {
    const part = partOfSource[entry[0]];
    const last = partedGroups[partedGroups.length - 1];
    if (last && last.part === part) last.sources.push(entry);
    else partedGroups.push({ part, sources: [entry] });
  }
  const chaptersByNumber = new Map(framework?.chapters.map((chapter) => [chapter.number, chapter]));
  const isFrameworkOnly = Boolean(framework && items.length === 0);
  const unitLabel = subject.yearLabel === 'Reference' ? 'chapter' : 'lecture';
  const lectureCount = sources.filter(([s]) => !s.startsWith('Additional Topics')).length;
  const traps = items.reduce((n, l) => n + l.traps.length, 0);
  const questions = items.reduce((n, l) => n + getModuleBank(l.id).length, 0);
  const onePager = onePagerGroups.find((g) => g.subjects.some((s) => s.code === subject.code));
  const allIds = items.map((l) => l.id);

  return (
    <Page
      crumbs={[{ label: 'library', href: '/library' }, { label: subject.code }]}
      aside={items.length ? <SeenCount ids={allIds} label="seen " /> : undefined}
    >
      <SeenMarker />
      <PageHeader
        kicker={
          <>
            <strong>block</strong>
            <span>{yearCode(subject.year, subject.yearLabel)}</span>
            <span>·</span>
            <span>{isFrameworkOnly ? 'reading spine' : 'indexed'}</span>
          </>
        }
        title={subject.name}
        lede={
          isFrameworkOnly
            ? 'Reference outline only — chapter notes and practice questions will follow.'
            : framework
              ? `Original study notes aligned to ${framework.source}. Each ${unitLabel} opens as one study scroll; read alongside the source chapter.`
              : `Each ${unitLabel} opens as one study scroll; each module opens on its own for focused recall.`
        }
        className="mb-6"
      >
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Meta
            rows={[
              ['block_id', subject.code],
              ['year', subject.yearLabel === 'Reference' ? 'reference' : pad2(subject.year)],
              [`${unitLabel}s`, framework ? `${lectureCount} / ${framework.chapters.length} with notes` : String(lectureCount)],
              ['modules', String(items.length)],
              ...(items.length
                ? ([
                    ['exam_traps', String(traps)],
                    ['questions', questions.toLocaleString('en-US')],
                    ['seen', <SeenCount key="seen" ids={allIds} />],
                  ] as [string, React.ReactNode][])
                : []),
              ...(onePager
                ? ([
                    [
                      'onepagers',
                      onePager.driveUrl ? (
                        <a key="op" href={onePager.driveUrl} target="_blank" rel="noopener noreferrer" className="xref">
                          drive · {onePager.term.toLowerCase()} ↗
                        </a>
                      ) : (
                        <span key="op" className="dim">pending</span>
                      ),
                    ],
                  ] as [string, React.ReactNode][])
                : []),
            ]}
          />
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Link href={`/practice/block/${params.code}`} className="btn btn-primary">
                run practice <span aria-hidden="true">→</span>
              </Link>
              <Link href={`/flashcards/block/${params.code}`} className="btn">
                load cards <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}
        </div>
      </PageHeader>

      {framework ? (
        <Panel
          label="reading_spine"
          title={framework.title}
          meta={<span className="tag">{framework.edition}</span>}
          className="mb-8"
          bodyClassName=""
        >
          <p className="max-w-3xl px-4 pt-4 text-[13.5px] leading-6 text-fg-2">{framework.description}</p>
          <div className="grid gap-6 p-4">
            {framework.units.map((unit, unitIndex) => (
              <section key={unit.id}>
                <h3 className="sec-label mb-2">
                  <span className="sec-no">UNIT_{pad2(unitIndex + 1)}</span>
                  <span className="normal-case tracking-normal">{unit.title}</span>
                </h3>
                <p className="mb-3 text-[12.5px] leading-5 text-fg-3">{unit.description}</p>
                <ol className="rows">
                  {unit.chapters.map((number) => {
                    const chapter = chaptersByNumber.get(number);
                    if (!chapter) return null;
                    const source = `Ch ${chapter.number} — ${chapter.title}`;
                    const modules = groups[source];
                    const inner = (
                      <>
                        <span className="cell-id">CH{pad2(chapter.number)}</span>
                        <span className="cell-title">
                          <span className="block">{chapter.title}</span>
                          <span className="cell-sub font-sans text-[12px]">{chapter.focus}</span>
                        </span>
                        <span className="cell-num">
                          {modules ? `${modules.length} mod · ${modules.reduce((n, m) => n + m.quiz.length, 0)} q` : 'outline'}
                        </span>
                      </>
                    );
                    const id = `framework-${framework.code.toLowerCase()}-chapter-${chapter.number}`;
                    return (
                      <li key={chapter.number} id={id} className="scroll-mt-24">
                        {modules ? (
                          <Link href={`/lecture-set/${lectureSetSlug(source)}`} className="row" style={{ ['--cols' as string]: '56px minmax(0,1fr) auto' }}>
                            {inner}
                          </Link>
                        ) : (
                          <div className="row row-dim" style={{ ['--cols' as string]: '56px minmax(0,1fr) auto' }}>
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </Panel>
      ) : null}

      {(block.nodes.length >= 2 && block.hasEdges) || keystones.length > 0 ? (
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {block.nodes.length >= 2 && block.hasEdges ? (
            <Panel label="block_graph" meta={`how the ${unitLabel}s connect`}>
              <BlockMap view={block} unitLabel={unitLabel} />
            </Panel>
          ) : null}
          {keystones.length > 0 ? (
            <Panel label="keystones" meta="study these first" bodyClassName="">
              <p className="px-4 pb-1 pt-3 text-[12.5px] leading-5 text-fg-3">The most connected modules in this block — the hubs the rest lean on.</p>
              <ol className="mt-1">
                {keystones.map((k, i) => (
                  <li key={k.id} className="border-t border-line first:border-t-0">
                    <Link href={`/lecture/${k.id}`} className="row border-0" style={{ ['--cols' as string]: '28px minmax(0,1fr) auto' }} data-mid={k.id}>
                      <span className="font-mono text-[11px] text-fg-3">{pad2(i + 1)}</span>
                      <span className="cell-title truncate">{k.title}</span>
                      <span className="cell-num" title={`${k.inbound} module${k.inbound === 1 ? '' : 's'} link here`}>
                        {k.inbound > 0 ? `← ${k.inbound}` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}
        </div>
      ) : null}

      {items.length > 0 ? (
        <section aria-labelledby="lecture-index">
          <h2 id="lecture-index" className="sec-label">
            <span>{unitLabel}_index</span>
            <span className="sec-meta">
              {lectureCount} {unitLabel}s · {items.length} modules
            </span>
          </h2>
          <div className="rows">
            {partedGroups.map((group, gi) => (
              <Fragment key={group.part ?? `_${gi}`}>
                {group.part ? <div className="row row-group">{group.part}</div> : null}
                {group.sources.map(([source, lects]) => {
                  const isAdditional = source.startsWith('Additional Topics');
                  const ids = lects.map((l) => l.id);
                  const lectureTraps = lects.reduce((n, l) => n + l.traps.length, 0);
                  return (
                    <div key={source} className="border-t border-line first:border-t-0">
                      {isAdditional ? <div className="row row-group">supplementary · beyond the core lecture list</div> : null}
                      <Link
                        href={`/lecture-set/${lectureSetSlug(source)}`}
                        className="row group border-t-0"
                        style={{ ['--cols' as string]: LECTURE_COLS }}
                      >
                        <span className="cell-id">{lectureCode(source)}</span>
                        <span className="cell-title font-medium">
                          {lectureName(source)}
                          <span className="cell-sub block sm:hidden">
                            {lects.length} mod · {lectureTraps} traps · seen <SeenCount ids={ids} />
                          </span>
                        </span>
                        <span className="cell-num hidden sm:block">
                          {pad2(lects.length)} mod · {pad2(lectureTraps)} traps · seen <SeenCount ids={ids} />
                        </span>
                        <span className="cell-go">
                          open <span className="cmd-arrow">→</span>
                        </span>
                      </Link>
                      <ul className="tree pb-2 pl-3.5 pr-3.5 sm:pl-[94px]">
                        {lects.map((l, i) => (
                          <li key={l.id}>
                            <Link
                              href={`/lecture-set/${lectureSetSlug(l.source)}#${l.id}`}
                              className="tree-row gap-2 pr-2"
                              data-mid={l.id}
                              title={l.id}
                            >
                              <span className="tree-glyph">{i === lects.length - 1 ? '└──' : '├──'}</span>
                              <span className="seen-dot" aria-hidden="true" />
                              <span className="min-w-0 flex-none font-sans text-[13.5px] text-fg sm:max-w-[48%] sm:truncate">{l.title}</span>
                              <span className="hidden min-w-0 flex-1 truncate font-sans text-[12.5px] text-fg-3 md:block">
                                {l.highYield[0] ? stripMarkup(l.highYield[0]) : ''}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-fg-3"># ● = opened on this device · modules open inside their {unitLabel} scroll</p>
        </section>
      ) : null}
    </Page>
  );
}
