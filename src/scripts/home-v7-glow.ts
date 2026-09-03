/**
 * Glow layer architecture: every glow-bearing text gets a ::after clone of
 * its own glyphs (content: attr(data-text)) that carries the ENTIRE shadow
 * stack on its own compositor layer, painted once. The real element keeps a
 * bare-text raster, so scroll never repaints glow pixels.
 *
 * This module owns the census: which elements glow. The CSS clone rules and
 * these selectors must describe the same set; the unit test pins the list.
 * The two prophecy elements (--oneline) are excluded: they carry bespoke
 * ::before clones and stay hand-tuned.
 */

/** Dark group: luminous-darkness pool (gray text). */
export const GLOW_DARK_TARGETS = [
  '.home-v7__peak-lead:not(.home-v7__peak-lead--oneline)',
  '.home-v7__peak--dim',
  '.home-v7__force-text',
  '.home-v7__force-label--will',
  '.home-v7__ops-title',
  '.home-v7__ops-text',
  '.home-v7__text',
  '.home-v7__graft',
  '.home-v7__graft-link',
] as const;

/** White group: dim halo of the letterforms (white text). */
export const GLOW_WHITE_TARGETS = [
  '.home-v7__peak:not(.home-v7__peak--dim):not(.home-v7__peak--oneline)',
  '.home-v7__voice',
  '.home-v7__force-text--power',
  '.home-v7__force-label--power',
] as const;

export const GLOW_SELECTOR = [...GLOW_DARK_TARGETS, ...GLOW_WHITE_TARGETS].join(', ');

/**
 * One-time pass: clone source text into data-text and mark the host.
 * Idempotent; returns the number of hosts prepared.
 */
export function prepareGlowClones(root: ParentNode): number {
  const targets = root.querySelectorAll<HTMLElement>(GLOW_SELECTOR);
  targets.forEach((el) => {
    if (el.dataset.text === undefined) {
      el.dataset.text = el.textContent ?? '';
    }
    el.classList.add('home-v7__glow-host');
  });
  return targets.length;
}
