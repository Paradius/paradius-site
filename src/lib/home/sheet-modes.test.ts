import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { modesOf } from './sheet-modes';

describe('modesOf', () => {
  it('reads the mode off a class list', () => {
    expect(modesOf('home-v7__row home-v7__row--voice')).toEqual(['voice']);
    expect(modesOf('home-v7__row home-v7__row--branch home-v7__row--left home-v7__row--pair')).toEqual(['pair']);
  });

  it('counts the mirrored half as one pair, not two modes', () => {
    expect(modesOf('home-v7__row home-v7__row--pair home-v7__row--pair-2')).toEqual(['pair']);
  });

  it('reports a sheet wearing two modes', () => {
    expect(modesOf('home-v7__row home-v7__row--voice home-v7__row--pair')).toEqual(['voice', 'pair']);
  });

  it('reports a sheet wearing none', () => {
    expect(modesOf('home-v7__row home-v7__row--branch')).toEqual([]);
  });
});

const sheets = [...readFileSync('src/pages/index.astro', 'utf8').matchAll(/<section\s[^>]*class="([^"]*home-v7__row[^"]*)"/g)]
  .map((match, index) => ({ index, classList: match[1] }));

describe('every sheet of the home declares one mode', () => {
  it('finds every sheet', () => {
    expect(sheets.length).toBeGreaterThan(10);
  });

  it.each(sheets)('sheet $index', ({ classList }) => {
    expect(modesOf(classList)).toHaveLength(1);
  });
});
