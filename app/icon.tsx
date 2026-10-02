import { ImageResponse } from 'next/og';

// The mark: an "s" at a prompt, with the brand's cursor underscore in accent.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 132px',
          background: '#090a0b',
          borderRadius: 96,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22 }}>
          <div style={{ color: '#f1f2ef', fontSize: 300, fontWeight: 700, lineHeight: 0.8, letterSpacing: -8 }}>s</div>
          <div style={{ width: 128, height: 34, background: '#5c80ff' }} />
        </div>
      </div>
    ),
    size,
  );
}
