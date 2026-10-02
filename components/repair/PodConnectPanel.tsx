'use client';

import { useEffect, useState } from 'react';
import {
  getLastSync,
  getPodConnection,
  savePodConnection,
  syncFromPod,
} from '../../lib/sync/podConnector';
import { logActivity } from '../../lib/user/eventLog';
import { stamp } from '../../lib/time';

const DEFAULT_ORIGIN = 'https://williamspod.vercel.app';

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'ok'; text: string } | { kind: 'error'; text: string };

// The WilliamsPod bridge: pull this user's runs from Pod's token-gated export
// and queue their misses here. Configuration stays on this device.
export default function PodConnectPanel() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_ORIGIN);
  const [token, setToken] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const c = getPodConnection();
    if (c) {
      setBaseUrl(c.baseUrl);
      setToken(c.token);
      setConnected(true);
    } else {
      setShowConfig(true);
    }
    setLastSync(getLastSync());
  }, []);

  const sync = async () => {
    const conn = { baseUrl, token };
    savePodConnection(conn);
    setConnected(Boolean(baseUrl && token));
    setStatus({ kind: 'busy' });
    const r = await syncFromPod(conn);
    if (r.ok) {
      setStatus({ kind: 'ok', text: `synced ${r.attempts} run(s) → ${r.queued} new repair item(s)` });
      setLastSync(new Date().toISOString());
      if (r.queued > 0) {
        logActivity({ type: 'repair.queue', ref: 'williamspod sync', n: r.queued });
        setTimeout(() => window.location.reload(), 700);
      }
    } else {
      setStatus({ kind: 'error', text: r.error ?? 'unknown error' });
    }
  };

  const tokenUrl = `${(baseUrl || DEFAULT_ORIGIN).replace(/\/+$/, '')}/api/sync/token`;
  const busy = status.kind === 'busy';

  return (
    <section className="panel mb-8" aria-labelledby="sync-source">
      <div className="panel-head">
        <span id="sync-source" className="panel-title">
          sync_source: williamspod
        </span>
        <button type="button" onClick={() => setShowConfig((s) => !s)} className="btn btn-ghost btn-sm normal-case tracking-normal" aria-expanded={showConfig}>
          {showConfig ? 'hide config' : 'configure'}
        </button>
      </div>
      <div className="p-4">
        <dl className="kv">
          <dt>status</dt>
          <dd>{connected ? <span className="text-ok">configured</span> : <span className="dim">not configured</span>}</dd>
          <dt>origin</dt>
          <dd className="truncate">{baseUrl || '—'}</dd>
          <dt>last_sync</dt>
          <dd>{lastSync ? stamp(lastSync) : <span className="dim">never</span>}</dd>
        </dl>

        {showConfig ? (
          <div className="mt-5 grid gap-3 border-t border-line pt-4">
            <label className="grid gap-1.5">
              <span className="label">origin</span>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={DEFAULT_ORIGIN} className="input" spellCheck={false} />
            </label>
            <label className="grid gap-1.5">
              <span className="label">export token</span>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="exp1.…" className="input" spellCheck={false} autoComplete="off" />
            </label>
            <p className="font-mono text-[11px] leading-5 text-fg-3">
              # token: log into WilliamsPod, open{' '}
              <a href={tokenUrl} target="_blank" rel="noreferrer" className="xref">
                {tokenUrl}
              </a>{' '}
              and copy the <code className="text-fg-2">token</code> value.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={sync} disabled={busy || !token} className="btn btn-primary">
            {busy ? 'syncing…' : 'sync now'}
          </button>
          {status.kind === 'ok' ? <span className="font-mono text-[12px] text-ok">✓ {status.text}</span> : null}
        </div>
        {status.kind === 'error' ? (
          <div className="mt-4 border-l-2 border-danger bg-raised px-3 py-2 font-mono text-[12px]">
            <p className="text-danger">SYNC_FAILED</p>
            <p className="mt-1 text-fg-2">{status.text}</p>
            <p className="mt-1 text-fg-3">local state preserved.</p>
            <button type="button" onClick={sync} className="cmd mt-2">
              retry <span className="cmd-arrow">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
