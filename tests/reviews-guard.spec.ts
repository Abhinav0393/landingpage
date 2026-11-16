import { test, expect } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASTRO_CLI = path.join(ROOT, 'node_modules', 'astro', 'astro.js');
const PREVIEW_PORT = 4399;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;

const SAMPLE_NOTE =
  'Sample reviews shown for design preview. These will be replaced with approved client reviews before launch.';

test.describe.configure({ mode: 'serial', timeout: 180_000 });

function clean(value: string | Buffer | null | undefined) {
  return String(value ?? '').replace(/\u001b\[[0-9;]*m/g, '');
}

function runBuild(env: Record<string, string>) {
  return spawnSync(process.execPath, [ASTRO_CLI, 'build'], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 150_000,
  });
}

async function waitForServer(url: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not become ready at ${url}`);
}

test.describe('Publication guard', () => {
  test('preview build renders five labelled samples and noindex', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Build verification runs once.');

    const build = runBuild({ PUBLIC_SITE_ENV: 'preview' });
    const buildOutput = clean(build.stdout) + clean(build.stderr);
    expect(build.status, buildOutput).toBe(0);

    const server = spawn(
      process.execPath,
      [ASTRO_CLI, 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)],
      {
        cwd: ROOT,
        env: { ...process.env, PUBLIC_SITE_ENV: 'preview' },
        stdio: 'pipe',
      }
    );

    let serverLog = '';
    server.stdout?.on('data', (chunk) => {
      serverLog += String(chunk);
    });
    server.stderr?.on('data', (chunk) => {
      serverLog += String(chunk);
    });

    try {
      await waitForServer(PREVIEW_URL);

      await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
      await expect(page.locator('html')).toHaveAttribute('data-site-env', 'preview');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

      const firstSet = page.locator('#reviews [data-review-set]:not([data-review-clone])');
      await expect(firstSet.locator('[data-review-card]')).toHaveCount(5);
      await expect(firstSet.locator('[data-sample-tag]')).toHaveCount(5);
      await expect(page.locator('[data-sample-note]')).toHaveText(SAMPLE_NOTE);

      const names = await firstSet.locator('[data-review-name]').allTextContents();
      expect(names.every((name) => /^Sample client \d$/.test(name.trim()))).toBe(true);

      const quotes = await firstSet.locator('[data-review-quote]').allTextContents();
      for (const quote of quotes) {
        expect(quote).not.toMatch(/₹|\bRs\.?\b|\bcrores?\b|\blakhs?\b|VERIFIED|★|\bLtd\b|\bPvt\b|\bLLP\b/i);
      }
    } catch (error) {
      throw new Error(`${String(error)}\nPreview server output:\n${clean(serverLog)}`);
    } finally {
      server.kill();
      await new Promise<void>((resolve) => {
        if (server.exitCode !== null) return resolve();
        server.once('exit', () => resolve());
        setTimeout(resolve, 3000);
      });
    }
  });

  test('production build refuses sample reviews with a clear message', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Build verification runs once.');

    const build = runBuild({
      PUBLIC_SITE_ENV: 'production',
      PUBLIC_SITE_URL: 'https://example.com',
    });
    const output = clean(build.stdout) + clean(build.stderr);

    expect(build.error).toBeUndefined();
    expect(build.status, output).not.toBe(0);
    expect(output).toContain('RIVORA production build blocked');
    expect(output).toContain('sample review');
  });
});
