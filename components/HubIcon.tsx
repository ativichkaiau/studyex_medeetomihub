import type { ReactNode } from 'react';

export type HubIconName = 'cards' | 'practice' | 'progress' | 'bookmark' | 'repair' | 'search' | 'sun' | 'moon' | 'sparkles' | 'arrow' | 'book' | 'pause' | 'play' | 'cube' | 'plane';

const paths: Record<HubIconName, ReactNode> = {
  cards: <><rect x="7" y="7" width="13" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" /></>,
  practice: <><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7" /><path d="m16 3 5 5-9 9-5 1 1-5Z" /></>,
  progress: <><path d="M4 3v17h17M9 15v-4M14 15V7M19 15V4" /></>,
  bookmark: <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4Z" />,
  repair: <path d="M14 6a5 5 0 0 0-6 6L3 17a2.8 2.8 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  moon: <path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z" />,
  sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  book: <><path d="M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z" /></>,
  pause: <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>,
  play: <path d="m8 4 12 8-12 8Z" />,
  // An isometric box: three visible faces meeting at the near vertical edge.
  cube: <><path d="M12 2.6 21 7v10l-9 4.4L3 17V7Z" /><path d="M12 21.4V11.4M12 11.4 3 7M12 11.4 21 7" /></>,
  // The same box collapsed: one face, no depth.
  plane: <rect x="3.5" y="6" width="17" height="12" rx="1.5" />,
};

export default function HubIcon({ name, className = '' }: { name: HubIconName; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {paths[name]}
    </svg>
  );
}
