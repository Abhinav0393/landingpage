const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber,
  HeadingLevel, AlignmentType, PositionalTab, PositionalTabAlignment,
  PositionalTabRelativeTo, PositionalTabLeader, BorderStyle, ShadingType,
  InternalHyperlink, PageBreak, Table, TableRow, TableCell, WidthType
} = d;

const OUT_DIR = path.resolve(__dirname, 'outputs');
const OUT_DOCX = path.join(OUT_DIR, 'RIVORA_Website_Development_Specification.docx');
const OUT_PDF = path.join(OUT_DIR, 'RIVORA_Website_Development_Specification.pdf');
const CONTENT_SRC = path.resolve(__dirname, 'content.json');
const CONTENT_DST = path.join(OUT_DIR, 'rivora_source_content.json');

// Ensure output directories exist
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const rootOutputs = path.resolve(__dirname, '..', 'outputs');
if (!fs.existsSync(rootOutputs)) fs.mkdirSync(rootOutputs, { recursive: true });

// Pass 0: Ensure diagrams exist
const figs = ['build/fig_sections.png', 'build/fig_arch.png', 'build/fig_form.png'];
if (figs.some(f => !fs.existsSync(path.resolve(__dirname, f)))) {
  console.log('Generating missing diagrams via diagrams.py...');
  execSync('python diagrams.py', { cwd: __dirname, stdio: 'inherit' });
}

// Brand Colors & Constants
const C = {
  ink: '151922',
  gold: 'A98A50',
  ivory: 'EDE8DD',
  bg: 'FBFAF7',
  stone: 'F2EEE7',
  fg: '1A1E27',
  muted: '5C6370',
  border: 'E4DED3',
  goldInk: '77592A'
};
const FONT = 'Calibri';
const W = 9746; // Content width in DXA

function makeCoverPage() {
  const children = [];

  // Top spacing
  children.push(new Paragraph({ spacing: { before: 1200, after: 200 } }));

  // Practice category badge
  children.push(new Paragraph({
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: 'LAND & PROPERTY TITLE VERIFICATION PRACTICE',
        font: FONT,
        size: 20,
        bold: true,
        color: C.goldInk,
        characterSpacing: 60
      })
    ]
  }));

  // Main Document Title
  children.push(new Paragraph({
    spacing: { after: 240, line: 520 },
    children: [
      new TextRun({
        text: 'RIVORA',
        font: FONT,
        size: 56,
        bold: true,
        color: C.ink
      })
    ]
  }));

  children.push(new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [
      new TextRun({
        text: 'Complete Website Development Specification',
        font: FONT,
        size: 34,
        bold: true,
        color: C.ink
      })
    ]
  }));

  // Subtitle
  children.push(new Paragraph({
    spacing: { after: 400, line: 300 },
    children: [
      new TextRun({
        text: 'Cloud Coding Agent Handoff & Technical Implementation Blueprint',
        font: FONT,
        size: 24,
        color: C.goldInk,
        italics: true
      })
    ]
  }));

  // Decorative Accent Bar (Gold)
  children.push(new Paragraph({
    spacing: { after: 800 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 24, color: C.gold, space: 1 }
    }
  }));

  // Document Metadata Table (Ink & Ivory styling)
  const metaRows = [
    ['Document Version', '1.0 (Production Master Specification)'],
    ['Release Date', '10 November 2026'],
    ['Status', 'Draft for client approval — Safe for immediate Phase 1 execution'],
    ['Author & Architect', 'Claude (Anthropic), from supplied source package'],
    ['Target Practice', 'RIVORA (Advocate RK.V & Team) — Hyderabad, AP, New Delhi'],
    ['Target Deliverables', 'Single-Page Static Astro Site · Vanilla TS · Playwright E2E · Lighthouse 90+'],
    ['Source Authority', 'code.html (verbatim content), DESIGN.md (tokens), screen.png (composition)'],
  ];

  const cw = [2800, 6946];
  const trs = metaRows.map((r, ri) => new TableRow({
    children: [
      new TableCell({
        width: { size: cw[0], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: C.ivory },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: r[0], font: FONT, size: 19, bold: true, color: C.ink })]
          })
        ]
      }),
      new TableCell({
        width: { size: cw[1], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: (ri % 2 ? 'FAF8F3' : 'FFFFFF') },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: r[1], font: FONT, size: 19, color: C.fg })]
          })
        ]
      })
    ]
  }));

  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: cw,
    rows: trs
  }));

  // Bottom Notice
  children.push(new Paragraph({
    spacing: { before: 1400, after: 0 },
    children: [
      new TextRun({
        text: 'CONFIDENTIAL & PROPRIETARY — PREPARED EXCLUSIVELY FOR RIVORA LEGAL PRACTICE',
        font: FONT,
        size: 16,
        color: C.muted,
        characterSpacing: 40
      })
    ]
  }));

  return children;
}

