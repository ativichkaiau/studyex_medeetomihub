import type { ReactNode } from 'react';

// KICKER · META
// Title
// One line on what this is.
export default function PageHeader({
  kicker,
  title,
  lede,
  children,
  className = 'mb-8',
}: {
  kicker: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      <div className="kicker">{kicker}</div>
      <h1 className="page-title">{title}</h1>
      {lede ? <p className="page-lede">{lede}</p> : null}
      {children}
    </header>
  );
}
