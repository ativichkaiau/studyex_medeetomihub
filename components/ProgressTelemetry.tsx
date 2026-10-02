'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { getVisited, getStreak, getQuizStats } from '../lib/user/activity';
import { getBookmarks } from '../lib/user/bookmarks';
import { getRepairQueue } from '../lib/repair/store';
import { getActivity, type ActivityEvent } from '../lib/user/eventLog';
import { readJSON } from '../lib/user/store';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../lib/searchIndex';
import { lectureCode, snake } from '../lib/paths';
import { clock, isoDay } from '../lib/time';
import EmptyState from './ui/EmptyState';

export interface SubjectMeta {
  code: string;
  name: string;
  slug: string;
  year: number;
  total: number;
  keystones?: { id: string; title: string }[];
}

interface Row extends SubjectMeta {
  covered: number;
  pct: number;
  acc: number | null;
  answered: number;
  repairs: number;
}

interface Totals {
  modules: number;
  covered: number;
  pct: number;
  started: number;
  complete: number;
  answered: number;
  correct: number;
  repairs: number;
  saved: number;
  cards: number;
  streak: number;
  best: number;
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'danger' | 'ok' }) {
  return (
    <div className="p-4">
      <div className="label">{label}</div>
      <div className={`mt-1.5 font-mono text-[22px] font-medium tabular-nums leading-none ${tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : 'text-fg'}`}>{value}</div>
      {sub ? <div className="mt-1.5 font-mono text-[11px] text-fg-3">{sub}</div> : null}
    </div>
  );
}

const EVENT_VERB: Record<ActivityEvent['type'], string> = {
  'module.open': 'open',
  'recall.answer': 'recall',
  'practice.complete': 'practice',
  'cards.complete': 'cards',
  'repair.queue': 'repair+',
  'repair.resolve': 'resolved',
};

function describe(e: ActivityEvent, byId: Record<string, IndexEntry>): { path: string; text: string; href?: string } {
  const mod = e.ref ? byId[e.ref] : undefined;
  const modulePath = e.ref ? [mod?.s, mod?.sub ? lectureCode(mod.sub) : null, snake(e.ref)].filter(Boolean).join('/') : '';
  switch (e.type) {
    case 'module.open':
      return { path: modulePath, text: mod?.t ?? '', href: e.ref ? `/lecture/${e.ref}` : undefined };
    case 'recall.answer':
      return { path: modulePath, text: `answered ${e.n ?? 0} recall question${e.n === 1 ? '' : 's'} · ${e.ok ?? 0} correct`, href: e.ref ? `/lecture/${e.ref}` : undefined };
    case 'practice.complete':
      return { path: e.ref ?? 'session', text: `${e.ok ?? 0}/${e.n ?? 0} correct` };
    case 'cards.complete':
      return { path: e.ref ?? 'deck', text: `${e.ok ?? 0}/${e.n ?? 0} good` };
    case 'repair.queue':
      return { path: e.ref ?? 'session', text: `${e.n ?? 0} miss${e.n === 1 ? '' : 'es'} queued for repair`, href: '/repair' };
    case 'repair.resolve':
      return { path: modulePath, text: 'repair resolved', href: '/repair' };
  }
}

