module.exports = (L, X) => {
  const { h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer } = L; const o = [];
  const TBD = 'TBD — Awaiting confirmation', PRO = 'PROPOSED — Requires approval';
  const auto = (txt, base = 'Keep verbatim') => { const f = [];
    if (/senior advocate/i.test(txt)) f.push('CR-01'); if (/certif/i.test(txt)) f.push('CR-07'); if (/southern india|south india/i.test(txt)) f.push('CR-09');
    return base + (f.length ? ' · Flag ' + f.join(', ') : ''); };
  const rows = (prefix, list) => list.map(([el, txt, disp], i) => [`${prefix}-${String(i + 1).padStart(2, '0')}`, el, txt, disp || auto(txt)]);
  const sec = (title, prefix, list, note) => { const r = rows(prefix, list); o.push(h3(title)); if (note) o.push(P(note, { size: 19 }));
    o.push(...tbl(['ID', 'Element', 'Verbatim text from code.html', 'Disposition'], r, [9, 14, 53, 24], { fs: 17 })); return r.length; };
  const cnt = {};

  o.push(h1('Website Content Inventory'));
  o.push(h2('Purpose and method'));
  o.push(P('This chapter is the **source-of-truth content inventory**. Every string below was extracted programmatically from `code.html` (HTML entities decoded, whitespace normalised) so that the coding agent can verify that nothing is omitted or altered. Text is reproduced exactly, including the source\'s capitalisation and its use of "//" and "|" separators.'));
  o.push(...B([
    '**Keep verbatim** — implement exactly as written (CSS may change case visually, but the underlying text must match).',
    '**Flag CR-nn** — keep the text but the advocate must review it before publication (Section 8.4).',
    '**Replace / Remove / Quarantine** — the brief or accessibility rules override the prototype; the reason is cross-referenced.',
    'A companion machine-readable file (`rivora_source_content.json`) contains the same extraction for scripted verification (Section 8.5).',
  ]));
  o.push(P(`Document title (browser tab) in source: **${X.title}**. Language attribute in source: \`en\`.`));
  o.push(h2('Content inventory by section'));

  const H = X.header, HE = X.hero;
  cnt.HDR = sec('Header and navigation (`<header>`)', 'HDR', [
    ['Brand mark', 'R (square monogram) + RIVORA + ADVOCATES & ASSOCIATES (text beneath)', 'Replace with supplied logo (C-04, C-11)'],
    ...H.nav.map(([l, h]) => ['Nav link', `${l}  →  ${h}`, 'Keep verbatim (label inconsistency: C-12)']),
    ['Primary button', `${H.cta[0][0]}  →  ${H.cta[0][1]}`],
    ['Icon button (aria-label "Account")', 'person icon  →  #contact', 'Remove (D-17)'],
  ]);
  cnt.HERO = sec('Hero (`#hero`)', 'HERO', [
    ['Image alt', HE.img_alt, 'Keep; may be improved (Ch. 20)'], ['Badge', HE.badge], ['Heading (H1)', HE.h1], ['Paragraph', HE.p],
    ...HE.buttons.map(([l, h]) => ['Button', `${l}  →  ${h}`]),
    ...HE.meta.map(([l, v]) => ['Meta item', `${l} — ${v}`]),
  ]);
  cnt.MQ = sec('Infinite marquee (no anchor)', 'MQ', X.marquee.map((t, i) => ['Phrase ' + (i + 1), t]), 'Phrases are separated by the character ✳ (gold). The exact sequence is approved in the brief and matches the source. The source duplicates the set once for looping; the duplicate is `aria-hidden` and is not additional content.');
  const P_ = X.pillars;
  cnt.PIL = sec('At a glance — "Core Scrutiny Pillars" (`#pillars`)', 'PIL', [
    ['Kicker', P_.kicker], ['Side note', P_.sub],
    ...P_.cards.flatMap((c, i) => [[`Card ${i + 1} label`, c.kicker], [`Card ${i + 1} title`, c.title], [`Card ${i + 1} body`, c.body]]),
  ], 'The brief calls this block "At a glance"; the source calls it "Core Scrutiny Pillars" and anchors it `#pillars`. The source wording is kept (C-02).');
  const S = X.services;
  cnt.SVC = sec('Services and practice areas (`#services`)', 'SVC', [
    ['Kicker', S.kicker], ['Heading (H2)', S.h2], ['Intro paragraph', S.p], ['Counter (initial)', S.counter, 'Replace with index state (C-16)'],
    ['Arrow button labels', S.arrows.join(' / '), 'Replace with index selection (C-16)'],
    ...S.items.flatMap((it, i) => { const n = i + 1; return [
      [`Item ${n} index label`, `${it.tab_kicker} — ${it.tab_name}`], [`Item ${n} badge`, it.badge], [`Item ${n} heading`, it.h3], [`Item ${n} description`, it.p],
      [`Item ${n} tags`, it.chips.join('  |  ')], [`Item ${n} footer label`, it.footer], [`Item ${n} link`, `${it.cta}  →  ${it.cta_href}`], [`Item ${n} image alt`, it.img_alt, 'Keep; image file IMG-0' + (n + 1)]]; }),
  ]);
  const D = X.search;
  cnt.SD = sec('Search depth (`#search-depth`)', 'SD', [
    ['Kicker', D.kicker], ['Heading (H2)', D.h2], ['Intro paragraph', D.p],
    ...D.cards.flatMap((c, i) => [
      ...(c.ribbon ? [[`Card ${i + 1} ribbon`, c.ribbon, 'Keep; Flag CR-05']] : []),
      [`Card ${i + 1} number`, c.number], [`Card ${i + 1} label`, c.label], [`Card ${i + 1} heading`, c.h3], [`Card ${i + 1} description`, c.p, i === 1 ? 'Keep; Flag CR-05' : undefined],
      ...c.bullets.map((b, j) => [`Card ${i + 1} item ${j + 1}`, b]), [`Card ${i + 1} suitability`, `${c.suit_label}: ${c.suit_value}`]]),
  ], 'Numbers 15, 30, 60 are displayed as large numerals with the unit word supplied by the label ("Years Horizon" / "Recommended").');
  const R = X.process;
  cnt.PRC = sec('Professional process (`#process`)', 'PRC', [
    ['Kicker', R.kicker], ['Heading (H2)', R.h2], ['Intro paragraph', R.p],
    ...R.stages.flatMap((s, i) => [[`Stage ${i + 1} label`, s.stage], [`Stage ${i + 1} icon`, s.icon, 'Replace with inline SVG (Ch. 11)'], [`Stage ${i + 1} heading`, s.h3], [`Stage ${i + 1} description`, s.p], [`Stage ${i + 1} deliverable`, `${s.deliv_label}: ${s.deliv}`]]),
  ], 'The brief names the stages "Consultation, Documents, Scrutiny, Opinion, Next steps". The source headings are "Consultation, Documents, Scrutiny, Written Opinion, Transaction Support". Source headings are kept (C-06).');
  const E = X.expertise;
  cnt.EXP = sec('Expertise — "Acquisitions" (`#expertise`)', 'EXP', [
    ['Kicker', E.kicker], ['Heading (H2)', E.h2], ['Paragraph', E.p],
    ...E.points.flatMap((p, i) => [[`Point ${i + 1} icon`, p.icon, 'Replace with inline SVG'], [`Point ${i + 1} heading`, p.h4], [`Point ${i + 1} text`, p.p]]),
    ['Checklist kicker', E.checklist.kicker], ['Checklist title', E.checklist.title], ['Checklist badge', E.checklist.badge],
    ...E.checklist.rows.map(([a, b], i) => [`Checklist row ${i + 1}`, `${a} — ${b}`, 'Keep; Flag CR-03']),
    ['Assurance label', E.checklist.assure_label], ['Assurance text', E.checklist.assure],
  ]);
  const V = X.reviews;
  cnt.REV = sec('Client reviews (`#reviews`)', 'REV', [
    ['Kicker', V.kicker], ['Heading (H2)', V.h2], ['Intro paragraph', V.p],
    ...V.cards.filter(c => !c.dup).flatMap((c, i) => [[`Testimonial ${i + 1} quote`, c.quote, 'QUARANTINE — do not publish (C-07, CR-02)'], [`Testimonial ${i + 1} attribution`, `${c.name} — ${c.role}${c.badge ? ' — badge: ' + c.badge : ''}`, 'QUARANTINE — do not publish (C-07)']]),
  ], 'The source marquee holds five testimonials plus three loop-clones (aria-hidden). All five are unverified, name individuals and firms, and include a monetary saving and a "VERIFIED" badge. They are listed here only for completeness and must not be published unless the advocate supplies written authorisation (Section 8.3).');
  const F = X.faq;
  cnt.FAQ = sec('Frequently asked questions (`#faq`)', 'FAQ', [
    ['Badge', F.badge], ['Heading (H2)', F.h2], ['Intro paragraph', F.p], ['Button', `${F.cta}  →  #contact`], ['Assurance line', F.assure],
    ...F.items.flatMap((q, i) => [[`Q${i + 1} number`, q.n], [`Q${i + 1} question`, q.q], [`Q${i + 1} answer`, q.a, i === 1 || i === 3 ? 'Keep; Flag CR-05' : i === 2 ? 'Keep; Flag CR-04' : undefined]]),
  ], 'Six questions exist in the source. The brief asks for eight: items 7 and 8 are ' + TBD + ' (C-01).');
  const K = X.contact;
  cnt.CON = sec('Contact (`#contact`)', 'CON', [
    ['Badge', K.badge], ['Heading (H2)', K.h2], ['Intro paragraph', K.p], ['Card kicker', K.card_kicker], ['Card heading', K.card_h3, 'Keep; name conflict C-05'], ['Card sub-line', K.card_sub, 'Keep; Flag CR-08'],
    ['Status badge', K.status, 'Remove pulsing dot; approval needed (CR-06)'], ['Phone label', K.line_label], ['Phone number', K.phone], ['Phone sub-line', K.line_sub],
    ...K.buttons.map(([l, t]) => ['Action', `${l}  →  ${t}`]), ['Copy confirmation text', K.toast], ['Regions label', K.juris_label], ['Regions', K.juris], ['Assurance line', K.assure1],
    ['Confidentiality statement', K.privilege, 'Keep; Flag CR-12'],
  ]);
  const T = X.footer;
  cnt.FTR = sec('Footer (`<footer>`)', 'FTR', [
    ['Brand block', 'R monogram + RIVORA + ADVOCATES & ASSOCIATES', 'Replace with supplied logo; remove descriptor from this block (C-04, C-11)'],
    ['Description', T.desc], ['Phone label', T.line_label], ['Phone number', T.phone],
    ...T.links.map(([l, h]) => ['Link', `${l}  →  ${h}`]), ['Regions label', T.juris_label], ['Regions', T.juris], ['Copyright', T.copyright],
    ['Bottom descriptor', T.descriptor, 'Keep — must be the final visible line of the page'],
  ]);
  const total = Object.values(cnt).reduce((a, b) => a + b, 0);
  o.push(P(`**Inventory size:** ${total} items — ` + Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(', ') + '.'));

  o.push(h2('Content not in the source, or overridden by the brief'));
  o.push(...tbl(['Item', 'Treatment', 'Status'], [
    ['FAQ 7 and 8', 'Brief expects eight Q&As. Create the data structure for eight; ship six; do not write the missing two.', TBD],
    ['Approved testimonials', 'Quarantine the five source testimonials. Use `src/data/reviews.ts` with `approved: false` placeholders on staging: "Placeholder — awaiting an approved client review". The production build fails if any entry has `approved: false`.', PRO],
    ['Contact form labels, help text, validation messages, success/error text', 'Written by the agent from Chapter 25; plain functional language only; client to approve.', PRO],
    ['Mobile menu labels ("Menu", "Close menu"), skip link ("Skip to content"), marquee pause button label', 'Functional UI strings needed for accessibility.', PRO],
    ['Meta description, Open Graph text, image alt-text refinements', 'Drafted only from facts in the source (Chapter 21).', PRO],
    ['Privacy notice / consent wording', 'Required if the form collects personal data.', TBD],
  ], [26, 56, 18]));

  o.push(h2('Content risk register (advocate review required)'));
  o.push(callout('Why this register exists', 'The brief states that the advocate must approve all published content for compliance with applicable Indian professional rules. The items below are **observations for the advocate**, not legal conclusions. The coding agent must not edit the text; it must keep it verbatim and record the advocate\'s decision.', 'warn'));
  o.push(...tbl(['ID', 'Where', 'Concern', 'Required action'], [
    ['CR-01', 'HERO paragraph; Services intro ("senior advocates"); Contact intro; Contact assurance line', '"Senior Advocate" appears four times. In India "Senior Advocate" is a formal designation conferred under the Advocates Act, 1961 — it must be accurate for the named person.', 'Advocate confirms or supplies replacement wording.'],
    ['CR-02', 'Reviews (all five testimonials)', 'Named individuals and firms, a ₹18 Crore saving, "fastest and most dependable in the state", "only title verification team we trust", and a "VERIFIED" badge. None is evidenced; outcome claims and comparative superlatives are sensitive for advocates.', 'Quarantine. Publish only authorised reviews with written permission.'],
    ['CR-03', 'Expertise checklist card', 'Rows read "VERIFIED / UNBROKEN", "NEGATIVE / CLEAR", "NO LIS PENDENS", "PERMITTED ZONE" and could be read as a guaranteed result for every client.', 'Advocate confirms it is illustrative; if so add a label such as "Illustrative checklist" (PROPOSED).'],
    ['CR-04', 'FAQ 3', 'States 5–7 and 10–14 business-day turnaround.', 'Confirm these are acceptable public commitments.'],
    ['CR-05', 'FAQ 2 and FAQ 4; Search-depth 30-year card and ribbon', 'Legal statements: Section 22-A effects ("void ab initio"), "statutory benchmark", "recommended legal standard under property law", limitation-law effect of a 30-year search. Section 22-A is understood to be a state-specific amendment, yet the site also lists New Delhi.', 'Advocate verifies accuracy, jurisdictional scope and current statutory references.'],
    ['CR-06', 'Contact status badge "Consultations Active"', 'Pulsing green dot implies live availability that the site cannot guarantee; the pulse also ignores reduced-motion preferences.', 'Remove or approve with a static, non-pulsing treatment.'],
    ['CR-07', 'Hero meta, Services item 1, Pillar 4, Expertise assurance, search/process text', 'Repeated use of "certified" / "certification" (e.g., "certified title opinions", "certified legal counsel") may imply an official certification scheme.', 'Advocate confirms intended meaning.'],
    ['CR-08', 'Contact card sub-line', '"Practicing Counsel & Title Examination Specialists" — "specialists" is a specialisation claim.', 'Advocate confirms permitted description.'],
    ['CR-09', 'Expertise paragraph ("Southern India"); FAQ intro ("South India")', 'Regions named elsewhere are Telangana, Andhra Pradesh and New Delhi; New Delhi is not in Southern India.', 'Advocate chooses consistent geography wording.'],
    ['CR-10', 'Hero paragraph', 'Grammar: "Senior Advocate RK.V & Associates personally scrutinize…" (plural verb with a named individual).', 'Advocate decides whether to amend; agent does not change it.'],
    ['CR-11', 'Reviews text mentioning "Dharani portal", Rangareddy, 1984 partition', 'Specific factual statements inside unverified testimonials.', 'Resolved by removing testimonials (CR-02).'],
    ['CR-12', 'Contact confidentiality statement', 'Cites "professional privilege … pursuant to the Advocates Act". Privilege and confidentiality are commonly associated with evidence law and the Bar Council of India rules rather than the Advocates Act, and a website enquiry precedes engagement. Statute names and section numbers must be verified; I have not verified current numbering.', 'Advocate confirms the statement and its legal basis.'],
    ['CR-13', 'General', 'Advertising and solicitation by advocates is regulated by the Bar Council of India rules. Whether each element (testimonials, "Consultations Active", comparative claims) is permitted is the advocate\'s determination.', 'Advocate sign-off recorded in the handover checklist (Chapter 32).'],
  ], [8, 22, 44, 26], { fs: 17 }));

  o.push(h2('Content verification checklist'));
  o.push(P('The checklist compares the original content against the final implementation. It has an automated part and a manual part.'));
  o.push(h3('Automated check'));
  o.push(...N([
    'Export the inventory (Section 8.2) into `tests/content-manifest.json` — one object per item with `id`, `text`, `mode` (`exact` or `quarantined`) and `section`. The companion `rivora_source_content.json` is the raw extraction.',
    'Normalise both sides: decode entities, collapse whitespace, convert curly quotes/apostrophes to straight, ignore letter case for uppercase-styled labels.',
    'For each `exact` item, assert the built page text contains the string. For each `quarantined` item, assert the page does **not** contain it.',
    'Fail the build on any miss. Report missing IDs.',
  ]));
  o.push(...code(`// tests/content.spec.ts (Playwright)
import { test, expect } from '@playwright/test';
import manifest from './content-manifest.json';
const norm = (s: string) => s.replace(/[\\u2018\\u2019]/g, "'").replace(/[\\u201C\\u201D]/g, '"')
  .replace(/\\s+/g, ' ').trim().toLowerCase();

test('all verbatim content is present and quarantined content is absent', async ({ page }) => {
  await page.goto('/');
  const body = norm(await page.locator('body').innerText({ timeout: 10000 }) +
                    ' ' + (await page.locator('body').textContent() ?? ''));
  for (const item of manifest) {
    const present = body.includes(norm(item.text));
    if (item.mode === 'exact') expect(present, item.id + ' missing').toBe(true);
    if (item.mode === 'quarantined') expect(present, item.id + ' must not be published').toBe(false);
  }
});`));
  o.push(h3('Manual check (reviewer ticks each)'));
  o.push(...CK([
    'All 12 blocks are present in the order of Chapter 9 and every nav anchor scrolls to the right block.',
    'Legal terms are spelled exactly: Section 22-A, Pahanis, ROR, Encumbrance Certificate (EC), Sub-Registrar, lis pendens, Wakf, Tippani, FMB, JDA, GPA, EPC.',
    'Search periods read 15, 30 and 60 years with the supplied descriptions and bullet lists.',
    'All six practice areas, six FAQs and five process stages match the inventory word for word.',
    'Telephone 8099888851 and WhatsApp number 918099888851 are correct in text, `tel:` and `wa.me` links.',
    'RIVORA brand name appears once in the header (logo); "Advocates & Associates" is the last line of the footer; the brand name is not duplicated as text beside the logo.',
    'No testimonial from the source appears; any placeholder is clearly labelled and absent from production.',
    'No invented address, e-mail, URL, credential, rating or review anywhere (including meta tags and structured data).',
    'Every item flagged CR-nn has a recorded advocate decision.',
  ]));
  L.cnt = cnt;
  return o;
};
