import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };

/**
 * Production builds are deliberately blocked by src/data/legal.ts and
 * src/data/reviews.ts until the advocate approves the legal copy and the
 * sample reviews are replaced. An unqualified build therefore defaults to a
 * noindex preview so Vercel can build the site without publishing unapproved
 * content.
 */
if (!env.PUBLIC_SITE_ENV) {
  env.PUBLIC_SITE_ENV = 'preview';
  console.warn('[rivora] PUBLIC_SITE_ENV is not set; building in preview mode (noindex).');
}

if (!env.PUBLIC_SITE_URL) {
  const host = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  if (host) {
    env.PUBLIC_SITE_URL = `https://${host.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
    console.warn(`[rivora] PUBLIC_SITE_URL is not set; using ${env.PUBLIC_SITE_URL}.`);
  } else if (env.PUBLIC_SITE_ENV === 'preview' || env.PUBLIC_SITE_ENV === 'local') {
    env.PUBLIC_SITE_URL = 'https://preview.invalid';
    console.warn('[rivora] PUBLIC_SITE_URL is not set; using https://preview.invalid for this preview build.');
  }
}

const astroBin = path.join(root, 'node_modules', 'astro', 'astro.js');
const result = spawnSync(process.execPath, [astroBin, 'build'], {
  cwd: root,
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error('[rivora] Could not start the Astro build:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
