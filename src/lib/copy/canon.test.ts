import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findBannedDashes, visibleCopyOf } from './quality';

const ROOTS = ['src/pages', 'src/components', 'src/layouts'];

const astroFiles = ROOTS.flatMap((root) =>
  readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.astro'))
    .map((name) => join(root, name)),
);

describe('the text quality bar holds on every page', () => {
  it('finds files to check', () => {
    expect(astroFiles.length).toBeGreaterThan(10);
  });

  it.each(astroFiles)('%s has no banned dashes in visible copy', (file) => {
    expect(findBannedDashes(visibleCopyOf(readFileSync(file, 'utf8')))).toEqual([]);
  });
});
