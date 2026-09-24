import { INTRO_SEEN_KEY } from '../lib/intro/intro-gate';

const GESTURES = ['wheel', 'keydown', 'pointerdown', 'touchstart'] as const;
/** Dropping the backdrop layer costs one long frame; it lands at rest, not on the fade. */
const REMOVE_DELAY_MS = 800;
/** The hero's entrance (0.3s delay + 1.6s) has ended and the page is at rest. */
const SETTLE_DELAY_MS = 2600;

function markSeen(): void {
  try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* storage blocked: it will play again */ }
}

export function mountIntro(): void {
  const html = document.documentElement;
  const intro = document.querySelector<HTMLElement>('.intro');
  if (!intro || html.dataset.intro !== 'play') return;

  let finished = false;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    for (const type of GESTURES) window.removeEventListener(type, swallow, true);
    intro.remove();
    html.dataset.intro = 'done';
    markSeen();
    window.setTimeout(() => { html.dataset.intro = 'settled'; }, SETTLE_DELAY_MS);
  };
  // The page underneath must not scroll or react while the film plays: the first
  // gesture skips the film instead.
  const swallow = (e: Event): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!intro.classList.contains('intro--skip')) {
      intro.classList.add('intro--skip');
      intro.addEventListener('animationend', finish, { once: true });
    }
  };
  for (const type of GESTURES) window.addEventListener(type, swallow, { capture: true, passive: false });

  intro.addEventListener('animationend', (e) => {
    if ((e as AnimationEvent).animationName !== 'intro-reveal') return;
    intro.classList.add('intro--done');
    html.dataset.intro = 'done';
    window.setTimeout(finish, REMOVE_DELAY_MS);
  });
}
