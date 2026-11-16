# RIVORA website

Astro 5 static website for RIVORA Advocates & Associates — land and property
title verification across Telangana, Andhra Pradesh and New Delhi.

## Structure

- Repository root — the Astro website and Vercel deployment root.
- `src/` — Astro pages, components, data and styles.
- `public/` — images, fonts, logos, static headers and the PHP contact endpoint
  used by non-Vercel hosts.
- `api/contact.js` — Vercel Function for the contact form.
- `rivora-handoff-generator/` — separate documentation generator, not part of
  the website build.

## Local development

```bash
npm ci
npm run dev
```

Open http://localhost:4321/.

## Build

```bash
npm run build
npm run preview
```

`npm run build` defaults to a noindex preview because the legal copy and client
reviews are still awaiting approval. Set `PUBLIC_SITE_ENV=production` and
`PUBLIC_SITE_URL=https://your-domain.example` only after those approvals.

See [DEPLOY.md](DEPLOY.md) for Vercel settings, environment variables and the
production build guard.
