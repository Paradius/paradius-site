import { chromium } from 'playwright-core';
// Captures an inner page top, bottom and hero at desktop and phone width for eyeballing the glow clones.
// Usage: node scripts/glow-capture.mjs <outDir> [path-with-query]
const out = process.argv[2];
const target = process.argv[3] ?? "/about/?glow=1";
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
for (const [name, w, h] of [['desk', 1440, 900], ['pixel', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:4322${target}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => ({ hosts: document.querySelectorAll('.inner-glow-host').length, user: getComputedStyle(document.documentElement).getPropertyValue('--glow-user'), levels: [...document.querySelectorAll('.inner-block')].map((b) => b.style.getPropertyValue('--glow-level')) }));
  console.log(name, JSON.stringify(info));
  await page.screenshot({ path: `${out}/glow-${name}-top.png` });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/glow-${name}-bottom.png` });
  const hero = await page.$('.inner-block--hero');
  if (hero) await hero.screenshot({ path: `${out}/glow-${name}-hero.png` });
}
await browser.close();
