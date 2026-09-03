/**
 * Home v7 — Diagonal axis settle + inverted scroll.
 *
 * Responsibilities are split for performance:
 *  - home-v7-math.ts: pure lifecycle math (unit-tested).
 *  - this file: DOM ownership. Geometry is measured ONCE per layout epoch
 *    (init / resize / mode change) and derived arithmetically per frame, so
 *    the frame path performs zero layout reads. Style writes are quantized
 *    and dirty-checked so untouched elements cost nothing.
 */

import {
  type LifecycleEnv,
  clamp,
  dampingFactor,
  exitProgress,
  journeyOf,
  quantize,
  settleProgress,
} from './home-v7-math';
import { prepareGlowClones } from './home-v7-glow';

/* Chase factor per 60Hz-equivalent frame (time-normalized downstream).
   0.24 reproduces the feel the owner tuned on his high-refresh display
   before the normalization fix; it now feels the same on any monitor. */
const LERP = 0.1;
const SCROLL_SPEED = 0.55;
const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_MOBILE_FACTOR = 0.55;

/* Appearance (pull distances, fades, scale) lives ENTIRELY in CSS: see the
   "Motion contract" section of the home style block. This file only writes
   the lifecycle scalars --settle / --exit and the state classes. */

interface RevealTarget {
  el: HTMLElement;
  /** Document-space geometry: visual top/bottom = doc value - scrollY. */
  docTop: number;
  docBottom: number;
  /* Last written values, for dirty-checking the style writes. */
  lastSettle: string;
  lastSettleQ: string;
  lastExit: string;
  lastMoving: boolean;
  lastNear: boolean;
}

let hijack = false;
let wheelBound = false;
let scrollBound = false;
let wasMobileLayout = false;
let mobileLayout = false;
let target = 0;
let current = 0;
let maxScroll = 0;
let landingScroll = 0;
let viewportH = 0;
let navH = 0;
let reveals: RevealTarget[] = [];
let reducedMotion = false;
let tree: HTMLElement | null = null;
let treeMaxOffset = 0;
let homeRoot: HTMLElement | null = null;
let frameDirty = true;
let lastApplied = Number.NaN;
let lastJourney = -1;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function isMobileLayout(): boolean {
  return window.matchMedia('(max-width: 768px)').matches;
}

function canHijack(): boolean {
  return !isCoarsePointer() && !isMobileLayout() && !prefersReducedMotion();
}

function getMain(): HTMLElement | null {
  return document.getElementById('main-content');
}

function env(): LifecycleEnv {
  return { viewportH, current, hijack };
}

function measure(): void {
  const header = document.getElementById('header');
  navH = header?.offsetHeight ?? 0;
  viewportH = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportH);
  treeMaxOffset = tree ? Math.max(0, tree.offsetHeight - viewportH) : 0;
}

function measureLanding(): void {
  const hero = document.querySelector<HTMLElement>('.home-v7__hero');
  if (!hero) {
    landingScroll = maxScroll;
    return;
  }
  const rect = hero.getBoundingClientRect();
  landingScroll = clamp(window.scrollY + rect.top, 0, maxScroll);
}

function setInverted(enabled: boolean): void {
  getMain()?.classList.toggle('inverted-scroll', enabled);
}

let lastTreeShift = '';
let lastTreeFade = '';

/** Contract: the engine writes --tree-shift/--tree-fade on the home root;
 *  CSS applies them to the tree AND its shimmer twins (no mirror JS loop). */
