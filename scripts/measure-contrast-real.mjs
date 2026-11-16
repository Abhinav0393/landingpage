import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const phase = process.argv[2] || 'current';
const baseURL = process.env.BASE_URL || 'http://localhost:4321';
const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
  return m[1].split(',').slice(0, 3).map(v => Math.round(parseFloat(v)));
}

async function analyzeLightestRegion(buffer, sectionBox, elementBox, tile = 4) {
  const meta = await sharp(buffer).metadata();
  let rx = Math.round(elementBox.x - sectionBox.x);
  let ry = Math.round(elementBox.y - sectionBox.y);
  let rw = Math.max(1, Math.round(elementBox.width));
  let rh = Math.max(1, Math.round(elementBox.height));

  rx = Math.max(0, Math.min(rx, meta.width - 1));
  ry = Math.max(0, Math.min(ry, meta.height - 1));
  rw = Math.max(1, Math.min(rw, meta.width - rx));
  rh = Math.max(1, Math.min(rh, meta.height - ry));

  const { data, info } = await sharp(buffer)
    .extract({ left: rx, top: ry, width: rw, height: rh })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let best = { lum: -1, rgb: [0, 0, 0], x: 0, y: 0, w: 0, h: 0 };
  let brightestPixel = { lum: -1, rgb: [0, 0, 0] };

  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const tw = Math.min(tile, width - x);
      const th = Math.min(tile, height - y);
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = 0; yy < th; yy++) {
        for (let xx = 0; xx < tw; xx++) {
          const i = ((y + yy) * width + (x + xx)) * channels;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
          const pl = luminance([data[i], data[i + 1], data[i + 2]]);
          if (pl > brightestPixel.lum) brightestPixel = { lum: pl, rgb: [data[i], data[i + 1], data[i + 2]] };
        }
      }
      const rgb = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
      const lum = luminance(rgb);
      if (lum > best.lum) best = { lum, rgb, x: rx + x, y: ry + y, w: tw, h: th };
    }
  }

  return { lightestRegion: best, brightestPixel, sampledPixels: width * height };
}

async function collect(page) {
  return page.evaluate(() => {
    const out = [];
    const add = (name, sel, index = 0) => {
      const els = document.querySelectorAll(sel);
      const el = els[index];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const style = getComputedStyle(el);
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const [bgr, bgg, bgb, bga] = ctx.getImageData(0, 0, 1, 1).data;

      out.push({
        name,
        selector: sel,
        index,
        color: style.color,
        bgParsed: { r: bgr, g: bgg, b: bgb, alpha: bga / 255 },
        textShadow: style.textShadow,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        box: { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height },
      });
    };

    add('Hero / eyebrow label', '#hero .stagger-1 span:last-child');
    add('Hero / H1 headline', '#hero h1');
    add('Hero / body paragraph', '#hero p');
    add('Hero / primary CTA', '#hero a[href="#contact"]');
    add('Hero / secondary CTA', '#hero a[href="#services"]');
    for (let i = 1; i <= 3; i++) {
      add(`Hero / proof label ${i}`, `#hero .stagger-5 > div:nth-child(${i}) span:first-child`);
      add(`Hero / proof value ${i}`, `#hero .stagger-5 > div:nth-child(${i}) span:last-child`);
    }

    add('Services / eyebrow', '#services span.block.mb-2');
    add('Services / H2 headline', '#services h2');
    add('Services / slide counter', '#slider-counter');
    add('Services / active tab category', '#tab-0 span:first-child');
    add('Services / active tab name', '#tab-0 span:last-child');
    add('Services / slide badge', '#slide-0 .space-y-4 > div:first-child span:last-child');
    add('Services / slide H3', '#slide-0 h3');
    add('Services / slide body', '#slide-0 p');
    for (let i = 0; i < 3; i++) add(`Services / tag ${i + 1}`, '#slide-0 .flex.flex-wrap.gap-2 span', i);
    add('Services / report line', '#slide-0 .border-t > span');
    add('Services / CTA link', '#slide-0 .border-t a');

    return out;
  });
}

