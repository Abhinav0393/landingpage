import { chromium } from '@playwright/test';
import sharp from 'sharp';

function srgbToLinear(c) {
  c = c / 255.0;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb) {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function analyzeRegion(imageBuffer, imgWidth, imgHeight, box, relBox) {
  let rx = Math.round(box.x - relBox.x);
  let ry = Math.round(box.y - relBox.y);
  let rw = Math.round(box.width);
  let rh = Math.round(box.height);

  rx = Math.max(0, Math.min(rx, imgWidth - 1));
  ry = Math.max(0, Math.min(ry, imgHeight - 1));
  rw = Math.max(1, Math.min(rw, imgWidth - rx));
  rh = Math.max(1, Math.min(rh, imgHeight - ry));

  const { data, info } = await sharp(imageBuffer)
    .extract({ left: rx, top: ry, width: rw, height: rh })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalR = 0, totalG = 0, totalB = 0;
  const numPixels = info.width * info.height;
  let maxLum = -1;
  let brightestPixel = [0, 0, 0];

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    const lum = relativeLuminance([r, g, b]);
    if (lum > maxLum) {
      maxLum = lum;
      brightestPixel = [r, g, b];
    }
  }

  const avgR = totalR / numPixels;
  const avgG = totalG / numPixels;
  const avgB = totalB / numPixels;

  return {
    avgBg: [Math.round(avgR), Math.round(avgG), Math.round(avgB)],
    brightestBg: brightestPixel,
  };
}

async function run() {
  const viewports = [
    { w: 360, h: 780, name: '360px (mobile)' },
    { w: 768, h: 1024, name: '768px (tablet)' },
    { w: 1440, h: 900, name: '1440px (desktop)' },
  ];

  const browser = await chromium.launch({ headless: true });

  const results = {};

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`MEASURING CONTRAST AT ${vp.name}`);
    console.log(`======================================================`);

    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // --- HERO SECTION ---
    const hero = page.locator('#hero');
    const heroBox = await hero.boundingBox();

    const heroElements = [
      { name: 'Hero Headline', sel: '#hero h1', fg: [251, 250, 247] },
      { name: 'Hero Paragraph', sel: '#hero p', fg: [237, 232, 221] },
      { name: 'Hero Primary CTA', sel: "#hero a[href='#contact']", fg: [21, 25, 34], isButton: true },
      { name: 'Hero Secondary CTA', sel: "#hero a[href='#services']", fg: [251, 250, 247] },
      { name: 'Hero Metadata Text', sel: '#hero .stagger-5', fg: [251, 250, 247] },
    ];

    const heroBoxes = [];
    for (const el of heroElements) {
      const loc = page.locator(el.sel);
      if (await loc.count() > 0) {
        const box = await loc.first().boundingBox();
        heroBoxes.push({ ...el, box });
      }
    }

    // Hide text to capture background behind text
    await page.evaluate(() => {
      const textEls = document.querySelectorAll('#hero h1, #hero p, #hero a, #hero .stagger-5, #hero .stagger-1');
      textEls.forEach(el => (el.style.visibility = 'hidden'));
    });
    await page.waitForTimeout(200);

    const heroBgBuffer = await hero.screenshot();
    const heroMeta = await sharp(heroBgBuffer).metadata();

    // Restore text
    await page.evaluate(() => {
      const textEls = document.querySelectorAll('#hero h1, #hero p, #hero a, #hero .stagger-5, #hero .stagger-1');
      textEls.forEach(el => (el.style.visibility = ''));
    });

    console.log('\n--- HERO CONTRAST RATIOS ---');
    results[vp.w] = { hero: [], services: [] };

    for (const el of heroBoxes) {
      if (!el.box) continue;

      if (el.isButton) {
        // Gold button background is #A98A50 (169, 138, 80)
        const btnBg = [169, 138, 80];
        const cr = contrastRatio(el.fg, btnBg);
        console.log(`  ${el.name.padEnd(22)} | FG: ${JSON.stringify(el.fg)} on Gold Button ${JSON.stringify(btnBg)} | CR: ${cr.toFixed(2)}:1 -> ${cr >= 4.5 ? 'PASS' : 'FAIL'}`);
        results[vp.w].hero.push({ name: el.name, crAvg: cr, crWorst: cr, pass: cr >= 4.5 });
      } else {
        const { avgBg, brightestBg } = await analyzeRegion(heroBgBuffer, heroMeta.width, heroMeta.height, el.box, heroBox);
        const crAvg = contrastRatio(el.fg, avgBg);
        const crWorst = contrastRatio(el.fg, brightestBg);
        console.log(`  ${el.name.padEnd(22)} | FG: ${JSON.stringify(el.fg)} on BG avg ${JSON.stringify(avgBg)} | CR Avg: ${crAvg.toFixed(2)}:1 (Worst: ${crWorst.toFixed(2)}:1) -> ${crAvg >= 4.5 ? 'PASS' : 'FAIL'}`);
        results[vp.w].hero.push({ name: el.name, crAvg, crWorst, pass: crAvg >= 4.5 });
      }
    }

    // --- SERVICES SECTION ---
    const svcSlide = page.locator('#slide-0');
    await svcSlide.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const svcBox = await svcSlide.boundingBox();

    const svcElements = [
      { name: 'Services Heading', sel: '#slide-0 h3', fg: [251, 250, 247] },
      { name: 'Services Desc', sel: '#slide-0 p', fg: [237, 232, 221] },
      { name: 'Services Report', sel: '#slide-0 .border-t span', fg: [237, 232, 221] },
      { name: 'Services Link', sel: '#slide-0 .border-t a', fg: [237, 232, 221] },
    ];

    const svcBoxes = [];
    for (const el of svcElements) {
      const loc = page.locator(el.sel);
      if (await loc.count() > 0) {
        const box = await loc.first().boundingBox();
        svcBoxes.push({ ...el, box });
      }
    }

    // Hide text in slide 0
    await page.evaluate(() => {
      const textEls = document.querySelectorAll('#slide-0 h3, #slide-0 p, #slide-0 span, #slide-0 a');
      textEls.forEach(el => (el.style.visibility = 'hidden'));
    });
    await page.waitForTimeout(200);

    const svcBgBuffer = await svcSlide.screenshot();
    const svcMeta = await sharp(svcBgBuffer).metadata();

    await page.evaluate(() => {
      const textEls = document.querySelectorAll('#slide-0 h3, #slide-0 p, #slide-0 span, #slide-0 a');
      textEls.forEach(el => (el.style.visibility = ''));
    });

    console.log('\n--- SERVICES (PRACTICE 01) CONTRAST RATIOS ---');
    for (const el of svcBoxes) {
      if (!el.box || !svcBox) continue;
      const { avgBg, brightestBg } = await analyzeRegion(svcBgBuffer, svcMeta.width, svcMeta.height, el.box, svcBox);
      const crAvg = contrastRatio(el.fg, avgBg);
      const crWorst = contrastRatio(el.fg, brightestBg);
      console.log(`  ${el.name.padEnd(22)} | FG: ${JSON.stringify(el.fg)} on BG avg ${JSON.stringify(avgBg)} | CR Avg: ${crAvg.toFixed(2)}:1 (Worst: ${crWorst.toFixed(2)}:1) -> ${crAvg >= 4.5 ? 'PASS' : 'FAIL'}`);
      results[vp.w].services.push({ name: el.name, crAvg, crWorst, pass: crAvg >= 4.5 });
    }

    await page.close();
  }

  await browser.close();
}

run().catch(console.error);

