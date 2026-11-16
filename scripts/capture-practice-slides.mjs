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

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
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
      header, aside[aria-label="Contact via WhatsApp"], astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(300);

  for (let i = 0; i < 6; i += 1) {
    await page.evaluate((index) => {
      window.goToPracticeSlide(index);
    }, i);
    await page.waitForTimeout(120);
    const panel = page.locator('.practice-panel');
    await panel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await panel.screenshot({
      path: path.join(outDir, `practice-${phase}-${vp.name}-${i + 1}.png`),
    });
  }

  await page.close();
}

await browser.close();
console.log(`Saved six practice slides at 360 / 768 / 1440 for "${phase}".`);
