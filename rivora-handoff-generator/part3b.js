module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer } = L; const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';

  // ===== 12 =====
  o.push(h1('UI/UX Requirements'));
  o.push(h2('Prototype elements: keep, change, remove'));
  o.push(...tbl(['Prototype element', 'Decision', 'Reason'], [
    ['Full-bleed hero image with left-to-right overlay, badge, H1, two CTAs, meta strip', 'Keep', 'Matches brief; `screen.png`'],
    ['Marquee band with 7 phrases', 'Keep (add pause control)', 'Approved sequence; WCAG 2.2.2'],
    ['Four pillar cards', 'Change to open ledger', 'Avoid repetitive card template'],
    ['Services slider with counter, arrows and six tab buttons over full-bleed slides', 'Change to editorial index + detail panel', 'Brief: interactive selection, not repetitive cards (C-16)'],
    ['Three search-depth cards', 'Change to timeline', 'Brief: visual timeline'],
    ['Five process cards with hover scale', 'Change to connected path; hover-invert kept', 'Brief: connected process visual'],
    ['Expertise split with checklist card', 'Keep composition, adjust levels/labels', 'Already editorial'],
    ['Testimonial marquee with five named reviews', 'Keep mechanism; replace data', 'C-07'],
    ['Split-screen FAQ with accordion', 'Keep; fix semantics', 'Brief'],
    ['Contact card with phone, Call/Copy/WhatsApp', 'Keep; add form (PROPOSED)', 'Brief'],
    ['Header "Account" icon button', 'Remove', 'No accounts exist (D-17)'],
    ['Pulsing "Consultations Active" badge', 'Remove or approve', 'CR-06'],
    ['Hidden scrollbars (`::-webkit-scrollbar { display:none }`)', 'Remove', 'Usability; D-06'],
  ], [48, 24, 28]));
  o.push(h2('Global UI rules'));
  o.push(...B([
    '**Section header pattern:** kicker (cadastral-meta, Gold Ink) → H2 → intro paragraph, over a hairline. Reuse it so the page reads as one system.',
    '**Surfaces:** Canvas ↔ Stone alternation separates sections; white panels sit on Canvas/Stone; Ink bands bracket the page (hero, marquee, footer).',
    '**Imagery:** contextual and professional — land, survey records, legal volumes, deeds. Every image has an Ink gradient overlay wherever text sits on it, tested for ≥ 4.5:1 contrast.',
    '**Numbers and labels:** numbered labels ("01 / Origin", "STAGE 03", "15 / 30 / 60") are a signature of the design — keep them tabular and aligned.',
    '**Whitespace:** generous; sections 80–96 px vertical padding; avoid decorative filler.',
    '**Touch targets:** interactive controls ≥ 44 × 44 CSS px (WCAG 2.2 AA minimum is 24 px; 44 px is the target).',
    '**States:** every interactive element defines default, hover (pointer devices only), focus-visible, active and, where relevant, disabled/error.',
    '**No hover-only information:** anything revealed on hover must also appear on focus and be visible on touch.',
    '**Print (optional):** simple print stylesheet that hides the header, marquees and form and prints contact details. ' + PRO,
  ]));
  o.push(h2('UX writing rules for agent-authored strings'));
  o.push(P('Only functional strings may be written by the agent (menu, skip link, form labels/errors, copy confirmation). They must be short, neutral and factual. Do not write marketing text, taglines or legal statements.'));

  // ===== 13 =====
  o.push(h1('Interaction Specifications'));
  o.push(P('All interactions are implemented in vanilla TypeScript modules under `src/scripts/` (no framework) except the marquees, which are CSS-only. Every interaction must degrade gracefully when JavaScript is unavailable: content is visible, links work, and nothing is permanently hidden.'));
  o.push(...tbl(['ID', 'Interaction', 'Technique', 'Module'], [
    ['IX-01', 'Sticky header, active section, smooth anchors', 'CSS sticky; IntersectionObserver; CSS smooth scroll', '`interactions.ts`'],
    ['IX-02', 'Mobile navigation', 'Button + panel, `aria-expanded`, focus trap, Esc', '`interactions.ts`'],
    ['IX-03', 'Infinite horizontal marquee (text)', 'CSS keyframes, duplicated group', '`marquee.ts` (pause control only)'],
    ['IX-04', 'Testimonial marquee', 'CSS keyframes, exact-set duplication', '`marquee.ts`'],
    ['IX-05', 'Hover background transition', 'CSS transitions on `background-color`, `color`, `border-color`', 'CSS'],
    ['IX-06', 'Scroll-triggered reveal', 'IntersectionObserver + CSS classes', '`scroll-reveal.ts`'],
    ['IX-07', 'Service selector', 'ARIA tabs pattern', '`interactions.ts`'],
    ['IX-08', 'FAQ accordion', 'Button/region pattern, grid-rows transition', '`interactions.ts`'],
    ['IX-09', 'Copy telephone number', 'Clipboard API with fallback', '`interactions.ts`'],
    ['IX-10', 'Contact form submission', 'fetch + progressive enhancement', '`interactions.ts` (form part)'],
  ], [9, 38, 33, 20]));

  o.push(h2('IX-01 Header, active section and smooth anchors'));
  o.push(...B([
    'Header is `position: sticky; top: 0; z-index: 50`. (The prototype header was `absolute` and scrolled away — D-02.) Page content needs no top padding hack.',
    'Anchor click: native hash navigation with CSS smooth scrolling; `scroll-margin-top: 6rem` on sections guarantees headings are not hidden behind the header.',
    'Active link: observer with `rootMargin: "-40% 0px -55% 0px"` over the seven nav sections; set `aria-current="true"` and the active style on the matching link; clear others.',
    'Reduced motion: smooth scrolling disabled via the media query in the token stylesheet.',
  ]));
  o.push(h2('IX-02 Mobile navigation'));
  o.push(...B([
    'Below 1200 px a menu button (`aria-expanded`, `aria-controls`, accessible name "Open menu"/"Close menu") toggles a full-width panel under the header listing the seven links.',
    'On open: mark `<main>` and `<footer>` `inert`, move focus to the first link, trap Tab within the panel; Esc closes and returns focus to the button; clicking a link closes the panel then scrolls.',
    'Lock body scroll only while open (`overflow: hidden` on `html`), restore on close; auto-close when the viewport grows ≥ 1200 px.',
    'Without JavaScript the panel is not needed: the seven links are rendered in a visible, wrapping list inside the header (`<noscript>` styles) so navigation remains possible.',
  ]));
  o.push(h2('IX-03 / IX-04 Marquees'));
  o.push(...B([
    'Markup: `.marquee` (overflow hidden) > `.marquee__track` (flex, `width: max-content`) > two identical `.marquee__group` elements; the second has `aria-hidden="true"` and `inert`. Each group ends with the separator and carries equal right padding so that translating by exactly one group width is seamless.',
    'Animation moves the track by −50 % (one group) per cycle. The prototype animates `translateX(-50%) → 0`, which moves content to the right; keep that direction unless the client prefers the more common right-to-left. ' + PRO,
    'Speed: 35 s per cycle for the phrase marquee and 45 s for testimonials at desktop width; set `--marquee-duration` from the measured group width so px/s stays constant on mobile.',
    'The group must be at least as wide as the viewport; if the set is narrow, repeat items inside the group (by script or in the template) before duplicating the group.',
    '**Testimonials:** duplicate the **entire** approved set, not a subset (D-04).',
    'Pause: `:hover` and `:focus-within` set `animation-play-state: paused`; a visible toggle button (`aria-pressed`) pauses/resumes each marquee (WCAG 2.2.2: moving content longer than five seconds needs a mechanism).',
    'Reduced motion: `animation: none`; the track wraps and centres (phrases) or becomes horizontally scrollable with scroll-snap (testimonials); the `aria-hidden` group is hidden with `display: none`.',
    'Use `will-change: transform` only on the track and only while animating; animate `transform` only.',
  ]));
  o.push(...code(`.marquee { position: relative; overflow: hidden; }
.marquee__track {
  display: flex; width: max-content;
  animation: marquee var(--marquee-duration, 35s) linear infinite;
}
.marquee__group { display: flex; align-items: center; flex-shrink: 0; padding-right: var(--marquee-gap, 2rem); }
@keyframes marquee { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.marquee:hover .marquee__track,
.marquee:focus-within .marquee__track,
.marquee[data-paused="true"] .marquee__track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none; width: auto; flex-wrap: wrap; justify-content: center; }
  .marquee__group[aria-hidden="true"] { display: none; }
}`));
  o.push(h2('IX-05 Hover background transition'));
  o.push(P('The brief supplies a reference video for this behaviour; **the video is not in the ZIP** (C-18), so the behaviour below is derived from the brief and the prototype\'s process-stage tiles. If the video differs, the video wins for timing and easing.'));
  o.push(...B([
    'On pointer hover, the element\'s background transitions smoothly to its alternate state; on leave it returns to the original state. Example: process stage — White → Ink, heading Ink → Canvas, body → Ivory, border → Gold.',
    'Timing: 300–350 ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`; transition `background-color`, `color`, `border-color` only (not `all`).',
    'Wrap in `@media (hover: hover) and (pointer: fine)`; provide the same state on `:focus-visible` / `:focus-within`; on touch devices use `:active` for momentary feedback.',
    'Apply to: process stages, pillar columns (Stone tint), index rows (Stone), accordion items (chip/question colour), buttons and nav links. No scale transform above 1.01 (prototype used 1.03, which can crowd neighbours).',
    'Do not copy unrelated colours, text or layouts from the reference video.',
  ]));
  o.push(...code(`@media (hover: hover) and (pointer: fine) {
  .hover-invert { transition: background-color .35s cubic-bezier(.2,.7,.2,1),
                              color .35s cubic-bezier(.2,.7,.2,1),
                              border-color .35s cubic-bezier(.2,.7,.2,1); }
  .hover-invert:hover, .hover-invert:focus-within {
    background-color: var(--color-ink); color: var(--color-ivory); border-color: var(--color-gold);
  }
}`));
  o.push(h2('IX-06 Scroll-triggered reveal'));
  o.push(...B([
    'Elements marked `data-reveal` start hidden (`opacity: 0; transform: translateY(24px)`) **only after** the reveal module has initialised (`html.reveal-ready`). If the script fails or is disabled the elements stay visible — this fixes D-03.',
    'Observer options from the prototype: `rootMargin: "0px 0px -50px 0px"`, `threshold: 0.08`. Add class `is-revealed` once and `unobserve`.',
    'Transition: opacity and transform, 700 ms, `cubic-bezier(0.16, 1, 0.3, 1)`; stagger with `--reveal-delay` in 80 ms steps (`data-reveal-step="1..6"`).',
    'Elements already in the viewport at load are revealed immediately.',
    'Reduced motion: no transform or transition; elements are visible.',
    'Never reveal content that is needed for the LCP (hero H1 may fade but must not delay LCP; hero image is not animated).',
  ]));
  o.push(...code(`// src/scripts/scroll-reveal.ts
export function initReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;      // content stays visible
  items.forEach(el => {
    const step = Number(el.dataset.revealStep ?? 0);
    el.style.setProperty('--reveal-delay', step * 80 + 'ms');
  });
  document.documentElement.classList.add('reveal-ready');
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('is-revealed'); obs.unobserve(e.target); }
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
}`));
  o.push(h2('IX-07 Service selector'));
  o.push(...B([
    'Pattern: WAI-ARIA tabs. Index container `role="tablist"` (`aria-orientation="vertical"` on desktop); each row `role="tab"` with `aria-selected`, `aria-controls`, roving `tabindex` (0 on selected, −1 on others); each panel `role="tabpanel"` with `aria-labelledby` and `tabindex="0"`.',
    'Keyboard: ↑/↓ (and ←/→ when horizontal) move and select; Home/End jump; Enter/Space activate. Selecting changes the visible panel immediately (automatic activation is acceptable because all panel content is static).',
    'Pointer/touch: click or tap selects; hover only changes row style. On narrow screens the selected tab scrolls into view in the strip.',
    'Initial state: service 01 selected. Remember the selection in memory only (no storage). Optional deep link `#services` only.',
    'No JS: all six panels are rendered one after another (`hidden` is added by script after load), and each CTA works.',
    'Panel crossfade 300 ms (opacity only); height must not collapse during the swap (stack panels with CSS grid so the tallest sets the height).',
    'Images: `loading="lazy"` for all six; the hidden ones are not fetched until selected.',
  ]));
  o.push(h2('IX-08 FAQ accordion'));
  o.push(...B([
    'Each item: `<h3><button aria-expanded aria-controls id>` and a region `<div role="region" aria-labelledby>`. The numbered chip and indicator are decorative (`aria-hidden`).',
    'Behaviour from the source is preserved: opening an item closes the others; clicking an open item closes it.',
    'Animation: animate the answer wrapper with `display: grid; grid-template-rows: 0fr → 1fr` (inner element `overflow: hidden`) over 300 ms; remove animation under reduced motion.',
    'Indicator: CSS-drawn plus sign whose vertical bar rotates to form a minus (the prototype swapped text characters).',
    'Keyboard: Enter/Space toggle; optional ↑/↓/Home/End move between question buttons.',
    'No JS: all answers visible and the indicators hidden.',
  ]));
  o.push(h2('IX-09 Copy number'));
  o.push(...B([
    'Use `navigator.clipboard.writeText("8099888851")`; on failure fall back to selecting a visually-hidden input and `document.execCommand("copy")`; if both fail, select the visible number text so the user can copy manually.',
    'Confirm with an inline status (`role="status"`, `aria-live="polite"`) reading "Telephone number copied to clipboard" for 3 s. Never use `alert()` (prototype fallback — D-16).',
    'Button hidden when scripting is unavailable.',
  ]));
  o.push(h2('IX-10 Contact form'));
  o.push(P('See Chapter 25 for fields, validation and server behaviour. Client side: validate on submit and on blur, show inline errors linked with `aria-describedby`, move focus to the first invalid field, disable the submit button while sending, then show a success panel (`role="status"`) or an error panel with the telephone and WhatsApp fallback.'));
  o.push(h2('Interaction state matrix'));
  o.push(...tbl(['Interaction', 'JS off', 'Reduced motion', 'Touch', 'Keyboard'], [
    ['Header / menu', 'Visible link list', 'Instant scroll', '44 px targets', 'Tab order; Esc closes'],
    ['Marquee', 'Animates (CSS)', 'Static, wrapped', 'Pause button', 'Pause button; focus pauses'],
    ['Reveal', 'Visible', 'Visible', 'Same', 'n/a'],
    ['Services', 'All panels stacked', 'No crossfade', 'Tap to select', 'Arrow/Home/End'],
    ['FAQ', 'All open', 'No height animation', 'Tap', 'Enter/Space'],
    ['Copy number', 'Hidden', 'n/a', 'Tap', 'Enter/Space'],
    ['Form', 'Standard POST', 'n/a', 'Native inputs', 'Native'],
  ], [20, 20, 20, 20, 20]));

  // ===== 14 =====
  o.push(h1('Functional Requirements'));
  o.push(P('Priority: **M** = must, **S** = should. Each requirement is verified by the test IDs in Chapter 27.'));
  const fr = [
    ['FR-01', 'M', 'The site is one page with the 12 blocks of Chapter 9 in the specified order.', 'TC-01'],
    ['FR-02', 'M', 'Header navigation links scroll to `#pillars`, `#services`, `#search-depth`, `#process`, `#expertise`, `#reviews`, `#faq`; the CONTACT button scrolls to `#contact`.', 'TC-02'],
    ['FR-03', 'M', 'The header is sticky, shows the active section and never covers a section heading after anchor navigation.', 'TC-03'],
    ['FR-04', 'M', 'Below 1200 px a keyboard-accessible mobile menu provides the same seven links.', 'TC-04'],
    ['FR-05', 'M', 'The hero shows a full-width relevant background image, the H1, paragraph, two buttons and three meta items verbatim; "Request a consultation" → `#contact`, "Our practice areas" → `#services`.', 'TC-05'],
    ['FR-06', 'M', 'The marquee shows the seven phrases in the approved order, loops seamlessly and honours reduced motion and the pause control.', 'TC-14'],
    ['FR-07', 'M', 'The services index lists all six practice areas; selecting one shows its badge, heading, description, tags, footer label and link; mouse, touch and keyboard all work.', 'TC-08'],
    ['FR-08', 'M', 'Hover/focus transitions run on the specified interactive elements and restore on leave.', 'TC-09'],
    ['FR-09', 'M', 'Reveal animations trigger once per element on entering the viewport and never hide content permanently.', 'TC-10, TC-11'],
    ['FR-10', 'M', 'Search depth displays 15, 30 and 60 years as a timeline with all supplied descriptions and items.', 'TC-06'],
    ['FR-11', 'M', 'The process shows the five stages in order as a connected visual with deliverables.', 'TC-07'],
    ['FR-12', 'M', 'The expertise section displays its three points and checklist panel verbatim.', 'TC-06'],
    ['FR-13', 'M', 'The reviews section displays only approved testimonials, or is hidden; placeholders never reach production.', 'TC-15'],
    ['FR-14', 'M', 'The FAQ shows the intro and a single-open accordion with all supplied Q&As; stacks on mobile.', 'TC-12'],
    ['FR-15', 'M', 'The contact block shows 8099888851, a `tel:` Call action, a Copy action and a WhatsApp action to `wa.me/918099888851`.', 'TC-16'],
    ['FR-16', 'M', 'The contact form (once approved) validates, submits, and shows success and error states; the destination e-mail is never exposed in the page source.', 'TC-17 to TC-21'],
    ['FR-17', 'M', 'The footer contains the logo, links, contact details, the three regions, copyright and "Advocates & Associates" as the last line.', 'TC-22'],
    ['FR-18', 'M', 'The RIVORA name appears once in the header via the supplied logo.', 'TC-23'],
    ['FR-19', 'M', 'All content matches the inventory (Chapter 8) with quarantined items absent.', 'TC-24'],
    ['FR-20', 'M', 'SEO metadata, sitemap, robots.txt and favicon are present as per Chapter 21.', 'TC-25'],
    ['FR-21', 'S', 'A skip-to-content link is the first focusable element.', 'TC-26'],
    ['FR-22', 'S', 'A privacy notice is reachable from the form and footer if personal data is collected.', 'TC-27'],
  ];
  o.push(...tbl(['ID', 'Pri', 'Requirement', 'Verified by'], fr, [9, 6, 70, 15]));

  // ===== 15 =====
  o.push(h1('Non-Functional Requirements'));
  o.push(...tbl(['ID', 'Area', 'Requirement', 'Measure'], [
    ['NFR-01', 'Performance', 'LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (p75 field target)', 'PageSpeed Insights/CrUX after launch; Lighthouse lab proxy (TBT, LCP, CLS) in CI'],
    ['NFR-02', 'Performance', 'Lighthouse mobile Performance ≥ 90; Accessibility ≥ 95; Best Practices ≥ 95; SEO ≥ 95', 'Lighthouse CI on `astro preview`'],
    ['NFR-03', 'Performance', 'Initial JavaScript ≤ 20 KB gzip; CSS ≤ 35 KB gzip; hero image ≤ 150 KB desktop and ≤ 70 KB mobile (AVIF)', 'Build report; `size-limit`-style check ' + PRO],
    ['NFR-04', 'Compatibility', 'Current versions of Chrome, Edge, Firefox, Safari; representative Android and iOS browsers', 'Playwright projects + manual device pass'],
    ['NFR-05', 'Responsive', 'No horizontal page overflow from 320 px to 2560 px', 'TC-28 across 12 widths'],
    ['NFR-06', 'Accessibility', 'WCAG 2.2 AA for all content and interactions', 'axe + manual checks (Chapter 23)'],
    ['NFR-07', 'Security', 'HTTPS only; headers per Chapter 24; no secrets in repo or bundle; server-side validation', 'Header scan; repo secret scan'],
    ['NFR-08', 'Privacy', 'No third-party scripts, fonts or trackers by default; minimal personal data in the form', 'Network panel shows only same-origin requests'],
    ['NFR-09', 'Resilience', 'Page is fully readable and navigable with JavaScript disabled', 'TC-11'],
    ['NFR-10', 'Maintainability', 'Typed content data; components ≤ 250 lines; no dead code; documented scripts', 'Code review; `astro check`'],
    ['NFR-11', 'SEO', 'Valid semantic HTML; single H1; metadata complete', 'Validator + TC-25'],
    ['NFR-12', 'Reliability', 'Contact endpoint returns within 5 s and never loses a valid enquiry silently', 'TC-17 to TC-21; error logging'],
  ], [9, 14, 47, 30]));
  return o;
};
