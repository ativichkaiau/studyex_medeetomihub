// Structural names for the interface: the pseudo-paths and ids the shell shows
// (~/library/HCVS-2/L04/av_block). Display only — real routes never change.
// Pure, so server and client components can share them.

/** "L4 — Antiarrhythmic Drugs" → "L04"; "Ch 13 — …" → "CH13"; "Case 2 — …" → "CASE02". */
export function lectureCode(source: string): string {
  const pad = (n: string) => n.padStart(2, '0');
  let m = source.match(/^L(\d+)/i);
  if (m) return `L${pad(m[1])}`;
  m = source.match(/^Ch\s*(\d+)/i);
  if (m) return `CH${pad(m[1])}`;
  m = source.match(/^Case\s*(\d+)/i);
  if (m) return `CASE${pad(m[1])}`;
  if (/^Additional Topics/i.test(source)) return 'ADD';
  return source.split(/\s+—\s+/)[0].replace(/\s+/g, '_').toUpperCase().slice(0, 12);
}

/** The lecture's own name, without its number: "Antiarrhythmic Drugs". */
export function lectureName(source: string): string {
  if (/^Additional Topics/i.test(source)) return 'Additional topics';
  const parts = source.split(/\s+—\s+/);
  return parts.length > 1 ? parts.slice(1).join(' — ') : source;
}

/** "av-block" → "av_block": module ids read as identifiers. */
export function snake(id: string): string {
  return id.replace(/-/g, '_');
}

/** 1 → "01" (counts and ordinals in two-digit columns). */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
}

/** Year as the shell writes it: Y1 · Y2 · Y3 · REF. */
export function yearCode(year: number, label?: string): string {
  if (label === 'Reference' || year > 3) return 'REF';
  return `Y${year}`;
}

export interface Crumb {
  label: string;
  href?: string;
}
