// The compact build-time index (public/search-index.json, written by
// scripts/generate-search-index.ts). Client components that only need titles
// for ids they hold in localStorage read it here: one fetch per page load,
// shared, so the content graph never ships in a bundle.

export interface IndexEntry {
  k: 'm' | 'l' | 's' | 'f'; // module | lecture | subject (block) | framework chapter
  t: string; // title / label
  u: string; // url
  s?: string | null; // subject code
  sub?: string; // source label (module context)
  tg?: string; // tag labels (search terms)
  id?: string; // module id
}

let pending: Promise<IndexEntry[]> | null = null;

export function loadSearchIndex(): Promise<IndexEntry[]> {
  pending ??= fetch('/search-index.json')
    .then((r) => {
      if (!r.ok) throw new Error(`index ${r.status}`);
      return r.json() as Promise<IndexEntry[]>;
    })
    .catch((error) => {
      pending = null; // let the next caller retry
      throw error;
    });
  return pending;
}

/** module id → its index entry. */
export function moduleEntries(entries: IndexEntry[]): Record<string, IndexEntry> {
  const map: Record<string, IndexEntry> = {};
  for (const e of entries) if (e.k === 'm' && e.id) map[e.id] = e;
  return map;
}