function setTreeProgress(scrollY: number): void {
  if (!homeRoot || maxScroll <= 0) return;

  const progress = hijack ? 1 - scrollY / maxScroll : scrollY / maxScroll;
  const mobileFactor = mobileLayout ? TREE_MOBILE_FACTOR : 1;
  const opacity =
    (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * mobileFactor;
  const shift = `${Math.round(-treeMaxOffset * (1 - progress))}px`;
  const fade = String(quantize(opacity, 1000));

  if (shift !== lastTreeShift) {
    lastTreeShift = shift;
    homeRoot.style.setProperty('--tree-shift', shift);
  }
  if (fade !== lastTreeFade) {
    lastTreeFade = fade;
    homeRoot.style.setProperty('--tree-fade', fade);
  }
}

function collectReveals(): void {
  reveals = [];
  document.querySelectorAll<HTMLElement>('.home-v7__clip').forEach((el) => {
    reveals.push({
      el,
      docTop: 0,
      docBottom: 0,
      lastSettle: '',
      lastSettleQ: '',
      lastExit: '',
      lastMoving: false,
      lastNear: false,
    });
    el.classList.add('home-v7__clip--live');
  });
}

/* Soft scroll anchors: when the wheel rests mid-ascent near a block's
   presentation point, the target drifts gently into it (descent is always
   free). SNAP_ENABLED is the master switch: false makes the whole system
   inert with zero per-frame cost.
   Dials: SNAP_RADIUS_VH (capture range), SNAP_PULL (drift speed),
   SNAP_IDLE_MS (rest before pull), SNAP_READING_LINE (park line, vh),
   SNAP_MERGE_VH (anchors closer than this fuse into one). */
const SNAP_ENABLED_DEFAULT = false;
/** Runtime state; the A key toggles it (tuning aid). */
let snapEnabled = SNAP_ENABLED_DEFAULT;
const SNAP_RADIUS_VH = 0.35;
const SNAP_IDLE_MS = 160;
const SNAP_READING_LINE = 0.55;
/** Drift fraction per frame: the magnet reaches from further away but pulls
 *  gently, a slow slide into place instead of a yank. */
/* 0.045 reproduces the drift the owner validated pre-normalization on his
   high-refresh display (0.012 x ~3.7 effective). */
const SNAP_PULL = 0.045;
const SNAP_MERGE_VH = 0.15;
let anchors: number[] = [];
let lastWheelAt = 0;
let snapArmed = false;
let ascending = false;

function computeAnchors(): void {
  const raw = reveals
    .map((item) => item.docBottom - viewportH * SNAP_READING_LINE)
    .filter((a) => a > 0 && a < maxScroll)
    .sort((a, b) => a - b);
  anchors = [0];
  for (const a of raw) {
    if (a - anchors[anchors.length - 1] > viewportH * SNAP_MERGE_VH) anchors.push(a);
  }
  if (landingScroll > 0) anchors.push(landingScroll);
}

function maybeSnap(dt: number): void {
  // The magnet only exists while ASCENDING the tree. Descending (reverse
  // travel) is always free: no pull, however slow the gesture.
  if (!snapEnabled || !hijack || !snapArmed || !ascending) return;
  if (performance.now() - lastWheelAt < SNAP_IDLE_MS) return;
  let best = Number.NaN;
  let bestDist = viewportH * SNAP_RADIUS_VH;
  for (const a of anchors) {
    if (a > target) continue; // only anchors ahead in the ascent
    const d = target - a;
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  if (Number.isNaN(best)) {
    snapArmed = false;
    return;
  }
  // Gentle continuous drift; the LERP smooths it further downstream.
  target += (best - target) * dampingFactor(dt, SNAP_PULL);
  if (Math.abs(best - target) < 0.5) {
    target = best;
    snapArmed = false;
  }
}

/**
 * One layout epoch: batch save/clear transforms, ONE layout flush for all
 * rects, restore. Untransformed geometry never changes during scroll, so
 * per-frame rects derive from `docTop - scrollY` with zero reads.
 */
function measureReveals(): void {
  const saved: string[] = [];
  for (const item of reveals) {
    saved.push(item.el.style.transform);
    item.el.style.transform = 'none';
  }
  const scrollY = window.scrollY;
  reveals.forEach((item, i) => {
    const rect = item.el.getBoundingClientRect();
    item.docTop = rect.top + scrollY;
    item.docBottom = rect.bottom + scrollY;
    item.el.style.transform = saved[i];
  });
}

/** Layer promotion only while the block actually moves: no permanent textures. */
function writeMoving(item: RevealTarget, moving: boolean): void {
  if (moving !== item.lastMoving) {
    item.lastMoving = moving;
    item.el.classList.toggle('home-v7__clip--moving', moving);
  }
}

function applySettle(item: RevealTarget, t: number, exit: number): void {
  const build = clamp(t, 0, 1);
  // 1/1000 steps: sub-pixel smooth for the CSS transform, and the string
  // compare skips the write entirely for blocks at rest.
  const settle = String(quantize(build, 1000));
  const exitOut = String(quantize(exit, 1000));

  if (settle !== item.lastSettle) {
    item.lastSettle = settle;
    item.el.style.setProperty('--settle', settle);
  }
  // Coarse channel for paint-heavy consumers (the glow): 0.05 steps.
  const settleQ = String(quantize(build * (1 - exit)));
  if (settleQ !== item.lastSettleQ) {
    item.lastSettleQ = settleQ;
    item.el.style.setProperty('--settle-q', settleQ);
  }
  if (exitOut !== item.lastExit) {
    item.lastExit = exitOut;
    item.el.style.setProperty('--exit', exitOut);
  }
  writeMoving(item, build > 0 && (build < 1 || exit > 0));
}

/** GPU budget: glow clone layers stay promoted only near the viewport.
 *  Wide hysteresis (promote inside ±1.5 screens, demote beyond ±3) so both
 *  transitions happen far offscreen. STAGGERED: at most one promotion or
 *  demotion per frame; a batch of blocks crossing the boundary together
 *  (the canopy cluster) used to raster all its clone textures in one frame,
 *  a deterministic micro-hitch at that scroll zone. */
let nearBudget = 0;

function writeNear(item: RevealTarget, index: number, top: number, bottom: number): void {
  // Staggered activation distances (1.5 / 1.8 / 2.1 / 2.4 screens by index):
  // neighboring clones become rasterizable at DIFFERENT scroll depths, so a
  // dense cluster (the canopy) never enters the raster window as one batch.
  const activate = 1.5 + (index % 4) * 0.3;
  const inner = item.lastNear ? activate + 1.5 : activate;
  const near = bottom > -inner * viewportH && top < (1 + inner) * viewportH;
  if (near !== item.lastNear && nearBudget > 0) {
    nearBudget -= 1;
    item.lastNear = near;
    item.el.classList.toggle('home-v7__clip--near', near);
  }
}

function clearSettle(item: RevealTarget): void {
  item.el.style.removeProperty('--settle');
  item.el.style.removeProperty('--settle-q');
  item.el.style.removeProperty('--exit');
  item.el.classList.remove('home-v7__clip--live', 'home-v7__clip--moving', 'home-v7__clip--near');
  item.lastSettle = '';
  item.lastSettleQ = '';
  item.lastExit = '';
  item.lastMoving = false;
  item.lastNear = false;
}

function updateReveals(scrollY: number): void {
  if (reducedMotion) return;

  /* Natural mode (mobile/touch, no wheel hijack): the document keeps normal
     order and native scroll physics; the ASCENT semantics are produced by
     reflecting the viewport coordinates and the remaining scroll into the
     inverted model. Same math, same tests, zero duplicated lifecycle. */
  const natural = !hijack;
  const e: LifecycleEnv = natural
    ? { viewportH, current: Math.max(0, maxScroll - scrollY), hijack: true }
    : env();
  nearBudget = 1;
  for (let i = 0; i < reveals.length; i++) {
    const item = reveals[i];
    let top = item.docTop - scrollY;
    let bottom = item.docBottom - scrollY;
    if (natural) {
      const t = top;
      top = viewportH - bottom;
      bottom = viewportH - t;
    }
    const t = settleProgress(e, top, bottom);
    applySettle(item, t, exitProgress(e, top));
    writeNear(item, i, top, bottom);
  }
}

/**
 * Journey purity scale (0 roots .. 1 canopy), read by the CSS glow tokens.
 * Written on the home root (never documentElement: that invalidates the whole
 * document) and ONLY at rest: recoloring the glow stacks forces a broad style
 * recalc + repaint, so it must never land mid-scroll.
 */
let lastNativeScrollAt = 0;

function updateJourney(scrollY: number): void {
  if (!homeRoot || current !== target) return;
  // Natural mode has no LERP: "rest" means the native scroll went quiet.
  if (!hijack && performance.now() - lastNativeScrollAt < 150) return;
  const effective = hijack ? scrollY : Math.max(0, maxScroll - scrollY);
  const j = quantize(journeyOf(effective, maxScroll));
  if (j === lastJourney) return;
  lastJourney = j;
  homeRoot.style.setProperty('--journey', String(j));
}

function applyFrame(): void {
  const scrollY = hijack ? current : window.scrollY;
  if (hijack) {
    window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  }
  setTreeProgress(scrollY);
  updateJourney(scrollY);
  updateReveals(scrollY);
  lastApplied = current;
  frameDirty = false;
}

let lastTickAt = 0;

function tick(now: number): void {
  const dt = lastTickAt ? now - lastTickAt : 1000 / 60;
  lastTickAt = now;
  maybeSnap(dt);
  // Time-normalized damping: identical feel at 60Hz and 240Hz; high-refresh
  // displays get proportionally more animation frames, not faster motion.
  current += (target - current) * dampingFactor(dt, LERP);
  if (Math.abs(target - current) < 0.5) current = target;
  // Idle bail: at rest with everything applied, the frame costs one compare.
  if (frameDirty || current !== lastApplied || (current === target && lastJourney < 0)) {
    applyFrame();
  } else if (current === target) {
    updateJourney(current);
  }
  requestAnimationFrame(tick);
}

function onWheel(e: WheelEvent): void {
  if (!hijack) return;
  e.preventDefault();
  target = clamp(target - e.deltaY * SCROLL_SPEED, 0, maxScroll);
  lastWheelAt = performance.now();
  ascending = e.deltaY > 0;
  snapArmed = true;
}

function onKeydown(e: KeyboardEvent): void {
  if (!hijack) return;

  const step = viewportH * 0.35;
  let delta = 0;

  if (e.key === 'a' || e.key === 'A') {
    snapEnabled = !snapEnabled;
    return;
  }

  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    delta = -step;
    e.preventDefault();
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    delta = step;
    e.preventDefault();
  } else if (e.key === 'Home') {
    target = landingScroll;
    e.preventDefault();
    return;
  } else if (e.key === 'End') {
    target = 0;
    e.preventDefault();
    return;
  }

  if (delta !== 0) target = clamp(target + delta, 0, maxScroll);
}

function onNativeScroll(): void {
  if (hijack) return;
  lastNativeScrollAt = performance.now();
  current = window.scrollY;
  target = current;
  setTreeProgress(current);
  updateReveals(current);
}

function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  target = clamp(window.scrollY + rect.top - navH, 0, maxScroll);
}

