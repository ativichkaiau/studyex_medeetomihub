import type { CSSProperties, ReactNode } from 'react';

// Primitives for the route skeletons (app/**/loading.tsx). Each route composes
// its own layout from these, in the shape of the page it stands in for, and
// opts into one motif from globals.css ("Skeletons") that says what it is
// waiting for. Everything here is static markup — no client JavaScript.

export type Vars = CSSProperties & { [key: `--${string}`]: string | number };

// The page's own container, a status line for assistive tech, and the sheet
// the layout lies on. In depth the sheet is tipped back into the scene, in the
// exact pose the real page arrives from.
export function SkeletonPage({
  width,
  label,
  className = 'py-8',
  children,
}: {
  width: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className={`skeleton-stage mx-auto px-5 ${width} ${className}`} aria-busy="true">
      <p role="status" className="sr-only">
        {label}
      </p>
      <div className="sk-plane" aria-hidden="true">
        {children}
      </div>
    </main>
  );
}

// One placeholder bar. `z` lifts it off the sheet (px at full depth); `i`
// staggers its sweep and any motif it belongs to.
export function Bar({
  w = '100%',
  h = 12,
  z,
  i,
  className = '',
  style,
}: {
  w?: string | number;
  h?: string | number;
  z?: number;
  i?: number;
  className?: string;
  style?: Vars;
}) {
  const s: Vars = { width: w, height: h, ...style };
  if (z !== undefined) s['--z'] = z;
  if (i !== undefined) s['--i'] = i;
  return <span className={`sk${z !== undefined ? ' sk-z' : ''} ${className}`} style={s} />;
}

// Lines of body text, ragged like real prose.
export function Lines({
  widths,
  h = 10,
  gap = 8,
  i = 0,
  className = '',
}: {
  widths: (string | number)[];
  h?: number;
  gap?: number;
  i?: number;
  className?: string;
}) {
  return (
    <div className={className} style={{ display: 'grid', gap }}>
      {widths.map((w, n) => (
        <Bar key={n} w={w} h={h} i={i + n} />
      ))}
    </div>
  );
}

// A raised panel, floating `z` px above the sheet at full depth.
export function Panel({
  z = 16,
  i,
  className = '',
  style,
  children,
}: {
  z?: number;
  i?: number;
  className?: string;
  style?: Vars;
  children?: ReactNode;
}) {
  const s: Vars = { '--z': z, ...style };
  if (i !== undefined) s['--i'] = i;
  return (
    <div className={`sk-card sk-z ${className}`} style={s}>
      {children}
    </div>
  );
}

// The three-stripe livery mark that heads most pages.
export function Slashes({ z = 10 }: { z?: number }) {
  return (
    // The skew lives on an inner box: a Tailwind transform on the outer one
    // would replace the lift instead of composing with it.
    <span className="sk-z inline-flex shrink-0" style={{ '--z': z } as Vars}>
      <span className="inline-flex h-[14px] w-[29px] -skew-x-[24deg] gap-[3px]">
        <span className="w-3 bg-[var(--stripe-ink)] opacity-60" />
        <span className="w-[5px] bg-[var(--wm-red)] opacity-60" />
        <span className="w-[5px] bg-[var(--wm-yellow)] opacity-60" />
      </span>
    </span>
  );
}

// Section heading used inside panels: a coloured dot and a label.
export function Label({ w = 120, dot = 'bg-[var(--accent)]', className = 'mb-4' }: { w?: number; dot?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full opacity-70 ${dot}`} />
      <Bar w={w} h={11} className="sk-ink" />
    </div>
  );
}

// Header for the hub pages: livery mark + eyebrow, title, standfirst.
export function EyebrowHeader({
  eyebrow = 96,
  title = '34%',
  lines = ['88%', '61%'],
  className = 'mb-6',
}: {
  eyebrow?: number;
  title?: string;
  lines?: string[];
  className?: string;
}) {
  return (
    <header className={className}>
      <div className="flex items-center gap-3">
        <Slashes />
        <Bar w={eyebrow} h={9} />
      </div>
      <Bar w={title} h={30} z={8} className="sk-ink mt-3.5" />
      <Lines widths={lines} className="mt-3.5" />
    </header>
  );
}

// Header for the study sessions: back link, livery stripe, label, title.
export function LiveryHeader({
  back = 180,
  label = 90,
  title = '58%',
  lines = ['92%', '54%'],
  pill = false,
}: {
  back?: number;
  label?: number;
  title?: string;
  lines?: string[];
  pill?: boolean;
}) {
  return (
    <>
      <Bar w={back} h={13} />
      <header className="mb-6 mt-4">
        <Bar h={6} z={14} className="sk-livery mb-4 rounded-full" />
        <div className="flex items-center gap-2">
          <Bar w={label} h={10} className="sk-accent" />
          {pill ? <Bar w={40} h={18} z={10} className="rounded-lg" /> : null}
        </div>
        <Bar w={title} h={30} z={8} className="sk-ink mt-2" />
        <Lines widths={lines} className="mt-3" />
      </header>
    </>
  );
}

// The session progress track and its counter.
export function ProgressRow() {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="sk-well h-1.5 flex-1 rounded-full" />
      <Bar w={36} h={10} />
    </div>
  );
}

export function FooterBar({ className = 'mt-10' }: { className?: string }) {
  return (
    <footer className={`flex justify-center ${className}`}>
      <Bar w={220} h={9} />
    </footer>
  );
}
