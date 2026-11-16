import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const VIEWPORTS = [
  { width: 360, height: 800, name: 'mobile', mode: 'top 35%' },
  { width: 768, height: 1024, name: 'tablet', mode: 'top 35%' },
  { width: 1440, height: 900, name: 'desktop', mode: 'right 40%' },
];

type Region = { left: number; top: number; width: number; height: number };

function meanLuminance(channels: { mean: number }[]) {
  return 0.2126 * channels[0].mean + 0.7152 * channels[1].mean + 0.0722 * channels[2].mean;
}

async function cropAndMeasure(pageBuffer: Buffer, region: Region) {
  const meta = await sharp(pageBuffer).metadata();
  const left = Math.max(0, Math.min(Math.round(region.left), (meta.width ?? 1) - 1));
  const top = Math.max(0, Math.min(Math.round(region.top), (meta.height ?? 1) - 1));
  const width = Math.max(1, Math.min(Math.round(region.width), (meta.width ?? 1) - left));
  const height = Math.max(1, Math.min(Math.round(region.height), (meta.height ?? 1) - top));
  const crop = await sharp(pageBuffer).extract({ left, top, width, height }).png().toBuffer();
  const stats = await sharp(crop).stats();
  return { crop, luminance: meanLuminance(stats.channels) };
}

test.describe('Hero photograph visibility and top alignment', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Pixel-luminance measurement is calibrated for Chromium.');
  });

  test('hero content is top-aligned with exact gap and above-the-fold clearance', async ({ page }) => {
    for (const [w, h, expectedGap] of [[1440, 800, 40], [1366, 768, 40], [768, 1024, 32], [360, 800, 32]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/', { waitUntil: 'networkidle' });
      const headerBox = await page.locator('header.sticky').boundingBox();
      const badgeBox = await page.locator('#hero .stagger-1').boundingBox();
      expect(headerBox).not.toBeNull();
      expect(badgeBox).not.toBeNull();
      const refBox = w >= 1024
        ? headerBox
        : await page.locator('#hero .hero-image').boundingBox();
      expect(refBox).not.toBeNull();
      const gap = Math.round(badgeBox!.y - (refBox!.y + refBox!.height));
      expect(Math.abs(gap - expectedGap)).toBeLessThanOrEqual(2);

      if (w >= 1024) {
        // At 1440x800 and 1366x768, badge, H1, paragraph and BOTH buttons must be fully visible above fold
        const h1Box = await page.locator('#hero h1').boundingBox();
        const pBox = await page.locator('#hero p').boundingBox();
        const btn1Box = await page.locator("#hero a[href='#contact']").boundingBox();
        const btn2Box = await page.locator("#hero a[href='#services']").boundingBox();
        const maxBottom = Math.max(
          badgeBox!.y + badgeBox!.height,
          h1Box!.y + h1Box!.height,
          pBox!.y + pBox!.height,
          btn1Box!.y + btn1Box!.height,
          btn2Box!.y + btn2Box!.height
        );
        expect(maxBottom).toBeLessThan(h);
      }
    }
  });

  test('desktop photo luminance keeps left 55% >= 85% and right 45% >= 98%', async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise<void>((r) => { img.addEventListener('load', () => r(), { once: true }); img.addEventListener('error', () => r(), { once: true }); })
        )
      );
    });
    await page.addStyleTag({
      content: `
        *, *::before, *::after { animation: none !important; transition: none !important; }
        .reveal-item { opacity: 1 !important; transform: none !important; }
        header, aside[aria-label="Contact via WhatsApp"], astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
      `,
    });
    await page.waitForTimeout(300);

    const hero = page.locator('#hero');
    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();

    const left55Region: Region = {
      left: heroBox!.x,
      top: heroBox!.y,
      width: heroBox!.width * 0.55,
      height: heroBox!.height,
    };
    const right45Region: Region = {
      left: heroBox!.x + heroBox!.width * 0.55,
      top: heroBox!.y,
      width: heroBox!.width * 0.45,
      height: heroBox!.height,
    };

    const renderedPage = await page.screenshot({ fullPage: true });
    const renderedLeft = await cropAndMeasure(renderedPage, left55Region);
    const renderedRight = await cropAndMeasure(renderedPage, right45Region);

    await page.addStyleTag({
      content: `.hero-scrim, .hero-content { visibility: hidden !important; }`,
    });
    await page.waitForTimeout(200);
    const rawPage = await page.screenshot({ fullPage: true });
    const rawLeft = await cropAndMeasure(rawPage, left55Region);
    const rawRight = await cropAndMeasure(rawPage, right45Region);

    const leftVisibility = (renderedLeft.luminance / rawLeft.luminance) * 100;
    const rightVisibility = (renderedRight.luminance / rawRight.luminance) * 100;

    await testInfo.attach('hero-left55-rendered', { body: renderedLeft.crop, contentType: 'image/png' });
    await testInfo.attach('hero-right45-rendered', { body: renderedRight.crop, contentType: 'image/png' });

    expect(leftVisibility, `left 55%: ${leftVisibility.toFixed(1)}%`).toBeGreaterThanOrEqual(85);
    expect(rightVisibility, `right 45%: ${rightVisibility.toFixed(1)}%`).toBeGreaterThanOrEqual(98);

    const scrim = await page.locator('.hero-scrim').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(scrim).toContain('90deg');
    expect(await page.locator('.hero-panel').evaluate((el) => getComputedStyle(el).backdropFilter)).toBe('none');

    await context.close();
  });
});
