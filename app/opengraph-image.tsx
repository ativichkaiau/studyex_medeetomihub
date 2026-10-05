import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from '../lib/brand';
import { INDEX_STATS, TRAP_COUNT } from '../lib/indexStats';
import { COMPOUND, drawMolecule } from '../lib/molecule';

// The link preview for every page: the logotype beside its mark (the
// dexmedetomidine skeletal formula), what the product is, and the index counts
// from this build. Rendered once at build time.
export const alt = `${BRAND.name} — ${BRAND.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (dir: string, file: string) => readFile(join(process.cwd(), 'node_modules/geist/dist/fonts', dir, file));

const INK = '#f1f2ef';
const MUTED = '#7d828a';
const ACCENT = '#5c80ff';

export default async function OpenGraphImage() {
  const [mono, monoSemi, sans] = await Promise.all([
    font('geist-mono', 'GeistMono-Regular.ttf'),
    font('geist-mono', 'GeistMono-SemiBold.ttf'),
    font('geist-sans', 'Geist-Regular.ttf'),
  ]);
  const stats: [string, number][] = [
    ['blocks', INDEX_STATS.blocks],
    ['lectures', INDEX_STATS.lectures],
    ['modules', INDEX_STATS.modules],
    ['exam_traps', TRAP_COUNT],
  ];
  const m = drawMolecule({ bond: 44 });
  const box = m.labels[0]?.size ?? 22;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px',
          background: '#090a0b',
          color: INK,
          fontFamily: 'Geist Mono',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: MUTED, letterSpacing: 2 }}>
          <span>~/overview</span>
          <span>{BRAND.namespace} // SATELLITE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 740 }}>
            <div style={{ display: 'flex', fontSize: 23, color: ACCENT, letterSpacing: 4 }}>MEDICAL KNOWLEDGE RUNTIME</div>
            <div style={{ display: 'flex', marginTop: 18, fontSize: 58, fontWeight: 600, letterSpacing: -1.5 }}>
              {BRAND.name}
              <span style={{ color: ACCENT }}>_</span>
            </div>
            <div style={{ display: 'flex', marginTop: 22, maxWidth: 700, fontFamily: 'Geist', fontSize: 29, lineHeight: 1.35, color: '#a4a8ae' }}>
              {BRAND.description}
            </div>
          </div>

          <div style={{ display: 'flex', position: 'relative', width: m.width, height: m.height }}>
            <svg width={m.width} height={m.height} viewBox={`0 0 ${m.width} ${m.height}`} style={{ position: 'absolute', left: 0, top: 0 }}>
              {[...m.bonds, ...m.hashes].map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={INK} strokeWidth={m.stroke} strokeLinecap="round" />
              ))}
            </svg>
            {m.labels.map((l, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: l.x - box,
                  top: l.y - box,
                  width: box * 2,
                  height: box * 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: l.size,
                  fontWeight: 600,
                  color: ACCENT,
                }}
              >
                {l.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 26, borderTop: '1px solid #30353d', fontSize: 23 }}>
          <div style={{ display: 'flex', gap: 40 }}>
            {stats.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: MUTED }}>{label}</span>
                <span>{value.toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', color: MUTED }}>
            {COMPOUND.formulaParts.map(([el, n]) => (
              <div key={el} style={{ display: 'flex' }}>
                <span>{el}</span>
                <span style={{ fontSize: 16, marginTop: 11, letterSpacing: -0.5 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Geist Mono', data: mono, weight: 400 },
        { name: 'Geist Mono', data: monoSemi, weight: 600 },
        { name: 'Geist', data: sans, weight: 400 },
      ],
    },
  );
}
