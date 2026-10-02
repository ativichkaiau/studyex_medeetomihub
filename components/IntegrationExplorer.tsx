'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type {
  EdgeView,
  ModuleGraphView,
  RepairView,
  TrapView,
} from '../lib/integrations/graphView';
import type { IntegrationStrength } from '../lib/integrations/types';
import { getWeakModules } from '../lib/user/weakness';

// Active Integration — interactive map + list. Renders from a fully-resolved,
// serializable view-model (no content imports → tiny client bundle). The map is
// HTML nodes with a measured SVG edge overlay drawn behind them.

type Cat = 'prerequisite' | 'forward' | 'horizontal' | 'vertical';

interface CatMeta {
  label: string;
  color: string; // a --cat-* token, as an rgb() colour
}

const CAT: Record<Cat, CatMeta> = {
  prerequisite: { label: 'prerequisite', color: 'rgb(var(--cat-pre))' },
  forward: { label: 'leads_to', color: 'rgb(var(--cat-fwd))' },
  horizontal: { label: 'peer', color: 'rgb(var(--cat-peer))' },
  vertical: { label: 'clinical', color: 'rgb(var(--cat-clin))' },
};

const STRENGTH_TAG: Record<IntegrationStrength, string> = {
  critical: 'tag tag-danger',
  strong: 'tag tag-warn',
  moderate: 'tag',
  weak: 'tag tag-muted',
};

const STRENGTH_LINE: Record<IntegrationStrength, { w: number; o: number }> = {
  critical: { w: 2.6, o: 0.9 },
  strong: { w: 2, o: 0.75 },
  moderate: { w: 1.5, o: 0.6 },
  weak: { w: 1, o: 0.45 },
};

// ── shared bits ──────────────────────────────────────────────────────────────

function SubjectCode({ code }: { code: string | null }) {
  if (!code) return null;
  return <span className="flex-none font-mono text-[10.5px] text-fg-3">{code}</span>;
}

function Swatch({ cat }: { cat: Cat }) {
  return <span aria-hidden="true" className="h-2 w-2 flex-none rounded-[2px]" style={{ background: CAT[cat].color }} />;
}

// ── MAP ──────────────────────────────────────────────────────────────────────

interface Seg {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cat: Cat;
  strength: IntegrationStrength;
  weak: boolean;
}

