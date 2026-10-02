'use client';

import { useEffect, useState } from 'react';
import { BRAND } from '../../lib/brand';
import { openAsk, openSearch } from '../../lib/events';
import { ago } from '../../lib/time';
import { useAppearance } from './prefs';
import type { IndexStats } from './SystemReadout';
import { useSyncState } from './useSyncState';

// A calm status line along the bottom of the desktop shell. Everything on it
// is live state or a way into an overlay.
export default function StatusBar({ stats }: { stats: IndexStats }) {
  const [ready, setReady] = useState(false);
  const appearance = useAppearance();
  const sync = useSyncState();
  useEffect(() => setReady(true), []);

  return (
    <footer className="app-statusbar" aria-label="Status">
      <div className="status-group">
        <span className="status-item" title={ready ? 'Interactive' : 'Loading scripts'}>
          <span className={`status-dot ${ready ? 'text-ok' : 'text-fg-3'}`} aria-hidden="true" />
          {ready ? 'ready' : 'loading'}
        </span>
        <span className="status-item text-fg-2">{BRAND.name}</span>
        <span className="status-item">
          {stats.blocks} blocks · {stats.modules.toLocaleString('en-US')} modules
        </span>
      </div>
      <div className="status-group">
        <span className="status-item" title={sync?.origin ?? 'No WilliamsPod connection on this device'}>
          sync {sync === null ? '—' : sync.connected ? `williamspod${sync.lastSync ? ` · ${ago(sync.lastSync)}` : ''}` : 'off'}
        </span>
        <span className="status-item">
          theme {appearance ? (appearance.mode === 'auto' ? `auto·${appearance.dark ? 'dark' : 'light'}` : appearance.mode) : '—'}
        </span>
        <button type="button" className="status-item" onClick={openSearch}>
          ⌘K search
        </button>
        <button type="button" className="status-item" onClick={openAsk}>
          ⌘J ask
        </button>
        <span className="status-item">{BRAND.namespace}</span>
      </div>
    </footer>
  );
}
