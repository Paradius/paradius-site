/**
 * Home v7 lifecycle math. Pure functions of (env, geometry): no DOM, no
 * module state, unit-testable. The engine (home-v7.ts) owns the DOM and
 * feeds these with cached geometry; appearance lives in CSS.
 */

/**
 * Inverted scroll: blocks enter from the TOP and descend into the reading zone.
 * The LEADING edge is the block's visual BOTTOM. Progress anchors there, so a
 * block starts emerging the instant its first pixel enters, regardless of height.
 */
export const SETTLE_ENTRY_START = 0;
/** Fully emerged when the leading (bottom) edge reaches this fraction of viewport. */
export const SETTLE_ENTRY_END = 0.5;
/** Leaving in reverse, gone once the leading edge rises to this fraction: shorter
 *  than the entry, so the departing block never stacks on the neighbour below. */
export const SETTLE_EXIT_END = 0.25;

export type SettleWindow = 'entry' | 'exit';
/** Near the canopy, remaining blocks RAMP to completion as scroll approaches 0. */
export const CANOPY_RAMP = 0.3;

/* Funnel exit (owner-approved model evolution, 2026-08-30): blocks do not
   stay parked once built. Past the reading zone they keep travelling and
   fade out. Exit is disabled near the canopy so the final frame stays whole. */
export const FUNNEL_EXIT_START = 0.6;
export const FUNNEL_EXIT_END = 0.82;
export const FUNNEL_CANOPY_HOLD = 0.35;
/** The hold releases over this extra fraction of viewport, so leaving the
 * canopy re-enables exits as a fade, never as a switch (blocks were popping
 * from held-visible to mid-exit when crossing the boundary). */
export const FUNNEL_CANOPY_RAMP = 0.25;

export interface LifecycleEnv {
  viewportH: number;
  /** Remaining scroll in px: 0 at the canopy, maxScroll at the landing. */
  current: number;
  hijack: boolean;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Build progress for a block whose visual box spans [top, bottom] in
 * viewport px. 0 = not entered, 1 = fully built. The exit window is the
 * shorter path a block follows while leaving in reverse.
 */
export function settleProgress(env: LifecycleEnv, top: number, bottom: number, window: SettleWindow = 'entry'): number {
  if (bottom <= 0) return 0;
  if (top >= env.viewportH) return 1;

  const start = env.viewportH * (window === 'exit' ? SETTLE_EXIT_END : SETTLE_ENTRY_START);
  const end = env.viewportH * SETTLE_ENTRY_END;
  let t = smoothstep((bottom - start) / (end - start));

  // Canopy: ramp remaining blocks to completion as scroll approaches 0.
  // A hard snap here made the final block jump into alignment mid-birth.
  if (env.hijack && env.current <= env.viewportH * CANOPY_RAMP && top < env.viewportH) {
    t = Math.max(t, smoothstep(1 - env.current / (env.viewportH * CANOPY_RAMP)));
  }

  return clamp(t, 0, 1);
}

/**
 * The window a block follows. It switches only where both windows agree
 * (built: leading edge past the entry end; gone: leading edge above the top
 * edge), so a reversal mid-build never jumps.
 */
export function settleWindow(prev: SettleWindow, bottom: number, viewportH: number, reverse: boolean): SettleWindow {
  if (bottom >= viewportH * SETTLE_ENTRY_END) return reverse ? 'exit' : 'entry';
  if (bottom <= 0) return 'entry';
  return prev;
}

/** Funnel-exit progress: 0 = still parked/reading, 1 = fully departed.
 *  Near the canopy the exit is held off, releasing gradually over
 *  FUNNEL_CANOPY_RAMP so reverse travel reads as the same funnel played
 *  backwards instead of a visibility switch. */
export function exitProgress(env: LifecycleEnv, top: number): number {
  if (!env.hijack) return 0;
  const hold = smoothstep(
    (env.current / env.viewportH - FUNNEL_CANOPY_HOLD) / FUNNEL_CANOPY_RAMP,
  );
  if (hold <= 0) return 0;
  const start = env.viewportH * FUNNEL_EXIT_START;
  const end = env.viewportH * FUNNEL_EXIT_END;
  return hold * smoothstep((top - start) / (end - start));
}

/**
 * Frame-rate-independent damping. `factorAt60` is the legacy per-frame LERP
 * factor the motion was calibrated with on a 60Hz display; the returned
 * factor produces IDENTICAL motion per unit time at any refresh rate
 * (a 240Hz frame advances a quarter as far as a 60Hz frame, four times as
 * often). dt is clamped so a background-tab hiccup cannot teleport.
 */
export function dampingFactor(dtMs: number, factorAt60: number): number {
  const dt = clamp(dtMs, 1, 100);
  const lambda = -Math.log(1 - factorAt60) * 60;
  return 1 - Math.exp(-lambda * (dt / 1000));
}

/** Quantize to 1/steps increments: fewer style invalidations, no visible banding. */
export function quantize(v: number, steps = 20): number {
  return Math.round(v * steps) / steps;
}

/** Journey purity scale: 0 at the roots (landing), 1 at the canopy. */
export function journeyOf(scrollY: number, maxScroll: number): number {
  return maxScroll > 0 ? clamp(1 - scrollY / maxScroll, 0, 1) : 1;
}

export interface Box {
  top: number;
  bottom: number;
}

export interface BoxAnchor {
  index: number;
  fraction: number;
}

export function nearestPageIndex(pageTops: readonly number[], scrollY: number): number {
  let best = -1;
  let bestDist = Infinity;
  pageTops.forEach((top, i) => {
    const d = Math.abs(top - scrollY);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export function captureBoxAnchor(boxes: readonly Box[], lineDocY: number): BoxAnchor | null {
  let best = -1;
  let bestDist = Infinity;
  boxes.forEach((box, i) => {
    const d = lineDocY < box.top ? box.top - lineDocY : lineDocY > box.bottom ? lineDocY - box.bottom : 0;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  if (best < 0) return null;
  const { top, bottom } = boxes[best];
  const height = bottom - top;
  return { index: best, fraction: height > 0 ? (lineDocY - top) / height : 0 };
}

export function restoreBoxAnchor(
  boxes: readonly Box[],
  anchor: BoxAnchor,
  lineOffset: number,
  maxScroll: number,
): number {
  const box = boxes[anchor.index];
  if (!box) return clamp(0, 0, maxScroll);
  return clamp(box.top + anchor.fraction * (box.bottom - box.top) - lineOffset, 0, maxScroll);
}
