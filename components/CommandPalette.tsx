'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Dialog from './ui/Dialog';
import { useRouter } from 'next/navigation';
import { NAV } from './shell/nav';
import { SEARCH_OPEN_EVENT, openAsk, openShortcuts } from '../lib/events';
import { setAppearance } from '../lib/appearance';
import { setMotion } from '../lib/motion';
import { loadSearchIndex, moduleEntries, type IndexEntry } from '../lib/searchIndex';
import { getVisited } from '../lib/user/activity';
import { getActivity } from '../lib/user/eventLog';
import { lectureCode, lectureName } from '../lib/paths';

// ⌘K — search the whole index and run commands. Empty, it lists commands and
// the modules you opened last; typing filters both; a leading ">" keeps it to
// commands. The index is fetched on first open (public/search-index.json), so
// no content ships in the bundle.

interface Command {
  id: string;
  label: string;
  hint: string;
  keys?: string;
  run: () => void;
}

type Item = { kind: 'command'; command: Command } | { kind: 'entry'; entry: IndexEntry };

const GROUP_LABEL: Record<IndexEntry['k'], string> = { s: 'blocks', l: 'lectures', m: 'modules', f: 'chapters' };

function scoreEntry(e: IndexEntry, tokens: string[]): number {
  const title = e.t.toLowerCase();
  const hay = `${e.t} ${e.s ?? ''} ${e.sub ?? ''} ${e.tg ?? ''}`.toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (hay.indexOf(tok) === -1) return -1; // every token must appear somewhere
    const at = title.indexOf(tok);
    if (at === 0) score += 100;
    else if (at > 0 && title[at - 1] === ' ') score += 60;
    else if (at > 0) score += 40;
    else score += 14; // matched only in tags / subject / source
  }
  if (title === tokens.join(' ')) score += 200;
  if (e.k === 's') score += 8; // nudge block-level hits up a touch
  return score - e.t.length * 0.04; // prefer concise titles
}

/** The structural context printed above a result: HCVS-2 / L04. */
function contextOf(e: IndexEntry): string {
  if (e.k === 's') return e.s ?? 'block';
  if (e.k === 'l') return [e.s, lectureCode(e.t)].filter(Boolean).join(' / ');
  if (e.k === 'f') return [e.s, lectureCode(e.t)].filter(Boolean).join(' / ');
  return [e.s, e.sub ? lectureCode(e.sub) : null].filter(Boolean).join(' / ');
}

function titleOf(e: IndexEntry): string {
  if (e.k === 's') return e.t.split(' — ').slice(1).join(' — ') || e.t;
  if (e.k === 'l' || e.k === 'f') return lectureName(e.t);
  return e.t;
}

