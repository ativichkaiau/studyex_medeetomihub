import { ImageResponse } from 'next/og';
import { IconArt } from '../components/brand/iconArt';

// The tab favicon: the same mark with heavier bonds and without the inner
// double-bond lines, which blur together at 32px.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function SmallIcon() {
  return new ImageResponse(<IconArt size={32} inset={2} radius={6} stroke={0.24} doubles={false} />, size);
}
