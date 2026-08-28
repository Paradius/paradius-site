/**
 * Home v3 mockup — native scroll, ascending tree parallax, section branch reveals.
 */

const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;
const TREE_MOBILE_FACTOR = 0.55;
const SECTION_THRESHOLD = 0.25;
const REDUCED_OPACITY = 0.17;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobile(): boolean {
  return window.matchMedia('(max-width: 768px)').matches;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function initBranchPaths(): void {
  document.querySelectorAll<SVGPathElement>('[data-home-v3-branch] path').forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = prefersReducedMotion() ? '0' : String(length);
  });
}

function revealBranches(): void {
  document.querySelectorAll<SVGPathElement>('[data-home-v3-branch] path').forEach((path) => {
    path.style.strokeDashoffset = '0';
  });
}

function initTreeParallax(tree: HTMLElement): void {
  let ticking = false;

  const update = (): void => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
    const maxOffset = Math.max(0, tree.offsetHeight - window.innerHeight);
    const translateY = -maxOffset * (1 - progress);
    const mobileFactor = isMobile() ? TREE_MOBILE_FACTOR : 1;
    const opacity =
      (TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress) * mobileFactor;

    tree.style.transform = `translateX(-50%) translateY(${translateY}px)`;
    tree.style.opacity = String(opacity);
    ticking = false;
  };

  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initSectionReveal(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-home-v3-section]');

  if (prefersReducedMotion()) {
    sections.forEach((section) => section.classList.add('is-revealed'));
    revealBranches();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        section.classList.add('is-revealed');
        observer.unobserve(section);
      });
    },
    { threshold: SECTION_THRESHOLD },
  );

  sections.forEach((section) => observer.observe(section));
}

function init(): void {
  const tree = document.querySelector<HTMLElement>('[data-home-v3-tree]');
  if (!tree) return;

  initBranchPaths();

  if (prefersReducedMotion()) {
    tree.style.opacity = String(REDUCED_OPACITY);
    tree.style.transform = 'translateX(-50%) translateY(-25vh)';
    initSectionReveal();
    return;
  }

  initTreeParallax(tree);
  initSectionReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
