'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Dialog from './ui/Dialog';
import { usePathname } from 'next/navigation';
import { ASK_OPEN_EVENT } from '../lib/events';
import { snake } from '../lib/paths';

// Global study tutor (⌘J). Streams from /api/ask, where the OpenAI key lives
// server-side. On a /lecture/<id> page it passes moduleId so answers are
// grounded in the module the student is reading.

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS_MODULE = [
  'Explain this module simply',
  'Give me 3 exam pearls',
  'What are the classic traps here?',
];
const SUGGESTIONS_GENERAL = [
  'Compare UMN vs LMN signs',
  'Approach to microcytic anaemia',
  'Mechanism of β-lactam resistance',
];

/** Minimal inline renderer: **bold** only, newlines preserved. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-fg">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function AskAI() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setMounted(true), []);

  const moduleId = pathname?.startsWith('/lecture/') ? decodeURIComponent(pathname.slice('/lecture/'.length)) : undefined;

  // ⌘J / Ctrl-J toggles; the dialog handles dismissal and focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Opened from a page's "ask" button or the status bar.
  useEffect(() => {
    const openEvt = () => setOpen(true);
    window.addEventListener(ASK_OPEN_EVENT, openEvt);
    return () => window.removeEventListener(ASK_OPEN_EVENT, openEvt);
  }, []);

  // Restore the conversation on load, then keep it in sync (survives navigation).
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wh-ask-ai');
      if (saved) setMessages(JSON.parse(saved) as Msg[]);
    } catch {
      /* ignore corrupt/absent state */
    }
  }, []);
  useEffect(() => {
    if (streaming) return; // don't thrash storage on every token
    try {
      if (messages.length) localStorage.setItem('wh-ask-ai', JSON.stringify(messages.slice(-40)));
      else localStorage.removeItem('wh-ask-ai');
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [messages, streaming]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || streaming) return;
      setError(null);
      setInput('');
      const next: Msg[] = [...messages, { role: 'user', content: q }, { role: 'assistant', content: '' }];
      setMessages(next);
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next.filter((m) => m.content || m.role === 'user'), moduleId }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Request failed (${res.status}).`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = prev.slice();
            copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + chunk };
            return copy;
          });
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message);
          setMessages((prev) => prev.slice(0, -1)); // drop the empty assistant turn
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, moduleId, streaming],
  );

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput('');
  };

  const suggestions = moduleId ? SUGGESTIONS_MODULE : SUGGESTIONS_GENERAL;

  return (
    <>
      {/* The desktop status bar carries its own trigger; this one is for touch. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask the tutor"
        className="btn no-print fixed bottom-4 right-4 z-30 h-10 shadow-[var(--shadow-overlay)] lg:hidden"
      >
        ask
      </button>

      {mounted && open
        ? (
            <Dialog label="Ask the tutor" onClose={() => setOpen(false)} className="max-w-2xl">
                <div className="dialog-head">
                  <span className="uppercase">ask</span>
                  <span className="text-fg-3">//</span>
                  <span className="uppercase text-fg">tutor</span>
                  {moduleId ? (
                    <span className="tag tag-accent ml-1 max-w-[46%] truncate normal-case" title="Answers are grounded in this module">
                      context: {snake(moduleId)}
                    </span>
                  ) : null}
                  <span className="flex-1" />
                  {messages.length > 0 ? (
                    <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
                      clear
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setOpen(false)} className="kbd" aria-label="Close">
                    esc
                  </button>
                </div>

                <div ref={scrollRef} className="min-h-[220px] flex-1 overflow-y-auto px-4 py-4">
                  {messages.length === 0 ? (
                    <div>
                      <p className="font-mono text-[12px] text-fg-3">
                        {moduleId ? '# grounded in this module' : '# ask anything in your curriculum'}
                      </p>
                      <div className="mt-3 grid gap-1">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => send(s)}
                            className="palette-item rounded-sm border-l-0 px-2 hover:bg-raised"
                          >
                            <span className="font-mono text-[13px] text-fg-2">
                              <span className="text-accent">›</span> {s}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {messages.map((m, i) => (
                        <div key={i} className="reveal-in grid gap-1.5">
                          <span className={`font-mono text-[10.5px] uppercase tracking-[0.08em] ${m.role === 'user' ? 'text-accent' : 'text-fg-3'}`}>
                            {m.role === 'user' ? 'you' : 'tutor'}
                          </span>
                          <div
                            className={
                              m.role === 'user'
                                ? 'whitespace-pre-wrap rounded-sm border border-line bg-raised px-3 py-2 text-[14px] leading-relaxed text-fg'
                                : 'whitespace-pre-wrap text-[14px] leading-relaxed text-fg-2'
                            }
                          >
                            {m.role === 'assistant' ? (
                              m.content ? (
                                <RichText text={m.content} />
                              ) : (
                                <span className="font-mono text-[12px] text-fg-3">generating…</span>
                              )
                            ) : (
                              m.content
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {error ? (
                    <div className="mt-4 border-l-2 border-danger bg-raised px-3 py-2 font-mono text-[12px]">
                      <p className="text-danger">REQUEST_FAILED</p>
                      <p className="mt-1 text-fg-2">{error}</p>
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-line p-3">
                  <div className="flex items-end gap-2 rounded-sm border border-line-strong bg-root px-2.5 py-2 focus-within:border-accent">
                    <span aria-hidden="true" className="pb-[3px] font-mono text-[13px] text-accent">
                      &gt;
                    </span>
                    <textarea
                      data-autofocus
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          send(input);
                        }
                      }}
                      rows={1}
                      aria-label="Question"
                      placeholder={moduleId ? 'ask about this module…' : 'ask a study question…'}
                      className="max-h-32 min-h-[22px] flex-1 resize-none bg-transparent text-[14px] text-fg outline-none placeholder:font-mono placeholder:text-[12.5px] placeholder:text-fg-3"
                    />
                    <button
                      type="button"
                      onClick={() => send(input)}
                      disabled={!input.trim() || streaming}
                      className="btn btn-sm"
                    >
                      {streaming ? 'streaming…' : 'send ↵'}
                    </button>
                  </div>
                  <p className="px-1 pt-2 font-mono text-[10.5px] text-fg-3">
                    revision support — verify against primary sources · enter send · shift+enter newline
                  </p>
                </div>
            </Dialog>
          )
        : null}
    </>
  );
}