function makeTocPage(tocItems, pageMap = {}) {
  const children = [];

  // TOC Title (not added to L.toc)
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 240, after: 160 },
    children: [
      new TextRun({
        text: 'Table of Contents',
        font: FONT,
        size: 34,
        bold: true,
        color: C.ink
      })
    ]
  }));

  children.push(new Paragraph({
    spacing: { after: 280, line: 260 },
    children: [
      new TextRun({
        text: 'This specification contains 33 structured chapters and 2 technical appendices detailing every aspect of the RIVORA website development and coding agent execution plan.',
        font: FONT,
        size: 20,
        color: C.muted
      })
    ]
  }));

  // Render each TOC line
  tocItems.forEach(item => {
    const pageNum = pageMap[item.id] !== undefined ? String(pageMap[item.id]) : '...';
    children.push(new Paragraph({
      spacing: { before: 35, after: 35, line: 240 },
      children: [
        new InternalHyperlink({
          anchor: item.id,
          children: [
            new TextRun({
              text: item.text,
              font: FONT,
              size: 19,
              color: C.ink
            })
          ]
        }),
        new PositionalTab({
          alignment: PositionalTabAlignment.RIGHT,
          relativeTo: PositionalTabRelativeTo.MARGIN,
          leader: PositionalTabLeader.DOT
        }),
        new InternalHyperlink({
          anchor: item.id,
          children: [
            new TextRun({
              text: pageNum,
              font: FONT,
              size: 19,
              bold: true,
              color: C.goldInk
            })
          ]
        })
      ]
    }));
  });

  return children;
}

function assembleDocument(tocItems, pageMap = {}) {
  // Fresh load of lib and parts to ensure pristine state
  delete require.cache[require.resolve('./lib.js')];
  delete require.cache[require.resolve('./part1.js')];
  delete require.cache[require.resolve('./part2.js')];
  delete require.cache[require.resolve('./part3a.js')];
  delete require.cache[require.resolve('./part3b.js')];
  delete require.cache[require.resolve('./part4a.js')];
  delete require.cache[require.resolve('./part4b.js')];
  delete require.cache[require.resolve('./part5.js')];

  const L = require('./lib.js');
  const X = require('./content.json');

  // Load parts in required sequence
  const p1 = require('./part1.js')(L, X);
  const p2 = require('./part2.js')(L, X);
  const p3a = require('./part3a.js')(L, X);
  const p3b = require('./part3b.js')(L, X);
  const p4a = require('./part4a.js')(L, X);
  const p4b = require('./part4b.js')(L, X);
  const p5 = require('./part5.js')(L, X);

  const capturedToc = [...L.toc];

  // Configure numberings dictionary for docx
  const numConfig = [
    {
      reference: 'bul',
      levels: [
        {
          level: 0,
          format: d.NumberFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        },
        {
          level: 1,
          format: d.NumberFormat.BULLET,
          text: '\u25E6',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }
      ]
    }
  ];

  L.numberings.forEach(ref => {
    numConfig.push({
      reference: ref,
      levels: [
        {
          level: 0,
          format: d.NumberFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }
      ]
    });
  });

  // Header configuration
  const defaultHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'RIVORA — Website Development Specification',
            font: FONT,
            size: 17,
            color: C.muted
          }),
          new PositionalTab({
            alignment: PositionalTabAlignment.RIGHT,
            relativeTo: PositionalTabRelativeTo.MARGIN,
            leader: PositionalTabLeader.NONE
          }),
          new TextRun({
            text: 'v1.0',
            font: FONT,
            size: 17,
            bold: true,
            color: C.goldInk
          })
        ]
      })
    ]
  });

  // Footer configuration (Page X of Y)
  const defaultFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: 'Page ', font: FONT, size: 17, color: C.muted }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 17, bold: true, color: C.ink }),
          new TextRun({ text: ' of ', font: FONT, size: 17, color: C.muted }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 17, bold: true, color: C.ink })
        ]
      })
    ]
  });

  const cover = makeCoverPage();
  const tocChildren = makeTocPage(capturedToc, pageMap);

  const allChildren = [
    ...cover,
    ...tocChildren,
    ...p1,
    ...p2,
    ...p3a,
    ...p3b,
    ...p4a,
    ...p4b,
    ...p5
  ].flat(Infinity);

  const doc = new Document({
    numbering: { config: numConfig },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21, color: C.fg },
          paragraph: { spacing: { line: 276, after: 120 } }
        }
      },
      heading1: {
        run: { font: FONT, size: 34, bold: true, color: C.ink },
        paragraph: {
          spacing: { before: 280, after: 160 },
          keepNext: true,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 14, color: C.gold, space: 6 }
          }
        }
      },
      heading2: {
        run: { font: FONT, size: 26, bold: true, color: C.ink },
        paragraph: { spacing: { before: 220, after: 100 }, keepNext: true }
      },
      heading3: {
        run: { font: FONT, size: 22, bold: true, color: C.goldInk },
        paragraph: { spacing: { before: 180, after: 80 }, keepNext: true }
      }
    },
    sections: [{
      properties: {
        titlePage: true,
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 }
        }
      },
      headers: {
        default: defaultHeader,
        first: new Header({ children: [] })
      },
      footers: {
        default: defaultFooter,
        first: new Footer({ children: [] })
      },
      children: allChildren
    }]
  });

  return { doc, toc: capturedToc };
}

