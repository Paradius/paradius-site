/**
 * Home v4 — minimal inverted scroll (desktop), tree parallax, section reveals.
 * Extracted from page-engine.ts without pagination / point-budget system.
 */

const LERP = 0.12;
const SCROLL_SPEED = 1.0;
const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_MOBILE_FACTOR = 0.55;
const SECTION_THRESHOLD = 0.25;
const REDUCED_OPACITY = 0.17;

let hijack = false;
let target = 0;
let current = 0;
let maxScroll = 0;
let landingScroll = 0;
let viewportH = 0;
let navH = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function isMobile(): boolean {
  return window.innerWidth < 768;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
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

/**
 * Landing frame for the inverted layout. With the main flipped, the hero sits
 * at the visual bottom of the main, followed by the (unflipped) footer — so
 * maxScroll frames footer + a clipped hero. Land on the hero's own top edge
 * instead so the full hero fills the viewport.
 */
function measureLanding(): void {
  const hero = document.querySelector<HTMLElement>('.home-v4__hero');
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
  const tree = document.querySelector<HTMLElement>('[data-home-v4-tree]');
  if (!tree || maxScroll <= 0) return;

  const progress = hijack ? 1 - scrollY / maxScroll : scrollY / maxScroll;
  const mobileFactor = isMobile() ? TREE_MOBILE_FACTOR : 1;
  const opacity =
    (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * mobileFactor;
  const maxOffset = Math.max(0, tree.offsetHeight - window.innerHeight);
  const translateY = -maxOffset * (1 - progress);

  tree.style.transform = `translateX(-50%) translateY(${translateY}px)`;
  tree.style.opacity = String(opacity);
}

function applyFrame(): void {
  window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  setTreeProgress(current);
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

function initSectionReveal(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-home-v4-section]');

  if (prefersReducedMotion()) {
    sections.forEach((section) => section.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { threshold: SECTION_THRESHOLD },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupMode(): void {
  measure();
  hijack = !isCoarsePointer() && !isMobile() && !prefersReducedMotion();
  setInverted(hijack);

  if (hijack) {
    measureLanding();
    target = landingScroll;
    current = landingScroll;
    applyFrame();
  } else {
    current = window.scrollY;
    target = current;
    setTreeProgress(current);
  }
}

let resizeTimeout: number | null = null;

function onResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const wasHijack = hijack;
    const anchor = window.scrollY;
    setupMode();
    if (!wasHijack && !hijack) {
      target = anchor;
      current = anchor;
    }
  }, 150);
}

async function init(): Promise<void> {
  const root = document.querySelector('.home-v4');
  if (!root) return;

  await document.fonts.ready;
  initSectionReveal();
  bindHashNav();
  setupMode();

  if (prefersReducedMotion()) {
    const tree = document.querySelector<HTMLElement>('[data-home-v4-tree]');
    if (tree) {
      tree.style.opacity = String(REDUCED_OPACITY);
      tree.style.transform = 'translateX(-50%) translateY(-25vh)';
    }
    return;
  }

  if (hijack) {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
  } else {
    window.addEventListener('scroll', onNativeScroll, { passive: true });
  }

  window.addEventListener('resize', onResize);
  requestAnimationFrame(tick);

  // Screenshot / debug hook — sync scroll without fighting the lerp loop
  (window as Window & { __homeV4SetScroll?: (y: number) => void }).__homeV4SetScroll = (
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
