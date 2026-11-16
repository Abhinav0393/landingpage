const fs = require('fs');
const d = require('docx');
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
  HeadingLevel, ImageRun, Bookmark, InternalHyperlink, PositionalTab, PositionalTabAlignment,
  PositionalTabRelativeTo, PositionalTabLeader, VerticalAlign, PageBreak } = d;

const C = { ink:'151922', gold:'A98A50', ivory:'EDE8DD', bg:'FBFAF7', stone:'F2EEE7', fg:'1A1E27', muted:'5C6370',
  border:'E4DED3', goldInk:'77592A', tbd:'B3261E', prop:'1F4E8C', ok:'2E6B3A' };
const FONT = 'Calibri', MONO = 'Consolas';
const W = 9746; // content width (A4, 0.75in margins)

let h1n = 0, h2n = 0, appN = 0; const toc = [];
const state = { inApp: false };

const TAGS = /(\*\*[^*]+\*\*|`[^`]+`|TBD — Awaiting confirmation|PROPOSED — Requires approval|\bCONFIRMED\b)/g;
function runs(text, o = {}) {
  const out = [];
  String(text).split(TAGS).forEach(part => {
    if (!part) return;
    const base = { font: FONT, size: o.size || 21, color: o.color || C.fg, bold: o.bold, italics: o.italics };
    if (part.startsWith('**') && part.endsWith('**')) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else if (part.startsWith('`') && part.endsWith('`')) out.push(new TextRun({ ...base, text: part.slice(1, -1), font: MONO, size: (o.size || 21) - 2, color: '3A3F4B', shading: { type: ShadingType.CLEAR, fill: C.stone } }));
    else if (part === 'TBD — Awaiting confirmation') out.push(new TextRun({ ...base, text: part, bold: true, color: C.tbd }));
    else if (part === 'PROPOSED — Requires approval') out.push(new TextRun({ ...base, text: part, bold: true, color: C.prop }));
    else if (part === 'CONFIRMED') out.push(new TextRun({ ...base, text: part, bold: true, color: C.ok }));
    else out.push(new TextRun({ ...base, text: part }));
  });
  return out;
}
const slug = s => 'b_' + s.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40);
function h1(title) {
  let label;
  if (state.inApp) { appN++; label = `Appendix ${String.fromCharCode(64 + appN)}`; } else { h1n++; h2n = 0; label = `${h1n}.`; }
  const text = state.inApp ? `${label} — ${title}` : `${label} ${title}`;
  const id = 'h1_' + (toc.length + 1);
  toc.push({ text, id, label, title });
  return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new Bookmark({ id, children: [new TextRun({ text })] })] });
}
function h2(title) { h2n++; const t = state.inApp ? title : `${h1n}.${h2n} ${title}`; return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t })] }); }
function h3(title) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: title })] }); }
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, line: 276 }, alignment: o.align, keepNext: o.keepNext, children: runs(t, o) });
let listId = 0; const numberings = [];
const B = (items, o = {}) => items.map(t => new Paragraph({ numbering: { reference: 'bul', level: o.level || 0 }, spacing: { after: 60, line: 268 }, children: runs(t, o) }));
function N(items, o = {}) { const ref = 'num' + (++listId); numberings.push(ref); return items.map(t => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 268 }, children: runs(t, o) })); }
const CK = items => items.map(t => new Paragraph({ indent: { left: 360, hanging: 360 }, spacing: { after: 50, line: 264 }, children: [new TextRun({ text: '☐  ', font: 'DejaVu Sans', size: 20, color: C.goldInk }), ...runs(t, { size: 20 })] }));
const spacer = (n = 80) => new Paragraph({ spacing: { after: n }, children: [] });

function code(text) {
  const lines = text.replace(/\n$/, '').split('\n');
  return lines.map((ln, i) => new Paragraph({
    keepLines: true, keepNext: i < lines.length - 1 && i < 6,
    spacing: { after: 0, line: 240 }, indent: { left: 120, right: 120 },
    shading: { type: ShadingType.CLEAR, fill: 'F4F1EA' },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: C.gold, space: 6 } },
    children: [new TextRun({ text: ln.length ? ln : ' ', font: MONO, size: 16, color: '23262E' })] }))
    .concat([spacer(100)]);
}
function callout(title, lines, kind = 'note') {
  const col = { note: C.gold, warn: C.tbd, prop: C.prop, ok: C.ok }[kind];
  const fill = { note: 'F6F2E9', warn: 'FBEDEA', prop: 'EAF0F8', ok: 'EAF3EC' }[kind];
  const out = [];
  const bd = { left: { style: BorderStyle.SINGLE, size: 24, color: col, space: 8 } };
  out.push(new Paragraph({ keepNext: true, spacing: { before: 60, after: 40 }, indent: { left: 200, right: 100 }, shading: { type: ShadingType.CLEAR, fill }, border: bd, children: [new TextRun({ text: title, bold: true, font: FONT, size: 21, color: col === C.gold ? C.goldInk : col })] }));
  (Array.isArray(lines) ? lines : [lines]).forEach((l, i, a) => out.push(new Paragraph({ keepLines: true, spacing: { after: i === a.length - 1 ? 140 : 40, line: 264 }, indent: { left: 200, right: 100 }, shading: { type: ShadingType.CLEAR, fill }, border: bd, children: runs(l, { size: 20 }) })));
  return out;
}

const bd1 = { style: BorderStyle.SINGLE, size: 4, color: C.border };
const borders = { top: bd1, bottom: bd1, left: bd1, right: bd1 };
function cellParas(content, o) {
  const arr = Array.isArray(content) ? content : String(content).split('\n');
  return arr.map(t => new Paragraph({ spacing: { after: 30, line: 250 }, children: runs(t, { size: o.fs || 18, color: o.color, bold: o.bold }) }));
}
function tbl(headers, rows, rel, o = {}) {
  const sum = rel.reduce((a, b) => a + b, 0);
  const cw = rel.map(r => Math.round(W * r / sum)); cw[cw.length - 1] += W - cw.reduce((a, b) => a + b, 0);
  const mk = (c, i, hdr, ri) => new TableCell({
    width: { size: cw[i], type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.TOP,
    margins: { top: 60, bottom: 50, left: 90, right: 90 },
    shading: hdr ? { type: ShadingType.CLEAR, fill: C.ink } : (o.firstCol && i === 0 ? { type: ShadingType.CLEAR, fill: C.ivory } : { type: ShadingType.CLEAR, fill: (ri % 2 ? 'FAF8F3' : 'FFFFFF') }),
    children: cellParas(c, hdr ? { fs: o.fs || 18, color: C.bg, bold: true } : { fs: o.fs || 18, bold: o.firstCol && i === 0 })
  });
  const trs = [];
  if (headers) trs.push(new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => mk(h, i, true, 0)) }));
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: o.cantSplit ?? false, children: r.map((c, i) => mk(c, i, false, ri)) })));
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows: trs }), spacer(120)];
}
const kv = (rows, o = {}) => tbl(null, rows, o.rel || [22, 78], { firstCol: true, fs: o.fs || 18 });
function img(file, wpx, caption, alt) {
  const buf = fs.readFileSync(file); const iw = buf.readUInt32BE(16), ih = buf.readUInt32BE(20);
  return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 60 }, children: [new ImageRun({ type: 'png', data: buf, transformation: { width: wpx, height: Math.round(wpx * ih / iw) }, altText: { title: caption, description: alt || caption, name: caption } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: caption, italics: true, size: 18, color: C.muted, font: FONT })] })];
}
module.exports = { d, C, FONT, MONO, W, h1, h2, h3, P, B, N, CK, code, callout, tbl, kv, img, spacer, runs, toc, numberings, state, PageBreak };
