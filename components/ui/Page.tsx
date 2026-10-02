import type { ReactNode } from 'react';
import PathBar from './PathBar';
import type { Crumb } from '../../lib/paths';

export type PageWidth = 'w-doc' | 'w-mid' | 'w-wide';

// Every route renders through this: its path, then the main column.
export default function Page({
  crumbs,
  aside,
  width = 'w-wide',
  children,
}: {
  crumbs: Crumb[];
  aside?: ReactNode;
  width?: PageWidth | string;
  children: ReactNode;
}) {
  return (
    <>
      <PathBar crumbs={crumbs} aside={aside} />
      <main id="main" className="page">
        <div className={`mx-auto ${width}`}>{children}</div>
      </main>
    </>
  );
}
