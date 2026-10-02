'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ERROR_TYPE_META,
  clearCompleted,
  completeRepairItem,
  getRepairQueue,
  reopenRepairItem,
  sortRepairQueue,
} from '../../lib/repair/store';
import { getWeaknessMap, type Weakness } from '../../lib/user/weakness';
import { logActivity } from '../../lib/user/eventLog';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../../lib/searchIndex';
import { snake } from '../../lib/paths';
import { stamp } from '../../lib/time';
import EmptyState from '../ui/EmptyState';
import type { RepairPriority, RepairQueueItem, RepairReason } from '../../lib/repair/types';

const SEVERITY_TAG: Record<RepairPriority, string> = {
  critical: 'tag tag-danger',
  high: 'tag tag-warn',
  medium: 'tag',
  low: 'tag tag-muted',
};

// What each reason code means, in the words of lib/repair/types.ts.
const DIAGNOSTIC: Record<RepairReason, string> = {
  missed_high_yield: 'missed a high-yield fact',
  weak_mechanism: 'broke down on the cause → effect chain',
  misread_question_frame: 'answered the wrong kind of question',
  fell_for_distractor: 'fell for a distractor',
  second_guessed: 'talked yourself out of the right answer',
  ran_out_of_time: 'ran out of time',
  low_confidence: 'right instinct, low confidence',
  missed_cross_link: 'missed a cross-module link',
  other: 'other',
};

/** A short, stable failure code derived from the item's own id (FNV-1a). */
function failCode(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `FAIL_${((h >>> 0) % 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
}

export default function RepairQueuePanel() {
  const [items, setItems] = useState<RepairQueueItem[]>([]);
  const [ready, setReady] = useState(false);
  const [weakness, setWeakness] = useState<Map<string, Weakness>>(() => new Map());
  const [byId, setById] = useState<Record<string, IndexEntry>>({});

  useEffect(() => {
    setItems(sortRepairQueue(getRepairQueue()));
    setWeakness(getWeaknessMap());
    setReady(true);
    loadSearchIndex()
      .then((index) => setById(moduleEntries(index)))
      .catch(() => {});
  }, []);

  const refresh = (next: RepairQueueItem[]) => {
    setItems(sortRepairQueue(next));
    setWeakness(getWeaknessMap());
  };
  const resolve = (it: RepairQueueItem) => {
    refresh(completeRepairItem(it.id));
    logActivity({ type: 'repair.resolve', ref: it.module_id });
  };
  const open = items.filter((i) => !i.completed_at);

  return (
    <section aria-labelledby="repair-queue">
      <h2 id="repair-queue" className="sec-label" data-tone={open.length ? 'danger' : undefined}>
        <span>repair_queue</span>
        <span className="sec-meta">{ready ? `${open.length} open · ${items.length} total` : 'loading…'}</span>
      </h2>

      {ready && items.length === 0 ? (
        <EmptyState lines={['repair_queue: 0 items', '› queue empty.']}>
          Misses arrive here when you push them from a practice session, or when a WilliamsPod run syncs — prioritised by error type, each with the fix to run.
        </EmptyState>
      ) : (
        <>
          {items.some((i) => i.completed_at) ? (
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => refresh(clearCompleted())} className="btn btn-sm">
                clear resolved
              </button>
            </div>
          ) : null}
          <ol className="grid gap-3">
            {items.map((it) => {
              const meta = ERROR_TYPE_META[it.error_type];
              const done = !!it.completed_at;
              const w = weakness.get(it.module_id);
              const entry = byId[it.module_id];
              return (
                <li key={it.id} className={`trap ${done ? 'opacity-60' : ''}`} style={done ? { borderLeftColor: 'var(--success)' } : undefined}>
                  <div className="trap-head">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={done ? 'text-ok' : 'text-danger'}>{failCode(it.id)}</span>
                      <span className={SEVERITY_TAG[it.priority]}>{it.priority}</span>
                      <span className="trap-category">{it.error_type}</span>
                    </span>
                    <span>{done && it.completed_at ? `resolved ${stamp(it.completed_at)}` : `logged ${stamp(it.created_at)}`}</span>
                  </div>
                  <dl className="kv mt-1">
                    <dt>target</dt>
                    <dd>
                      <Link href={`/lecture/${it.module_id}`} className={`xref ${done ? 'line-through' : ''}`}>
                        {it.subject_id !== 'unknown' ? `${it.subject_id}/` : ''}
                        {snake(it.module_id)}
                      </Link>
                      {entry?.t ? <span className="dim"> · {entry.t}</span> : null}
                    </dd>
                    <dt>diagnostic</dt>
                    <dd>
                      {meta.label.toLowerCase()} — {DIAGNOSTIC[it.reason] ?? it.reason}
                    </dd>
                    {w && w.quizAccuracy !== null ? (
                      <>
                        <dt>recall_acc</dt>
                        <dd>
                          {w.quizAccuracy.toFixed(2)} <span className="dim">· n={w.answered}</span>
                        </dd>
                      </>
                    ) : null}
                    <dt>next_action</dt>
                    <dd className="font-sans text-[13.5px] leading-6 text-fg">{it.recommended_action}</dd>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {done ? (
                      <button type="button" onClick={() => refresh(reopenRepairItem(it.id))} className="btn btn-sm">
                        ↺ reopen
                      </button>
                    ) : (
                      <>
                        <Link href={`/lecture/${it.module_id}`} className="btn btn-sm btn-primary">
                          repair →
                        </Link>
                        <Link href={`/practice/${it.module_id}`} className="btn btn-sm">
                          retest →
                        </Link>
                        <button type="button" onClick={() => resolve(it)} className="btn btn-sm btn-ok">
                          ✓ resolve
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
