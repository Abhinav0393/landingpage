module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer, runs, C, FONT, MONO, W, state } = L;
  const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';

  // ==========================================
  // ===== CHAPTER 26: HOSTING AND DEPLOYMENT =====
  // ==========================================
  o.push(h1('Hosting and Deployment'));
  o.push(P('RIVORA is an informational legal practice website with a static frontend and an optional lightweight contact endpoint. Infrastructure must prioritize low latency for visitors in India, high availability, strict security headers, and reliable authenticated e-mail delivery.'));

  o.push(h2('Hosting parameters and environment status'));
  o.push(P('All hosting parameters remain unconfirmed until the client provisions accounts or assigns infrastructure. The coding agent must not assume any server exists or create paid cloud resources autonomously.'));
  o.push(...tbl(['Parameter', 'Requirement / Description', 'Status'], [
    ['Domain name', 'Primary public apex and www domain for the practice', TBD],
    ['Hosting provider', 'Provider serving static assets and runtime endpoint (e.g. Hostinger, cPanel, Cloudflare, Netlify, VPS)', TBD],
    ['Hosting plan', 'Shared, VPS, or serverless tier capable of HTTPS and custom headers', TBD],
    ['Deployment region', 'Edge or regional server location closest to primary audience (Mumbai, Hyderabad, Chennai, New Delhi) ' + PRO, PRO],
    ['SSL / TLS certificate', 'Automated Let\'s Encrypt or host-managed TLS 1.3 certificate with HTTP-to-HTTPS redirect', TBD],
    ['Public web directory', 'Target path on server for static files (e.g. `public_html/`, `dist/`, or platform root)', TBD],
    ['Deployment method', 'Automated GitHub Actions CI/CD, SSH/rsync, or SFTP atomic deployment', TBD],
    ['Contact endpoint runtime', 'PHP 8.1+ with Composer/PHPMailer OR serverless edge function (Node.js/Python)', TBD],
    ['SMTP service provider', 'Authenticated transactional mail service (e.g. Google Workspace, Brevo, AWS SES, Postmark, cPanel SMTP)', TBD],
    ['Recipient e-mail', 'Verified practice mailbox for prospective client enquiries', TBD],
  ], [26, 52, 22]));

  o.push(h2('Hosting options matrix'));
  o.push(P('Three viable hosting architectures are evaluated below. Option A represents the traditional legal firm shared hosting path, Option B is the modern high-performance edge path, and Option C is for dedicated VPS control.'));
  o.push(...tbl(['Architecture Option', 'Pros', 'Cons', 'Verdict / Suitability'], [
    ['Option A: Static + PHP on Shared / cPanel host',
     'Single host for static assets and `api/contact.php`; native PHP mail environment; standard cPanel file manager and cron; low initial cost.',
     'Slower global TTFB; manual Apache `.htaccess` tuning needed; shared IP reputation can hurt outgoing SMTP deliverability if not using external relay.',
     'Acceptable if client already retains a cPanel hosting package with PHP 8.x.'],
    ['Option B: Static Edge CDN + Serverless Function\n(e.g. Cloudflare Pages, Netlify, Vercel) ' + PRO,
     'Sub-50ms TTFB across India; automatic SSL, Brotli, HTTP/3, and atomic rollbacks; zero server maintenance; native GitHub integration.',
     'Requires serverless contact function (`api/contact.ts`) instead of PHP; external SMTP service strictly required; edge environment secrets.',
     'PROPOSED — Recommended architecture for speed, security, and zero server management.'],
    ['Option C: Virtual Private Server (VPS)\n(e.g. Ubuntu + Nginx + PHP-FPM)',
     'Complete control over headers, caching, PHP extensions, and firewall; dedicated IP; isolated resources.',
     'Requires ongoing OS patches, firewall maintenance, SSL renewal scripts, and monitoring; overkill for a static site.',
     'Not recommended unless client has dedicated in-house systems administration.'],
  ], [24, 28, 28, 20], { fs: 17 }));

  o.push(h2('Standard deployment procedure'));
  o.push(P('The deployment pipeline follows eight sequential steps. Every step must succeed before the release is cut to production:'));
  o.push(...N([
    '**Step 1 — Install dependencies:** Run `npm ci` in a clean environment to ensure exact package versions match `package-lock.json`.',
    '**Step 2 — Code quality and type checks:** Execute `npm run check` (Astro type checking) and linter. Ensure zero TypeScript errors.',
    '**Step 3 — Production build:** Execute `npm run build` to compile static HTML, purged Tailwind CSS, bundled client scripts, and optimized AVIF/WebP images into `dist/`.',
    '**Step 4 — Verify output directory:** Assert `dist/index.html`, `dist/sitemap-index.xml`, `dist/robots.txt`, and asset bundles exist and meet file-size budgets.',
    '**Step 5 — Deploy static assets:** Transfer `dist/` contents to the web root using an atomic swap mechanism (symlink switch or platform deployment).',
    '**Step 6 — Configure contact endpoint:** Deploy `api/contact.php` (or serverless function) and set server environment variables outside document root.',
    '**Step 7 — Verify SSL and redirects:** Confirm HTTPS certificate validity, HSTS headers, and automatic redirection of `http://` and `www.` requests.',
    '**Step 8 — Live smoke testing:** Execute the automated smoke test suite (TC-34) against the live URL, testing navigation, layout, and contact submission.',
  ]));

  o.push(h2('GitHub Actions CI/CD workflow (reference)'));
  o.push(P('The reference workflow below automates testing, building, and Lighthouse audits on every pull request and push to `main`. The deployment step is stubbed pending client infrastructure selection.'));
  o.push(...code(`# .github/workflows/deploy.yml
name: CI & Deployment Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Verify TypeScript and Astro types
        run: npx astro check

      - name: Build production site
        run: npm run build
        env:
          PUBLIC_SITE_URL: \${{ secrets.PUBLIC_SITE_URL || 'https://rivora.example' }}
          PUBLIC_ALLOW_PLACEHOLDERS: 'false'

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Execute automated test suite
        run: npm test

      - name: Run Lighthouse CI audit
        run: npx @lhci/cli autorun

      # Deployment step — configure once hosting provider is selected
      - name: Deploy to hosting provider
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          echo "Deploying dist/ to production environment..."
          # Example for rsync/SFTP:
          # rsync -avz --delete dist/ \
          #   \${{ secrets.DEPLOY_USER }}@\${{ secrets.DEPLOY_HOST }}:/var/www/rivora/
        env:
          DEPLOY_KEY: \${{ secrets.DEPLOY_SSH_KEY }}`));

  o.push(h2('Environment variables register'));
  o.push(P('Runtime secrets and environment variables must never be committed to Git. The table below lists all required variables:'));
  o.push(...tbl(['Variable Name', 'Purpose', 'Expected Format / Example', 'Environment'], [
    ['`SMTP_HOST`', 'SMTP relay server hostname', '`smtp.gmail.com` or `mail.example.com`', 'Server only (Secret)'],
    ['`SMTP_PORT`', 'SMTP relay port (465 for SSL, 587 for TLS)', '`587`', 'Server only (Secret)'],
    ['`SMTP_SECURE`', 'Encryption protocol (`tls` or `ssl`)', '`tls`', 'Server only (Config)'],
    ['`SMTP_USER`', 'SMTP authentication username', '`relay@domain.com`', 'Server only (Secret)'],
    ['`SMTP_PASS`', 'SMTP authentication password or app secret', '`secret_app_password_here`', 'Server only (Secret)'],
    ['`MAIL_FROM`', 'Envelope sender address (must match SPF)', '`noreply@domain.com`', 'Server only (Config)'],
    ['`MAIL_TO`', 'Destination mailbox for enquiry notifications', '`enquiries@domain.com` ' + TBD, 'Server only (Config)'],
    ['`ALLOWED_ORIGINS`', 'Allowed HTTP Origin headers for CORS check', '`https://rivora.com,https://www.rivora.com`', 'Server only (Config)'],
    ['`RL_SALT`', 'Cryptographic salt for IP rate-limit hashing', 'Random 32-character hex string', 'Server only (Secret)'],
    ['`TRUSTED_IP_HEADER`', 'Client IP header (`CF-Connecting-IP`, `X-Forwarded-For`)', '`CF-Connecting-IP` (if Cloudflare)', 'Server only (Config)'],
    ['`PUBLIC_SITE_URL`', 'Canonical website URL for sitemap and OG tags', '`https://rivora.com` ' + TBD, 'Build time (Public)'],
    ['`PUBLIC_ALLOW_PLACEHOLDERS`', 'Permits placeholder badges on staging', '`false` (production) / `true` (staging)', 'Build time (Public)'],
  ], [26, 32, 26, 16], { fs: 17 }));

  o.push(h2('DNS, SSL, and redirection strategy'));
  o.push(...B([
    '**DNS TTL strategy:** Maintain a standard TTL of 86400 seconds (24 hours) during normal operations. Reduce TTL to 300 seconds (5 minutes) at least 48 hours before domain migration or launch to ensure rapid rollback if necessary.',
    '**Apex vs www redirection:** Client to designate canonical domain. A 301 Permanent Redirect must be configured so all traffic arrives at the single canonical host (e.g. `http://domain.com`, `http://www.domain.com`, and `https://www.domain.com` all redirect to `https://domain.com`).',
    '**HTTPS enforcement:** All port 80 (HTTP) traffic must redirect immediately to port 443 (HTTPS) with a 301 status before any asset is delivered.',
    '**Security header delivery:** On Apache/cPanel, headers are placed in the root `.htaccess` file. On edge hosts (Cloudflare Pages, Netlify), headers are placed in `_headers`. On Nginx, headers are defined in the server block.',
  ]));

  o.push(h2('Rollback, backups, and recovery'));
  o.push(...tbl(['Aspect', 'Procedure / Requirement', 'Owner'], [
    ['Atomic rollback', 'Maintain the previous release directory (`releases/YYYYMMDD-HHMMSS/`) on the server. Rolling back requires re-pointing a single `current` symlink, completing in under 2 seconds without downtime.', 'Deployer / Agent'],
    ['Source backups', 'The complete Git repository with all commit tags is hosted on GitHub. No deployment relies on uncommitted local files.', 'GitHub / Agent'],
    ['Environment backup', 'Server `.env` files are stored in an encrypted off-server password vault (e.g. 1Password / Bitwarden). Never store `.env` in the public web root.', 'Client / Ops'],
    ['DNS zone backup', 'Export the complete DNS BIND zone file before modifying any records.', 'Domain Owner'],
  ], [22, 58, 20]));

  o.push(h2('Post-deployment smoke testing checklist'));
  o.push(...CK([
    'Verify HTTP responds with 301 redirecting to HTTPS.',
    'Verify non-canonical domain redirects to canonical domain.',
    'Verify response headers include HSTS, CSP, X-Content-Type-Options, and Referrer-Policy.',
    'Inspect browser console for zero 404s, CORS errors, or mixed content warnings.',
    'Verify all 12 page sections render and navigation smooth-scrolls to anchors.',
    'Verify service selector tabs and FAQ accordion function correctly.',
    'Submit test enquiry via contact form; verify 200 OK and email delivery in test inbox.',
    'Test phone link (`tel:+918099888851`) and WhatsApp link (`wa.me/918099888851`).',
  ]));

  // ==========================================
  // ===== CHAPTER 27: TESTING STRATEGY =====
  // ==========================================
  o.push(h1('Testing Strategy'));
  o.push(P('The quality assurance program guarantees functional correctness, accessibility compliance (WCAG 2.2 AA), cross-device responsiveness, and performance budgets. Testing is integrated directly into the development workflow via automated Playwright test suites and Lighthouse CI.'));

  o.push(h2('Testing strategy overview and test pyramid'));
  o.push(P('Quality verification spans four layers:'));
  o.push(...B([
    '**Static analysis & type verification:** TypeScript `strict: true` and `astro check` run on every commit to verify component props and data schemas.',
    '**Unit & content verification:** Manifest tests assert verbatim presence of extracted legal text and confirm absence of quarantined testimonials.',
    '**End-to-End (E2E) & accessibility tests:** Automated Playwright test suites run across Chromium, Firefox, WebKit, and mobile viewports with `@axe-core/playwright`.',
    '**Visual & responsive verification:** Automated viewport sweeps from 320px to 2560px assert absence of horizontal scrolling and layout stability.',
  ]));

  o.push(h2('Test case register'));
  o.push(P('The table below specifies all 34 formal test cases. IDs TC-01 through TC-34 are cited throughout this specification:'));
  o.push(...tbl(['Test ID', 'Scope / Target', 'Verification Method', 'Expected Result'], [
    ['TC-01', 'Page structure & order', 'Playwright DOM query', 'All 12 sections present in exact sequence specified in Chapter 9.'],
    ['TC-02', 'Navigation anchors', 'Playwright click & scroll check', 'Clicking each header/footer link scrolls viewport to corresponding section.'],
    ['TC-03', 'Sticky header & scroll offset', 'Scroll page 500px; check position', 'Header remains fixed at top with backdrop blur; anchored headings clear header.'],
    ['TC-04', 'Mobile menu operation', 'Viewport 375px; toggle hamburger', 'Menu expands full screen; traps focus; closes on Esc or link click; body scroll locked.'],
    ['TC-05', 'Hero content & CTAs', 'DOM text & attribute check', 'H1 matches verbatim; both CTAs link to `#contact` and `#services`; 3 meta items present.'],
    ['TC-06', 'Search depth & expertise', 'Content string assertions', 'Verbatim match of 15/30/60 years and 3 expertise points against `content.json`.'],
    ['TC-07', 'Process stages', 'DOM inspection across breakpoints', '5 sequential stages displayed; visual connecting path rendered without overlap.'],
    ['TC-08', 'Service selector interaction', 'Click, touch, and ArrowLeft/Right', 'Active service changes; detail panel updates; aria-selected reflects state.'],
    ['TC-09', 'Hover transitions', 'CSS transition inspection', 'Cards and buttons exhibit smooth 150-200ms background/border transitions.'],
    ['TC-10', 'Scroll reveal animation', 'Intersection Observer scroll test', 'Elements fade and translate up as they enter viewport; zero layout shift.'],
    ['TC-11', 'No-JS fallback readability', 'Disable JS in browser context', 'Entire page content is 100% visible and readable; no opacity:0 or hidden elements.'],
    ['TC-12', 'FAQ accordion', 'Click accordion headers & keyboard', 'Clicking toggles panel visibility; updates `aria-expanded`; Enter/Space operable.'],
    ['TC-13', 'Reduced motion preference', 'Emulate `prefers-reduced-motion`', 'Marquee animation halts; reveal animations disable; smooth scroll becomes instant.'],
    ['TC-14', 'Marquee loop & pause control', 'Observe loop; click pause button', 'Marquee loops continuously without jump; clicking pause button stops movement.'],
    ['TC-15', 'Reviews quarantine logic', 'Text scan of built output', 'Source testimonials are completely absent; labelled placeholders shown on staging.'],
    ['TC-16', 'Call, copy & WhatsApp actions', 'Click handlers & clipboard mock', '`tel:` opens dialer; copy button copies number with feedback; WhatsApp opens chat.'],
    ['TC-17', 'Contact form valid submit', 'Fill valid inputs; submit form', 'Form sends POST; receives 200 OK; displays success message; resets inputs.'],
    ['TC-18', 'Form validation errors', 'Submit empty/invalid fields', 'Submission blocked; inline error messages appear; `aria-invalid` set on inputs.'],
    ['TC-19', 'Honeypot anti-spam trap', 'Populate hidden honeypot field', 'Server silently drops or rejects submission without sending SMTP mail.'],
    ['TC-20', 'Rate limit enforcement', 'Send 6 submissions within 15 min', 'Endpoint returns HTTP 429 Too Many Requests with friendly retry-after notice.'],
    ['TC-21', 'Mail server failure state', 'Simulate SMTP connection error', 'Endpoint returns HTTP 500/502; UI displays polite fallback phone/WhatsApp notice.'],
    ['TC-22', 'Footer legal descriptor', 'DOM inspection of footer bottom', '"Advocates & Associates" appears solely as the final text line of the footer.'],
    ['TC-23', 'Brand name header constraint', 'Header DOM inspection', 'RIVORA brand name appears exactly once in the header via the supplied logo.'],
    ['TC-24', 'Content inventory manifest', 'Automated manifest comparison', '100% of exact strings from `tests/content-manifest.json` present in DOM.'],
    ['TC-25', 'SEO metadata verification', 'Inspect `<head>` tags', '`<title>`, meta description, canonical, OG tags, and LegalService JSON-LD valid.'],
    ['TC-26', 'Skip link & keyboard order', 'Tab through document from start', 'Skip link is first focusable item; activates on Enter; tab order is fully logical.'],
    ['TC-27', 'Privacy notice & consent', 'Form DOM inspection', 'Privacy disclaimer text and mandatory consent checkbox present before submit.'],
    ['TC-28', 'Horizontal overflow check', 'Viewport sweep 320px to 2560px', '`document.documentElement.scrollWidth <= window.innerWidth` across all widths.'],
    ['TC-29', 'Image optimization & CLS', 'Network panel & layout shift API', 'Hero image preloaded with `fetchpriority="high"`; lazy images carry dimensions.'],
    ['TC-30', 'Security headers verification', 'HTTP response inspection', 'HSTS, CSP, X-Frame-Options, X-Content-Type-Options present and configured.'],
    ['TC-31', 'Axe accessibility audit', 'Run `@axe-core/playwright`', 'Zero automated accessibility violations (WCAG 2.1 & 2.2 AA standards).'],
    ['TC-32', 'Cross-browser rendering', 'Chromium, Firefox, WebKit suites', 'Visual and functional parity across all major rendering engines.'],
    ['TC-33', 'Visual reference comparison', 'Visual inspection vs DESIGN.md', 'Colors, fonts, container radii, and spacing align with design tokens.'],
    ['TC-34', 'Post-deployment smoke test', 'Live staging/production check', 'All core critical user paths functional in live deployed environment.'],
  ], [10, 26, 30, 34], { fs: 16 }));

  o.push(h2('Playwright configuration (reference)'));
  o.push(P('The test runner tests both desktop and mobile viewports across Chromium, Firefox, WebKit, and Edge:'));
  o.push(...code(`// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});`));

  o.push(h2('Automated horizontal overflow test'));
  o.push(P('To guarantee TC-28, Playwright tests a matrix of exact viewport widths:'));
  o.push(...code(`// tests/overflow.spec.ts
import { test, expect } from '@playwright/test';

const VIEWPORTS = [320, 360, 375, 390, 412, 600, 768, 820, 1024, 1280, 1440, 1920, 2560];

for (const width of VIEWPORTS) {
  test(\`no horizontal overflow at \${width}px width\`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > window.innerWidth;
    });

    expect(overflow, \`Horizontal overflow detected at \${width}px viewport!\`).toBe(false);
  });
}`));

  o.push(h2('Visual reference and fidelity note'));
  o.push(callout('Resolution limitation of supplied visual reference', [
    'The supplied screenshot `screen.png` has dimensions of 274 × 1600 px (low-resolution thumbnail). It is physically incapable of serving as a pixel-diffing baseline for high-resolution 1440px or 1920px desktop viewports.',
    'Automated visual regression testing must rely on programmatic DOM assertions, layout box coordinates, and visual inspection against `DESIGN.md` tokens until a full-resolution design export is supplied by the client (Chapter 31).',
  ], 'warn'));

  // ==========================================
  // ===== CHAPTER 28: CODING AGENT EXECUTION PLAN =====
  // ==========================================
  o.push(h1('Coding Agent Execution Plan'));
  o.push(P('This execution plan guides an autonomous coding agent from raw repository setup to final production handover. Work is divided into nine sequential phases. Progression is governed by strict Stop-and-Ask approval gates.'));

  o.push(h2('Nine execution phases'));
  o.push(...tbl(['Phase', 'Key Tasks', 'Inputs & Dependencies', 'Outputs & Exit Criteria'], [
    ['Phase 1: Project inspection & validation',
     'Inspect source files; generate `content-manifest.json`; identify missing assets; prepare Phase 1 audit report.',
     '`code.html`, `DESIGN.md`, `content.json`, this specification.',
     'Phase 1 report completed; manifest generated; blockers logged.'],
    ['Phase 2: Project setup & foundation',
     'Initialize Astro project; configure Tailwind CSS tokens; self-host DM Sans font; establish layout and reset CSS.',
     'Node 20+, Astro config, Tailwind config, design tokens.',
     '`npm run build` succeeds; global CSS and font tokens verified.'],
    ['Phase 3: Core content & static sections',
     'Implement all 12 page blocks in static Astro; bind typed data from `src/data/*.ts`; ensure verbatim text.',
     '`src/data/*.ts`, component specs (Chapter 9), `content.json`.',
     'All 12 sections render statically; TC-01 and TC-24 pass.'],
    ['Phase 4: Client-side interactions',
     'Implement vanilla TS interactions: sticky header, mobile nav, service selector, FAQ accordion, scroll reveal, copy.',
     'Interaction specs (Chapter 13), DOM elements.',
     'Zero JS framework runtime; TC-02 through TC-16 pass.'],
    ['Phase 5: Responsive design & viewports',
     'Apply responsive breakpoints; implement mobile drawer; adjust typography and paddings; eliminate overflow.',
     'Responsive strategy (Chapter 19), Playwright viewport suite.',
     'TC-28 passes across all 13 test viewports (320px to 2560px).'],
    ['Phase 6: Asset optimization & SEO',
     'Process images to AVIF/WebP; configure metadata, Open Graph, sitemap, `robots.txt`, and LegalService JSON-LD.',
     'Images, SEO specs (Chapter 21), performance targets (Chapter 22).',
     'LCP hero preloaded; CLS < 0.1; sitemap generated; TC-25 & TC-29 pass.'],
    ['Phase 7: Testing & accessibility audits',
     'Run full Playwright suite; run axe accessibility audits; execute Lighthouse mobile/desktop audits; fix defects.',
     'Test cases TC-01 to TC-34, `@lhci/cli`, `@axe-core/playwright`.',
     'Zero axe violations; Lighthouse Perf ≥ 90, A11y ≥ 95, SEO ≥ 95.'],
    ['Phase 8: Deployment & backend setup',
     'Deploy static assets to host; configure contact endpoint and SMTP environment variables; verify SSL and redirects.',
     'Target hosting environment, SMTP credentials, deploy workflow.',
     'Live staging URL active; form submission verified; TC-34 passes.'],
    ['Phase 9: Final handover & walkthrough',
     'Compile test reports; complete final handover checklist; verify credential rotation; provide client walkthrough.',
     'Test artifacts, Lighthouse reports, handover checklist (Chapter 32).',
     'Handover pack delivered; sign-offs recorded; repository clean.'],
  ], [18, 30, 26, 26], { fs: 16 }));

  o.push(h2('STOP-AND-ASK gates'));
  o.push(P('The coding agent must halt execution and request explicit client or advocate approval at the following seven gates:'));
  o.push(...tbl(['Gate ID', 'Topic / Blocker', 'Why Execution Must Halt', 'Resolution Required'], [
    ['GATE-01', 'Missing official logo', 'No vector or raster logo in source ZIP. Prototype monogram "R" is a placeholder.', 'Client must supply official SVG/PNG logo file before Phase 3 release.'],
    ['GATE-02', 'Testimonial quarantine', '5 unverified testimonials in source risk professional misconduct rules.', 'Client/Advocate must confirm approved reviews or retain placeholders.'],
    ['GATE-03', 'Missing FAQs 7 and 8', 'Brief specifies 8 FAQs; prototype provides only 6.', 'Client must supply 2 additional Q&As or formally approve shipping 6.'],
    ['GATE-04', 'Hosting & SMTP credentials', 'Cannot configure production contact endpoint or deploy live site without credentials.', 'Client must supply hosting access and authenticated SMTP credentials.'],
    ['GATE-05', 'Image licensing & masters', 'All 7 prototype images are hotlinked from external CDN; licensing unknown.', 'Client must supply original high-res licensed images or approve substitutes.'],
    ['GATE-06', 'Advocate regulatory sign-off', 'Bar Council of India rules regulate legal practice communications and claims.', 'Advocate RK.V must formally review and approve all published copy.'],
    ['GATE-07', 'Senior Advocate designation', '"Senior Advocate" is a statutory designation conferred under the Advocates Act.', 'Advocate must confirm whether designation is retained or adjusted.'],
  ], [12, 24, 38, 26], { fs: 16 }));

  o.push(h2('Phase 1 audit report template'));
  o.push(P('Upon completing Phase 1, the coding agent must output an audit report formatted as follows:'));
  o.push(...code(`# Phase 1 Inspection & Readiness Audit Report

Project: RIVORA Website Development
Date: [YYYY-MM-DD]
Agent: [Agent Name / Version]

1. SOURCE PACKAGE AUDIT
   - code.html: [Found / Bytes] — Content inventory parsed into content-manifest.json
   - DESIGN.md: [Found / Bytes] — Design tokens mapped to tailwind.config.mjs
   - screen.png: [Found / Dimensions] — Confirmed low-resolution; full-res requested
   - Official Logo: [NOT FOUND — Blocking GATE-01]
   - Image Assets: [NOT FOUND LOCALLY — Hotlinked to external CDN; Blocking GATE-05]

2. CONTENT & REGULATORY VERIFICATION
   - Verbatim Content Items: [Count] verified in manifest
   - Quarantined Items: 5 testimonials quarantined per CR-02
   - Content Risks Logged: CR-01 through CR-13 recorded for Advocate review

3. CONFLICT & DEFECT STATUS
   - Source Conflicts: C-01 through C-18 recognized and rulings applied
   - Prototype Defects: D-01 through D-24 identified for architectural remediation

4. READINESS & NEXT ACTIONS
   - Foundation Setup (Phase 2): Ready to proceed immediately
   - Blocker Escalation: GATE-01 (Logo) and GATE-05 (Images) submitted for client input`));

  // ==========================================
  // ===== CHAPTER 29: ACCEPTANCE CRITERIA =====
  // ==========================================
  o.push(h1('Acceptance Criteria'));
  o.push(P('Every requirement must satisfy measurable, objective acceptance criteria before project acceptance. The 40 criteria below (AC-01 to AC-40) are verified by the referenced test cases.'));

  o.push(h2('Acceptance criteria register'));
  o.push(...tbl(['ID', 'Category', 'Criterion Description', 'Pass Condition', 'Test Case'], [
    ['AC-01', 'Content', 'Page block completeness', 'All 12 sections present in exact sequence without omission', 'TC-01'],
    ['AC-02', 'Content', 'Verbatim text fidelity', 'All legal terms, search depths, and practice areas match manifest 100%', 'TC-24'],
    ['AC-03', 'Content', 'Testimonial quarantine', 'Zero unverified testimonials or ₹18 Cr claims appear in production', 'TC-15'],
    ['AC-04', 'Content', 'FAQ count integrity', 'Exactly 6 verified FAQs render; 2 missing FAQs not invented', 'TC-12'],
    ['AC-05', 'Design', 'Brand color token adherence', 'Ink `#151922`, Gold `#A98A50`, Ivory `#EDE8DD` applied strictly per tokens', 'TC-33'],
    ['AC-06', 'Design', 'Typography standardization', 'DM Sans applied exclusively across all headings and body copy', 'TC-33'],
    ['AC-07', 'Design', 'Single brand name in header', 'RIVORA text appears exactly once in header within logo block', 'TC-23'],
    ['AC-08', 'Design', 'Footer descriptor placement', '"Advocates & Associates" appears solely as final footer line', 'TC-22'],
    ['AC-09', 'Interactions', 'Sticky header behavior', 'Header remains fixed with backdrop filter; does not obscure headings', 'TC-03'],
    ['AC-10', 'Interactions', 'Mobile menu operation', 'Menu opens smoothly; traps keyboard focus; closes on Esc and link click', 'TC-04'],
    ['AC-11', 'Interactions', 'Service selector usability', 'Operable via mouse click, touch tap, and keyboard arrow keys', 'TC-08'],
    ['AC-12', 'Interactions', 'Accordion ARIA semantics', 'FAQ toggles update `aria-expanded` and `aria-controls` attributes', 'TC-12'],
    ['AC-13', 'Interactions', 'Telephone & copy actions', '`tel:` opens dialer; copy button provides temporary visual confirmation', 'TC-16'],
    ['AC-14', 'Responsive', 'No horizontal overflow', 'No horizontal scrollbar at any width from 320px to 2560px', 'TC-28'],
    ['AC-15', 'Responsive', 'Small mobile readability', 'Text legible at 320px without clipping; tap targets ≥ 44×44px', 'TC-28'],
    ['AC-16', 'Responsive', 'Tablet layout adaptation', 'Grid structures reflow cleanly at 768px and 1024px breakpoints', 'TC-28'],
    ['AC-17', 'Responsive', 'Ultra-wide containment', 'Content max-width constrained with centered margins on 1920px+ displays', 'TC-28'],
    ['AC-18', 'Performance', 'Largest Contentful Paint (LCP)', 'LCP ≤ 2.5 seconds on simulated mobile 4G network', 'TC-29'],
    ['AC-19', 'Performance', 'Interaction to Next Paint (INP)', 'INP ≤ 200 milliseconds (Total Blocking Time ≤ 200ms in lab)', 'TC-29'],
    ['AC-20', 'Performance', 'Cumulative Layout Shift (CLS)', 'CLS ≤ 0.1 across entire page lifecycle and scroll', 'TC-29'],
    ['AC-21', 'Performance', 'Lighthouse mobile performance', 'Lighthouse Mobile Performance score ≥ 90 on production build', 'TC-29'],
    ['AC-22', 'Accessibility', 'WCAG 2.2 AA automated scan', 'Zero critical or serious violations reported by axe-core', 'TC-31'],
    ['AC-23', 'Accessibility', 'Keyboard operability', '100% of interactive elements reachable and operable via keyboard alone', 'TC-26'],
    ['AC-24', 'Accessibility', 'Focus visible indicators', 'High-contrast 2px focus ring visible on all focused controls', 'TC-26'],
    ['AC-25', 'Accessibility', 'Color contrast compliance', 'Normal text ≥ 4.5:1; large text ≥ 3:1; Gold Ink used on light backgrounds', 'TC-31'],
    ['AC-26', 'Accessibility', 'Reduced motion support', '`prefers-reduced-motion` halts marquee, reveals, and smooth scroll', 'TC-13'],
    ['AC-27', 'Security', 'HTTPS and HSTS enforcement', 'Strict-Transport-Security header present; all HTTP traffic redirects', 'TC-30'],
    ['AC-28', 'Security', 'Content Security Policy (CSP)', 'CSP header restricts script, style, and object sources to same-origin', 'TC-30'],
    ['AC-29', 'Security', 'X-Frame-Options & Clickjacking', '`X-Frame-Options: DENY` or CSP `frame-ancestors \'none\'` present', 'TC-30'],
    ['AC-30', 'Security', 'Zero secret leaks', 'Zero SMTP passwords or private keys in git history or client bundles', 'TC-30'],
    ['AC-31', 'Form', 'Client and server validation', 'Submissions validated on both client and server; invalid input blocked', 'TC-18'],
    ['AC-32', 'Form', 'Honeypot bot protection', 'Honeypot field hidden from users; filled submissions rejected silently', 'TC-19'],
    ['AC-33', 'Form', 'Rate limiting protection', 'IP rate limiter restricts submissions to 5 per 15-minute window', 'TC-20'],
    ['AC-34', 'Form', 'Server failure graceful handling', 'SMTP failure returns clean 500 JSON; UI advises phone/WhatsApp fallback', 'TC-21'],
    ['AC-35', 'SEO', 'Meta tags completeness', 'Title, description, canonical link, and Open Graph tags present in `<head>`', 'TC-25'],
    ['AC-36', 'SEO', 'Structured data validity', 'Valid LegalService JSON-LD with verified name, phone, and regions', 'TC-25'],
    ['AC-37', 'SEO', 'Sitemap and robots.txt', '`sitemap-index.xml` and `robots.txt` generated and accessible at root', 'TC-25'],
    ['AC-38', 'Deployment', 'No-JS progressive enhancement', 'Full content readable and contact actions accessible with JS disabled', 'TC-11'],
    ['AC-39', 'Deployment', 'Cross-browser rendering parity', 'Flawless visual rendering in Chrome, Firefox, Safari, and Edge', 'TC-32'],
    ['AC-40', 'Deployment', 'Clean repository hygiene', 'Repo contains clean history, no build artifacts, lockfile committed', 'TC-34'],
  ], [10, 16, 32, 34, 8], { fs: 15 }));

  o.push(h2('Final acceptance sign-off checklist'));
  o.push(P('Project sign-off requires every box below to be checked by the authorized party:'));
  o.push(...CK([
    'All 40 Acceptance Criteria (AC-01 through AC-40) confirmed verified and passing.',
    'Playwright E2E test report demonstrates 100% pass rate across all projects.',
    'Axe accessibility report confirms zero WCAG 2.2 AA violations.',
    'Lighthouse CI report confirms: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.',
    'Advocate RK.V has formally signed off on legal wording and professional regulatory compliance.',
    'Client has reviewed and approved the visual layout on mobile, tablet, and desktop viewports.',
    'Contact form end-to-end delivery tested and confirmed receiving enquiries in client mailbox.',
  ]));

  // ==========================================
  // ===== CHAPTER 30: RISKS AND DEPENDENCIES =====
  // ==========================================
  o.push(h1('Risks and Dependencies'));
  o.push(P('This chapter identifies project risks, assesses their impact, defines mitigation actions, and documents critical path dependencies.'));

  o.push(h2('Project risk register'));
  o.push(P('Risks are assigned an ID, probability, impact, mitigation strategy, and accountable owner:'));
  o.push(...tbl(['Risk ID', 'Risk Description', 'Likelihood', 'Impact', 'Mitigation Strategy', 'Owner'], [
    ['R-01', 'Official logo asset missing from source files', 'High', 'High',
     'Quarantine logo area; request official SVG/PNG asset from client; use temporary neutral text fallback during Phase 2.', 'Client / Agent'],
    ['R-02', 'Hotlinked images expiring or licensing unknown', 'High', 'High',
     'Download master copies during Phase 1; request original licensed photography or select verified commercial stock.', 'Client / Agent'],
    ['R-03', 'Unverified testimonials breach advertising rules', 'High', 'Critical',
     'Quarantine all 5 prototype testimonials (CR-02); deploy with labelled placeholder on staging; publish only with written consent.', 'Advocate / Client'],
    ['R-04', 'Bar Council of India (BCI) regulatory scrutiny', 'Med', 'Critical',
     'Frame all copy as informational rather than solicitous; eliminate comparative superlatives; obtain formal advocate sign-off.', 'Advocate'],
    ['R-05', 'Hosting environment lacks PHP or custom header support', 'Med', 'High',
     'Verify host capabilities early in Phase 1; if PHP unavailable, pivot to serverless edge function (Option B, Chapter 26).', 'Hosting Provider'],
    ['R-06', 'SMTP deliverability failure (spam folder placement)', 'Med', 'High',
     'Use authenticated transactional relay (Sendgrid/Brevo/SES); configure SPF, DKIM, and DMARC DNS records for sender domain.', 'DNS Admin / Ops'],
    ['R-07', 'Contact form abuse and automated bot spam', 'High', 'Med',
     'Implement invisible honeypot field, CSRF/origin validation, and IP-based sliding window rate limiting (Chapter 25).', 'Coding Agent'],
    ['R-08', 'Missing FAQs 7 and 8 cause content gap', 'High', 'Low',
     'Ship with 6 verified FAQs; do not invent answers; request 2 remaining Q&As from client for subsequent release.', 'Client'],
    ['R-09', 'Missing micro-interaction reference videos', 'High', 'Low',
     'Implement interactions according to detailed textual specifications in Chapter 13; client to review during Phase 4.', 'Coding Agent'],
    ['R-10', 'Low-resolution screenshot (`screen.png`) prevents pixel diff', 'High', 'Low',
     'Rely on `DESIGN.md` tokens and programmatic layout assertions; request full-resolution export from design tool.', 'Client / Agent'],
    ['R-11', 'Gold `#A98A50` text fails WCAG AA contrast on light bg', 'High', 'Med',
     'Enforce Design System rule: use Gold Ink `#77592A` (6.2:1) for text; restrict Gold `#A98A50` to borders, icons, and dark grounds.', 'Coding Agent'],
    ['R-12', 'Third-party scope creep (frameworks, CMS, analytics)', 'Med', 'Med',
     'Strictly enforce approved stack (Chapter 16); reject unapproved libraries or tracking scripts without written change order.', 'Coding Agent'],
    ['R-13', 'Performance degradation from heavy uncompressed images', 'Med', 'High',
     'Automate Astro image pipeline to emit responsive AVIF/WebP sets; preload hero; lazy load below fold.', 'Coding Agent'],
    ['R-14', 'Safari / WebKit flexbox and smooth scroll quirks', 'Med', 'Med',
     'Test continuously in WebKit via Playwright; use CSS feature queries; apply `-webkit-` prefixes where necessary.', 'Coding Agent'],
    ['R-15', 'Digital Personal Data Protection (DPDP) Act obligations', 'Med', 'High',
     'Implement clear privacy notice; obtain explicit consent checkbox; do not store form messages in persistent web database.', 'Advocate / Agent'],
  ], [10, 26, 12, 12, 30, 10], { fs: 16 }));

  o.push(h2('Project dependency register'));
  o.push(P('Execution depends on the timely provision of the following items:'));
  o.push(...tbl(['Dep ID', 'Dependency Item', 'Category', 'Description & Impact on Critical Path', 'Owner'], [
    ['DEP-01', 'Official Vector Logo', 'Client Input', 'Required to render header brand block and footer brand asset (GATE-01).', 'Client'],
    ['DEP-02', 'High-res Licensed Images', 'Client Input', 'Required to replace hotlinked prototype images and avoid copyright risk (GATE-05).', 'Client'],
    ['DEP-03', 'Domain & DNS Access', 'Infrastructure', 'Required to configure production nameservers, SSL certificates, and SPF/DKIM.', 'Domain Owner'],
    ['DEP-04', 'Hosting Environment', 'Infrastructure', 'Required for staging and production deployments and endpoint execution.', 'Client / Ops'],
    ['DEP-05', 'Authenticated SMTP Account', 'Account', 'Required for reliable transmission of enquiry e-mails to the advocate.', 'Client / IT'],
    ['DEP-06', 'Advocate Copy Sign-Off', 'Compliance', 'Required prior to public indexing and launch to ensure BCI compliance (GATE-06).', 'Advocate RK.V'],
    ['DEP-07', 'Missing FAQs 7 & 8', 'Client Input', 'Optional for initial deployment; required for complete 8-question catalog.', 'Client'],
    ['DEP-08', 'Node.js 20+ & Build Tools', 'Tooling', 'Required by coding agent for Astro static compilation and test execution.', 'Coding Agent'],
  ], [12, 24, 18, 34, 12], { fs: 16 }));

  // ==========================================
  // ===== CHAPTER 31: MISSING INFO, ASSUMPTIONS, CONFLICTS =====
  // ==========================================
  o.push(h1('Missing Information and Assumptions'));
  o.push(P('This chapter consolidates all unconfirmed parameters, documents working assumptions, registers proposed decisions requiring approval, and provides the authoritative Source Conflict Register and Prototype Defect Register.'));

  o.push(h2('Missing information register'));
  o.push(P('Every item below is currently unconfirmed and must be treated as `TBD — Awaiting confirmation`:'));
  o.push(...tbl(['Item', 'Missing Information', 'Impact on Implementation', 'Fallback / Default Behavior'], [
    ['Official Logo', 'Vector file (SVG/AI/EPS) or high-res PNG', 'Header and footer brand rendering blocked', 'Render text-only brand placeholder on staging'],
    ['FAQs 7 & 8', 'Questions and answers 7 and 8', 'FAQ accordion has 6 items instead of 8', 'Ship 6 verified items; reserve schema for 8'],
    ['Image Originals', 'Licensed high-res raster files', 'Images hotlinked to design CDN', 'Download CDN files locally during Phase 1'],
    ['Domain Name', 'Public apex and www domain', 'Canonical URLs, sitemap, Open Graph', 'Use placeholder `https://rivora.example`'],
    ['Hosting Details', 'Server type, provider, public directory', 'Production deployment automation', 'Build to local `dist/`; manual upload ready'],
    ['SMTP Credentials', 'Host, port, username, password', 'Contact form enquiry delivery', 'Mock submission in development/staging'],
    ['Enquiry Mailbox', 'Recipient e-mail address', 'Destination of contact form messages', 'Hold messages in server logs if unconfigured'],
    ['Practice Address', 'Physical office street address', 'Local SEO and footer contact card', 'Omit address; show 3 operating regions only'],
    ['Senior Advocate', 'Statutory designation confirmation', 'Hero copy and metadata wording', 'Advocate to confirm; keep source text meanwhile'],
  ], [18, 28, 26, 28], { fs: 16 }));

  o.push(h2('Working assumptions'));
  o.push(P('The coding agent works under the following confirmed operational assumptions:'));
  o.push(...B([
    '**A-01: Informational scope:** The website is strictly an informational legal brochureware site with no user accounts, database, shopping cart, or online payment gateways.',
    '**A-02: Single-page architecture:** All content resides on a single index page with 12 distinct sections navigable via internal anchor links.',
    '**A-03: English language only:** The initial website release is published entirely in English (`<html lang="en">`). No multi-language translation is in scope.',
    '**A-04: Target geographic audience:** The primary audience resides in Telangana, Andhra Pradesh, and New Delhi, India; hosting and latency must cater to Indian networks.',
    '**A-05: Desktop and mobile parity:** 100% of information and actions available on desktop must be accessible on mobile viewports.',
    '**A-06: Modern browser support:** Target browsers include modern evergreen Chromium, Firefox, WebKit (Safari), and Edge released within the trailing 24 months.',
    '**A-07: Static hosting capability:** The static site (`dist/`) can be hosted on any standard web server, object store, or CDN supporting HTTPS.',
  ]));

  o.push(h2('Decisions requiring client approval'));
  o.push(P('The following technical and architectural proposals require explicit client approval. To prevent collision with prototype defect IDs (D-nn), these proposals are identified as AP-01 through AP-15:'));
  o.push(...tbl(['ID', 'Proposed Recommendation', 'Rationale / Benefit', 'Status'], [
    ['AP-01', 'Self-host DM Sans variable WOFF2 font', 'Eliminates third-party Google Fonts requests; improves privacy and LCP', PRO],
    ['AP-02', 'Modern contact form architecture (Chapter 25)', 'Provides structured prospective client enquiries with rate limiting', PRO],
    ['AP-03', 'Use Gold Ink `#77592A` for small text on light grounds', 'Achieves WCAG AA 4.5:1 contrast where Gold `#A98A50` fails (3.12:1)', PRO],
    ['AP-04', 'Quarantine 5 unverified testimonials from prototype', 'Avoids severe BCI advertising violations and unverified savings claims', PRO],
    ['AP-05', 'Replace prototype slider with editorial index & panel', 'Eliminates inaccessible slider; improves mobile usability and scanning', PRO],
    ['AP-06', 'Render search depth as connected visual timeline', 'Enhances visual storytelling of 15/30/60-year search horizons', PRO],
    ['AP-07', 'Deploy on static edge CDN with serverless contact API', 'Delivers sub-50ms TTFB across India with zero server maintenance', PRO],
    ['AP-08', 'Preload hero image with `fetchpriority="high"`', 'Reduces Largest Contentful Paint (LCP) time significantly', PRO],
    ['AP-09', 'Add manual pause/resume control to marquees', 'Satisfies WCAG 2.2.2 requirement for moving/scrolling content', PRO],
    ['AP-10', 'Generate minimal LegalService structured data (JSON-LD)', 'Improves legal practice search visibility without inventing credentials', PRO],
    ['AP-11', 'Enforce strict Content Security Policy (CSP) headers', 'Mitigates XSS and content injection attacks in production', PRO],
    ['AP-12', 'Automated `@axe-core/playwright` accessibility testing in CI', 'Prevents accessibility regressions during subsequent updates', PRO],
    ['AP-13', 'Internationalize telephone link to `tel:+918099888851`', 'Ensures one-touch mobile dialing succeeds from international SIMs', PRO],
    ['AP-14', 'Deploy with 6 verified FAQs pending client receipt of 2 more', 'Allows deployment without fabricating legal content', PRO],
    ['AP-15', 'Omit dedicated regions section; display in footer text only', 'Prevents redundant thin content blocks while maintaining clarity', PRO],
  ], [10, 36, 42, 12], { fs: 16 }));

  o.push(h2('Source conflict register'));
  o.push(P('Where project sources disagree, the rulings below govern implementation. IDs C-01 through C-18 are exact:'));
  o.push(...tbl(['Conflict ID', 'Conflict Description & Discrepancy', 'Authoritative Ruling & Action'], [
    ['C-01', 'Brief specifies 8 FAQs; prototype `code.html` contains only 6.',
     'Authoritative: Ship 6 verified FAQs from `code.html`. Mark FAQs 7 & 8 as TBD. Do not invent questions.'],
    ['C-02', 'Brief specifies "At a glance"; prototype labels section "Core Scrutiny Pillars" (`#pillars`).',
     'Authoritative: Retain source wording "Core Scrutiny Pillars" and anchor `#pillars`; name component `AtGlance.astro`.'],
    ['C-03', '`DESIGN.md` specifies 0px sharp corners; client brief requires large rounded containers.',
     'Authoritative: Client brief wins. Use large rounded borders (`rounded-2xl`, `rounded-3xl`) matching `screen.png`.'],
    ['C-04', 'Prototype displays monogram "R" + text; brief specifies official logo once; logo file missing.',
     'Authoritative: Brief wins. Display official logo once in header; quarantine monogram; await logo file (GATE-01).'],
    ['C-05', 'Contact name "RK.V & Team" (brief) vs "Advocate RK.V & Associates" (code.html); form absent in source.',
     'Authoritative: Brief wins for name "RK.V & Team"; contact form is PROPOSED (AP-02) and implemented per Chapter 25.'],
    ['C-06', 'Process stage names in brief differ from headings in `code.html`.',
     'Authoritative: Retain `code.html` source headings verbatim (Consultation, Document Architecture, Scrutiny, Written Opinion, Support).'],
    ['C-07', 'Source has 5 named unverified testimonials with firm names; brief strictly forbids unverified claims.',
     'Authoritative: Brief wins. Quarantine all 5 testimonials (CR-02); replace with labelled placeholders on staging.'],
    ['C-08', 'Hero and service images are hotlinked from external CDN; not supplied locally in source ZIP.',
     'Authoritative: Download CDN images locally during Phase 1 for development; request licensed originals (GATE-05).'],
    ['C-09', 'Prototype header is `position: absolute` with no mobile menu; brief requires sticky + mobile nav.',
     'Authoritative: Brief wins. Header is sticky (`position: sticky`) with full mobile overlay menu (TC-03, TC-04).'],
    ['C-10', 'Footer labels "Service Jurisdictions"; brief notes "no dedicated Serving Across Three Regions section".',
     'Authoritative: Retain 3 regions as footer text lines; omit dedicated full-width section; resolve via AP-15.'],
    ['C-11', '"ADVOCATES & ASSOCIATES" appears in prototype brand blocks; brief requires it only at bottom of footer.',
     'Authoritative: Brief wins. Remove descriptor from header/footer brand blocks; render solely as final footer line.'],
    ['C-12', 'Anchor `#expertise` labelled "ACQUISITIONS" in header nav but "Counsel Practice" in footer.',
     'Authoritative: Retain source labels in their respective locations; submit harmonisation for client approval.'],
    ['C-13', '`DESIGN.md` front-matter contains Material tokens (`#f9f9ff`); brief specifies palette (`#FBFAF7`, `#151922`).',
     'Authoritative: Brief palette wins. Canvas `#FBFAF7`, Ink `#151922`, Gold `#A98A50`, Ivory `#EDE8DD` strictly enforced.'],
    ['C-14', 'Prototype relies on runtime CDN Tailwind, Google Fonts, and inline onclick; brief specifies modern stack.',
     'Authoritative: Brief wins. Rebuild with static Astro, build-time Tailwind, self-hosted fonts, and vanilla TS.'],
    ['C-15', 'ZIP file named `stitch_rivora_legal_website_design (1).zip` in brief vs `stitch_rivora_legal_website_design__1_.zip`.',
     'Authoritative: Trivial filename encoding difference. Verified contents are identical.'],
    ['C-16', 'Prototype uses interactive slider with arrows and counter; brief requires editorial index.',
     'Authoritative: Brief wins. Rebuild as vertical editorial practice list with synchronized detail display panel.'],
    ['C-17', 'Prototype formats search depth as 3 separate cards; brief specifies connected visual timeline.',
     'Authoritative: Brief wins. Format as horizontal connected timeline with 30-year benchmark visually emphasised.'],
    ['C-18', 'Brief references interaction videos; no video files were included in the source ZIP package.',
     'Authoritative: Infer interaction behavior from brief and prototype CSS; if videos supplied later, video behavior wins.'],
  ], [10, 42, 48], { fs: 16 }));

  o.push(h2('Prototype defect register'));
  o.push(P('The prototype `code.html` contains 24 demonstrable technical and accessibility defects. All must be corrected in the production implementation. IDs D-01 through D-24 are exact:'));
  o.push(...tbl(['Defect ID', 'Defect Description', 'Remediation in Production'], [
    ['D-01', 'Navigation hidden below 1280px; zero mobile navigation provided.',
     'Implement responsive slide-out mobile navigation drawer with accessible hamburger button (TC-04).'],
    ['D-02', 'Header styled `position: absolute`; scrolls off screen immediately.',
     'Style header `position: sticky; top: 0` with backdrop-filter blur and shadow on scroll (TC-03).'],
    ['D-03', 'No-JS fallback broken; `.no-js` class never set; reveal items stay opacity: 0.',
     'Default elements to visible; apply reveal classes only after JavaScript executes and initializes (TC-11).'],
    ['D-04', 'Testimonial marquee not seamless (5 originals + 3 clones; translate -50% causes jump).',
     'Implement exact 100% clone set with `-50%` CSS keyframe translate loop for seamless continuous scroll (TC-14).'],
    ['D-05', '`animate-pulse` class ignores `prefers-reduced-motion` media query.',
     'Wrap all animations in `@media (prefers-reduced-motion: no-preference)` block (TC-13).'],
    ['D-06', 'Global CSS hides browser scrollbars (`::-webkit-scrollbar { display: none; }`).',
     'Remove global scrollbar suppression; allow standard accessible OS/browser scrollbars.'],
    ['D-07', 'FAQ accordion lacks `aria-expanded`/`aria-controls`; uses fragile `div:last-child` selectors.',
     'Implement semantic `<button>` triggers with ARIA state attributes and explicit panel IDs (TC-12).'],
    ['D-08', 'Services slider links focusable when off-screen; tabs lack ARIA; fixed min-height clips.',
     'Replace slider with accessible tablist/tabpanel pattern; remove fixed heights; manage focus (TC-08).'],
    ['D-09', 'Material Symbols icon font loaded from Google CDN; ligatures flash raw text if font fails.',
     'Replace icon font with clean inline SVG components for only the specific glyphs in use.'],
    ['D-10', 'Tailwind loaded via runtime browser CDN script (~300KB unpurged).',
     'Compile Tailwind CSS at build time via Astro integration; purge unused classes completely.'],
    ['D-11', 'Google Fonts loaded via third-party network requests causing privacy and latency issues.',
     'Self-host DM Sans variable WOFF2 font locally in project bundle with single preloaded file.'],
    ['D-12', 'Hotlinked images lack intrinsic dimensions and responsive `srcset` (severe CLS).',
     'Process images through Astro asset pipeline with explicit `width`, `height`, and AVIF/WebP formats.'],
    ['D-13', 'Gold `#A98A50` text fails WCAG AA contrast on light backgrounds (3.12:1; white on gold 3.26:1).',
     'Apply Gold Ink `#77592A` (6.2:1) for text on light backgrounds; restrict `#A98A50` to borders and dark grounds.'],
    ['D-14', 'Body copy set to 12px (`text-xs`), violating readability standards.',
     'Establish 15px/16px baseline for body text; ensure line-height is at least 1.5.'],
    ['D-15', 'Complete absence of essential SEO meta tags (description, canonical, OG, Twitter, favicon).',
     'Inject comprehensive, verified metadata, canonical links, Open Graph tags, and favicons (TC-25).'],
    ['D-16', 'Clipboard copy fallback uses intrusive synchronous browser `alert()` dialog.',
     'Replace `alert()` with non-blocking inline visual badge and `aria-live` announcement (TC-16).'],
    ['D-17', 'Meaningless "Account" icon button present in header for a static informational website.',
     'Remove "Account" button entirely from header navigation.'],
    ['D-18', 'Pulsing "Consultations Active" badge implies real-time 24/7 advocate availability.',
     'Advocate to review; replace with neutral practice availability indicator or remove.'],
    ['D-19', 'Hover-scale `scale-103` and hover-only affordances unusable on touch/mobile devices.',
     'Ensure all interactive elements have visible default affordances and touch-friendly tap states.'],
    ['D-20', 'Telephone `tel:` link lacks country code prefix (`tel:8099888851`).',
     'Update link to international format `tel:+918099888851` (PROPOSED, AP-13).'],
    ['D-21', 'Marquee and animated elements lack manual user pause control (WCAG 2.2.2).',
     'Provide visible, keyboard-accessible play/pause toggle button for marquee animations (TC-14).'],
    ['D-22', 'Heading levels skip hierarchy (H1 jumps to H4/H5; Pillars section completely lacks H2).',
     'Re-structure semantic hierarchy: exactly one H1; each major block starts with an H2; subsections use H3.'],
    ['D-23', 'Brittle inline JavaScript `onclick` attributes scattered throughout prototype HTML.',
     'Extract all JavaScript into modular TypeScript components with `addEventListener`.'],
    ['D-24', 'Hard-coded FAQ numbering and unverified "VERIFIED" badges / 5-star ratings in reviews.',
     'Remove hard-coded numbers; quarantine unverified reviews and misleading ratings claims.'],
  ], [10, 42, 48], { fs: 16 }));

  // ==========================================
  // ===== CHAPTER 32: FINAL HANDOVER CHECKLIST =====
  // ==========================================
  o.push(h1('Final Handover Checklist'));
  o.push(P('Prior to project closure and client handover, the coding agent must complete and verify every checklist below.'));

  o.push(h2('Deliverables package checklist'));
  o.push(...CK([
    'Clean Git repository with complete commit history, tagged release `v1.0.0`, and `.gitignore`.',
    'Compiled production distribution directory (`dist/`) containing static HTML, CSS, JS, and assets.',
    'Backend contact endpoint file (`api/contact.php` or serverless handler) ready for deployment.',
    'Complete Website Development Specification in both editable DOCX and publication PDF formats.',
    'Content inventory manifest (`tests/content-manifest.json`) and raw extraction (`rivora_source_content.json`).',
    'Deployment guide detailing steps for initial release, rollback, and environment variable configuration.',
    'Automated test execution reports (Playwright E2E and Lighthouse CI JSON/HTML summaries).',
    'Known issues and deferred items register documenting all TBD items awaiting client input.',
  ]));

  o.push(h2('Authoritative sign-offs checklist'));
  o.push(...CK([
    'Advocate RK.V has formally reviewed and signed off on all published legal terminology and BCI compliance.',
    'Client has reviewed and approved the visual design, typography, brand colors, and container corner radii.',
    'Client has approved the contact form fields, privacy consent wording, and enquiry destination mailbox.',
    'Advocate has reviewed and decided upon all content items flagged CR-01 through CR-13.',
  ]));

  o.push(h2('Quality evidence attachments checklist'));
  o.push(...CK([
    'Lighthouse CI mobile audit report attached confirming Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.',
    'Playwright cross-browser test report attached confirming 100% pass across Chromium, Firefox, and WebKit.',
    'Axe accessibility scan attached confirming zero WCAG 2.2 Level AA violations.',
    'Security headers scan attached confirming presence of HSTS, CSP, X-Frame-Options, and Referrer-Policy.',
    'Viewport sweep report attached confirming zero horizontal overflow from 320px to 2560px.',
  ]));

  o.push(h2('Repository hygiene and security checklist'));
  o.push(...CK([
    'Verified zero passwords, API keys, SMTP credentials, or private keys exist in any Git commit or branch.',
    'Verified `.env` and `.env.production` files are excluded by `.gitignore`.',
    'Verified all dependencies are locked via `package-lock.json` with zero high/critical vulnerabilities (`npm audit`).',
    'All development console logs and debugging scripts stripped from production bundles.',
  ]));

  o.push(h2('Credentials transfer and rotation checklist'));
  o.push(...CK([
    'Server SSH keys and hosting access credentials transferred to client via encrypted channel.',
    'SMTP relay passwords transferred securely; temporary development credentials invalidated.',
    'Client advised to rotate hosting control panel passwords following project acceptance.',
  ]));

  // ==========================================
  // ===== CHAPTER 33: PROJECT URL & ENVIRONMENT REGISTER =====
  // ==========================================
  o.push(h1('Project URL and Environment Register'));
  o.push(P('This chapter records all project URLs and deployment environments. All values are currently unconfirmed and must be treated as `TBD — Awaiting confirmation`. Do not assume any domain is currently connected.'));

  o.push(h2('Project URL register'));
  o.push(...tbl(['Property / Resource', 'Assigned URL / Value', 'Environment Type', 'Status & Notes'], [
    ['Current website URL', TBD, 'Existing site', 'TBD — Awaiting confirmation; practice may currently lack a live site.'],
    ['Design preview URL', TBD, 'Design preview', 'TBD — Awaiting confirmation; Figma/Stitch preview URL if available.'],
    ['Staging URL', TBD, 'Pre-production staging', 'TBD — Awaiting confirmation; password-protected staging environment.'],
    ['Production URL', TBD, 'Production public site', 'TBD — Awaiting confirmation; final public domain.'],
    ['Domain name (apex)', TBD, 'Domain registrar', 'TBD — Awaiting confirmation; apex domain (e.g. `rivora.com`).'],
    ['Domain name (www)', TBD, 'Domain registrar', 'TBD — Awaiting confirmation; www host with 301 redirect to apex.'],
    ['Hosting provider console', TBD, 'Infrastructure', 'TBD — Awaiting confirmation; management portal URL.'],
    ['Git repository URL', TBD, 'Version control', 'TBD — Awaiting confirmation; GitHub repository for source code.'],
    ['Contact form destination', TBD, 'Application endpoint', 'TBD — Awaiting confirmation; `https://{domain}/api/contact`.'],
  ], [24, 26, 22, 28], { fs: 16 }));

  o.push(h2('Environment configuration register'));
  o.push(P('Runtime configuration settings across environments:'));
  o.push(...tbl(['Configuration Variable', 'Development (Local)', 'Staging Environment', 'Production Environment', 'Sensitivity'], [
    ['`PUBLIC_SITE_URL`', '`http://localhost:4321`', TBD, TBD, 'Public'],
    ['`PUBLIC_ALLOW_PLACEHOLDERS`', '`true`', '`true`', '`false`', 'Public'],
    ['`SMTP_HOST`', '`localhost` / mock', TBD, TBD, 'Secret'],
    ['`SMTP_PORT`', '`1025` (Mailpit)', TBD, TBD, 'Config'],
    ['`SMTP_SECURE`', '`none`', '`tls`', '`tls`', 'Config'],
    ['`SMTP_USER`', '`none`', TBD, TBD, 'Secret'],
    ['`SMTP_PASS`', '`none`', TBD, TBD, 'Secret'],
    ['`MAIL_FROM`', '`dev@localhost`', TBD, TBD, 'Config'],
    ['`MAIL_TO`', '`test@localhost`', TBD, TBD, 'Config'],
    ['`ALLOWED_ORIGINS`', '`http://localhost:4321`', TBD, TBD, 'Config'],
    ['`RL_SALT`', '`local_dev_salt_123`', TBD, TBD, 'Secret'],
    ['`TRUSTED_IP_HEADER`', '`REMOTE_ADDR`', TBD, TBD, 'Config'],
  ], [22, 22, 20, 20, 16], { fs: 15 }));

  // ==========================================
  // ===== APPENDICES =====
  // ==========================================
  state.inApp = true;

  // Appendix A
  o.push(h1('Glossary of Identifiers and Acronyms'));
  o.push(P('This glossary defines all formal prefixes, acronyms, and statutory legal terms referenced throughout this specification:'));
  o.push(...tbl(['Identifier / Acronym', 'Full Term / Meaning', 'Definition and Usage Context'], [
    ['AC-nn', 'Acceptance Criteria', 'Measurable requirements (AC-01 through AC-40) defined in Chapter 29.'],
    ['AP-nn', 'Approval Proposal', 'Architectural proposals (AP-01 through AP-15) requiring client sign-off (Chapter 31).'],
    ['B-nn', 'Business Objectives', 'Core business objectives (B-01 through B-06) defined in Chapter 5.'],
    ['BCI', 'Bar Council of India', 'Statutory body regulating legal practice, ethics, and professional conduct in India.'],
    ['C-nn', 'Conflict Register Item', 'Specific contradictions between brief and source files (C-01 to C-18) in Chapter 31.'],
    ['CK', 'Checklist Item', 'Interactive checkbox item for manual quality verification.'],
    ['CLS', 'Cumulative Layout Shift', 'Core Web Vital measuring visual layout stability (target ≤ 0.1).'],
    ['CR-nn', 'Content Risk Item', 'Content items requiring advocate legal verification (CR-01 to CR-13) in Chapter 8.'],
    ['D-nn', 'Prototype Defect Item', 'Technical or accessibility defects in `code.html` (D-01 to D-24) in Chapter 31.'],
    ['DPDP Act', 'Digital Personal Data Protection Act', 'Indian statutory regulation governing personal data collection and privacy.'],
    ['EC', 'Encumbrance Certificate', 'Official Sub-Registrar record of registered property transactions and encumbrances.'],
    ['FMB', 'Field Measurement Book', 'Government revenue record showing surveyed land plot boundaries and dimensions.'],
    ['FR-nn', 'Functional Requirement', 'Functional capabilities (FR-01 through FR-22) defined in Chapter 14.'],
    ['INP', 'Interaction to Next Paint', 'Core Web Vital measuring page responsiveness to user input (target ≤ 200ms).'],
    ['IX-nn', 'Interaction Specification', 'Detailed UI interaction definitions (IX-01 through IX-10) in Chapter 13.'],
    ['JDA / GPA', 'Joint Dev Agreement / General Power of Atty', 'Critical title documents subject to scrutiny in real estate due diligence.'],
    ['LCP', 'Largest Contentful Paint', 'Core Web Vital measuring perceived loading speed (target ≤ 2.5s).'],
    ['NFR-nn', 'Non-Functional Requirement', 'System quality constraints (NFR-01 through NFR-12) defined in Chapter 15.'],
    ['O-nn', 'Operational Objectives', 'Practice operational objectives (O-01 through O-08) defined in Chapter 5.'],
    ['ROR / Pahanis', 'Record of Rights / Revenue Land Records', 'State agricultural revenue land tenancy, cultivation, and ownership registers.'],
    ['Section 22-A', 'Registration Act, 1908 (Sec 22-A)', 'Statutory prohibition against registration of assigned, government, or Wakf lands.'],
    ['TC-nn', 'Test Case Identifier', 'Formal test cases (TC-01 through TC-34) defined in Chapter 27.'],
    ['WCAG', 'Web Content Accessibility Guidelines', 'W3C international standards for digital accessibility (target: WCAG 2.2 AA).'],
  ], [18, 32, 50], { fs: 16 }));

  // Appendix B
  o.push(h1('Source File Inventory'));
  o.push(P('The project scope is derived from the inspection of three original source files supplied in the client package:'));
  o.push(...tbl(['File Name', 'File Size', 'Format / Role', 'Authoritative Contribution and Scope'], [
    ['`code.html`', '84,025 bytes', 'HTML / CSS prototype',
     'Authoritative source for 100% of website content (headings, body copy, practice descriptions, FAQ answers, contact details). Generated via Tailwind CDN and contains 24 technical defects catalogued for remediation.'],
    ['`DESIGN.md`', '10,140 bytes', 'Markdown style guide',
     'Authoritative source for core color tokens (Ink `#151922`, Gold `#A98A50`, Ivory `#EDE8DD`), DM Sans typographic scale, spacing scales, and visual container guidelines (superseded by brief for corner radius).'],
    ['`screen.png`', '215,272 bytes\n(274 × 1600 px)', 'PNG raster image',
     'Low-resolution visual thumbnail indicating overall composition, dark hero treatment, large rounded containers, and section flow. Not usable for pixel-level regression testing due to low resolution.'],
  ], [16, 16, 20, 48], { fs: 16 }));

  state.inApp = false;
  return o;
};