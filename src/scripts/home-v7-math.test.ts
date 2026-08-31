import { describe, expect, it } from 'vitest';
import {
  FUNNEL_CANOPY_HOLD,
  FUNNEL_EXIT_END,
  FUNNEL_EXIT_START,
  OPACITY_DELAY,
  SETTLE_ENTRY_END,
  exitProgress,
  fadeOpacity,
  journeyOf,
  quantize,
  settleProgress,
} from './home-v7-math';

const VH = 1000;
const midJourney = { viewportH: VH, current: VH * 2, hijack: true };

describe('settleProgress', () => {
  it('returns 0 while the block is fully above the viewport', () => {
    expect(settleProgress(midJourney, -500, -10)).toBe(0);
  });

  it('returns 1 once the block has left through the bottom edge', () => {
    expect(settleProgress(midJourney, VH + 5, VH + 400)).toBe(1);
  });

  it('reaches 1 exactly when the leading edge hits the entry end line', () => {
    const bottom = VH * SETTLE_ENTRY_END;
    expect(settleProgress(midJourney, bottom - 300, bottom)).toBe(1);
  });

  it('is halfway (smoothstepped) when the leading edge is at half the window', () => {
    const bottom = (VH * SETTLE_ENTRY_END) / 2;
    expect(settleProgress(midJourney, bottom - 300, bottom)).toBeCloseTo(0.5, 5);
  });

  it('ramps unborn blocks to completion as the scroll reaches the canopy', () => {
    const atCanopy = { viewportH: VH, current: 0, hijack: true };
    expect(settleProgress(atCanopy, 100, 120)).toBe(1);
  });

  it('does not canopy-ramp when not hijacked', () => {
    const native = { viewportH: VH, current: 0, hijack: false };
    const hijacked = { viewportH: VH, current: 0, hijack: true };
    expect(settleProgress(hijacked, 100, 120)).toBe(1);
    expect(settleProgress(native, 100, 120)).toBeLessThan(0.2);
  });
});

describe('exitProgress', () => {
  it('is 0 without hijack', () => {
    expect(exitProgress({ viewportH: VH, current: VH, hijack: false }, VH)).toBe(0);
  });

  it('is 0 while resting at the canopy', () => {
    const resting = { viewportH: VH, current: VH * FUNNEL_CANOPY_HOLD, hijack: true };
    expect(exitProgress(resting, VH)).toBe(0);
  });

  it('is 0 before the exit window and 1 past it', () => {
    expect(exitProgress(midJourney, VH * FUNNEL_EXIT_START)).toBe(0);
    expect(exitProgress(midJourney, VH * FUNNEL_EXIT_END)).toBe(1);
  });

  it('is halfway (smoothstepped) at the middle of the exit window', () => {
    const mid = VH * ((FUNNEL_EXIT_START + FUNNEL_EXIT_END) / 2);
    expect(exitProgress(midJourney, mid)).toBeCloseTo(0.5, 5);
  });
});

describe('fadeOpacity', () => {
  it('stays invisible until the opacity delay', () => {
    expect(fadeOpacity(OPACITY_DELAY)).toBe(0);
    expect(fadeOpacity(OPACITY_DELAY - 0.1)).toBe(0);
  });

  it('reaches full opacity at full build', () => {
    expect(fadeOpacity(1)).toBe(1);
  });

  it('is linear between delay and full build', () => {
    const mid = OPACITY_DELAY + (1 - OPACITY_DELAY) / 2;
    expect(fadeOpacity(mid)).toBeCloseTo(0.5, 5);
  });
});

describe('quantize', () => {
  it('rounds to 0.05 steps by default', () => {
    expect(quantize(0.4249)).toBeCloseTo(0.4, 5);
    expect(quantize(0.4251)).toBeCloseTo(0.45, 5);
  });

  it('preserves the endpoints exactly', () => {
    expect(quantize(0)).toBe(0);
    expect(quantize(1)).toBe(1);
  });
});

describe('journeyOf', () => {
  it('is 0 at the landing and 1 at the canopy', () => {
    expect(journeyOf(4000, 4000)).toBe(0);
    expect(journeyOf(0, 4000)).toBe(1);
  });

  it('clamps out-of-range scroll and degenerate maxScroll', () => {
    expect(journeyOf(5000, 4000)).toBe(0);
    expect(journeyOf(-50, 4000)).toBe(1);
    expect(journeyOf(100, 0)).toBe(1);
  });
});
