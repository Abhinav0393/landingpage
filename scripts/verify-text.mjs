import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();

  const codeHtmlPath = path.resolve(__dirname, '../rivora-handoff-generator/src_inputs/code.html');
  await page1.goto(`file://${codeHtmlPath}`, { waitUntil: 'load' });
  await page2.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Extract all text nodes or innerText
  const text1 = await page1.evaluate(() => {
    // Remove scripts and styles
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script, style').forEach(el => el.remove());
    return clone.innerText;
  });

  const text2 = await page2.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script, style').forEach(el => el.remove());
    return clone.innerText;
  });

  // Verify timeline, process, and checklist explicitly
  const timelineCheck = await page2.evaluate(() => {
    const section = document.querySelector('#search-depth');
    if (!section) return { found: false };
    const headings = Array.from(section.querySelectorAll('h2, h3, p, li')).map(e => e.innerText.trim());
    return {
      found: true,
      has15: headings.some(t => t.includes('15') || t.includes('Focused search')),
      has30: headings.some(t => t.includes('30') || t.includes('Standard statutory search')),
      has60: headings.some(t => t.includes('60') || t.includes('Deep title scrutiny')),
      samples: headings.slice(0, 8)
    };
  });

  const processCheck = await page2.evaluate(() => {
    const section = document.querySelector('#process');
    if (!section) return { found: false };
    const items = Array.from(section.querySelectorAll('h3, p, span')).map(e => e.innerText.trim()).filter(Boolean);
    return {
      found: true,
      hasStages: ['STAGE 01', 'STAGE 02', 'STAGE 03', 'STAGE 04', 'STAGE 05'].every(st => items.includes(st)),
      hasTitles: ['Consultation', 'Documents', 'Records', 'Litigation', 'Opinion'].every(t => items.some(i => i.includes(t))),
      count: items.length
    };
  });

  const checklistCheck = await page2.evaluate(() => {
    const section = document.querySelector('#expertise');
    if (!section) return { found: false };
    const items = Array.from(section.querySelectorAll('span, h4, p')).map(e => e.innerText.trim()).filter(Boolean);
    const hasChecklistTitle = items.some(t => t.includes('Counsel Verification Checklist'));
    const checklistPoints = [
      'Revenue Mutation Analysis',
      'Section 22-A Prohibited Ledger',
      'Civil Court Lis Pendens Search',
      'Land Ceiling & Buffer Compliance',
      'Physical Khata & Tax Alignment'
    ];
    const pointsFound = checklistPoints.every(pt => items.some(i => i.includes(pt)));
    return {
      found: true,
      hasChecklistTitle,
      pointsFound,
      itemsSample: items.filter(i => checklistPoints.includes(i))
    };
  });

  console.log('--- TIMELINE CHECK ---');
  console.log(JSON.stringify(timelineCheck, null, 2));

  console.log('\n--- PROCESS CHECK ---');
  console.log(JSON.stringify(processCheck, null, 2));

  console.log('\n--- CHECKLIST CHECK ---');
  console.log(JSON.stringify(checklistCheck, null, 2));

  // Word token comparison
  const normalizeWords = (str) => str.toLowerCase().replace(/[\r\n\t]+/g, ' ').replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const words1 = new Set(normalizeWords(text1));
  const words2 = new Set(normalizeWords(text2));

  const missingInSite = [...words1].filter(w => !words2.has(w));
  const addedInSite = [...words2].filter(w => !words1.has(w));

  console.log('\n--- TEXT COMPARISON STATS ---');
  console.log('Total unique words in code.html:', words1.size);
  console.log('Total unique words in site:', words2.size);
  console.log('Words in code.html not in site (count):', missingInSite.length);
  if (missingInSite.length > 0) {
    console.log('Missing sample:', missingInSite.slice(0, 20));
  }
  console.log('Words in site not in code.html (count):', addedInSite.length);
  if (addedInSite.length > 0) {
    console.log('Added sample:', addedInSite.slice(0, 20));
  }

  await browser.close();
}

run().catch(console.error);

