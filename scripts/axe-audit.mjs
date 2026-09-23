/**
 * axe-core accessibility audit via Playwright.
 * Prerequisite: `npm run preview` serving the built site (default port 4321).
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'about', path: '/about/' },
  { slug: 'faq', path: '/faq/' },
  { slug: 'how-we-work', path: '/how-we-work/' },
  { slug: 'careers', path: '/careers/' },
  { slug: 'talent', path: '/talent/' },
  { slug: 'talent-PRD-001', path: '/talent/PRD-001/' },
  { slug: 'work', path: '/work/' },
  { slug: 'work-banking-infrastructure', path: '/work/banking-infrastructure/' },
  { slug: 'contact', path: '/contact/' },
  { slug: 'legal-privacy', path: '/legal/privacy/' },
  { slug: 'legal-terms', path: '/legal/terms/' },
  { slug: 'not-found', path: '/404' },
];

const browser = await chromium.launch({ headless: true });
let totalViolations = 0;

for (const page of PAGES) {
  const context = await browser.newContext();
  const tab = await context.newPage();
  await tab.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle' });
  const results = await new AxeBuilder({ page: tab }).analyze();
  const violations = results.violations;
  totalViolations += violations.length;
  console.log(`=== ${page.slug}: ${violations.length} violations ===`);
  for (const v of violations) {
    console.log(`[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
  }
  await context.close();
}

await browser.close();

if (totalViolations > 0) {
  console.error(`\naxe-core: ${totalViolations} violation(s) found`);
  process.exit(1);
}

console.log('\naxe-core: 0 violations across all pages');
