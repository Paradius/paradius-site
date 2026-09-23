export type Layout = 'two-sided' | 'rail' | 'column';
export type Force = 'will' | 'power';
export type Side = 'left' | 'right';

export interface PieceSpec {
  file: string;
  y0: number;
  h: number;
}

export interface CanopySpec extends PieceSpec {
  fan: number;
  back: number;
}

export interface RootsSpec extends PieceSpec {
  back: number;
}

export const ART: { w: number; h: number; trunkX: number; trunkHalf: number } = {
  w: 1430,
  h: 1360,
  trunkX: 708,
  trunkHalf: 32.65,
};

export const CANOPY: Record<Side, CanopySpec> = {
  left: { file: 'topNoRight.svg', y0: 0, h: 591.55, fan: 703.7, back: 99.7 },
  right: { file: 'topNoLeft.svg', y0: 0, h: 591.68, fan: 722, back: 67.5 },
};

export const ROOTS: RootsSpec = { file: 'bottomNoLeft.svg', y0: 990.71, h: 369.29, back: 65.3 };

export const MODULES: PieceSpec[] = [
  { file: 'segmentSmall.svg', y0: 589.59, h: 53.90 },
  { file: 'segmentMedium.svg', y0: 788.73, h: 91.62 },
  { file: 'segmentLarge.svg', y0: 710.84, h: 146.29 },
];

export const FLAT = 'flatElastic.svg';
export const SEAM = 0.5;
export const PIECE_MARGIN = 8;
export const CANOPY_SHARE = 0.36;
export const RAIL_SHARE = 0.5;
export const TREE_FACTOR = 1.4;
export const TRUNK_MIN = 44;
export const TRUNK_MAX = 64;
export const TWO_SIDED = '(min-width: 700px)';
export const HERO_BESIDE = '(min-width: 900px)';

export interface ScaleInput {
  layout: Layout;
  frameWidth: number;
  pad: number;
  svh: number;
  heroBeside: boolean;
  canopy: CanopySpec;
}

export function canopySide(force: Force, layout: Layout): Side {
  return layout === 'rail' ? 'right' : (force === 'will') === (layout === 'two-sided') ? 'left' : 'right';
}

export function scale(input: ScaleInput): number {
  const beside = input.layout === 'rail' && input.heroBeside;
  const k =
    input.layout === 'two-sided' || beside
      ? (input.frameWidth / 2 - input.pad) / input.canopy.fan
      : Math.min(
          (input.frameWidth - input.pad * 2) / (input.canopy.fan + ART.trunkHalf),
          (CANOPY_SHARE * input.svh) / input.canopy.h,
        ) * TREE_FACTOR;
  return Math.min(TRUNK_MAX / (ART.trunkHalf * 2), Math.max(TRUNK_MIN / (ART.trunkHalf * 2), k));
}

export function canopyLift(k: number, input: ScaleInput): number {
  return input.layout === 'two-sided'
    ? 0
    : Math.max(
        0,
        input.canopy.h * k - (input.layout === 'rail' && input.heroBeside ? RAIL_SHARE : CANOPY_SHARE) * input.svh,
      );
}

export function runLeft(k: number, side: Side, input: Pick<ScaleInput, 'layout' | 'frameWidth' | 'pad'>): number {
  return input.layout === 'two-sided'
    ? input.frameWidth / 2 - ART.trunkX * k
    : side === 'left'
      ? input.frameWidth - input.pad - (ART.trunkX + ART.trunkHalf) * k
      : input.pad - (ART.trunkX - ART.trunkHalf) * k;
}

export function rhythmCap(layout: Layout, k: number): number {
  return (layout === 'two-sided' ? MODULES[2].h : MODULES[0].h) * k;
}

export function seedOf(name: string): number {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) hash = Math.imul(hash ^ name.charCodeAt(i), 16777619);
  return hash >>> 0;
}

export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(next: () => number): PieceSpec[] {
  const pool = MODULES.slice();
  const out: PieceSpec[] = [];
  while (pool.length) {
    const picked = pool.splice(Math.floor(next() * pool.length), 1)[0];
    if (picked) out.push(picked);
  }
  return out;
}

