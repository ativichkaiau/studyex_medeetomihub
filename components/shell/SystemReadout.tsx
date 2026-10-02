'use client';

import { BUILD, BRAND } from '../../lib/brand';
import { ago } from '../../lib/time';
import { useSyncState } from './useSyncState';

export interface IndexStats {
  blocks: number;
  lectures: number;
  modules: number;
}

// The system block: only state that exists. The index is counted at build
// time; sync is whatever this device has configured; the build is the commit
// this bundle came from.
export default function SystemReadout({ stats }: { stats: IndexStats }) {
  const sync = useSyncState();
  return (
    <dl className="sys-list">
      <dt>index</dt>
      <dd>
        {stats.blocks} blocks · {stats.modules.toLocaleString('en-US')} mod
      </dd>
      <dt>runtime</dt>
      <dd>{BRAND.runtime.toLowerCase()}</dd>
      <dt>state</dt>
      <dd>local · this device</dd>
      <dt>sync</dt>
      <dd>
        {!sync ? (
          '—'
        ) : sync.connected ? (
          <span title={sync.origin ?? undefined}>
            <span className="text-ok">●</span> williamspod{sync.lastSync ? ` · ${ago(sync.lastSync)}` : ' · never'}
          </span>
        ) : (
          <span className="text-fg-3">off</span>
        )}
      </dd>
      <dt>build</dt>
      <dd title={BUILD.date ? `built ${BUILD.date}` : undefined}>
        {BUILD.sha}
        {BUILD.env === 'production' ? '' : ' · dev'}
      </dd>
    </dl>
  );
}
