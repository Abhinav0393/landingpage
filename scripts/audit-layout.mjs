import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Layout, console, and no-JS audit for Task 4.
 * - 320px through 2560px horizontal-overflow check
 * - console errors/warnings and failed network requests
 * - no-JS visibility of reveal content
 * - floating WhatsApp clears the footer at the bottom of the page
 */

const baseURL = process.env.BASE_URL || 'http://localhost:4321';
const outDir = path.resolve('screenshots');
fs.mkdirSync(outDir, { recursive: true });

const widths = [320, 360, 390, 414, 600, 768, 900, 1024, 1200, 1280, 1366, 1440, 1600, 1920, 2560];
const browser = await chromium.launch({ headless: true });
const report = { widths: [], consoleProblems: [], noJs: null, whatsapp: null };

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const messages = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      messages.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => messages.push({ type: 'pageerror', text: err.message }));
  page.on('requestfailed', (request) =>
    messages.push({ type: 'requestfailed', text: `${request.url()} ${request.failure()?.errorText ?? ''}` })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) messages.push({ type: 'http', text: `${response.status()} ${response.url()}` });
  });

  await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
      )
    );
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .reveal-item { opacity: 1 !important; transform: none !important; }
      astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(200);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const offenders = [];
    if (overflow > 1) {
      document.querySelectorAll('body *').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        if (rect.right > window.innerWidth + 1 || rect.left < -1) {
          const style = getComputedStyle(el);
          if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') return;
          offenders.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          });
        }
      });
    }
    return {
      width: window.innerWidth,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflow,
      offenders: offenders.slice(0, 12),
    };
  });

  report.widths.push({ ...metrics, messages });
  if (messages.length) report.consoleProblems.push({ width, messages });
  await page.close();
}

// No-JS: content must remain visible and the first practice panel readable.
const noJsContext = await browser.newContext({
  viewport: { width: 360, height: 800 },
  javaScriptEnabled: false,
});
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(baseURL + '/', { waitUntil: 'domcontentloaded' });
await noJsPage.waitForTimeout(500);
report.noJs = await noJsPage.evaluate(() => {
  const revealItems = Array.from(document.querySelectorAll('.reveal-item'));
  const hidden = revealItems.filter((el) => {
    const style = getComputedStyle(el);
    return Number(style.opacity) < 0.99 || style.visibility === 'hidden';
  });
  const firstSlide = document.querySelector('#slide-0');
  const main = document.querySelector('main');
  return {
    revealCount: revealItems.length,
    hiddenRevealCount: hidden.length,
    mainHeight: main?.getBoundingClientRect().height ?? 0,
    firstSlideHeight: firstSlide?.getBoundingClientRect().height ?? 0,
    pauseButtonHidden: getComputedStyle(document.querySelector('[data-review-pause]')).display === 'none',
  };
});
await noJsContext.close();

// WhatsApp must hide when the footer is on screen.
const floatPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await floatPage.goto(baseURL + '/', { waitUntil: 'networkidle' });
await floatPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await floatPage.waitForTimeout(600);
report.whatsapp = await floatPage.evaluate(() => {
  const float = document.getElementById('whatsapp-float');
  if (!float) return { present: false };
  const style = getComputedStyle(float);
  const footer = document.querySelector('footer')?.getBoundingClientRect();
  return {
    present: true,
    isHidden: float.classList.contains('is-hidden'),
    opacity: style.opacity,
    visibility: style.visibility,
    footerTop: footer ? Math.round(footer.top) : null,
  };
});
await floatPage.close();

await browser.close();
fs.writeFileSync(path.join(outDir, 'layout-audit-task4.json'), JSON.stringify(report, null, 2));

const overflowFailures = report.widths.filter((row) => row.overflow > 1);
console.log(`Widths checked: ${widths.length}`);
console.log(`Horizontal overflow failures: ${overflowFailures.length}`);
overflowFailures.forEach((row) => {
  console.log(`  ${row.width}px: scrollWidth ${row.scrollWidth} vs clientWidth ${row.clientWidth}`);
  row.offenders.forEach((el) => console.log(`    ${el.tag}#${el.id}.${el.className} ${el.left}..${el.right}`));
});
console.log(`Console/network problems: ${report.consoleProblems.length}`);
report.consoleProblems.forEach((row) => {
  console.log(`  ${row.width}px:`);
  row.messages.forEach((message) => console.log(`    ${message.type}: ${message.text}`));
});
console.log('No-JS:', JSON.stringify(report.noJs));
console.log('WhatsApp:', JSON.stringify(report.whatsapp));

if (overflowFailures.length || report.consoleProblems.length) process.exitCode = 1;
if (report.noJs.hiddenRevealCount > 0 || report.noJs.mainHeight < 1000) process.exitCode = 1;
if (!report.whatsapp.present || !report.whatsapp.isHidden || Number(report.whatsapp.opacity) > 0.05) {
  process.exitCode = 1;
}
