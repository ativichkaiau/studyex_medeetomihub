// WilliamsSync ingestion endpoint — PLACEHOLDER / SCAFFOLD.
//
// The Hub (studyex_medeetomihub) is static and zero-backend, so telemetry is ingested CLIENT-SIDE by
// lib/sync/williamsSync.ts into localStorage. This route exists so a future
// multi-device backend (Supabase/Postgres — see prisma/schema.prisma) can drop in
// without changing the WilliamsSyncEnvelope contract or any callers. It validates
// the envelope and acknowledges, but does not persist.

import type { WilliamsSyncEnvelope } from '../../../lib/sync/types';

const KINDS = ['telemetry', 'mistakes', 'repairs', 'performance'];

export async function POST(request: Request) {
  let env: WilliamsSyncEnvelope;
  try {
    env = (await request.json()) as WilliamsSyncEnvelope;
  } catch {
    return Response.json({ ok: false, error: 'invalid JSON' }, { status: 400 });
  }
  if (!env || !KINDS.includes(env.kind)) {
    return Response.json({ ok: false, error: 'unknown envelope kind' }, { status: 400 });
  }
  // A future backend would persist per user_id here and reconcile with clients.
  return Response.json(
    {
      ok: true,
      kind: env.kind,
      accepted: true,
      persisted: false,
      note: 'Scaffold only — studyex_medeetomihub ingests client-side into localStorage. Wire a backend to persist.',
    },
    { status: 202 },
  );
}

export async function GET() {
  return Response.json({
    service: 'WilliamsSync',
    status: 'placeholder',
    accepts: KINDS,
    note: 'POST a WilliamsSyncEnvelope. Client ingestion: lib/sync/williamsSync.ts.',
  });
}
