module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer } = L; const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';

  // ===== 1 =====
  o.push(h1('Document Control and Version History'));
  o.push(...kv([
    ['Document title', 'RIVORA — Complete Website Development Specification & Cloud Coding Agent Handoff'],
    ['Document version', '1.0'],
    ['Preparation date', '10 November 2026'],
    ['Status', 'Draft for client approval. Safe for the coding agent to start Phases 1–2 immediately; later phases contain approval gates (see Chapter 28).'],
    ['Prepared by', 'Claude (Anthropic), from the supplied source package'],
    ['Prepared for', 'The RIVORA practice (client) and the cloud coding agent that will build the site'],
    ['Source package inspected', '`stitch_rivora_legal_website_design (1).zip` (uploaded as `stitch_rivora_legal_website_design__1_.zip`) containing `code.html` (84,025 bytes), `DESIGN.md` (10,140 bytes) and `screen.png` (274 × 1600 px, 215,272 bytes). No other file was in the ZIP.'],
    ['Companion deliverable', 'The same content is supplied as DOCX (editable) and PDF (reading/sharing).'],
  ]));
  o.push(h2('Version history'));
  o.push(...tbl(['Version', 'Date', 'Author', 'Change'], [
    ['1.0', '10 November 2026', 'Claude (Anthropic)', 'First complete handoff specification, built from direct inspection of `code.html`, `DESIGN.md` and `screen.png`.'],
  ], [10, 18, 22, 50]));
  o.push(h2('How to read this document'));
  o.push(P('Every statement in this document carries one of three statuses. The coding agent must treat them differently.'));
  o.push(...tbl(['Status marker', 'Meaning', 'What the coding agent does'], [
    ['CONFIRMED', 'Taken directly from a supplied source file, or stated in the client brief. The source file name is given.', 'Implement as written.'],
    [PRO, 'A recommendation by the document author that the client has not yet approved.', 'Implement only if the client approves, or implement behind a switch so it can be removed. Never publish it as if it were approved.'],
    [TBD, 'A fact that was not supplied (URL, e-mail, hosting detail, logo file, etc.).', 'Do not invent a value. Use the placeholder behaviour described next to it and raise it in the Phase 1 report.'],
  ], [18, 42, 40]));
  o.push(h2('Source precedence and conflict handling'));
  o.push(P('The supplied files disagree with each other and with the client brief in several places. These conflicts were **not** resolved silently: each is logged in the Conflict Register (Chapter 31) with a ruling. The general order of authority is:'));
  o.push(...N([
    '**Client brief decisions** (brand rules, approved design direction, section list, no-invention rules) — highest authority.',
    '**`code.html`** — authoritative for all wording (headings, paragraphs, labels, services, FAQ, contact). Content is preserved verbatim unless an item is explicitly flagged for removal or approval in Chapter 8.',
    '**`DESIGN.md`** — authoritative for colour tokens, type scale, spacing and component conventions, except where the client brief overrides it (corner radius).',
    '**`screen.png`** — visual reference for overall composition only. It is 274 px wide, so it cannot be used for pixel comparison; a full-resolution export is requested (Chapter 31).',
  ]));
  o.push(h2('Identifier conventions'));
  o.push(...tbl(['Prefix', 'Used for', 'Where'], [
    ['HDR, HERO, MQ, PIL, SVC, SD, PRC, EXP, REV, FAQ, CON, FTR', 'Individual content items extracted from `code.html`', 'Chapter 8'],
    ['FR-nn / NFR-nn', 'Functional / non-functional requirements', 'Chapters 14–15'],
    ['C-nn', 'Source or brief conflicts and the ruling applied', 'Chapter 31'],
    ['D-nn', 'Defects in the supplied prototype to be corrected in production', 'Chapter 31'],
    ['CR-nn', 'Content risks that need the advocate\'s review before publication', 'Chapter 8'],
    ['TC-nn', 'Test cases', 'Chapter 27'],
    ['AC-nn', 'Acceptance criteria', 'Chapter 29'],
  ], [34, 46, 20]));

  // ===== 2 =====
  o.push(h1('Executive Summary'));
  o.push(P('RIVORA is a legal practice offering land and property title verification and related legal services in Telangana, Andhra Pradesh and New Delhi. The project is a **single-page, premium, responsive, high-performance professional website** that explains the practice\'s services, search depth, process and expertise, answers common questions and lets prospective clients make contact by telephone, WhatsApp and (proposed) an enquiry form.'));
  o.push(P('A design prototype exists (`code.html`, a Tailwind-CDN HTML file produced by a design tool). It is a good content and layout source but is **not production-ready**. This document tells the coding agent exactly how to turn it into a static Astro + TypeScript + Tailwind website that is fast, accessible, secure and faithful to the approved brand and the client\'s content.'));
  o.push(h2('What the coding agent will deliver'));
  o.push(...B([
    'A static Astro site (`dist/`) containing one page with eleven blocks: header, hero, marquee, at-a-glance, services, search depth, process, expertise, reviews, FAQ, contact and footer.',
    'Interactions in vanilla TypeScript only: sticky header with active-section state, mobile menu, service selector, FAQ accordion, scroll reveal (Intersection Observer), copy-number action and form handling. Marquees use CSS keyframes.',
    'A contact endpoint (PHP, or the smallest hosting-compatible alternative) with server-side validation, spam protection and authenticated SMTP — once the destination address and hosting are confirmed.',
    'Playwright and Lighthouse evidence that the Core Web Vitals targets, accessibility, responsive and functional criteria in Chapter 29 are met.',
  ]));
  o.push(h2('Findings the client and agent must know first'));
  o.push(...callout('Ten findings from inspecting the supplied files', [
    '1. **The brief says eight FAQs; `code.html` contains six.** Two questions and answers are missing. They must be supplied by the client — they will not be invented (C-01).',
    '2. **`code.html` contains five named testimonials with firm names, a ₹18 Crore saving claim and a "VERIFIED" badge.** The brief forbids unverified testimonials. They are quarantined and replaced by labelled placeholders (C-07, CR-02).',
    '3. **No RIVORA logo file is in the ZIP.** The prototype uses an "R" square plus text. The real logo is a hard blocker for the header and footer (C-04).',
    '4. **No contact form exists in the prototype.** The form specified in Chapter 25 is new work and needs approval of its fields (C-05).',
    '5. **The prototype has no mobile navigation.** Below 1280 px the nav links are hidden and nothing replaces them (D-01).',
    '6. **The "no-JS" fallback does not work.** The class it depends on is never set, so reveal-animated content stays invisible without JavaScript (D-03).',
    '7. **The testimonial marquee does not loop seamlessly.** It repeats three of its five cards, then shifts by 50 % (D-04).',
    '8. **Gold text on light backgrounds fails WCAG AA.** `#A98A50` on `#FBFAF7` is 3.12:1; white on the gold button is 3.26:1 (Chapter 11). Gold Ink `#77592A` (6.20:1) must carry small gold text.',
    '9. **"Senior Advocate" is used four times.** It is a formal statutory designation in India; the advocate must confirm it is accurate before it is published (CR-01).',
    '10. **All seven images are hotlinked from a design-tool host** and are not in the ZIP. They may expire and their licence is unknown (Chapter 20).',
  ], 'warn'));
  o.push(h2('Blockers requiring client input'));
  o.push(...tbl(['#', 'Item', 'Why it blocks', 'Interim behaviour'], [
    ['B-01', 'Original RIVORA logo files (SVG preferred)', 'Header, footer, favicon and social image depend on it', 'Dev-only placeholder slot labelled "LOGO PLACEHOLDER"; build must fail in production mode while the placeholder exists'],
    ['B-02', 'Approved, authorised testimonials (or a decision to hide the section)', 'Brief forbids invented feedback', 'Reviews section renders labelled placeholders on staging only'],
    ['B-03', 'FAQ questions and answers 7 and 8', 'Brief expects eight; source has six', 'Ship six; leave a typed data slot for two more'],
    ['B-04', 'Domain, hosting provider, SMTP, destination e-mail', 'Form, canonical URL, sitemap, headers', 'Form disabled on production; telephone and WhatsApp remain'],
    ['B-05', 'Original image files and licence/provenance', 'Hotlinked URLs are unreliable', 'Attempt download in Phase 1; otherwise request originals'],
    ['B-06', 'Advocate sign-off on legal wording and professional-rule compliance', 'Publication risk', 'Content shipped verbatim but not published to production until signed off'],
  ], [8, 30, 32, 30]));

  // ===== 3 =====
  o.push(h1('Project Overview'));
  o.push(...kv([
    ['Project name', 'RIVORA Website'],
    ['Project type', 'Single-page professional legal services website (informational, not a web application)'],
    ['Business domain', 'Legal services; land and property title verification; property due diligence; related legal services'],
    ['Primary objective', 'Present RIVORA\'s identity, services, process, expertise and contact details accurately in a premium, modern, responsive, high-performance site'],
    ['Navigation model', 'Section-based. Navigation items scroll to section anchors on the same page; they do not open separate pages.'],
    ['Devices', 'Desktop, laptop, tablet, Android phones, iPhones, small-screen phones; Chrome, Edge, Firefox, Safari'],
    ['Existing design source', '`code.html`, `DESIGN.md`, `screen.png` (Stitch design export)'],
    ['Technology (summary)', 'Astro (static output), TypeScript, Tailwind CSS plus a small global stylesheet, vanilla TypeScript, Intersection Observer, CSS keyframes, AVIF/WebP, optional PHP contact endpoint, authenticated SMTP, Git/GitHub, Playwright, Lighthouse'],
  ]));
  o.push(h2('Expected visitor journey'));
  o.push(...N([
    '**Arrive.** The visitor lands on the hero and immediately sees what the practice does ("End-to-end land & property title verification.") over a land/property image. The header gives access to navigation and a CONTACT action at all times.',
    '**Orient.** The marquee and the four pillars ("At a glance") signal scope: land intelligence, title verification, due diligence, ownership history, legal opinions.',
    '**Understand services.** The visitor selects any of the six practice areas and reads its description, tags and call to action.',
    '**Understand depth and method.** The 15/30/60-year search horizons and the five-stage process explain how a verification is performed and what is delivered.',
    '**Build trust.** The expertise section and (approved) reviews demonstrate experience; the FAQ answers practical questions.',
    '**Act.** The visitor calls, copies the number, opens WhatsApp or (proposed) submits the enquiry form. Every call-to-action on the page leads to the contact section or to a direct contact channel.',
  ]));
  o.push(h2('State of the supplied prototype'));
  o.push(P('The prototype is a single HTML file with Tailwind via CDN, Google Fonts, Material Symbols icon font, inline JavaScript with `onclick` handlers and remote images. It demonstrates layout and interactions but must be rebuilt, not copied. Chapter 31 lists 24 defects found in it (D-01 to D-24) and how each is resolved.'));

  // ===== 4 =====
  o.push(h1('Business Context'));
  o.push(h2('What the source files establish'));
  o.push(...tbl(['Fact', 'Source', 'Status'], [
    ['Practice presents as an advocates\' firm; the descriptor "Advocates & Associates" is the professional descriptor', '`code.html` title, header, footer; brief', 'CONFIRMED'],
    ['Lead practitioner is referred to as "RK.V" ("Advocate RK.V & Associates", "Advocate RK.V & Team", "Senior Advocate RK.V")', '`code.html`', 'CONFIRMED (designation wording needs review — CR-01)'],
    ['Contact name for the site: "RK.V & Team"', 'Brief', 'CONFIRMED (conflicts with prototype — C-05)'],
    ['Telephone 8099888851; WhatsApp link `https://wa.me/918099888851`', '`code.html`; brief', 'CONFIRMED'],
    ['Regions: Telangana, Andhra Pradesh, New Delhi', '`code.html` contact and footer; brief', 'CONFIRMED'],
    ['Six practice areas, three search horizons (15/30/60 years), five-stage process, six FAQs', '`code.html`', 'CONFIRMED'],
    ['Copyright line "© 2026 RIVORA. All rights reserved."', '`code.html` footer', 'CONFIRMED'],
  ], [52, 30, 18]));
  o.push(h2('What is not known'));
  o.push(...tbl(['Item', 'Status'], [
    ['Postal address, office hours, e-mail address, bar-council enrolment details, firm registration, partner names beyond "RK.V"', TBD],
    ['Existing website URL, design preview URL, staging/production URLs, domain, hosting', TBD],
    ['Approved client testimonials and permission to publish them', TBD],
    ['Privacy notice / terms text (needed if a form collects personal data)', TBD],
  ], [75, 25]));
  o.push(P('None of the unknown items may be invented, inferred or "filled in" with plausible values. This includes structured data, footer text, meta tags and the form\'s e-mail recipient.'));
  o.push(h2('Domain terms used on the site (developer orientation only)'));
  o.push(callout('For orientation — not site copy and not legal advice', 'These plain-language notes help a developer understand labels and icons. They must not be copied onto the website. The advocate\'s own wording on the site is authoritative.', 'note'));
  o.push(...tbl(['Term in source', 'Developer-level meaning'], [
    ['Pahani / ROR (Record of Rights)', 'Village revenue records describing land holding, possession and cultivation'],
    ['Section 22-A', 'Provision relating to lists of properties whose registration is prohibited; the source refers to it as a "prohibited" register/ledger'],
    ['EC (Encumbrance Certificate)', 'Registry extract of recorded transactions/charges on a property over a period'],
    ['Sub-Registrar', 'Local registration office where deeds are registered and indexed'],
    ['Mutation', 'Revenue-record update when ownership changes'],
    ['Lis pendens', 'Pending litigation affecting a property'],
    ['Tippani / FMB', 'Survey and field-measurement records referenced in the source checklist'],
    ['Inam / Jagir / Wakf / Endowments', 'Historical grant and institutional land categories named in the source'],
    ['JDA / GPA / EPC', 'Joint Development Agreement / General Power of Attorney / Engineering-Procurement-Construction contracts named in the source'],
  ], [32, 68]));

  // ===== 5 =====
  o.push(h1('Project Objectives'));
  o.push(...tbl(['ID', 'Objective', 'How success is measured'], [
    ['O-01', 'Represent the practice accurately and credibly', 'Content verification checklist (Chapter 8.5) passes 100 %; no invented content; advocate sign-off recorded'],
    ['O-02', 'Explain services, search depth and process clearly', 'All six services, three search horizons and five stages are present, readable and reachable by keyboard and touch'],
    ['O-03', 'Convert visitors to enquiries', 'A contact action (CONTACT button, tel:, WhatsApp) is reachable within one interaction from any scroll position on desktop and mobile'],
    ['O-04', 'Deliver premium, distinctive visual quality', 'Visual review against `screen.png` and this specification passes (Chapter 27.3)'],
    ['O-05', 'Perform fast on mobile networks', 'LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 measured as in Chapter 22; Lighthouse mobile Performance ≥ 90 (lab proxy)'],
    ['O-06', 'Be accessible and robust', 'WCAG 2.2 AA checks in Chapter 23 pass; content visible with JavaScript disabled'],
    ['O-07', 'Be secure and privacy-respecting', 'Security header and form controls in Chapters 24–25 verified; no secrets in repository or bundle'],
    ['O-08', 'Be maintainable', 'Static Astro build; content in typed data files; no unnecessary dependencies; documented deployment and rollback'],
  ], [8, 38, 54]));
  o.push(h2('Overall success criteria'));
  o.push(P('The project is successful when every acceptance criterion in Chapter 29 is met, every blocker in Chapter 2 is either resolved or explicitly parked with client sign-off, and the handover checklist in Chapter 32 is complete.'));

  // ===== 6 =====
  o.push(h1('Scope and Out-of-Scope Requirements'));
  o.push(h2('In scope'));
  o.push(...B([
    'One responsive HTML page (`/`) built with Astro, containing every section listed in Chapter 9.',
    'Design system implementation (tokens, type, radius, components, icons) per Chapter 11.',
    'All interactions in Chapter 13.',
    'Image optimisation and responsive delivery, self-hosted font, SEO metadata, sitemap, robots.txt, favicon.',
    'Contact form UI and endpoint (after approval of fields and destination).',
    'Automated and manual testing, documentation, deployment to the confirmed host, rollback instructions.',
  ]));
  o.push(h2('Out of scope'));
  o.push(...B([
    'Databases, user accounts, authentication, admin panels or a CMS. (The prototype\'s "Account" icon implies none of these and is removed — D-17.)',
    'Blog, news, multi-page site, client portal, document upload, payments, online booking, live chat, chatbots.',
    'Multilingual versions (none was requested).',
    'Third-party analytics, tag managers, advertising pixels or social-media embeds, unless the client approves them in writing.',
    'Rewriting, shortening, expanding or "improving" the client\'s text. Proposed wording changes are listed separately for approval.',
    'Logo design. The supplied logo must be used; if it is missing, the project is blocked on B-01 rather than creating a new identity.',
  ]));
  o.push(callout('Scope decisions needing approval', [
    `1. A privacy notice or short privacy statement reachable from the form and footer, if the form collects personal data. ${PRO}`,
    `2. Whether the Reviews section is hidden at launch if no approved testimonials exist. ${PRO}`,
  ], 'prop'));

  // ===== 7 =====
  o.push(h1('Target Audience'));
  o.push(P('The audience is inferred from the practice\'s services and the language in `code.html`. No audience statistics are claimed.'));
  o.push(...tbl(['Visitor', 'What they need to understand', 'Sections that serve them', 'Expected action'], [
    ['People considering buying property (plots, apartment resales, agricultural land)', 'That title can be independently scrutinised before purchase; what documents are examined; how long the process takes; what they receive', 'Hero, At a glance, Search depth, Process, FAQ', 'Call / WhatsApp / enquiry'],
    ['Landowners', 'How title chains, Pahanis and registered deeds are reconciled; what defects look like; whether remediation advice is offered', 'Services (documentation, litigation support), Expertise, FAQ', 'Enquiry'],
    ['Property investors and developers', 'Depth of searches (30/60 years), prohibited-property screening, litigation searches, contract drafting (JDA, GPA, EPC)', 'Services, Search depth, Expertise', 'Consultation request'],
    ['Corporate entities and institutional buyers', 'Independent, advocate-led due diligence for large parcels and acquisitions; written opinions suitable for decision-making', 'Services (corporate), Expertise, Process', 'Consultation request'],
    ['Lenders and finance teams', 'That written opinions and risk matrices are produced; what is checked', 'Services (corporate/project finance), Process', 'Call / enquiry'],
    ['People needing legal documentation or advisory support', 'Which deeds and agreements are drafted; how registration is supported', 'Services (documentation, contract drafting)', 'Enquiry'],
  ], [22, 34, 24, 20]));
  o.push(P('Design implication: copy is specialist and dense. The layout must make that density scannable (numbered labels, hairline separators, short intro lines) without altering the text.'));
  return o;
};
