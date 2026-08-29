/**
 * Page Engine — point-budget viewport paging.
 *
 * 1. Measure real blocks (after fonts load)
 * 2. Convert heights to point costs
 * 3. Pack into pages (one viewport frame each)
 * 4. Inverted scroll on desktop, native on mobile
 * 5. Background tree height = pages × viewport
 */

const MAX_POINTS = 7;
const LERP = 0.12;
const SCROLL_SPEED = 1.0;
const MIN_OPACITY = 0.03;
const MAX_OPACITY = 0.38;

const STAGGER_MS = 80;

type Side = 'full' | 'right' | 'left';

interface Block {
  el: HTMLElement;
  cost: number;
}

interface Section {
  el: HTMLElement;
  id: string;
  side: Side;
  blocks: Block[];
}

interface Page {
  sectionId: string;
  side: Side;
  blocks: Block[];
  scrollY: number;
  index: number;
}

let sections: Section[] = [];
let pages: Page[] = [];
let frameH = 0;
let viewportH = 0;
let navH = 0;
let footH = 0;
let totalHeight = 0;
let hijack = false;
let target = 0;
let current = 0;
let maxScroll = 0;
let activePage = 0;
let anchorBlockEl: HTMLElement | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function isMobile(): boolean {
  return window.innerWidth < 768;
}

function getSide(el: HTMLElement): Side {
  const side = el.dataset.side as Side | undefined;
  if (side === 'full' || side === 'right' || side === 'left') return side;
  return 'full';
}

function measureFrame(): void {
  const header = document.getElementById('header');
  const footer = document.querySelector('.footer-minimal');
  navH = header?.offsetHeight ?? 0;
  footH = footer instanceof HTMLElement ? footer.offsetHeight : 0;
  viewportH = window.innerHeight;
  frameH = viewportH - navH - footH;
  if (frameH < 200) frameH = viewportH * 0.7;
}

function collectSections(): void {
  sections = [];
  const els = document.querySelectorAll<HTMLElement>('[data-station]');
  els.forEach((el) => {
    const id = el.dataset.station ?? '';
    const side = isMobile() ? 'full' : getSide(el);
    const blockEls = el.querySelectorAll<HTMLElement>('[data-block]');
    const blocks: Block[] = Array.from(blockEls).map((b) => ({ el: b, cost: 0 }));
    if (blocks.length === 0) {
      blocks.push({ el, cost: 0 });
    }
    sections.push({ el, id, side, blocks });
  });
}

