import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'muted';

// Small status tags only — never a pill-shaped navigation element.
export default function Tag({ children, tone = 'neutral', className = '', title }: { children: ReactNode; tone?: Tone; className?: string; title?: string }) {
  return (
    <span className={`tag ${tone === 'neutral' ? '' : `tag-${tone}`} ${className}`} title={title}>
      {children}
    </span>
  );
}
