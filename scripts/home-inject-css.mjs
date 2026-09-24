#!/usr/bin/env node
// Injects one VARIANTS override into the live home tab of a browser opened with
// --remote-debugging-port, so the owner can judge it in his own window.
// Usage: node scripts/home-inject-css.mjs <variant|reset> [cdpUrl] [pageUrlPrefix]
import { chromium } from 'playwright-core';
import { VARIANTS } from './home-variants.mjs';

const [variant = 'reset', CDP = 'http://127.0.0.1:9222', PREFIX = 'http://localhost:4322/'] = process.argv.slice(2);
const browser = await chromium.connectOverCDP(CDP);
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().startsWith(PREFIX));
if (!page) throw new Error(`no tab starting with ${PREFIX}`);
if (variant === 'reset') {
  await page.reload({ waitUntil: 'load' });
} else {
  if (!(variant in VARIANTS)) throw new Error(`unknown variant ${variant}; known: ${Object.keys(VARIANTS).join(', ')}`);
  await page.evaluate(() => document.querySelectorAll('style[data-home-variant]').forEach((s) => s.remove()));
  await page.evaluate((css) => { const s = document.createElement('style'); s.dataset.homeVariant = '1'; s.textContent = css; document.head.append(s); }, VARIANTS[variant]);
}
console.log(`${variant} applied`);
await browser.close().catch(() => {});
