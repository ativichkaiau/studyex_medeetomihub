'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import WilliamsHubLogo from './WilliamsHubLogo';
import CommandPalette from './CommandPalette';
import MotionToggle from './MotionToggle';
import DepthToggle from './DepthToggle';
import HubIcon, { type HubIconName } from './HubIcon';

const NAV: { href: string; icon: HubIconName; label: string }[] = [
  { href: '/flashcards', icon: 'cards', label: 'Cards' },
  { href: '/practice', icon: 'practice', label: 'Practice' },
  { href: '/standings', icon: 'progress', label: 'Progress' },
  { href: '/garage', icon: 'bookmark', label: 'Saved' },
  { href: '/repair', icon: 'repair', label: 'Repair' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-30">
      {/* Timing stripe — fills as the page scrolls (components/LiveryMotion.tsx) */}
      <div className="livery-progress h-1 w-full" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 px-5 py-3 sm:gap-x-4 md:flex-nowrap">
        <Link href="/" aria-label="WilliamsHub home" className="shrink-0 rounded-sm">
          <WilliamsHubLogo />
        </Link>

        <nav aria-label="Main navigation" className="order-3 mt-3 flex w-full items-center justify-between gap-0.5 border-t border-[var(--line)] pt-2 md:order-none md:mt-0 md:ml-auto md:w-auto md:justify-start md:border-0 md:pt-0">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
              className="header-link max-[374px]:px-1.5"
            >
              <HubIcon name={item.icon} className="hidden lg:inline-block" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center sm:gap-1 md:border-l md:border-[var(--line)] md:pl-3">
          <CommandPalette />
          <DepthToggle />
          <MotionToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
