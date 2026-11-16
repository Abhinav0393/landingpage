import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * RIVORA — Six Distinct, Creative Practice Slide Backgrounds
 *
 * Each slide is built from 4 distinct code-generated layers:
 * 1. Base gradient with a distinct tonal tint:
 *    - 01 Due Diligence: Cool Cobalt / Cadastral Navy (#08101E -> #1B3660)
 *    - 02 Pre-Litigation: Warm Terracotta / Umber Ink (#1A0C08 -> #52271A)
 *    - 03 Documentation: Deep Emerald / Parchment Ink (#081712 -> #1D3D31)
 *    - 04 Institutional: Deep Bronze / Architectural Amber (#171410 -> #453A2A)
 *    - 05 Contract Drafting: Royal Amethyst / Midnight Violet Ink (#140A1C -> #3D1E56)
 *    - 06 Litigation Support: Neoclassical Midnight / Radiant High Court Sunbeams (#090E17 -> #22334F)
 * 2. Fine pattern (cadastral coordinates, case-bundle grain, paper weave, architectural CAD grid, clause columns, monumental ashlar stone).
 * 3. Hero motif on the motif side (survey plots & compass; fanned notices & brass magnifier; registered deed with wax seal & ribbon; architectural tower elevation; clause hierarchy & fountain pen flourish; neoclassical court facade, gavel & radiant scales).
 * 4. Soft vignette/light (left calm gradient for readable copy, warm gold glow on the motif).
 *
 * Masters are 1440 x 700 PNGs saved to `src/assets/images/`.
 */

const WIDTH = 1440;
const HEIGHT = 700;
const OUT_DIR = path.resolve('src/assets/images');

const GOLD = '#A98A50';
const GOLD_LIGHT = '#C9AE74';
const GOLD_BRIGHT = '#E5C378';
const IVORY = '#EDE8DD';
const IVORY_SOFT = '#D5D0C6';

function doc(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${body}</svg>`;
}

/* ================================================================== */
/* 01 - DUE DILIGENCE: Cool Cobalt/Navy, cadastral contours, plots, compass */
/* ================================================================== */
function art01() {
  const defs = `
    <defs>
      <linearGradient id="base01" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#070C15"/>
        <stop offset="40%" stop-color="#0B1424"/>
        <stop offset="70%" stop-color="#122544"/>
        <stop offset="100%" stop-color="#1B3660"/>
      </linearGradient>
      <radialGradient id="glow01" cx="0.82" cy="0.42" r="0.6">
        <stop offset="0%" stop-color="#4A90E2" stop-opacity="0.38"/>
        <stop offset="40%" stop-color="#A98A50" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#0B1424" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm01" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#070C15" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#070C15" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#070C15" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#070C15" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#070C15" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette01" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#070C15" stop-opacity="0"/>
        <stop offset="100%" stop-color="#070C15" stop-opacity="0.75"/>
      </radialGradient>
      <pattern id="coordGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="0.9" fill="#7593B0" opacity="0.35"/>
        <line x1="18" y1="20" x2="22" y2="20" stroke="#7593B0" stroke-width="0.7" opacity="0.4"/>
        <line x1="20" y1="18" x2="20" y2="22" stroke="#7593B0" stroke-width="0.7" opacity="0.4"/>
      </pattern>
    </defs>`;

  const contours = [];
  for (let i = 0; i < 12; i++) {
    const rx = 140 + i * 44;
    const ry = 90 + i * 30;
    contours.push(`
      <ellipse cx="1060" cy="340" rx="${rx}" ry="${ry}" fill="none" stroke="#688BA8" stroke-width="${i === 0 ? 1.5 : 1}" stroke-opacity="${i === 0 ? 0.45 : 0.2 + (i % 3) * 0.05}" stroke-dasharray="${i % 2 === 0 ? 'none' : '6 4'}"/>
    `);
  }

  const parcels = `
    <g fill="#142848" fill-opacity="0.55" stroke="#D4AF37" stroke-width="2" stroke-linejoin="round">
      <polygon points="760,180 980,150 1060,310 910,410 770,330"/>
      <polygon points="980,150 1190,135 1270,270 1140,350 1060,310"/>
      <polygon points="770,330 910,410 870,550 720,520"/>
      <polygon points="910,410 1060,310 1210,390 1130,540 870,550"/>
      <polygon points="1060,310 1270,270 1330,420 1210,390"/>
    </g>
    <g stroke="#7FB5E3" stroke-width="1.2" stroke-opacity="0.4" stroke-dasharray="4 6">
      <line x1="760" y1="180" x2="1060" y2="310"/>
      <line x1="980" y1="150" x2="910" y2="410"/>
      <line x1="770" y1="330" x2="1140" y2="350"/>
      <line x1="910" y1="410" x2="1270" y2="270"/>
    </g>
    <g font-family="monospace, sans-serif" font-size="11" font-weight="bold" fill="#EDE8DD" text-anchor="middle" fill-opacity="0.9">
      <text x="890" y="275">PLOT 41</text>
      <text x="1115" y="240">PLOT 42</text>
      <text x="825" y="445">PLOT 43</text>
      <text x="1035" y="445">PLOT 44</text>
      <text x="1220" y="350">PLOT 45</text>
    </g>
  `;

  const pins = [
    [760, 180], [980, 150], [1060, 310], [910, 410], [770, 330],
    [1190, 135], [1270, 270], [1140, 350], [870, 550], [720, 520],
    [1210, 390], [1130, 540], [1330, 420]
  ].map(([x, y]) => `
    <g stroke="#E5C378" stroke-width="1.2">
      <circle cx="${x}" cy="${y}" r="8" fill="none" stroke-opacity="0.75"/>
      <circle cx="${x}" cy="${y}" r="3" fill="#D4AF37"/>
      <line x1="${x - 12}" y1="${y}" x2="${x + 12}" y2="${y}" stroke-opacity="0.6"/>
      <line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y + 12}" stroke-opacity="0.6"/>
    </g>
  `).join('');

  const compass = `
    <g transform="translate(1310 130)" stroke="#D4AF37" fill="none">
      <circle cx="0" cy="0" r="38" stroke-width="1.5" stroke-opacity="0.5"/>
      <circle cx="0" cy="0" r="26" stroke-width="0.8" stroke-opacity="0.35"/>
      <polygon points="0,-46 -7,-12 0,0" fill="#D4AF37" stroke="none"/>
      <polygon points="0,-46 7,-12 0,0" fill="#EDE8DD" stroke="none"/>
      <polygon points="0,46 -7,12 0,0" fill="#7593B0" stroke="none" opacity="0.6"/>
      <polygon points="0,46 7,12 0,0" fill="#142136" stroke="none"/>
      <polygon points="46,0 12,-7 0,0" fill="#D4AF37" opacity="0.8" stroke="none"/>
      <polygon points="-46,0 -12,-7 0,0" fill="#7593B0" opacity="0.6" stroke="none"/>
      <text x="0" y="-52" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#E5C378" letter-spacing="2">N</text>
      <text x="56" y="4" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#7593B0">E</text>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base01)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow01)"/>
    <rect x="700" y="40" width="720" height="620" fill="url(#coordGrid)"/>
    <g>${contours.join('')}</g>
    ${parcels}
    ${pins}
    ${compass}
    <text x="760" y="650" fill="#EDE8DD" opacity="0.85" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">CADASTRAL SURVEY RECORD // SURVEY REF NO. 842-MH</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm01)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette01)"/>
  `);
}

/* ================================================================== */
/* 02 - PRE-LITIGATION: Warm Terracotta/Umber, dispute notices, magnifier */
/* ================================================================== */
function art02() {
  const defs = `
    <defs>
      <linearGradient id="base02" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#140A07"/>
        <stop offset="40%" stop-color="#24120C"/>
        <stop offset="70%" stop-color="#3D1D13"/>
        <stop offset="100%" stop-color="#55281A"/>
      </linearGradient>
      <radialGradient id="glow02" cx="0.8" cy="0.4" r="0.6">
        <stop offset="0%" stop-color="#E06A3B" stop-opacity="0.36"/>
        <stop offset="45%" stop-color="#C9AE74" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#24120C" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm02" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#140A07" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#140A07" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#140A07" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#140A07" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#140A07" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette02" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#140A07" stop-opacity="0"/>
        <stop offset="100%" stop-color="#140A07" stop-opacity="0.75"/>
      </radialGradient>
      <radialGradient id="magnifierGlow" cx="0.45" cy="0.45" r="0.55">
        <stop offset="0%" stop-color="#FFF9E6" stop-opacity="0.4"/>
        <stop offset="60%" stop-color="#E5C378" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#2A1B14" stop-opacity="0.2"/>
      </radialGradient>
    </defs>`;

  const documents = `
    <g transform="translate(820 110) rotate(-6)">
      <rect x="0" y="0" width="340" height="460" rx="4" fill="#201511" stroke="#A98A50" stroke-width="1.5" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.6))"/>
      <rect x="25" y="30" width="290" height="20" fill="#A98A50" fill-opacity="0.25"/>
      ${Array.from({length: 14}).map((_, i) => `
        <line x1="25" y1="${75 + i * 24}" x2="${i % 3 === 0 ? 220 : 315}" y2="${75 + i * 24}" stroke="#EDE8DD" stroke-width="1.8" stroke-opacity="0.3"/>
      `).join('')}
    </g>

    <g transform="translate(890 90) rotate(5)">
      <rect x="0" y="0" width="360" height="490" rx="4" fill="#2A1913" stroke="#D4AF37" stroke-width="2"/>
      <g stroke="#C0392B" stroke-width="2" fill="none">
        <rect x="30" y="30" width="130" height="34" rx="2" stroke-width="2"/>
        <text x="95" y="52" fill="#C0392B" stroke="none" font-family="'Times New Roman', serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">LEGAL NOTICE</text>
      </g>
      <text x="30" y="100" fill="#EDE8DD" font-family="'Times New Roman', Georgia, serif" font-size="13" font-weight="bold" letter-spacing="1">RE: PRE-ACTION NOTICE &amp; CEASE DESIST</text>
      <line x1="30" y1="112" x2="330" y2="112" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.6"/>
      ${Array.from({length: 13}).map((_, i) => `
        <line x1="30" y1="${135 + i * 24}" x2="${i === 4 ? 200 : (i === 9 ? 180 : 330)}" y2="${135 + i * 24}" stroke="#EDE8DD" stroke-width="1.8" stroke-opacity="0.45"/>
      `).join('')}
      <line x1="30" y1="231" x2="280" y2="231" stroke="#E74C3C" stroke-width="3" stroke-opacity="0.8"/>
      <line x1="30" y1="303" x2="310" y2="303" stroke="#E74C3C" stroke-width="3" stroke-opacity="0.8"/>
    </g>
  `;

  const magnifier = `
    <g transform="translate(1080 340)">
      <rect x="100" y="100" width="22" height="130" rx="8" transform="rotate(45 100 100)" fill="#5A3A1F" stroke="#E5C378" stroke-width="2"/>
      <circle cx="100" cy="100" r="105" fill="none" stroke="#D4AF37" stroke-width="10"/>
      <circle cx="100" cy="100" r="100" fill="none" stroke="#FFF2B8" stroke-width="2"/>
      <circle cx="100" cy="100" r="95" fill="url(#magnifierGlow)"/>
      <g transform="translate(45 55) scale(1.35)">
        <text x="0" y="24" fill="#FFEDB3" font-family="'Times New Roman', serif" font-size="15" font-weight="bold">TITLE DEFECT</text>
        <line x1="0" y1="32" x2="80" y2="32" stroke="#E74C3C" stroke-width="2.5"/>
        <line x1="0" y1="46" x2="70" y2="46" stroke="#EDE8DD" stroke-width="1.5"/>
      </g>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base02)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow02)"/>
    ${documents}
    ${magnifier}
    <text x="760" y="650" fill="#E5C378" opacity="0.85" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">PRE-LITIGATION AUDIT // FORMAL STATUTORY NOTICE</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm02)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette02)"/>
  `);
}

/* ================================================================== */
/* 03 - DOCUMENTATION: Deep Emerald/Parchment, deed folio, wax seal */
/* ================================================================== */
function art03() {
  const defs = `
    <defs>
      <linearGradient id="base03" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#06120E"/>
        <stop offset="40%" stop-color="#0E211A"/>
        <stop offset="70%" stop-color="#15362B"/>
        <stop offset="100%" stop-color="#1E4D3D"/>
      </linearGradient>
      <radialGradient id="glow03" cx="0.8" cy="0.4" r="0.6">
        <stop offset="0%" stop-color="#2ECC71" stop-opacity="0.25"/>
        <stop offset="45%" stop-color="#F1C40F" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#0E211A" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm03" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#06120E" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#06120E" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#06120E" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#06120E" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#06120E" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette03" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#06120E" stop-opacity="0"/>
        <stop offset="100%" stop-color="#06120E" stop-opacity="0.75"/>
      </radialGradient>
      <radialGradient id="waxSeal03" cx="0.45" cy="0.45" r="0.55">
        <stop offset="0%" stop-color="#E74C3C"/>
        <stop offset="55%" stop-color="#A91B0D"/>
        <stop offset="100%" stop-color="#5B0D05"/>
      </radialGradient>
      <pattern id="paperGuilloche" width="48" height="48" patternUnits="userSpaceOnUse">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#2ECC71" stroke-width="0.6" stroke-opacity="0.12"/>
        <circle cx="24" cy="24" r="14" fill="none" stroke="#D4AF37" stroke-width="0.6" stroke-opacity="0.12"/>
      </pattern>
    </defs>`;

  const deedFolio = `
    <g transform="translate(830 80)">
      <rect x="0" y="0" width="440" height="540" rx="6" fill="#14261E" stroke="#D4AF37" stroke-width="2.5" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.7))"/>
      <rect x="18" y="18" width="404" height="504" rx="3" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.6"/>
      <rect x="24" y="24" width="392" height="492" rx="2" fill="none" stroke="#2ECC71" stroke-width="0.8" stroke-opacity="0.3"/>
      
      <g transform="translate(50 45)">
        <text x="170" y="30" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="bold" fill="#EDE8DD" letter-spacing="3">CONVEYANCE DEED</text>
        <line x1="50" y1="45" x2="290" y2="45" stroke="#D4AF37" stroke-width="1.5"/>
        <text x="170" y="65" text-anchor="middle" font-family="monospace, sans-serif" font-size="9" fill="#D4AF37" letter-spacing="2">REGISTERED UNDER SECTION 17 OF REGISTRATION ACT</text>
      </g>

      ${Array.from({length: 11}).map((_, i) => `
        <line x1="50" y1="${155 + i * 26}" x2="${i === 10 ? 250 : 390}" y2="${155 + i * 26}" stroke="#EDE8DD" stroke-width="1.5" stroke-opacity="0.45"/>
      `).join('')}

      <path d="M 60 480 Q 90 440 140 460 T 210 470 T 280 440" fill="none" stroke="#EDE8DD" stroke-width="2" stroke-linecap="round" opacity="0.65"/>
      <text x="60" y="502" font-family="sans-serif" font-size="8" fill="#D4AF37" letter-spacing="1.5">SIGNATURE OF TRANSFEROR &amp; ADVOCATE ATTESTATION</text>

      <g transform="translate(340 455)">
        <polygon points="-8,-40 -18,40 -2,25" fill="#A91B0D" opacity="0.85"/>
        <polygon points="8,-40 18,40 2,25" fill="#871408" opacity="0.85"/>
        <circle cx="0" cy="0" r="34" fill="url(#waxSeal03)" stroke="#D4AF37" stroke-width="2"/>
        <circle cx="0" cy="0" r="26" fill="none" stroke="#EDE8DD" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"/>
        <text x="0" y="5" text-anchor="middle" font-family="'Times New Roman', serif" font-size="14" font-weight="bold" fill="#EDE8DD" letter-spacing="1">SEAL</text>
      </g>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base03)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow03)"/>
    <rect x="700" y="40" width="720" height="620" fill="url(#paperGuilloche)"/>
    ${deedFolio}
    <text x="760" y="650" fill="#2ECC71" opacity="0.85" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">TITLE DOCUMENTATION // SEALED CONVEYANCE DEED</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm03)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette03)"/>
  `);
}

/* ================================================================== */
/* 04 - INSTITUTIONAL: Deep Bronze/Amber, architectural CAD elevation */
/* ================================================================== */
function art04() {
  const defs = `
    <defs>
      <linearGradient id="base04" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#14100A"/>
        <stop offset="40%" stop-color="#241C12"/>
        <stop offset="70%" stop-color="#3B2E1C"/>
        <stop offset="100%" stop-color="#554228"/>
      </linearGradient>
      <radialGradient id="glow04" cx="0.8" cy="0.38" r="0.6">
        <stop offset="0%" stop-color="#F39C12" stop-opacity="0.36"/>
        <stop offset="45%" stop-color="#D4AF37" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#241C12" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm04" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#14100A" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#14100A" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#14100A" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#14100A" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#14100A" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette04" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#14100A" stop-opacity="0"/>
        <stop offset="100%" stop-color="#14100A" stop-opacity="0.75"/>
      </radialGradient>
      <pattern id="cadGrid" width="30" height="30" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#E5C378" stroke-width="0.6" opacity="0.18"/>
        <line x1="0" y1="0" x2="0" y2="30" stroke="#E5C378" stroke-width="0.6" opacity="0.18"/>
      </pattern>
    </defs>`;

  const towerElevation = `
    <g transform="translate(860 110)">
      <rect x="120" y="0" width="340" height="490" fill="#20180F" fill-opacity="0.85" stroke="#E5C378" stroke-width="2.5"/>
      
      ${Array.from({length: 12}).map((_, i) => `
        <line x1="120" y1="${40 + i * 37}" x2="460" y2="${40 + i * 37}" stroke="#D4AF37" stroke-width="1.4" stroke-opacity="0.55"/>
      `).join('')}

      ${Array.from({length: 8}).map((_, i) => `
        <line x1="${162 + i * 38}" y1="0" x2="${162 + i * 38}" y2="490" stroke="#EDE8DD" stroke-width="1" stroke-opacity="0.25"/>
      `).join('')}

      <rect x="200" y="77" width="38" height="37" fill="#E5C378" fill-opacity="0.45"/>
      <rect x="276" y="151" width="38" height="37" fill="#E5C378" fill-opacity="0.4"/>
      <rect x="352" y="225" width="38" height="37" fill="#E5C378" fill-opacity="0.5"/>
      <rect x="238" y="299" width="38" height="37" fill="#E5C378" fill-opacity="0.35"/>

      <g stroke="#E5C378" stroke-width="1.2" stroke-opacity="0.85" font-family="monospace, sans-serif" font-size="10" fill="#E5C378">
        <line x1="90" y1="0" x2="90" y2="490"/>
        <line x1="80" y1="0" x2="100" y2="0"/>
        <line x1="80" y1="490" x2="100" y2="490"/>
        <text x="60" y="250" transform="rotate(-90 60 250)" text-anchor="middle" letter-spacing="1">128.50 M</text>
        <line x1="120" y1="515" x2="460" y2="515"/>
        <line x1="120" y1="505" x2="120" y2="525"/>
        <line x1="460" y1="505" x2="460" y2="525"/>
        <text x="290" y="535" text-anchor="middle" letter-spacing="1">74.20 M</text>
      </g>
    </g>

    <g stroke="#E5C378" stroke-width="1.4" stroke-opacity="0.4" fill="none">
      <line x1="720" y1="700" x2="1140" y2="540"/>
      <line x1="840" y1="700" x2="1170" y2="540"/>
      <line x1="980" y1="700" x2="1200" y2="540"/>
      <line x1="1140" y1="700" x2="1230" y2="540"/>
      <line x1="1300" y1="700" x2="1260" y2="540"/>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base04)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow04)"/>
    <rect x="700" y="40" width="720" height="620" fill="url(#cadGrid)"/>
    ${towerElevation}
    <text x="760" y="650" fill="#E5C378" opacity="0.9" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">INSTITUTIONAL ACQUISITIONS // STRUCTURAL CAD SCHEMATIC</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm04)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette04)"/>
  `);
}

/* ================================================================== */
/* 05 - CONTRACT DRAFTING: Royal Amethyst / Midnight Violet, clauses, pen */
/* ================================================================== */
function art05() {
  const defs = `
    <defs>
      <linearGradient id="base05" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#120819"/>
        <stop offset="40%" stop-color="#210F2E"/>
        <stop offset="70%" stop-color="#36174D"/>
        <stop offset="100%" stop-color="#4F216E"/>
      </linearGradient>
      <radialGradient id="glow05" cx="0.75" cy="0.45" r="0.6">
        <stop offset="0%" stop-color="#9B59B6" stop-opacity="0.35"/>
        <stop offset="40%" stop-color="#C9AE74" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#210F2E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm05" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#120819" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#120819" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#120819" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#120819" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#120819" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette05" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#120819" stop-opacity="0"/>
        <stop offset="100%" stop-color="#120819" stop-opacity="0.75"/>
      </radialGradient>
      <pattern id="clauseLines" width="40" height="18" patternUnits="userSpaceOnUse">
        <line x1="0" y1="18" x2="40" y2="18" stroke="#D7BDE2" stroke-width="0.6" opacity="0.18"/>
      </pattern>
    </defs>`;

  const clauseMarkup = `
    <g transform="translate(760 120)">
      <g>
        <text x="0" y="24" font-family="'Times New Roman', Georgia, serif" font-size="14" font-weight="bold" fill="#D4AF37" letter-spacing="1.5">SECTION 12.0 // INDEMNIFICATION &amp; TITLE WARRANTIES</text>
        <line x1="0" y1="36" x2="480" y2="36" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.7"/>
        
        <g transform="translate(20 60)">
          <text x="0" y="16" font-family="monospace, sans-serif" font-size="11" font-weight="bold" fill="#EDE8DD">12.1 [REPRESENTATIONS &amp; WARRANTIES]</text>
          <line x1="0" y1="32" x2="440" y2="32" stroke="#EDE8DD" stroke-width="1.4" stroke-opacity="0.35"/>
          <line x1="0" y1="48" x2="410" y2="48" stroke="#EDE8DD" stroke-width="1.2" stroke-opacity="0.25"/>
          <path d="M 450 16 L 460 16 L 460 48 L 450 48" stroke="#D4AF37" stroke-width="1.8" fill="none" stroke-opacity="0.9"/>
        </g>

        <g transform="translate(20 130)">
          <text x="0" y="16" font-family="monospace, sans-serif" font-size="11" font-weight="bold" fill="#EDE8DD">12.2 [COVENANTS OF QUIET ENJOYMENT]</text>
          <line x1="0" y1="32" x2="440" y2="32" stroke="#EDE8DD" stroke-width="1.4" stroke-opacity="0.35"/>
          <line x1="0" y1="48" x2="380" y2="48" stroke="#EDE8DD" stroke-width="1.2" stroke-opacity="0.25"/>
          <line x1="0" y1="64" x2="420" y2="64" stroke="#EDE8DD" stroke-width="1.2" stroke-opacity="0.25"/>
        </g>
      </g>

      <g transform="translate(0 240)">
        <text x="0" y="24" font-family="'Times New Roman', Georgia, serif" font-size="14" font-weight="bold" fill="#D4AF37" letter-spacing="1.5">SECTION 13.0 // DISPUTE RESOLUTION &amp; JURISDICTION</text>
        <line x1="0" y1="36" x2="480" y2="36" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.7"/>
        <g transform="translate(20 60)">
          <text x="0" y="16" font-family="monospace, sans-serif" font-size="11" font-weight="bold" fill="#EDE8DD">13.1 [ARBITRATION IN MUMBAI]</text>
          <line x1="0" y1="32" x2="430" y2="32" stroke="#EDE8DD" stroke-width="1.4" stroke-opacity="0.35"/>
          <line x1="0" y1="48" x2="350" y2="48" stroke="#EDE8DD" stroke-width="1.2" stroke-opacity="0.25"/>
        </g>
      </g>

      <g transform="translate(0 380)">
        <line x1="20" y1="40" x2="280" y2="40" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.8"/>
        <text x="20" y="58" font-family="sans-serif" font-size="9" fill="#EDE8DD" opacity="0.75">AUTHORIZED SIGNATORY // ADVOCATE COUNSEL</text>
        <path d="M 30 30 C 70 0, 110 50, 150 20 S 210 10, 240 34 S 270 30, 290 8" fill="none" stroke="#E5C378" stroke-width="3" stroke-linecap="round"/>
        <g transform="translate(290 8) rotate(-45)">
          <polygon points="0,-24 8,0 0,16 -8,0" fill="#E5C378" stroke="#120819" stroke-width="1.2"/>
          <line x1="0" y1="-24" x2="0" y2="4" stroke="#120819" stroke-width="1.5"/>
          <circle cx="0" cy="4" r="1.8" fill="#120819"/>
        </g>
      </g>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base05)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow05)"/>
    <rect x="720" y="40" width="700" height="620" fill="url(#clauseLines)"/>
    ${clauseMarkup}
    <text x="760" y="650" fill="#D7BDE2" opacity="0.85" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">CONTRACTUAL RISK FRAMEWORK // DRAFT COVENANTS</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm05)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette05)"/>
  `);
}

/* ================================================================== */
/* 06 - LITIGATION SUPPORT: Neoclassical Midnight, Court facade, radiant sunbeams */
/* ================================================================== */
function art06() {
  const defs = `
    <defs>
      <linearGradient id="base06" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="#080C14"/>
        <stop offset="40%" stop-color="#111B2C"/>
        <stop offset="70%" stop-color="#1B2B47"/>
        <stop offset="100%" stop-color="#283F66"/>
      </linearGradient>
      <radialGradient id="glow06" cx="0.8" cy="0.32" r="0.65">
        <stop offset="0%" stop-color="#FFD700" stop-opacity="0.45"/>
        <stop offset="35%" stop-color="#E5C378" stop-opacity="0.25"/>
        <stop offset="75%" stop-color="#1B2B47" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#111B2C" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="calm06" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#080C14" stop-opacity="0.95"/>
        <stop offset="38%" stop-color="#080C14" stop-opacity="0.84"/>
        <stop offset="52%" stop-color="#080C14" stop-opacity="0.36"/>
        <stop offset="65%" stop-color="#080C14" stop-opacity="0.06"/>
        <stop offset="72%" stop-color="#080C14" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette06" cx="0.5" cy="0.5" r="0.8">
        <stop offset="50%" stop-color="#080C14" stop-opacity="0"/>
        <stop offset="100%" stop-color="#080C14" stop-opacity="0.75"/>
      </radialGradient>
      <linearGradient id="sunbeam" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stop-color="#FFD700" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
      </linearGradient>
    </defs>`;

  const sunbeams = `
    <g fill="url(#sunbeam)">
      <polygon points="1120,40 1020,700 1080,700"/>
      <polygon points="1150,40 1140,700 1210,700"/>
      <polygon points="1180,40 1260,700 1330,700"/>
      <polygon points="1100,40 900,700 960,700"/>
      <polygon points="1200,40 1370,700 1440,700"/>
    </g>
  `;

  const courthouse = `
    <g transform="translate(800 80)">
      <polygon points="340,60 120,150 560,150" fill="#141E2F" stroke="#E5C378" stroke-width="2.5"/>
      <polygon points="340,85 160,145 520,145" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.6"/>
      <rect x="110" y="150" width="460" height="26" fill="#1B283E" stroke="#E5C378" stroke-width="2"/>
      <text x="340" y="168" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-size="12" font-weight="bold" fill="#EDE8DD" letter-spacing="4">JUSTITIA VINCIT</text>

      ${[160, 230, 300, 370, 440, 510].map(x => `
        <rect x="${x - 12}" y="176" width="24" height="260" fill="#172337" stroke="#D4AF37" stroke-width="1.5"/>
        <line x1="${x - 6}" y1="184" x2="${x - 6}" y2="428" stroke="#EDE8DD" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="${x}" y1="184" x2="${x}" y2="428" stroke="#FFD700" stroke-width="1" stroke-opacity="0.4"/>
        <line x1="${x + 6}" y1="184" x2="${x + 6}" y2="428" stroke="#EDE8DD" stroke-width="1" stroke-opacity="0.3"/>
      `).join('')}

      <rect x="90" y="436" width="500" height="30" fill="#1B283E" stroke="#E5C378" stroke-width="2"/>
      <rect x="70" y="466" width="540" height="20" fill="#141E2F" stroke="#D4AF37" stroke-width="1.5"/>
    </g>
  `;

  const gavelAndSoundblock = `
    <g transform="translate(1080 390)">
      <ellipse cx="60" cy="140" rx="90" ry="28" fill="#141E2F" stroke="#E5C378" stroke-width="3"/>
      <ellipse cx="60" cy="130" rx="84" ry="24" fill="#202F49" stroke="#FFD700" stroke-width="1.5"/>
      <g transform="translate(60 110) rotate(-22)">
        <rect x="-85" y="-18" width="130" height="36" rx="6" fill="#2B1A0F" stroke="#E5C378" stroke-width="2.5"/>
        <line x1="-80" y1="0" x2="40" y2="0" stroke="#FFD700" stroke-width="1.5" stroke-opacity="0.8"/>
        <rect x="-95" y="-24" width="16" height="48" rx="4" fill="#3D2616" stroke="#FFD700" stroke-width="2"/>
        <rect x="40" y="-24" width="16" height="48" rx="4" fill="#3D2616" stroke="#FFD700" stroke-width="2"/>
        <rect x="-24" y="-8" width="170" height="16" rx="8" transform="rotate(78 -24 -8)" fill="#5A3820" stroke="#E5C378" stroke-width="2"/>
      </g>
    </g>
  `;

  return doc(`
    ${defs}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base06)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow06)"/>
    ${sunbeams}
    ${courthouse}
    ${gavelAndSoundblock}
    <text x="760" y="650" fill="#FFD700" opacity="0.9" font-family="monospace, sans-serif" font-size="11" letter-spacing="2">LITIGATION &amp; DISPUTE ADVOCACY // HIGH COURT BENCH</text>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#calm06)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette06)"/>
  `);
}

async function main() {
  console.log('Generating 6 distinct practice artworks...');
  const arts = [
    { name: 'practice-01.png', fn: art01 },
    { name: 'practice-02.png', fn: art02 },
    { name: 'practice-03.png', fn: art03 },
    { name: 'practice-04.png', fn: art04 },
    { name: 'practice-05.png', fn: art05 },
    { name: 'practice-06.png', fn: art06 },
  ];

  for (const art of arts) {
    const svgStr = art.fn();
    const outPath = path.join(OUT_DIR, art.name);
    await sharp(Buffer.from(svgStr)).png().toFile(outPath);
    console.log(`Generated ${art.name}`);
  }

  console.log('Done generating practice art masters.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
