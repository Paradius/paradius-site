/**
 * Home v7 — Diagonal axis settle + inverted scroll.
 * Same motion that felt good — progress inverted so construction = emerge from spine.
 */

const LERP = 0.12;
const SCROLL_SPEED = 1.0;
const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_MOBILE_FACTOR = 0.55;
const REDUCED_OPACITY = 0.17;

/**
 * Inverted scroll: blocks enter from the TOP and descend into the reading zone.
 * The LEADING edge is the block's visual BOTTOM — progress anchors there, so a
 * block starts emerging the instant its first pixel enters, regardless of height.
 * (Anchoring on rect.top made tall blocks sit mostly on-screen, still invisible,
 * until their top edge finally entered — the "appears too late" bug.)
 */
const SETTLE_ENTRY_START = 0;
/** Fully emerged when the leading (bottom) edge reaches this fraction of viewport. */
const SETTLE_ENTRY_END = 0.45;
/**
 * No artificial side phase: with leading-edge anchoring, geometry orders the
 * births naturally — whichever block hangs lower enters (and is born) first.
 */
const SETTLE_SIDE_NUDGE = 0;
/** Opacity stays at 0 until this fraction of the emerge (0–1). Late enough
 * that a nascent block has cleared the previous same-side block below it. */
const OPACITY_DELAY = 0.55;
/**
 * Ascending diagonal from spine: Y must dominate X or it reads as a horizontal wipe.
 * Collapsed = toward spine + below rest → settles up and out (branch growth).
 *
 * CRITICAL: settle velocity competes with scroll flow. During the build the flow
 * drags the block DOWN one viewport-px per scrolled px; if pullY < the entry window
 * (SETTLE_ENTRY_END * vh) the ascent is cancelled and only X remains visible — it
 * reads as a horizontal sweep. pullY MUST exceed the window so the block gains
 * net upward motion on screen while it is born (corner-to-corner steep diagonal).
 */
const BRANCH_PULL_X_VH = 0.06;
const BRANCH_PULL_Y_VH = 0.55;
/**
 * Subtle uniform scale anchored at the spine-bottom corner (transform-origin in CSS).
 * Every point's motion vector then radiates from bottom-inner toward top-outer,
 * so the reveal reads as an ASCENDING diagonal (bottom-spine → center → top-outer),
 * not a top-left-down sweep. Uniform and small: no text deformation at rest.
 */
const BRANCH_SCALE_PULL = 0.06;

function branchSign(side: RevealSide): number {
  return side === 'left' ? 1 : -1;
}

function clearInnerTransform(el: HTMLElement): void {
  el.querySelector<HTMLElement>(':scope > .home-v7__clip-inner')?.style.removeProperty('transform');
}

/**
 * Visual rect with settle transforms cleared.
 * Keeps inverted-scroll ON — that flip is the real viewport geometry.
 */
function readVisualRect(el: HTMLElement): DOMRect {
  const prev = el.style.transform;
  const inner = el.querySelector<HTMLElement>(':scope > .home-v7__clip-inner');
  const prevInner = inner?.style.transform ?? '';

  el.style.transform = 'none';
  if (inner) inner.style.transform = '';

  const rect = el.getBoundingClientRect();

  el.style.transform = prev;
  if (inner) inner.style.transform = prevInner;

  return rect;
}

/** Whole block slides on an ascending diagonal; no rotate (bottom-hinge was horizontal). */
function applyBranchTransform(el: HTMLElement, side: RevealSide, rest: number): void {
  if (rest <= 0) {
    el.style.transform = 'none';
    clearInnerTransform(el);
    return;
  }

  const y = rest * viewportH * BRANCH_PULL_Y_VH;
  const scale = 1 - rest * BRANCH_SCALE_PULL;

  if (side === 'center') {
    el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    clearInnerTransform(el);
    return;
  }

  const x = branchSign(side) * rest * viewportH * BRANCH_PULL_X_VH;
  el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  clearInnerTransform(el);
}

function fadeOpacity(build: number): number {
  if (build <= OPACITY_DELAY) return 0;
  return (build - OPACITY_DELAY) / (1 - OPACITY_DELAY);
}

