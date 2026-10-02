'use client';

import { useEffect, useRef } from 'react';
import { registerProgressBar } from './progressStore';

// The reading-progress rule along the bottom of the path bar. It registers
// itself once hydrated, so the shell never writes to markup React still owns.
export default function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => (ref.current ? registerProgressBar(ref.current) : undefined), []);
  return <span ref={ref} className="scroll-progress" aria-hidden="true" />;
}
