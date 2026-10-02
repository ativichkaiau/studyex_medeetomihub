'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';

export interface BlockRow {
  code: string;
  name: string;
  slug: string;
  year: string; // Y1 · Y2 · Y3 · REF
  yearLabel: string;
  lectures: number;
  modules: number;
  traps: number;
  status: 'indexed' | 'framework' | 'partial' | 'empty';
  unit: 'lecture' | 'chapter';
  chapters?: number;
}

const FILTER_KEY = 'wh-library-filter';
const COLS = '84px minmax(0,1fr) 64px 64px 64px 96px 64px';
const COLS_SM = '72px minmax(0,1fr) 40px';

const STATUS: Record<BlockRow['status'], { label: string; cls: string }> = {
  indexed: { label: 'indexed', cls: 'tag tag-accent' },
  partial: { label: 'partial', cls: 'tag' },
  framework: { label: 'spine', cls: 'tag' },
  empty: { label: 'not indexed', cls: 'tag tag-muted' },
};

function Row({ b }: { b: BlockRow }) {
  const counts =
    b.status === 'framework'
      ? `${b.chapters ?? 0} chapters · outline`
      : `${b.lectures} ${b.unit}${b.lectures === 1 ? '' : 's'} · ${b.modules} modules`;
  const body = (
    <>
      <span className="cell-id">{b.code}</span>
      <span className="cell-title">
        <span className="block sm:truncate">{b.name}</span>
        <span className="cell-sub sm:hidden">{b.status === 'empty' ? 'not indexed' : counts}</span>
      </span>
      <span className="cell-num hidden sm:block">{b.status === 'empty' ? '—' : b.lectures}</span>
      <span className="cell-num hidden sm:block">{b.status === 'empty' ? '—' : b.modules}</span>
      <span className="cell-num hidden sm:block">{b.status === 'empty' ? '—' : b.traps}</span>
      <span className="hidden sm:block">
        <span className={STATUS[b.status].cls}>{STATUS[b.status].label}</span>
      </span>
      <span className="cell-go">
        {b.status === 'empty' ? null : (
          <>
            <span className="hidden opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:inline">open </span>
            <span className="cmd-arrow">→</span>
          </>
        )}
      </span>
    </>
  );
  if (b.status === 'empty') {
    return (
      <div className="row row-dim [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]" aria-label={`${b.code} — not indexed yet`}>
        {body}
      </div>
    );
  }
  return (
    <Link href={`/subject/${b.slug}`} className="row group [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
      {body}
    </Link>
  );
}

// The repository index: every block in the curriculum, filterable by year.
// The filter is remembered on this device; #y3 in the URL selects a year.
export default function BlockTable({ rows, years }: { rows: BlockRow[]; years: { code: string; label: string }[] }) {
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const restore = () => {
      const fromHash = window.location.hash.slice(1).toUpperCase();
      if (years.some((y) => y.code === fromHash)) {
        setFilter(fromHash);
        return;
      }
      try {
        const saved = localStorage.getItem(FILTER_KEY);
        setFilter(saved && years.some((y) => y.code === saved) ? saved : 'all');
      } catch {
        setFilter('all');
      }
    };
    restore();
    window.addEventListener('hashchange', restore);
    window.addEventListener('popstate', restore);
    return () => {
      window.removeEventListener('hashchange', restore);
      window.removeEventListener('popstate', restore);
    };
  }, [years]);

  const pick = (next: string) => {
    setFilter(next);
    try {
      localStorage.setItem(FILTER_KEY, next);
    } catch {}
    history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}${next === 'all' ? '' : `#${next.toLowerCase()}`}`);
  };

  const visible = filter === 'all' ? rows : rows.filter((r) => r.year === filter);
  const groups = (filter === 'all' ? years : years.filter((y) => y.code === filter)).map((y) => ({
    ...y,
    rows: visible.filter((r) => r.year === y.code),
  }));

  return (
    <div style={{ ['--cols-lg' as string]: COLS, ['--cols-sm' as string]: COLS_SM }}>
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by year">
        <span className="mr-1 font-mono text-[11px] text-fg-3">filter:</span>
        {[{ code: 'all', label: 'all' }, ...years].map((y) => (
          <button key={y.code} type="button" className="chip" aria-pressed={filter === y.code} onClick={() => pick(y.code)}>
            {y.code === 'all' ? 'all' : y.code}
            <span className="chip-n">{y.code === 'all' ? rows.length : rows.filter((r) => r.year === y.code).length}</span>
          </button>
        ))}
      </div>

      <div className="rows">
        <div className="row row-head [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
          <span>id</span>
          <span>block</span>
          <span className="hidden text-right sm:block">lect</span>
          <span className="hidden text-right sm:block">mod</span>
          <span className="hidden text-right sm:block">traps</span>
          <span className="hidden sm:block">status</span>
          <span />
        </div>
        {groups.map((g) => (
          <Fragment key={g.code}>
            <div className="row row-group">
              <span>
                {g.code} · {g.label.toLowerCase()} · {g.rows.filter((r) => r.status !== 'empty').length}/{g.rows.length} indexed
              </span>
            </div>
            {g.rows.map((b) => (
              <Row key={b.code} b={b} />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
