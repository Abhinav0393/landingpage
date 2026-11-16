import { chromium } from '@playwright/test';

async function testFold() {
  const browser = await chromium.launch({ headless: true });
  for (const [w, h] of [[1440, 800], [1366, 768]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
    const foldY = h;
    const badge = await page.locator('#hero .stagger-1').boundingBox();
    const h1 = await page.locator('#hero h1').boundingBox();
    const p = await page.locator('#hero p').boundingBox();
    const btn1 = await page.locator("#hero a[href='#contact']").boundingBox();
    const btn2 = await page.locator("#hero a[href='#services']").boundingBox();
    console.log(`Viewport ${w}x${h} (Fold at ${foldY}px):`);
    console.log('  Badge bottom:', badge.y + badge.height);
    console.log('  H1 bottom:', h1.y + h1.height);
    console.log('  P bottom:', p.y + p.height);
    console.log('  Btn1 bottom:', btn1.y + btn1.height);
    console.log('  Btn2 bottom:', btn2.y + btn2.height);
    const maxBottom = Math.max(badge.y + badge.height, h1.y + h1.height, p.y + p.height, btn1.y + btn1.height, btn2.y + btn2.height);
    console.log('  All above fold:', maxBottom < foldY, `(${foldY - maxBottom}px clearance)`);
  }
  await browser.close();
}
testFold();

