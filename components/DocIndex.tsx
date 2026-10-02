'use client';

import { useEffect, useState } from 'react';

// "On this page": built from the headings that opt in with data-toc, so it
// follows whatever the page is showing — including a module switched into
// another concept mode. The entry you are reading is marked as you scroll.

interface Item {
  id: string;
  label: string;
}

export default function DocIndex({ title = 'index', className = '' }: { title?: string; className?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById('main') ?? document.body;
    let frame = 0;
    let key = '';
    const scan = () => {
      frame = 0;
      const next = [...root.querySelectorAll<HTMLElement>('[data-toc]')]
        .filter((el) => el.id)
        .map((el) => ({ id: el.id, label: el.dataset.toc ?? el.id }));
      const nextKey = next.map((i) => i.id).join('|');
      if (nextKey !== key) {
        key = nextKey;
        setItems(next);
      }
    };
    scan();
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(scan);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    let frame = 0;
    const spy = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  if (items.length === 0) return null;
  return (
    <nav aria-label="On this page" className={className}>
      <p className="label mb-2">{title}</p>
      <ol className="grid gap-px border-l border-line">
        {items.map((item, i) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? 'location' : undefined}
                className={`-ml-px flex gap-2 border-l py-1 pl-3 pr-1 font-mono text-[11.5px] leading-snug ${
                  on ? 'border-accent text-fg' : 'border-transparent text-fg-3 hover:text-fg'
                }`}
              >
                <span className={on ? 'text-accent' : ''}>{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 break-words">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
