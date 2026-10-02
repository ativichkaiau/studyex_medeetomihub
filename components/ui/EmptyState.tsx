import type { ReactNode } from 'react';

// An empty state is a printout of the empty structure, then one line on how it
// fills — no illustrations, no encouragement.
export default function EmptyState({ lines, children, className = '' }: { lines: string[]; children?: ReactNode; className?: string }) {
  return (
    <div className={`panel px-5 py-6 ${className}`}>
      <pre className="tree whitespace-pre text-fg-2">{lines.join('\n')}</pre>
      {children ? <div className="mt-4 max-w-prose text-[13px] leading-6 text-fg-2">{children}</div> : null}
    </div>
  );
}