function bindHashNav(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.replace('#', '');
      e.preventDefault();
      scrollToSection(id);

      document.querySelector('.site-header__nav')?.classList.remove('site-header__nav--open');
      document
        .querySelector('.site-header__menu-toggle')
        ?.setAttribute('aria-expanded', 'false');
      document
        .querySelector('.site-header__menu-toggle')
        ?.classList.remove('site-header__menu-toggle--active');
      document.documentElement.classList.remove('menu-open');
    });
  });
}

/** Static presentation: without --live the motion contract applies nothing. */
function revealAll(): void {
  for (const item of reveals) clearSettle(item);
}

function syncScrollListeners(): void {
  if (hijack && !wheelBound) {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    wheelBound = true;
  } else if (!hijack && wheelBound) {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeydown);
    wheelBound = false;
  }

  if (!hijack && !scrollBound) {
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    scrollBound = true;
  } else if (hijack && scrollBound) {
    window.removeEventListener('scroll', onNativeScroll);
    scrollBound = false;
  }
}

function setupMode(): void {
  tree = document.querySelector<HTMLElement>('[data-home-v7-tree]');
  homeRoot = document.querySelector<HTMLElement>('.home-v7');
  measure();
  mobileLayout = isMobileLayout();
  const nextHijack = canHijack();

  if (hijack && !nextHijack) {
    for (const item of reveals) clearSettle(item);
  }

  if (wasMobileLayout && !mobileLayout) {
    for (const item of reveals) clearSettle(item);
  }

  hijack = nextHijack;
  wasMobileLayout = mobileLayout;
  setInverted(hijack);
  collectReveals();
  measureReveals();
  syncScrollListeners();
  frameDirty = true;
  lastJourney = -1;

  if (reducedMotion) {
    revealAll();
    return;
  }

  if (hijack) {
    measureLanding();
    computeAnchors();
    target = landingScroll;
    current = landingScroll;
    applyFrame();
    return;
  }

  current = window.scrollY;
  target = current;
  setTreeProgress(current);
  updateReveals(current);
}

let resizeTimeout: number | null = null;

function onResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const anchor = window.scrollY;
    setupMode();
    if (!hijack && !mobileLayout) {
      current = anchor;
      target = anchor;
      setTreeProgress(anchor);
      updateReveals(anchor);
    }
  }, 150);
}

async function init(): Promise<void> {
  const root = document.querySelector('.home-v7');
  if (!root) return;

  reducedMotion = prefersReducedMotion();
  await document.fonts.ready;
  // All modes, mobile included: the clones ARE the glow. Static pages just
  // paint them once and never touch them again.
  prepareGlowClones(root);
  bindHashNav();
  setupMode();

  if (reducedMotion) {
    // Tree resting pose comes from the prefers-reduced-motion CSS block.
    revealAll();
    return;
  }

  window.addEventListener('resize', onResize);
  requestAnimationFrame(tick);

  (window as Window & { __homeV7SetScroll?: (y: number) => void }).__homeV7SetScroll = (
    y: number,
  ) => {
    target = clamp(y, 0, maxScroll);
    current = target;
    applyFrame();
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

export {};
