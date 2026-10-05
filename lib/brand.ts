// Brand constants for studyex_medeetomihub. The product name is always
// lowercase; the trailing underscore of the mark doubles as a cursor.

export const BRAND = {
  name: 'studyex_medeetomihub',
  mark: 'studyex_medeetomihub_',
  short: 'studyex',
  namespace: 'VESTRIPPN',
  runtime: 'MEDCMU',
  kind: 'Study OS',
  tagline: 'medical knowledge runtime',
  description: 'Medical lecture index, recall engine, exam-trap database and OnePager archive.',
} as const;

// Where the app is served: canonical URLs and link previews resolve against it.
// Set NEXT_PUBLIC_SITE_URL on Vercel to move domains. WilliamsPod keeps its own
// copy of this origin (its DEFAULT_HUB), so a move must be mirrored there.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyex-medeetomihub.vercel.app';

// Stamped at build time in next.config.mjs. Both are real: the commit the
// bundle was built from (falls back to "local" outside git) and the build date.
export const BUILD = {
  sha: process.env.NEXT_PUBLIC_BUILD_SHA || 'local',
  date: process.env.NEXT_PUBLIC_BUILD_DATE || '',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
} as const;
