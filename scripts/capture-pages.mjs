import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const phase = process.argv[2] || 'current';
const baseURL = process.env.BASE_URL || 'http://localhost:4321';
const outDir = path.resolve('screenshots');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { width: 360, height: 800, name: '360' },
  { width: 768, height: 1024, name: '768' },
  { width: 1440, height: 900, name: '1440' },
];

const browser = await chromium.launch({ headless: true });
const report = {};

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const messages = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      messages.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => messages.push({ type: 'pageerror', text: err.message }));
  page.on('requestfailed', (request) =>
    messages.push({ type: 'requestfailed', text: `${request.url()} ${request.failure()?.errorText ?? ''}` })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      messages.push({ type: 'http', text: `${response.status()} ${response.url()}` });
    }
  });

  await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
      )
    );
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .reveal-item { opacity: 1 !important; transform: none !important; }
      astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }));

  await page.screenshot({ path: path.join(outDir, `${phase}-${vp.name}-full.png`), fullPage: true });
  for (const section of [
    'hero',
    'pillars',
    'services',
    'search-depth',
    'process',
    'expertise',
    'reviews',
    'faq',
    'contact',
  ]) {
    await page.locator(`#${section}`).screenshot({
      path: path.join(outDir, `${phase}-${vp.name}-${section}.png`),
    });
  }
  await page.locator('footer').screenshot({ path: path.join(outDir, `${phase}-${vp.name}-footer.png`) });

  report[vp.name] = { metrics, messages };
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, `${phase}-report.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
