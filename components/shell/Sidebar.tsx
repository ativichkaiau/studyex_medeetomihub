'use client';

import { usePathname } from 'next/navigation';
import { BRAND } from '../../lib/brand';
import { openSearch, openShortcuts } from '../../lib/events';
import Brand from './Brand';
import NavList from './NavList';
import { PrefsRows } from './prefs';
import SystemReadout, { type IndexStats } from './SystemReadout';

export default function Sidebar({ stats }: { stats: IndexStats }) {
  const pathname = usePathname() ?? '/';
  return (
    <aside className="app-sidebar" aria-label={BRAND.name}>
      <div className="sb-block pb-4 pt-5">
        <Brand />
      </div>
      <div className="sb-block">
        <button type="button" onClick={openSearch} className="search-trigger" aria-label="Search and commands (Command K)">
          <span className="flex-1">search…</span>
          <kbd className="kbd">⌘K</kbd>
        </button>
      </div>
      <nav className="sb-block" aria-label="Main">
        <NavList pathname={pathname} />
      </nav>
      <div className="sb-block">
        <div className="sb-heading">system</div>
        <SystemReadout stats={stats} />
      </div>
      <div className="sb-block">
        <div className="sb-heading">prefs</div>
        <PrefsRows />
      </div>
      <div className="sb-block mt-auto flex items-center justify-between gap-3 font-mono text-[11px] text-fg-3">
        <span>
          namespace <span className="text-fg-2">{BRAND.namespace}</span>
        </span>
        <button type="button" onClick={openShortcuts} className="hover:text-fg" aria-label="Keyboard shortcuts">
          <kbd className="kbd">?</kbd>
        </button>
      </div>
    </aside>
  );
}
