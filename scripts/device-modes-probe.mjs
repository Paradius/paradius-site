import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.PROBE_URL ?? 'http://localhost:4321/';

const UA = {
  pixel:
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  tab: 'Mozilla/5.0 (Linux; Android 14; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  desktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};

export const CONFIGS = {
  // Measured on the owner's Pixel 9 in Chrome (viewport after browser and system bars).
  'pixel-portrait': { w: 448, h: 803, dpr: 2.25, touch: true, ua: UA.pixel, platform: 'Android', device: 'touch' },
  'pixel-landscape': { w: 998, h: 385, dpr: 2.25, touch: true, ua: UA.pixel, platform: 'Android', device: 'touch' },
  'tab-portrait': { w: 753, h: 1036, dpr: 2.125, touch: true, ua: UA.tab, platform: 'Android', device: 'touch' },
  // Measured on the owner's Tab S7 FE in Chrome (viewport after browser and system bars).
  'tab-landscape': { w: 1204, h: 585, dpr: 2.125, touch: true, ua: UA.tab, platform: 'Android', device: 'touch' },
  desktop: { w: 1440, h: 900, touch: false, ua: UA.desktop, platform: 'Windows', device: 'desktop' },
  'desktop-narrow': { w: 600, h: 900, touch: false, ua: UA.desktop, platform: 'Windows', device: 'desktop' },
};

export async function openConfig(browser, name) {
  const c = CONFIGS[name];
  const context = await browser.newContext({
    viewport: { width: c.w, height: c.h },
    hasTouch: c.touch,
    isMobile: c.touch,
    deviceScaleFactor: c.dpr ?? 2,
    userAgent: c.ua,
  });
  // Headless keeps userAgentData.platform = Linux even with a UA override: pin it.
  await context.addInitScript((platform) => {
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      get: () => ({ platform, mobile: false, brands: [] }),
    });
  }, c.platform);
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return { context, page };
}

const PROPS = [
  'display', 'position', 'box-sizing', 'width', 'min-height', 'max-width',
  'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
  'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  'font-size', 'font-family', 'line-height', 'letter-spacing', 'text-align',
  'flex-direction', 'justify-content', 'align-items', 'gap',
  'grid-template-columns', 'border-left-width', 'border-right-width',
  'scroll-snap-type', 'scroll-snap-align', 'mask-size', 'visibility', 'z-index',
];

async function fingerprint(page) {
  return page.evaluate((props) => {
    const pick = (el) => {
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    };
    const nodes = [document.documentElement, ...document.querySelectorAll('.home-v7 *, #header, #header *')];
    return nodes.map((el, i) => ({
      i,
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.replace(/home-v7__clip--(birth|born|live|moving|near)/g, '').trim() : '',
      style: pick(el),
    }));
  }, PROPS);
}

async function runFingerprint(outDir) {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
  for (const name of ['pixel-portrait', 'desktop']) {
    const { context, page } = await openConfig(browser, name);
    writeFileSync(join(outDir, `${name}.json`), JSON.stringify(await fingerprint(page), null, 1));
    await context.close();
  }
  await browser.close();
}

const EXPECT_ENGINE = { touch: 'pager', desktop: 'guided' };
let failures = 0;
function report(ok, config, check, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${config} ${check} ${detail}`);
}

async function runMatrix() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
  for (const [name, c] of Object.entries(CONFIGS)) {
    const { context, page } = await openConfig(browser, name);
    const s = await page.evaluate(() => ({
      device: document.documentElement.dataset.device,
      engine: document.documentElement.dataset.homeEngine,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      toggle: getComputedStyle(document.querySelector('.site-header__menu-toggle')).display,
    }));
    report(s.device === c.device, name, 'device', s.device);
    report(s.engine === EXPECT_ENGINE[c.device], name, 'engine', s.engine);
    report(s.overflow <= 0, name, 'no-horizontal-overflow', `${s.overflow}px`);
    if (c.device === 'touch') report(s.toggle === 'flex', name, 'header-collapsed', s.toggle);
    await context.close();
  }

  {
    const { context, page } = await openConfig(browser, 'pixel-portrait');
    const k = 5;
    for (let i = 0; i < k; i++) await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(900);
    const before = await page.evaluate(() => window.__homeV7Anchor());
    await page.setViewportSize({ width: 915, height: 412 });
    await page.waitForTimeout(1200);
    const after = await page.evaluate((i) => ({
      anchor: window.__homeV7Anchor(),
      top: Math.round(
        [...document.querySelectorAll('.home-v7__hero, .home-v7__row')]
          .filter((el) => !el.classList.contains('home-v7__row--pair-2'))
          [i].getBoundingClientRect().top,
      ),
      reflowing: document.documentElement.hasAttribute('data-reflowing'),
    }), k);
    report(before === k && after.anchor === k && Math.abs(after.top) <= 2, 'pixel-rotate', 'same-page', `${before}->${after.anchor} top ${after.top}`);
    report(!after.reflowing, 'pixel-rotate', 'unfrozen', String(after.reflowing));
    await context.close();
  }

  {
    const { context, page } = await openConfig(browser, 'desktop');
    const mid = await page.evaluate(() => Math.round((document.documentElement.scrollHeight - window.innerHeight) * 0.5));
    await page.evaluate((y) => window.__homeV7SetScroll(y), mid);
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.__homeV7Anchor());
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({
      anchor: window.__homeV7Anchor(),
      reflowing: document.documentElement.hasAttribute('data-reflowing'),
    }));
    const same = before && after.anchor && before.index === after.anchor.index && Math.abs(before.fraction - after.anchor.fraction) < 0.05;
    report(Boolean(same), 'desktop-resize', 'same-section', `${JSON.stringify(before)}->${JSON.stringify(after.anchor)}`);
    report(!after.reflowing, 'desktop-resize', 'unfrozen', String(after.reflowing));
    await context.close();
  }

  await browser.close();
  if (failures) process.exit(1);
}

const [mode, arg] = process.argv.slice(2);
if (mode === 'fingerprint') await runFingerprint(arg);
if (mode === 'matrix') await runMatrix();
