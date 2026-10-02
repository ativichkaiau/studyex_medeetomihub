'use client';

import { useEffect, useState } from 'react';
import { getVisited } from '../../lib/user/activity';
import { getActivity } from '../../lib/user/eventLog';

// One line under the logotype: is there a session to restore on this device?
export default function SessionStatus() {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    const seen = getVisited().length;
    const events = getActivity().length;
    setLine(
      seen || events
        ? `session restored · ${seen.toLocaleString('en-US')} module${seen === 1 ? '' : 's'} on this device`
        : 'new session · nothing stored on this device yet',
    );
  }, []);
  return (
    <p className="mt-4 min-h-[18px] font-mono text-[12px] text-fg-2">
      <span className="text-accent">›</span> {line ?? ''}
    </p>
  );
}