function NodeCard({
  edge,
  cat,
  onHover,
  weak,
}: {
  edge: EdgeView;
  cat: Cat;
  onHover: (id: string | null) => void;
  weak: boolean;
}) {
  return (
    <Link
      href={`/lecture/${edge.id}`}
      data-node={edge.id}
      data-cat={cat}
      data-strength={edge.strength}
      data-weak={weak ? '1' : undefined}
      onMouseEnter={() => onHover(edge.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(edge.id)}
      onBlur={() => onHover(null)}
      title={weak ? 'A weak spot for you — this link is worth drilling' : undefined}
      className={`flex max-w-[15rem] items-center gap-2 rounded-sm border bg-panel px-2.5 py-1.5 hover:bg-raised ${
        weak ? 'border-warn/70' : 'border-line-strong'
      }`}
    >
      <Swatch cat={cat} />
      <span className="truncate text-[12.5px] font-medium text-fg">{edge.title}</span>
      {weak ? <span className="tag tag-warn">weak</span> : null}
      <SubjectCode code={edge.subjectCode} />
    </Link>
  );
}

function Group({
  cat,
  edges,
  layout,
  onHover,
  weak,
}: {
  cat: Cat;
  edges: EdgeView[];
  layout: 'band' | 'column';
  onHover: (id: string | null) => void;
  weak: Set<string>;
}) {
  if (edges.length === 0) return null;
  const align = cat === 'prerequisite' ? 'sm:items-end' : cat === 'forward' ? 'sm:items-start' : 'items-center';
  return (
    <div className={`flex flex-col gap-1.5 ${layout === 'column' ? align : 'items-center'}`}>
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-3">
        <Swatch cat={cat} />
        {CAT[cat].label}
      </div>
      <div className={layout === 'band' ? 'flex flex-wrap justify-center gap-1.5' : 'flex flex-col gap-1.5'}>
        {edges.map((e) => (
          <NodeCard key={e.id} edge={e} cat={cat} onHover={onHover} weak={weak.has(e.id)} />
        ))}
      </div>
    </div>
  );
}

function MapView({ view, weak }: { view: ModuleGraphView; weak: Set<string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cRect = container.getBoundingClientRect();
      const centerEl = container.querySelector('[data-center]');
      if (!centerEl) return;
      const cc = centerEl.getBoundingClientRect();
      const cx = cc.left + cc.width / 2 - cRect.left;
      const cy = cc.top + cc.height / 2 - cRect.top;

      const next: Seg[] = [];
      container.querySelectorAll('[data-node]').forEach((el) => {
        const r = el.getBoundingClientRect();
        next.push({
          id: el.getAttribute('data-node') ?? '',
          x1: cx,
          y1: cy,
          x2: r.left + r.width / 2 - cRect.left,
          y2: r.top + r.height / 2 - cRect.top,
          cat: (el.getAttribute('data-cat') as Cat) ?? 'horizontal',
          strength: (el.getAttribute('data-strength') as IntegrationStrength) ?? 'weak',
          weak: el.getAttribute('data-weak') === '1',
        });
      });
      setSegs(next);
      setDims({ w: cRect.width, h: cRect.height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [view]);

  const showEdges = dims.w >= 560;
  const hoveredEdge = hovered
    ? [...view.prerequisite, ...view.forward, ...view.horizontal, ...view.vertical].find((e) => e.id === hovered)
    : null;

  return (
    <div>
      <div ref={containerRef} className="relative">
        {showEdges ? (
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={dims.w}
            height={dims.h}
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            aria-hidden="true"
          >
            {segs.map((s, n) => {
              const dim = hovered && hovered !== s.id;
              const on = hovered === s.id;
              const line = STRENGTH_LINE[s.strength];
              return (
                <g key={`${s.cat}-${s.id}-${n}`}>
                  {s.weak ? (
                    <line
                      x1={s.x1}
                      y1={s.y1}
                      x2={s.x2}
                      y2={s.y2}
                      style={{ stroke: 'var(--warning)' }}
                      strokeWidth={(on ? line.w + 1 : line.w) + 3}
                      strokeLinecap="round"
                      opacity={dim ? 0.08 : 0.3}
                    />
                  ) : null}
                  <line
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    style={{ stroke: CAT[s.cat].color }}
                    strokeWidth={on ? line.w + 1 : line.w}
                    strokeLinecap="round"
                    opacity={dim ? 0.1 : on ? 1 : line.o}
                  />
                </g>
              );
            })}
          </svg>
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-3">
          <Group cat="horizontal" edges={view.horizontal} layout="band" onHover={setHovered} weak={weak} />

          <div className="grid w-full items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <Group cat="prerequisite" edges={view.prerequisite} layout="column" onHover={setHovered} weak={weak} />

            <div data-center className="mx-auto max-w-[16rem] rounded-sm border border-accent/70 bg-root px-4 py-2.5 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">this module</div>
              <div className="mt-0.5 text-[13.5px] font-semibold leading-tight text-fg">{view.center.title}</div>
              {view.center.subjectCode ? <div className="mt-1 font-mono text-[10.5px] text-fg-3">{view.center.subjectCode}</div> : null}
            </div>

            <Group cat="forward" edges={view.forward} layout="column" onHover={setHovered} weak={weak} />
          </div>

          <Group cat="vertical" edges={view.vertical} layout="band" onHover={setHovered} weak={weak} />
        </div>
      </div>

      <p className="mt-4 flex min-h-[1.25rem] flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-mono text-[11.5px] text-fg-3">
        {hoveredEdge ? (
          <>
            <span className="font-sans text-[12.5px] text-fg-2">{hoveredEdge.reason}</span>
            {hoveredEdge.via ? <span className="tag">via {hoveredEdge.via}</span> : null}
            {hoveredEdge.evidence ? <span className="tag tag-muted">{hoveredEdge.evidence}</span> : null}
          </>
        ) : segs.some((s) => s.weak) ? (
          'weak = a spot you keep missing; those links are marked. hover a node to see how it connects.'
        ) : (
          'hover a node to see how it connects · click to open the module'
        )}
      </p>

      {view.traps.length > 0 || view.repair.length > 0 ? (
        <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          <TrapSection traps={view.traps} />
          <RepairSection items={view.repair} />
        </div>
      ) : null}
    </div>
  );
}

// ── LIST ─────────────────────────────────────────────────────────────────────

function EdgeRow({ edge, weak }: { edge: EdgeView; weak: boolean }) {
  return (
    <li className="flex items-start gap-2 text-[13.5px] leading-snug">
      <span className={STRENGTH_TAG[edge.strength]}>{edge.strength}</span>
      <span>
        {weak ? <span className="tag tag-warn mr-1.5">weak</span> : null}
        <Link href={`/lecture/${edge.id}`} className="font-medium text-fg underline decoration-line-strong decoration-dotted underline-offset-[3px] hover:text-accent">
          {edge.title}
        </Link>{' '}
        <SubjectCode code={edge.subjectCode} />
        <span className="text-fg-2"> — {edge.reason}</span>
        {edge.via ? <span className="tag ml-1.5">via {edge.via}</span> : null}
        {edge.evidence ? <span className="tag tag-muted ml-1.5">{edge.evidence}</span> : null}
      </span>
    </li>
  );
}

function EdgeSection({ cat, edges, weak }: { cat: Cat; edges: EdgeView[]; weak: Set<string> }) {
  if (edges.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-3">
        <Swatch cat={cat} />
        {CAT[cat].label}
      </h4>
      <ul className="grid gap-2">
        {edges.map((e) => (
          <EdgeRow key={e.id} edge={e} weak={weak.has(e.id)} />
        ))}
      </ul>
    </div>
  );
}

function TrapSection({ traps }: { traps: TrapView[] }) {
  if (traps.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-danger">exam_traps</h4>
      <div className="grid gap-2">
        {traps.map((t, i) => (
          <div key={i} className="trap text-[13.5px]">
            <div className="trap-head">
              <span className="trap-category">{t.questionCategory}</span>
            </div>
            <div className="trap-row">
              <span className="trap-key" data-tone="danger">
                ✗ instinct
              </span>
              <span className="trap-wrong">{t.wrongInstinct}</span>
            </div>
            <div className="trap-row">
              <span className="trap-key" data-tone="ok">
                ✓ answer
              </span>
              <span className="font-medium text-fg">{t.rightAnswer}</span>
            </div>
            {t.relatedId ? (
              <div className="trap-row">
                <span className="trap-key">review</span>
                <span>
                  <Link href={`/lecture/${t.relatedId}`} className="xref">
                    {t.relatedTitle ?? t.relatedId.replace(/-/g, ' ')}
                  </Link>{' '}
                  <SubjectCode code={t.relatedSubject ?? null} />
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RepairSection({ items }: { items: RepairView[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-warn">repair_recommendations</h4>
      <ul className="grid gap-2">
        {items.map((r, i) => (
          <li key={`${r.id}-${i}`} className="flex items-start gap-2 text-[13.5px] leading-snug">
            <span className={STRENGTH_TAG[r.strength]}>{r.strength}</span>
            <span>
              <span className="text-fg-3">{r.trigger} → </span>
              <Link href={`/lecture/${r.id}`} className="font-medium text-fg underline decoration-line-strong decoration-dotted underline-offset-[3px] hover:text-accent">
                {r.title}
              </Link>{' '}
              <SubjectCode code={r.subjectCode} />
              {r.reason ? <span className="text-fg-2"> — {r.reason}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListView({ view, weak }: { view: ModuleGraphView; weak: Set<string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <EdgeSection cat="prerequisite" edges={view.prerequisite} weak={weak} />
      <EdgeSection cat="forward" edges={view.forward} weak={weak} />
      <EdgeSection cat="horizontal" edges={view.horizontal} weak={weak} />
      <EdgeSection cat="vertical" edges={view.vertical} weak={weak} />
      <TrapSection traps={view.traps} />
      <RepairSection items={view.repair} />
    </div>
  );
}

// ── shell ────────────────────────────────────────────────────────────────────

export default function IntegrationExplorer({ view }: { view: ModuleGraphView }) {
  // A module whose links are all traps/repair has nothing to plot — open on List.
  const [mode, setMode] = useState<'map' | 'list'>(view.edgeCount > 0 ? 'map' : 'list');

  // Personal weak-spot set — filled after mount (localStorage is client-only, and
  // an empty initial set keeps the server/first-paint markup identical → no
  // hydration mismatch). Recomputed when the user returns to the tab.
  const [weak, setWeak] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const refresh = () => setWeak(getWeakModules());
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  return (
    <div>
      <div className="modebar mb-5" role="tablist" aria-label="Integration view">
        {(['map', 'list'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      {mode === 'map' ? <MapView view={view} weak={weak} /> : <ListView view={view} weak={weak} />}
    </div>
  );
}
