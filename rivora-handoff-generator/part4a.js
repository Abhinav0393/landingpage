module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer } = L; const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';

  // ===== 16 =====
  o.push(h1('Technical Stack'));
  o.push(P('The stack below is the client-approved architecture. Versions are deliberately **not** hard-coded in this document: the agent installs the current stable release of each package, records the exact versions in `package.json`/lockfile, and does not upgrade majors mid-project.'));
  o.push(...tbl(['Layer', 'Technology', 'Why it is selected', 'Constraint'], [
    ['Frontend framework', 'Astro (static output)', 'Ships HTML with no client framework by default; component structure without runtime cost; built-in image optimisation; ideal for a content site', '`output: "static"`; no SSR adapter unless hosting demands it'],
    ['Language', 'TypeScript (strict)', 'Type-safe content data, scripts and config; catches errors at build time', '`strict: true`; no `any`'],
    ['Styling', 'Tailwind CSS + one global CSS file', 'Token-driven utilities match `DESIGN.md`; global CSS holds tokens, keyframes and component patterns that utilities express poorly', 'Replace the prototype\'s runtime CDN script with the build-time integration'],
    ['Interactions', 'Vanilla TypeScript', 'Every interaction is small (menu, tabs, accordion, reveal, copy, form); a framework would add weight for no gain', 'No React, Vue, Alpine or jQuery'],
    ['Scroll animation', 'Intersection Observer API', 'Native, efficient, no scroll listeners', 'Feature-detect; content visible if unsupported'],
    ['Marquees', 'CSS keyframes', 'Compositor-friendly transform animation, no JS per frame', 'Transform only'],
    ['Images', 'AVIF / WebP (JPEG fallback) via Astro assets', 'Smaller files, responsive sets, intrinsic sizes', 'Masters kept in `src/assets`'],
    ['Fonts', 'Self-hosted DM Sans variable WOFF2', 'Privacy, performance, no third-party round trip', 'Latin subset; one preload'],
    ['Contact backend', 'PHP endpoint, if the host supports it', 'Smallest backend on typical shared hosting; no database', 'If PHP is unavailable use the alternative in Chapter 25'],
    ['E-mail delivery', 'Authenticated SMTP (PHPMailer)', 'Reliable delivery and SPF/DKIM alignment; avoids PHP `mail()`', 'Credentials only in server env'],
    ['Version control', 'Git + GitHub', 'History, review, CI', 'Repository URL ' + TBD],
    ['Testing', 'Playwright (+ axe-core for accessibility)', 'Cross-engine E2E, viewport and visual checks in one tool', 'Chromium, Firefox, WebKit, mobile emulations'],
    ['Performance audit', 'Lighthouse (CLI / Lighthouse CI)', 'Repeatable lab scoring against budgets', 'Run on `astro preview`'],
  ], [14, 20, 40, 26], { fs: 17 }));
  o.push(h2('Dependencies permitted beyond the table'));
  o.push(...tbl(['Package', 'Purpose', 'Status'], [
    ['`@astrojs/sitemap`', 'Generate `sitemap-index.xml` once `site` is known', PRO],
    ['`@fontsource-variable/dm-sans`', 'Self-hosted DM Sans WOFF2 (OFL)', PRO],
    ['`@axe-core/playwright`', 'Automated accessibility checks in CI', PRO],
    ['`@lhci/cli`', 'Lighthouse CI budgets', PRO],
    ['`phpmailer/phpmailer` (Composer)', 'SMTP sending in `api/contact.php`', PRO],
  ], [32, 48, 20]));
  o.push(P('**Not allowed without a demonstrated requirement and client approval:** React, Next.js, any SPA framework, a database, authentication, a large animation library (GSAP, Framer Motion, Lottie), analytics or tag managers, CSS-in-JS, icon fonts.'));
  o.push(h2('If hosting does not support a feature'));
  o.push(...tbl(['Limitation', 'Smallest suitable alternative'], [
    ['No PHP on the host', 'A single serverless function on the platform that serves the site (e.g., a Pages/Functions-style handler) that performs the same validation and sends through the same SMTP/transactional API'],
    ['No server-side rate limiting', 'Rate limit at the CDN/WAF (if available) plus the honeypot; accept a lower limit on abuse protection and record it as a known risk'],
    ['Cannot set custom response headers', 'Use `<meta http-equiv>` for CSP where valid and request a host that supports headers; record the gap in Chapter 30'],
    ['No SSH/CI deploy', 'Upload `dist/` through the host\'s SFTP/File Manager following the manual steps in Chapter 26'],
  ], [30, 70]));

  // ===== 17 =====
  o.push(h1('System Architecture'));
  o.push(...img('build/fig_arch.png', 600, 'Figure 2 — Build-time and run-time architecture', 'Diagram showing repository, build, quality gates and dist output on the build side; browser, static host, contact endpoint and SMTP on the run-time side.'));
  o.push(h2('Principles'));
  o.push(...B([
    '**Static first:** everything that can be HTML is HTML at build time. Content lives in typed data files (`src/data/*.ts`) and is rendered by `.astro` components; scripts only add behaviour.',
    '**Progressive enhancement:** with JavaScript disabled the page is fully readable and the contact actions work.',
    '**Same-origin only:** no third-party requests in production. The only dynamic call is `POST /api/contact` (same origin).',
    '**Separation of secrets:** SMTP credentials and recipient e-mail exist only in the server environment.',
  ]));
  o.push(h2('Environments'));
  o.push(...tbl(['Environment', 'Purpose', 'URL', 'Rules'], [
    ['Local', 'Development', '`http://localhost:4321` (Astro default)', 'Placeholders allowed (`PUBLIC_ALLOW_PLACEHOLDERS=true`)'],
    ['Preview / design preview', 'Client review of builds', TBD, 'Must be `noindex` and ideally password-protected'],
    ['Staging', 'Pre-production verification incl. form', TBD, '`noindex`; test SMTP mailbox'],
    ['Production', 'Public site', TBD, 'Placeholders blocked; indexable'],
  ], [20, 26, 28, 26]));
  o.push(h2('Astro configuration (reference)'));
  o.push(...code(`// astro.config.mjs
import { defineConfig } from 'astro/config';
// or Tailwind integration for installed version
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL,               // TBD — Awaiting confirmation (domain)
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },            // 'never' if the CSP forbids inline styles
  integrations: [sitemap()],                        // enable only once \`site\` is set
  vite: { plugins: [tailwindcss()] },
});`));
  o.push(h2('Data flow for content'));
  o.push(...tbl(['Data file', 'Holds', 'Consumed by'], [
    ['`src/data/site.ts`', 'Phone, WhatsApp number, regions, copyright, nav items (label, href)', 'Header, Footer, Contact, SEO'],
    ['`src/data/services.ts`', 'Six practice areas (index label, badge, heading, description, tags, footer label, CTA, image key)', 'Services'],
    ['`src/data/search-depth.ts`', 'Three horizons', 'SearchDepth'],
    ['`src/data/process.ts`', 'Five stages', 'Process'],
    ['`src/data/faq.ts`', 'Q&A entries (typed for 8; 6 supplied)', 'FAQ'],
    ['`src/data/reviews.ts`', 'Approved testimonials with `approved` and `authorisationRef`', 'Reviews'],
  ], [28, 48, 24]));

  // ===== 18 =====
  o.push(h1('Source-Code Structure'));
  o.push(P('The following structure is the recommended layout. It is a **suggestion, not a requirement to create unused files**: add a file only when it has content.'));
  o.push(...code(`rivora-website/
├── public/
│   ├── fonts/                 (only if not bundled via the font package)
│   ├── icons/                 favicon.svg, apple-touch-icon.png, og-image.png
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── assets/images/         hero + service masters (not served directly)
│   ├── components/
│   │   ├── Header.astro   Hero.astro      Marquee.astro   AtGlance.astro
│   │   ├── Services.astro SearchDepth.astro Process.astro Expertise.astro
│   │   ├── Reviews.astro  FAQ.astro       Contact.astro   Footer.astro
│   │   └── icons/         (inline SVG components, only glyphs in use)
│   ├── data/              site.ts services.ts search-depth.ts process.ts faq.ts reviews.ts
│   ├── layouts/MainLayout.astro        <head>, skip link, landmarks, scripts
│   ├── pages/index.astro
│   ├── scripts/           interactions.ts scroll-reveal.ts marquee.ts
│   └── styles/global.css
├── api/contact.php        (if PHP is available)
├── tests/                 e2e/*.spec.ts, content-manifest.json
├── .env.example           placeholders only
├── astro.config.mjs  package.json  tsconfig.json  playwright.config.ts  lighthouserc.json`));
  o.push(h2('Component responsibilities'));
  o.push(...tbl(['Component', 'Responsibility', 'Props / data'], [
    ['`MainLayout.astro`', '`<html lang>`, `<head>` (title, meta, canonical, OG, favicon, font preload), skip link, `<main>` landmark, single script entry, `html.js` flag', 'title, description, canonical'],
    ['`Header.astro`', 'Logo (once), seven nav links, CONTACT, menu button and panel', '`site.nav`'],
    ['`Hero.astro`', 'Background `<Picture>`, overlay, badge, H1, paragraph, two CTAs, meta strip', 'Hero strings, image'],
    ['`Marquee.astro`', 'Two identical groups with separators; pause button. Reusable for testimonials via a slot', 'Items, duration'],
    ['`AtGlance.astro`', 'Kicker row + four pillars', 'Pillars data'],
    ['`Services.astro`', 'Tablist, six panels, images', '`services.ts`'],
    ['`SearchDepth.astro`', 'Timeline with three horizons', '`search-depth.ts`'],
    ['`Process.astro`', 'Connected five-stage path', '`process.ts`'],
    ['`Expertise.astro`', 'Text column + checklist panel', 'Strings'],
    ['`Reviews.astro`', 'Header + testimonial marquee; guard for placeholders', '`reviews.ts`'],
    ['`FAQ.astro`', 'Split layout + accordion', '`faq.ts`'],
    ['`Contact.astro`', 'Contact card, actions, regions, confidentiality strip, form', '`site.ts`'],
    ['`Footer.astro`', 'Logo, links, phone, regions, copyright, descriptor', '`site.ts`'],
  ], [22, 56, 22]));
  o.push(h2('Conventions'));
  o.push(...B([
    'One component per section; each root element carries the section `id`. No inline event handlers (`onclick`) — attach listeners in `src/scripts`.',
    'Styling via Tailwind utilities using the tokens; shared patterns (`.kicker`, `.hairline`, `.hover-invert`, `.marquee*`) live in `global.css`.',
    'Scripts are initialised from one entry (`interactions.ts` imports the others); each exports an `init*` function that tolerates a missing target.',
    'TypeScript `strict`; run `astro check` in CI.',
    'Commit messages: imperative, scoped (e.g., `feat(services): add keyboard navigation`). `main` is protected; work on feature branches via pull requests.',
    '`.gitignore` includes `node_modules`, `dist`, `.env*`, `vendor` (if installed on server), test reports.',
  ]));
  o.push(h2('Scripts'));
  o.push(...tbl(['npm script', 'Action'], [
    ['`dev`', 'Astro dev server'],
    ['`check`', '`astro check` + type checks + lint'],
    ['`build`', '`astro build` → `dist/`'],
    ['`preview`', 'Serve `dist/` locally for tests and Lighthouse'],
    ['`test`', 'Playwright suite (all projects)'],
    ['`test:content`', 'Content manifest check only'],
    ['`lighthouse`', 'Lighthouse CI against `preview`'],
    ['`verify`', '`check` → `build` → `test` → `lighthouse` (the pre-release gate)'],
  ], [22, 78]));

  // ===== 19 =====
  o.push(h1('Responsive Design Strategy'));
  o.push(h2('Principles'));
  o.push(...B([
    'Mobile-first CSS; add complexity at wider widths. Breakpoints follow content (Chapter 11) rather than specific devices.',
    '**No horizontal page overflow at any width from 320 to 2560 px.** Never hide overflow on `html`/`body` to mask a defect; fix the offending element. Wide elements (marquees, the services strip) scroll or clip inside their own container.',
    'Use `min-width: 0` on flex/grid children that hold long text; allow long words to wrap (`overflow-wrap: anywhere` on headings and phone numbers).',
    'Use `min-height: 100svh`/`dvh` rather than `100vh` where full-height behaviour is needed (mobile browser chrome).',
    'Inputs use ≥ 16 px font size on iOS so Safari does not zoom on focus.',
    'Support safe-area insets (`env(safe-area-inset-*)`) for the sticky header and bottom content on notched phones.',
  ]));
  o.push(h2('Adaptation by component'));
  o.push(...tbl(['Aspect', 'Mobile < 768', 'Tablet 768–1199', 'Desktop ≥ 1200'], [
    ['Navigation', 'Menu button + CONTACT', 'Menu button + CONTACT (< 1200)', 'Inline nav + CONTACT'],
    ['Grid', '4-col, 1.25 rem margins, single-column stacks', '8-col, 2.5 rem margins', '12-col, 4 rem margins, max 1440'],
    ['Hero image', 'Art-directed portrait-friendly crop, focal point right (`object-position: 70% 50%`)', 'Landscape crop, centre', 'Wide crop, centre'],
    ['Hero type', 'H1 36/44; buttons stacked full width', 'H1 ~48', 'H1 56/64; buttons inline'],
    ['Typography', 'display-mobile, headline-lg-mobile', 'Fluid `clamp()` between', 'Desktop tokens'],
    ['At a glance', '1 column + hairlines', '2 × 2', '4 columns'],
    ['Services', 'Scrollable index strip above panel; panel stacks', 'Index in 2 columns above panel', 'Index left, panel right'],
    ['Search-depth timeline', 'Vertical timeline (line at left)', 'Vertical or compact horizontal', 'Horizontal timeline'],
    ['Process', 'Vertical stepper', '3 + 2 grid on a connecting line', 'Five-column path'],
    ['Expertise', 'Stacked; panel below', 'Stacked', '6/6 split'],
    ['Marquees', 'Smaller type (12 px), 64 px fades, same px/s speed', 'As desktop', '13 px, 112 px fades'],
    ['FAQ', 'Intro stacked above accordion, no sticky', 'Stacked', 'Split 5/7, intro sticky'],
    ['Contact', 'Card then form; actions wrap', 'Card then form', 'Card + form side by side'],
    ['Footer', 'Stacked; descriptor last', 'Two columns', 'Two columns; descriptor last'],
  ], [18, 30, 26, 26], { fs: 17 }));
  o.push(h2('Viewport test matrix'));
  o.push(P('Widths (CSS px): 320, 360, 375, 390, 412, 600, 768, 820, 1024, 1280, 1440, 1920 (and 2560 for overflow). Representative devices: iPhone SE-class and current iPhone, Pixel/Galaxy-class Android, iPad, 13–15" laptop, 24"+ desktop. Test portrait and landscape on phones/tablets, 200 % zoom and text-spacing overrides.'));

  // ===== 20 =====
  o.push(h1('Image and Asset Management'));
  o.push(callout('Images are not in the ZIP', 'All seven photographs in `code.html` are hotlinked from `lh3.googleusercontent.com` (a design-tool asset host). They are not bundled, have no stated licence or provenance, and may expire. In Phase 1 the agent must try to download them into `src/assets/images/`; if any download fails, stop and request the originals (B-05).', 'warn'));
  o.push(h2('Image inventory'));
  const hero = X.hero, sv = X.services.items;
  const names = ['hero-land-title', 'service-01-due-diligence', 'service-02-pre-litigation', 'service-03-documentation', 'service-04-corporate', 'service-05-contracts', 'service-06-litigation'];
  const rows = [['IMG-01', 'Hero background', hero.img_alt, names[0], hero.img_src]].concat(sv.map((s, i) => [`IMG-0${i + 2}`, `Service ${i + 1} panel`, s.img_alt, names[i + 1], s.img_src]));
  o.push(...tbl(['ID', 'Role', 'Source alt text', 'Target master name', 'Source URL (hotlink in code.html)'], rows, [8, 14, 22, 20, 36], { fs: 15 }));
  o.push(h2('Pipeline and rules'));
  o.push(...tbl(['Topic', 'Requirement'], [
    ['Masters', 'Keep highest-quality originals in `src/assets/images/` (not `public/`). Never commit images the client has not licensed.'],
    ['Formats', 'AVIF primary, WebP fallback, JPEG last resort, generated with Astro\'s `<Picture>`; quality ~55–65 AVIF / ~75 WebP, tuned by visual check.'],
    ['Responsive widths', 'Hero: 640, 960, 1280, 1600, 1920, 2400 with `sizes="100vw"`. Service panels: 480, 768, 1100 with `sizes="(min-width:1024px) 58vw, 100vw"`.'],
    ['Intrinsic size', 'Always output `width` and `height` (or CSS `aspect-ratio`) so no layout shift occurs.'],
    ['Loading', 'Hero: `loading="eager"`, `fetchpriority="high"`, `decoding="async"` (and a preload hint for the AVIF source). All others: `loading="lazy"`.'],
    ['Focal point', 'Hero `object-position`: right on mobile (`70% 50%`), centre ≥ 768 px (prototype: `object-right md:object-center`). Provide an art-directed portrait crop for mobile if the subject is lost. ' + PRO],
    ['Overlays', 'Gradients are CSS, never baked into the image, so contrast can be tuned.'],
    ['Alt text', 'Keep the source alt strings; improve only where inaccurate. Purely decorative duplicates use `alt=""`. Alt text must describe, not claim (no "verified", "certified").'],
    ['`image-rendering`', 'Remove the prototype\'s `-webkit-optimize-contrast` (unneeded, can distort).'],
    ['Licence / provenance', 'Record author, source and licence for every image in `ASSETS.md`. The source hosts suggest AI-generated assets — confirm the client\'s right to use them. ' + TBD],
    ['Social image', '1200 × 630 PNG/JPEG for Open Graph. ' + PRO],
  ], [20, 80]));
  o.push(h2('Other assets'));
  o.push(...tbl(['Asset', 'Handling'], [
    ['Logo SVGs', 'Inline or `<img>` with `width`/`height`; two variants (light/dark ground). ' + TBD],
    ['DM Sans', 'Self-hosted WOFF2 (Chapter 11). Licence: SIL OFL — keep the licence file.'],
    ['Icons', '20 inline SVGs (Chapter 11).'],
    ['`robots.txt`, `sitemap`, favicon set', 'Chapter 21.'],
  ], [26, 74]));
  return o;
};
