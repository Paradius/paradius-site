/**
 * Mobile birth language: blocks are BORN once, with their own CSS-transition
 * choreography, and born stays born. Pager sequencing (owner call, 09-03):
 * the page turn travels bare; a node that intersects only becomes PENDING,
 * and it is born when the scroll settles (scrollend, with a quiet-timer
 * fallback), so the clac lands first and the entrance plays on the still
 * page. The very first observer dispatch is the landing page: no scroll has
 * happened, so it is born immediately.
 * The pre-birth state is a class added here at setup: with no JS the page
 * simply renders static and visible.
 */

export const BIRTH_ROOT_MARGIN = '0px 0px -12% 0px';
export const BIRTH_STAGGER_MS = 80;
export const BIRTH_SETTLE_QUIET_MS = 140;

let observer: IntersectionObserver | null = null;
const pending: Set<Element> = new Set();
let initialBatch = true;
let quietTimer = 0;

function birthNode(node: Element): void {
  node.querySelectorAll<HTMLElement>('.home-v7__clip').forEach((clip, i) => {
    clip.style.setProperty('--birth-delay', `${i * BIRTH_STAGGER_MS}ms`);
    clip.classList.add('home-v7__clip--born');
  });
}

function flushPending(): void {
  pending.forEach((node) => birthNode(node));
  pending.clear();
}

function onScrollEnd(): void {
  if (quietTimer) {
    clearTimeout(quietTimer);
    quietTimer = 0;
  }
  flushPending();
}

/* Fallback for engines without scrollend: flush when the scroll goes quiet. */
function onScrollTick(): void {
  if (quietTimer) clearTimeout(quietTimer);
  quietTimer = window.setTimeout(onScrollEnd, BIRTH_SETTLE_QUIET_MS);
}

export function setupBirths(
  root: Element,
  IO: typeof IntersectionObserver = IntersectionObserver,
): void {
  if (observer) return;
  initialBatch = true;
  // The callback takes the observer from its own second argument instead of the
  // module variable, which is still null while the constructor runs.
  const io = new IO(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        pending.add(entry.target);
        self.unobserve(entry.target);
      }
      if (initialBatch) {
        initialBatch = false;
        flushPending();
      }
    },
    { rootMargin: BIRTH_ROOT_MARGIN },
  );
  observer = io;
  // Hiding and birthing walk the same list: a clip is marked pre-birth only if it
  // hangs off an observed node, so a clip nothing observes can never stay invisible.
  root.querySelectorAll('[data-home-v7-node]').forEach((node) => {
    node.querySelectorAll<HTMLElement>('.home-v7__clip').forEach((clip) => {
      clip.classList.add('home-v7__clip--birth');
    });
    io.observe(node);
  });
  // Both bound everywhere: a double flush is a no-op on an empty pending set.
  window.addEventListener('scrollend', onScrollEnd);
  window.addEventListener('scroll', onScrollTick, { passive: true });
}

export function teardownBirths(): void {
  observer?.disconnect();
  observer = null;
  pending.clear();
  initialBatch = true;
  if (quietTimer) {
    clearTimeout(quietTimer);
    quietTimer = 0;
  }
  window.removeEventListener('scrollend', onScrollEnd);
  window.removeEventListener('scroll', onScrollTick);
}
