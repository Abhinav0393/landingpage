module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer } = L; const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';
  let md = 'Advocate-led land and property title verification: revenue records, Section 22-A checks, litigation searches, written legal opinions. Telangana, AP, New Delhi.';
  if (md.length > 160) throw new Error('meta too long ' + md.length);

  // ===== 21 =====
  o.push(h1('SEO Strategy'));
  o.push(P('Single-page sites rank on one URL, so metadata and semantics carry the weight. Nothing may be invented: no addresses, qualifications, ratings or reviews anywhere in metadata or structured data.'));
  o.push(...tbl(['Element', 'Requirement', 'Status'], [
    ['`<title>`', 'RIVORA Advocates & Associates | Land & Property Title Verification (source value)', 'CONFIRMED (`code.html`)'],
    ['Meta description', `"${md}" (${md.length} characters; built only from source facts)`, PRO],
    ['Canonical URL', '`<link rel="canonical" href="https://{domain}/">` — absolute URL from `PUBLIC_SITE_URL`', TBD],
    ['Language', '`<html lang="en">` (source). `en-IN` may be used for `og:locale` as `en_IN`.', 'CONFIRMED / ' + PRO],
    ['Open Graph', '`og:title`, `og:description`, `og:type=website`, `og:url`, `og:image` (1200×630), `og:locale`', PRO],
    ['Twitter/X card', '`summary_large_image` mirroring Open Graph', PRO],
    ['Headings and semantics', 'One H1; one H2 per section; landmarks (`header`, `main`, `footer`, `nav`); lists as lists; buttons as buttons', 'Chapter 9'],
    ['Image alt text', 'Per Chapter 20', 'Chapter 20'],
    ['Sitemap', '`sitemap-index.xml` (single URL) generated at build once `site` is set', PRO],
    ['`robots.txt`', 'Allow all on production; `Sitemap:` line with the absolute URL; staging serves `Disallow: /` plus `X-Robots-Tag: noindex`', PRO],
    ['Favicon set', 'SVG + ICO + apple-touch-icon from the logo', TBD],
    ['Theme colour', '`<meta name="theme-color" content="#151922">`', PRO],
  ], [20, 60, 20]));
  o.push(h2('Structured data'));
  o.push(P('Use structured data only where accurate. A minimal `LegalService` block with the name, telephone and served regions is accurate from the source. **Do not** add address, geo, opening hours, `aggregateRating`, `review`, founders, bar membership or `sameAs` links until the client supplies verified data. ' + PRO));
  o.push(...code(`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "RIVORA",
  "telephone": "+918099888851",
  "areaServed": ["Telangana", "Andhra Pradesh", "New Delhi"]
}
</script>`));
  o.push(P('Add `url` and `logo` only after the domain and logo are confirmed. Validate with a structured-data testing tool before release.'));
  o.push(h2('Compliance note'));
  o.push(P('The advocate must approve all published content (including metadata) for compliance with applicable Indian professional rules before the site is indexed. Keep production non-indexable (`noindex`) until sign-off (Chapter 32).'));

  // ===== 22 =====
  o.push(h1('Performance Strategy'));
  o.push(h2('Targets'));
  o.push(...tbl(['Metric', 'Target', 'How measured'], [
    ['Largest Contentful Paint (LCP)', '≤ 2.5 s (p75)', 'Field: PageSpeed Insights / CrUX after launch. Lab: Lighthouse mobile in CI'],
    ['Interaction to Next Paint (INP)', '≤ 200 ms (p75)', 'Field only; in the lab use Total Blocking Time (≤ 200 ms) and manual interaction profiling in DevTools'],
    ['Cumulative Layout Shift (CLS)', '≤ 0.1 (p75)', 'Lighthouse + Playwright layout-shift observer on scroll'],
    ['Lighthouse Performance (mobile)', '≥ 90', 'Median of 3 runs on the built preview'],
    ['Transfer budget (initial view, mobile)', '≤ 500 KB excluding lazy images ' + PRO, 'Network panel / Lighthouse'],
  ], [32, 22, 46]));
  o.push(P('These are production targets and **must be measured**, not assumed. Record results in the handover pack. Lab scores are a proxy: Core Web Vitals pass/fail is assessed on real-user data once enough traffic exists.'));
  o.push(h2('Strategies'));
  o.push(...tbl(['Area', 'Required practice'], [
    ['Initial HTML', 'Static HTML from Astro, compressed (Brotli/gzip), no render-blocking third-party resources, `<script type="module">` deferred by default.'],
    ['Images', 'AVIF/WebP, responsive `srcset`/`sizes`, lazy below the fold, hero preloaded with `fetchpriority="high"`, explicit dimensions.'],
    ['Fonts', 'Self-hosted variable WOFF2 subset; one preload; `font-display: swap`; metric-matched fallback; no icon font.'],
    ['CSS', 'Tailwind output purged at build; one stylesheet; no unused component CSS; critical styles inlined only if measurably better (`inlineStylesheets: "auto"`).'],
    ['JavaScript', 'One small module (~≤ 20 KB gzip); no framework; no polling or scroll listeners; Intersection Observer only; initialise after DOMContentLoaded; avoid long tasks (> 50 ms).'],
    ['Animation', 'Transform and opacity only; no layout-affecting animation; `will-change` limited; reveal never delays LCP content; marquees paused when off-screen (optional `IntersectionObserver` toggling `animation-play-state`).'],
    ['Layout stability', 'Intrinsic image sizes; reserved heights for the services panel (grid-stacked panels), marquee band and FAQ intro; fallback font metrics; no content injected above existing content.'],
    ['Caching', 'Hashed assets: `Cache-Control: public, max-age=31536000, immutable`. HTML: `no-cache` or short TTL with revalidation. Enable HTTP/2 or HTTP/3 and Brotli on the host.'],
    ['Third parties', 'None by default (NFR-08).'],
    ['Code splitting', 'Not needed for a single small module; add only if a script exceeds budget.'],
  ], [20, 80]));
  o.push(h2('Lighthouse CI configuration (reference)'));
  o.push(...code(`// lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4321/"],
      "numberOfRuns": 3,
      "settings": { "preset": "perf", "formFactor": "mobile" }
    },
    "assert": { "assertions": {
      "categories:performance":   ["error", { "minScore": 0.9 }],
      "categories:accessibility": ["error", { "minScore": 0.95 }],
      "categories:seo":           ["error", { "minScore": 0.95 }],
      "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
      "cumulative-layout-shift":  ["error", { "maxNumericValue": 0.1 }],
      "total-blocking-time":      ["warn",  { "maxNumericValue": 200 }]
    } }
  }
}`));
  o.push(P('Tune thresholds only with client agreement. Run once on a mid-range mobile profile with simulated Slow 4G and 4× CPU throttle (Lighthouse mobile defaults) and once unthrottled on desktop.'));

  // ===== 23 =====
  o.push(h1('Accessibility Requirements'));
  o.push(P('Target: **WCAG 2.2 Level AA**. Automated tools find only a portion of issues, so each area has a manual check.'));
  o.push(...tbl(['Area', 'Requirement', 'How to check'], [
    ['Keyboard', 'Every control reachable and operable by keyboard; logical tab order; no keyboard trap (menu traps focus only while open and releases on Esc).', 'Manual tab-through of the whole page; Playwright keyboard tests'],
    ['Focus indicators', 'Visible 2 px Gold Ink outline, 2 px offset, ≥ 3:1 against adjacent colours; on Ink grounds use Ivory/Gold outline. Focused elements must not be hidden by the sticky header (WCAG 2.4.11) — guaranteed by `scroll-padding-top`.', 'Manual; screenshot tests'],
    ['Landmarks and skip link', 'Skip link first; one `main`; `nav` labelled "Primary"; `footer`; marquee wrapper labelled.', 'axe; screen reader'],
    ['Screen-reader labels', 'Icon-only buttons have names (menu, pause, copy); decorative SVGs `aria-hidden`; link text is meaningful ("Request a consultation"); `tel:` and WhatsApp links announce their purpose.', 'NVDA/JAWS (Windows), VoiceOver (macOS/iOS), TalkBack (Android)'],
    ['Colour contrast', '≥ 4.5:1 normal text, ≥ 3:1 large text and UI components; apply Chapter 11 rules; text over images tested on actual pixels.', 'axe + manual sampling'],
    ['Form labels', 'Visible `<label>` per field, `for`/`id` linked; required indicated in text; errors identified and described in text, linked by `aria-describedby`; do not rely on colour alone.', 'Manual; axe'],
    ['Accordion semantics', 'Button inside heading with `aria-expanded`/`aria-controls`; region with `aria-labelledby`.', 'axe; screen reader'],
    ['Tabs (services)', 'ARIA tabs pattern with roving tabindex and arrow-key support.', 'Keyboard test'],
    ['Reduced motion', '`prefers-reduced-motion: reduce` disables reveal movement, marquee motion, smooth scrolling and accordion/crossfade transitions.', 'Playwright `reducedMotion: "reduce"`'],
    ['Moving content', 'Marquees can be paused (WCAG 2.2.2) and stop under reduced motion.', 'Manual'],
    ['Touch targets', 'Target ≥ 44 × 44 CSS px (≥ 24 px is the AA floor, WCAG 2.5.8).', 'Playwright bounding-box test'],
    ['Reflow and zoom', 'No loss of content or horizontal scroll at 320 CSS px width / 400 % zoom; text resizes to 200 %; survives user text-spacing overrides.', 'Manual'],
    ['Language and titles', '`lang="en"`; descriptive `<title>`; headings in logical order.', 'axe'],
    ['Pointer gestures', 'No path-based or multi-point gestures; the services strip scrolls natively.', 'Manual'],
    ['Timing / auto-updates', 'No auto-advancing slider (the prototype\'s slider is removed); copy confirmation persists ≥ 3 s and is announced.', 'Manual'],
  ], [16, 56, 28], { fs: 17 }));
  o.push(P('Accessibility score in Lighthouse is necessary but not sufficient; the manual checks above are part of acceptance (Chapter 29).'));

  // ===== 24 =====
  o.push(h1('Security Requirements'));
  o.push(...tbl(['Control', 'Requirement'], [
    ['HTTPS', 'Production and staging served over HTTPS only; HTTP redirects to HTTPS; valid certificate with automatic renewal; verify with an external TLS test.'],
    ['Security headers', 'Set on every response (see below).'],
    ['Form handling', 'All validation repeated server-side; escape or strip control characters; plain-text e-mail body; header-injection protection; origin check; size limits.'],
    ['Spam protection', 'Honeypot field + server-side rate limit + payload limits; optional privacy-friendly challenge only if abuse appears and the client approves the third party.'],
    ['Rate limiting', '≤ 5 submissions per IP per hour (configurable) where the host supports it; otherwise CDN/WAF rule.'],
    ['Secrets', 'SMTP credentials and recipient address in server environment or a file outside the web root with `0600` permissions; never in Git, the JS bundle or HTML. `.env.example` has placeholders only. Rotate credentials on handover.'],
    ['Dependencies', 'Commit the lockfile; run `npm audit` and Composer audit in CI; no unnecessary packages; review install scripts; enable automated dependency alerts on the repository.'],
    ['Third-party code', 'None in production. External links use `rel="noopener noreferrer"`.'],
    ['Confidential documents', '**Do not collect title deeds or confidential documents through the contact form.** Show a visible instruction on the form telling users not to send them and to wait for the practice\'s secure instructions.'],
    ['Logging', 'Log timestamp, status and error class only. Do not log message bodies or full personal data.'],
    ['Clickjacking / MIME', '`frame-ancestors \'none\'` and `X-Content-Type-Options: nosniff`.'],
    ['Backups and recovery', 'Keep the previous release for rollback; store infrastructure notes (without secrets) in the repository.'],
  ], [22, 78]));
  o.push(h2('Recommended response headers'));
  o.push(P('Start from the values below and tighten as the final asset list allows. Adjust the CSP if the host injects scripts. Because Astro may inline small scripts or styles, prefer external files (`build.inlineStylesheets: "never"`) so the CSP needs no `unsafe-inline`.'));
  o.push(...code(`Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';
  img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self';
  frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin`));
  o.push(P('Add `preload` to HSTS only after the client confirms every subdomain will always be HTTPS. For Apache set the headers in `.htaccess` (`Header always set …`); for Netlify/Cloudflare Pages use a `_headers` file; for Nginx use `add_header … always`. Which applies depends on the hosting provider. ' + TBD));
  o.push(h2('Privacy and legal'));
  o.push(...B([
    'Collect the minimum personal data (name, phone, optional e-mail, message). State the purpose and obtain explicit consent via a required checkbox.',
    'Whether a privacy notice and any obligations under India\'s Digital Personal Data Protection Act, 2023 and its rules apply must be confirmed by the advocate; the agent only implements the agreed text. ' + TBD,
    'No cookies are set by the site; therefore no cookie banner is needed unless analytics or third-party content is later approved.',
  ]));

  // ===== 25 =====
  o.push(h1('Contact Form Architecture'));
  o.push(callout('Status', `\`code.html\` contains **no form** — only a telephone number with Call, Copy and WhatsApp actions. The brief asks for "approved contact form functionality". The design below is therefore ${PRO}. The destination e-mail address, sender address, SMTP server and credentials are ${TBD}; do not invent any of them.`, 'warn'));
  o.push(...img('build/fig_form.png', 580, 'Figure 3 — Contact form request flow', 'Five-step flow: client check, POST JSON, server checks, send mail, respond; with 400/422, 429 and 500/502 error branches.'));
  o.push(h2('Fields'));
  o.push(...tbl(['Field', 'Type / name', 'Required', 'Validation'], [
    ['Full name', 'text · `name`', 'Yes', '2–100 characters; letters, spaces, `. ' + "'" + ' -` and common Unicode letters'],
    ['Telephone', 'tel · `phone`', 'Yes', 'Indian mobile: optional `+91`/`91`/`0` prefix then 10 digits starting 6–9 (`^(?:\\+?91|0)?[6-9]\\d{9}$` after stripping spaces/dashes)'],
    ['E-mail', 'email · `email`', 'No ' + PRO, 'Standard e-mail format, ≤ 254 characters'],
    ['Enquiry type', 'select · `topic`', 'Yes', 'One of the six practice-area names from the source, or "Other" (server whitelist)'],
    ['Property location', 'text · `location`', 'No', '≤ 120 characters (district / state)'],
    ['Message', 'textarea · `message`', 'Yes', '20–2000 characters'],
    ['Consent', 'checkbox · `consent`', 'Yes', 'Must be true; label states the purpose (wording ' + TBD + ')'],
    ['Honeypot', 'hidden text · `website`', '—', 'Must be empty; visually hidden, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`'],
  ], [16, 22, 12, 50]));
  o.push(P('A visible notice above the submit button reads (agent to use, client to approve): "Please do not send title deeds or confidential documents through this form." Mobile keyboards: `inputmode="tel"` for phone, `type="email"` for e-mail.'));
  o.push(h2('Submission behaviour'));
  o.push(...tbl(['Condition', 'Client behaviour', 'Server response'], [
    ['Success', 'Replace form with a confirmation panel (`role="status"`); reset fields; keep the telephone/WhatsApp actions visible', '`200 {"ok":true}`'],
    ['Validation error', 'Inline errors under fields; focus first invalid field; summary at top (`role="alert"`)', '`422 {"ok":false,"errors":{"field":"code"}}`'],
    ['Bad request / blocked origin', 'Generic error panel', '`400` / `403`'],
    ['Too many requests', '"Too many attempts. Please try again later or call 8099888851."', '`429`'],
    ['Mail failure', '"Your message could not be sent. Please call or use WhatsApp."', '`500` / `502`'],
    ['Network error', 'Same as mail failure; preserve entered values', '—'],
    ['JavaScript disabled', 'Native POST to the endpoint; server redirects `303` to `/?sent=1#contact` (success) or `/?error=1#contact`', '`303`'],
  ], [22, 52, 26]));
  o.push(h2('Server configuration'));
  o.push(...tbl(['Variable', 'Meaning', 'Status'], [
    ['`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`', 'Outgoing mail server, port and `tls`/`ssl`', TBD],
    ['`SMTP_USER`, `SMTP_PASS`', 'SMTP credentials (secret)', TBD],
    ['`MAIL_FROM`', 'Sender on an authenticated domain (SPF, DKIM and DMARC aligned)', TBD],
    ['`MAIL_TO`', 'Destination mailbox for enquiries — never published in the page', TBD],
    ['`ALLOWED_ORIGINS`', 'Comma-separated allowed origins (production + staging domains)', TBD],
    ['`RL_SALT`', 'Random salt for hashing IPs in the rate-limit store', 'Generate at deploy'],
    ['`TRUSTED_IP_HEADER`', 'Header carrying the visitor IP when behind a CDN (e.g., the CDN\'s connecting-IP header)', TBD],
  ], [34, 50, 16]));
  o.push(h2('Reference implementation (PHP)'));
  o.push(P('A minimal, safe endpoint. Review, test and adapt; do not ship unreviewed. Stores nothing and uses no database.'));
  o.push(...code(`<?php
declare(strict_types=1);
use PHPMailer\\PHPMailer\\PHPMailer;
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out(int $code, array $body): never { http_response_code($code); echo json_encode($body); exit; }
function clean(string $s, int $max): string {
  $s = preg_replace('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/u', '', $s) ?? '';
  return mb_substr(trim($s), 0, $max);
}

$cfg = parse_ini_file('/path/outside/webroot/rivora.env', false, INI_SCANNER_TYPED) ?: out(500, ['ok' => false]);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false]);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, array_map('trim', explode(',', $cfg['ALLOWED_ORIGINS'])), true)) out(403, ['ok' => false]);

$raw = file_get_contents('php://input') ?: '';
if (strlen($raw) > 20000) out(413, ['ok' => false]);
$in = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? (json_decode($raw, true) ?: []) : $_POST;

if (($in['website'] ?? '') !== '') out(200, ['ok' => true]);          // honeypot: pretend success

// Rate limit: 5 per hour per IP (file store; replace with CDN rule if available)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0'; $f = sys_get_temp_dir() . '/rvrl_' . hash('sha256', $ip . $cfg['RL_SALT']);
$now = time(); $hits = is_file($f) ? array_filter(array_map('intval', file($f, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > $now - 3600) : [];
if (count($hits) >= 5) out(429, ['ok' => false]);

$name = clean((string)($in['name'] ?? ''), 100);   $phone = preg_replace('/[\\s-]/', '', clean((string)($in['phone'] ?? ''), 20));
$email = clean((string)($in['email'] ?? ''), 254); $topic = clean((string)($in['topic'] ?? ''), 80);
$loc = clean((string)($in['location'] ?? ''), 120); $msg = clean((string)($in['message'] ?? ''), 2000);
$topics = ['Due Diligence','Pre-Litigation','Documentation','Institutional','Contract Drafting','Litigation Support','Other'];
$err = [];
if (mb_strlen($name) < 2) $err['name'] = 'required';
if (!preg_match('/^(?:\\+?91|0)?[6-9]\\d{9}$/', (string)$phone)) $err['phone'] = 'invalid';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $err['email'] = 'invalid';
if (!in_array($topic, $topics, true)) $err['topic'] = 'invalid';
if (mb_strlen($msg) < 20) $err['message'] = 'too_short';
if (empty($in['consent'])) $err['consent'] = 'required';
if ($err) out(422, ['ok' => false, 'errors' => $err]);

try {
  $m = new PHPMailer(true); $m->isSMTP(); $m->Host = $cfg['SMTP_HOST']; $m->SMTPAuth = true;
  $m->Username = $cfg['SMTP_USER']; $m->Password = $cfg['SMTP_PASS']; $m->SMTPSecure = $cfg['SMTP_SECURE']; $m->Port = (int)$cfg['SMTP_PORT'];
  $m->CharSet = 'UTF-8'; $m->isHTML(false);
  $m->setFrom($cfg['MAIL_FROM'], 'Website enquiry'); $m->addAddress($cfg['MAIL_TO']);
  if ($email !== '') $m->addReplyTo($email, str_replace(["\\r", "\\n"], ' ', $name));
  $m->Subject = 'Website enquiry: ' . $topic;
  $m->Body = "Name: $name\\nPhone: $phone\\nEmail: $email\\nTopic: $topic\\nLocation: $loc\\n\\n$msg\\n";
  $m->send();
} catch (Throwable $e) { error_log('contact_mail_failed ' . get_class($e)); out(502, ['ok' => false]); }

$hits[] = $now; file_put_contents($f, implode("\\n", $hits), LOCK_EX);
out(200, ['ok' => true]);`));
  o.push(h2('Alternatives when PHP is unavailable'));
  o.push(P('Implement the same contract (fields, validation, status codes) as one serverless function on the platform that serves the site, calling the same SMTP server or a transactional e-mail API with the secret stored in the platform\'s encrypted environment settings. Avoid third-party form-handling services unless the client accepts that enquiries pass through that processor. Do not store submissions in a database unless a requirement is approved.'));
  o.push(h2('Pre-launch form checklist'));
  o.push(...CK([
    'Destination e-mail, sender and SMTP confirmed; SPF/DKIM/DMARC pass for the sender domain.',
    'A real test enquiry reaches the destination mailbox and is not marked as spam.',
    'Validation messages are accessible and in plain language.',
    'Rate limit and honeypot verified; no message bodies in logs.',
    'Form hidden (or telephone/WhatsApp-only fallback shown) on any environment where the endpoint is not configured.',
  ]));
  return o;
};
