'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRepairQueue } from '../lib/repair/store';
import { getVisited } from '../lib/user/activity';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../lib/searchIndex';
import { snake } from '../lib/paths';

function Targets({ label, tone, ids, byId }: { label: string; tone: 'danger' | 'accent'; ids: string[]; byId: Record<string, IndexEntry> }) {
  if (ids.length === 0) return null;
  return (
    <div className="p-4">
      <p className={`label mb-2 ${tone === 'danger' ? 'text-danger' : ''}`}>{label}</p>
      <ul className="tree">
        {ids.map((id, i) => (
          <li key={id}>
            <Link href={`/practice/${id}`} className="tree-row gap-2 pr-2">
              <span className="tree-glyph">{i === ids.length - 1 ? '└──' : '├──'}</span>
              <span className="min-w-0 flex-1 truncate font-sans text-[13.5px] text-fg">{byId[id]?.t ?? id.replace(/-/g, ' ')}</span>
              <span className="hidden font-mono text-[10.5px] text-fg-3 sm:inline">{byId[id]?.s ?? snake(id)}</span>
              <span className="cmd-arrow text-fg-3">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Quick targets from this device: modules in the repair queue, and the ones
// you opened most recently. Hidden until there is something to show.
export default function PracticeLauncher() {
  const [ready, setReady] = useState(false);
  const [weak, setWeak] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [byId, setById] = useState<Record<string, IndexEntry>>({});

  useEffect(() => {
    const repair = getRepairQueue().filter((i) => !i.completed_at);
    setWeak([...new Set(repair.map((i) => i.module_id))].slice(0, 8));
    setRecent([...getVisited()].reverse().slice(0, 8));
    loadSearchIndex()
      .then((index) => setById(moduleEntries(index)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready || (weak.length === 0 && recent.length === 0)) return null;

  return (
    <section className="gridlines mb-8 md:grid-cols-2" aria-label="Quick targets">
      {weak.length ? <Targets label="target: weak spots" tone="danger" ids={weak} byId={byId} /> : null}
      {recent.length ? <Targets label="target: recently studied" tone="accent" ids={recent} byId={byId} /> : null}
    </section>
  );
}
