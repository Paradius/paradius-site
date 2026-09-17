import { readDeviceClass } from './device-class';
import { prepareGlowClones } from './home-v7-glow';
import { createGuidedEngine } from './home-v7-guided';
import { createFlipEngine } from './home-v7-flip';
import { createPagerEngine } from './home-v7-pager';
import { createReflow, type HomeEngine } from './home-v7-reflow';

async function init(): Promise<void> {
  const root = document.querySelector('.home-v7');
  if (!root) return;

  await document.fonts.ready;
  prepareGlowClones(root);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const html = document.documentElement;
  const device = readDeviceClass(html);
  const flip = device === 'touch' && new URLSearchParams(window.location.search).has('flip');
  const engine: HomeEngine<unknown> =
    device === 'desktop' ? createGuidedEngine() : flip ? createFlipEngine() : createPagerEngine();
  html.dataset.homeEngine = device === 'desktop' ? 'guided' : flip ? 'flip' : 'pager';
  engine.mount();

  const reflow = createReflow(engine, {
    root: html,
    width: window.innerWidth,
    height: window.innerHeight,
    reflowOnHeightChange: device === 'desktop',
  });
  const onViewport = () => reflow.onViewportChange(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onViewport);
  window.addEventListener('orientationchange', onViewport);

  (window as Window & { __homeV7Anchor?: () => unknown }).__homeV7Anchor = () => engine.captureAnchor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}

export {};
