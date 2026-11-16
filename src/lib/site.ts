import { siteEnv } from './site-env';

/**
 * Public site address used for canonical links, Open Graph tags and the sitemap.
 *
 * Production builds must supply the live HTTPS origin through
 * `PUBLIC_SITE_URL`; no client domain is hard-coded in this repository.
 * Local development and the preview package use clearly reserved hosts.
 */
const configured = ((import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? '').trim();

function fallbackSiteUrl(): string {
  if (siteEnv === 'preview') return 'https://preview.invalid';
  if (siteEnv === 'local') return 'http://localhost:4321';
  return '';
}

const rawSiteUrl = configured || fallbackSiteUrl();
const normalizedSiteUrl = rawSiteUrl.replace(/\/+$/, '');

if (siteEnv === 'production' && !/^https:\/\/[^/]+$/i.test(normalizedSiteUrl)) {
  throw new Error(
    'RIVORA production build requires PUBLIC_SITE_URL, set to the live HTTPS origin (for example https://your-domain.example, without a path).'
  );
}

if (siteEnv !== 'production' && !/^https?:\/\/[^/]+$/i.test(normalizedSiteUrl)) {
  throw new Error('PUBLIC_SITE_URL must be an absolute http(s) origin.');
}

export const siteUrl = normalizedSiteUrl;
export const canonicalUrl = `${siteUrl}/`;

export const siteName = 'RIVORA';
export const telephone = '+918099888851';
export const telephoneDisplay = '+91 8099888851';

export const ogImagePath = '/images/og-rivora.jpg';
export const ogImageUrl = `${siteUrl}${ogImagePath}`;
export const ogImageAlt = 'RIVORA — end-to-end land and property title verification';
export const ogImageWidth = 1200;
export const ogImageHeight = 630;

export const areaServed = ['Telangana', 'Andhra Pradesh', 'New Delhi'] as const;
