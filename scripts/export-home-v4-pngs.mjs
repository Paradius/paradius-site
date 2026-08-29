/**
 * Export home-v4 mockup layers as separate PNGs for manual assembly.
 * Usage: node scripts/export-home-v4-pngs.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.mockup-exports', 'home-v4');
const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const URL = `${BASE.replace(/\/$/, '')}/mockups/home-v4/`;

const VIEWPORT = { width: 1440, height: 900 };

async function prepareExport(page) {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  await page.evaluate(() => {
    document.documentElement.classList.add('home-v4-export');
    const style = document.createElement('style');
    style.textContent = `
      .home-v4-export *, .home-v4-export *::before, .home-v4-export *::after {
        animation: none !important;
        transition: none !important;
      }
      .home-v4-export .home-v4__reveal {
        opacity: 1 !important;
        transform: none !important;
      }
      .home-v4-export .home-v4__tagline,
      .home-v4-export .home-v4__subtitle,
      .home-v4-export .home-v4__actions {
        opacity: 1 !important;
        transform: none !important;
        filter: brightness(0) invert(1) !important;
        mask-position: 0% 100% !important;
        -webkit-mask-position: 0% 100% !important;
      }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('[data-home-v4-section]').forEach((el) => {
      el.classList.add('is-revealed');
    });

    // Disable inverted scroll hijack for stable element bounds
    window.__homeV4ExportMode = true;
    const main = document.getElementById('main-content');
    if (main) main.classList.remove('inverted-scroll');
  });

  await page.waitForTimeout(500);
}

async function shotElement(page, selector, filename, { pad = 24, fullElement = false } = {}) {
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0) {
    console.warn(`skip (missing): ${selector}`);
    return false;
  }
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);

  if (fullElement) {
    await loc.screenshot({ path: path.join(OUT, filename) });
    console.log(`ok: ${filename}`);
    return true;
  }

  const box = await loc.boundingBox();
  if (!box || box.width < 1 || box.height < 1) {
    console.warn(`skip (no box): ${selector}`);
    return false;
  }
  const vp = page.viewportSize() ?? VIEWPORT;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  const width = Math.min(box.width + pad * 2, vp.width - x);
  const height = Math.min(box.height + pad * 2, vp.height - y);
  if (width < 1 || height < 1) {
    console.warn(`skip (clip empty): ${selector}`);
    return false;
  }
  await page.screenshot({
    path: path.join(OUT, filename),
    clip: { x, y, width, height },
  });
  console.log(`ok: ${filename}`);
  return true;
}

async function shotTreeLayer(page) {
  await page.evaluate(() => {
    const hide = (sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.style.visibility = 'hidden';
      });
    };
    hide('.site-header');
    hide('.home-v4__main');
    hide('.footer-minimal');
    const tree = document.querySelector('[data-home-v4-tree]');
    if (tree) {
      tree.style.opacity = '0.38';
      tree.style.transform = 'translateX(-50%) translateY(-25vh)';
    }
    document.body.style.background = '#000';
  });
  await page.screenshot({
    path: path.join(OUT, '00-background-tree-viewport.png'),
    fullPage: false,
  });
  console.log('ok: 00-background-tree-viewport.png');

  // Tree at several scroll positions (content hidden, tree parallax simulated)
  await page.evaluate(() => {
    document.querySelector('.site-header')?.style.removeProperty('visibility');
    document.querySelector('.home-v4__main')?.style.removeProperty('visibility');
    document.querySelector('.footer-minimal')?.style.removeProperty('visibility');
  });

  const maxScroll = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  );
  for (const [label, frac] of [
    ['roots', 0],
    ['mid', 0.45],
    ['canopy', 0.92],
  ]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(maxScroll * frac));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT, `00-background-tree-scroll-${label}.png`),
      fullPage: false,
    });
    console.log(`ok: 00-background-tree-scroll-${label}.png`);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // Copy raw SVG assets
  for (const asset of [
    'public/assets/circuit_tree_full.svg',
    'public/assets/architecting_the_dawn_from_within.svg',
    'public/assets/paradius_logo.svg',
  ]) {
    const src = path.join(ROOT, asset);
    if (existsSync(src)) {
      await copyFile(src, path.join(OUT, path.basename(asset)));
      console.log(`copied: ${path.basename(asset)}`);
    }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  await prepareExport(page);

  // Full page scroll frames (with content)
  const maxScroll = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  );
  const scrollFrames = [
    ['hero', 0],
    ['conviction-engine', 0.18],
    ['selection', 0.38],
    ['operation-assurance', 0.58],
    ['cup', 0.82],
  ];
  for (const [label, frac] of scrollFrames) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(maxScroll * frac));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT, `fullpage-${label}.png`),
      fullPage: false,
    });
    console.log(`ok: fullpage-${label}.png`);
  }

  await shotTreeLayer(page);

  // Reset visibility for component shots
  await page.evaluate(() => {
    document.querySelectorAll('.site-header, .home-v4__main, .footer-minimal').forEach((el) => {
      el.style.removeProperty('visibility');
    });
    const tree = document.querySelector('[data-home-v4-tree]');
    if (tree) tree.style.removeProperty('opacity');
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(400);

  // Header & footer
  await shotElement(page, '.site-header', 'chrome-header.png', { pad: 0, fullElement: true });
  await shotElement(page, '.footer-minimal', 'chrome-footer.png', { fullElement: true });

  // Hero parts
  await shotElement(page, '.home-v4__tagline', 'hero-tagline.png');
  await shotElement(page, '.home-v4__subtitle', 'hero-subtitle.png');
  await shotElement(page, '.home-v4__actions', 'hero-ctas.png');
  await shotElement(page, '.home-v4__hero-inner', 'hero-combined.png');

  // Sections — text blocks (headers + copy, no card chrome where possible)
  const sections = [
    ['01-conviction', '.home-v4__section--conviction'],
    ['02-engine', '.home-v4__section--engine'],
    ['03-selection', '.home-v4__section--selection'],
    ['04-operation', '.home-v4__section--operation'],
    ['05-assurance', '.home-v4__section--assurance'],
    ['06-07-cup', '.home-v4__section--cup'],
  ];
  for (const [name, sel] of sections) {
    await shotElement(page, sel, `section-${name}.png`, { pad: 32 });
  }

  // Conviction split
  await shotElement(page, '.home-v4__section--conviction .home-v4__text', 'text-01-conviction-body.png');
  await shotElement(page, '.home-v4__section--conviction .home-v4__quote', 'text-01-conviction-quote.png');
  await shotElement(
    page,
    '.home-v4__section--engine .home-v4__title--engine',
    'text-02-engine-thesis.png',
  );

  // Engine pillars (cards)
  await page.locator('.home-v4__section--engine').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i++) {
    await shotElement(
      page,
      `.home-v4__pillars > .home-v4__pillar:nth-child(${i + 1})`,
      `card-engine-pillar-${i + 1}.png`,
      { fullElement: true },
    );
  }
  await shotElement(page, '.home-v4__engine-cta', 'text-02-engine-cta-link.png', { fullElement: true });

  // Selection steps (cards)
  await page.locator('.home-v4__section--selection').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) {
    await shotElement(
      page,
      `.home-v4__steps > .home-v4__step:nth-child(${i + 1})`,
      `card-selection-step-${i + 1}.png`,
      { fullElement: true },
    );
  }

  // Operation blocks
  await page.locator('.home-v4__section--operation').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i++) {
    await shotElement(
      page,
      `.home-v4__ops-grid > .home-v4__ops-block:nth-child(${i + 1})`,
      `card-operation-block-${i + 1}.png`,
      { fullElement: true },
    );
  }

  // Assurance strip
  await page.locator('.home-v4__section--assurance').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shotElement(page, '.home-v4__assurance-strip', 'card-assurance-strip.png', { fullElement: true });

  // Cup columns
  await page.locator('.home-v4__section--cup').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shotElement(page, '.home-v4__cup-col--evidence', 'card-cup-evidence.png', { fullElement: true });
  await shotElement(page, '.home-v4__cup-col--registry', 'card-cup-registry.png', { fullElement: true });

  // Eyebrows only (small crops)
  const eyebrows = page.locator('.home-v4__eyebrow');
  const count = await eyebrows.count();
  for (let i = 0; i < count; i++) {
    const el = eyebrows.nth(i);
    const text = (await el.textContent())?.trim().replace(/\s+/g, '-') ?? `eyebrow-${i}`;
    const box = await el.boundingBox();
    if (!box) continue;
    await el.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(OUT, `label-${text}.png`),
      clip: {
        x: Math.max(0, box.x - 8),
        y: Math.max(0, box.y - 4),
        width: box.width + 16,
        height: box.height + 8,
      },
    });
    console.log(`ok: label-${text}.png`);
  }

  await writeFile(
    path.join(OUT, 'README.txt'),
    `Home v4 PNG exports
Generated from: ${URL}
Viewport: ${VIEWPORT.width}x${VIEWPORT.height}

Folders / naming:
- 00-background-*     Circuit tree layer (viewport + scroll positions)
- fullpage-*          Full viewport composites at scroll positions
- chrome-*            Header / footer
- hero-*              Hero lockup, subtitle, CTAs
- section-*           Full sections (text + cards together)
- text-*              Text-only crops
- card-*              Individual cards / strips
- label-*             Eyebrow labels (01 — CONVICTION, etc.)
- *.svg               Raw vector assets

Tip: Stack in Figma with black (#000) canvas. Tree layer goes behind content.
`,
  );

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
