import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ghpRedirects = JSON.parse(readFileSync(new URL('./content/ghp-redirects.json', import.meta.url), 'utf8'));

// The build stamp shown in the shell: the commit and the date of this build.
function buildSha() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'local';
  }
}
const now = new Date();
const buildDate = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: buildSha(),
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  async redirects() {
    return [
      // Serve historical chapter links as HTTP redirects, including without JS.
      ...Object.entries(ghpRedirects).flatMap(([from, to]) =>
        ['/lecture-set', '/practice/lecture'].map((prefix) => ({
          source: `${prefix}/${from}`,
          destination: `${prefix}/${to}`,
          permanent: true,
        })),
      ),
      // The saved and progress views were once the "garage" and "standings".
      { source: '/garage', destination: '/saved', permanent: true },
      { source: '/standings', destination: '/progress', permanent: true },
    ];
  },
};

export default nextConfig;
