'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BRAND } from '../../lib/brand';
import { openSearch } from '../../lib/events';
import Brand from './Brand';
import NavList from './NavList';
import { PrefsRows } from './prefs';
import SystemReadout, { type IndexStats } from './SystemReadout';
import Dialog from '../ui/Dialog';

// Below 1024px: the brand, search, and a menu that opens the whole sidebar as
// a drawer. Navigating, or Esc, closes it.
export default function MobileBar({ stats }: { stats: IndexStats }) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => wide.matches && setOpen(false);
    wide.addEventListener('change', onWide);
    return () => {
      wide.removeEventListener('change', onWide);
    };
  }, [open]);

  return (
    <>
      <div className="app-mobilebar">
        <Brand sub={false} className="mr-auto min-w-0 overflow-hidden" />
        <button type="button" className="bar-btn" onClick={openSearch} aria-label="Search and commands">
          search
        </button>
        <button
          type="button"
          className="bar-btn"
          aria-expanded={open}
          aria-controls="app-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>
      {open ? (
        <Dialog id="app-drawer" label="Menu" onClose={() => setOpen(false)} drawer>
          <div className="app-mobilebar">
            <Brand sub={false} className="mr-auto min-w-0 overflow-hidden" />
            <button type="button" className="bar-btn" onClick={openSearch} aria-label="Search and commands">search</button>
            <button type="button" className="bar-btn" data-autofocus onClick={() => setOpen(false)} aria-label="Close menu">close</button>
          </div>
          <nav className="sb-block" aria-label="Main">
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </nav>
          <div className="sb-block">
            <div className="sb-heading">system</div>
            <SystemReadout stats={stats} />
          </div>
          <div className="sb-block">
            <div className="sb-heading">prefs</div>
            <PrefsRows />
          </div>
          <div className="sb-block font-mono text-[11px] text-fg-3">
            {BRAND.name} · a {BRAND.namespace} satellite
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
