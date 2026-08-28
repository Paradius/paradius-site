/**
 * Home v6 — The Invisible Spine (Inverted scroll + Geometric SVG Reveal)
 */

const LERP = 0.12;
const SCROLL_SPEED = 1.0;
const TREE_MIN_OPACITY = 0.04;
const TREE_MAX_OPACITY = 0.3;

let target = 0;
let current = 0;
let maxScroll = 0;
let landingScroll = 0;

function isMobile() {
  return window.innerWidth < 768;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function measure() {
  const viewportH = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportH);
  
  // The hero is at the visual bottom of the inverted main. 
  // We want to land exactly where the hero is framed.
  const hero = document.querySelector<HTMLElement>('.home-v6__section--hero');
  if (hero) {
    const rect = hero.getBoundingClientRect();
    landingScroll = clamp(window.scrollY + rect.top, 0, maxScroll);
  } else {
    landingScroll = maxScroll;
  }
}

function setTreeProgress(scrollY: number) {
  const tree = document.querySelector<HTMLElement>('[data-home-v6-tree]');
  if (!tree || maxScroll <= 0) return;

  // As scrollY goes down towards 0, progress goes from 0 to 1
  const progress = 1 - scrollY / maxScroll;
  const opacity = TREE_MIN_OPACITY + (TREE_MAX_OPACITY - TREE_MIN_OPACITY) * progress;
  const maxOffset = Math.max(0, tree.offsetHeight - window.innerHeight);
  const translateY = -maxOffset * (1 - progress);

  tree.style.transform = `translateX(-50%) translateY(${translateY}px)`;
  tree.style.opacity = String(opacity);
}

function initIntersectionObserver() {
  const sections = document.querySelectorAll('.home-v6__section');
  
  if (prefersReducedMotion() || isMobile()) {
    sections.forEach(s => s.setAttribute('data-revealed', 'true'));
    return;
  }

  // Trigger when 20% of the section is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // In inverted scroll, elements enter from the TOP of the viewport as we "scroll up"
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => observer.observe(s));
}

function tick() {
  current += (target - current) * LERP;
  if (Math.abs(target - current) < 0.5) current = target;
  
  window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  setTreeProgress(current);
  
  requestAnimationFrame(tick);
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  // Wheel down (positive delta) = target decreases = we move UP visually
  target = clamp(target - e.deltaY * SCROLL_SPEED, 0, maxScroll);
}

function init() {
  const main = document.getElementById('main-content');
  if (!main) return;

  if (isMobile() || prefersReducedMotion()) {
    // Standard behavior for mobile
    window.addEventListener('scroll', () => {
      setTreeProgress(window.scrollY);
    });
    initIntersectionObserver();
    return;
  }

  // Desktop Inverted Mode
  main.classList.add('inverted-scroll');
  measure();
  
  // Jump to landing spot
  target = landingScroll;
  current = landingScroll;
  window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior });
  setTreeProgress(current);

  initIntersectionObserver();

  // Hijack wheel
  window.addEventListener('wheel', onWheel, { passive: false });
  
  // Handle resize recalculations
  window.addEventListener('resize', () => {
    measure();
    target = clamp(target, 0, maxScroll);
  });

  requestAnimationFrame(tick);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
