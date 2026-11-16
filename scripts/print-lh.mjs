import fs from 'fs';

const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
const categories = report.categories;
console.log('--- LIGHTHOUSE SCORES (MOBILE) ---');
for (const [key, val] of Object.entries(categories)) {
  console.log(`${val.title.padEnd(20)}: ${Math.round(val.score * 100)}`);
}

const audits = report.audits;
console.log('\n--- CORE WEB VITALS ---');
console.log('First Contentful Paint (FCP):', audits['first-contentful-paint'].displayValue);
console.log('Largest Contentful Paint (LCP):', audits['largest-contentful-paint'].displayValue);
console.log('Total Blocking Time (TBT):', audits['total-blocking-time'].displayValue);
console.log('Cumulative Layout Shift (CLS):', audits['cumulative-layout-shift'].displayValue);
console.log('Speed Index:', audits['speed-index'].displayValue);

