'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { openSearch } from '../lib/events';

// A useful 404: what was asked for, what kind of record it would have been,
// and the nearest place to go instead.
function classify(path: string): { code: string; kind: string; back: { href: string; label: string } } {
  if (path.startsWith('/lecture-set/')) return { code: 'LECTURE_NOT_FOUND', kind: 'lecture', back: { href: '/library', label: 'return to library' } };
  if (path.startsWith('/lecture/')) return { code: 'MODULE_NOT_FOUND', kind: 'module', back: { href: '/library', label: 'return to library' } };
  if (path.startsWith('/subject/')) return { code: 'BLOCK_NOT_FOUND', kind: 'block', back: { href: '/library', label: 'return to library' } };
  if (path.startsWith('/practice')) return { code: 'SCOPE_NOT_FOUND', kind: 'practice scope', back: { href: '/practice', label: 'return to practice' } };
  if (path.startsWith('/flashcards')) return { code: 'DECK_NOT_FOUND', kind: 'deck', back: { href: '/flashcards', label: 'return to cards' } };
  return { code: 'ROUTE_NOT_FOUND', kind: 'route', back: { href: '/', label: 'return to overview' } };
}

export default function NotFoundBody() {
  const path = usePathname() ?? '';
  const info = classify(path);
  return (
    <div>
      <p className="label text-danger">{info.code}</p>
      <h1 className="page-title">Nothing is indexed at this path.</h1>
      <dl className="kv mt-6">
        <dt>requested</dt>
        <dd className="break-all">{path || '—'}</dd>
        <dt>record</dt>
        <dd>{info.kind}</dd>
        <dt>status</dt>
        <dd>404</dd>
        <dt>action</dt>
        <dd>{info.back.label}</dd>
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={info.back.href} className="btn btn-primary">
          {info.back.label} <span aria-hidden="true">→</span>
        </Link>
        <button type="button" onClick={openSearch} className="btn">
          search <span className="btn-key">⌘K</span>
        </button>
      </div>
    </div>
  );
}
