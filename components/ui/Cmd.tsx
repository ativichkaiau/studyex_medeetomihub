import Link from 'next/link';
import type { ReactNode } from 'react';

// A command-like link: open →  resume →  run practice →
export default function Cmd({ href, children, className = '', external = false }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`cmd ${className}`}>
        {children} <span className="cmd-arrow" aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={`cmd ${className}`}>
      {children} <span className="cmd-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
