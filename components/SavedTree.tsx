'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarks, getNotes, toggleBookmark } from '../lib/user/bookmarks';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../lib/searchIndex';
import { lectureCode, snake } from '../lib/paths';
import EmptyState from './ui/EmptyState';

function groupBySubject(ids: string[], byId: Record<string, IndexEntry>): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const id of ids) {
    const code = byId[id]?.s ?? 'unsorted';
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code)!.push(id);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// saved/ and notes/ as trees: pinned modules and per-module notes, grouped by
// block. Everything here lives on this device.
export default function SavedTree() {
  const [ready, setReady] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [byId, setById] = useState<Record<string, IndexEntry>>({});

  useEffect(() => {
    setBookmarks(getBookmarks());
    setNotes(getNotes());
    loadSearchIndex()
      .then((index) => setById(moduleEntries(index)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const unpin = (id: string) => {
    toggleBookmark(id);
    setBookmarks(getBookmarks());
  };

  const noteIds = Object.keys(notes).filter((id) => notes[id]?.trim());

  if (!ready) return <p className="font-mono text-[12px] text-fg-3">restoring saved records…</p>;

  if (bookmarks.length === 0 && noteIds.length === 0) {
    return (
      <EmptyState lines={['saved/', '└── empty', '', 'notes/', '└── empty']}>
        Use <span className="font-mono text-fg">☆ save</span> on any module to pin it here, and write in its notes section as you study. Everything stays on this device.
      </EmptyState>
    );
  }

  const title = (id: string) => byId[id]?.t ?? id.replace(/-/g, ' ');
  const where = (id: string) => (byId[id]?.sub ? lectureCode(byId[id].sub as string) : '');

  return (
    <div className="grid gap-8">
      <section aria-labelledby="saved-tree">
        <h2 id="saved-tree" className="sec-label">
          <span>saved/</span>
          <span className="sec-meta">
            {bookmarks.length} record{bookmarks.length === 1 ? '' : 's'}
          </span>
        </h2>
        {bookmarks.length === 0 ? (
          <pre className="tree text-fg-3">{'saved/\n└── empty'}</pre>
        ) : (
          <div className="panel px-3 py-3 sm:px-4">
            <ul className="tree">
              {groupBySubject(bookmarks, byId).map(([code, ids], gi, groups) => {
                const lastGroup = gi === groups.length - 1;
                return (
                  <li key={code}>
                    <div className="tree-row">
                      <span className="tree-glyph">{lastGroup ? '└── ' : '├── '}</span>
                      <span className="tree-dir">{code}/</span>
                    </div>
                    <ul>
                      {ids.map((id, i) => (
                        <li key={id} className="tree-row group pr-1">
                          <span className="tree-glyph">{`${lastGroup ? '    ' : '│   '}${i === ids.length - 1 ? '└── ' : '├── '}`}</span>
                          <Link href={`/lecture/${id}`} className="flex min-w-0 flex-1 items-baseline gap-3 rounded-sm px-1 hover:bg-raised">
                            <span className="truncate text-fg">{snake(id)}</span>
                            <span className="hidden min-w-0 truncate font-sans text-[13px] text-fg-3 sm:block">
                              {title(id)}
                              {where(id) ? ` · ${where(id)}` : ''}
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => unpin(id)}
                            className="btn btn-ghost btn-sm ml-2 text-fg-3"
                            aria-label={`Remove ${title(id)} from saved`}
                          >
                            unpin
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {noteIds.length > 0 ? (
        <section aria-labelledby="notes-tree">
          <h2 id="notes-tree" className="sec-label">
            <span>notes/</span>
            <span className="sec-meta">
              {noteIds.length} file{noteIds.length === 1 ? '' : 's'}
            </span>
          </h2>
          <ul className="grid gap-3">
            {noteIds.map((id) => (
              <li key={id} className="panel">
                <div className="panel-head">
                  <Link href={`/lecture/${id}#notes`} className="panel-title truncate normal-case tracking-normal hover:text-accent">
                    {byId[id]?.s ? `${byId[id].s}/` : ''}
                    {snake(id)}.md
                  </Link>
                  <span className="panel-meta truncate">{title(id)}</span>
                </div>
                <p className="whitespace-pre-wrap px-4 py-3 text-[14px] leading-6 text-fg">{notes[id]}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
