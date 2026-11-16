import fs from 'fs';

const html1 = fs.readFileSync('rivora-handoff-generator/src_inputs/code.html', 'utf8');
const html2 = fs.readFileSync('dist/index.html', 'utf8');

function clean(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const t1 = clean(html1);
const t2 = clean(html2);

console.log('Cleaned text length code.html:', t1.length);
console.log('Cleaned text length dist/index.html:', t2.length);

const sections = [
  // Hero
  'End-to-end land & property title verification',
  'Senior Advocate RK.V & Associates personally scrutinize unbroken link chains',
  'Request a consultation',
  'Our practice areas',

  // Timeline (15 / 30 / 60)
  'Investigation Horizons',
  'How far back we search',
  'Land rights are generational',
  '15',
  'Years Horizon',
  'Focused search',
  'Registered link documents',
  '30',
  'Recommended',
  'General standard',
  'The recommended legal standard under property law',
  '60',
  'Years Horizon',
  'Extended search',
  'Exhaustive historical forensic scrutiny',

  // Process (5 Stages)
  'Protocol & Execution',
  'How our advocates examine your property',
  'STAGE 01',
  'Consultation',
  'STAGE 02',
  'Documents',
  'STAGE 03',
  'Scrutiny',
  'STAGE 04',
  'Written Opinion',
  'STAGE 05',
  'Transaction Support',

  // Checklist
  'Counsel Verification Checklist',
  'Legal Due Diligence Scrutiny Points',
  'Revenue Mutation Analysis',
  'VERIFIED / UNBROKEN',
  'Section 22-A Prohibited Ledger',
  'NEGATIVE / CLEAR',
  'Tippani & FMB Field Measurement',
  'CONGRUENT WITH DEED',
  'High Court / Civil Court Docket Scan',
  'NO LIS PENDENS'
];

console.log('\n--- VERIFYING EXACT VERBATIM STRINGS ---');
let allPassed = true;
for (const s of sections) {
  const in1 = t1.includes(s);
  const in2 = t2.includes(s);
  if (!in1 || !in2) allPassed = false;
  console.log(`${s.padEnd(50)} | code.html: ${in1 ? 'YES' : 'NO '} | dist: ${in2 ? 'YES' : 'NO '}`);
}
console.log('\nAll checked verbatim sections match perfectly:', allPassed);
