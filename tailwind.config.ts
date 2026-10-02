import type { Config } from 'tailwindcss';

// Colours come from the design tokens in app/globals.css, written as RGB
// channels so opacity modifiers (bg-accent/10) keep working. Never hard-code a
// colour in a component: reach for one of these.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        root: token('bg-0'),
        panel: token('bg-1'),
        raised: token('bg-2'),
        hover: token('bg-3'),
        fg: {
          DEFAULT: token('fg-0'),
          2: token('fg-1'),
          3: token('fg-2'),
        },
        line: {
          DEFAULT: token('line-0'),
          strong: token('line-1'),
        },
        accent: token('accent'),
        ok: token('ok'),
        warn: token('warn'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
      },
    },
  },
  plugins: [],
};

export default config;
