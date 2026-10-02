'use client';

import { useEffect, useState } from 'react';
import { isBookmarked, toggleBookmark } from '../lib/user/bookmarks';

// Save (pin) a module. Local-only; hydrates after mount to avoid a
// server/client mismatch (localStorage is client-only).
export default function BookmarkButton({ moduleId }: { moduleId: string }) {
  const [starred, setStarred] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStarred(isBookmarked(moduleId));
    setReady(true);
  }, [moduleId]);

  const on = ready && starred;
  return (
    <button
      type="button"
      onClick={() => setStarred(toggleBookmark(moduleId))}
      aria-pressed={on}
      aria-label={on ? 'Remove from saved' : 'Save module'}
      className="btn"
    >
      <span aria-hidden="true">{on ? '★' : '☆'}</span>
      {on ? 'saved' : 'save'}
    </button>
  );
}
