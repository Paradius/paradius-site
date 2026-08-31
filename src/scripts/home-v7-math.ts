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
/** Near the canopy, remaining blocks RAMP to completion as scroll approaches 0. */
export const CANOPY_RAMP = 0.3;

/* Funnel exit (owner-approved model evolution, 2026-08-30): blocks do not
   stay parked once built. Past the reading zone they keep travelling and
   fade out. Exit is disabled near the canopy so the final frame stays whole. */
export const FUNNEL_EXIT_START = 0.6;
export const FUNNEL_EXIT_END = 0.82;
export const FUNNEL_CANOPY_HOLD = 0.35;

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
 * viewport px. 0 = not entered, 1 = fully built.
 */
export function settleProgress(env: LifecycleEnv, top: number, bottom: number): number {
  if (bottom <= 0) return 0;
  if (top >= env.viewportH) return 1;

  const start = env.viewportH * SETTLE_ENTRY_START;
  const end = env.viewportH * SETTLE_ENTRY_END;
  let t = smoothstep((bottom - start) / (end - start));

  // Canopy: ramp remaining blocks to completion as scroll approaches 0.
  // A hard snap here made the final block jump into alignment mid-birth.
  if (env.hijack && env.current <= env.viewportH * CANOPY_RAMP && top < env.viewportH) {
    t = Math.max(t, smoothstep(1 - env.current / (env.viewportH * CANOPY_RAMP)));
  }

  return clamp(t, 0, 1);
}

/** Funnel-exit progress: 0 = still parked/reading, 1 = fully departed. */
export function exitProgress(env: LifecycleEnv, top: number): number {
  if (!env.hijack) return 0;
  if (env.current <= env.viewportH * FUNNEL_CANOPY_HOLD) return 0;
  const start = env.viewportH * FUNNEL_EXIT_START;
  const end = env.viewportH * FUNNEL_EXIT_END;
  return smoothstep((top - start) / (end - start));
}

/** Quantize to 1/steps increments: fewer style invalidations, no visible banding. */
export function quantize(v: number, steps = 20): number {
  return Math.round(v * steps) / steps;
}

/** Journey purity scale: 0 at the roots (landing), 1 at the canopy. */
export function journeyOf(scrollY: number, maxScroll: number): number {
  return maxScroll > 0 ? clamp(1 - scrollY / maxScroll, 0, 1) : 1;
}
