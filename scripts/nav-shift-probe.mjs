// Navigation shift probe: with classic scrollbars on, records the layout width, the first nav
// link's left edge and the document height on every frame from document start, then reports
// every frame where the width or the nav moved. A moving nav is the horizontal jump the owner
// sees on 80% of navigations. Usage: node scripts/nav-shift-probe.mjs [/from/ /to/ ...]
import { chromium } from 'playwright-core';

const BASE = (process.env.PROBE_URL ?? 'http://localhost:4321').replace(/\/$/, '');
const pairs = process.argv.slice(2);
const routes = pairs.length >= 2 ? pairs : ['/about/', '/faq/', '/', '/about/', '/talent/', '/contact/'];

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', ignoreDefaultArgs: ['--hide-scrollbars'] });
const context = await browser.newContext({ viewport: { width: 1699, height: 854 } });
await context.addInitScript(() => {
  const frames = [];
  const tick = () => {
    const a = document.querySelector('.site-header__nav-link');
    frames.push([Math.round(performance.now()), document.documentElement.clientWidth, a ? Math.round(a.getBoundingClientRect().left) : -1, document.documentElement.scrollHeight]);
    if (frames.length < 120) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__frames = frames;
});
const page = await context.newPage();
let failures = 0;
await page.goto(BASE + routes[0], { waitUntil: 'networkidle' });
for (let i = 1; i < routes.length; i++) {
  await page.waitForTimeout(300);
  await page.goto(BASE + routes[i], { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const frames = await page.evaluate(() => window.__frames);
  const states = [];
  for (const f of frames) {
    const key = f[1] + '|nav@' + f[2];
    if (!states.length || states.at(-1).key !== key) states.push({ t: f[0], key, nav: f[2], h: f[3] });
  }
  // The eye sees the nav; clientWidth alone changes when the gutter is reserved before the bar exists.
  const moved = new Set(states.map((s) => s.nav)).size > 1;
  if (moved) failures += 1;
  console.log(`${moved ? 'SHIFT' : 'STEADY'} ${routes[i - 1]} -> ${routes[i]}  ${states.map((s) => `${s.t}ms ${s.key} h${s.h}`).join('  ->  ')}`);
}
await browser.close();
console.log(failures ? `NAV SHIFT FAILURES: ${failures}` : 'NAV SHIFT OK');
process.exit(failures ? 1 : 0);
