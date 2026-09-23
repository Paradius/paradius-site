import { ART, CANOPY, FLAT, ROOTS, SEAM, canopyLift, canopySide, rhythm, rhythmCap, rng, runLeft, scale, seedOf, type Force, type Layout, type Side } from './tree-geometry';

const PIECES = '/assets/tree/';
const TWO_SIDED = '(min-width: 700px)';
const HERO_BESIDE = '(min-width: 900px)';

type Mode = 'two-sided' | 'rail' | 'dossier';

interface Geometry { k: number; two: boolean; side: Side; top: number; height: number; cap: number }

export function mountTreeRun(): void {
  const root = document.documentElement;
  const main = document.querySelector<HTMLElement>('main.inner-main');
  const run = document.querySelector<HTMLElement>('.inner-run');
  const hero = document.querySelector<HTMLElement>('.inner-block--hero');
  const cta = document.querySelector<HTMLElement>('.inner-block--cta');
  const footer = document.querySelector<HTMLElement>('.footer-ledger');
  if (!main || !run || !hero || !footer) return;

  const mode = (main.dataset.mode ?? 'two-sided') as Mode;
  const railBelow = mode === 'dossier' ? window.matchMedia(`(max-width: ${parseFloat(main.dataset.railBelow ?? '1200') - 0.02}px)`) : null;
  const pageSeed = seedOf(location.pathname);
  let pending = 0;

  const layout = (): Layout => {
    if (!window.matchMedia(TWO_SIDED).matches) return 'column';
    if (mode === 'rail' || (railBelow && railBelow.matches)) return 'rail';
    return 'two-sided';
  };

  const px = (units: number, k: number): string => `${(units * k).toFixed(2)}px`;

  const anchors = (top: number): number[] => {
    const list: number[] = [];
    document.querySelectorAll<HTMLElement>('.inner-block:not(.inner-block--hero):not(.inner-block--cta) .inner-title, [data-trunk-anchor]').forEach((title) => {
      const box = title.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(title).lineHeight);
      list.push(box.top - top + (line > 0 ? line : box.height) / 2);
    });
    return list;
  };

  const geometry = (): Geometry | null => {
    const frame = main.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(main).paddingLeft);
    const lay = layout();
    const two = lay === 'two-sided';
    const force = (hero.dataset.force ?? 'power') as Force;
    const side = canopySide(force, lay);
    const canopy = CANOPY[side];
    const heroBeside = lay === 'rail' && window.matchMedia(HERO_BESIDE).matches;
    const input = { layout: lay, frameWidth: frame.width, pad, svh: window.innerHeight, heroBeside, canopy };
    const k = scale(input);
    if (!(k > 0)) return null;

    root.dataset.layout = lay;
    if (two) delete root.dataset.trunk;
    else root.dataset.trunk = side === 'left' ? 'right' : 'left';
    root.style.setProperty('--canopy-lift', canopyLift(k, input).toFixed(2) + 'px');
    root.style.setProperty('--canopy-h', px(canopy.h, k));
    root.style.setProperty('--canopy-back', px(canopy.back, k));
    root.style.setProperty('--canopy-fan', px(canopy.fan, k));
    root.style.setProperty('--trunk-edge', px(ART.trunkHalf, k));
    root.style.setProperty('--trunk-clear', px(ART.trunkHalf * 2, k));
    root.style.setProperty('--roots-h', px(ROOTS.h, k));
    root.style.setProperty('--roots-back', px(ROOTS.back, k));

    run.style.left = runLeft(k, side, input).toFixed(2) + 'px';
    run.style.width = px(ART.w, k);

    const box = run.getBoundingClientRect();
    // Floored in a column: a run any longer than the footer grows the document
    // it is measured against, and the page gains dead scroll at the bottom.
    const end = two && cta ? cta.getBoundingClientRect().bottom : footer.getBoundingClientRect().bottom;
    const height = two ? end - box.top : Math.floor(end - box.top);
    if (!(height > 0)) return null;
    run.style.height = height.toFixed(2) + 'px';
    return { k, two, side, top: box.top, height, cap: rhythmCap(lay, k) };
  };

  const drawRun = (): void => {
    const geo = geometry();
    if (!geo) return;
    const k = geo.k;
    const canopy = CANOPY[geo.side];
    const images: string[] = [];
    const sizes: string[] = [];
    const spots: string[] = [];
    const wideAt = px(ART.w, k) + ' ';
    const whole = wideAt + px(ART.h, k);
    const lay = (piece: { file: string; y0: number }, destY: number): void => {
      images.push(`url(${PIECES}${piece.file})`);
      sizes.push(whole);
      spots.push(`0 ${(destY - piece.y0 * k).toFixed(2)}px`);
    };
    // Half a pixel past both ends: the overlap only ever doubles identical
    // verticals inside one mask, and a shorter layer opens a hairline gap.
    const flat = (top: number, len: number): void => {
      if (len < SEAM) return;
      images.push(`url(${PIECES}${FLAT})`);
      sizes.push(wideAt + (len + SEAM * 2).toFixed(2) + 'px');
      spots.push(`0 ${(top - SEAM).toFixed(2)}px`);
    };

    const crown = canopy.h * k;
    const floor = geo.two ? geo.height - ROOTS.h * k : geo.height;
    lay(canopy, 0);
    // Fresh rng per paint: a reused generator advances on fonts.ready and ResizeObserver.
    rhythm(anchors(geo.top), crown, floor, k, geo.cap, rng(pageSeed)).forEach((step) => {
      if (step.piece) lay(step.piece, step.top);
      else flat(step.top, step.len ?? 0);
    });
    if (geo.two) lay(ROOTS, floor);

    const style = run.style as CSSStyleDeclaration & { webkitMaskImage: string; webkitMaskSize: string; webkitMaskPosition: string; webkitMaskRepeat: string };
    style.webkitMaskImage = style.maskImage = images.join(', ');
    style.webkitMaskSize = style.maskSize = sizes.join(', ');
    style.webkitMaskPosition = style.maskPosition = spots.join(', ');
    style.webkitMaskRepeat = style.maskRepeat = 'no-repeat';
  };

  const paint = (): void => {
    if (pending) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      pending = 0;
      drawRun();
    });
  };

  if (window.ResizeObserver) new ResizeObserver(paint).observe(main);
  if (document.fonts) document.fonts.ready.then(paint);
  window.addEventListener('inner:repaint', paint);
  paint();
}
