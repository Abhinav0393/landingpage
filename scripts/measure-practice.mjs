import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Measures every practice slide at 360 / 768 / 1440:
 *  - artwork visibility: rendered / raw luminance in the clear region
 *    (top 35% below 1024px, right 40% at 1024px and up), pass >= 75%
 *  - text contrast: lightest 4x4 background region under each copy element,
 *    against the computed text colour, pass >= 4.5:1
 */

const phase = process.argv[2] || 'current';
const baseURL = process.env.BASE_URL || 'http://localhost:4321';
const outDir = path.resolve('screenshots');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { width: 360, height: 800, name: '360' },
  { width: 768, height: 1024, name: '768' },
  { width: 1440, height: 900, name: '1440' },
];

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function rgbStringToArray(value) {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0];
  return m[1].split(',').slice(0, 3).map((v) => Math.round(parseFloat(v)));
}

async function analyzeLightestRegion(buffer, elementBox, tile = 4) {
  const meta = await sharp(buffer).metadata();
  let rx = Math.max(0, Math.min(Math.round(elementBox.x), meta.width - 1));
  let ry = Math.max(0, Math.min(Math.round(elementBox.y), meta.height - 1));
  let rw = Math.max(1, Math.min(Math.round(elementBox.width), meta.width - rx));
  let rh = Math.max(1, Math.min(Math.round(elementBox.height), meta.height - ry));

  const { data, info } = await sharp(buffer)
    .extract({ left: rx, top: ry, width: rw, height: rh })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let best = { lum: -1, rgb: [0, 0, 0], x: 0, y: 0, w: 0, h: 0 };

  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const tw = Math.min(tile, width - x);
      const th = Math.min(tile, height - y);
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = 0; yy < th; yy += 1) {
        for (let xx = 0; xx < tw; xx += 1) {
          const i = ((y + yy) * width + (x + xx)) * channels;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
      }
      const rgb = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
      const lum = luminance(rgb);
      if (lum > best.lum) best = { lum, rgb, x: rx + x, y: ry + y, w: tw, h: th };
    }
  }

  return best;
}

async function cropLuminance(pageBuffer, region, label) {
  const meta = await sharp(pageBuffer).metadata();
  const left = Math.max(0, Math.min(Math.round(region.left), meta.width - 1));
  const top = Math.max(0, Math.min(Math.round(region.top), meta.height - 1));
  const width = Math.max(1, Math.min(Math.round(region.width), meta.width - left));
  const height = Math.max(1, Math.min(Math.round(region.height), meta.height - top));
  const crop = await sharp(pageBuffer).extract({ left, top, width, height }).png().toBuffer();
  fs.writeFileSync(path.join(outDir, `practice-${phase}-${label}.png`), crop);
  const stats = await sharp(crop).stats();
  const [r, g, b] = stats.channels;
  return Number((0.2126 * r.mean + 0.7152 * g.mean + 0.0722 * b.mean).toFixed(2));
}

