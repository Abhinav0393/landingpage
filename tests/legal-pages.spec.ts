import { test, expect } from '@playwright/test';

test.describe('Legal Pages (Privacy Policy and Terms & Conditions)', () => {
  test('privacy policy page renders with one H1, TOC, draft banner and placeholder chips', async ({ page }) => {
    await page.goto('/privacy-policy/');
    await expect(page).toHaveTitle(/Privacy Policy/);

    const h1 = page.locator('main h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Privacy Policy');

    // TOC anchors
    const tocLinks = page.locator('nav[aria-label="Table of Contents"] a');
    const tocCount = await tocLinks.count();
    expect(tocCount).toBe(13);

    for (let i = 0; i < tocCount; i++) {
      const href = await tocLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^#[a-z0-9-]+$/);
      const targetId = href!.slice(1);
      await expect(page.locator(`#${targetId}`)).toBeAttached();
    }

    // Draft banner for advocate review
    const draftBanner = page.locator('text=Draft for Advocate Review');
    await expect(draftBanner).toBeVisible();

    // Placeholder chips
    const chips = page.locator('.placeholder-chip');
    expect(await chips.count()).toBeGreaterThan(0);
    await expect(chips.first()).toHaveText('To be confirmed');

    // Back link
    const backLink = page.locator('a:has-text("Back to home")');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('terms and conditions page renders with one H1, TOC, draft banner and placeholder chips', async ({ page }) => {
    await page.goto('/terms-and-conditions/');
    await expect(page).toHaveTitle(/Terms & Conditions/);

    const h1 = page.locator('main h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Terms & Conditions');

    // TOC anchors
    const tocLinks = page.locator('nav[aria-label="Table of Contents"] a');
    const tocCount = await tocLinks.count();
    expect(tocCount).toBe(12);

    for (let i = 0; i < tocCount; i++) {
      const href = await tocLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^#[a-z0-9-]+$/);
      const targetId = href!.slice(1);
      await expect(page.locator(`#${targetId}`)).toBeAttached();
    }

    // Draft banner
    const draftBanner = page.locator('text=Draft for Advocate Review');
    await expect(draftBanner).toBeVisible();

    // Placeholder chips
    const chips = page.locator('.placeholder-chip');
    expect(await chips.count()).toBeGreaterThan(0);
    await expect(chips.first()).toHaveText('To be confirmed');
  });

  test('contact form consent checkbox links to privacy policy', async ({ page }) => {
    await page.goto('/#contact');
    const consentCheckbox = page.locator('#contact-consent');
    await expect(consentCheckbox).toBeAttached();
    await expect(consentCheckbox).toHaveAttribute('required', '');

    const privacyLink = page.locator('label[for="contact-consent"] a');
    await expect(privacyLink).toHaveAttribute('href', '/privacy-policy/');
  });

  test('footer has links to privacy policy and terms', async ({ page }) => {
    await page.goto('/');
    const footerPrivacy = page.locator('footer a[href="/privacy-policy/"]');
    const footerTerms = page.locator('footer a[href="/terms-and-conditions/"]');
    await expect(footerPrivacy).toBeVisible();
    await expect(footerTerms).toBeVisible();
  });

  test('sitemap.xml contains both legal pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).toContain('/privacy-policy/');
    expect(text).toContain('/terms-and-conditions/');
  });
});
