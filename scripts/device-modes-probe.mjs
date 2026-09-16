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
  'pixel-portrait': { w: 412, h: 915, touch: true, ua: UA.pixel, platform: 'Android', device: 'touch' },
  'pixel-landscape': { w: 915, h: 412, touch: true, ua: UA.pixel, platform: 'Android', device: 'touch' },
  'tab-portrait': { w: 800, h: 1280, touch: true, ua: UA.tab, platform: 'Android', device: 'touch' },
  'tab-landscape': { w: 1280, h: 800, touch: true, ua: UA.tab, platform: 'Android', device: 'touch' },
  desktop: { w: 1440, h: 900, touch: false, ua: UA.desktop, platform: 'Windows', device: 'desktop' },
  'desktop-narrow': { w: 600, h: 900, touch: false, ua: UA.desktop, platform: 'Windows', device: 'desktop' },
};

export async function openConfig(browser, name) {
  const c = CONFIGS[name];
  const context = await browser.newContext({
    viewport: { width: c.w, height: c.h },
    hasTouch: c.touch,
    isMobile: c.touch,
    deviceScaleFactor: 2,
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

const [mode, arg] = process.argv.slice(2);
if (mode === 'fingerprint') await runFingerprint(arg);
