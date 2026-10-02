import type { MetadataRoute } from 'next';
import { BRAND } from '../lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.short,
    description: BRAND.description,
    id: '/',
    scope: '/',
    start_url: '/',
    lang: 'en',
    categories: ['education', 'medical'],
    display: 'standalone',
    background_color: '#090a0b',
    theme_color: '#090a0b',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
