import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from '../lib/brand';
import { INDEX_STATS, TRAP_COUNT } from '../lib/indexStats';

// The link preview for every page: the logotype, what the product is, and the
// index counts from this build. Rendered once at build time.
export const alt = `${BRAND.name} — ${BRAND.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (dir: string, file: string) => readFile(join(process.cwd(), 'node_modules/geist/dist/fonts', dir, file));

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

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: '#090a0b',
          color: '#f1f2ef',
          fontFamily: 'Geist Mono',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#7d828a', letterSpacing: 2 }}>
          <span>~/overview</span>
          <span>{BRAND.namespace} // SATELLITE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, color: '#5c80ff', letterSpacing: 4 }}>MEDICAL KNOWLEDGE RUNTIME</div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 76, fontWeight: 600, letterSpacing: -2 }}>
            {BRAND.name}
            <span style={{ color: '#5c80ff' }}>_</span>
          </div>
          <div style={{ display: 'flex', marginTop: 24, maxWidth: 940, fontFamily: 'Geist', fontSize: 31, lineHeight: 1.35, color: '#a4a8ae' }}>
            {BRAND.description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 44, paddingTop: 28, borderTop: '1px solid #30353d', fontSize: 24 }}>
          {stats.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#7d828a' }}>{label}</span>
              <span>{value.toLocaleString('en-US')}</span>
            </div>
          ))}
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