export default function CommandPalette() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const load = useCallback(() => {
    setFailed(false);
    loadSearchIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    load();
  }, [load]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // ⌘K / Ctrl-K toggles from anywhere; the shell opens it by event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(SEARCH_OPEN_EVENT, show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(SEARCH_OPEN_EVENT, show);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    // Most recent first, de-duplicated: the activity log, then older coverage.
    const opened = getActivity()
      .filter((e) => e.type === 'module.open' && e.ref)
      .map((e) => e.ref as string)
      .reverse();
    const visited = [...getVisited()].reverse();
    setRecent([...new Set([...opened, ...visited])].slice(0, 5));
  }, [open]);

  const commands: Command[] = useMemo(() => {
    const go = (href: string) => () => router.push(href);
    return [
      ...NAV.map((item) => ({ id: `go-${item.label}`, label: `go ${item.label}`, hint: item.hint, keys: `g ${item.key}`, run: go(item.href) })),
      { id: 'go-onepagers', label: 'go onepagers', hint: 'the OnePager archive', run: go('/library/onepagers') },
      { id: 'ask', label: 'ask tutor', hint: 'open the study tutor', keys: '⌘J', run: () => openAsk() },
      { id: 'theme-auto', label: 'theme auto', hint: 'follow local time', run: () => setAppearance('auto') },
      { id: 'theme-light', label: 'theme light', hint: 'always light', run: () => setAppearance('light') },
      { id: 'theme-dark', label: 'theme dark', hint: 'always dark', run: () => setAppearance('dark') },
      { id: 'motion-on', label: 'motion on', hint: 'enable transitions', run: () => setMotion(true) },
      { id: 'motion-off', label: 'motion off', hint: 'disable transitions', run: () => setMotion(false) },
      { id: 'keys', label: 'keyboard shortcuts', hint: 'list every binding', keys: '?', run: () => openShortcuts() },
    ];
  }, [router]);

  const groups = useMemo(() => {
    const raw = query.trim().toLowerCase();
    const commandOnly = raw.startsWith('>');
    const text = commandOnly ? raw.slice(1).trim() : raw;
    const tokens = text.split(/\s+/).filter(Boolean);
    const out: { label: string; items: Item[] }[] = [];

    const matched = tokens.length ? commands.filter((c) => tokens.every((t) => `${c.label} ${c.hint}`.includes(t))) : commands;

    if (!tokens.length && !commandOnly) {
      if (index && recent.length) {
        const byId = moduleEntries(index);
        const items = recent.map((id) => byId[id]).filter(Boolean).map((entry) => ({ kind: 'entry' as const, entry }));
        if (items.length) out.push({ label: 'recent', items });
      }
      out.push({ label: 'commands', items: matched.map((command) => ({ kind: 'command' as const, command })) });
      return out;
    }
    if (commandOnly) {
      out.push({ label: 'commands', items: matched.map((command) => ({ kind: 'command' as const, command })) });
      return out;
    }

    if (matched.length) out.push({ label: 'commands', items: matched.slice(0, 4).map((command) => ({ kind: 'command' as const, command })) });
    if (index) {
      const hits = index
        .map((e) => ({ e, score: scoreEntry(e, tokens) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 40)
        .map((x) => x.e);
      for (const k of ['s', 'l', 'm', 'f'] as const) {
        const items = hits.filter((e) => e.k === k).map((entry) => ({ kind: 'entry' as const, entry }));
        if (items.length) out.push({ label: GROUP_LABEL[k], items });
      }
    }
    return out;
  }, [query, commands, index, recent]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => setActive(0), [query]);

  const run = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      setOpen(false);
      if (item.kind === 'command') requestAnimationFrame(item.command.run);
      else router.push(item.entry.u);
    },
    [router],
  );

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(a + 1, flat.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, flat.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // Keep the active row in view.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, groups]);

  if (!mounted || !open) return null;

  const searching = query.trim() !== '' && !query.trim().startsWith('>');
  let n = -1;

  return (
    <Dialog label="Search and commands" onClose={close}>
        <div className="dialog-head">
          <span aria-hidden="true" className="text-accent">
            &gt;
          </span>
          <input
            ref={inputRef}
            data-autofocus
            onKeyDown={onKeyDown}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search blocks, lectures, modules…  (> for commands)"
            className="palette-input"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={flat[active] ? `palette-item-${active}` : undefined}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="kbd" onClick={close} aria-label="Close">
            esc
          </button>
        </div>

        <div ref={listRef} id="palette-results" role="listbox" aria-label="Search results" className="min-h-[120px] flex-1 overflow-y-auto pb-2">
          {searching && !index && !failed ? (
            <p className="px-4 py-6 font-mono text-[12px] text-fg-3">loading index…</p>
          ) : null}
          {failed ? (
            <div className="px-4 py-6 font-mono text-[12px] text-fg-3">
              <p className="text-danger">INDEX_UNAVAILABLE</p>
              <p className="mt-1">the search index could not be fetched.</p>
              <button type="button" onClick={load} className="cmd mt-3">
                retry →
              </button>
            </div>
          ) : null}
          {flat.length === 0 && (!searching || index) ? (
            <p role="status" className="px-4 py-6 font-mono text-[12px] text-fg-3">
              No {query.trim().startsWith('>') ? 'commands' : 'results'} for “{query.trim()}”
            </p>
          ) : null}
          {groups.map((group) => (
            <div key={group.label} role="group" aria-label={group.label}>
              <div className="palette-group">{group.label}</div>
              {group.items.map((item) => {
                n += 1;
                const i = n;
                const isActive = i === active;
                return (
                  <button
                    key={item.kind === 'command' ? item.command.id : `${item.entry.k}:${item.entry.u}`}
                    id={`palette-item-${i}`}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={isActive}
                    data-active={isActive}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(item)}
                    className="palette-item"
                  >
                    {item.kind === 'command' ? (
                      <>
                        <span className="min-w-0">
                          <span className="block font-mono text-[13px] text-fg">{item.command.label}</span>
                          <span className="palette-ctx block truncate">{item.command.hint}</span>
                        </span>
                        {item.command.keys ? <span className="kbd">{item.command.keys}</span> : null}
                      </>
                    ) : (
                      <>
                        <span className="min-w-0">
                          <span className="palette-ctx block truncate">{contextOf(item.entry)}</span>
                          <span className="palette-title block">{titleOf(item.entry)}</span>
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-3">
                          {item.entry.k === 's' ? 'block' : item.entry.k === 'l' ? 'lecture' : item.entry.k === 'f' ? 'chapter' : 'module'}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="palette-foot">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>&gt; commands</span>
          <span>esc close</span>
          {index ? <span className="ml-auto">{index.length.toLocaleString('en-US')} records</span> : null}
        </div>
    </Dialog>
  );
}