async function build() {
  console.log('=== Starting RIVORA Specification Build ===');

  // ---------- PASS 1: Build with placeholder page numbers ----------
  console.log('\n--- PASS 1: Generating draft document for pagination scan ---');
  const pass1 = assembleDocument([]);
  const buf1 = await Packer.toBuffer(pass1.doc);
  fs.writeFileSync(OUT_DOCX, buf1);
  console.log(`Draft DOCX generated: ${(buf1.length / 1024).toFixed(1)} KB`);

  // Save TOC metadata for python helper
  const tocJsonPath = path.join(OUT_DIR, 'toc.json');
  fs.writeFileSync(tocJsonPath, JSON.stringify(pass1.toc, null, 2));

  // Convert Pass 1 DOCX to PDF
  console.log('Converting draft DOCX to PDF for pagination detection...');
  execSync(`python convert_pdf.py convert "${OUT_DOCX}" "${OUT_PDF}"`, { cwd: __dirname, stdio: 'inherit' });

  // Scan PDF for exact chapter start pages
  console.log('Scanning PDF pages for chapter headings...');
  const pageMapPath = path.join(OUT_DIR, 'page_map.json');
  execSync(`python convert_pdf.py find_pages "${OUT_PDF}" "${tocJsonPath}" "${pageMapPath}"`, { cwd: __dirname, stdio: 'inherit' });
  const pageMap = JSON.parse(fs.readFileSync(pageMapPath, 'utf8'));

  // ---------- PASS 2: Rebuild with exact page numbers & hyperlinks ----------
  console.log('\n--- PASS 2: Assembling final document with verified TOC ---');
  const pass2 = assembleDocument(pass1.toc, pageMap);
  const buf2 = await Packer.toBuffer(pass2.doc);
  fs.writeFileSync(OUT_DOCX, buf2);
  console.log(`Final DOCX written: ${(buf2.length / 1024).toFixed(1)} KB`);

  // Clean folder entries from final DOCX (zip -d)
  console.log('Cleaning folder entries from DOCX package...');
  execSync(`python convert_pdf.py clean "${OUT_DOCX}"`, { cwd: __dirname, stdio: 'inherit' });

  // Convert final DOCX to PDF
  console.log('Converting final DOCX to publication PDF...');
  execSync(`python convert_pdf.py convert "${OUT_DOCX}" "${OUT_PDF}"`, { cwd: __dirname, stdio: 'inherit' });

  // Copy content.json as rivora_source_content.json
  fs.copyFileSync(CONTENT_SRC, CONTENT_DST);
  console.log(`Copied source inventory to: ${CONTENT_DST}`);

  // Also copy to root outputs for convenience
  const rootDocx = path.join(rootOutputs, 'RIVORA_Website_Development_Specification.docx');
  const rootPdf = path.join(rootOutputs, 'RIVORA_Website_Development_Specification.pdf');
  const rootContent = path.join(rootOutputs, 'rivora_source_content.json');
  fs.copyFileSync(OUT_DOCX, rootDocx);
  fs.copyFileSync(OUT_PDF, rootPdf);
  fs.copyFileSync(CONTENT_DST, rootContent);

  // Render visual sample pages for quality verification
  const renderDir = path.join(OUT_DIR, 'rendered_pages');
  console.log('\nRendering sample pages for visual inspection...');
  execSync(`python convert_pdf.py render "${OUT_PDF}" "${renderDir}"`, { cwd: __dirname, stdio: 'inherit' });

  console.log('\n=== Build Complete ===');
  console.log(`DOCX: ${OUT_DOCX}`);
  console.log(`PDF:  ${OUT_PDF}`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});