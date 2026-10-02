'use client';

import { useEffect, useState } from 'react';
import { getBookmarks } from '../../lib/user/bookmarks';
import { getRepairQueue } from '../../lib/repair/store';
import { getStreak, getVisited } from '../../lib/user/activity';
import { readJSON } from '../../lib/user/store';

// Counts that live on this device rather than in the build.
export default function LiveCount({ of }: { of: 'saved' | 'repair' | 'seen' | 'cards' | 'streak' }) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (of === 'saved') setValue(String(getBookmarks().length));
    else if (of === 'seen') setValue(getVisited().length.toLocaleString('en-US'));
    else if (of === 'cards') setValue((readJSON<{ studied?: number }>('wh-flashcards', {}).studied ?? 0).toLocaleString('en-US'));
    else if (of === 'streak') setValue(`${getStreak().count} d`);
    else setValue(`${getRepairQueue().filter((i) => !i.completed_at).length} open`);
  }, [of]);
  return <span className="tabular">{value ?? '—'}</span>;
}
