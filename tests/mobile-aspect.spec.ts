import { test, expect } from '@playwright/test';

const mobileViewports = [
  { width: 360, height: 800, name: '360' },
  { width: 390, height: 844, name: '390' },
  { width: 412, height: 915, name: '412' },
  { width: 768, height: 1024, name: '768' },
];

test.describe('Mobile stacked layout and image aspect visible fraction', () => {
  for (const vp of mobileViewports) {
    test(`hero and practice images visible fraction >= 0.90 at ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // 1. Hero image check
      const heroImg = page.locator('#hero img');
      await heroImg.waitFor({ state: 'visible' });
      await page.evaluate(async () => {
        const img = document.querySelector('#hero img') as HTMLImageElement;
        if (img && !img.complete) {
          await new Promise((r) => { img.onload = r; img.onerror = r; });
        }
      });

      const heroData = await page.evaluate(() => {
        const img = document.querySelector('#hero img') as HTMLImageElement;
        if (!img || !img.naturalWidth) return null;
        const rect = img.getBoundingClientRect();
        const boxAspect = rect.width / rect.height;
        const imageAspect = img.naturalWidth / img.naturalHeight;
        const visibleFraction = Math.min(boxAspect / imageAspect, imageAspect / boxAspect);
        return {
          width: rect.width,
          height: rect.height,
          boxAspect,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          imageAspect,
          visibleFraction,
        };
      });

      expect(heroData).not.toBeNull();
      console.log(`Hero visible fraction at ${vp.name}px: ${heroData!.visibleFraction.toFixed(3)} (box: ${heroData!.width}x${heroData!.height})`);
      expect(heroData!.visibleFraction).toBeGreaterThanOrEqual(0.90);

      // 2. Practice slides check (test all 6 slides)
      // Scroll services into view so lazy images load
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      for (let i = 0; i < 6; i++) {
        await page.evaluate((idx) => {
          (window as any).goToPracticeSlide?.(idx);
        }, i);
        await page.waitForTimeout(300);

        // Ensure current slide image is fully loaded and decoded
        await page.evaluate(async (idx) => {
          const slide = document.querySelector(`#slide-${idx}`);
          const img = slide?.querySelector('.practice-art') as HTMLImageElement;
          if (img) {
            img.loading = 'eager';
            if (!img.complete) {
              await new Promise((r) => {
                img.onload = r;
                img.onerror = r;
                setTimeout(r, 1000);
              });
            }
            if (img.decode) {
              try { await img.decode(); } catch {}
            }
          }
        }, i);

        const slideData = await page.evaluate((idx) => {
          const slide = document.querySelector(`#slide-${idx}`);
          const img = slide?.querySelector('.practice-art') as HTMLImageElement;
          if (!img || !img.naturalWidth) return null;
          const rect = img.getBoundingClientRect();
          const boxAspect = rect.width / rect.height;
          const imageAspect = img.naturalWidth / img.naturalHeight;
          const visibleFraction = Math.min(boxAspect / imageAspect, imageAspect / boxAspect);
          return {
            idx,
            width: rect.width,
            height: rect.height,
            boxAspect,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            imageAspect,
            visibleFraction,
          };
        }, i);

        expect(slideData).not.toBeNull();
        console.log(`Practice slide 0${i + 1} visible fraction at ${vp.name}px: ${slideData!.visibleFraction.toFixed(3)}`);
        expect(slideData!.visibleFraction).toBeGreaterThanOrEqual(0.90);
      }
    });
  }
});
