import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const VIEWPORTS = [
  { width: 360, height: 800, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

async function meanLuminance(buffer: Buffer) {
  const stats = await sharp(buffer).stats();
  const [r, g, b] = stats.channels;
  return 0.2126 * r.mean + 0.7152 * g.mean + 0.0722 * b.mean;
}

async function cropLuminance(pageBuffer: Buffer, region: { left: number; top: number; width: number; height: number }) {
  const meta = await sharp(pageBuffer).metadata();
  const left = Math.max(0, Math.min(Math.round(region.left), (meta.width ?? 1) - 1));
  const top = Math.max(0, Math.min(Math.round(region.top), (meta.height ?? 1) - 1));
  const width = Math.max(1, Math.min(Math.round(region.width), (meta.width ?? 1) - left));
  const height = Math.max(1, Math.min(Math.round(region.height), (meta.height ?? 1) - top));
  const crop = await sharp(pageBuffer).extract({ left, top, width, height }).png().toBuffer();
  return { crop, luminance: await meanLuminance(crop) };
}

test.describe('Practice-area artwork visibility', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Pixel-luminance measurement is calibrated for Chromium.');
  });

  for (const vp of VIEWPORTS) {
    test(`artwork stays clear at ${vp.width}px (${vp.width >= 1024 ? 'right 40%' : 'top 35%'})`, async ({ browser }, testInfo) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      await page.goto('/', { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        await Promise.all(
          Array.from(document.images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener('load', resolve, { once: true });
                  img.addEventListener('error', resolve, { once: true });
                })
          )
        );
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .reveal-item { opacity: 1 !important; transform: none !important; }
          header, footer, aside[aria-label="Contact via WhatsApp"], astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
        `;
        document.head.appendChild(style);
        document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
        document.querySelectorAll('main > section').forEach((section) => {
          if (section.id !== 'services') section.style.display = 'none';
        });
        window.scrollTo(0, 0);
        window.goToPracticeSlide(0);
      });
      await page.waitForTimeout(250);

      const results: { slide: number; visibility: number }[] = [];

      for (let i = 0; i < 6; i += 1) {
        await page.evaluate((index) => window.goToPracticeSlide(index), i);
        await page.waitForTimeout(100);

        const panelBox = await page.locator('.practice-panel').evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
          };
        });

        const region =
          vp.width >= 1024
            ? {
                left: panelBox.left + panelBox.width * 0.6,
                top: panelBox.top,
                width: panelBox.width * 0.4,
                height: panelBox.height,
              }
            : {
                left: panelBox.left,
                top: panelBox.top,
                width: panelBox.width,
                height: panelBox.height * 0.35,
              };

        const renderedPage = await page.screenshot({ fullPage: true });
        const rendered = await cropLuminance(renderedPage, region);

        await page.evaluate((index) => {
          const slide = document.querySelector(`#slide-${index}`);
          slide?.querySelector('.practice-scrim')?.setAttribute('style', 'visibility:hidden');
          slide?.querySelector('.practice-content')?.setAttribute('style', 'visibility:hidden');
        }, i);
        await page.waitForTimeout(80);
        const rawPage = await page.screenshot({ fullPage: true });
        const raw = await cropLuminance(rawPage, region);
        await page.evaluate((index) => {
          const slide = document.querySelector(`#slide-${index}`);
          slide?.querySelector('.practice-scrim')?.removeAttribute('style');
          slide?.querySelector('.practice-content')?.removeAttribute('style');
        }, i);

        const visibility = (rendered.luminance / raw.luminance) * 100;
        results.push({ slide: i + 1, visibility: Number(visibility.toFixed(1)) });

        await testInfo.attach(`practice-${vp.name}-${i + 1}-rendered`, {
          body: rendered.crop,
          contentType: 'image/png',
        });
        await testInfo.attach(`practice-${vp.name}-${i + 1}-raw`, {
          body: raw.crop,
          contentType: 'image/png',
        });
      }

      const summary = results.map((row) => `slide ${row.slide}: ${row.visibility}%`).join(', ');
      for (const row of results) {
        expect(row.visibility, `${vp.name} slide ${row.slide} (${summary})`).toBeGreaterThanOrEqual(75);
      }

      // The artwork itself must describe the generated motif, never the old
      // quarantine marker or the removed stock-photo descriptions.
      const alts = await page.locator('.practice-art').evaluateAll((imgs) =>
        imgs.map((img) => img.getAttribute('alt') ?? '')
      );
      expect(alts).toHaveLength(6);
      for (const alt of alts) {
        expect(alt.trim().length).toBeGreaterThan(0);
        expect(alt).not.toMatch(/TEMPORARY/i);
      }

      await context.close();
    });
  }
});
