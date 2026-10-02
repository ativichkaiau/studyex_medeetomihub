'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVisited } from '../../lib/user/activity';
import { lastOpenedModule } from '../../lib/user/eventLog';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../../lib/searchIndex';
import { lectureCode, lectureName, snake } from '../../lib/paths';
import { ago, stamp } from '../../lib/time';

interface Context {
  id: string;
  at: string | null;
  entry: IndexEntry | null;
  blockSeen: number;
  blockTotal: number;
}

// The module you were last in, restored from this device — or an honest
// statement that there is nothing to restore.
export default function RecentContext() {
  const [state, setState] = useState<Context | null | 'empty'>(null);

  useEffect(() => {
    const visited = getVisited();
    const last = lastOpenedModule(visited);
    if (!last) {
      setState('empty');
      return;
    }
    setState({ id: last.id, at: last.at, entry: null, blockSeen: 0, blockTotal: 0 });
    loadSearchIndex()
      .then((index) => {
        const byId = moduleEntries(index);
        const entry = byId[last.id] ?? null;
        const block = entry?.s;
        const inBlock = block ? Object.values(byId).filter((e) => e.s === block) : [];
        const seen = new Set(visited);
        setState({
          id: last.id,
          at: last.at,
          entry,
          blockSeen: inBlock.filter((e) => e.id && seen.has(e.id)).length,
          blockTotal: inBlock.length,
        });
      })
      .catch(() => {});
  }, []);

  if (state === null) {
    return <p className="font-mono text-[12px] text-fg-3">restoring session…</p>;
  }
  if (state === 'empty') {
    return (
      <div className="font-mono text-[12px] leading-6">
        <p className="text-fg-2">no session context on this device.</p>
        <p className="text-fg-3">open any module and it will be restored here.</p>
        <Link href="/library" className="cmd mt-4">
          load library <span className="cmd-arrow">→</span>
        </Link>
      </div>
    );
  }

  const { entry } = state;
  const lecture = entry?.sub;
  return (
    <div>
      <p className="font-mono text-[12px] text-fg-3">
        {[entry?.s, lecture ? lectureCode(lecture) : null, snake(state.id)].filter(Boolean).join(' / ')}
      </p>
      <p className="mt-1 text-[17px] font-medium leading-snug text-fg">{entry?.t ?? state.id.replace(/-/g, ' ')}</p>
      <dl className="kv mt-4">
        {lecture ? (
          <>
            <dt>lecture</dt>
            <dd>{lectureName(lecture)}</dd>
          </>
        ) : null}
        <dt>last_open</dt>
        <dd>{state.at ? `${stamp(state.at)} · ${ago(state.at)}` : <span className="dim">before the activity log</span>}</dd>
        {state.blockTotal ? (
          <>
            <dt>block_seen</dt>
            <dd>
              {state.blockSeen} / {state.blockTotal} modules
            </dd>
          </>
        ) : null}
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href={`/lecture/${state.id}`} className="btn btn-primary">
          resume <span aria-hidden="true">→</span>
        </Link>
        {entry?.s ? (
          <Link href={`/subject/${entry.s.toLowerCase()}`} className="cmd">
            open {entry.s} <span className="cmd-arrow">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
