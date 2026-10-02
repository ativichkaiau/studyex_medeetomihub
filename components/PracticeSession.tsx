'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { recordQuizAnswer } from '../lib/user/activity';
import { addRepairItems, makeRepairItem } from '../lib/repair/store';
import { getWeakModules, intersectsWeak } from '../lib/user/weakness';
import { logActivity } from '../lib/user/eventLog';
import { pad2, snake } from '../lib/paths';
import { elapsed } from '../lib/time';
import { isTypingTarget } from '../lib/events';
import EmptyState from './ui/EmptyState';
import type { ErrorType } from '../lib/repair/types';
import type { BankQuestion, QuestionKind } from '../lib/questions/types';

const KIND_ERROR: Record<QuestionKind, ErrorType> = {
  recall: 'recall_error',
  mechanism: 'mechanism_error',
  trap: 'trap_error',
  integration: 'integration_error',
  clinical: 'frame_error',
};

const KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bias the sample toward the links you actually miss: integration questions that
// bridge a weak module float to the front, then questions touching any weak
// module, then everything else — with a random jitter so it still varies run to
// run. With no weak signal this degrades to a plain shuffle.
function weightedDeck(questions: BankQuestion[], size: number, weak: Set<string>): BankQuestion[] {
  const scored = questions.map((q) => {
    let w = Math.random();
    const bridgesWeak = intersectsWeak(q.linkedModuleIds, weak);
    if (q.kind === 'integration' && bridgesWeak) w += 2;
    else if (bridgesWeak || weak.has(q.moduleId)) w += 1;
    return { q, w };
  });
  scored.sort((a, b) => b.w - a.w);
  return scored.slice(0, size).map((s) => s.q);
}

