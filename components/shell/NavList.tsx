'use client';

import Link from 'next/link';
import { LIBRARY_VIEWS, NAV } from './nav';

// 00 / overview … 06 / repair, with the library's two views nested under it
// while you are inside the library.
export default function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="nav-list">
      {NAV.map((item) => {
        const active = item.match(pathname);
        const exact = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="nav-link"
              aria-current={exact ? 'page' : undefined}
              data-active={active || undefined}
            >
              <span className="nav-no">{item.no}</span>
              <span>{item.label}</span>
              <span className="nav-key" aria-hidden="true">
                g {item.key}
              </span>
            </Link>
            {item.label === 'library' && active ? (
              <ul className="nav-list mt-px">
                {LIBRARY_VIEWS.map((view, i) => (
                  <li key={view.href}>
                    <Link
                      href={view.href}
                      onClick={onNavigate}
                      className="nav-link nav-sub"
                      aria-current={pathname === view.href ? 'page' : undefined}
                    >
                      <span />
                      <span className="nav-branch" aria-hidden="true">
                        {i === LIBRARY_VIEWS.length - 1 ? '└' : '├'}
                      </span>
                      <span>{view.label}</span>
                      <span />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