export default function ProgressTelemetry({ subjects }: { subjects: SubjectMeta[] }) {
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [t, setT] = useState<Totals | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [byId, setById] = useState<Record<string, IndexEntry>>({});

  useEffect(() => {
    const visited = new Set(getVisited());
    const quiz = getQuizStats();
    const repair = getRepairQueue();
    const saved = getBookmarks().length;
    const streak = getStreak();
    const cards = readJSON<{ studied?: number }>('wh-flashcards', {}).studied ?? 0;
    setEvents(getActivity().slice().reverse().slice(0, 40));

    loadSearchIndex()
      .then((index) => {
        const modules = moduleEntries(index);
        setById(modules);
        const idToSubject: Record<string, string> = {};
        for (const [id, e] of Object.entries(modules)) if (e.s) idToSubject[id] = e.s;

        const covered: Record<string, number> = {};
        for (const id of visited) {
          const c = idToSubject[id];
          if (c) covered[c] = (covered[c] || 0) + 1;
        }

        const quizBy: Record<string, { c: number; a: number }> = {};
        let answered = 0;
        let correct = 0;
        for (const [id, qs] of Object.entries(quiz)) {
          const c = idToSubject[id];
          for (const ok of Object.values(qs)) {
            answered++;
            if (ok) correct++;
          }
          if (!c) continue;
          const agg = (quizBy[c] ??= { c: 0, a: 0 });
          for (const ok of Object.values(qs)) {
            agg.a++;
            if (ok) agg.c++;
          }
        }

        const repairBy: Record<string, number> = {};
        let openRepairs = 0;
        for (const it of repair) {
          if (it.completed_at) continue;
          openRepairs++;
          repairBy[it.subject_id] = (repairBy[it.subject_id] || 0) + 1;
        }

        const rws: Row[] = subjects
          .map((s) => {
            const cov = covered[s.code] || 0;
            const q = quizBy[s.code];
            return {
              ...s,
              covered: cov,
              pct: s.total ? Math.round((cov / s.total) * 100) : 0,
              acc: q && q.a ? Math.round((q.c / q.a) * 100) : null,
              answered: q?.a ?? 0,
              repairs: repairBy[s.code] || 0,
            };
          })
          .sort((a, b) => b.pct - a.pct || b.covered - a.covered || a.code.localeCompare(b.code));

        const total = subjects.reduce((n, s) => n + s.total, 0);
        const totalCovered = rws.reduce((n, r) => n + r.covered, 0);
        setRows(rws);
        setT({
          modules: total,
          covered: totalCovered,
          pct: total ? Math.round((totalCovered / total) * 100) : 0,
          started: rws.filter((r) => r.covered > 0).length,
          complete: rws.filter((r) => r.total > 0 && r.covered >= r.total).length,
          answered,
          correct,
          repairs: openRepairs,
          saved,
          cards,
          streak: streak.count,
          best: streak.best,
        });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [subjects]);

  if (!ready) return <p className="font-mono text-[12px] text-fg-3">reading telemetry…</p>;
  if (!t) {
    return (
      <EmptyState lines={['INDEX_UNAVAILABLE']}>The module index could not be fetched, so coverage cannot be computed. Reload to retry; nothing on this device was changed.</EmptyState>
    );
  }

  const noActivity = t.covered === 0 && t.repairs === 0 && t.saved === 0 && t.answered === 0 && events.length === 0;
  if (noActivity) {
    return (
      <EmptyState lines={['telemetry/', '└── 0 events']}>
        Nothing recorded on this device yet. Open modules, answer recall questions and run practice sessions — coverage, accuracy and the activity log build up here.
      </EmptyState>
    );
  }

  // Keystones from the blocks that need you most: rank by open repairs, then by
  // how little you've covered. Combines build-time centrality with live telemetry.
  const focus = rows
    .filter((r) => (r.keystones?.length ?? 0) > 0)
    .map((r) => ({ r, need: r.repairs * 3 + (100 - r.pct) / 20 }))
    .sort((a, b) => b.need - a.need)
    .slice(0, 3)
    .map((x) => x.r);

  // The log, grouped by local day.
  const days: { day: string; items: ActivityEvent[] }[] = [];
  for (const e of events) {
    const day = isoDay(new Date(e.t));
    const last = days[days.length - 1];
    if (last && last.day === day) last.items.push(e);
    else days.push({ day, items: [e] });
  }

  const COLS = '84px minmax(0,1fr) 64px 120px 56px 56px';
  const COLS_SM = '72px minmax(0,1fr) 56px';

  return (
    <div className="grid gap-8">
      <div className="gridlines grid-cols-2 md:grid-cols-4">
        <Metric label="modules_reviewed" value={t.covered.toLocaleString('en-US')} sub={`of ${t.modules.toLocaleString('en-US')} · ${t.pct}%`} />
        <Metric label="blocks_started" value={`${t.started}`} sub={`${t.complete} complete · ${subjects.length} total`} />
        <Metric label="quiz_accuracy" value={t.answered ? `${Math.round((t.correct / t.answered) * 100)}%` : '—'} sub={`${t.answered.toLocaleString('en-US')} answered`} />
        <Metric label="repair_queue" value={`${t.repairs}`} sub="open items" tone={t.repairs > 0 ? 'danger' : undefined} />
        <Metric label="cards_reviewed" value={t.cards.toLocaleString('en-US')} sub="graded on this device" />
        <Metric label="saved" value={`${t.saved}`} sub="pinned modules" />
        <Metric label="streak" value={`${t.streak} d`} sub={`best ${t.best} d`} />
        <Metric label="events" value={`${events.length}`} sub="in the activity log" />
      </div>

      <section aria-labelledby="activity">
        <h2 id="activity" className="sec-label">
          <span>recent_activity</span>
          <span className="sec-meta">local time · newest first</span>
        </h2>
        {days.length === 0 ? (
          <p className="font-mono text-[12px] text-fg-3">log empty — events are recorded from now on as you study.</p>
        ) : (
          <div className="panel overflow-hidden">
            {days.map((d) => (
              <div key={d.day}>
                <div className="row row-group">{d.day}</div>
                <ol>
                  {d.items.map((e, i) => {
                    const info = describe(e, byId);
                    const body = (
                      <>
                        <span className="font-mono text-[12px] text-fg-3">{clock(new Date(e.t))}</span>
                        <span className={`font-mono text-[11px] uppercase tracking-[0.06em] ${e.type === 'repair.queue' ? 'text-danger' : e.type === 'repair.resolve' ? 'text-ok' : 'text-accent'}`}>
                          {EVENT_VERB[e.type]}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-[12px] text-fg-2">{info.path}</span>
                          {info.text ? <span className="block truncate text-[13px] text-fg">{info.text}</span> : null}
                        </span>
                      </>
                    );
                    return (
                      <li key={`${e.t}-${i}`} className="border-t border-line first:border-t-0">
                        {info.href ? (
                          <Link href={info.href} className="row border-0" style={{ ['--cols' as string]: '48px 72px minmax(0,1fr)' }}>
                            {body}
                          </Link>
                        ) : (
                          <div className="row border-0" style={{ ['--cols' as string]: '48px 72px minmax(0,1fr)' }}>
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      {focus.length > 0 ? (
        <section aria-labelledby="priority">
          <h2 id="priority" className="sec-label">
            <span>priority_queue</span>
            <span className="sec-meta">keystones from the blocks that need you most</span>
          </h2>
          <div className="gridlines md:grid-cols-3">
            {focus.map((r) => (
              <div key={r.code} className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={`/subject/${r.slug}`} className="cell-id hover:underline">
                    {r.code}
                  </Link>
                  <span className="font-mono text-[11px] text-fg-3">
                    {r.pct}% seen{r.repairs > 0 ? ` · ${r.repairs} repair${r.repairs === 1 ? '' : 's'}` : ''}
                  </span>
                </div>
                <ul className="tree mt-2">
                  {r.keystones!.map((k, i) => (
                    <li key={k.id}>
                      <Link href={`/lecture/${k.id}`} className="tree-row gap-2">
                        <span className="tree-glyph">{i === r.keystones!.length - 1 ? '└──' : '├──'}</span>
                        <span className="min-w-0 truncate font-sans text-[13px] text-fg">{k.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="coverage">
        <h2 id="coverage" className="sec-label">
          <span>coverage_by_block</span>
          <span className="sec-meta">sorted by coverage</span>
        </h2>
        <div className="rows" style={{ ['--cols-lg' as string]: COLS, ['--cols-sm' as string]: COLS_SM }}>
          <div className="row row-head [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)]">
            <span>id</span>
            <span>block</span>
            <span className="text-right">seen</span>
            <span className="hidden sm:block">coverage</span>
            <span className="hidden text-right sm:block">acc</span>
            <span className="hidden text-right sm:block">fix</span>
          </div>
          {rows.map((r) => (
            <Fragment key={r.code}>
              <Link href={`/subject/${r.slug}`} className={`row [--cols:var(--cols-sm)] sm:[--cols:var(--cols-lg)] ${r.covered === 0 ? 'row-dim' : ''}`}>
                <span className="cell-id">{r.code}</span>
                <span className="cell-title truncate text-[13px] text-fg-2">{r.name}</span>
                <span className="cell-num">
                  {r.covered}/{r.total}
                </span>
                <span className="hidden items-center gap-2 sm:flex">
                  <span className="meter flex-1">
                    <span style={{ width: `${r.pct}%` }} />
                  </span>
                  <span className="w-9 text-right font-mono text-[11px] text-fg-3">{r.pct}%</span>
                </span>
                <span className="cell-num hidden sm:block" title={r.answered ? `${r.answered} answered` : undefined}>
                  {r.acc != null ? `${r.acc}%` : '—'}
                </span>
                <span className={`cell-num hidden sm:block ${r.repairs ? '!text-danger' : ''}`}>{r.repairs || '—'}</span>
              </Link>
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
