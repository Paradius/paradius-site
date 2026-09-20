// Shoots the 12 notebook sheets on the four measured device sizes for the review
// form. Needs the dev server up; PROBE_URL overrides the address.
// Output feeds scripts/review/index.html — see its shots5/ paths.
// The last shot is the ledger reveal, not a sheet: one gesture past the dawn.
import { chromium } from 'playwright-core';
import { openConfig } from './device-modes-probe.mjs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'scripts/review/shots5';
const DEVICES = ['pixel-portrait', 'pixel-landscape', 'tab-portrait', 'tab-landscape'];
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
for (const name of DEVICES) {
  const { context, page } = await openConfig(browser, name);
  // The dev toolbar floats over the bottom of every sheet and is not the site.
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
  const engine = await page.evaluate(() => document.documentElement.getAttribute('data-home-engine'));
  const sheets = await page.evaluate(() => {
    const grouped = [];
    for (const s of document.querySelectorAll('.home-v7__hero, .home-v7__row')) {
      const last = grouped[grouped.length - 1];
      if (last && s.classList.contains('home-v7__row--pair-2')) last.push(s);
      else grouped.push([s]);
    }
    // The engine adds a stop at the foot of the document when it runs past the
    // last sheet: that stop is the ledger reveal, and it is worth a shot.
    const vh = window.innerHeight;
    const tail = document.documentElement.scrollHeight - grouped.length * vh > 1;
    return grouped.length + (tail ? 1 : 0);
  });
  const shots = [];
  for (let i = 0; i < sheets; i++) {
    await page.waitForTimeout(260);
    const file = join(OUT, `${name}-${String(i + 1).padStart(2, '0')}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 74 });
    shots.push(file);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(560);
  }
  console.log(`${name}: engine=${engine} sheets=${sheets} shots=${shots.length}`);
  await context.close();
}
await browser.close();
