import { drawMolecule } from '../../lib/molecule';

// The app icon: the dexmedetomidine glyph, bonds in ink and the nitrogens as
// accent dots, centred on the dark ground. Shared by app/icon.tsx and
// app/apple-icon.tsx (rendered with next/og, so colours are literal).
export function IconArt({
  size,
  inset,
  radius = 0,
  stroke = 0.15,
  doubles = true,
}: {
  size: number;
  inset: number;
  radius?: number;
  stroke?: number;
  doubles?: boolean;
}) {
  const span = size - inset * 2;
  const unit = drawMolecule({ bond: 1, labels: false });
  const bond = span / unit.width;
  const m = drawMolecule({ bond, labels: false, stroke, doubles });
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090a0b',
        borderRadius: radius,
      }}
    >
      <svg width={m.width} height={m.height} viewBox={`0 0 ${m.width} ${m.height}`}>
        {[...m.bonds, ...m.hashes].map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#f1f2ef" strokeWidth={m.stroke} strokeLinecap="round" />
        ))}
        {m.nitrogens.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={m.stroke * 1.9} fill="#5c80ff" />
        ))}
      </svg>
    </div>
  );
}
