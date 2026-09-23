import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const NAMES = [
  'topNoLeft',
  'topNoRight',
  'segmentSmall',
  'segmentMedium',
  'segmentLarge',
  'segmentFlat',
  'flatElastic',
  'bottomNoLeft',
  'bottomNoRight',
];
const TMP = '/tmp/grok-01b-tree-pieces';
const ROOT = process.cwd();

mkdirSync(TMP, { recursive: true });

function fileUrl(absPath) {
  return pathToFileURL(absPath).href;
}

async function raster(page, svgAbs, pngAbs) {
  // Chromium blocks file:// images from about:blank: the img never loads.
  const htmlPath = resolve(TMP, 'frame.html');
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html>
<head>
<style>
  html, body { margin: 0; padding: 0; background: #fff; overflow: hidden; width: 1430px; height: 1360px; }
  img { display: block; width: 1430px; height: 1360px; }
</style>
</head>
<body>
  <img src="${fileUrl(svgAbs)}" width="1430" height="1360">
</body>
</html>
`,
  );
  await page.goto(fileUrl(htmlPath));
  await page.waitForFunction(() => {
    const img = document.querySelector('img');
    return Boolean(img && img.complete && img.naturalWidth > 0);
  });
  await page.screenshot({ path: pngAbs, type: 'png' });
}

async function countDiff(page, aPng, bPng) {
  // file:// images taint the canvas: getImageData throws SecurityError.
  const aUrl = `data:image/png;base64,${readFileSync(aPng).toString('base64')}`;
  const bUrl = `data:image/png;base64,${readFileSync(bPng).toString('base64')}`;
  return page.evaluate(async ({ aUrl, bUrl }) => {
    const load = (src) =>
      new Promise((resolveImg, reject) => {
        const img = new Image();
        img.onload = () => resolveImg(img);
        img.onerror = () => reject(new Error(src));
        img.src = src;
      });
    const a = await load(aUrl);
    const b = await load(bUrl);
    const width = a.naturalWidth;
    const height = a.naturalHeight;
    const ca = document.createElement('canvas');
    const cb = document.createElement('canvas');
    ca.width = cb.width = width;
    ca.height = cb.height = height;
    const xa = ca.getContext('2d');
    const xb = cb.getContext('2d');
    if (!xa || !xb) {
      throw new Error('canvas');
    }
    xa.drawImage(a, 0, 0);
    xb.drawImage(b, 0, 0);
    const da = xa.getImageData(0, 0, width, height).data;
    const db = xb.getImageData(0, 0, width, height).data;
    let n = 0;
    // Deduped strokes lose stacked coverage: greys shift, ink does not.
    for (let i = 0; i < da.length; i += 4) {
      const darkA = da[i] < 64 && da[i + 1] < 64 && da[i + 2] < 64;
      const darkB = db[i] < 64 && db[i + 1] < 64 && db[i + 2] < 64;
      const lightA = da[i] > 200 && da[i + 1] > 200 && da[i + 2] > 200;
      const lightB = db[i] > 200 && db[i + 1] > 200 && db[i + 2] > 200;
      if ((darkA && lightB) || (darkB && lightA)) {
        n += 1;
      }
    }
    return n;
  }, { aUrl, bUrl });
}

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({
  viewport: { width: 1430, height: 1360 },
  deviceScaleFactor: 1,
});

let failures = 0;
for (const name of NAMES) {
  const src = resolve(ROOT, 'assets-src', 'tree', `${name}.svg`);
  const generated = resolve(ROOT, 'public', 'assets', 'tree', `${name}.svg`);
  const srcPng = resolve(TMP, `${name}-src.png`);
  const genPng = resolve(TMP, `${name}-gen.png`);
  await raster(page, src, srcPng);
  await raster(page, generated, genPng);
  const count = await countDiff(page, srcPng, genPng);
  console.log(`${name} diff ${count} px`);
  if (count > 400) {
    failures += 1;
  }
}

await browser.close();
console.log(failures ? `PIECES PROOF FAILURES: ${failures}` : 'PIECES PROOF OK');
process.exit(failures ? 1 : 0);
