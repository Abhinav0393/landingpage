import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VIEWPORTS = [
  { width: 360, height: 800, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

for (const vp of VIEWPORTS) {
  test.describe(`Accessibility scan at ${vp.width}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`axe finds no WCAG A/AA violations (${vp.name})`, async ({ page }, testInfo) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .reveal-item { opacity: 1 !important; transform: none !important; }
          astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
        `;
        document.head.appendChild(style);
        document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
      });
      await page.waitForTimeout(250);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .exclude('astro-dev-toolbar')
        .exclude('#dev-toolbar-root')
        .analyze();

      await testInfo.attach(`axe-${vp.name}.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });

      const summary = results.violations
        .map((violation) => `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s)`)
        .join('\n');
      expect(results.violations, summary).toEqual([]);
    });
  });
}

test.describe('Keyboard walkthrough', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('focus order is visible and unbroken through the page', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit',
      'WebKit does not move Tab focus to links with default macOS keyboard settings; direct-focus keyboard tests cover WebKit.'
    );
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = 'astro-dev-toolbar, #dev-toolbar-root { display: none !important; }';
      document.head.appendChild(style);
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);

    const visited: string[] = [];
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          label: `${el.tagName.toLowerCase()}:${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}`,
          outline: `${style.outlineStyle} ${style.outlineWidth}`,
          boxShadow: style.boxShadow,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      });
      if (!focused) break;
      expect(focused.width, `focused element has no area: ${focused.label}`).toBeGreaterThan(0);
      expect(focused.height, `focused element has no area: ${focused.label}`).toBeGreaterThan(0);
      if (!visited.includes(focused.label)) visited.push(focused.label);
    }

    expect(visited.length, 'keyboard reached fewer than 20 unique controls').toBeGreaterThanOrEqual(20);
  });

  test('FAQ accordion, review pause, and practice tabs respond to the keyboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const faqButton = page.locator('#faq-btn-0');
    await faqButton.focus();
    await page.keyboard.press('Enter');
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#faq-answer-0')).toBeVisible();

    const pause = page.locator('[data-review-pause]');
    await pause.focus();
    await page.keyboard.press('Enter');
    await expect(pause).toHaveAttribute('aria-pressed', 'true');

    const firstTab = page.locator('#tab-0');
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-1')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#slide-1')).toHaveAttribute('aria-hidden', 'false');
  });
});
