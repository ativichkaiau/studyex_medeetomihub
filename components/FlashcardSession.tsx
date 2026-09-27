'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import HubIcon from './HubIcon';
import { touchStreak } from '../lib/user/activity';
import { readJSON, writeJSON, todayKey } from '../lib/user/store';
import type { Flashcard, FlashcardKind } from '../lib/flashcards/build';

const KIND_META: Record<FlashcardKind, { label: string; cls: string }> = {
  recall: { label: 'Recall', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  trap: { label: 'Trap', cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' },
  finding: { label: 'Finding', cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  mnemonic: { label: 'Mnemonic', cls: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  mechanism: { label: 'Mechanism', cls: 'bg-teal-500/15 text-teal-700 dark:text-teal-300' },
  investigation: { label: 'Investigation', cls: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300' },
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

  const done = i >= deck.length;
  const card = deck[i];

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
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === ' ' || e.key === 'Enter') {
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
      <div className="clay clay-surface p-8 text-center">
        <HubIcon name="cards" className="mx-auto h-8 w-8 text-[var(--muted)]" />
        <p className="mt-3 font-semibold text-[var(--ink)]">No cards here yet.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Cards are built from a module’s high-yield points, traps, findings and mnemonics.
        </p>
      </div>
    );
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  if (done) {
    const reviewCards = deck.filter((c) => review.includes(c.id));
    const pct = Math.round((got.length / deck.length) * 100);
    return (
      <div className="space-y-5">
        <div className="clay clay-surface p-6 text-center">
          <div className="eyebrow">Deck complete</div>
          <div className="mt-1.5 text-4xl font-semibold tabular-nums text-[var(--ink)]">{pct}%</div>
          <div className="text-sm text-[var(--muted)]">
            {got.length} got · {review.length} to review · {title}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {reviewCards.length > 0 ? (
              <button
                type="button"
                onClick={() => restart(reviewCards)}
                className="clay-pill px-4 py-2 text-sm font-medium text-[#e4002b] transition hover:border-[#e4002b] active:translate-y-px dark:text-[#ff5a72]"
              >
                ↻ Restudy {reviewCards.length} to review
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => restart()}
              className="clay-pill px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:border-[var(--accent)] active:translate-y-px"
            >
              ↻ Shuffle all again
            </button>
          </div>
        </div>
        {review.length === 0 ? (
          <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">Clean run — every card got.</p>
        ) : null}
      </div>
    );
  }

  // ── One card ─────────────────────────────────────────────────────────────
  const meta = KIND_META[card.kind];
  const label = (
    <div className="flex items-center gap-2">
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${meta.cls}`}>{meta.label}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">{card.moduleTitle}</span>
    </div>
  );
  return (
    <div>
      {/* progress */}
      <div className="mb-4 flex items-center gap-3">
        <span className="clay-inset h-1.5 flex-1 overflow-hidden rounded-full">
          <span
            className="block h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${(i / deck.length) * 100}%` }}
          />
        </span>
        <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--muted)]">
          {i + 1} / {deck.length}
        </span>
      </div>

      {/* A real two-sided card (globals.css, "Flashcards"). Keyed so every new
          card is dealt fresh — turning back over would flash the next card's
          answer — and the hidden face is kept out of the accessible name. */}
      <div key={`${i}:${card.id}`} className="card-deal depth-tilt">
        <button
          type="button"
          onClick={() => (revealed ? grade(true) : setRevealed(true))}
          className="card-3d"
          data-face={revealed ? 'back' : 'front'}
        >
          <div
            className="card-face card-face-front clay clay-surface flex min-h-[16rem] flex-col items-center justify-center gap-4 p-8 text-center"
            aria-hidden={revealed}
          >
            {label}
            <p className="max-w-xl text-lg font-semibold leading-snug text-[var(--ink)]">{card.front}</p>
            <span className="text-xs font-medium text-[var(--muted)]">Tap or press space to reveal</span>
          </div>
          <div
            className="card-face card-face-back clay clay-surface flex min-h-[16rem] flex-col items-center justify-center gap-4 p-8 text-center"
            aria-hidden={!revealed}
          >
            {label}
            <p className="max-w-xl text-lg font-semibold leading-snug text-[var(--ink)]">{card.front}</p>
            <span className="card-rule h-px w-16 bg-[var(--line)]" />
            <p className="card-answer max-w-xl whitespace-pre-line text-[15px] leading-relaxed text-[var(--ink)]">{card.back}</p>
          </div>
        </button>
      </div>

      {/* grade */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {revealed ? (
          <>
            <button
              type="button"
              onClick={() => grade(false)}
              className="clay-pill px-5 py-2.5 text-sm font-medium text-[#e4002b] transition hover:border-[#e4002b] active:translate-y-px dark:text-[#ff5a72]"
            >
              Review <span className="ml-1 text-[10px] opacity-60">1</span>
            </button>
            <button
              type="button"
              onClick={() => grade(true)}
              className="clay-pill px-5 py-2.5 text-sm font-medium text-emerald-600 transition hover:border-emerald-500 active:translate-y-px dark:text-emerald-400"
            >
              Got it <span className="ml-1 text-[10px] opacity-60">2</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="clay-pill px-6 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:border-[var(--accent)] active:translate-y-px"
          >
            Show answer
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        <Link href={`/lecture/${card.moduleId}`} className="underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink)]">
          Open “{card.moduleTitle}”
        </Link>
      </p>
    </div>
  );
}
