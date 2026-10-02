// WilliamsPod connector — the Hub (studyex_medeetomihub) side of the live bridge. The browser
// PULLS the user's telemetry from WilliamsPod's token-gated CORS export and
// ingests it into the localStorage repair queue. SSR-safe.
//
// Config (localStorage `wh-pod-connection`): { baseUrl, token }. Get the token
// from WilliamsPod while logged in: GET <origin>/api/sync/token.

import { addRepairItems, makeRepairItem } from '../repair/store';
import type { ErrorType, RepairPriority } from '../repair/types';
import type { PodExportResponse } from './podPacket';

const CONN_KEY = 'wh-pod-connection';
const LAST_SYNC_KEY = 'wh-pod-lastsync';

const ERROR_TYPES: ErrorType[] = [
  'recall_error',
  'mechanism_error',
  'frame_error',
  'trap_error',
  'overthinking_error',
  'timing_error',
  'confidence_error',
  'integration_error',
];
const PRIORITIES: RepairPriority[] = ['low', 'medium', 'high', 'critical'];

export interface PodConnection {
  baseUrl: string;
  token: string;
}

export function getPodConnection(): PodConnection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONN_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as PodConnection;
    return c.baseUrl && c.token ? c : null;
  } catch {
    return null;
  }
}

export function savePodConnection(conn: PodConnection): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONN_KEY, JSON.stringify({ baseUrl: conn.baseUrl.trim(), token: conn.token.trim() }));
  } catch {
    /* non-fatal */
  }
}

export function getLastSync(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_SYNC_KEY);
}

export interface SyncOutcome {
  ok: boolean;
  attempts: number;
  queued: number;
  error?: string;
}

/** Pull recent WilliamsPod runs and enqueue their repair recommendations. */
export async function syncFromPod(conn?: PodConnection): Promise<SyncOutcome> {
  const c = conn ?? getPodConnection();
  if (!c || !c.baseUrl || !c.token) {
    return { ok: false, attempts: 0, queued: 0, error: 'Not configured — set the WilliamsPod origin and token.' };
  }
  const base = c.baseUrl.replace(/\/+$/, '');
  const url = `${base}/api/sync/export?token=${encodeURIComponent(c.token)}&limit=25`;

  let res: Response;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch (e) {
    return { ok: false, attempts: 0, queued: 0, error: `Network/CORS error: ${(e as Error).message}` };
  }
  if (res.status === 401) return { ok: false, attempts: 0, queued: 0, error: 'Unauthorized — check the export token.' };
  if (!res.ok) return { ok: false, attempts: 0, queued: 0, error: `WilliamsPod responded ${res.status}.` };

  let data: PodExportResponse;
  try {
    data = (await res.json()) as PodExportResponse;
  } catch {
    return { ok: false, attempts: 0, queued: 0, error: 'Could not parse the WilliamsPod response.' };
  }

  const packets = data.packets ?? [];
  const items = packets.flatMap((pkt) =>
    (pkt.repairRecommendations ?? []).map((rec) =>
      makeRepairItem({
        user_id: pkt.userId ?? 'local',
        // Pod lecture ids may differ from Hub module ids; use the lecture id as a
        // best-effort module link, falling back to the source question id.
        module_id: rec.lectureId ?? rec.sourceQuestionId,
        lecture_id: rec.lectureId ?? '',
        subject_id: rec.subject ?? '',
        error_type: (ERROR_TYPES.includes(rec.errorType as ErrorType) ? rec.errorType : 'recall_error') as ErrorType,
        priority: PRIORITIES.includes(rec.priority as RepairPriority) ? (rec.priority as RepairPriority) : undefined,
        recommended_action: rec.recommendedAction,
        source_question_id: rec.sourceQuestionId,
      }),
    ),
  );

  addRepairItems(items); // deduped by module + error type + question
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch {
      /* non-fatal */
    }
  }
  return { ok: true, attempts: packets.length, queued: items.length };
}
