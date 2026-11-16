import { test, expect } from '@playwright/test';

const practiceNames = [
  'Due Diligence',
  'Pre-Litigation',
  'Documentation',
  'Institutional',
  'Contract Drafting',
  'Litigation Support',
];

test.describe('RIVORA image clarity and page verification', () => {
  test('images declare dimensions, alt text, and sensible loading priorities', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const images = page.locator('main img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      const loading = await img.getAttribute('loading');
      const fetchpriority = await img.getAttribute('fetchpriority');

      expect(alt).not.toBeNull();
      expect(alt!.trim().length).toBeGreaterThan(0);
      expect(alt).not.toMatch(/TEMPORARY|illustration/i);

      expect(width).not.toBeNull();
      expect(Number(width)).toBeGreaterThan(0);
      expect(height).not.toBeNull();
      expect(Number(height)).toBeGreaterThan(0);

      if (i === 0) {
        expect(loading).toBe('eager');
        expect(fetchpriority).toBe('high');
      } else {
        expect(loading).toBe('lazy');
      }
    }

    const heroImg = page.locator('#hero img');
    const currentSrc = await heroImg.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
    if (testInfo.project.name.includes('chromium') || testInfo.project.name === 'pixel-7') {
      expect(currentSrc).toMatch(/\.(avif|webp)$/i);
    } else {
      // Firefox/WebKit may legitimately fall back to JPEG if AVIF/WebP is unavailable.
      expect(currentSrc).toMatch(/\.(avif|webp|jpe?g)$/i);
    }

    const dimensions = await heroImg.evaluate((el: HTMLImageElement) => ({
      naturalWidth: el.naturalWidth,
      renderedWidth: el.clientWidth,
      dpr: window.devicePixelRatio || 1,
    }));

    // Correct for DPR: a 2x/3x display should receive a proportionally larger source.
    const effectiveScale = dimensions.naturalWidth / (dimensions.renderedWidth * dimensions.dpr);
    expect(effectiveScale).toBeLessThanOrEqual(2.2);
  });

  test('layout has no material CLS or horizontal overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const cls = await page.evaluate(async () => {
      if (!PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) return 0;

      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) clsValue += (entry as any).value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });

      const totalHeight = document.body.scrollHeight;
      for (let y = 0; y < totalHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 100));

      observer.disconnect();
      return clsValue;
    });

    expect(cls).toBeLessThanOrEqual(0.1);

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test('the six practice-area names match code.html exactly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const labels = await page.locator('#practice-tabs button span:last-child').allTextContents();
    expect(labels.map((label) => label.trim())).toEqual(practiceNames);
  });

  test('sample reviews are labelled and contain no client details or ratings', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const firstSet = page.locator('#reviews [data-review-set]:not([data-review-clone])');
    await expect(firstSet.locator('[data-review-card]')).toHaveCount(5);
    await expect(firstSet.locator('[data-sample-tag]')).toHaveCount(5);
    await expect(page.locator('[data-sample-note]')).toHaveText(
      'Sample reviews shown for design preview. These will be replaced with approved client reviews before launch.'
    );

    const env = await page.locator('html').getAttribute('data-site-env');
    expect(['local', 'preview']).toContain(env);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    const bodyText = await page.locator('#reviews').innerText();
    const names = await firstSet.locator('[data-review-name]').allTextContents();
    expect(names.map((name) => name.trim())).toEqual([
      'Sample client 1',
      'Sample client 2',
      'Sample client 3',
      'Sample client 4',
      'Sample client 5',
    ]);

    const quotes = await firstSet.locator('[data-review-quote]').allTextContents();
    for (const quote of quotes) {
      expect(quote).not.toMatch(/₹|\bRs\.?\b|\bcrores?\b|\blakhs?\b|VERIFIED|★|\bLtd\b|\bPvt\b|\bLLP\b/i);
      expect(quote).not.toMatch(/\b(best|better|fastest|greatest|most|superior)\b/i);
    }
    expect(await page.locator('#reviews .material-symbols-outlined').count()).toBe(0);
    expect(bodyText).not.toContain('Placeholder // not for publication');
    expect(bodyText).not.toContain('approved: false');

    const loop = await page.evaluate(() => {
      const track = document.querySelector('.testimonial-marquee-track') as HTMLElement;
      const set = document.querySelector('[data-review-set]') as HTMLElement;
      return {
        track: track.getBoundingClientRect().width,
        set: set.getBoundingClientRect().width,
      };
    });
    expect(Math.abs(loop.track - loop.set * 2)).toBeLessThanOrEqual(1);
  });

  test('review marquee can be paused and resumed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const track = page.locator('[data-review-marquee] .testimonial-marquee-track');
    const pauseButton = page.locator('[data-review-pause]');
    const pauseLabel = page.locator('[data-pause-label]');

    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false');
    await pauseButton.click();
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true');
    await expect(pauseLabel).toHaveText('Play');
    expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');

    await page.waitForTimeout(100);
    await pauseButton.click();
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false');
    await expect(pauseLabel).toHaveText('Pause');
    expect(await track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('running');
  });

  test('review carousel is static and scrollable under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });

    const container = page.locator('[data-review-marquee]');
    const track = page.locator('[data-review-marquee] .testimonial-marquee-track');

    expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await expect(page.locator('[data-review-pause]')).toBeHidden();
    await expect(page.locator('[data-review-clone]')).toBeHidden();
    expect(await container.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
  });

  test('mobile menu opens and closes with keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuBtn = page.locator('#mobile-menu-btn');
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    const drawer = page.locator('#mobile-menu-drawer');
    await expect(drawer).toBeVisible();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('services tab crossfade works with clicks', async ({ page }) => {
    await page.goto('/');

    const tab2 = page.locator('#tab-1');
    await tab2.scrollIntoViewIfNeeded();
    await tab2.click();
    await page.waitForTimeout(350);

    await expect(page.locator('#slide-1')).toHaveClass(/opacity-100/);
    await expect(page.locator('#slider-counter')).toHaveText('02 / 06');
  });
});
