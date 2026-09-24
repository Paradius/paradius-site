import { describe, expect, it } from 'vitest';
import { GLOW_DEFAULT, GLOW_FLOOR, glowLevel, resolveGlowUser } from './inner-glow';

describe('glowLevel', () => {
  it('is full for a block whose centre sits at the top of the document', () => {
    expect(glowLevel(0, 400, 4000)).toBe(1);
  });

  it('reaches the floor for a block at the very bottom', () => {
    expect(glowLevel(3600, 400, 4000)).toBeCloseTo(GLOW_FLOOR, 5);
  });

  it('falls linearly with the block centre between top and bottom', () => {
    const mid = glowLevel(1800, 400, 4000);
    expect(mid).toBeCloseTo(1 - (1 - GLOW_FLOOR) * 0.5, 5);
  });

  it('never leaves the floor..1 range with degenerate geometry', () => {
    expect(glowLevel(-100, 10, 0)).toBe(1);
    expect(glowLevel(9000, 100, 4000)).toBe(GLOW_FLOOR);
  });
});

describe('resolveGlowUser', () => {
  it('returns the default when neither query nor storage says anything', () => {
    expect(resolveGlowUser('', null)).toEqual({ value: GLOW_DEFAULT, store: undefined });
  });

  it('takes a numeric query value and asks to store it', () => {
    expect(resolveGlowUser('?glow=0.4', null)).toEqual({ value: 0.4, store: '0.4' });
  });

  it('clamps the query value into 0..1', () => {
    expect(resolveGlowUser('?glow=3', null).value).toBe(1);
    expect(resolveGlowUser('?glow=-1', null).value).toBe(0);
  });

  it('prefers the stored value when the query is silent', () => {
    expect(resolveGlowUser('?other=1', '0.25')).toEqual({ value: 0.25, store: undefined });
  });

  it('clears storage and returns the default on glow=off', () => {
    expect(resolveGlowUser('?glow=off', '0.25')).toEqual({ value: GLOW_DEFAULT, store: null });
  });

  it('ignores garbage in query and storage', () => {
    expect(resolveGlowUser('?glow=abc', 'xyz')).toEqual({ value: GLOW_DEFAULT, store: undefined });
  });
});
