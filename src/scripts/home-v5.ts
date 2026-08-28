/**
 * Home v5 — The Invisible Spine
 * Inverted scroll (scaleY flip + wheel LERP), zigzag node reveals,
 * SVG branch lines from viewport center via IntersectionObserver.
 */

const LERP = 0.12;
const SCROLL_SPEED = 1.0;
const SECTION_THRESHOLD = 0.2;
const BRANCH_DRAW_MS = 650;
const BRANCH_REVEAL_DELAY_MS = 500;
const BRANCH_FADE_OPACITY = 0.18;

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

function measureLanding(): void {
  const hero = document.querySelector<HTMLElement>('.home-v5__hero');
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

function applyFrame(): void {
  window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
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

function getBranchTarget(node: HTMLElement): { x: number; y: number } {
  const isCup = node.hasAttribute('data-home-v5-cup');
  const inner =
    node.querySelector<HTMLElement>('.home-v5__node-inner') ??
    node.querySelector<HTMLElement>('.home-v5__cup-col') ??
    node;

  const rect = inner.getBoundingClientRect();
  const centerY = rect.top + rect.height * 0.5;

  if (isCup) {
    const evidence = node.querySelector<HTMLElement>('.home-v5__cup-col--evidence');
    const registry = node.querySelector<HTMLElement>('.home-v5__cup-col--registry');
    const eRect = evidence?.getBoundingClientRect();
    const rRect = registry?.getBoundingClientRect();
    if (eRect && rRect) {
      return {
        x: (eRect.right + rRect.left) * 0.5,
        y: (eRect.top + eRect.bottom + rRect.top + rRect.bottom) * 0.25,
      };
    }
  }

  const isLeft = node.classList.contains('home-v5__node--left');
  return {
    x: isLeft ? rect.right : rect.left,
    y: centerY,
  };
}

function drawBranch(node: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const svg = document.querySelector<SVGSVGElement>('[data-home-v5-branches]');
    if (!svg) {
      resolve();
      return;
    }

    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    const target = getBranchTarget(node);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('home-v5__branch-line');
    line.setAttribute('x1', String(centerX));
    line.setAttribute('y1', String(centerY));
    line.setAttribute('x2', String(centerX));
    line.setAttribute('y2', String(centerY));

    const length = Math.hypot(target.x - centerX, target.y - centerY);
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);

    svg.appendChild(line);

    requestAnimationFrame(() => {
      line.setAttribute('x2', String(target.x));
      line.setAttribute('y2', String(target.y));
      line.style.transition = `stroke-dashoffset ${BRANCH_DRAW_MS}ms ease-out, opacity 0.4s ease`;
      line.style.strokeDashoffset = '0';
    });

    window.setTimeout(() => {
      line.style.opacity = String(BRANCH_FADE_OPACITY);
      resolve();
    }, BRANCH_DRAW_MS);
  });
}

function revealNode(node: HTMLElement): void {
  if (node.classList.contains('is-revealed')) return;

  if (prefersReducedMotion()) {
    node.classList.add('is-revealed');
    return;
  }

  drawBranch(node).then(() => {
    window.setTimeout(() => {
      node.classList.add('is-revealed');
    }, BRANCH_REVEAL_DELAY_MS);
  });
}

function initNodeReveal(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-home-v5-node]');

  if (prefersReducedMotion()) {
    nodes.forEach((node) => node.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target as HTMLElement;
        revealNode(node);
        observer.unobserve(node);
      });
    },
    { threshold: SECTION_THRESHOLD, rootMargin: '0px 0px -8% 0px' },
  );

  nodes.forEach((node) => observer.observe(node));
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
  const root = document.querySelector('.home-v5');
  if (!root) return;

  await document.fonts.ready;
  initNodeReveal();
  bindHashNav();
  setupMode();

  if (prefersReducedMotion()) return;

  if (hijack) {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
  } else {
    window.addEventListener('scroll', onNativeScroll, { passive: true });
  }

  window.addEventListener('resize', onResize);
  requestAnimationFrame(tick);

  (window as Window & { __homeV5SetScroll?: (y: number) => void }).__homeV5SetScroll = (
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
