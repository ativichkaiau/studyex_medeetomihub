import { ImageResponse } from 'next/og';
import { IconArt } from '../components/brand/iconArt';

// iOS masks the corners itself, so the ground is square here.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<IconArt size={180} inset={24} />, size);
}
