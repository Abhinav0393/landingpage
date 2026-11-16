import type { APIRoute } from 'astro';
import { siteUrl } from '../lib/site';
import { siteEnv } from '../lib/site-env';

export const GET: APIRoute = () => {
  const isPreview = siteEnv !== 'production';
  const body = isPreview
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(isPreview ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
    },
  });
};
