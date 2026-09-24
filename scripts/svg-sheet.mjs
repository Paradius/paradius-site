// Renders a few public/assets SVGs side by side on black for eyeballing. Usage: node scripts/svg-sheet.mjs <out.png> <name> [name ...]
import { chromium } from 'playwright-core';
const [out, ...names] = process.argv.slice(2);
const html = `<body style="margin:0;background:#000;display:flex;gap:24px;padding:24px;align-items:center">${names.map((n) => `<figure style="margin:0;color:#888;font:12px monospace;text-align:center"><img src="http://localhost:4322/assets/${n}.svg" style="width:260px;height:260px;object-fit:contain;filter:brightness(0) invert(1)"><figcaption>${n}</figcaption></figure>`).join('')}</body>`;
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 24 + names.length * 284, height: 330 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.screenshot({ path: out });
await b.close();
