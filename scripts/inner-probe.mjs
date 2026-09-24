import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.PROBE_URL ?? 'http://localhost:4321').replace(/\/$/, '');
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'inner-probe/shots');
const PATHS = process.argv.slice(2);

const SIZES = [
  { name: 'wide', width: 2000, height: 1100, touch: false },
  { name: 'desk', width: 1440, height: 900, touch: false },
  { name: 'tabL', width: 1204, height: 585, touch: true },
  { name: 'pixL', width: 931, height: 372, touch: true },
  { name: 'tabP', width: 753, height: 1036, touch: true },
  { name: 'pixel', width: 448, height: 803, touch: true },
];

const TREE_ONLY_CSS =
  '.site-header, .footer-ledger, .inner-main > *:not(.inner-run), .inner-main::after, astro-dev-toolbar { visibility: hidden !important; } .inner-run::after, .inner-run__light, .inner-branch__light { display: none !important; }';

function pageSlug(pagePath) {
  return pagePath.replace(/^\/+|\/+$/g, '').replaceAll('/', '-') || 'root';
}

function href(pagePath) {
  const path = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${BASE}${path}`;
}

function expectedLayout(mode, width) {
  if (mode === 'two-sided') return width >= 700 ? 'two-sided' : 'column';
  if (mode === 'rail') return width >= 700 ? 'rail' : 'column';
  if (mode === 'dossier') {
    if (width >= 1200) return 'two-sided';
    if (width >= 700) return 'rail';
    return 'column';
  }
  return mode;
}

function faceOk(font, force) {
  if (force === 'will') return font.includes('Zilla');
  if (force === 'power') return font.includes('Grotesk');
  return true;
}

function collectGeometry() {
  const de = document.documentElement;
  const main = document.querySelector('main.inner-main');
  const run = document.querySelector('.inner-run');
  const footer = document.querySelector('.footer-ledger');
  const rr = run?.getBoundingClientRect();
  const spine = rr ? +(rr.left + rr.width / 2).toFixed(1) : null;
  const st = (el) => {
    const c = getComputedStyle(el);
    return { font: c.fontFamily, px: parseFloat(c.fontSize), weight: c.fontWeight, align: c.textAlign };
  };
  const blocks = [...document.querySelectorAll('.inner-block')].map((b) => {
    const texts = [...b.querySelectorAll('.inner-kicker, .inner-title, .inner-body, .inner-body p, .inner-button')];
    let l = Infinity;
    let r = -Infinity;
    for (const t of texts) {
      const range = document.createRange();
      range.selectNodeContents(t);
      for (const q of range.getClientRects()) {
        if (q.width > 1) {
          l = Math.min(l, q.left);
          r = Math.max(r, q.right);
        }
      }
    }
    const title = b.querySelector('.inner-title');
    const body = b.querySelector('.inner-body');
    return {
      force: b.dataset.force,
      hero: b.classList.contains('inner-block--hero'),
      cta: b.classList.contains('inner-block--cta'),
      tool: b.classList.contains('inner-block--tool'),
      l: +l.toFixed(1),
      r: +r.toFixed(1),
      title: title ? st(title) : null,
      body: body ? st(body) : null,
      head: (title ? title.textContent : 'cta').trim().slice(0, 26),
    };
  });
  const hero = blocks.find((b) => b.hero) ?? null;
  return {
    mode: main?.dataset.mode ?? '',
    layout: de.dataset.layout,
    trunkSide: de.dataset.trunk,
    overflow: de.scrollWidth - de.clientWidth,
    spine,
    hero: hero && { force: hero.force, title: hero.title, body: hero.body, l: hero.l, r: hero.r },
    blocks,
    footerTop: footer ? +(footer.getBoundingClientRect().top + scrollY).toFixed(0) : null,
    runBox: rr ? { x: rr.left, y: rr.top + scrollY, w: rr.width, h: rr.height } : null,
  };
}

function collectTextRects() {
  const out = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('[aria-hidden="true"], script, style, .site-header, .skip-link, .sr-only')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const inFooter = !!el.closest('.footer-ledger');
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const box of range.getClientRects()) {
      // Off-screen text (a skip link parked at a negative offset) is not readable ink.
      if (box.right <= 0 || box.bottom + scrollY <= 0) continue;
      if (box.width > 1 && box.height > 1) {
        out.push({
          x: box.left,
          y: box.top + scrollY,
          w: box.width,
          h: box.height,
          t: n.textContent.trim().slice(0, 26),
          footer: inFooter,
        });
      }
    }
  }
  for (const a of document.querySelectorAll('.inner-button')) {
    const box = a.getBoundingClientRect();
    out.push({
      x: box.left,
      y: box.top + scrollY,
      w: box.width,
      h: box.height,
      t: 'button: ' + a.textContent.trim(),
    });
  }
  return out;
}

async function measureInk([png, rects, footerTop, runBox]) {
  const img = new Image();
  await new Promise((ok) => {
    img.onload = ok;
    img.src = 'data:image/png;base64,' + png;
  });
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const inkIn = (x0, y0, w, h) => {
    x0 = Math.max(0, Math.floor(x0));
    y0 = Math.max(0, Math.floor(y0));
    w = Math.min(c.width - x0, Math.ceil(w));
    h = Math.min(c.height - y0, Math.ceil(h));
    if (w <= 0 || h <= 0) return 0;
    const d = x.getImageData(x0, y0, w, h).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) n++;
    return n;
  };
  const bad = [];
  for (const r of rects) {
    const ink = inkIn(r.x - 4, r.y - 2, r.w + 8, r.h + 4);
    if (ink > 8) bad.push({ t: r.t, y: Math.round(r.y), ink, footer: !!r.footer });
  }
  let rootsL = c.width;
  let rootsR = 0;
  if (runBox) {
    const bandX = Math.max(0, Math.floor(runBox.x));
    const bandY = Math.max(0, Math.floor(runBox.y + runBox.h * 0.7));
    const bandW = Math.min(c.width - bandX, Math.ceil(runBox.w));
    const bandH = Math.min(c.height - bandY, Math.ceil(runBox.h * 0.3));
    if (bandW > 0 && bandH > 0) {
      const d = x.getImageData(bandX, bandY, bandW, bandH).data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] + d[i + 1] + d[i + 2] > 60) {
          const px = bandX + ((i / 4) % bandW);
          if (px < rootsL) rootsL = px;
          if (px > rootsR) rootsR = px;
        }
      }
    }
  }
  const ft = footerTop ?? c.height;
  return {
    checked: rects.length,
    badCount: bad.length,
    bad: bad.slice(0, 6),
    treeInk: inkIn(0, 0, c.width, c.height),
    inkBehindFooter: inkIn(0, ft, c.width, c.height - ft),
    inkInLast40: inkIn(0, c.height - 40, c.width, 40),
    rootsSpread: [rootsL, rootsR],
  };
}

function hasInnerMain() {
  return Boolean(document.querySelector('main.inner-main'));
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
let failures = 0;
const fail = (what, tag, data) => {
  failures += 1;
  console.log(`FAIL ${what}`, tag, JSON.stringify(data));
};

try {
  for (const size of SIZES) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      hasTouch: size.touch,
      isMobile: size.touch,
      // dpr 1: a scaled PNG would not line up with the CSS-pixel text rects.
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const bench = await context.newPage();
    for (const pagePath of PATHS) {
      const slug = pageSlug(pagePath);
      const tag = `${size.name}-${slug}`;
      await page.goto(href(pagePath), { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      if (!(await page.evaluate(hasInnerMain))) {
        fail('no-inner-main', tag, pagePath);
        continue;
      }
      const g = await page.evaluate(collectGeometry);
      console.log(tag, JSON.stringify({
        layout: g.layout,
        trunkSide: g.trunkSide,
        spine: g.spine,
        overflow: g.overflow,
        hero: g.hero,
      }));
      if (g.overflow > 0) fail('overflow', tag, g.overflow);
      const want = expectedLayout(g.mode, size.width);
      if (g.layout !== want) fail('layout', tag, { expected: want, got: g.layout });
      const cta = g.blocks.find((b) => b.cta);
      // A rail has no roots and may close without a CTA block; a two-sided page ends on one.
      if (cta ? cta.force !== 'power' : g.layout === 'two-sided') fail('cta-not-power', tag, cta ?? null);
      if (g.layout === 'two-sided' && g.spine != null) {
        for (const b of g.blocks) {
          if (b.hero || b.cta || b.tool || !Number.isFinite(b.l)) continue;
          if (b.force === 'will' && !(b.l > g.spine)) fail('will-not-right', tag, b);
          if (b.force === 'power' && !(b.r < g.spine)) fail('power-not-left', tag, b);
        }
      }
      for (const b of g.blocks) {
        if (b.cta || b.tool) continue;
        if (b.title && !faceOk(b.title.font, b.force)) fail('title-face', tag, b);
        if (b.body && !faceOk(b.body.font, b.force)) fail('body-face', tag, b);
      }
      const hero = g.blocks.find((b) => b.hero);
      if (hero?.title && hero.body && hero.title.px < hero.body.px * 1.35) {
        fail('hero-does-not-dominate-its-body', tag, hero);
      }
      const rects = await page.evaluate(collectTextRects);
      await page.addStyleTag({ content: TREE_ONLY_CSS });
      await page.waitForTimeout(150);
      const shot = join(OUT, `${slug}-${size.name}.png`);
      const treeOnly = await page.screenshot({ path: shot, type: 'png', fullPage: true });
      const hits = await bench.evaluate(measureInk, [
        treeOnly.toString('base64'),
        rects,
        g.footerTop,
        g.runBox,
      ]);
      if (hits.treeInk < 400) fail('no-tree-drawn', tag, hits);
      else if (hits.badCount > 0) fail('text-over-tree', tag, hits);
      else console.log('CLEAR', tag, `${hits.checked} text boxes and buttons, none touches tree ink`);
      if (g.layout === 'column' || g.layout === 'rail') {
        if (hits.inkInLast40 < 10) fail('trunk-does-not-run-to-the-end-behind-the-footer', tag, hits);
      }
      if (g.layout === 'two-sided') {
        if (hits.inkBehindFooter > 0) fail('tree-behind-footer-on-two-sided', tag, hits.inkBehindFooter);
        const [rootsL, rootsR] = hits.rootsSpread;
        if (rootsR >= rootsL && g.spine != null) {
          const left = Math.max(0, g.spine - rootsL);
          const right = Math.max(0, rootsR - g.spine);
          // A mirrored run (an off-centre spine) fans its roots into the narrow left side.
          const mirrored = await page.evaluate(() => getComputedStyle(document.querySelector('.inner-run')).transform !== 'none');
          const [near, far] = mirrored ? [right, left] : [left, right];
          if (!(far > near * 2)) fail('roots-fan-not-on-the-will-side', tag, { spine: g.spine, roots: hits.rootsSpread, mirrored });
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(failures === 0 ? 'INNER PROBE OK' : `INNER PROBE FAILURES: ${failures}`);
if (failures) process.exit(1);
