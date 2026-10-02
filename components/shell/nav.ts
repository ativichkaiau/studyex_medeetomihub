// The shell's one navigation map — sidebar, drawer, command palette and the
// g-key shortcuts all read it, so they can never disagree.

export interface NavItem {
  no: string;
  label: string;
  href: string;
  key: string; // the second key of its g-shortcut
  hint: string; // what the operation does, for the overview and palette
  match: (pathname: string) => boolean;
}

export const NAV: NavItem[] = [
  { no: '00', label: 'overview', href: '/', key: 'o', hint: 'system index and session context', match: (p) => p === '/' },
  {
    no: '01',
    label: 'library',
    href: '/library',
    key: 'l',
    hint: 'browse blocks, lectures and modules',
    match: (p) => p.startsWith('/library') || p.startsWith('/subject') || p.startsWith('/lecture'),
  },
  { no: '02', label: 'cards', href: '/flashcards', key: 'c', hint: 'active-recall decks', match: (p) => p.startsWith('/flashcards') },
  { no: '03', label: 'practice', href: '/practice', key: 'p', hint: 'run a question session', match: (p) => p.startsWith('/practice') },
  { no: '04', label: 'progress', href: '/progress', key: 't', hint: 'telemetry from this device', match: (p) => p.startsWith('/progress') },
  { no: '05', label: 'saved', href: '/saved', key: 's', hint: 'pinned modules and notes', match: (p) => p.startsWith('/saved') },
  { no: '06', label: 'repair', href: '/repair', key: 'r', hint: 'debug weak knowledge', match: (p) => p.startsWith('/repair') },
];

export const LIBRARY_VIEWS = [
  { label: 'blocks', href: '/library' },
  { label: 'onepagers', href: '/library/onepagers' },
];