function measureBlocks(): void {
  const pointH = frameH / MAX_POINTS;
  sections.forEach((section) => {
    section.blocks.forEach((block) => {
      block.el.style.removeProperty('display');
      block.el.style.removeProperty('transform');
      block.el.style.removeProperty('opacity');
      const style = getComputedStyle(block.el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const h = block.el.offsetHeight + marginTop + marginBottom;
      block.cost = clamp(Math.ceil(h / pointH), 1, MAX_POINTS);
    });
  });
}

function validateAlternation(): void {
  let lastSide: Side | null = null;
  sections.forEach((section) => {
    if (section.side === 'full') {
      lastSide = null;
      return;
    }
    if (lastSide !== null && section.side === lastSide) {
      console.warn(
        `[page-engine] Side alternation broken: section "${section.id}" is consecutive ${section.side}. Correcting.`
      );
      section.side = lastSide === 'right' ? 'left' : 'right';
    }
    lastSide = section.side;
  });
}

function paginate(): void {
  pages = [];
  let pageIndex = 0;

  sections.forEach((section) => {
    let budget = MAX_POINTS;
    let currentPage: Block[] = [];
    let currentSum = 0;

    section.blocks.forEach((block) => {
      if (currentSum + block.cost > budget && currentPage.length > 0) {
        pages.push({
          sectionId: section.id,
          side: section.side,
          blocks: currentPage,
          scrollY: pageIndex * viewportH,
          index: pageIndex,
        });
        pageIndex++;
        currentPage = [];
        currentSum = 0;
      }
      currentPage.push(block);
      currentSum += block.cost;
    });

    if (currentPage.length > 0) {
      pages.push({
        sectionId: section.id,
        side: section.side,
        blocks: currentPage,
        scrollY: pageIndex * viewportH,
        index: pageIndex,
      });
      pageIndex++;
    }
  });

  totalHeight = pages.length * viewportH;
  maxScroll = Math.max(0, totalHeight - viewportH);
}

function applyFlexLayout(): void {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.style.removeProperty('height');
  main.style.removeProperty('position');

  if (hijack) {
    main.classList.add('inverted-scroll');
  } else {
    main.classList.remove('inverted-scroll');
  }

  // Frame padding from measured chrome — CSS owns the rail layout.
  document.documentElement.style.setProperty('--page-pad-top', `${navH + 40}px`);
  document.documentElement.style.setProperty('--page-pad-bottom', `${Math.max(footH + 32, 80)}px`);

  sections.forEach((section) => {
    section.el.style.removeProperty('position');
    section.el.style.removeProperty('width');
    section.el.style.removeProperty('left');
    section.el.style.removeProperty('top');
    section.el.style.removeProperty('min-height');
    section.el.style.removeProperty('display');
    section.el.style.removeProperty('flex-direction');
    section.el.style.removeProperty('justify-content');
    section.el.style.removeProperty('align-items');
    section.el.style.removeProperty('padding-top');
    section.el.style.removeProperty('padding-bottom');

    section.el.classList.remove('page--full', 'page--right', 'page--left');
    section.el.classList.add(`page--${section.side}`);

    const isHero = section.id === 'roots';

    section.blocks.forEach((block) => {
      block.el.style.removeProperty('position');
      block.el.style.removeProperty('top');
      block.el.classList.add('blk');

      if (isHero) {
        block.el.classList.remove('blk-hidden', 'blk-in');
      } else {
        block.el.classList.remove('blk-in');
        block.el.classList.add('blk-hidden');
      }
    });
  });

  totalHeight = document.documentElement.scrollHeight;
  maxScroll = Math.max(0, totalHeight - viewportH);
}

function setTreeLayer(): void {
  document.body.style.minHeight = `${totalHeight}px`;
}

function setTreeProgress(scrollY: number): void {
  if (maxScroll <= 0) return;
  const progress = hijack ? 1 - scrollY / maxScroll : scrollY / maxScroll;
  const opacity = MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * progress;
  document.documentElement.style.setProperty('--tree-progress', String(progress));
  document.documentElement.style.setProperty('--circuit-opacity', String(opacity));
}

function getActivePageIndex(scrollY: number): number {
  if (hijack) {
    return Math.round((maxScroll - scrollY) / viewportH);
  }
  return Math.round(scrollY / viewportH);
}

function revealBlocks(force = false): void {
  const newActive = clamp(getActivePageIndex(current), 0, Math.max(0, pages.length - 1));
  if (!force && newActive === activePage) return;
  activePage = newActive;

  sections.forEach((section) => {
    const isHero = section.id === 'roots';
    if (isHero) return;

    section.blocks.forEach((block) => {
      const pageIdx = parseInt(block.el.dataset.pageIndex ?? '-1', 10);
      const distance = Math.abs(pageIdx - activePage);

      // Only the active page — never preview the next frame early.
      if (distance === 0) {
        block.el.classList.remove('blk-hidden');
        block.el.classList.add('blk-in');
      } else {
        block.el.classList.remove('blk-in');
        block.el.classList.add('blk-hidden');
      }
    });
  });

  syncNav();
}

function revealByIntersection(): void {
  sections.forEach((section) => {
    const rect = section.el.getBoundingClientRect();
    const inView = rect.top < viewportH * 0.75 && rect.bottom > viewportH * 0.25;

    section.blocks.forEach((block, i) => {
      if (inView) {
        setTimeout(() => {
          block.el.classList.remove('blk-hidden');
          block.el.classList.add('blk-in');
        }, i * STAGGER_MS);
      }
    });
  });

  syncNav();
}

function syncNav(): void {
  const page = pages[activePage];
  let activeId = page?.sectionId ?? '';
  // Card frame is still Philosophy in the nav.
  if (activeId === 'philosophy-card') activeId = 'philosophy';

  document.querySelectorAll<HTMLElement>('[data-section]').forEach((link) => {
    link.classList.toggle('is-lit', link.dataset.section === activeId);
  });
}

function applyFrame(): void {
  window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  setTreeProgress(current);
  if (hijack) {
    revealBlocks();
  }
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
  // Inverted continuous scroll: wheel down = ascend the tree (scrollY decreases).
  // No page snap / anchors — free scroll with lerp.
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
    target = maxScroll;
    e.preventDefault();
    return;
  } else if (e.key === 'End') {
    target = 0;
    e.preventDefault();
    return;
  }

  if (delta !== 0) {
    target = clamp(target + delta, 0, maxScroll);
  }
}

