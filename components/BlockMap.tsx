'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlockGraphView } from '../lib/integrations/graphView';

// Whole-block graph — a radial view of a subject's lectures (nodes) and how
// densely they cross-link (chords). Node size = hub degree; edge width = link
// weight. Pure computed SVG from a serializable model; hover or focus to trace,
// click or Enter to open.

const VB = 620;
const CENTER = VB / 2;
const RADIUS = 232;

export default function BlockMap({ view, unitLabel = 'lecture' }: { view: BlockGraphView; unitLabel?: 'chapter' | 'lecture' }) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, edges } = view;

  const pos = useMemo(() => {
    const n = Math.max(1, nodes.length);
    const map = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      map.set(node.slug, { x: CENTER + RADIUS * Math.cos(a), y: CENTER + RADIUS * Math.sin(a) });
    });
    return map;
  }, [nodes]);

  const maxDeg = useMemo(() => Math.max(1, ...nodes.map((n) => n.degree)), [nodes]);
  const maxW = useMemo(() => Math.max(1, ...edges.map((e) => e.weight)), [edges]);
  const radiusOf = (deg: number) => 13 + 13 * (deg / maxDeg);

  // Slugs connected to the hovered node (for highlight/dim).
  const connected = useMemo(() => {
    if (!hover) return new Set<string>();
    const s = new Set<string>();
    for (const e of edges) {
      if (e.a === hover) s.add(e.b);
      if (e.b === hover) s.add(e.a);
    }
    return s;
  }, [hover, edges]);

  const hoveredNode = hover ? nodes.find((n) => n.slug === hover) : null;
  const go = (slug: string) => router.push(`/lecture-set/${slug}`);

  return (
    <div>
      <div className="mx-auto max-w-[30rem]">
        <svg viewBox={`0 0 ${VB} ${VB}`} width="100%" className="overflow-visible" role="img" aria-label="Block integration map">
          {/* edges */}
          <g>
            {edges.map((e, i) => {
              const pa = pos.get(e.a);
              const pb = pos.get(e.b);
              if (!pa || !pb) return null;
              const touches = hover && (e.a === hover || e.b === hover);
              const w = 1.2 + 3 * (e.weight / maxW);
              const opacity = hover ? (touches ? 0.95 : 0.06) : 0.18 + 0.4 * (e.weight / maxW);
              return (
                <line
                  key={i}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  className={touches ? 'stroke-warn' : 'stroke-accent'}
                  strokeWidth={touches ? w + 1 : w}
                  strokeLinecap="round"
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* center caption */}
          <text x={CENTER} y={CENTER - 6} textAnchor="middle" className="fill-fg-2 font-mono" fontSize="17" fontWeight="600">
            {view.subjectCode}
          </text>
          <text x={CENTER} y={CENTER + 16} textAnchor="middle" className="fill-fg-3 font-mono" fontSize="12">
            {nodes.length} {unitLabel}s · {edges.length} links
          </text>

          {/* nodes */}
          <g>
            {nodes.map((node) => {
              const p = pos.get(node.slug);
              if (!p) return null;
              const r = radiusOf(node.degree);
              const isHover = hover === node.slug;
              const isConn = connected.has(node.slug);
              const dim = hover && !isHover && !isConn;
              return (
                <g
                  key={node.slug}
                  transform={`translate(${p.x},${p.y})`}
                  role="link"
                  tabIndex={0}
                  aria-label={`${node.source} — ${node.moduleCount} modules`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setHover(node.slug)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(node.slug)}
                  onBlur={() => setHover(null)}
                  onClick={() => go(node.slug)}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault();
                      go(node.slug);
                    }
                  }}
                  opacity={dim ? 0.3 : 1}
                >
                  <circle
                    r={r}
                    className={isHover || isConn ? 'fill-raised stroke-warn' : 'fill-panel stroke-accent'}
                    strokeWidth={isHover ? 2.5 : 1.5}
                  />
                  <text textAnchor="middle" dy="0.35em" className="fill-fg font-mono" fontSize={r > 18 ? 13 : 11} fontWeight="600">
                    {node.short}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <p className="mx-auto mt-2 min-h-[2.25rem] max-w-md text-center font-mono text-[11.5px] leading-5 text-fg-3">
        {hoveredNode ? (
          <span>
            <span className="text-fg">{hoveredNode.short}</span> · {hoveredNode.label} · {hoveredNode.moduleCount} module
            {hoveredNode.moduleCount === 1 ? '' : 's'} · {connected.size} linked {unitLabel}
            {connected.size === 1 ? '' : 's'}
          </span>
        ) : (
          `hover a ${unitLabel} to trace its links · click to open it · larger node = more connected`
        )}
      </p>
    </div>
  );
}
