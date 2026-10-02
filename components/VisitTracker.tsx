'use client';

import { useEffect } from 'react';
import { markVisited, touchStreak } from '../lib/user/activity';
import { logActivity } from '../lib/user/eventLog';

// Silent: records that this module was opened (coverage + the activity log)
// and keeps the day streak alive. Renders nothing.
export default function VisitTracker({ moduleId }: { moduleId: string }) {
  useEffect(() => {
    markVisited(moduleId);
    touchStreak();
    logActivity({ type: 'module.open', ref: moduleId });
  }, [moduleId]);
  return null;
}
