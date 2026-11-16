import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

/**
 * Generates the 1200x630 Open Graph / Twitter card image.
 * Usage: node scripts/generate-og.mjs
 *
 * The composition reuses the supplied logo, the hero photograph and the
 * self-hosted DM Sans face so the card matches the live page.
 */

const root = process.cwd();
const outPath = path.join(root, 'public', 'images', 'og-rivora.jpg');
const fontPath = path.join(root, 'public', 'fonts', 'dm-sans-latin.woff2');
const heroPath = path.join(root, 'public', 'images', 'hero-1280.jpg');
const logoPath = path.join(root, 'public', 'logo', 'RIVORA-logo-light-for-dark-backgrounds.svg');

for (const file of [fontPath, heroPath, logoPath]) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing OG source asset: ${file}`);
  }
}

const font = fs.readFileSync(fontPath).toString('base64');
const hero = fs.readFileSync(heroPath).toString('base64');
const logo = fs.readFileSync(logoPath).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'DM Sans';
    src: url(data:font/woff2;base64,${font}) format('woff2');
    font-weight: 100 1000;
    font-style: normal;
    font-display: block;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: 'DM Sans', sans-serif; background: #151922; color: #FBFAF7; }
  .photo { position: absolute; inset: 0; }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 62% 48%; }
  .scrim { position: absolute; inset: 0; background: linear-gradient(90deg, #151922 0%, rgba(21,25,34,0.94) 38%, rgba(21,25,34,0.72) 56%, rgba(21,25,34,0.18) 78%, rgba(21,25,34,0.05) 100%); }
  .topline { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: #A98A50; }
  .content { position: relative; z-index: 2; height: 100%; padding: 62px 72px 54px; display: flex; flex-direction: column; }
  .logo { width: 236px; height: auto; }
  .eyebrow { margin-top: 54px; color: #D5D0C6; font-size: 13px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; }
  h1 { margin: 16px 0 0; max-width: 650px; font-size: 56px; line-height: 1.06; letter-spacing: -0.03em; font-weight: 700; color: #FBFAF7; text-wrap: balance; }
  .rule { margin-top: 26px; width: 96px; height: 2px; background: #A98A50; }
  .meta { margin-top: 24px; max-width: 650px; color: #D5D0C6; font-size: 15px; line-height: 1.5; }
  .footer { margin-top: auto; display: flex; align-items: center; gap: 14px; color: #C9C4BA; font-size: 13px; letter-spacing: 0.06em; }
  .footer .dot { width: 5px; height: 5px; border-radius: 999px; background: #A98A50; }
</style>
</head>
<body>
  <div class="photo"><img src="data:image/jpeg;base64,${hero}" alt=""></div>
  <div class="scrim"></div>
  <div class="topline"></div>
  <div class="content">
    <img class="logo" src="data:image/svg+xml;base64,${logo}" alt="RIVORA">
    <div class="eyebrow">Legal Services</div>
    <h1>End-to-end land &amp; property title verification.</h1>
    <div class="rule"></div>
    <div class="meta">Senior Advocate RK.V &amp; Associates &nbsp;&middot;&nbsp; Telangana &nbsp;&middot;&nbsp; Andhra Pradesh &nbsp;&middot;&nbsp; New Delhi</div>
    <div class="footer">
      <span>RIVORA</span>
      <span class="dot"></span>
      <span>Title verification, due diligence and property documentation</span>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: outPath,
    type: 'jpeg',
    quality: 90,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log(`Wrote ${outPath}`);
} finally {
  await browser.close();
}
