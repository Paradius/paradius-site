// Asks the browser who actually receives the click on every visible link and
// button: a neighbouring sheet can land on top of one and swallow it without
// changing anything you can see. Needs the dev server, or PROBE_URL for another.
// Usage: PROBE_URL=https://www.paradius.dev/ node scripts/hit-test-probe.mjs
import { chromium } from 'playwright-core';
import { CONFIGS, openConfig } from './device-modes-probe.mjs';

const SIZES = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CONFIGS);
/* Past the intro film and the ascent's settle: before that the curtain is a
   legitimate overlay and every hit test lies. */
const SETTLE_MS = 9000;

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
let blocked = 0;

for (const name of SIZES) {
  const { context, page } = await openConfig(browser, name);
  await page.waitForTimeout(SETTLE_MS);
  const data = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a[href], button')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      /* A closed menu still has a box: without this every collapsed nav item
         reads as covered by whatever is painted over it. */
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      if (getComputedStyle(el).pointerEvents === 'none') continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
      const hit = document.elementFromPoint(cx, cy);
      const reaches = hit === el || el.contains(hit);
      out.push({
        href: el.getAttribute('href') ?? '(button)',
        text: (el.textContent || '').trim().slice(0, 26),
        reaches,
        over: reaches ? null : `${hit?.tagName}.${typeof hit?.className === 'string' ? hit.className.split(' ')[0] : ''}`,
      });
    }
    return { engine: document.documentElement.dataset.homeEngine, out };
  });
  console.log(`\n=== ${name} ${CONFIGS[name].w}x${CONFIGS[name].h} (motor ${data.engine}) ===`);
  for (const r of data.out) {
    if (!r.reaches) blocked += 1;
    console.log(`${r.reaches ? 'OK    ' : 'TAPADO'}  ${r.href.padEnd(22)} ${r.text.padEnd(26)} ${r.over ?? ''}`);
  }
  await context.close();
}

await browser.close();
console.log(`\n${blocked} tapados`);
process.exit(blocked ? 1 : 0);
