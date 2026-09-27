import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Header from '../components/Header';
import AskAI from '../components/AskAI';
import LiveryMotion from '../components/LiveryMotion';
import { appearanceScript } from '../lib/appearance';
import { depthScript } from '../lib/depth';

export const metadata: Metadata = {
  title: 'WilliamsHub — Study OS',
  description:
    'High-yield, mechanism-driven, exam-focused lecture pages built from MedCMU lectures. A VESTRIPPN satellite.',
  icons: {
    // The Williams W-mark (public/icon.png, 512×512).
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
};

// Applied before paint to avoid a flash of the wrong theme, and to arm the
// livery motion. Gating .motion here (rather than in CSS) means that with JS
// off — or with reduced motion asked for — the reveal styles never apply and
// every section renders visible and static. Depth is armed the same way, so
// the first frame already has its dimension and nothing lurches forward.
const themeScript = `${appearanceScript}\n(function(){try{if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches&&localStorage.getItem('wh-motion')!=='paused')document.documentElement.classList.add('motion');else document.documentElement.setAttribute('data-motion-paused','');}catch(e){}})();\n${depthScript}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-slate-800 antialiased dark:text-slate-200">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="page-decoration" aria-hidden="true" />
        <LiveryMotion />
        <Header />
        {children}
        <Link
          href="/"
          aria-label="VESTRIPPN3.0 · M-8"
          className="brand-signature fixed bottom-5 left-5 z-20 hidden rounded bg-[var(--canvas)] px-2 py-1.5 transition hover:text-[var(--accent)] 2xl:inline-flex"
        >
          VESTRIPPN<span className="text-[#2E5BFF] dark:text-[#7AA0FF]">3.0</span>&nbsp;·&nbsp;M-8
        </Link>
        <AskAI />
      </body>
    </html>
  );
}