type RevealSide = 'left' | 'right' | 'center';

interface RevealTarget {
  el: HTMLElement;
  side: RevealSide;
  /** px offset added to settle start — zigzag cascade */
  phasePx: number;
}

let hijack = false;
let wheelBound = false;
let scrollBound = false;
let wasMobileLayout = false;
let target = 0;
let current = 0;
let maxScroll = 0;
let landingScroll = 0;
let viewportH = 0;
let navH = 0;
let reveals: RevealTarget[] = [];
let reducedMotion = false;

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

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function getMain(): HTMLElement | null {
  return document.getElementById('main-content');
}

function measure(): void {
  const header = document.getElementById('header');
  navH = header?.offsetHeight ?? 0;
  viewportH = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportH);
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
  const main = getMain();
  if (!main) return;
  main.classList.toggle('inverted-scroll', enabled);
}

function setTreeProgress(scrollY: number): void {
  const tree = document.querySelector<HTMLElement>('[data-home-v7-tree]');
  if (!tree || maxScroll <= 0) return;

  const progress = hijack ? 1 - scrollY / maxScroll : scrollY / maxScroll;
  const mobileFactor = isMobileLayout() ? TREE_MOBILE_FACTOR : 1;
  const opacity =
    (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * mobileFactor;
  const maxOffset = Math.max(0, tree.offsetHeight - window.innerHeight);
  const translateY = -maxOffset * (1 - progress);

  tree.style.transform = `translateX(-50%) translateY(${translateY}px)`;
  tree.style.opacity = String(opacity);
}

function sideOf(el: HTMLElement): RevealSide {
  if (el.classList.contains('home-v7__clip--left')) return 'left';
  if (el.classList.contains('home-v7__clip--right')) return 'right';
  return 'center';
}

function collectReveals(): void {
  reveals = [];
  document.querySelectorAll<HTMLElement>('.home-v7__clip').forEach((el) => {
    const side = sideOf(el);
    const row = el.closest<HTMLElement>('.home-v7__row');
    const clipCount = row?.querySelectorAll('.home-v7__clip').length ?? 1;
    const phasePx =
      clipCount > 1 && side === 'right' ? viewportH * SETTLE_SIDE_NUDGE : 0;
    reveals.push({ el, side, phasePx });
    el.classList.add('home-v7__clip--live');
  });
}

/**
 * Visual progress for inverted scroll.
 * Enter from top (collapsed) → descend into reading zone (built).
 * Anchored on the LEADING edge (rect.bottom): t=0 as the first pixel enters,
 * t=1 when that edge reaches the reading line. Past the bottom edge → stay built.
 */
function settleProgress(rect: DOMRect, phasePx: number): number {
  // Still above the viewport — not entered yet
  if (rect.bottom <= 0) return 0;
  // Left through the bottom — keep fully built
  if (rect.top >= viewportH) return 1;

  const start = viewportH * SETTLE_ENTRY_START + phasePx;
  const end = viewportH * SETTLE_ENTRY_END + phasePx;
  let t = smoothstep((rect.bottom - start) / (end - start));

  // Canopy / end of ascent: RAMP remaining blocks to completion as scrollY → 0.
  // A hard snap here made the final block jump into alignment mid-birth.
  if (hijack && current <= viewportH * 0.3 && rect.top < viewportH) {
    const canopyBoost = smoothstep(1 - current / (viewportH * 0.3));
    t = Math.max(t, canopyBoost);
  }

  return clamp(t, 0, 1);
}

function applyHidden(el: HTMLElement, side: RevealSide): void {
  el.style.opacity = '0';
  applyBranchTransform(el, side, 1);
  el.style.filter = 'brightness(0.45)';
  el.style.setProperty('--settle', '0');
}

function applySettle(item: RevealTarget, t: number): void {
  const { el, side } = item;
  const build = clamp(t, 0, 1);
  if (build <= 0) {
    applyHidden(el, side);
    return;
  }

  const rest = 1 - build;
  applyBranchTransform(el, side, rest);
  const fade = fadeOpacity(build);
  el.style.opacity = String(fade);
  el.style.filter = `brightness(${0.5 + 0.5 * fade})`;
  el.style.setProperty('--settle', String(build));
}

function clearSettle(el: HTMLElement): void {
  el.style.transform = '';
  clearInnerTransform(el);
  el.style.opacity = '';
  el.style.filter = '';
  el.style.removeProperty('--settle');
  el.classList.remove('home-v7__clip--live');
}

function updateReveals(): void {
  if (reducedMotion || isMobileLayout()) return;

  for (const item of reveals) {
    const rect = readVisualRect(item.el);
    const t = settleProgress(rect, item.phasePx);
    applySettle(item, t);
  }
}

function revealAll(): void {
  for (const item of reveals) {
    clearSettle(item.el);
    item.el.style.opacity = '1';
    item.el.style.transform = 'none';
    item.el.style.filter = 'none';
    clearInnerTransform(item.el);
  }
}

function applyFrame(): void {
  const scrollY = hijack ? current : window.scrollY;
  if (hijack) {
    window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  }
  setTreeProgress(scrollY);
  updateReveals();
}

function tick(): void {
  current += (target - current) * LERP;
  if (Math.abs(target - current) < 0.5) current = target;
  applyFrame();
  requestAnimationFrame(tick);
}

function onWheel(e: WheelEvent): void {
  if (!hijack) return;
  e.preventDefault();
  target = clamp(target - e.deltaY * SCROLL_SPEED, 0, maxScroll);
}

function onKeydown(e: KeyboardEvent): void {
  if (!hijack) return;

  const step = viewportH * 0.35;
  let delta = 0;

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
  current = window.scrollY;
  target = current;
  setTreeProgress(current);
  updateReveals();
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

function clearRevealInline(el: HTMLElement): void {
  el.style.opacity = '';
  el.style.transform = '';
  el.style.filter = '';
  clearInnerTransform(el);
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
  measure();
  const mobile = isMobileLayout();
  const nextHijack = canHijack();

  if (hijack && !nextHijack) {
    for (const item of reveals) clearSettle(item.el);
  }

  if (wasMobileLayout && !mobile) {
    for (const item of reveals) clearRevealInline(item.el);
  }

  hijack = nextHijack;
  wasMobileLayout = mobile;
  setInverted(hijack);
  collectReveals();
  syncScrollListeners();

  if (reducedMotion || mobile) {
    revealAll();
    return;
  }

  if (hijack) {
    measureLanding();
    target = landingScroll;
    current = landingScroll;
    applyFrame();
    return;
  }

  current = window.scrollY;
  target = current;
  setTreeProgress(current);
  updateReveals();
}

let resizeTimeout: number | null = null;

function onResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const anchor = window.scrollY;
    setupMode();
    if (!hijack && !isMobileLayout()) {
      current = anchor;
      target = anchor;
      setTreeProgress(anchor);
      updateReveals();
    }
  }, 150);
}

/** TYPE LAB (experiment): keys 1-4 or ?type=a|b|c swap the type system live. */
function bindTypeLab(root: Element): void {
  const variants: Record<string, string> = { '1': '', '2': 's' };
  const initial = new URLSearchParams(location.search).get('type');
  if (initial) root.setAttribute('data-typelab', initial);
  window.addEventListener('keydown', (e) => {
    if (!(e.key in variants)) return;
    const v = variants[e.key];
    if (v) root.setAttribute('data-typelab', v);
    else root.removeAttribute('data-typelab');
  });
}

async function init(): Promise<void> {
  const root = document.querySelector('.home-v7');
  if (!root) return;
  bindTypeLab(root);

  reducedMotion = prefersReducedMotion();
  await document.fonts.ready;
  bindHashNav();
  setupMode();

  if (reducedMotion) {
    const tree = document.querySelector<HTMLElement>('[data-home-v7-tree]');
    if (tree) {
      tree.style.opacity = String(REDUCED_OPACITY);
      tree.style.transform = 'translateX(-50%) translateY(-25vh)';
    }
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
