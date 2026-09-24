// CSS overrides shared by the home probes and the live injector: each one
// removes or cheapens a single suspect so the cost can be bisected in a real browser.
export const VARIANTS = {
  default: '',
  noglow: '.home-v7__glow-host::after, .home-v7__peak--oneline::before, .home-v7__peak-lead--oneline::before { display: none !important; }',
  notree: '[class*="home-v7__tree"], .home-v7__glow-ramp { display: none !important; }',
  promoted: '.home-v7__clip--live { will-change: transform, opacity, filter !important; }',
  nofilter: '.home-v7__clip--live { filter: none !important; }',
  noafter: '.home-v7__glow-host::after { display: none !important; }',
  nopeak: '.home-v7__peak--oneline::before, .home-v7__peak-lead--oneline::before { display: none !important; }',
  oneshadow: '.home-v7__glow-host::after { text-shadow: 0 0 30px rgb(var(--ink-dark)) !important; }',
  twoshadow:
    '.home-v7__force-text::after, .home-v7__force-label--will::after, .home-v7__ops-title::after, .home-v7__ops-text::after, .home-v7__text::after, .home-v7__graft::after, .home-v7__graft-link::after { text-shadow: 0 0 12px rgb(var(--ink-dark) / 1), 0 0 32px rgb(var(--ink-dark) / 0.9), 0 0 34px rgb(var(--ink-mist) / calc(0.22 * var(--mist-purity, 1))) !important; }' +
    '.home-v7__peak:not(.home-v7__peak--dim):not(.home-v7__peak--oneline)::after, .home-v7__voice::after, .home-v7__force-text--power::after, .home-v7__force-label--power::after { text-shadow: 0 0 14px rgb(255 255 255 / calc(0.42 * var(--white-purity, 1))), 0 0 32px rgb(255 255 255 / calc(0.24 * var(--white-purity, 1))) !important; }',
  innerflat: '.inner-block { --glow-level: 1 !important; }',
  blurclone: '.home-v7__glow-host::after { text-shadow: none !important; color: rgb(var(--ink-dark)) !important; filter: blur(14px) !important; }',
};
