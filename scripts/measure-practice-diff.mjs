import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'C:/Users/pagil/Downloads/rivora-website';
const SLIDES = [1, 2, 3, 4, 5, 6].map(i => path.join(ROOT, `src/assets/images/practice-0${i}.png`));
const CONTACT_SHEET = path.join(ROOT, 'screenshots/practice-contact-sheet.png');

async function main() {
  console.log('Generating practice contact sheet and computing pairwise differences...');
  
  const cellWidth = 720;
  const cellHeight = 350;
  const sheetWidth = 1440;
  const sheetHeight = 1050;

  const resizedBuffers = await Promise.all(
    SLIDES.map(file => sharp(file).resize(cellWidth, cellHeight, { fit: 'cover' }).toBuffer())
  );

  const compositeList = resizedBuffers.map((buf, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    return {
      input: buf,
      left: col * cellWidth,
      top: row * cellHeight,
    };
  });

  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 16, g: 20, b: 28, alpha: 1 }
    }
  })
    .composite(compositeList)
    .png()
    .toFile(CONTACT_SHEET);

  console.log(`Saved contact sheet to ${CONTACT_SHEET}`);

  // Downscale each to 144x70 raw RGBA buffers
  const downscaled = await Promise.all(
    SLIDES.map(async file => {
      const { data, info } = await sharp(file)
        .resize(144, 70, { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { data, width: info.width, height: info.height };
    })
  );

  console.log('\n--- Pairwise Difference Matrix (15 Pairs) ---');
  let minArtDist = Infinity;
  let minArtMse = Infinity;
  let minOverallDist = Infinity;
  const results = [];

  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      const a = downscaled[i].data;
      const b = downscaled[j].data;
      const width = downscaled[i].width;
      const height = downscaled[i].height;

      let sumOverallDist = 0;
      let sumArtDist = 0;
      let sumArtSqDiff = 0;
      let artPixelCount = 0;
      let totalPixels = width * height;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const r1 = a[offset], g1 = a[offset + 1], b1 = a[offset + 2];
          const r2 = b[offset], g2 = b[offset + 1], b2 = b[offset + 2];

          const dr = r1 - r2;
          const dg = g1 - g2;
          const db = b1 - b2;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          sumOverallDist += dist;

          // Focus on right half (motif artwork area x >= 72 out of 144)
          if (x >= width * 0.45) {
            artPixelCount++;
            sumArtDist += dist;
            sumArtSqDiff += (dr * dr + dg * dg + db * db) / (3 * 255 * 255);
          }
        }
      }

      const meanOverallDist = sumOverallDist / totalPixels;
      const meanArtDist = sumArtDist / artPixelCount;
      const normalizedArtMse = sumArtSqDiff / artPixelCount;

      if (meanArtDist < minArtDist) minArtDist = meanArtDist;
      if (normalizedArtMse < minArtMse) minArtMse = normalizedArtMse;
      if (meanOverallDist < minOverallDist) minOverallDist = meanOverallDist;

      results.push({
        pair: `practice-0${i + 1} vs practice-0${j + 1}`,
        meanOverallDist: meanOverallDist.toFixed(2),
        meanArtDist: meanArtDist.toFixed(2),
        normalizedArtMse: normalizedArtMse.toFixed(4),
      });

      console.log(
        `practice-0${i + 1} vs practice-0${j + 1} -> Art Mean RGB Dist: ${meanArtDist.toFixed(2)}, Art MSE: ${normalizedArtMse.toFixed(4)} (Overall Dist: ${meanOverallDist.toFixed(2)})`
      );
    }
  }

  console.log(`\nMinimum Artwork Mean RGB Distance: ${minArtDist.toFixed(2)} (threshold >= 15.0)`);
  console.log(`Minimum Artwork Normalized MSE: ${minArtMse.toFixed(4)} (threshold >= 0.0050)`);
  console.log(`Minimum Overall Mean RGB Distance: ${minOverallDist.toFixed(2)}`);

  if (minArtDist < 15.0 || minArtMse < 0.0050) {
    console.error('FAIL: At least one pair of practice backgrounds is too similar in artwork area!');
    process.exit(1);
  } else {
    console.log('SUCCESS: All 15 pairs are distinct and pass uniqueness thresholds.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
