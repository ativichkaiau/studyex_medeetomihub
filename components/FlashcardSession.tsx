'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { touchStreak } from '../lib/user/activity';
import { readJSON, writeJSON, todayKey } from '../lib/user/store';
import { logActivity } from '../lib/user/eventLog';
import { pad2 } from '../lib/paths';
import EmptyState from './ui/EmptyState';
import type { Flashcard, FlashcardKind } from '../lib/flashcards/build';

const KIND_LABEL: Record<FlashcardKind, string> = {
  recall: 'recall',
  trap: 'exam_trap',
  finding: 'finding',
  mnemonic: 'mnemonic',
  mechanism: 'mechanism',
  investigation: 'investigation',
};

const FC_KEY = 'wh-flashcards';
type FcStore = { lastDate?: string; studied?: number; byModule?: Record<string, { got: number; review: number }> };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function record(moduleId: string, got: boolean) {
  const s = readJSON<FcStore>(FC_KEY, {});
  s.studied = (s.studied ?? 0) + 1;
  s.lastDate = todayKey();
  s.byModule ??= {};
  const m = (s.byModule[moduleId] ??= { got: 0, review: 0 });
  if (got) m.got += 1;
  else m.review += 1;
  writeJSON(FC_KEY, s);
  touchStreak();
}

/** This device's record for a module's cards, if it has one. */
function moduleHistory(moduleId: string): { got: number; review: number } | null {
  return readJSON<FcStore>(FC_KEY, {}).byModule?.[moduleId] ?? null;
}