export function fillers(
  space: number,
  count: number,
  last: PieceSpec | null,
  next: () => number,
  k: number,
  cap: number,
): PieceSpec[] | null {
  const least = space - cap * (count + 1);
  const tall = MODULES[2].h * k;
  const mid = MODULES[1].h * k;
  // Without this bound the search is exponential in the gap: minutes on a 40-row page.
  const most = (left: number) => Math.ceil(left / 2) * tall + Math.floor(left / 2) * mid;
  const walk = (left: number, before: PieceSpec | null, sum: number): PieceSpec[] | null => {
    if (sum > space || sum + most(left) < least) return null;
    if (!left) return sum >= least ? [] : null;
    const open = shuffle(next).filter((m) => m !== before);
    for (let i = 0; i < open.length; i++) {
      const rest = walk(left - 1, open[i], sum + open[i].h * k);
      if (rest) return [open[i]].concat(rest);
    }
    return null;
  };
  return walk(count, last, 0);
}

export interface Step {
  top: number;
  len?: number;
  piece?: PieceSpec;
}

export function rhythm(
  anchors: number[],
  from: number,
  to: number,
  k: number,
  cap: number,
  next: () => number,
): Step[] {
  const small = MODULES[0].h * k;
  const steps: Step[] = [];
  let cursor = from;
  let prev: PieceSpec | null = null;
  const bridge = (top: number) => {
    const gap = top - cursor;
    let picks: PieceSpec[] | null = null;
    if (gap > cap) {
      for (let n = 1; !picks && n <= Math.ceil(gap / small); n++) picks = fillers(gap, n, prev, next, k, cap);
    }
    if (!picks) {
      steps.push({ top: cursor, len: gap });
    } else {
      const used = picks.reduce((sum, m) => sum + m.h * k, 0);
      const span = (gap - used) / (picks.length + 1);
      picks.forEach((m) => {
        steps.push({ top: cursor, len: span });
        cursor += span;
        steps.push({ piece: m, top: cursor });
        cursor += m.h * k;
        prev = m;
      });
      steps.push({ top: cursor, len: span });
    }
    cursor = top;
  };

  anchors.forEach((a, i, all) => {
    const limit = i + 1 < all.length ? all[i + 1] - small / 2 : to;
    let chosen: PieceSpec | null = null;
    let top = 0;
    shuffle(next).some((m) => {
      if (m === prev) return false;
      const h = m.h * k;
      if (a - h / 2 < cursor || a + h / 2 > limit) return false;
      chosen = m;
      top = a - h / 2;
      return true;
    });
    if (!chosen) {
      if (cursor + small > limit) return;
      chosen = MODULES[0];
      top = cursor;
    }
    bridge(top);
    steps.push({ piece: chosen, top });
    cursor = top + chosen.h * k;
    prev = chosen;
  });
  bridge(to);
  return steps;
}

export interface SeatInput {
  mode: 'two-sided' | 'rail' | 'dossier';
  railBelow: number;
  spine: number;
  force: Force;
  frameWidth: number;
  pad: number;
  svh: number;
  twoSided: boolean;
  heroBeside: boolean;
  railBelowMatches: boolean;
}

export interface Seat {
  layout: Layout;
  side: Side;
  k: number;
  trunk: 'left' | 'right' | null;
  props: Record<string, string>;
}

/* Everything the first layout needs, computed from numbers only: the inline script at the
   end of main and the deferred module both call it, so the values never differ. */
export function seat(input: SeatInput): Seat | null {
  const layout: Layout = !input.twoSided
    ? 'column'
    : input.mode === 'rail' || (input.mode === 'dossier' && input.railBelowMatches)
      ? 'rail'
      : 'two-sided';
  const side = canopySide(input.force, layout);
  const canopy = CANOPY[side];
  const heroBeside = layout === 'rail' && input.heroBeside;
  const scaleInput = { layout, frameWidth: input.frameWidth, pad: input.pad, svh: input.svh, heroBeside, canopy };
  const k = scale(scaleInput);
  if (!(k > 0)) return null;
  const px = (units: number): string => `${(units * k).toFixed(2)}px`;
  return {
    layout,
    side,
    k,
    trunk: layout === 'two-sided' ? null : side === 'left' ? 'right' : 'left',
    props: {
      '--canopy-lift': canopyLift(k, scaleInput).toFixed(2) + 'px',
      '--canopy-h': px(canopy.h),
      '--canopy-back': px(canopy.back),
      '--canopy-fan': px(canopy.fan),
      '--trunk-edge': px(ART.trunkHalf),
      '--trunk-clear': px(ART.trunkHalf * 2),
      '--roots-h': px(ROOTS.h),
      '--roots-back': px(ROOTS.back),
    },
  };
}

export function applySeat(root: HTMLElement, s: Seat): void {
  root.dataset.layout = s.layout;
  root.dataset.canopy = s.side;
  if (s.trunk) root.dataset.trunk = s.trunk;
  else delete root.dataset.trunk;
  for (const [name, value] of Object.entries(s.props)) root.style.setProperty(name, value);
}
