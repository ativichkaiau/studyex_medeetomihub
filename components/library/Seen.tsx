'use client';

import { useEffect, useState } from 'react';
import { getVisited } from '../../lib/user/activity';

// Coverage from this device. Server-rendered pages stay static; these fill in
// after mount, so the first paint always matches the server.

/** "3/6" — how many of these modules have been opened here. */
export function SeenCount({ ids, label = '' }: { ids: string[]; label?: string }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    const visited = new Set(getVisited());
    setN(ids.filter((id) => visited.has(id)).length);
  }, [ids]);
  return (
    <span className="tabular" title={n === null ? undefined : `${n} of ${ids.length} opened on this device`}>
      {label}
      {n === null ? '—' : n}/{ids.length}
    </span>
  );
}

/** Marks every [data-mid] row whose module has been opened, once mounted. */
export function SeenMarker() {
  useEffect(() => {
    const visited = new Set(getVisited());
    for (const el of document.querySelectorAll<HTMLElement>('[data-mid]')) {
      if (visited.has(el.dataset.mid ?? '')) el.dataset.seen = 'true';
    }
  }, []);
  return null;
}