export default function FlashcardSession({ cards, title }: { cards: Flashcard[]; title: string }) {
  const [nonce, setNonce] = useState(0);
  // Deterministic first paint (SSR-safe), then shuffle on the client after mount.
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  useEffect(() => {
    setDeck(shuffle(cards));
  }, [cards, nonce]);

  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [got, setGot] = useState<string[]>([]);
  const [review, setReview] = useState<string[]>([]);
  const [history, setHistory] = useState<{ got: number; review: number } | null>(null);
  const logged = useRef(false);

  const done = i >= deck.length;
  const card = deck[i];

  useEffect(() => {
    if (card) setHistory(moduleHistory(card.moduleId));
  }, [card]);

  const grade = useCallback(
    (isGot: boolean) => {
      if (!card) return;
      record(card.moduleId, isGot);
      (isGot ? setGot : setReview)((xs) => [...xs, card.id]);
      setRevealed(false);
      setI((n) => n + 1);
    },
    [card],
  );

  const restart = (subset?: Flashcard[]) => {
    if (subset && subset.length) setDeck(shuffle(subset));
    else setNonce((n) => n + 1);
    setI(0);
    setRevealed(false);
    setGot([]);
    setReview([]);
    logged.current = false;
  };

  // A finished deck goes into the activity log once.
  useEffect(() => {
    if (!done || deck.length === 0 || logged.current) return;
    logged.current = true;
    logActivity({ type: 'cards.complete', ref: title, n: deck.length, ok: got.length });
  }, [done, deck.length, got.length, title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      // A focused control keeps its own Space/Enter: "again" must not grade good.
      const onControl = e.target instanceof HTMLElement && e.target.closest('button, a');
      if (e.key === ' ' || e.key === 'Enter') {
        if (onControl) return;
        e.preventDefault();
        if (!revealed) setRevealed(true);
        else grade(true);
      } else if (revealed && (e.key === '1' || e.key.toLowerCase() === 'r')) {
        grade(false);
      } else if (revealed && (e.key === '2' || e.key.toLowerCase() === 'g')) {
        grade(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, done, grade]);

  if (deck.length === 0) {
    return (
      <EmptyState lines={['deck/', '└── empty']}>
        Cards are built from a module&apos;s high-yield points, traps, findings and mnemonics; this one has none yet.
      </EmptyState>
    );
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  if (done) {
    const reviewCards = deck.filter((c) => review.includes(c.id));
    const pct = Math.round((got.length / deck.length) * 100);
    return (
      <div className="panel reveal-in">
        <div className="panel-head">
          <span className="panel-title">session_complete</span>
          <span className="panel-meta truncate">{title}</span>
        </div>
        <div className="p-5">
          <dl className="kv">
            <dt>accuracy</dt>
            <dd className="text-[15px]">{pct}%</dd>
            <dt>good</dt>
            <dd className="text-ok">{got.length}</dd>
            <dt>again</dt>
            <dd className={review.length ? 'text-danger' : ''}>{review.length}</dd>
            <dt>cards</dt>
            <dd>{deck.length}</dd>
          </dl>
          <p className="mt-4 font-mono text-[12px] text-fg-3">
            {review.length === 0 ? '› clean run — nothing to restudy.' : `› ${review.length} card${review.length === 1 ? '' : 's'} queued for another pass.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line p-3">
          {reviewCards.length > 0 ? (
            <button type="button" onClick={() => restart(reviewCards)} className="btn btn-primary">
              restudy {reviewCards.length} again <span aria-hidden="true">→</span>
            </button>
          ) : null}
          <button type="button" onClick={() => restart()} className="btn">
            reshuffle all ↻
          </button>
          <Link href="/progress" className="btn btn-ghost">
            inspect progress →
          </Link>
        </div>
      </div>
    );
  }

  // ── One card ─────────────────────────────────────────────────────────────
  return (
    <div data-keyscope="cards">
      <div className="mb-3 flex items-center gap-3 font-mono text-[11px] text-fg-3">
        <span className="meter flex-1">
          <span style={{ width: `${(i / deck.length) * 100}%` }} />
        </span>
        <span className="tabular">
          good <span className="text-ok">{got.length}</span> · again <span className={review.length ? 'text-danger' : ''}>{review.length}</span>
        </span>
      </div>

      <article key={`${i}:${card.id}`} className="panel">
        <div className="panel-head">
          <span className="panel-title">card_{String(i + 1).padStart(3, '0')}</span>
          <span className="tabular">
            {pad2(i + 1)} / {pad2(deck.length)}
          </span>
        </div>
        <div className="p-5">
          <dl className="kv text-[11.5px]">
            <dt>type</dt>
            <dd>{KIND_LABEL[card.kind]}</dd>
            <dt>module</dt>
            <dd className="truncate">{card.moduleTitle}</dd>
            {history ? (
              <>
                <dt>history</dt>
                <dd>
                  {history.got} good · {history.review} again <span className="dim">· this device</span>
                </dd>
              </>
            ) : null}
          </dl>

          <p className="label mt-6">q:</p>
          {revealed ? (
            <p className="mt-1.5 text-[18px] font-medium leading-snug text-fg">{card.front}</p>
          ) : (
            <button type="button" onClick={() => setRevealed(true)} className="mt-1.5 block w-full text-left text-[18px] font-medium leading-snug text-fg" aria-label={`${card.front} — reveal the answer`}>
              {card.front}
            </button>
          )}

          {revealed ? (
            <div className="reveal-in">
              <p className="label mt-6">a:</p>
              <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-fg">{card.back}</p>
            </div>
          ) : (
            <p className="mt-6 font-mono text-[11.5px] text-fg-3">› recall the answer, then reveal</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
          {revealed ? (
            <>
              <button type="button" onClick={() => grade(false)} className="btn btn-danger">
                again <span className="btn-key">1</span>
              </button>
              <button type="button" onClick={() => grade(true)} className="btn btn-ok">
                good <span className="btn-key">2</span>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setRevealed(true)} className="btn btn-primary">
              reveal <span className="btn-key">space</span>
            </button>
          )}
          <Link href={`/lecture/${card.moduleId}`} className="cmd ml-auto">
            open module <span className="cmd-arrow">→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
