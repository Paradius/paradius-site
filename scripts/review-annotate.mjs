// Draws the owner's pen strokes from the review form back onto their captures.
// Feed it a directory dumped with ArtifactData (action list, collection cells).
// Usage: node scripts/review-annotate.mjs <cells-dir> <round-prefix> [out-dir]
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [cellsDir, prefix, outDir = 'scripts/review/annotated'] = process.argv.slice(2);
const SHEETS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();

for (const file of readdirSync(cellsDir).filter((f) => f.startsWith(prefix) && f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(cellsDir, file), 'utf8'));
  const strokes = (doc.strokes ?? []).map((s) => s.p).filter((p) => Array.isArray(p) && p.length >= 2);
  if (!strokes.length) continue;
  const [stage, device] = file.replace('.json', '').split('--');
  const shot = resolve(`scripts/review/shots5/${device}-${SHEETS[Number(stage.slice(-2)) - 1]}.jpg`);
  if (!existsSync(shot)) { console.log(`missing shot for ${file}`); continue; }
  const data = 'data:image/jpeg;base64,' + readFileSync(shot).toString('base64');
  const poly = strokes
    .map((p) => {
      const pts = [];
      for (let k = 0; k < p.length; k += 2) pts.push(`${(p[k] * 100).toFixed(3)},${(p[k + 1] * 100).toFixed(3)}`);
      return `<polyline points="${pts.join(' ')}" />`;
    })
    .join('');
  await page.setContent(
    `<style>html,body{margin:0}#f{position:relative;display:inline-block}img{display:block}svg{position:absolute;inset:0;width:100%;height:100%}
     polyline{fill:none;stroke:#ff2d55;stroke-width:0.55;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}</style>
     <div id="f"><img src="${data}"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${poly}</svg></div>`,
  );
  await page.waitForFunction(() => { const i = document.querySelector('img'); return i && i.complete && i.naturalWidth > 0; });
  const frame = await page.locator('#f');
  const out = join(outDir, `${stage}--${device}.png`);
  await frame.screenshot({ path: out });
  console.log(`${out}  (${strokes.length} marcas)`);
}
await browser.close();
