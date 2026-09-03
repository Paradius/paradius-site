/**
 * Mobile birth language: blocks are BORN once when they enter the viewport
 * (IntersectionObserver), with their own CSS-transition choreography. Born
 * stays born: the observer releases a node at its first intersection, so a
 * birthed block never re-animates and costs nothing afterwards.
 * The pre-birth state is a class added here at setup: with no JS the page
 * simply renders static and visible.
 */

export const BIRTH_ROOT_MARGIN = '0px 0px -12% 0px';
export const BIRTH_STAGGER_MS = 80;

let observer: IntersectionObserver | null = null;

function birthNode(node: Element): void {
  node.querySelectorAll<HTMLElement>('.home-v7__clip').forEach((clip, i) => {
    clip.style.setProperty('--birth-delay', `${i * BIRTH_STAGGER_MS}ms`);
    clip.classList.add('home-v7__clip--born');
  });
}

export function setupBirths(
  root: Element,
  IO: typeof IntersectionObserver = IntersectionObserver,
): void {
  if (observer) return;
  // The callback takes the observer from its own second argument instead of the
  // module variable, which is still null while the constructor runs.
  const io = new IO(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        birthNode(entry.target);
        self.unobserve(entry.target);
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
}

export function teardownBirths(): void {
  observer?.disconnect();
  observer = null;
}
