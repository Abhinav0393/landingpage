import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Lighthouse mobile median runner.
 * Usage: node scripts/lighthouse-median.mjs [url] [runs] [label]
 * Defaults: http://localhost:4322, 3 runs, "task4"
 *
 * Produces screenshots/lighthouse/<label>-run-<n>.json plus
 * screenshots/lighthouse/<label>-median.json with category medians.
 */

const url = process.argv[2] || 'http://localhost:4322/';
const runs = Number(process.argv[3] || 3);
const label = process.argv[4] || 'task4';
const outDir = path.resolve('screenshots', 'lighthouse');
fs.mkdirSync(outDir, { recursive: true });

const cli = path.resolve('node_modules', 'lighthouse', 'cli', 'index.js');
const chromeFlags = '--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage';

function runOnce(index) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outDir, `${label}-run-${index}.json`);
    const args = [
      cli,
      url,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--throttling-method=simulate',
      '--output=json',
      `--output-path=${outputPath}`,
      `--chrome-flags=${chromeFlags}`,
      '--quiet',
    ];
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`Lighthouse exited with code ${code}`));
      try {
        resolve(JSON.parse(fs.readFileSync(outputPath, 'utf8')));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

const report = {
  url,
  runs,
  label,
  generatedAt: new Date().toISOString(),
  categories: {},
  metrics: {},
};

for (let i = 1; i <= runs; i += 1) {
  console.log(`\n=== Lighthouse mobile run ${i}/${runs} ===`);
  const result = await runOnce(i);
  for (const [id, category] of Object.entries(result.categories)) {
    report.categories[id] ??= { scores: [] };
    report.categories[id].scores.push(Math.round(category.score * 100));
  }
  for (const id of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index']) {
    const audit = result.audits[id];
    if (!audit) continue;
    report.metrics[id] ??= { values: [] };
    report.metrics[id].values.push(audit.numericValue);
  }
  console.log(
    Object.entries(result.categories)
      .map(([id, category]) => `${id}=${Math.round(category.score * 100)}`)
      .join(' ')
  );
}

for (const category of Object.values(report.categories)) {
  category.median = median(category.scores);
}
for (const metric of Object.values(report.metrics)) {
  metric.median = median(metric.values);
}

const summaryPath = path.join(outDir, `${label}-median.json`);
fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2));

console.log('\n=== Median of ' + runs + ' mobile runs ===');
for (const [id, category] of Object.entries(report.categories)) {
  console.log(`${id}: ${category.median} (${category.scores.join(', ')})`);
}
for (const [id, metric] of Object.entries(report.metrics)) {
  console.log(`${id}: ${metric.median.toFixed(2)}`);
}
console.log(`\nSaved ${summaryPath}`);
