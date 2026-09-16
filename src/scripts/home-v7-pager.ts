import { journeyOf, nearestPageIndex, quantize } from './home-v7-math';
import { setupBirths } from './home-v7-birth';
import type { HomeEngine } from './home-v7-reflow';

const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_TOUCH_FACTOR = 0.55;

let homeRoot: HTMLElement | null = null;
let tree: HTMLElement | null = null;
let viewportH = 0;
let maxScroll = 0;
let treeMaxOffset = 0;
let pageTops: number[] = [];
let measuredW = 0;
let pageIndex = 0;
let lastTreeShift = '';
let lastTreeFade = '';

// With scroll timelines the CSS owns the tree transform AND fade (home-v7-pager.css): JS writes nothing per frame.
const timelineOwnsTree = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

function measure(): void {
  measuredW = window.innerWidth;
  viewportH = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportH);
  treeMaxOffset = tree ? Math.max(0, tree.offsetHeight - viewportH) : 0;
  const scrollY = window.scrollY;
  const pages = [...document.querySelectorAll<HTMLElement>('.home-v7__hero, .home-v7__row')];
  pageTops = pages.map((page) => page.getBoundingClientRect().top + scrollY);
  writePageJourneys(pages);
}

// A page at rest shows the journey of its own position, so each page carries it
// statically: a global write on landing repainted every glow (54 -> 6 janky frames).
function writePageJourneys(pages: HTMLElement[]): void {
  pages.forEach((page, i) => {
    const j = String(quantize(journeyOf(Math.max(0, maxScroll - Math.min(pageTops[i], maxScroll)), maxScroll)));
    if (page.style.getPropertyValue('--journey') !== j) page.style.setProperty('--journey', j);
  });
}

function setTreeProgress(scrollY: number): void {
  if (!homeRoot || maxScroll <= 0 || timelineOwnsTree) return;
  const progress = scrollY / maxScroll;
  const opacity = (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * TREE_TOUCH_FACTOR;
  const fade = String(quantize(opacity, 1000));
  const shift = `${Math.round(-treeMaxOffset * (1 - progress))}px`;
  if (shift !== lastTreeShift) {
    lastTreeShift = shift;
    homeRoot.style.setProperty('--tree-shift', shift);
  }
  if (fade !== lastTreeFade) {
    lastTreeFade = fade;
    homeRoot.style.setProperty('--tree-fade', fade);
  }
}

function onScroll(): void {
  // By the time resize fires the browser has already reflowed and moved the
  // scroll: an index read against stale page tops would anchor the wrong page.
  if (window.innerWidth === measuredW) pageIndex = nearestPageIndex(pageTops, window.scrollY);
  setTreeProgress(window.scrollY);
}

export function createPagerEngine(): HomeEngine<number> {
  return {
    mount() {
      homeRoot = document.querySelector<HTMLElement>('.home-v7');
      tree = document.querySelector<HTMLElement>('[data-home-v7-tree]');
      measure();
      pageIndex = nearestPageIndex(pageTops, window.scrollY);
      setTreeProgress(window.scrollY);
      window.addEventListener('scroll', onScroll, { passive: true });
      if (homeRoot) setupBirths(homeRoot);
    },
    measure() {
      measure();
    },
    captureAnchor() {
      return pageIndex;
    },
    restoreAnchor(index) {
      const top = pageTops[index];
      if (top === undefined) return;
      pageIndex = index;
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
      setTreeProgress(top);
    },
    setFrozen() {},
  };
}
