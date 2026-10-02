// Build-time counts of the index, for the shell and the overview. Server-only:
// importing the content graph here keeps it out of every client bundle.

import { lectures, lecturesBySubject, lectureSets, referenceFrameworkByCode } from '../content';

const blockCodes = new Set([...Object.keys(lecturesBySubject), ...Object.keys(referenceFrameworkByCode)]);

export const INDEX_STATS = {
  blocks: blockCodes.size,
  lectures: lectureSets.length,
  modules: lectures.length,
};

export const TRAP_COUNT = lectures.reduce((n, l) => n + l.traps.length, 0);
