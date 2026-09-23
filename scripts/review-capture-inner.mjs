// Shoots the twelve inner pages on the four measured sizes. PROBE_URL overrides
// the address. Output: scripts/review/inner-shots/ and scripts/review/inner.html.
import { chromium } from 'playwright-core';
import { CONFIGS, openConfig } from './device-modes-probe.mjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.PROBE_URL ?? 'http://localhost:4321';
const OUT = 'scripts/review/inner-shots';

const DEVICES = [
  ['pixel-portrait', 'Pixel 9 · vertical'],
  ['pixel-landscape', 'Pixel 9 · horizontal'],
  ['tab-portrait', 'Tab S7 · vertical'],
  ['tab-landscape', 'Tab S7 · horizontal'],
];

const PAGES = [
  ['about', 'About', '/about/'],
  ['faq', 'FAQ', '/faq/'],
  ['how-we-work', 'How we work', '/how-we-work/'],
  ['careers', 'Careers', '/careers/'],
  ['talent', 'Registry', '/talent/'],
  ['talent-PRD-001', 'Dossier PRD-001', '/talent/PRD-001/'],
  ['work', 'Work', '/work/'],
  ['work-case', 'Caso: Payments that stopped going missing', '/work/banking-infrastructure/'],
  ['contact', 'Contact', '/contact/'],
  ['legal-privacy', 'Privacy policy', '/legal/privacy/'],
  ['legal-terms', 'Terms of use', '/legal/terms/'],
  ['not-found', '404', '/404'],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
let shots = 0;
for (const [deviceId] of DEVICES) {
  const { context, page } = await openConfig(browser, deviceId);
  for (const [pageId, , pagePath] of PAGES) {
    await page.goto(BASE + pagePath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({
      path: join(OUT, `${deviceId}-${pageId}.jpg`),
      fullPage: true,
      type: 'jpeg',
      quality: 80,
    });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`${deviceId} ${pageId} ${height}px`);
    shots += 1;
  }
  await context.close();
}
await browser.close();

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');

const devices = DEVICES.map(([id, name]) => ({
  id,
  name,
  w: CONFIGS[id].w,
  h: CONFIGS[id].h,
  shots: PAGES.map(([pid]) => 'inner-shots/' + id + '-' + pid + '.jpg'),
}));
const stages = PAGES.map(([id, label]) => ({ id: 'inner-r1-' + id, label }));

let html = readFileSync('scripts/review/index.html', 'utf8');
html = html.replace(
  /<script id="data" type="application\/json">[\s\S]*?<\/script>/,
  `<script id="data" type="application/json">${JSON.stringify({ devices, stages })}</script>`,
);
html = html.replace(
  /(<span class="eyebrow">)[\s\S]*?(<\/span>)/,
  `$1Paradius · interiores · vuelta 1 · ${today}$2`,
);
html = html.replace(/(<h1>)[\s\S]*?(<\/h1>)/, '$1Revisión de las interiores$2');
html = html.replace(/(<title>)[\s\S]*?(<\/title>)/, '$1Revisión de las interiores$2');
html = html.replace(
  /<p class="lede">[\s\S]*?<\/p>/,
  '<p class="lede">Una captura por página y tamaño, la página entera. Marcá con el lápiz y escribí debajo; lo escrito se guarda solo.</p>',
);
writeFileSync('scripts/review/inner.html', html);

console.log(`REVIEW INNER OK ${shots} shots`);
