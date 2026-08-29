import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findBannedDashes } from './quality';

describe('findBannedDashes', () => {
  it('returns empty for clean text', () => {
    expect(findBannedDashes('Power and Will, united. No dashes here.')).toEqual([]);
  });

  it('finds an em-dash with line and column', () => {
    expect(findBannedDashes('clean line\nbad — line')).toEqual([
      { line: 2, column: 5, char: '—' },
    ]);
  });

  it('finds an en-dash', () => {
    expect(findBannedDashes('range 1–2')).toEqual([
      { line: 1, column: 8, char: '–' },
    ]);
  });

  it('finds multiple occurrences across lines', () => {
    const hits = findBannedDashes('a—b\nc–d\ne—f');
    expect(hits).toHaveLength(3);
    expect(hits.map((h) => h.line)).toEqual([1, 2, 3]);
  });
});

/**
 * Canon manifest: files rewritten or created under the 2026-08-28 site
 * architecture plan. Checked only once they exist, so tasks can land in
 * any order. Tasks 11 and 12 append their entries when they clean their
 * files (cases.json and ContactForm.astro contain banned dashes today).
 */
const CANON_FILES = [
  'src/pages/legal/privacy.astro',
  'src/pages/legal/terms.astro',
  'src/pages/how-we-work.astro',
  'src/pages/about.astro',
  'src/pages/faq.astro',
  'src/pages/careers.astro',
  'src/pages/404.astro',
  'src/pages/index.astro',
  'src/components/Header.astro',
  'src/components/Footer.astro',
];

describe('canon files carry no banned dashes', () => {
  for (const relPath of CANON_FILES) {
    it(relPath, () => {
      const absPath = resolve(process.cwd(), relPath);
      if (!existsSync(absPath)) return; // not yet created by its task
      const hits = findBannedDashes(readFileSync(absPath, 'utf8'));
      expect(hits, `${relPath} -> ${JSON.stringify(hits)}`).toEqual([]);
    });
  }
});
