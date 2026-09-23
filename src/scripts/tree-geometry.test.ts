import { describe, expect, it } from 'vitest';
import { ART, CANOPY, MODULES, SEAM, canopyLift, canopySide, fillers, rhythm, rhythmCap, rng, runLeft, scale, seedOf } from './tree-geometry';

const trunk = (k: number) => ART.trunkHalf * 2 * k;

describe('canopySide', () => {
  it('two-sided: the canopy fans away from the hero', () => {
    expect(canopySide('will', 'two-sided')).toBe('left');
    expect(canopySide('power', 'two-sided')).toBe('right');
  });
  it('column: the trunk keeps the side it had, so the canopy crosses over', () => {
    expect(canopySide('will', 'column')).toBe('right');
    expect(canopySide('power', 'column')).toBe('left');
  });
  it('rail: always fans right', () => {
    expect(canopySide('will', 'rail')).toBe('right');
    expect(canopySide('power', 'rail')).toBe('right');
  });
});

describe('scale', () => {
  const two = (frameWidth: number, pad: number) => scale({ layout: 'two-sided', frameWidth, pad, svh: 900, heroBeside: false, canopy: CANOPY.right });
  it('two-sided at 1440 gives a 60px trunk', () => { expect(trunk(two(1440, 54.4))).toBeCloseTo(60.2, 0); });
  it('two-sided at 1204 gives a 50px trunk', () => { expect(trunk(two(1204, 51.17))).toBeCloseTo(49.8, 0); });
  it('two-sided at 753 is clamped up to 44px', () => { expect(trunk(two(753, 32))).toBeCloseTo(44, 5); });
  it('two-sided at 2000 is clamped down to 64px', () => { expect(trunk(two(2000, 54.4))).toBeCloseTo(64, 5); });
  it('rail with the hero beside the canopy scales like two-sided', () => {
    expect(trunk(scale({ layout: 'rail', frameWidth: 1440, pad: 54.4, svh: 900, heroBeside: true, canopy: CANOPY.right }))).toBeCloseTo(60.2, 0);
  });
  it('rail with the hero below the canopy scales by the viewport height', () => {
    expect(trunk(scale({ layout: 'rail', frameWidth: 753, pad: 32, svh: 1036, heroBeside: false, canopy: CANOPY.right }))).toBeCloseTo(57.6, 0);
  });
  it('column on a phone', () => {
    expect(trunk(scale({ layout: 'column', frameWidth: 448, pad: 27.2, svh: 803, heroBeside: false, canopy: CANOPY.right }))).toBeCloseTo(44.7, 0);
  });
});

describe('canopyLift and runLeft', () => {
  it('two-sided never lifts and centres the trunk', () => {
    const input = { layout: 'two-sided' as const, frameWidth: 1440, pad: 54.4, svh: 900, heroBeside: false, canopy: CANOPY.right };
    const k = scale(input);
    expect(canopyLift(k, input)).toBe(0);
    expect(runLeft(k, 'right', input) + ART.trunkX * k).toBeCloseTo(720, 5);
  });
  it('column lifts the canopy above its share and puts the trunk at the pad', () => {
    const input = { layout: 'column' as const, frameWidth: 448, pad: 27.2, svh: 803, heroBeside: false, canopy: CANOPY.right };
    const k = scale(input);
    expect(canopyLift(k, input)).toBeGreaterThan(0);
    expect(runLeft(k, 'right', input) + (ART.trunkX - ART.trunkHalf) * k).toBeCloseTo(27.2, 5);
  });
});

describe('seedOf and rng', () => {
  it('is deterministic per name and differs between names', () => {
    const a = rng(seedOf('about')); const b = rng(seedOf('about')); const c = rng(seedOf('faq'));
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect([c(), c(), c()]).not.toEqual(first);
    first.forEach((v) => { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); });
  });
});

describe('fillers', () => {
  it('returns null when the pieces cannot fit', () => { expect(fillers(100, 3, null, rng(1), 1, 200)).toBeNull(); });
  it('returns pieces that fit the space', () => {
    const picks = fillers(300, 2, null, rng(1), 1, 200);
    expect(picks).not.toBeNull();
    expect(picks!.length).toBe(2);
    expect(picks!.reduce((sum, m) => sum + m.h, 0)).toBeLessThanOrEqual(300);
  });
});

describe('rhythm', () => {
  const k = 0.92;
  it('covers the run in ascending, non-overlapping steps', () => {
    const steps = rhythm([400, 900], 300, 1500, k, rhythmCap('two-sided', k), rng(7));
    expect(steps.length).toBeGreaterThan(0);
    let cursor = 300;
    for (const step of steps) {
      expect(step.top).toBeGreaterThanOrEqual(cursor - SEAM - 0.01);
      cursor = step.piece ? step.top + step.piece.h * k : step.top + (step.len ?? 0);
    }
    expect(cursor).toBeCloseTo(1500, 0);
  });
  it('places a module on an anchor when it fits', () => {
    const steps = rhythm([700], 300, 1500, k, rhythmCap('two-sided', k), rng(7));
    const onAnchor = steps.find((s) => s.piece && s.top <= 700 && s.top + s.piece.h * k >= 700);
    expect(onAnchor).toBeDefined();
  });
  it('stays fast with forty anchors on a nine-thousand pixel run', () => {
    const anchors = Array.from({ length: 40 }, (_, i) => 400 + i * 220);
    const t0 = performance.now();
    const steps = rhythm(anchors, 300, 9200, k, rhythmCap('column', k), rng(3));
    expect(performance.now() - t0).toBeLessThan(200);
    expect(steps.length).toBeGreaterThan(40);
  });
  it('with no anchors still fills from start to end', () => {
    const steps = rhythm([], 0, 1000, k, rhythmCap('two-sided', k), rng(5));
    const last = steps[steps.length - 1];
    const end = last.piece ? last.top + last.piece.h * k : last.top + (last.len ?? 0);
    expect(end).toBeCloseTo(1000, 0);
    expect(MODULES.length).toBe(3);
  });
});
