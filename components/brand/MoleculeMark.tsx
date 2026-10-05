import { drawMolecule, type MoleculeDrawing, type Segment } from '../../lib/molecule';

// The studyex mark — dexmedetomidine as a skeletal formula (lib/molecule.ts).
// "full" is the labelled formula; "glyph" drops the letters and marks the two
// nitrogens with accent dots, for small sizes. Bonds take the text colour, the
// nitrogens the accent (nitrogen is blue in the usual atom colouring). Size it
// with a height class; the width follows.

const FULL = drawMolecule({ bond: 20 });
const GLYPH = drawMolecule({ bond: 20, labels: false, stroke: 0.12 });

const r2 = (n: number) => Math.round(n * 100) / 100;

function Lines({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (
        <line key={i} x1={r2(s.x1)} y1={r2(s.y1)} x2={r2(s.x2)} y2={r2(s.y2)} />
      ))}
    </>
  );
}

export default function MoleculeMark({
  variant = 'glyph',
  className = '',
  title,
}: {
  variant?: 'full' | 'glyph';
  className?: string;
  title?: string;
}) {
  const d: MoleculeDrawing = variant === 'full' ? FULL : GLYPH;
  return (
    <svg
      viewBox={`0 0 ${r2(d.width)} ${r2(d.height)}`}
      className={`molecule ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth={r2(d.stroke)} strokeLinecap="round" fill="none">
        <Lines segments={d.bonds} />
        <Lines segments={d.hashes} />
      </g>
      {variant === 'glyph'
        ? d.nitrogens.map((n, i) => <circle key={i} cx={r2(n.x)} cy={r2(n.y)} r={r2(d.stroke * 1.9)} className="molecule-n" />)
        : d.labels.map((l, i) => (
            <text key={i} x={r2(l.x)} y={r2(l.y)} fontSize={r2(l.size)} textAnchor="middle" dominantBaseline="central" className="molecule-n">
              {l.text}
            </text>
          ))}
    </svg>
  );
}
