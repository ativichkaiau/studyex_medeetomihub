'use client';

import { useEffect, useState } from 'react';
import { getLastSync, getPodConnection } from '../../lib/sync/podConnector';

export interface SyncState {
  connected: boolean;
  origin: string | null;
  lastSync: string | null;
}

/** The WilliamsPod bridge as configured on this device; null before mount. */
export function useSyncState(): SyncState | null {
  const [state, setState] = useState<SyncState | null>(null);
  useEffect(() => {
    const read = () => {
      const conn = getPodConnection();
      let origin: string | null = null;
      if (conn) {
        try {
          origin = new URL(conn.baseUrl).host;
        } catch {
          origin = conn.baseUrl;
        }
      }
      setState({ connected: Boolean(conn), origin, lastSync: getLastSync() });
    };
    read();
    window.addEventListener('focus', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('focus', read);
      window.removeEventListener('storage', read);
    };
  }, []);
  return state;
}
