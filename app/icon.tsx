import { ImageResponse } from 'next/og';
import { IconArt } from '../components/brand/iconArt';

// The app icon: the studyex mark (dexmedetomidine) on the dark ground. The
// 32px tab favicon is app/icon1.tsx, drawn heavier for that size.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<IconArt size={512} inset={60} radius={96} />, size);
}
