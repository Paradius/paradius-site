import { clamp, journeyOf, quantize } from './home-v7-math';
import type { HomeEngine } from './home-v7-reflow';

// Touch language: the home does not scroll, it turns pages like a notebook.
const TURN_MS = 420;
const DISTANCE_RATIO = 0.08;
const VELOCITY_PX_MS = 0.35;
const EDGE_RESISTANCE = 0.25;

let homeRoot: HTMLElement | null = null;
let movers: HTMLElement[] = [];
let trees: HTMLElement[] = [];
let sheets: HTMLElement[][] = [];
let nearTimer = 0;
let stops: number[] = [];
let index = 0;
let viewportH = 0;
let offset = 0;
let startY = 0;
let startAt = 0;
let dragging = false;
let frozen = false;
let ledger: HTMLElement | null = null;
let ledgerH = 0;
let lastSheetStop = 0;

function setOffset(y: number): void {
  offset = y;
  /* The ledger is not a page, so the notebook never travels for it: the last
     stop leaves the dawn exactly where it landed and slides the strip up over
     it instead (owner, vuelta 5). */
  const pageY = Math.min(y, lastSheetStop);
  const t = `translate3d(0, ${-pageY}px, 0)`;
  for (const el of movers) el.style.transform = t;
  if (ledger) {
    const shown = clamp(y - lastSheetStop, 0, ledgerH);
    ledger.style.transform = `translate3d(0, ${ledgerH - shown}px, 0)`;
  }
}

function journeyProgress(at: number): number {
  return stops.length > 1 ? clamp(at / (stops.length - 1), 0, 1) : 0;
}

// Inline transform on the tree layers only: a --pager-p write on the home root
// would restyle every page on each touchmove.
function setTree(progress: number): void {
  const t = `translateX(-50%) translateY(calc((100lvh - 408lvh) * ${1 - progress}))`;
  for (const el of trees) el.style.transform = t;
}

// A sheet is what one gesture turns. Sections marked --pair-2 stay on the sheet
// their partner opened: two blocks that mean one thing never split in two.
function readSheets(): HTMLElement[][] {
  const grouped: HTMLElement[][] = [];
  for (const section of document.querySelectorAll<HTMLElement>('.home-v7__hero, .home-v7__row')) {
    const last = grouped[grouped.length - 1];
    if (last && section.classList.contains('home-v7__row--pair-2')) last.push(section);
    else grouped.push([section]);
  }
  return grouped;
}

function measure(): void {
  viewportH = window.innerHeight;
  for (const el of movers) el.style.transform = 'none';
  sheets = readSheets();
  const maxOffset = Math.max(0, document.documentElement.scrollHeight - viewportH);
  // Document coordinates, not viewport ones: if the page is scrolled while we
  // measure (the browser restores a scroll position of its own after a reload),
  // viewport tops shift every stop and the notebook lands between two sheets.
  stops = sheets.map((sheet) =>
    Math.min(sheet[0].getBoundingClientRect().top + window.scrollY, maxOffset),
  );
  lastSheetStop = stops[stops.length - 1];
  ledgerH = ledger ? ledger.getBoundingClientRect().height : 0;
  if (ledgerH > 1) stops.push(lastSheetStop + ledgerH);
  sheets.forEach((sheet, i) => {
    const journey = String(quantize(journeyOf(maxOffset - stops[i], maxOffset)));
    for (const section of sheet) section.style.setProperty('--journey', journey);
  });
  setOffset(offset);
}

// Glow clones paint only around the visible page: all pages ride one layer, so far
// clones were rastered for nothing. The destination lights up before the turn starts;
// far pages go dark only after it lands, so rapid flicks never arrive at a bare page.
function lightNear(): void {
  sheets.forEach((sheet, i) => {
    if (Math.abs(i - index) > 1) return;
    for (const section of sheet) section.classList.add('home-v7__page--near');
  });
}

function markNear(): void {
  nearTimer = 0;
  sheets.forEach((sheet, i) => {
    const near = Math.abs(i - index) <= 1;
    for (const section of sheet) section.classList.toggle('home-v7__page--near', near);
  });
}

function goTo(next: number): void {
  index = clamp(next, 0, stops.length - 1);
  lightNear();
  document.documentElement.removeAttribute('data-pager-drag');
  setOffset(stops[index]);
  setTree(journeyProgress(index));
  homeRoot?.style.setProperty('--pager-p', String(journeyProgress(index)));
  if (nearTimer) window.clearTimeout(nearTimer);
  nearTimer = window.setTimeout(markNear, TURN_MS + 60);
}

function onTouchStart(e: TouchEvent): void {
  if (frozen || e.touches.length !== 1) return;
  startY = e.touches[0].clientY;
  startAt = performance.now();
  dragging = true;
}

// The tree rides the finger at its own depth: the page fraction the content has
// travelled, mapped onto the tree's journey, so release never starts a jump.
function onTouchMove(e: TouchEvent): void {
  if (!dragging) return;
  e.preventDefault();
  const dy = startY - e.touches[0].clientY;
  document.documentElement.setAttribute('data-pager-drag', '');
  const neighbour = index + Math.sign(dy);
  const atEdge = neighbour < 0 || neighbour >= stops.length;
  setOffset(stops[index] + (atEdge ? dy * EDGE_RESISTANCE : dy));
  if (atEdge || dy === 0) return;
  const span = Math.abs(stops[neighbour] - stops[index]) || viewportH;
  setTree(journeyProgress(index + Math.sign(dy) * Math.min(1, Math.abs(dy) / span)));
}

function onTouchEnd(e: TouchEvent): void {
  if (!dragging) return;
  dragging = false;
  const dy = startY - (e.changedTouches[0]?.clientY ?? startY);
  const velocity = Math.abs(dy) / Math.max(1, performance.now() - startAt);
  const turn = Math.abs(dy) > viewportH * DISTANCE_RATIO || (Math.abs(dy) > 12 && velocity > VELOCITY_PX_MS);
  goTo(turn ? index + Math.sign(dy) : index);
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') goTo(index + 1);
  else if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(index - 1);
  else return;
  e.preventDefault();
}

export function createPagerEngine(): HomeEngine<number> {
  return {
    mount() {
      homeRoot = document.querySelector<HTMLElement>('.home-v7');
      movers = [document.querySelector<HTMLElement>('.home-v7__main')].filter(
        (el): el is HTMLElement => el !== null,
      );
      ledger = document.querySelector<HTMLElement>('.footer-ledger');
      trees = [...document.querySelectorAll<HTMLElement>('.home-v7__tree, .home-v7__tree-glow')];
      document.documentElement.setAttribute('data-pager', '');
      document.documentElement.style.setProperty('--pager-ms', `${TURN_MS}ms`);
      // The notebook has no scroll of its own to restore, and Chrome restores
      // one anyway, late enough to land the first sheet half turned.
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      measure();
      goTo(0);
      markNear();
      window.addEventListener('load', () => {
        window.scrollTo(0, 0);
        measure();
        goTo(index);
      });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
      window.addEventListener('keydown', onKey);
    },
    measure,
    captureAnchor: () => index,
    restoreAnchor(i) {
      goTo(i);
    },
    setFrozen(next) {
      frozen = next;
    },
  };
}
