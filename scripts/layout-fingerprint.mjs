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
    /* Every element, not just the sheets: a change in the global stylesheet
       lands on the header, the footer and the type long before it moves a row.
       No opacity here: the lockup's light animates, so it is never the same
       twice and would drown the signal. */
    const PROPS = [
      'display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'letterSpacing', 'color', 'backgroundColor', 'borderTopWidth', 'borderLeftWidth',
      'marginTop', 'marginBottom', 'paddingTop', 'paddingLeft', 'zIndex',
    ];
    const elements = [...document.body.querySelectorAll('*')].map((el) => {
      const cs = getComputedStyle(el);
      return [
        el.tagName,
        el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight,
        ...PROPS.map((prop) => cs[prop]),
      ].join('|');
    });
    return { scrollHeight: document.documentElement.scrollHeight, sheets, elements };
  });
  await context.close();
}

await browser.close();
writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`${Object.keys(out).length} tamanos -> ${OUT}`);