const browser = await chromium.launch({ headless: true });
const report = {};

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
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
      header, footer, aside[aria-label="Contact via WhatsApp"], astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
      .contrast-hide-text, .contrast-hide-text * {
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
        text-shadow: none !important;
      }
      .measure-hide-layers { visibility: hidden !important; }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
    document.querySelectorAll('main > section').forEach((section) => {
      if (section.id !== 'services') section.style.display = 'none';
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);

  const viewportReport = { viewport: vp.name, slides: [] };

  for (let i = 0; i < 6; i += 1) {
    await page.evaluate((index) => {
      window.goToPracticeSlide(index);
    }, i);
    await page.waitForTimeout(100);

    const panelBox = await page.locator('.practice-panel').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    });

    const targets = await page.evaluate((index) => {
      const out = [];
      const slide = document.querySelector(`#slide-${index}`);
      if (!slide) return out;
      const add = (name, el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        out.push({
          name,
          color: getComputedStyle(el).color,
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        });
      };

      add('badge', slide.querySelector('.inline-flex span:last-child'));
      add('h3', slide.querySelector('h3'));
      add('body', slide.querySelector('p'));
      slide.querySelectorAll('.flex.flex-wrap.gap-2 span').forEach((tag, tagIndex) => {
        add(`tag ${tagIndex + 1}`, tag);
      });
      add('report', slide.querySelector('.border-t > span'));
      add('cta', slide.querySelector('.border-t a'));
      return out;
    }, i);

    // Rendered panel, copy hidden so only backgrounds remain.
    await page.evaluate((index) => {
      document.querySelector(`#slide-${index}`)?.classList.add('contrast-hide-text');
    }, i);
    await page.waitForTimeout(80);
    const renderedPage = await page.screenshot({ fullPage: true });
    await page.evaluate((index) => {
      document.querySelector(`#slide-${index}`)?.classList.remove('contrast-hide-text');
    }, i);

    // Raw panel with scrim and copy visibility hidden (layout unchanged).
    await page.evaluate((index) => {
      const slide = document.querySelector(`#slide-${index}`);
      slide?.querySelector('.practice-scrim')?.classList.add('measure-hide-layers');
      slide?.querySelector('.practice-content')?.classList.add('measure-hide-layers');
    }, i);
    await page.waitForTimeout(80);
    const rawPage = await page.screenshot({ fullPage: true });
    await page.evaluate((index) => {
      const slide = document.querySelector(`#slide-${index}`);
      slide?.querySelector('.practice-scrim')?.classList.remove('measure-hide-layers');
      slide?.querySelector('.practice-content')?.classList.remove('measure-hide-layers');
    }, i);

    const clearRegion =
      vp.width >= 1024
        ? {
            left: panelBox.left + panelBox.width * 0.6,
            top: panelBox.top,
            width: panelBox.width * 0.4,
            height: panelBox.height,
          }
        : {
            left: panelBox.left,
            top: panelBox.top,
            width: panelBox.width,
            height: panelBox.height * 0.35,
          };

    const renderedLum = await cropLuminance(
      renderedPage,
      clearRegion,
      `${vp.name}-${i + 1}-rendered`
    );
    const rawLum = await cropLuminance(rawPage, clearRegion, `${vp.name}-${i + 1}-raw`);
    const visibility = Number(((renderedLum / rawLum) * 100).toFixed(1));

    const panelCrop = await sharp(renderedPage)
      .extract({
        left: Math.round(panelBox.left),
        top: Math.round(panelBox.top),
        width: Math.round(panelBox.width),
        height: Math.round(panelBox.height),
      })
      .png()
      .toBuffer();

    const rows = [];
    for (const target of targets) {
      const bg = await analyzeLightestRegion(panelCrop, {
        x: target.box.x - panelBox.left,
        y: target.box.y - panelBox.top,
        width: target.box.width,
        height: target.box.height,
      });
      const fg = rgbStringToArray(target.color);
      const cr = Number(contrast(fg, bg.rgb).toFixed(2));
      rows.push({ ...target, fg, bg: bg.rgb, cr, pass: cr >= 4.5 });
    }

    const failures = rows.filter((row) => !row.pass);
    const min = rows.reduce((acc, row) => (acc === null || row.cr < acc.cr ? row : acc), null);

    viewportReport.slides.push({
      slide: i + 1,
      mode: vp.width >= 1024 ? 'right 40%' : 'top 35%',
      renderedLuminance: renderedLum,
      rawLuminance: rawLum,
      visibilityPercent: visibility,
      visibilityPass: visibility >= 75,
      minContrast: min?.cr ?? null,
      minContrastTarget: min?.name ?? null,
      contrastFailures: failures.map((row) => ({ name: row.name, cr: row.cr, bg: row.bg })),
      rows,
    });

    console.log(
      `${vp.name} slide ${i + 1}: visibility ${visibility}% (${renderedLum}/${rawLum}), ` +
        `min contrast ${min?.cr ?? 'n/a'}:1 (${min?.name ?? 'n/a'}), failures ${failures.length}`
    );
  }

  report[vp.name] = viewportReport;
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, `practice-${phase}.json`), JSON.stringify(report, null, 2));
console.log(`\nSaved ${path.join(outDir, `practice-${phase}.json`)}`);

const visibilityFailures = Object.entries(report).flatMap(([width, data]) =>
  data.slides.filter((slide) => !slide.visibilityPass).map((slide) => ({ width, slide: slide.slide }))
);
const contrastFailures = Object.entries(report).flatMap(([width, data]) =>
  data.slides.flatMap((slide) =>
    slide.contrastFailures.map((failure) => ({ width, slide: slide.slide, ...failure }))
  )
);
console.log(`Visibility failures: ${visibilityFailures.length}`);
visibilityFailures.forEach((failure) =>
  console.log(`  ${failure.width}px slide ${failure.slide}`)
);
console.log(`Contrast failures: ${contrastFailures.length}`);
contrastFailures.forEach((failure) =>
  console.log(`  ${failure.width}px slide ${failure.slide} ${failure.name}: ${failure.cr}:1`)
);
if (visibilityFailures.length || contrastFailures.length) process.exitCode = 1;
