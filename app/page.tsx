import Link from 'next/link';
import { curriculum, lectureById, lectures, lecturesBySubject, referenceFrameworkByCode, subjectOfSource, lectureSetSlug } from '../content';
import { onePagerGroups } from '../content/onepagers';
import Page from '../components/ui/Page';
import Panel from '../components/ui/Panel';
import Cmd from '../components/ui/Cmd';
import { NAV } from '../components/shell/nav';
import RecentContext from '../components/overview/RecentContext';
import SessionStatus from '../components/overview/SessionStatus';
import LiveCount from '../components/overview/LiveCount';
import { BRAND, BUILD } from '../lib/brand';
import { INDEX_STATS, TRAP_COUNT } from '../lib/indexStats';
import { getModuleBank } from '../lib/questions/bank';
import { lectureCode, snake, yearCode } from '../lib/paths';

export default function Overview() {
  const questions = lectures.reduce((n, l) => n + getModuleBank(l.id).length, 0);
  const featured = lectureById['tetralogy-of-fallot'] ?? lectures[0];
  const featuredCode = subjectOfSource[featured.source];

  // Per-year index: how much of each year is actually indexed.
  const years = curriculum.map((y) => {
    const blocks = y.subjects.length;
    const indexed = y.subjects.filter((s) => (lecturesBySubject[s.code]?.length ?? 0) > 0 || referenceFrameworkByCode[s.code]).length;
    const modules = y.subjects.reduce((n, s) => n + (lecturesBySubject[s.code]?.length ?? 0), 0);
    return { year: y.year, label: y.label, code: yearCode(y.year, y.label), blocks, indexed, modules };
  });
  const onePagerFolders = onePagerGroups.filter((g) => g.driveUrl).length;

  return (
    <Page crumbs={[{ label: 'overview' }]} aside={<span>build {BUILD.date || '—'} · {BUILD.sha}</span>}>
      <header>
        <div className="kicker">
          <strong>{BRAND.tagline}</strong>
          <span>·</span>
          <span>
            build {BUILD.date || '—'} · {BUILD.sha}
          </span>
        </div>
        <h1 className="mt-3 break-all font-mono text-[26px] font-semibold leading-tight tracking-[-0.03em] text-fg sm:text-[40px]">
          {BRAND.name}
          <span className="text-accent">_</span>
        </h1>
        <SessionStatus />
      </header>

      <div className="gridlines mt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="ops" className="p-5">
          <h2 id="ops" className="label mb-3">
            <span className="text-accent">&gt;</span> select operation
          </h2>
          <ul className="-mx-2 grid">
            {NAV.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="tree-row grid grid-cols-[112px_minmax(0,1fr)_auto] gap-3 px-2 py-1.5 text-fg-2"
                >
                  <span className="font-mono text-[13px] text-fg">
                    [ {item.label} ]
                  </span>
                  <span className="truncate font-sans text-[13px] text-fg-3">{item.hint}</span>
                  <span className="font-mono text-[10.5px] text-fg-3">g {item.key}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sysidx" className="p-5">
          <h2 id="sysidx" className="label mb-3">
            system_index
          </h2>
          <dl className="kv">
            <dt>blocks</dt>
            <dd className="tabular">{INDEX_STATS.blocks}</dd>
            <dt>lectures</dt>
            <dd className="tabular">{INDEX_STATS.lectures.toLocaleString('en-US')}</dd>
            <dt>modules</dt>
            <dd className="tabular">{INDEX_STATS.modules.toLocaleString('en-US')}</dd>
            <dt>exam_traps</dt>
            <dd className="tabular">{TRAP_COUNT.toLocaleString('en-US')}</dd>
            <dt>questions</dt>
            <dd className="tabular">{questions.toLocaleString('en-US')}</dd>
            <dt>seen</dt>
            <dd>
              <LiveCount of="seen" /> <span className="dim">modules · this device</span>
            </dd>
            <dt>saved</dt>
            <dd>
              <LiveCount of="saved" />
            </dd>
            <dt>repair</dt>
            <dd>
              <LiveCount of="repair" />
            </dd>
          </dl>
        </section>

        <section aria-labelledby="ctx" className="p-5">
          <h2 id="ctx" className="label mb-3">
            recent_context
          </h2>
          <RecentContext />
        </section>

        <section aria-labelledby="featured" className="p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="featured" className="label">
              featured_module
            </h2>
            <span className="font-mono text-[11px] text-fg-3">
              {[featuredCode, lectureCode(featured.source)].filter(Boolean).join('/')}
            </span>
          </div>
          <p className="text-[17px] font-medium leading-snug text-fg">
            <Link href={`/lecture/${featured.id}`} className="hover:text-accent">
              {featured.title}
            </Link>
          </p>
          <p className="mt-1 font-mono text-[11.5px] text-fg-3"># {snake(featured.id)} · mechanism</p>
          <ol className="chain-vertical mt-4" aria-label={featured.mechanism.title}>
            {featured.mechanism.steps.slice(0, 4).map((step, i, all) => (
              <li key={step.id} className="grid justify-items-start gap-0.5">
                <span className="chain-node" data-emphasis={step.emphasis ?? 'normal'}>
                  {step.label}
                </span>
                {i < all.length - 1 ? (
                  <span className="chain-arrow pl-3.5" aria-hidden="true">
                    ↓
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <Cmd href={`/lecture/${featured.id}`}>open module</Cmd>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel label="index by year" meta={<Cmd href="/library">library</Cmd>} bodyClassName="">
          <div className="row row-head" style={{ ['--cols' as string]: '56px minmax(0,1fr) 90px 80px' }}>
            <span>year</span>
            <span>scope</span>
            <span className="text-right">indexed</span>
            <span className="text-right">modules</span>
          </div>
          {years.map((y) => (
            <Link
              key={y.year}
              href={`/library#${y.code.toLowerCase()}`}
              className={`row ${y.indexed === 0 ? 'row-dim' : ''}`}
              style={{ ['--cols' as string]: '56px minmax(0,1fr) 90px 80px' }}
            >
              <span className="cell-id">{y.code}</span>
              <span className="cell-title text-fg-2">{y.label === 'Reference' ? 'reference texts' : `${y.blocks} blocks`}</span>
              <span className="cell-num">
                {y.indexed}/{y.blocks}
              </span>
              <span className="cell-num">{y.modules.toLocaleString('en-US')}</span>
            </Link>
          ))}
        </Panel>

        <Panel label="onepager_archive" meta={<Cmd href="/library/onepagers">open</Cmd>}>
          <dl className="kv">
            <dt>source</dt>
            <dd>google drive · external</dd>
            <dt>folders</dt>
            <dd>
              {onePagerFolders} linked <span className="dim">· {onePagerGroups.length - onePagerFolders} pending</span>
            </dd>
            <dt>subjects</dt>
            <dd>{onePagerGroups.reduce((n, g) => n + g.subjects.length, 0)}</dd>
            <dt>role</dt>
            <dd>compiled summaries · this index supplements them</dd>
          </dl>
        </Panel>
      </div>

      <p className="mt-8 font-mono text-[11.5px] text-fg-3">
        # start anywhere: <Link href={`/lecture-set/${lectureSetSlug(featured.source)}`} className="xref">{featuredCode ? `${featuredCode}/` : ''}{lectureCode(featured.source)}</Link>{' '}
        or press <kbd className="kbd">⌘K</kbd> to search {INDEX_STATS.modules.toLocaleString('en-US')} modules.
      </p>
    </Page>
  );
}
