# RIVORA — deployment notes

The repository root is the RIVORA Astro website. `rivora-handoff-generator/` is
a separate documentation generator and is **not** part of the website build.

## Vercel settings

Use these values when importing the repository into Vercel:

| Setting | Value |
| --- | --- |
| Framework preset | **Astro** (auto-detected) |
| Root directory | **`.`** — the repository root (leave the Vercel default) |
| Install command | `npm ci` (or leave the default `npm install`) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | **22.x** (Vercel default; `package.json` requires Node >= 20.3) |

Do **not** set the Root Directory to `rivora-handoff-generator`. That project
has its own `package.json` but builds the handoff document, not the website.

`vercel.json` contains response/security headers only. Vercel auto-detects the
Astro build, so no build overrides are needed.

### Environment variables

For a client preview (noindex):

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_ENV` | `preview` |

For a production launch, after the content approvals described below:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_ENV` | `production` |
| `PUBLIC_SITE_URL` | `https://your-domain.example` |

`PUBLIC_SITE_URL` must be an HTTPS origin with no path. The build fails on
purpose if a production build has no valid URL.

If `PUBLIC_SITE_ENV` is not set, `npm run build` defaults to a **preview**
build so an imported Vercel project deploys without publishing unapproved
content. Preview builds are `noindex, nofollow` and contain sample reviews.

### Contact form environment variables

The Vercel function at `api/contact.js` replaces the PHP endpoint on Vercel.
It uses the same SMTP names as the PHP endpoint:

| Variable | Required | Notes |
| --- | --- | --- |
| `SMTP_HOST` | yes | SMTP server hostname |
| `SMTP_PORT` | yes | Usually `587` (STARTTLS) or `465` (SSL) |
| `SMTP_SECURE` | no | `tls` (default), `ssl`, `smtps`, or `none` |
| `SMTP_AUTH` | no | `true` by default; set `false` for an open relay |
| `SMTP_USER` | when auth is on | SMTP username |
| `SMTP_PASS` | when auth is on | SMTP password |
| `MAIL_FROM` | yes | Envelope sender on the same domain as the mailbox |
| `MAIL_FROM_NAME` | no | Defaults to `RIVORA Website` |
| `MAIL_TO` | yes | Destination inbox for enquiries |
| `MAIL_TO_NAME` | no | Defaults to `RIVORA Chambers` |
| `CONTACT_DRY_RUN` | no | `1` accepts the form without sending mail |

Never commit real SMTP credentials. Add them in **Vercel → Project → Settings →
Environment Variables**.

Preview and development deployments accept the form without sending mail.
The function only sends real mail when `PUBLIC_SITE_ENV=production` and the
deployment is not a Vercel preview. Set `CONTACT_DRY_RUN=1` to force simulated
delivery on any deployment.

The serverless function keeps its sliding-window rate limit in instance
memory. That is enough for a low-volume contact form, but it is not a durable
global limiter across all serverless instances. If the form needs strict
cross-instance rate limiting, move the counter to a managed Redis/KV store.

## Build modes

Preview (safe default; noindex, sample content):

```bash
npm ci
npm run build
```

Production (requires advocate-approved legal copy and approved reviews):

```bash
PUBLIC_SITE_ENV=production \
PUBLIC_SITE_URL=https://your-domain.example \
npm run build
```

On Windows PowerShell:

```powershell
$env:PUBLIC_SITE_ENV = 'production'
$env:PUBLIC_SITE_URL = 'https://your-domain.example'
npm run build
```

The production build intentionally fails while:

1. `src/data/reviews.ts` contains sample or unapproved reviews. Replace them
   with written client approvals (`sample: false`, `approved: true`).
2. `src/data/legal.ts` contains unapproved legal documents or unresolved
   placeholders. Legal text must be reviewed and approved in writing by the
   advocate before production publication.

## Output

Astro writes the static site to `dist/`:

```
dist/
├── index.html
├── 404.html
├── privacy-policy/index.html
├── terms-and-conditions/index.html
├── robots.txt
├── sitemap.xml
├── _astro/
├── images/
├── fonts/
├── logo/
└── api/                # PHP endpoint for non-Vercel hosts
```

`dist/` is generated output and is gitignored; Vercel rebuilds it from source.
Do not commit it.

## Contact endpoint on Vercel

The form posts to `/api/contact`, handled by `api/contact.js` (Vercel Function).
It validates the same fields as the PHP endpoint, checks the origin and
honeypot, rate-limits in memory, and sends mail through SMTP with Nodemailer.

`public/api/contact.php` and `rivora-config/` are retained for Apache/PHP
hosting. `public/.htaccess` routes `/api/contact` to the PHP endpoint on that
kind of host. Vercel ignores `.htaccess` and uses the Node function instead.

## Local verification

```bash
npm ci
npm run build
npm run preview
```

Then check:

- `http://localhost:4321/`
- `http://localhost:4321/privacy-policy/`
- `http://localhost:4321/terms-and-conditions/`
- `http://localhost:4321/robots.txt`
- `http://localhost:4321/sitemap.xml`
- `http://localhost:4321/404.html`

`npm run preview` serves the production-shaped `dist/` output. For the contact
function locally, use `vercel dev` or POST to `api/contact.js` through a Node
server; `astro preview` only serves static files.

## Git and Vercel

The repository root must contain `package.json`, `package-lock.json`,
`astro.config.mjs`, `src/` and `public/`. Commit those files and let Vercel
run `npm ci && npm run build`. Do not commit `node_modules/`, `dist/`,
`.astro/`, `.env` files or `rivora-config/.env`.
