// Renders lockup SVG files white on black at 2px per viewBox unit, one per row. Usage: node scripts/lockup-sheet.mjs <out.png> <file.svg> [file.svg ...]
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { chromium } from 'playwright';

const [out, ...files] = process.argv.slice(2);
const cells = files.map((f) => {
  const svg = readFileSync(f, 'utf8');
  const width = parseFloat(/viewBox="[^"]*?\s([\d.]+)\s[\d.]+"/.exec(svg)[1]);
  return `<figure style="margin:0 0 30px"><figcaption style="opacity:.5;margin-bottom:6px">${basename(f)}</figcaption><div style="width:${width * 2}px;outline:1px dashed #334">${svg}</div></figure>`;
});
const html = `<body style="margin:0;background:#0b0f14;color:#fff;padding:20px;font:12px sans-serif">${cells.join('')}</body>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 760, height: 400 }, deviceScaleFactor: 2 });
await p.setContent(html);
await p.evaluate(() => document.querySelectorAll('svg').forEach((s) => { s.style.width = '100%'; s.style.fill = '#fff'; s.style.display = 'block'; }));
await p.screenshot({ path: out, fullPage: true });
await b.close();
