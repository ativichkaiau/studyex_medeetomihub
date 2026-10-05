import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import AskAI from '../components/AskAI';
import CommandPalette from '../components/CommandPalette';
import Sidebar from '../components/shell/Sidebar';
import MobileBar from '../components/shell/MobileBar';
import StatusBar from '../components/shell/StatusBar';
import ShellRuntime from '../components/shell/ShellRuntime';
import ShortcutHelp from '../components/shell/ShortcutHelp';
import { ThemeRuntime } from '../components/shell/prefs';
import { BRAND, SITE_URL } from '../lib/brand';
import { INDEX_STATS } from '../lib/indexStats';
import { appearanceScript } from '../lib/appearance';
import { motionScript } from '../lib/motion';
import Formula from '../components/brand/Formula';
import MoleculeMark from '../components/brand/MoleculeMark';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} // ${BRAND.kind}`,
    template: `%s // ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: `${BRAND.name} // ${BRAND.kind}`,
    description: BRAND.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} // ${BRAND.kind}`,
    description: BRAND.description,
  },
  appleWebApp: {
    title: BRAND.short,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090a0b' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

// Applied before paint: the appearance (no flash of the wrong theme) and the
// motion gate. With JS off, or reduced motion asked for, .motion is never set
// and nothing animates.
const preferenceScript = `${appearanceScript}\n${motionScript}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
        <a href="#main" className="skip-link">
          skip to content
        </a>
        <ThemeRuntime />
        <ShellRuntime />
        <Sidebar stats={INDEX_STATS} />
        <div className="app-viewport">
          <MobileBar stats={INDEX_STATS} />
          {children}
          <footer className="site-footer">
            <span className="flex items-center gap-2">
              <MoleculeMark className="h-4 w-auto text-fg-3" />
              <span>
                {BRAND.name}
                <span className="text-accent">_</span> · <Formula />
              </span>
            </span>
            <span>
              namespace {BRAND.namespace} · runtime {BRAND.runtime} · alongside your OnePagers
            </span>
          </footer>
        </div>
        <StatusBar stats={INDEX_STATS} />
        <CommandPalette />
        <ShortcutHelp />
        <AskAI />
      </body>
    </html>
  );
}
