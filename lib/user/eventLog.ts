// Activity log — what you actually did, and when. Feeds the telemetry on the
// progress page and the "resume" context on the overview. localStorage only,
// capped, newest last. Nothing here is reconstructed or estimated: an event
// exists only because it happened on this device.

import { readJSON, writeJSON } from './store';

const LOG = 'wh-activity-log';
const CAP = 240;
// Repeats inside this window fold into one event (re-opening the same module,
// answering a run of recall questions on one page).
const FOLD_MS = 10 * 60 * 1000;

export type ActivityType =
  | 'module.open' // ref: module id
  | 'recall.answer' // ref: module id · n answered, ok correct
  | 'practice.complete' // ref: scope label · n questions, ok correct
  | 'cards.complete' // ref: deck label · n cards, ok got
  | 'repair.queue' // n items pushed from a practice session
  | 'repair.resolve'; // ref: module id

export interface ActivityEvent {
  t: string; // ISO timestamp (last occurrence, when folded)
  type: ActivityType;
  ref?: string;
  n?: number;
  ok?: number;
}

export function getActivity(): ActivityEvent[] {
  const log = readJSON<ActivityEvent[]>(LOG, []);
  return Array.isArray(log) ? log : [];
}

export function logActivity(event: Omit<ActivityEvent, 't'>, now = new Date()): void {
  if (typeof window === 'undefined') return;
  const log = getActivity();
  const last = log[log.length - 1];
  const t = now.toISOString();
  const foldable = event.type === 'module.open' || event.type === 'recall.answer';
  if (
    foldable &&
    last &&
    last.type === event.type &&
    last.ref === event.ref &&
    now.getTime() - Date.parse(last.t) < FOLD_MS
  ) {
    last.t = t;
    if (event.type === 'recall.answer') {
      last.n = (last.n ?? 0) + (event.n ?? 0);
      last.ok = (last.ok ?? 0) + (event.ok ?? 0);
    }
  } else {
    log.push({ ...event, t });
  }
  writeJSON(LOG, log.slice(-CAP));
}

/** The module you were last in, if this device has seen one. */
export function lastOpenedModule(visited: string[]): { id: string; at: string | null } | null {
  const log = getActivity();
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.type === 'module.open' && e.ref) return { id: e.ref, at: e.t };
  }
  // Older devices predate the log: fall back to the coverage list, untimed.
  const id = visited[visited.length - 1];
  return id ? { id, at: null } : null;
}
