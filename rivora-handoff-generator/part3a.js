module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer, d, C, W } = L; const o = [];
  const { Table, TableRow, TableCell, WidthType, ShadingType, Paragraph, TextRun, BorderStyle } = d;
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';
  const rng = (p) => `${p}-01 to ${p}-${String(L.cnt[p]).padStart(2, '0')}`;

  // ===== 9 =====
  o.push(h1('Website Information Architecture'));
  o.push(h2('Page model'));
  o.push(P('The site is one HTML document (`/`). All navigation is in-page: each link targets a section `id`. There are no secondary pages. Browser back/forward must not be hijacked; anchors update the URL hash only for the plain `#section` form.'));
  o.push(h2('Section map'));
  o.push(...img('build/fig_sections.png', 560, 'Figure 1 — Page structure, anchors and section backgrounds', 'Vertical wireframe listing the header, hero, marquee, nine content sections and footer with their anchor ids and background colours.'));
  o.push(...tbl(['#', 'Block', 'Anchor id', 'Header nav label (source)', 'Footer link label (source)', 'Background'], [
    ['—', 'Header', '`header` (landmark)', '—', '—', 'Canvas 95 % + blur'],
    ['01', 'Hero', '`hero` (logo link target)', '—', '—', 'Ink + image'],
    ['—', 'Marquee', 'none', '—', '—', 'Ink'],
    ['02', 'At a glance (source: Core Scrutiny Pillars)', '`pillars`', 'PILLARS', 'Pillars', 'Canvas'],
    ['03', 'Services and practice areas', '`services`', 'SERVICES', 'Practice Areas', 'Canvas'],
    ['04', 'Search depth', '`search-depth`', 'SEARCH DEPTH', 'Search Depth', 'Stone'],
    ['05', 'Professional process', '`process`', 'PROCESS', 'Verification Flow', 'Canvas'],
    ['06', 'Expertise (source: Corporate Acquisitions)', '`expertise`', 'ACQUISITIONS', 'Counsel Practice', 'Stone'],
    ['07', 'Client reviews', '`reviews`', 'REVIEWS', 'Testimonials', 'Canvas'],
    ['08', 'FAQ', '`faq`', 'FAQ', 'FAQ', 'Stone'],
    ['09', 'Contact', '`contact`', 'CONTACT (button)', 'Contact', 'Canvas'],
    ['—', 'Footer', 'none', '—', '—', 'Ink'],
  ], [5, 24, 18, 18, 18, 17], { fs: 17 }));
  o.push(callout('Label inconsistency (C-12)', `The same anchor carries different labels in the header and footer (e.g., \`#expertise\` is ACQUISITIONS in the header and "Counsel Practice" in the footer; the section heading itself says "Trusted for high-stakes corporate acquisitions"). Implement the source labels as they are. Harmonisation is a wording change and needs approval. ${PRO}`, 'prop'));

  o.push(h2('Section specifications'));
  o.push(P('Each block below states what the coding agent must build. "Original content" points to the inventory IDs in Chapter 8. "Completion criteria" are the conditions for ticking that block off.'));
  const spec = (title, r) => { o.push(h3(title)); o.push(...kv(r, { fs: 17 })); };
  const F = ['Section ID', 'Section name', 'Purpose', 'Original content', 'Required visual treatment', 'Required interaction', 'Responsive behaviour', 'Dependencies', 'Completion criteria'];
  const mk = (arr) => F.map((f, i) => [f, arr[i]]);

  spec('9.A Header and navigation', mk([
    '`header` — `<header>` landmark, first element in `<body>` after the skip link',
    'Header and navigation',
    'Present the single RIVORA logo, section navigation and a persistent CONTACT action.',
    rng('HDR') + '. Brand text and the "Account" icon are not reproduced (C-04, D-17).',
    'Height 80 px (`h-20`); background Canvas `#FAF9F5`/`#FBFAF7` at 95 % with backdrop blur; 1 px bottom hairline `#E4DED3` at 60 %; max content width 1440 px, side padding 1.5 / 2.5 / 4 rem. Logo left (clickable to `#hero`). Nav links 11.5 px uppercase, tracking 0.14 em, Muted → Ink on hover. CONTACT pill: Ink fill, Canvas text, 1 px gold-70 % border, hover Hover Ink `#262C3B`.',
    'Sticky on scroll; active-section highlight (`aria-current="true"`); smooth anchor scroll; mobile menu with focus management; skip-to-content link; all controls keyboard operable.',
    '≥ 1200 px: inline nav + CONTACT. < 1200 px: nav collapses into a menu button (44 × 44 px minimum) beside CONTACT; the panel lists the seven links. (Prototype hid nav below 1280 px with no replacement — D-01.)',
    'Logo files (B-01); inline SVG chevron/menu icons; `interactions.ts`.',
    'Nav works at every width in Chapter 29; header never covers a section heading after anchor navigation (`scroll-margin-top` ≥ 96 px); focus ring visible; logo appears exactly once in the header.']));
  spec('9.B Hero (`#hero`)', mk([
    '`hero`', 'Hero', 'State what RIVORA does and offer the two primary actions over relevant land/property imagery.', rng('HERO') + '.',
    'Full-width background image (no separate right-side image); gradient overlay left-to-right Ink 85 % → 40 % → transparent; min-height 660 px (740 px ≥ 1024 px); content block max-width 48 rem. Badge pill (Ink 90 %, gold border), H1 at `display` token, paragraph at `body-lg` in Ivory, primary button (Gold fill, **Ink text** for contrast — see Ch. 11), secondary button (Ink 80 %, Ivory 50 % border), three-column meta strip above a hairline.',
    'Staggered reveal on load (80 ms steps). Buttons scroll to `#contact` and `#services`.',
    'Mobile: image focal point right, art-directed crop; H1 36/44; buttons full width and stacked; meta items stacked. Tablet: H1 48. Desktop: H1 56/64.',
    'Hero image (IMG-01), responsive AVIF/WebP set, `fetchpriority="high"`.',
    'Hero image is the LCP element and loads ≤ 2.5 s on the Chapter 22 profile; text contrast ≥ 4.5:1 over the overlay at every breakpoint (sample test); no CLS.']));
  spec('9.C Infinite marquee', mk([
    'none (decorative region with `aria-label="Practice highlights"`)', 'Marquee', 'Reinforce scope with seven approved phrases.', rng('MQ') + '.',
    'Ink band, 16 px vertical padding, gold-20 % hairlines top and bottom, edge fades (64 px mobile / 112 px desktop) from Ink to transparent. Text 12–13 px, uppercase, tracking 0.2 em, Ivory; separators ✳ in Gold with 24–32 px margins.',
    'Continuous CSS loop, 35 s per cycle, seamless; pauses on hover/focus-within and via a visible pause button; stopped under `prefers-reduced-motion`.',
    'Same on all sizes; font size steps down; speed constant in px/s (duration scales with track width).',
    'CSS only; duplicate group marked `aria-hidden` and `inert`.',
    'No jump at the loop point (TC-14); reduced-motion shows static centred wrapped phrases; pause control operable by keyboard.']));
  spec('9.D At a glance (`#pillars`)', mk([
    '`pillars`', 'At a glance (source: Core Scrutiny Pillars)', 'Summarise the four scrutiny pillars before detailed services.', rng('PIL') + '.',
    `Open editorial ledger rather than four boxed cards ${PRO}: header row (kicker in Gold Ink, side note in Muted) over a hairline; four columns separated by vertical hairlines; large numeral/label "01 / Origin", H3 title, body. Large-radius container only on hover/focus state (radius-lg).`,
    'Staggered reveal; hover transition of the column background to Stone (see IX-05).',
    '≥ 1024: 4 columns. 768–1023: 2 × 2. < 768: single column with horizontal hairlines.',
    'Reveal script; tokens.',
    'All 14 items present verbatim; section has an `h2` (the kicker text, styled as kicker) so headings do not skip levels.']));
  spec('9.E Services and practice areas (`#services`)', mk([
    '`services`', 'Services and practice areas', 'Let visitors browse the six practice areas.', rng('SVC') + '.',
    'Editorial service **index** (not six cards): section header with kicker/H2/intro over a hairline; left a numbered list of six rows (index label "01 // TITLE" + name); right a detail panel (radius-2xl, 32 px) showing the selected service over its image with an Ink gradient overlay: badge, H3, description, three tags, footer label and text link. Selected row: 1 px border + 1 px inner Gold line, no shadow. Hover row: Stone background.',
    'Select by click/tap/Enter/Space; arrow keys move between rows; Home/End; selection persists; all six panels exist in static HTML.',
    '≥ 1024: index left (5/12) + panel right (7/12). 768–1023: index becomes a 2-column grid above the panel. < 768: horizontally scrollable index strip with scroll-snap above the panel; panel content stacks and the panel grows in height (no fixed height that can clip text).',
    'Six service images (IMG-02 to IMG-07); `interactions.ts`.',
    'Keyboard, touch and pointer all select; `aria-selected`/`aria-controls` correct; no text clipped at 320 px; with JS disabled all six panels are visible in sequence.']));
  spec('9.F Search depth (`#search-depth`)', mk([
    '`search-depth`', 'Search depth', 'Show how far back each search horizon goes (15, 30, 60 years).', rng('SD') + '.',
    `Visual timeline ${PRO}: a horizontal line with three nodes (15 → 30 → 60) scaled by years, large numerals, then description, item list and suitability beneath each node. The 30-year node is emphasised with a Gold double border and the "Statutory Standard Benchmark" ribbon (source). Section background Stone.`,
    'Sequential reveal left to right; line "draws" with a transform on first reveal (disabled under reduced motion).',
    '≥ 1024: horizontal timeline. < 1024: vertical timeline with the line on the left and nodes stacked.',
    'Reveal script.',
    'All three horizons, 14 list items and suitability lines present; no horizontal overflow at 320 px.']));
  spec('9.G Professional process (`#process`)', mk([
    '`process`', 'Professional process', 'Explain the five-stage verification pipeline and each deliverable.', rng('PRC') + '.',
    'Connected path rather than five boxed cards: numbered nodes on a continuous line, each with stage label, icon, H3, description and a "Deliverable" footer above a hairline. Stage 03 (Scrutiny) keeps its Gold emphasis from the source.',
    'Hover/focus-within: the stage block background transitions to Ink with Ivory text and Gold border (IX-05); no scaling above 1.01.',
    '≥ 1280: five columns. 768–1279: three + two. < 768: vertical stepper with the line at left.',
    'Icons as inline SVG; reveal script.',
    'Five stages in order; hover and focus states work; touch devices show the same content without hover dependence.']));
  spec('9.H Expertise (`#expertise`)', mk([
    '`expertise`', 'Expertise (source heading: corporate acquisitions)', 'Demonstrate experience with high-stakes acquisitions.', rng('EXP') + '.',
    'Asymmetric 6/6 split on Stone: left kicker, H2, paragraph and three points separated by hairlines (icon + H3 + text); right a white radius-xl panel containing the checklist rows (label left, status in Gold Ink right) and a Stone radius-lg assurance box.',
    'Staggered reveal; no other interaction.',
    '≥ 1024: two columns. < 1024: stacked, panel below text.',
    'Icons; reveal script.',
    'All content verbatim; heading levels H2 → H3 (prototype used H4); CR-03 decision applied.']));
  spec('9.I Client reviews (`#reviews`)', mk([
    '`reviews`', 'Client reviews', 'Show approved client feedback in a moving presentation.', rng('REV') + ' (quarantined).',
    'Header (kicker, H2, intro) above a full-width marquee of testimonial cards (width 420 px, max 85 vw, radius-lg, white, hairline). Edge fades from Canvas. No star rating unless approved. Placeholder cards are labelled "Placeholder — awaiting an approved client review".',
    'Continuous CSS loop (45 s), seamless (the exact set is duplicated — D-04), pause on hover/focus and via pause button, static/scrollable under reduced motion.',
    'Cards keep a fixed readable width; on mobile 85 vw.',
    'Authorised testimonials (B-02) in `src/data/reviews.ts`.',
    `Production build blocks placeholders; if no approved review exists the section and its nav link are hidden ${PRO}.`]));
  spec('9.J FAQ (`#faq`)', mk([
    '`faq`', 'Frequently asked questions', 'Answer practical questions.', rng('FAQ') + '.',
    'Split-screen on Stone. Left (5/12, sticky from 1024 px): FAQ badge, H2, intro, "Ask Us a Question" button and assurance line. Right (7/12): vertically stacked accordion, each item radius-lg, white, hairline, numbered chip, semibold question, circular +/− indicator.',
    'One item open at a time (source behaviour); smooth height transition; `aria-expanded`/`aria-controls`; with JS disabled all answers are visible.',
    '< 1024: intro stacks above the accordion; no sticky behaviour.',
    '`interactions.ts`; data in `src/data/faq.ts` (typed for eight entries).',
    'Six verbatim Q&As (eight once supplied); keyboard operable; no layout shift larger than CLS budget on toggle.']));
  spec('9.K Contact (`#contact`)', mk([
    '`contact`', 'Contact — "Request a consultation"', 'Give prospective clients every route to make contact.', rng('CON') + '.',
    'Centered intro (badge, H2, paragraph) then the main card (radius-2xl; double border Hairline + Gold inner line per `DESIGN.md`): principal-counsel heading, large telephone number, Call / Copy / WhatsApp buttons, regions row, assurance line. Below: Stone confidentiality strip. Enquiry form (PROPOSED) beside or below per Chapter 25.',
    '`tel:` link; copy-to-clipboard with in-page confirmation (no `alert()`); WhatsApp link opens in a new tab with `rel="noopener noreferrer"`; form submit with success/error states.',
    '≥ 1024: card and form side by side. < 1024: card then form. Phone number scales from 32 px to 48 px.',
    'Contact endpoint (B-04); WhatsApp number; icon SVGs.',
    '`tel:+918099888851`, `https://wa.me/918099888851` verified; copy works with and without the Clipboard API; form states work.']));
  spec('9.L Footer', mk([
    '`<footer>` landmark', 'Footer', 'Close the page with brand, navigation, contact and regions.', rng('FTR') + '.',
    'Ink background; logo (single instance); description in `#A0A5B2`-equivalent token; phone; eight footer links; regions (Telangana | Andhra Pradesh | New Delhi) shown as footer text, **not** as a separate "Serving Across Three Regions" section; copyright; final full-width row with "Advocates & Associates" in Gold, tracked, uppercase.',
    'Link hover colour change; smooth anchor scroll.',
    'Two columns ≥ 1024; stacked below. The descriptor is always the last element.',
    'Logo (B-01).',
    '"Advocates & Associates" is the last visible text in the DOM and on screen; brand name not repeated as text beside the logo.']));

  o.push(h2('Navigation and anchor rules'));
  o.push(...B([
    'Section `id`s are exactly those in the map above; they are referenced by nav, footer, CTAs and tests.',
    '`html { scroll-behavior: smooth; scroll-padding-top: 6rem; }` inside `@media (prefers-reduced-motion: no-preference)`; each section also gets `scroll-margin-top: 6rem`.',
    'Active-section tracking uses Intersection Observer with `rootMargin: "-40% 0px -55% 0px"`; only one link is current at a time.',
    'On load with a hash (`/#faq`) the page scrolls to the section after layout is stable (images have intrinsic sizes).',
  ]));
  o.push(h2('Heading hierarchy'));
  o.push(...tbl(['Level', 'Use'], [
    ['H1', 'Hero heading only ("End-to-end land & property title verification.")'],
    ['H2', 'One per section: the source H2 where it exists; for At a glance use the source kicker text; for Hero none; for the footer none (use `aria-label`).'],
    ['H3', 'Cards, practice-area headings, process stages, expertise points, FAQ question wrappers, form heading. (The prototype jumped H2 → H4/H5 in Expertise/Reviews — D-22.)'],
  ], [12, 88]));

  // ===== 10 =====
  o.push(h1('Brand Identity'));
  o.push(h2('Logo and name rules'));
  o.push(...tbl(['Rule', 'Requirement', 'Source'], [
    ['Logo source', 'Use the original RIVORA logo from the supplied assets. It is **not in the ZIP**; request it (B-01). Do not redraw, recolour or approximate it.', 'Brief'],
    ['Header', 'The RIVORA name appears **once** in the header, through the logo only. No adjacent text heading "RIVORA".', 'Brief'],
    ['Descriptor', '"Advocates & Associates" appears at the very bottom of the footer and not in the header or footer brand block.', 'Brief'],
    ['Footer', 'Include the RIVORA logo once; do not duplicate the name as text beside it.', 'Brief'],
    ['Competing identities', 'Do not invent a second brand mark, monogram, tagline or wordmark. The prototype\'s "R" square and stacked text are not carried over.', 'Brief; C-04'],
    ['Copyright line', '"© 2026 RIVORA. All rights reserved." is source content and stays as text.', '`code.html`'],
    ['Browser tab title', '"RIVORA Advocates & Associates | Land & Property Title Verification" (source). Retaining the descriptor in `<title>` is an SEO decision. ' + PRO, '`code.html`'],
  ], [18, 62, 20]));
  o.push(h2('Logo asset requirements'));
  o.push(...tbl(['Asset', 'Specification', 'Status'], [
    ['Primary logo, for light backgrounds (header)', 'SVG, outlined paths, transparent; accessible name "RIVORA"', TBD],
    ['Logo for dark background (footer on Ink)', 'SVG reversed or light variant of the same logo', TBD],
    ['Favicon / app icons', 'SVG favicon, 32 px `.ico`, 180 px apple-touch-icon derived from the logo mark', TBD],
    ['Open Graph image', '1200 × 630 px composition using logo and hero image', PRO],
    ['Clear space and minimum size', 'Clear space = height of the logo\'s main letterform on all sides; minimum width 96 px', PRO],
  ], [36, 48, 16]));
  o.push(callout('Interim behaviour while the logo is missing', 'Render a neutral SVG box labelled `LOGO PLACEHOLDER` only when `import.meta.env.PUBLIC_ALLOW_PLACEHOLDERS === "true"`. A production build with the placeholder present must fail. Do not substitute the prototype\'s monogram-plus-text.', 'warn'));
  o.push(h2('Brand voice (for any approved UI text)'));
  o.push(P('Formal, precise, restrained. No exclamation marks, emojis, superlatives or guarantees in any text the agent writes. Functional UI strings (e.g., form errors) are plain and neutral.'));

  // ===== 11 =====
  o.push(h1('Design System'));
  o.push(h2('Creative direction'));
  o.push(P('**Premium Legal Editorial + Land Intelligence + Property Documentation.** The site must communicate legal credibility, property investigation, document verification, precision, trust and clarity. `DESIGN.md` names the system "Cadastral Prestige": hairline rules like boundary deeds, balanced whitespace, strict typographic hierarchy, gold survey-mark accents.'));
  o.push(P('It must **not** look like a generic legal template, a dashboard or a repetitive grid of identical cards. Use editorial compositions, asymmetry, open content with fine separators, numbered information, contextual imagery and controlled section backgrounds; keep one coherent system.'));
  o.push(h2('Colour tokens'));
  const swatch = (rows) => { const cw = [900, 1900, 1100, 4300, 1546];
    const bd = { style: BorderStyle.SINGLE, size: 4, color: C.border }; const borders = { top: bd, bottom: bd, left: bd, right: bd };
    const cell = (t, i, fill, hdr) => new TableCell({ width: { size: cw[i], type: WidthType.DXA }, borders, margins: { top: 60, bottom: 50, left: 90, right: 90 }, shading: fill ? { type: ShadingType.CLEAR, fill } : undefined, children: [new Paragraph({ spacing: { after: 20 }, children: L.runs(t, { size: 18, color: hdr ? C.bg : undefined, bold: hdr }) })] });
    const head = new TableRow({ tableHeader: true, children: ['Swatch', 'Token (CSS)', 'Hex', 'Intended usage', 'Source'].map((t, i) => cell(t, i, C.ink, true)) });
    const body = rows.map(([n, hex, use, src]) => new TableRow({ cantSplit: true, children: [cell(' ', 0, hex.replace('#', '')), cell('`' + n + '`', 1), cell(hex, 2), cell(use, 3), cell(src, 4)] }));
    return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows: [head, ...body] }), spacer(120)]; };
  o.push(...swatch([
    ['--color-ink', '#151922', 'Headlines, primary buttons, hero/footer/marquee grounds, structural borders', 'Brief; `DESIGN.md`'],
    ['--color-gold', '#A98A50', 'Survey-mark accents, borders, dots, numerals ≥ 24 px, text on Ink only', 'Brief; `DESIGN.md`'],
    ['--color-ivory', '#EDE8DD', 'Text on Ink, table headers, badge fills', 'Brief; `DESIGN.md`'],
    ['--color-canvas', '#FBFAF7', 'Page background', 'Brief; `DESIGN.md`'],
    ['--color-surface', '#FFFFFF', 'Panels, inputs, accordion items', 'Brief; `DESIGN.md`'],
    ['--color-stone', '#F2EEE7', 'Alternate section grounds, hover tint, secondary panels', 'Brief; `DESIGN.md`'],
    ['--color-fg', '#1A1E27', 'Body text', 'Brief; `DESIGN.md`'],
    ['--color-muted', '#5C6370', 'Secondary text, metadata', 'Brief; `DESIGN.md`'],
    ['--color-line', '#E4DED3', '1 px hairlines and borders', 'Brief; `DESIGN.md`'],
    ['--color-gold-ink', '#77592A', 'Gold-coloured **text** on light grounds (kickers, links)', 'Brief; `DESIGN.md`'],
    ['--color-ivory-muted', '#A9A79F', 'De-emphasised text/grid lines on Ink', 'Brief; `DESIGN.md`'],
    ['--color-ink-hover', '#262C3B', 'Hover state of Ink surfaces', 'Brief; `DESIGN.md`'],
  ]));
  o.push(P('No other colour system may be introduced. `DESIGN.md` also lists a blue-tinted Material token set (e.g., `surface #f9f9ff`); it conflicts with the brief\'s Canvas `#FBFAF7` and is **not used** (C-13).'));
  o.push(h3('Colours found in the prototype that are outside the brief'));
  o.push(...tbl(['Prototype value', 'Where used', 'Ruling'], [
    ['`#F5F2EB`', 'Alternate section backgrounds', 'Map to Stone `#F2EEE7`'],
    ['`#FAF9F5`', 'Header, chips, FAQ answer tint', 'Map to Canvas `#FBFAF7`'],
    ['`#181c24`, `#45474b`', 'Headings / body secondary', 'Map to Foreground `#1A1E27` and Muted `#5C6370`'],
    ['`#76777c`', 'Small labels (4.47:1 on white — fails AA)', 'Map to Muted `#5C6370`'],
    ['`#8F733E`', 'Gold hover', `New token \`--color-gold-hover\`. ${PRO}`],
    ['`#A0A5B2`', 'Muted text on Ink (7.14:1)', `New token \`--color-ink-muted\`. ${PRO}`],
    ['`#f1f3ff`', 'Marquee text', 'Map to Ivory'],
    ['`emerald-600` (green)', '"Consultations Active" dot', 'Remove (CR-06)'],
  ], [24, 36, 40]));
  o.push(h2('Contrast rules (computed WCAG ratios)'));
  o.push(...tbl(['Foreground on background', 'Ratio', 'Verdict', 'Rule'], [
    ['Gold `#A98A50` on Canvas `#FBFAF7`', '3.12:1', 'Fails AA for normal text', 'Never use for text < 24 px (or < 18.66 px bold). Use Gold Ink.'],
    ['Gold `#A98A50` on Stone `#F5F2EB` (prototype)', '2.92:1', 'Fails', 'As above'],
    ['Gold Ink `#77592A` on Canvas', '6.20:1', 'Passes AA', 'Use for gold-coloured text on light'],
    ['Gold Ink `#77592A` on Stone `#F2EEE7`', '5.59:1', 'Passes AA', 'As above'],
    ['Muted `#5C6370` on Canvas', '5.79:1', 'Passes AA', 'Secondary text'],
    ['`#76777c` on White', '4.47:1', 'Fails AA (normal text)', 'Do not use'],
    ['White `#FFFFFF` on Gold `#A98A50` (prototype primary button)', '3.26:1', 'Fails AA', `Use Ink text on Gold: 5.39:1. ${PRO}`],
    ['Gold on Ink', '5.39:1', 'Passes AA', 'Allowed for text on Ink'],
    ['Ivory on Ink / Canvas on Ink', '14.39:1 / 16.85:1', 'Passes AAA', 'Body text on Ink'],
    ['`#A0A5B2` on Ink', '7.14:1', 'Passes AA', 'Muted on Ink'],
    ['Foreground `#1A1E27` on Canvas', '15.98:1', 'Passes AAA', 'Body text'],
  ], [38, 12, 20, 30]));
  o.push(P('Ratios were calculated with the WCAG relative-luminance formula. Re-verify automatically in CI (axe) and for text over the hero image (sample test, Chapter 27).'));

  o.push(h2('Typography'));
  o.push(...tbl(['Item', 'Requirement'], [
    ['Family', '`DM Sans` only, across the entire site (client decision; `DESIGN.md`).'],
    ['Weights', '400 body, 500 labels, 600 headlines/labels, 700 display/meta. Use the variable font axis; do not load unused weights/italics.'],
    ['Loading', 'Self-host the Latin subset as WOFF2 (e.g., via the `@fontsource-variable/dm-sans` package at build time, OFL licence — pin the version when installing). Preload the one WOFF2 used above the fold. `font-display: swap` with a metric-matched fallback (`size-adjust`, `ascent-override`) to protect CLS. No requests to `fonts.googleapis.com` / `fonts.gstatic.com` in production (prototype used both — D-11).'],
    ['Letter-spacing', 'Tight negative tracking on display/headlines (−0.03 em to −0.01 em); positive tracking on labels and `cadastral-meta` (+0.04 to +0.08 em); the latter strictly uppercase.'],
    ['Body line-height', '1.55–1.6 (`DESIGN.md`).'],
    ['Minimum sizes', `Paragraph copy ≥ 14 px (prototype used 12 px \`text-xs\` extensively — D-14). Uppercase labels ≥ 11 px. ${PRO}`],
  ], [18, 82]));
  o.push(...tbl(['Token (DESIGN.md)', 'Size / line-height', 'Weight', 'Tracking', 'Use'], [
    ['display', '56 / 64', '700', '−0.03 em', 'Hero H1 (desktop)'],
    ['display-mobile', '36 / 44', '700', '−0.02 em', 'Hero H1 (< 768)'],
    ['headline-lg', '40 / 48', '600', '−0.02 em', 'Section H2 (desktop)'],
    ['headline-lg-mobile', '28 / 36', '600', '−0.01 em', 'Section H2 (< 768)'],
    ['headline-md', '28 / 36', '600', '−0.015 em', 'Service H3, contact card heading'],
    ['headline-sm', '20 / 28', '600', '−0.01 em', 'Card/stage titles, FAQ question'],
    ['body-lg', '18 / 28', '400', '−0.005 em', 'Hero paragraph, section intros'],
    ['body-md', '15 / 24', '400', '0', 'Card and answer text (lifts prototype 12 px copy)'],
    ['body-sm', '13 / 20', '400', '0.005 em', 'Captions, helper text (not paragraphs)'],
    ['label-lg', '14 / 20', '600', '0.02 em', 'Buttons'],
    ['label-md', '12 / 16', '500', '0.04 em', 'Nav, chips'],
    ['cadastral-meta', '11 / 14', '700', '0.08 em, uppercase', 'Kickers, stage labels, coordinates'],
  ], [24, 18, 10, 18, 30]));
  o.push(P('Between 768 and 1199 px interpolate with `clamp()` (e.g., `font-size: clamp(2.25rem, 1.4rem + 2.6vw, 3.5rem)` for display) so no abrupt jump occurs at breakpoints.'));
  o.push(h2('Layout, spacing and breakpoints'));
  o.push(...tbl(['Item', 'Requirement'], [
    ['Grid', '12-column architectural grid; container max-width 1440 px; outer margins 1.25 rem (mobile), 2.5 rem (tablet), 4 rem (desktop); gutters 1.5 rem (≤ 1199) / 2 rem (≥ 1200).'],
    ['Rhythm', 'Spacing scale 4, 8, 16, 24, 40 px (`space-xs` … `space-xl`). Section vertical padding 80 px (mobile/tablet) and 96 px (≥ 1024).'],
    ['Breakpoints', '`DESIGN.md`: mobile < 768; tablet 768–1199; desktop ≥ 1200. Tailwind steps used for composition: 640, 768, 1024, 1280. Header collapse breakpoint 1200 px. Breakpoints are driven by content: add one wherever content breaks, not at device widths.'],
    ['Dividers', 'Sections are separated by hairlines and background changes rather than excess whitespace.'],
  ], [18, 82]));
  o.push(h2('Shape system (large-radius rounded rectangles)'));
  o.push(callout('Conflict C-03', '`DESIGN.md` mandates 0 px radius ("no softened corners anywhere"). The client brief and the prototype require large-radius rounded rectangles. **The brief prevails**; the sharp-corner rule in `DESIGN.md` is superseded. Hairline borders, tonal layering and the gold double-border selection convention from `DESIGN.md` still apply.', 'warn'));
  o.push(...tbl(['Token', 'Value', 'Applies to', 'Prototype class'], [
    ['`--radius-sm`', '8 px', 'Small chips, number badges, focus outlines', '`rounded-lg`'],
    ['`--radius-md`', '12 px', 'Buttons in the contact card, index rows, inputs', '`rounded-xl`'],
    ['`--radius-lg`', '16 px', 'Accordion items, testimonial cards, checklist assurance box, hover states', '`rounded-2xl`'],
    ['`--radius-xl`', '24 px', 'Expertise panel, 30-year emphasis container, contact card', '`rounded-3xl`'],
    ['`--radius-2xl`', '32 px', 'Service detail panel, hero media frames, form container', `new ${PRO}`],
    ['`--radius-pill`', '9999 px', 'Badges, pills, nav CONTACT button, circular icon buttons', '`rounded-full`'],
  ], [18, 12, 46, 24]));
  o.push(P('Rules: nested radii step down by the padding (inner radius = outer radius − padding, minimum 8 px); full-width bands (marquee, section backgrounds) stay square; apply radii consistently by component type, not per instance.'));
  o.push(h2('Elevation and depth'));
  o.push(P('`DESIGN.md` forbids floating drop shadows and relies on 1 px `#E4DED3` hairlines and tonal layers (Canvas → White → Stone). The prototype nevertheless uses `shadow-sm` to `shadow-xl`. '
    + `Rule: no shadows beyond a barely visible \`0 1px 2px rgb(21 25 34 / 0.04)\` on white panels; depth comes from hairlines and tone. ${PRO}`));
  o.push(h2('Component specifications'));
  o.push(...tbl(['Component', 'Default', 'Hover', 'Focus-visible', 'Active / selected'], [
    ['Primary button (Ink)', 'Ink fill, Canvas text, 1 px gold-70 % border, pill or radius-md, label-lg uppercase, 0.75×1.75 rem', 'Hover Ink fill, gold border 100 %', '2 px Gold Ink outline, 2 px offset', 'Inner 1 px gold line on press'],
    ['Primary button (Gold, hero)', `Gold fill, **Ink text**, pill ${PRO}`, 'Gold-hover fill', 'As above', 'As above'],
    ['Secondary button', 'Transparent/Ink 80 %, 1 px border, Ivory or Ink text', 'Ivory/Stone fill', 'As above', '—'],
    ['Text link (survey action)', 'Gold Ink text, 4 px underline offset, "+" or arrow', 'Underline thickens', 'Outline', '—'],
    ['Badge / pill', 'White or Ink 90 %, 1 px border, 4–8 px dot, cadastral-meta uppercase', '—', '—', '—'],
    ['Index row / ledger row', 'Hairline separators, no vertical shift', 'Stone tint + 2 px gold left bar', 'Outline', '1 px border + 1 px inner gold line'],
    ['Accordion item', 'White, hairline, radius-lg', 'Number chip and question turn Gold Ink', 'Outline on button', 'Indicator becomes "−", answer revealed'],
    ['Input / textarea / select', 'White, 1 px `#E4DED3`, radius-md, body-md', 'Border darkens', '1 px Ink border + floating label in Gold Ink', 'Error: 1 px error border + message (error colour must pass 4.5:1)'],
    ['Checkbox', '16 × 16 box, 1 px Ink border, radius-sm', '—', 'Outline', 'Ink fill or 6 px gold inner square'],
  ], [20, 30, 16, 16, 18], { fs: 17 }));
  o.push(h2('Icons'));
  o.push(P('The prototype uses the Material Symbols web font (a 100+ KB variable font loaded from Google, which renders ligature words as plain text if it fails — D-09). Replace it with **inline SVGs** of only the 20 glyphs used. Recommended source: a permissively licensed set such as Lucide (ISC licence); copy only the needed paths into `src/components/icons/` and keep the licence notice. ' + PRO));
  o.push(...tbl(['Prototype ligature', 'Used for', 'Inline SVG needed'], [
    ['person', 'Account button', 'No — removed (D-17)'],
    ['arrow_forward', 'Hero button, service links', 'Arrow right'], ['west / east', 'Slider arrows', 'No — slider removed (C-16)'],
    ['check / check_circle', 'Search-depth bullets', 'Check; check in circle'], ['assignment', 'Process stage 1', 'Clipboard'],
    ['folder_open', 'Process stage 2', 'Folder open'], ['manage_search', 'Process stage 3', 'Search/list'], ['gavel', 'Process stage 4', 'Gavel'],
    ['verified', 'Process stage 5', 'Badge check'], ['account_tree', 'Expertise point 1', 'Tree/hierarchy'], ['rule', 'Expertise point 2', 'Ruler/rule'],
    ['security', 'Expertise point 3', 'Shield'], ['star', 'Review rating', 'No — ratings removed unless approved'], ['verified_user', 'FAQ / contact assurance', 'Shield check'],
    ['call', 'Call button', 'Phone'], ['content_copy', 'Copy button', 'Copy'], ['chat', 'WhatsApp button', 'Message (do not use WhatsApp trademark artwork unless approved)'], ['encrypted', 'Confidentiality strip', 'Lock'],
  ], [26, 34, 40]));
  o.push(h2('Design tokens — starter stylesheet'));
  o.push(P('Written for Tailwind CSS v4 (`@theme` in CSS). Confirm the installed version; for v3 move the same values into `tailwind.config`. Pin exact package versions at install time.'));
  o.push(...code(`/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-ink: #151922;        --color-ink-hover: #262C3B;
  --color-gold: #A98A50;       --color-gold-ink: #77592A;
  --color-gold-hover: #8F733E; /* PROPOSED */
  --color-ivory: #EDE8DD;      --color-ivory-muted: #A9A79F;
  --color-canvas: #FBFAF7;     --color-surface: #FFFFFF;
  --color-stone: #F2EEE7;      --color-fg: #1A1E27;
  --color-muted: #5C6370;      --color-line: #E4DED3;

  --font-sans: "DM Sans Variable", "DM Sans Fallback", ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 0.5rem;  --radius-md: 0.75rem; --radius-lg: 1rem;
  --radius-xl: 1.5rem;  --radius-2xl: 2rem;   --radius-pill: 9999px;

  --breakpoint-nav: 75rem; /* header collapses below 1200px */
}

html { background: var(--color-canvas); color: var(--color-fg); font-family: var(--font-sans); }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
html { scroll-padding-top: 6rem; }
:focus-visible { outline: 2px solid var(--color-gold-ink); outline-offset: 2px; }`));
  return o;
};
