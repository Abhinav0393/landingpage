import { test, expect } from '@playwright/test';

test.describe('Launch readiness', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Static launch checks run once.');
  });

  test('supplied logo replaces the monogram and descriptor', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('body > header img[src="/logo/RIVORA-logo.svg"]')).toBeVisible();
    await expect(
      page.locator('body > footer img[src="/logo/RIVORA-logo-light-for-dark-backgrounds.svg"]')
    ).toBeVisible();

    const headerText = (await page.locator('body > header').innerText()).toUpperCase();
    expect(headerText).toContain('ADVOCATES & ASSOCIATES');

    const footerText = await page.locator('body > footer').textContent();
    expect(footerText.trimEnd().endsWith('Advocates & Associates')).toBe(true);

    await expect(page.getByRole('link', { name: /account/i })).toHaveCount(0);
  });

  test('metadata, canonical, social card, JSON-LD and tel links are launch-ready', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'http://localhost:4321/images/og-rivora.jpg'
    );
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    );

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(jsonLd || '{}');
    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      name: 'RIVORA',
      telephone: '+918099888851',
      areaServed: ['Telangana', 'Andhra Pradesh', 'New Delhi'],
    });

    const telLinks = await page.locator('a[href^="tel:"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );
    expect(telLinks.length).toBeGreaterThan(0);
    for (const href of telLinks) {
      expect(href).toBe('tel:+918099888851');
    }
  });

  test('contact form is complete, guarded, and carries the confidentiality notice', async ({ page }) => {
    await page.goto('/#contact', { waitUntil: 'networkidle' });

    const form = page.locator('[data-contact-form]');
    await expect(form).toHaveAttribute('action', '/api/contact.php');
    await expect(form).toHaveAttribute('method', 'post');

    for (const name of ['name', 'email', 'phone', 'location', 'enquiry', 'message']) {
      await expect(form.locator(`[name="${name}"]`)).toBeVisible();
    }

    await expect(form.locator('[name="name"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="email"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="phone"]')).toHaveAttribute('required', '');
    await expect(form.locator('[name="message"]')).toHaveAttribute('required', '');

    const honeypot = form.locator('[name="website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('tabindex', '-1');

    await expect(page.getByText(/do not send title deeds or other confidential documents/i)).toBeVisible();
    await expect(form.locator('noscript')).toHaveCount(1);
  });

  test('robots.txt and sitemap.xml are generated', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    // In preview mode robots.txt disallows all; in production mode it allows and declares sitemap
    if (robotsText.includes('Disallow: /')) {
      expect(robotsText).toContain('User-agent: *');
    } else {
      expect(robotsText).toContain('Sitemap: http://localhost:4321/sitemap.xml');
    }

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain('<loc>http://localhost:4321/</loc>');
  });

  test('404 page is on-brand and noindex', async ({ page }) => {
    const response = await page.goto('/404', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(404);

    await expect(page.locator('body > main h1')).toHaveText('This page could not be found.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });
});
