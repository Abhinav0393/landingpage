# RIVORA — Final QA and Launch Report

Date: 11 November 2026  
Branch: `master`  
Commits: `41ea72d` (Task 1), `400cd1a` (Task 2), `c9c201c` (Task 3), `f5d78cb` (Task 4), `614107f` (Task 5)

All measurements below were taken from the production-shaped preview build served from `dist/`. Screenshot and log evidence is in the local, gitignored `screenshots/` directory.

## Task summary

| Task | Commit | Outcome |
| --- | --- | --- |
| 1 — Hero | `41ea72d` | Vivid hero restored; desktop ink gradient 85% → 70% → 0%; tablet/mobile frosted panel; metadata `#D5D0C6`; gold CTA with ink text; contrast and image-visibility guards added. |
| 2 — Reviews | `400cd1a` | Five neutral SAMPLE entries; `SAMPLE` tag and note above carousel; `approved` / `sample` flags; production guard blocks samples, unapproved entries and zero approved reviews; marquee pause and reduced-motion fallback. |
| 3 — Practice art | `c9c201c` | Six code-generated 1440×700 ink/gold/ivory artworks with three to four layers; calm left 55%; responsive 480/768/1100/1440 sets; `TEMPORARY` only in `src/data/services.ts` and `ASSETS.md`. |
| 4 — Whole-page polish | `f5d78cb` | Header Account button removed; unified type scale, rhythm, container, surfaces, separators, radii, motion, reveal stagger, hover/focus states, reduced-motion and no-JS behavior; WhatsApp hidden at the footer; performance and accessibility cleanup. |
| 5 — Launch blockers | `614107f` | Supplied logo wired into header/footer; contact form and PHP/SMTP endpoint; canonical/OG/Twitter/JSON-LD/robots/sitemap/404; Apache and static-host security headers; deploy notes and preview package. |

## Verification results

### Contrast

Method: DOM text colour against the lightest 4×4 pixel region under each measured element, at 360, 768 and 1440 px. Pass threshold 4.5:1.

- Task 1 final: 72 measurements, minimum **5.29:1**.
- Task 5 final: 69 measurements, minimum **5.23:1** (`Services / slide counter`). Hero primary CTA: **5.39:1**.
- Task 3 practice slides: 18 slides, minimum **8.91:1**.

Evidence: `screenshots/contrast-task1-final.json`, `screenshots/contrast-task5.json`, `screenshots/practice-task5.json`.

### Hero and practice image visibility

Hero region: right 40% at 1440, top 35% below 1024.

- Hero: **99.9%** at 360, **99.9%** at 768, **99.6%** at 1440.
- Practice artwork: **99.2%–99.8%** across all 18 slides.

Evidence: `screenshots/visibility-task5.json`, `screenshots/practice-task5.json`, `screenshots/visibility-task5.log`, `screenshots/practice-task5.log`.

### Playwright

Final full suite: **82 passed, 48 skipped** across Chromium, Firefox, WebKit, iPhone 13 and Pixel 7. Skips are project-scoped build/static checks, not failures.

Targeted suites:

- `tests/launch-readiness.spec.ts`: **5 passed**.
- `tests/reviews-guard.spec.ts`: **2 passed**.
- `scripts/test-contact-endpoint.mjs`: **10 checks passed**.

Evidence: `screenshots/playwright-task5-final.log`, `screenshots/launch-readiness-task5.log`, `screenshots/reviews-guard-task5.log`, `screenshots/contact-endpoint-test.log`.

### Lighthouse mobile

Three runs, median:

| Category | Median |
| --- | --- |
| Performance | **98** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Median metrics: FCP 911 ms, LCP 2,336 ms, TBT 29 ms, CLS **0.00**.

The audit server strips the preview-only `noindex` meta so SEO is scored as the production build will be, while the canonical remains the preview host.

Evidence: `screenshots/lighthouse/task5-final-median.json`, `screenshots/lighthouse-task5.log`.

### Layout, keyboard and accessibility

- Layout audit: 15 widths from 320 to 2560 px, **0 horizontal-overflow failures**, **0 console/network problems**.
- No-JS: 37 reveal items visible, 0 hidden; pause control hidden; page content remains available.
- WhatsApp: hidden while the footer is in view.
- Axe WCAG A/AA: main page clean at 360/768/1440; **404 page and contact-form error state both clean**.
- Keyboard walkthrough: focus order and FAQ accordion, review pause and practice tabs pass.

Evidence: `screenshots/layout-task5.log`, `screenshots/axe-task5-contact.log`, `screenshots/axe-task5-extra.log`.

### Contact endpoint

Verified against a local PHP 8.3 server with the endpoint in dry-run mode:

- `GET` → 405.
- Invalid fields → 422 with field-level errors.
- Valid enquiry → 200; no-JS submission returns the branded confirmation page.
- Honeypot filled → silently accepted.
- Sixth accepted enquiry in 15 minutes → 429 with `Retry-After`.
- Missing SMTP configuration → 503, no stack trace.
- Cross-origin submission → 403.
- Server log contains event labels only; no names, addresses, phone numbers or message bodies.

The endpoint requires PHP 8.1+, PHPMailer 7.2.0 and SMTP credentials. It never uses PHP `mail()`.

### Launch packaging

- `rivora-preview.zip`: **3.10 MB**, noindex, contains `DEPLOY.md`, `public_html/` and `rivora-config/` (PHPMailer and `.env.example`).
- Confirmed absent from the zip: any `.env`, rate-limit state.
- `rivora-deploy.zip`: intentionally not produced while five sample reviews remain. `npm run package:deploy` exits 1 with `RIVORA production build blocked: 5 sample review(s) are present…`.
- A production build without `PUBLIC_SITE_URL` also fails with a clear message.
- No `preview-server.mjs` exists in the repository.

Evidence: `screenshots/package-preview-final.log`, `screenshots/package-production-blocked.log`, `screenshots/build-production-guard.log`, `screenshots/build-production-nourl.log`.

## Visual evidence

Final Task 5 captures (local, gitignored):

- `screenshots/task5-final-full-360.png`, `-768.png`, `-1440.png`
- `screenshots/task5-final-contact-360.png`, `-768.png`, `-1440.png`
- `screenshots/task5-404-360.png`, `-768.png`, `-1440.png`
- `screenshots/task5-header-360.png`, `-768.png`, `-1440.png`
- `screenshots/task5-360-footer.png`, `screenshots/task5-logo-pair.png`

Task 1–4 comparison captures remain in `screenshots/task1-*`, `task2-*`, `task3-*` and `task4-*`.

## Unfinished and blocked items

1. **Production package is intentionally blocked.** Five sample reviews remain in `src/data/reviews.ts`; the production build refuses to package them. Replace with written client approvals (`sample: false`, `approved: true`) before producing `rivora-deploy.zip`.
2. **Real SMTP delivery was not tested.** No SMTP host, credentials or destination inbox were supplied. Local tests cover validation, rate limiting, honeypot, no-JS response and failure handling in dry-run mode only.
3. **Server behaviour was not tested on the target host.** No Apache or static host with `_headers` support was available locally. `.htaccess` and `_headers` rules are written but their live behaviour (HTTPS/www redirect, HSTS, caching, 404) must be confirmed after upload.
4. **Practice imagery is temporary.** The six 1440×700 artworks are code-generated placeholders. Replace `src/assets/images/practice-01…06.png` with licensed photographs and run `npm run images && npm run build`.
5. **Logo confirmation is pending.** The supplied `RIVORA-logo.svg` and light variant are wired in as-is; the client should confirm these are the final official files.
6. **Social preview rendering was not checked on external platforms.** The card is a local 1200×630 JPEG with correct meta tags.
7. **Physical-device testing was not performed.** Playwright emulates iPhone 13 and Pixel 7; a final check on real devices is still advisable.

## Client inputs still needed

- Official final logo files (or confirmation that the supplied files are final).
- Six licensed practice-area photographs, 1440×700 or larger.
- Production domain, to set `PUBLIC_SITE_URL` for canonical, Open Graph, sitemap and `robots.txt`.
- Hosting confirmation: PHP 8.1+ with `openssl`, `filter`, `hash` and `ctype`, plus a writable `rivora-config/rate-limit/` directory. If the host cannot run PHP, the endpoint must be ported to a serverless function before launch.
- SMTP host, port, encryption, username, password, envelope-from and destination inbox for `MAIL_TO`.
- Five real client reviews with written publication approval, plus confirmation of any attribution wording.
- Advocate approval of all existing client-supplied copy and the phone/WhatsApp number `+91 8099888851`.

## Reproduce

```bash
npm ci
npx playwright test

# Preview build and measurements
# PowerShell: $env:PUBLIC_SITE_ENV='preview'
PUBLIC_SITE_ENV=preview npm run build
node scripts/measure-contrast-real.mjs task5
node scripts/measure-visibility.mjs task5
node scripts/measure-practice.mjs task5
npm run audit:layout

# Contact endpoint (PHP 8.1+ required)
PHP_BIN=/path/to/php npm run test:contact

# Lighthouse
node scripts/serve-audit-build.mjs 4330
node scripts/lighthouse-median.mjs http://127.0.0.1:4330/ 3 task5-final

# Package
npm run package:preview
```
