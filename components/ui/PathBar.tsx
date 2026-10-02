import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import ScrollProgress from '../shell/ScrollProgress';
import type { Crumb } from '../../lib/paths';

// The structural path every page opens with: ~/library/HCVS-2/L04/av_block.
// Each segment is a real route; the last is the current page. Its bottom rule
// fills with reading progress (components/shell/ScrollProgress.tsx).
export default function PathBar({ crumbs, aside }: { crumbs: Crumb[]; aside?: ReactNode }) {
  return (
    <div className="pathbar">
      <nav aria-label="Path" className="path">
        <Link href="/" className="path-root" aria-label="Overview">
          ~
        </Link>
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <span className="path-sep" aria-hidden="true">
                /
              </span>
              {last || !crumb.href ? (
                <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </Fragment>
          );
        })}
      </nav>
      {aside ? <div className="pathbar-aside">{aside}</div> : null}
      <ScrollProgress />
    </div>
  );
}