export default function PracticeSession({
  questions,
  title,
  subjectOf,
}: {
  questions: BankQuestion[];
  title: string;
  subjectOf?: Record<string, string>;
}) {
  // Deterministic initial order (SSR-safe), then shuffle on the client after mount
  // so server + client HTML match; "rerun" (nonce) reshuffles.
  const [nonce, setNonce] = useState(0);
  const sessionSize = Math.min(20, questions.length);
  const [deck, setDeck] = useState<BankQuestion[]>(() => questions.slice(0, sessionSize));
  const [weakBias, setWeakBias] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  useEffect(() => {
    const weak = getWeakModules();
    const next = weak.size > 0 ? weightedDeck(questions, sessionSize, weak) : shuffle(questions).slice(0, sessionSize);
    setDeck(next);
    setWeakBias(next.filter((q) => intersectsWeak(q.linkedModuleIds, weak) || weak.has(q.moduleId)).length);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, [questions, nonce, sessionSize]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [savedRepair, setSavedRepair] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  // The session clock: elapsed time, ticking only while the session runs.
  useEffect(() => {
    if (done || startedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [done, startedAt]);

  const results = deck.map((qq) => ({ q: qq, pick: chosen[qq.id], correct: chosen[qq.id] === qq.answerId }));
  const answeredCount = results.filter((r) => r.pick !== undefined).length;
  const score = results.filter((r) => r.correct).length;
  const misses = results.filter((r) => r.pick !== undefined && !r.correct);
  const q = deck[i];
  const pick = q ? chosen[q.id] : undefined;
  const answered = pick !== undefined;

  const choose = (question: BankQuestion, optId: string) => {
    if (chosen[question.id] !== undefined) return;
    setChosen((c) => ({ ...c, [question.id]: optId }));
    recordQuizAnswer(question.moduleId, question.id, optId === question.answerId);
    requestAnimationFrame(() => nextRef.current?.focus());
  };

  const advance = () => {
    if (i < deck.length - 1) setI(i + 1);
    else {
      setDone(true);
      setFinishedAt(Date.now());
      logActivity({ type: 'practice.complete', ref: title, n: deck.length, ok: score });
    }
  };

  const restart = () => {
    setChosen({});
    setI(0);
    setDone(false);
    setSavedRepair(false);
    setFinishedAt(null);
    setNonce((n) => n + 1);
  };

  const sendToRepair = () => {
    const items = misses.map((m) =>
      makeRepairItem({
        module_id: m.q.moduleId,
        lecture_id: m.q.moduleId,
        subject_id: subjectOf?.[m.q.moduleId] ?? 'unknown',
        error_type: KIND_ERROR[m.q.kind],
        source_question_id: m.q.id,
      }),
    );
    if (items.length) {
      addRepairItems(items);
      logActivity({ type: 'repair.queue', ref: title, n: items.length });
    }
    setSavedRepair(true);
  };

  // Keys: a–e (or 1–5) answer, Enter moves on.
  useEffect(() => {
    if (done || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const key = e.key.toLowerCase();
      if (!answered) {
        const index = /^[1-6]$/.test(key) ? Number(key) - 1 : KEYS.indexOf(key);
        const option = index >= 0 ? q.options[index] : undefined;
        if (option) {
          e.preventDefault();
          choose(q, option.id);
        }
      } else if (key === 'enter' && !(e.target instanceof HTMLElement && e.target.closest('button, a'))) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (deck.length === 0) {
    return (
      <EmptyState lines={['question_bank/', '└── empty']}>
        No questions are available for this selection yet. <Link href="/practice" className="xref">Choose another block</Link> to start a session.
      </EmptyState>
    );
  }

  const clock = startedAt === null ? '--:--' : elapsed(((finishedAt ?? now) - startedAt) / 1000);

  // ── Summary ──────────────────────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <div className="grid gap-6">
        <div className="panel reveal-in">
          <div className="panel-head">
            <span className="panel-title">session_complete</span>
            <span className="panel-meta truncate">{title}</span>
          </div>
          <div className="p-5">
            <dl className="kv">
              <dt>accuracy</dt>
              <dd className="text-[15px]">{pct}%</dd>
              <dt>correct</dt>
              <dd>
                {score} / {deck.length}
              </dd>
              <dt>misses</dt>
              <dd className={misses.length ? 'text-danger' : 'text-ok'}>{misses.length}</dd>
              <dt>duration</dt>
              <dd>{clock}</dd>
            </dl>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-line p-3">
            <button type="button" onClick={restart} className="btn btn-primary">
              rerun ↻
            </button>
            {misses.length > 0 ? (
              <button type="button" onClick={sendToRepair} disabled={savedRepair} className="btn btn-danger">
                {savedRepair ? `✓ ${misses.length} queued for repair` : `push ${misses.length} miss${misses.length === 1 ? '' : 'es'} → repair`}
              </button>
            ) : null}
            <Link href={savedRepair ? '/repair' : '/progress'} className="btn btn-ghost">
              {savedRepair ? 'open repair queue →' : 'inspect progress →'}
            </Link>
          </div>
        </div>

        {misses.length > 0 ? (
          <section aria-labelledby="failure-log">
            <h2 id="failure-log" className="sec-label" data-tone="danger">
              <span>failure_log</span>
              <span className="sec-meta">{misses.length} missed</span>
            </h2>
            <ol className="grid gap-2.5">
              {misses.map((m, n) => (
                <li key={m.q.id} className="trap">
                  <div className="trap-head">
                    <span>
                      fail {pad2(n + 1)} · {m.q.kind}
                    </span>
                    <Link href={`/lecture/${m.q.moduleId}`} className="trap-category hover:text-accent">
                      {snake(m.q.moduleId)} →
                    </Link>
                  </div>
                  <p className="text-[14.5px] font-medium leading-relaxed text-fg">{m.q.stem}</p>
                  <div className="trap-row mt-2">
                    <span className="trap-key" data-tone="danger">
                      ✗ picked
                    </span>
                    <span className="trap-wrong">{m.q.options.find((o) => o.id === m.pick)?.text}</span>
                  </div>
                  <div className="trap-row">
                    <span className="trap-key" data-tone="ok">
                      ✓ answer
                    </span>
                    <span className="text-fg">{m.q.options.find((o) => o.id === m.q.answerId)?.text}</span>
                  </div>
                  <div className="trap-row">
                    <span className="trap-key">why</span>
                    <span className="text-fg-2">{m.q.explanation}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <p className="font-mono text-[12px] text-ok">› clean sweep — 0 misses.</p>
        )}
      </div>
    );
  }

  // ── One question ─────────────────────────────────────────────────────────
  return (
    <div data-keyscope="practice">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-fg-3">
        <span>
          status <span className="text-ok">active</span>
        </span>
        <span>
          score <span className="text-fg">{score}</span>/{answeredCount}
        </span>
        <span className="tabular">
          timer <span className="text-fg">{clock}</span>
        </span>
        {questions.length > deck.length ? (
          <span>
            sample {deck.length} of {questions.length.toLocaleString('en-US')}
          </span>
        ) : null}
      </div>
      <span className="meter mb-4 block">
        <span style={{ width: `${(answeredCount / deck.length) * 100}%` }} />
      </span>

      {weakBias > 0 ? (
        <p className="mb-4 border-l-2 border-warn bg-raised px-3 py-2 font-mono text-[11.5px] text-fg-2">
          › tuned to your weak links — {weakBias} of {deck.length} question{deck.length === 1 ? '' : 's'} target modules you&apos;ve been missing.
        </p>
      ) : null}

      <article key={q.id} className="panel">
        <div className="panel-head">
          <span className="panel-title">
            question {pad2(i + 1)} / {pad2(deck.length)}
          </span>
          <span>{q.kind}</span>
        </div>
        <div className="p-5">
          <p className="text-[16.5px] font-medium leading-relaxed text-fg">{q.stem}</p>
          <div className="mt-4">
            {q.options.map((o, n) => {
              const isCorrect = o.id === q.answerId;
              const isPick = o.id === pick;
              const state = !answered ? undefined : isCorrect ? 'correct' : isPick ? 'wrong' : 'dim';
              return (
                <button key={o.id} type="button" disabled={answered} onClick={() => choose(q, o.id)} className="opt" data-state={state}>
                  <span className="opt-key">{KEYS[n] ?? o.id}</span>
                  <span>{o.text}</span>
                </button>
              );
            })}
          </div>
          {answered ? (
            <p className="verdict reveal-in" data-ok={pick === q.answerId}>
              <span className="verdict-key">{pick === q.answerId ? 'correct' : 'incorrect'}</span>
              {q.explanation}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-3">
          <span className="font-mono text-[11px] text-fg-3">{answered ? 'enter → next' : 'a–e to answer'}</span>
          <button ref={nextRef} type="button" onClick={advance} disabled={!answered} className="btn btn-primary">
            {i < deck.length - 1 ? 'next →' : 'finish'}
          </button>
        </div>
      </article>
    </div>
  );
}
