import { chromium } from '@playwright/test';
import sharp from 'sharp';
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

function meanLuminance(stats) {
  const [r, g, b] = stats.channels;
  return 0.2126 * r.mean + 0.7152 * g.mean + 0.0722 * b.mean;
}

async function cropLuminance(buffer, region, label) {
  const meta = await sharp(buffer).metadata();
  const left = Math.max(0, Math.min(Math.round(region.left), meta.width - 1));
  const top = Math.max(0, Math.min(Math.round(region.top), meta.height - 1));
  const width = Math.max(1, Math.min(Math.round(region.width), meta.width - left));
  const height = Math.max(1, Math.min(Math.round(region.height), meta.height - top));
  const crop = await sharp(buffer).extract({ left, top, width, height }).png().toBuffer();
  fs.writeFileSync(path.join(outDir, `visibility-${phase}-${label}.png`), crop);
  const stats = await sharp(crop).stats();
  return {
    luminance: Number(meanLuminance(stats).toFixed(2)),
    region: { left, top, width, height },
  };
}

const browser = await chromium.launch({ headless: true });
const report = {};

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
  await page.waitForTimeout(350);

  const heroBox = await page.locator('#hero').boundingBox();

  // Full-page screenshot to avoid element clipping
  const renderedPage = await page.screenshot({ fullPage: true });

  const left55Region = {
    left: heroBox.x,
    top: heroBox.y,
    width: heroBox.width * 0.55,
    height: heroBox.height,
  };
  const right45Region = {
    left: heroBox.x + heroBox.width * 0.55,
    top: heroBox.y,
    width: heroBox.width * 0.45,
    height: heroBox.height,
  };

  const renderedLeft = await cropLuminance(renderedPage, left55Region, `${vp.name}-left55-rendered`);
  const renderedRight = await cropLuminance(renderedPage, right45Region, `${vp.name}-right45-rendered`);

  // Hide every layer above the photo: the scrim/shadow and the content
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `.hero-scrim, .hero-content { visibility: hidden !important; }`;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(200);
  const rawPage = await page.screenshot({ fullPage: true });
  const rawLeft = await cropLuminance(rawPage, left55Region, `${vp.name}-left55-raw`);
  const rawRight = await cropLuminance(rawPage, right45Region, `${vp.name}-right45-raw`);

  const leftRatio = renderedLeft.luminance / rawLeft.luminance;
  const rightRatio = renderedRight.luminance / rawRight.luminance;

  report[vp.name] = {
    left55: {
      renderedLuminance: renderedLeft.luminance,
      rawLuminance: rawLeft.luminance,
      visibilityPercent: Number((leftRatio * 100).toFixed(1)),
      pass: leftRatio >= 0.85,
    },
    right45: {
      renderedLuminance: renderedRight.luminance,
      rawLuminance: rawRight.luminance,
      visibilityPercent: Number((rightRatio * 100).toFixed(1)),
      pass: rightRatio >= 0.98,
    },
  };
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, `visibility-${phase}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
const failed = Object.values(report).filter((r) => !r.pass);
if (failed.length) process.exitCode = 1;
