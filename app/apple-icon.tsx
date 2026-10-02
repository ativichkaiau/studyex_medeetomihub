import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 46px',
          background: '#090a0b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ color: '#f1f2ef', fontSize: 106, fontWeight: 700, lineHeight: 0.8, letterSpacing: -3 }}>s</div>
          <div style={{ width: 45, height: 12, background: '#5c80ff' }} />
        </div>
      </div>
    ),
    size,
  );
}
