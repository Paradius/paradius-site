// Dumps the home's layout geometry at every configured size. A refactor that
// must not move anything is then proven by diffing two dumps, not by eye.
// Offsets, not bounding rects: transforms must not enter the measurement.
// Usage: node scripts/layout-fingerprint.mjs out.json   (needs the dev server)
import { chromium } from 'playwright-core';
import { CONFIGS, openConfig } from './device-modes-probe.mjs';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? 'fingerprint.json';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const out = {};

for (const name of Object.keys(CONFIGS)) {
  const { context, page } = await openConfig(browser, name);
  await page.waitForTimeout(900);
  out[name] = await page.evaluate(() => {
    const sheets = [...document.querySelectorAll('.home-v7__hero, .home-v7__row')].map((el) => {
      const cs = getComputedStyle(el);
      return {
        id: el.id || null,
        cls: el.className,
        box: [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight],
        margin: [cs.marginBlockStart, cs.marginBlockEnd],
        pad: [cs.paddingTop, cs.paddingBottom, cs.paddingLeft, cs.paddingRight],
      };
    });
    return { scrollHeight: document.documentElement.scrollHeight, sheets };
  });
  await context.close();
}

await browser.close();
writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`${Object.keys(out).length} tamanos -> ${OUT}`);
