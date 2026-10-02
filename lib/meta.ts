import type { Metadata } from 'next';
import { BRAND } from './brand';

// The link-preview card rendered by app/opengraph-image.tsx.
const PREVIEW = { url: '/opengraph-image', width: 1200, height: 630, alt: `${BRAND.name} — ${BRAND.description}` };

// Per-page metadata. Next replaces the layout's openGraph and twitter objects
// rather than merging them — inherited preview images included — so each page
// states its whole card here: the tab title, the description, the canonical
// URL, and the link-preview text and image.
export function pageMeta({ title, description, path }: { title?: string; description?: string; path: string }): Metadata {
  const full = title ? `${title} // ${BRAND.name}` : `${BRAND.name} // ${BRAND.kind}`;
  const text = clip(description ?? BRAND.description);
  return {
    ...(title ? { title } : {}),
    description: text,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: BRAND.name, title: full, description: text, url: path, images: [PREVIEW] },
    twitter: { card: 'summary_large_image', title: full, description: text, images: [{ url: PREVIEW.url, alt: PREVIEW.alt }] },
  };
}

/** Descriptions read best under ~160 characters; cut on a word boundary. */
export function clip(text: string, max = 160): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).replace(/[\s,;:—–-]+$/, '')}…`;
}
