import { journeyOf, nearestPageIndex, quantize } from './home-v7-math';
import { setupBirths } from './home-v7-birth';
import type { HomeEngine } from './home-v7-reflow';

const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_TOUCH_FACTOR = 0.55;
const JOURNEY_QUIET_MS = 150;

let homeRoot: HTMLElement | null = null;
let tree: HTMLElement | null = null;
let viewportH = 0;
let maxScroll = 0;
let treeMaxOffset = 0;
let pageTops: number[] = [];
let lastTreeShift = '';
let lastTreeFade = '';
let lastJourney = -1;
let journeyTimer = 0;

const timelineOwnsShift = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

function measure(): void {
  viewportH = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportH);
  treeMaxOffset = tree ? Math.max(0, tree.offsetHeight - viewportH) : 0;
  const scrollY = window.scrollY;
  pageTops = [...document.querySelectorAll<HTMLElement>('.home-v7__hero, .home-v7__row')].map(
    (page) => page.getBoundingClientRect().top + scrollY,
  );
}

function setTreeProgress(scrollY: number): void {
  if (!homeRoot || maxScroll <= 0) return;
  const progress = scrollY / maxScroll;
  const opacity = (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * TREE_TOUCH_FACTOR;
  const fade = String(quantize(opacity, 1000));
  if (!timelineOwnsShift) {
    const shift = `${Math.round(-treeMaxOffset * (1 - progress))}px`;
    if (shift !== lastTreeShift) {
      lastTreeShift = shift;
      homeRoot.style.setProperty('--tree-shift', shift);
    }
  }
  if (fade !== lastTreeFade) {
    lastTreeFade = fade;
    homeRoot.style.setProperty('--tree-fade', fade);
  }
}

// --journey recolors the glow stacks: written only once the scroll is at rest.
function writeJourney(): void {
  journeyTimer = 0;
  if (!homeRoot) return;
  const j = quantize(journeyOf(Math.max(0, maxScroll - window.scrollY), maxScroll));
  if (j === lastJourney) return;
  lastJourney = j;
  homeRoot.style.setProperty('--journey', String(j));
}

function onScroll(): void {
  setTreeProgress(window.scrollY);
  if (journeyTimer) window.clearTimeout(journeyTimer);
  journeyTimer = window.setTimeout(writeJourney, JOURNEY_QUIET_MS);
}

export function createPagerEngine(): HomeEngine<number> {
  return {
    mount() {
      homeRoot = document.querySelector<HTMLElement>('.home-v7');
      tree = document.querySelector<HTMLElement>('[data-home-v7-tree]');
      measure();
      setTreeProgress(window.scrollY);
      writeJourney();
      window.addEventListener('scroll', onScroll, { passive: true });
      if (homeRoot) setupBirths(homeRoot);
    },
    measure() {
      measure();
      lastJourney = -1;
    },
    captureAnchor() {
      return nearestPageIndex(pageTops, window.scrollY);
    },
    restoreAnchor(index) {
      const top = pageTops[index];
      if (top === undefined) return;
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
      setTreeProgress(top);
      writeJourney();
    },
    setFrozen() {},
  };
}
