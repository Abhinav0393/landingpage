export const SITE_ENVS = ['local', 'preview', 'production'] as const;
export type SiteEnv = (typeof SITE_ENVS)[number];

/**
 * Resolves the publication environment.
 *
 * - `PUBLIC_SITE_ENV` wins when it is set (local, preview or production).
 * - `astro dev` defaults to local.
 * - `astro build` defaults to production, so an unqualified build can never
 *   publish sample reviews or unapproved copy.
 */
function resolveSiteEnv(): SiteEnv {
  const configured = (import.meta.env.PUBLIC_SITE_ENV as string | undefined)?.trim().toLowerCase();

  if (configured) {
    if (!SITE_ENVS.includes(configured as SiteEnv)) {
      throw new Error(
        `Invalid PUBLIC_SITE_ENV "${configured}". Use one of: ${SITE_ENVS.join(', ')}.`
      );
    }
    return configured as SiteEnv;
  }

  return import.meta.env.DEV ? 'local' : 'production';
}

export const siteEnv = resolveSiteEnv();
export const isProductionSite = siteEnv === 'production';
