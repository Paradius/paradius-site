/**
 * Dawn tree scroll — inverted wheel (desktop), no magnets.
 * Station visibility is driven only by viewport margin intersection.
 * Circuit opacity stays continuous with scroll.
 */

const MIN_OPACITY = 0.03;
const MAX_OPACITY = 0.34;
const SCROLL_SPEED = 1.2;
const LERP = 0.12;

/** Active band of the viewport (outside this margin → collapsed). */
const VIEW_MARGIN = 0.18;

const ENTER_MS = 900;
const EXIT_MS = 320;

type StationState = 'hidden' | 'entering' | 'visible' | 'exiting';

interface Station {
  el: HTMLElement;
  id: string;
  state: StationState;
  timer: number | null;
}

let target = 0;
let current = 0;
let maxScroll = 0;
let hijack = false;
let stations: Station[] = [];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function setCircuit(scrollY: number): void {
  if (maxScroll <= 0) return;
  const progress = 1 - scrollY / maxScroll;
  const opacity = MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * progress;
  document.documentElement.style.setProperty('--tree-progress', String(progress));
  document.documentElement.style.setProperty('--circuit-opacity', String(opacity));
}

function applyStationClass(station: Station): void {
  station.el.classList.remove('st-hidden', 'st-entering', 'st-visible', 'st-exiting');
  station.el.classList.add(`st-${station.state}`);
}

function clearTimer(station: Station): void {
  if (station.timer !== null) {
    window.clearTimeout(station.timer);
    station.timer = null;
  }
}

function setState(station: Station, next: StationState): void {
  if (station.state === next) return;
  clearTimer(station);
  station.state = next;
  applyStationClass(station);

  if (next === 'entering') {
    station.timer = window.setTimeout(() => {
      station.state = 'visible';
      applyStationClass(station);
      station.timer = null;
      syncNav();
    }, ENTER_MS);
  }

  if (next === 'exiting') {
    station.timer = window.setTimeout(() => {
      station.state = 'hidden';
      applyStationClass(station);
      station.timer = null;
      syncNav();
    }, EXIT_MS);
  }

  syncNav();
}

function syncNav(): void {
  const active =
    [...stations]
      .reverse()
      .find((s) => s.state === 'entering' || s.state === 'visible')?.id ?? '';

  document.querySelectorAll<HTMLElement>('[data-section]').forEach((link) => {
    link.classList.toggle('is-lit', link.dataset.section === active);
  });
}

/** True when the station intersects the central viewport band. */
function inViewportMargin(rect: DOMRect): boolean {
  const vh = window.innerHeight;
  const bandTop = vh * VIEW_MARGIN;
  const bandBottom = vh * (1 - VIEW_MARGIN);
  return rect.bottom > bandTop && rect.top < bandBottom;
}

function evaluateStations(): void {
  stations.forEach((station) => {
    const rect = station.el.getBoundingClientRect();
    const inside = inViewportMargin(rect);

    if (inside && (station.state === 'hidden' || station.state === 'exiting')) {
      setState(station, 'entering');
    } else if (!inside && (station.state === 'visible' || station.state === 'entering')) {
      setState(station, 'exiting');
    }
  });
}

function applyFrame(): void {
  window.scrollTo({ top: current, behavior: 'instant' });
  setCircuit(current);
  evaluateStations();
}

function tick(): void {
  current += (target - current) * LERP;
  if (Math.abs(target - current) < 0.4) current = target;

  applyFrame();
  window.requestAnimationFrame(tick);
}

function onWheel(e: WheelEvent): void {
  if (!hijack) return;
  e.preventDefault();
  target = clamp(target - e.deltaY * SCROLL_SPEED, 0, maxScroll);
}

function onKeydown(e: KeyboardEvent): void {
  if (!hijack) return;
  const step = window.innerHeight * 0.35;
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
  setCircuit(current);
  evaluateStations();
}

function measure(): void {
  maxScroll = document.documentElement.scrollHeight - window.innerHeight;
}

function collectStations(): void {
  stations = Array.from(document.querySelectorAll<HTMLElement>('[data-station]')).map((el) => ({
    el,
    id: el.dataset.station ?? '',
    state: 'hidden' as StationState,
    timer: null,
  }));

  stations.forEach((s) => {
    if (s.el.classList.contains('tree-station--roots')) {
      s.state = 'visible';
    }
    applyStationClass(s);
  });
}

function scrollToHash(hash: string): void {
  const id = hash.replace('#', '');
  const el =
    document.getElementById(id) ??
    document.querySelector<HTMLElement>(`[data-station="${id}"]`);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const center = window.scrollY + rect.top + rect.height / 2;
  target = clamp(center - window.innerHeight / 2, 0, maxScroll);
}

function bindHashNav(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const targetEl = document.querySelector(href);
      if (!targetEl) return;

      event.preventDefault();
      scrollToHash(href);

      document.querySelector('.site-header__nav')?.classList.remove('site-header__nav--open');
      document.querySelector('.site-header__menu-toggle')?.setAttribute('aria-expanded', 'false');
      document
        .querySelector('.site-header__menu-toggle')
        ?.classList.remove('site-header__menu-toggle--active');
      document.documentElement.classList.remove('menu-open');
    });
  });
}

function init(): void {
  if (prefersReducedMotion()) {
    document.documentElement.style.setProperty('--circuit-opacity', String(MAX_OPACITY));
    document.querySelectorAll<HTMLElement>('[data-station]').forEach((el) => {
      el.classList.add('st-visible');
    });
    return;
  }

  hijack = !isCoarsePointer();
  measure();
  collectStations();
  bindHashNav();

  if (hijack) {
    target = maxScroll;
    current = maxScroll;
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    applyFrame();
  } else {
    current = window.scrollY;
    target = current;
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    setCircuit(current);
    evaluateStations();
  }

  window.addEventListener('resize', () => {
    measure();
    target = clamp(target, 0, maxScroll);
    current = clamp(current, 0, maxScroll);
  });

  window.requestAnimationFrame(tick);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
