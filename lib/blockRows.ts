// One row per curriculum block, as the library and the overview index it.
// Server-only (reads the content graph).

import { curriculum, lecturesBySubject, referenceFrameworkByCode, subjectSlug } from '../content';
import { yearCode } from './paths';
import type { BlockRow } from '../components/library/BlockTable';

export function blockRows(): { rows: BlockRow[]; years: { code: string; label: string }[] } {
  const rows: BlockRow[] = [];
  for (const y of curriculum) {
    for (const s of y.subjects) {
      const mods = lecturesBySubject[s.code] ?? [];
      const framework = referenceFrameworkByCode[s.code];
      const lectures = new Set(mods.map((l) => l.source)).size;
      rows.push({
        code: s.code,
        name: s.name,
        slug: subjectSlug(s.code),
        year: yearCode(y.year, y.label),
        yearLabel: y.label,
        lectures,
        modules: mods.length,
        traps: mods.reduce((n, l) => n + l.traps.length, 0),
        status: framework
          ? mods.length === 0
            ? 'framework'
            : lectures >= framework.chapters.length
              ? 'indexed'
              : 'partial'
          : mods.length
            ? 'indexed'
            : 'empty',
        unit: y.label === 'Reference' ? 'chapter' : 'lecture',
        chapters: framework?.chapters.length,
      });
    }
  }
  const years = curriculum.map((y) => ({ code: yearCode(y.year, y.label), label: y.label === 'Reference' ? 'reference' : y.label }));
  return { rows, years };
}
