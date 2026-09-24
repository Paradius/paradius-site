// Screenshots the home intro at fixed instants (headless, animations run in real time).
// Usage: node scripts/intro-filmstrip.mjs <outDir> [width height]
import { chromium } from 'playwright-core';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto('http://localhost:4322/?intro=1', { waitUntil: 'commit' });
const t0 = Date.now();
for (const at of (process.env.INSTANTS ?? '300,1500,2600,3500,4100,4450,4700,5500,6400').split(',').map(Number)) {
  const wait = at - (Date.now() - t0);
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/intro-${String(at).padStart(4, '0')}.png` });
}
console.log(await p.evaluate(() => ({ state: document.documentElement.dataset.intro, overlay: !!document.querySelector('.intro'), seen: localStorage.getItem('paradius-intro-v1') })));
await b.close();