function onNativeScroll(): void {
  if (hijack) return;
  current = window.scrollY;
  target = current;
  setTreeProgress(current);
  revealByIntersection();
}

function saveAnchor(): void {
  for (const section of sections) {
    for (const block of section.blocks) {
      const rect = block.el.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < viewportH) {
        anchorBlockEl = block.el;
        return;
      }
    }
  }
}

function restoreAnchor(): void {
  if (!anchorBlockEl) return;
  const pageIdx = parseInt(anchorBlockEl.dataset.pageIndex ?? '0', 10);
  activePage = pageIdx;
  if (hijack) {
    target = maxScroll - pageIdx * viewportH;
    current = target;
  } else {
    const rect = anchorBlockEl.getBoundingClientRect();
    target = window.scrollY + rect.top - viewportH / 3;
    current = target;
  }
}

function measureAndPaginate(): void {
  saveAnchor();
  measureFrame();
  collectSections();
  measureBlocks();
  validateAlternation();
  paginate();
  hijack = !isCoarsePointer() && !isMobile();
  applyFlexLayout();
  assignPageIndices();
  setTreeLayer();
  restoreAnchor();
  revealBlocks(true);
  applyFrame();
}

function assignPageIndices(): void {
  let pageIdx = 0;
  sections.forEach((section) => {
    let sumCost = 0;
    section.blocks.forEach((block) => {
      if (sumCost + block.cost > MAX_POINTS && sumCost > 0) {
        pageIdx++;
        sumCost = 0;
      }
      block.el.dataset.pageIndex = String(pageIdx);
      sumCost += block.cost;
    });
    if (sumCost > 0) {
      pageIdx++;
    }
  });
}

function scrollToSection(id: string): void {
  const pageIdx = pages.findIndex((p) => p.sectionId === id);
  if (pageIdx === -1) return;

  if (hijack) {
    target = maxScroll - pageIdx * viewportH;
    target = clamp(target, 0, maxScroll);
  } else {
    const section = sections.find((s) => s.id === id);
    if (section) {
      const rect = section.el.getBoundingClientRect();
      target = window.scrollY + rect.top - navH;
    }
  }
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
      document.querySelector('.site-header__menu-toggle')?.setAttribute('aria-expanded', 'false');
      document.querySelector('.site-header__menu-toggle')?.classList.remove('site-header__menu-toggle--active');
      document.documentElement.classList.remove('menu-open');
    });
  });
}

let resizeTimeout: number | null = null;
function onResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    measureAndPaginate();
  }, 150);
}

async function init(): Promise<void> {
  if (prefersReducedMotion()) {
    document.documentElement.style.setProperty('--circuit-opacity', String(MAX_OPACITY));
    document.querySelectorAll<HTMLElement>('[data-block]').forEach((el) => {
      el.classList.add('blk-in');
      el.classList.remove('blk-hidden');
    });
    return;
  }

  await document.fonts.ready;

  hijack = !isCoarsePointer() && !isMobile();
  measureAndPaginate();
  bindHashNav();

  if (hijack) {
    target = maxScroll;
    current = maxScroll;
    activePage = 0;
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    revealBlocks(true);
    applyFrame();
  } else {
    current = window.scrollY;
    target = current;
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    revealByIntersection();
  }

  window.addEventListener('resize', onResize);
  requestAnimationFrame(tick);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

export {};
