import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicImagesDir = path.resolve('public/images');
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Clean up any old upscale variants
const oldUpscales = [
  'hero-1920.avif', 'hero-1920.webp', 'hero-1920.jpg',
  'hero-2400.avif', 'hero-2400.webp', 'hero-2400.jpg',
  'hero-1600.avif', 'hero-1600.webp', 'hero-1600.jpg'
];
for (const f of oldUpscales) {
  const p = path.join(publicImagesDir, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Removed old variant: ${f}`);
  }
}

async function processHero() {
  const heroMasterPath = path.resolve('src/assets/images/hero_master.png');
  // Maximum width is capped strictly at the master image's native width: 1672
  const heroWidths = [640, 960, 1280, 1672];
  console.log('Generating Hero responsive images (capped at native 1672w) from:', heroMasterPath);

  // Mobile 16/10 crop from master (1505 x 941) centered on scales + house + books
  const mobileCrop = await sharp(heroMasterPath)
    .extract({ left: 100, top: 0, width: 1505, height: 941 })
    .toBuffer();

  await sharp(mobileCrop)
    .resize({ width: 640, height: 400, fit: 'cover' })
    .avif({ quality: 80, effort: 4 })
    .toFile(path.join(publicImagesDir, 'hero-mobile-640.avif'));

  await sharp(mobileCrop)
    .resize({ width: 640, height: 400, fit: 'cover' })
    .webp({ quality: 85, effort: 4 })
    .toFile(path.join(publicImagesDir, 'hero-mobile-640.webp'));

  await sharp(mobileCrop)
    .resize({ width: 640, height: 400, fit: 'cover' })
    .jpeg({ quality: 85, progressive: true })
    .toFile(path.join(publicImagesDir, 'hero-mobile-640.jpg'));

  for (const width of heroWidths) {
    // AVIF
    const avifDest = path.join(publicImagesDir, `hero-${width}.avif`);
    await sharp(heroMasterPath)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 80, effort: 4 })
      .toFile(avifDest);

    // WebP
    const webpDest = path.join(publicImagesDir, `hero-${width}.webp`);
    await sharp(heroMasterPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(webpDest);

    // JPEG
    const jpgDest = path.join(publicImagesDir, `hero-${width}.jpg`);
    await sharp(heroMasterPath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(jpgDest);

    const avifSize = (fs.statSync(avifDest).size / 1024).toFixed(1);
    const webpSize = (fs.statSync(webpDest).size / 1024).toFixed(1);
    const jpgSize = (fs.statSync(jpgDest).size / 1024).toFixed(1);
    console.log(`Hero ${width}w -> AVIF: ${avifSize} KB, WebP: ${webpSize} KB, JPG: ${jpgSize} KB`);
  }
}

async function processPracticeAreas() {
  const practiceWidths = [480, 768, 1100, 1440];
  for (let i = 1; i <= 6; i++) {
    const slug = `practice-0${i}`;
    const srcPath = path.resolve(`src/assets/images/${slug}.png`);
    console.log(`Generating ${slug} responsive images from:`, srcPath);

    // Mobile 16/9 crop from 1440x700 master (1244 x 700) centered on artwork motif
    const meta = await sharp(srcPath).metadata();
    const cropW = Math.min(meta.width, Math.round(meta.height * (16 / 9)));
    const cropLeft = Math.max(0, Math.round(meta.width - cropW));
    const mobileCrop = await sharp(srcPath)
      .extract({ left: cropLeft, top: 0, width: cropW, height: meta.height })
      .toBuffer();

    for (const [w, h] of [[480, 270], [768, 432]]) {
      await sharp(mobileCrop)
        .resize({ width: w, height: h, fit: 'cover' })
        .avif({ quality: 80, effort: 4 })
        .toFile(path.join(publicImagesDir, `${slug}-mobile-${w}.avif`));

      await sharp(mobileCrop)
        .resize({ width: w, height: h, fit: 'cover' })
        .webp({ quality: 85, effort: 4 })
        .toFile(path.join(publicImagesDir, `${slug}-mobile-${w}.webp`));

      await sharp(mobileCrop)
        .resize({ width: w, height: h, fit: 'cover' })
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(publicImagesDir, `${slug}-mobile-${w}.jpg`));
    }

    for (const width of practiceWidths) {
      // AVIF
      const avifDest = path.join(publicImagesDir, `${slug}-${width}.avif`);
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toFile(avifDest);

      // WebP
      const webpDest = path.join(publicImagesDir, `${slug}-${width}.webp`);
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(webpDest);

      // JPG
      const jpgDest = path.join(publicImagesDir, `${slug}-${width}.jpg`);
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile(jpgDest);

      const avifSize = (fs.statSync(avifDest).size / 1024).toFixed(1);
      const webpSize = (fs.statSync(webpDest).size / 1024).toFixed(1);
      const jpgSize = (fs.statSync(jpgDest).size / 1024).toFixed(1);
      console.log(`${slug} ${width}w -> AVIF: ${avifSize} KB, WebP: ${webpSize} KB, JPG: ${jpgSize} KB`);
    }
  }
}

async function main() {
  await processHero();
  await processPracticeAreas();
  console.log('All responsive assets generated successfully in public/images/');
}

main().catch(console.error);
