import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lecturesBySubject, subjectBySlug, subjectSlug, lectureSetSlug } from '../../../../content';
import { getModuleBank } from '../../../../lib/questions/bank';
import Page from '../../../../components/ui/Page';
import PageHeader from '../../../../components/ui/PageHeader';
import Meta from '../../../../components/ui/Meta';
import { lectureCode, lectureName } from '../../../../lib/paths';
import { pageMeta } from '../../../../lib/meta';

// Every valid page is generated at build time; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(lecturesBySubject).map((code) => ({ code: subjectSlug(code) }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const s = subjectBySlug[params.code];
  if (!s) return { title: 'not found' };
  const mods = lecturesBySubject[s.code] ?? [];
  const total = mods.reduce((n, m) => n + getModuleBank(m.id).length, 0);
  return pageMeta({
    title: `practice: ${s.code}`,
    description: `Practise ${s.code} ${s.name}: ${total.toLocaleString('en-US')} questions across ${new Set(mods.map((m) => m.source)).size} lectures, one lecture at a time or mixed.`,
    path: `/practice/block/${params.code}`,
  });
}

function lectureNo(source: string): number {
  const m = source.match(/^(?:L|Ch\s+)(\d+)/i);
  return m ? parseInt(m[1], 10) : 999;
}

const COLS = '64px minmax(0,1fr) 72px 80px 48px';
const COLS_SM = '64px minmax(0,1fr) 32px';

export default function BlockPracticeLauncher({ params }: { params: { code: string } }) {
  const subject = subjectBySlug[params.code];
  if (!subject) notFound();
  const unit = subject.yearLabel === 'Reference' ? 'chapter' : 'lecture';

  // Group the block's modules into their lectures (source), with question counts.
  const bySource = new Map<string, { items: { id: string }[]; count: number }>();
  for (const m of lecturesBySubject[subject.code] ?? []) {
    const entry = bySource.get(m.source) ?? { items: [], count: 0 };
    entry.items.push(m);
    entry.count += getModuleBank(m.id).length;
    bySource.set(m.source, entry);
  }
  const lectures = [...bySource.entries()]
    .map(([source, e]) => ({ source, slug: lectureSetSlug(source), moduleCount: e.items.length, count: e.count, no: lectureNo(source) }))
    .sort((a, b) => a.no - b.no);
  const total = lectures.reduce((n, l) => n + l.count, 0);
  const modules = lectures.reduce((n, l) => n + l.moduleCount, 0);

  return (
    <Page crumbs={[{ label: 'practice', href: '/practice' }, { label: subject.code }]} width="w-mid">
      <PageHeader
        kicker={
          <>
            <strong>practice</strong>
            <span>{subject.code}</span>
            <span>·</span>
            <span>select scope</span>
          </>
        }
        title={subject.name}
        lede={`Run the whole block as a mixed set, or narrow the scope to one ${unit}.`}
      >
        <Meta
          className="mt-5"
          rows={[
            ['pool', `${total.toLocaleString('en-US')} questions`],
            [`${unit}s`, String(lectures.length)],
            ['modules', String(modules)],
          ]}
        />
      </PageHeader>

      <Link href={`/practice/block/${params.code}/all`} className="panel group mb-8 flex flex-wrap items-center justify-between gap-3 p-4 hover:border-line-strong hover:bg-raised">
        <span className="min-w-0">
          <span className="label block text-accent">scope: {subject.code}/*</span>
          <span className="mt-1 block text-[15px] font-medium text-fg">Mixed — the whole block</span>
          <span className="mt-0.5 block font-mono text-[11.5px] text-fg-3">
            20 random from {lectures.length} {unit}s · {total.toLocaleString('en-US')} in the pool
          </span>
        </span>
        <span className="btn btn-primary">
          run <span aria-hidden="true">→</span>
        </span>
      </Link>

      <h2 className="sec-label">
        <span>scope: {unit}</span>
        <span className="sec-meta">{lectures.length}</span>
      </h2>
      <div className="rows" style={{ ['--cols-lg' as string]: COLS, ['--cols-sm' as string]: COLS_SM }}>
        <div className="row row-head [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
          <span>id</span>
          <span>{unit}</span>
          <span className="hidden text-right sm:block">modules</span>
          <span className="hidden text-right sm:block">questions</span>
          <span />
        </div>
        {lectures.map((l) => (
          <Link key={l.slug} href={`/practice/lecture/${l.slug}`} className="row group [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
            <span className="cell-id">{lectureCode(l.source)}</span>
            <span className="cell-title">
              <span className="block truncate">{lectureName(l.source)}</span>
              <span className="cell-sub sm:hidden">
                {l.count.toLocaleString('en-US')} q · {l.moduleCount} modules
              </span>
            </span>
            <span className="cell-num hidden sm:block">{l.moduleCount}</span>
            <span className="cell-num hidden sm:block">{l.count.toLocaleString('en-US')}</span>
            <span className="cell-go">
              <span className="cmd-arrow">→</span>
            </span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
