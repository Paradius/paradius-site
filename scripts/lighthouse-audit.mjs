/**
 * Lighthouse audit runner — uses Playwright Chromium with remote debugging.
 * Prerequisite: `npm run preview` serving the built site (default port 4321).
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
const OUT_DIR = path.join(ROOT, '.lighthouse');

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'about', path: '/about/' },
  { slug: 'faq', path: '/faq/' },
  { slug: 'how-we-work', path: '/how-we-work/' },
  { slug: 'careers', path: '/careers/' },
  { slug: 'talent', path: '/talent/' },
  { slug: 'talent-PA-D1B6D4', path: '/talent/PA-D1B6D4/' },
  { slug: 'work', path: '/work/' },
  { slug: 'work-banking-infrastructure', path: '/work/banking-infrastructure/' },
  { slug: 'contact', path: '/contact/' },
  { slug: 'legal-privacy', path: '/legal/privacy/' },
  { slug: 'legal-terms', path: '/legal/terms/' },
  { slug: 'not-found', path: '/404' },
];

function runLighthouse(url, outFile, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'lighthouse',
        url,
        `--port=${port}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        `--output-path=${outFile}`,
        '--output=json',
        '--quiet',
      ],
      { cwd: ROOT, stdio: 'inherit' },
    );
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Lighthouse failed for ${url} (exit ${code})`));
    });
  });
}

const chromePath = chromium.executablePath();
const chrome = spawn(
  chromePath,
  ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9222', 'about:blank'],
  { stdio: 'ignore' },
);

await new Promise((r) => setTimeout(r, 2000));

await mkdir(OUT_DIR, { recursive: true });

const rows = [];

for (const page of PAGES) {
  const outFile = path.join(OUT_DIR, `${page.slug}.json`);
  const url = `${BASE_URL}${page.path}`;
  console.log(`Auditing ${url}…`);
  await runLighthouse(url, outFile, 9222);
  const report = JSON.parse(await import('node:fs').then((fs) => fs.promises.readFile(outFile, 'utf8')));
  const c = report.categories;
  rows.push({
    page: page.slug,
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
  });
}

chrome.kill();

console.log('\n| Page | Perf | A11y | BP | SEO |');
console.log('|------|------|------|----|-----|');
for (const row of rows) {
  console.log(
    `| ${row.page} | ${row.performance} | ${row.accessibility} | ${row.bestPractices} | ${row.seo} |`,
  );
}

await writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(rows, null, 2));
