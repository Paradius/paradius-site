/** Global glow strength on inner pages when nothing overrides it (0..1). */
export const GLOW_DEFAULT = 0.7;
/** Strength kept by the block furthest from the canopy. */
export const GLOW_FLOOR = 0.65;

/** White group: the halo of the letterforms. */
export const INNER_GLOW_WHITE_TARGETS = ['.inner-title'] as const;
/** Dark group: the luminous-darkness pool that quenches the tree lines. */
export const INNER_GLOW_DARK_TARGETS = [
  '.inner-kicker',
  '.inner-block--hero .inner-body p',
  '.inner-block--cta .inner-body p',
] as const;
export const INNER_GLOW_SELECTOR = [...INNER_GLOW_WHITE_TARGETS, ...INNER_GLOW_DARK_TARGETS].join(', ');

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Strength by where the block sits: 1 for the first block, GLOW_FLOOR for one whose bottom meets the document's. */
export function glowLevel(blockTop: number, blockHeight: number, docHeight: number): number {
  const travel = docHeight - blockHeight;
  if (travel <= 0) return 1;
  return 1 - (1 - GLOW_FLOOR) * clamp01(blockTop / travel);
}

/**
 * `?glow=<0..1>` sticks for the tab; `?glow=off` clears it. `store` is the value to write
 * to session storage (`null` = remove, `undefined` = leave as is).
 */
export function resolveGlowUser(
  search: string,
  stored: string | null,
): { value: number; store: string | null | undefined } {
  const raw = new URLSearchParams(search).get('glow');
  if (raw === 'off') return { value: GLOW_DEFAULT, store: null };
  const fromQuery = raw === null ? Number.NaN : Number.parseFloat(raw);
  if (Number.isFinite(fromQuery)) {
    const value = clamp01(fromQuery);
    return { value, store: String(value) };
  }
  const fromStore = stored === null ? Number.NaN : Number.parseFloat(stored);
  if (Number.isFinite(fromStore)) return { value: clamp01(fromStore), store: undefined };
  return { value: GLOW_DEFAULT, store: undefined };
}