async function prepare(page) {
  await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    })));
    const style = document.createElement('style');
    style.id = 'contrast-measure-style';
    style.textContent = `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .reveal-item { opacity: 1 !important; transform: none !important; }
      header, aside[aria-label="Contact via WhatsApp"], astro-dev-toolbar, #dev-toolbar-root { display: none !important; }
      .contrast-hide-text, .contrast-hide-text * {
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('is-revealed'));
  });
  await page.waitForTimeout(500);
}

async function main() {
  const viewports = [
    { width: 360, height: 780, name: '360' },
    { width: 768, height: 1024, name: '768' },
    { width: 1440, height: 900, name: '1440' },
  ];

  const browser = await chromium.launch({ headless: true });
  const all = {};

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    await prepare(page);

    const docOffset = await page.evaluate(() => ({ scrollY: window.scrollY }));
    // Bring page to top so absolute boxes are stable.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const targets = await collect(page);
    for (const t of targets) {
      t.box.y -= docOffset.scrollY;
    }

    const hero = page.locator('#hero');
    const services = page.locator('#services');
    const heroBox = await hero.boundingBox();
    const svcBox = await services.boundingBox();

    await hero.screenshot({ path: path.join(outDir, `contrast-${phase}-${vp.width}-hero.png`) });
    await services.screenshot({ path: path.join(outDir, `contrast-${phase}-${vp.width}-services.png`) });

    await page.evaluate(() => {
      document.querySelectorAll('#hero, #services').forEach(section => {
        section.classList.add('contrast-hide-text');
      });
    });
    await page.waitForTimeout(250);

    const heroBg = await hero.screenshot();
    const svcBg = await services.screenshot();

    await page.evaluate(() => {
      document.querySelectorAll('#hero, #services').forEach(section => {
        section.classList.remove('contrast-hide-text');
      });
    });

    const rows = [];
    for (const t of targets) {
      const isHero = t.name.startsWith('Hero');
      const sectionBox = isHero ? heroBox : svcBox;
      const bgBuffer = isHero ? heroBg : svcBg;
      if (!sectionBox) continue;
      const bg = await analyzeLightestRegion(bgBuffer, sectionBox, t.box);
      const fg = rgbStringToArray(t.color);
      let effectiveBg = bg.lightestRegion.rgb;
      if (t.bgParsed && t.bgParsed.alpha > 0) {
        const a = t.bgParsed.alpha;
        effectiveBg = [
          Math.round(t.bgParsed.r * a + effectiveBg[0] * (1 - a)),
          Math.round(t.bgParsed.g * a + effectiveBg[1] * (1 - a)),
          Math.round(t.bgParsed.b * a + effectiveBg[2] * (1 - a)),
        ];
      }
      if (t.textShadow && t.textShadow !== 'none' && t.textShadow.includes('rgba(10, 13, 20')) {
        const shadowAlpha = 0.85;
        effectiveBg = [
          Math.round(10 * shadowAlpha + effectiveBg[0] * (1 - shadowAlpha)),
          Math.round(13 * shadowAlpha + effectiveBg[1] * (1 - shadowAlpha)),
          Math.round(20 * shadowAlpha + effectiveBg[2] * (1 - shadowAlpha)),
        ];
      }
      const cr = contrast(fg, effectiveBg);
      const crPixel = contrast(fg, bg.brightestPixel.rgb);
      rows.push({
        ...t,
        fg,
        bg: bg.lightestRegion.rgb,
        bgRegion: bg.lightestRegion,
        brightestPixel: bg.brightestPixel.rgb,
        cr: Number(cr.toFixed(2)),
        crBrightestPixel: Number(crPixel.toFixed(2)),
        pass: cr >= 4.5,
      });
    }

    all[vp.width] = rows;
    console.log(`\n=== ${vp.width}px / ${phase} ===`);
    for (const r of rows) {
      console.log(
        `${r.pass ? 'PASS' : 'FAIL'}  ${r.cr.toFixed(2).padStart(5)}:1  ${r.name.padEnd(30)} fg rgb(${r.fg.join(',')})  lightest-4x4 rgb(${r.bg.join(',')})  @${r.bgRegion.x},${r.bgRegion.y}  pixel=${r.crBrightestPixel.toFixed(2)}`
      );
    }

    await page.close();
  }

  await browser.close();
  const jsonPath = path.join(outDir, `contrast-${phase}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2));
  console.log(`\nSaved ${jsonPath}`);
  const failures = Object.entries(all).flatMap(([w, rows]) => rows.filter(r => !r.pass).map(r => ({ width: w, ...r })));
  console.log(`Failures: ${failures.length}`);
  for (const f of failures) console.log(`  ${f.width}px ${f.name}: ${f.cr}:1`);
}

main().catch(err => { console.error(err); process.exit(1); });
