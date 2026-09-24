import { INNER_GLOW_SELECTOR, glowLevel, resolveGlowUser } from '../lib/glow/inner-glow';

const STORAGE_KEY = 'glow';

function applyUserStrength(): void {
  let stored: string | null = null;
  try { stored = sessionStorage.getItem(STORAGE_KEY); } catch { /* private mode: no stickiness */ }
  const { value, store } = resolveGlowUser(location.search, stored);
  try {
    if (store === null) sessionStorage.removeItem(STORAGE_KEY);
    else if (store !== undefined) sessionStorage.setItem(STORAGE_KEY, store);
  } catch { /* private mode: no stickiness */ }
  document.documentElement.style.setProperty('--glow-user', String(value));
}

function prepareClones(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(INNER_GLOW_SELECTOR).forEach((el) => {
    if (el.dataset.text === undefined) el.dataset.text = el.textContent ?? '';
    el.classList.add('inner-glow-host');
  });
}

function seatLevels(): void {
  const docHeight = document.documentElement.scrollHeight;
  const blocks = [...document.querySelectorAll<HTMLElement>('.inner-block')];
  const rects = blocks.map((el) => el.getBoundingClientRect());
  blocks.forEach((el, i) => {
    const top = rects[i].top + window.scrollY;
    el.style.setProperty('--glow-level', glowLevel(top, rects[i].height, docHeight).toFixed(3));
  });
}

export function mountInnerGlow(): void {
  applyUserStrength();
  prepareClones(document);
  seatLevels();
}
