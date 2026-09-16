export interface HomeEngine<A> {
  mount(): void;
  measure(): void;
  captureAnchor(): A;
  restoreAnchor(anchor: A): void;
  setFrozen(frozen: boolean): void;
}

export const REFLOW_QUIET_MS = 150;
export const REFLOWING_ATTR = 'data-reflowing';

export interface ReflowOptions {
  root: HTMLElement;
  width: number;
  height: number;
  reflowOnHeightChange: boolean;
  schedule?: (fn: () => void, ms: number) => number;
  cancel?: (id: number) => void;
  nextFrame?: (fn: () => void) => void;
}

export function createReflow<A>(
  engine: HomeEngine<A>,
  opts: ReflowOptions,
): { onViewportChange(width: number, height: number): void } {
  const schedule = opts.schedule ?? ((fn, ms) => window.setTimeout(fn, ms));
  const cancel = opts.cancel ?? ((id) => window.clearTimeout(id));
  const nextFrame = opts.nextFrame ?? ((fn) => requestAnimationFrame(() => fn()));
  let lastW = opts.width;
  let lastH = opts.height;
  let frozen = false;
  let timer = 0;
  let anchor: A;

  function land(): void {
    timer = 0;
    engine.measure();
    engine.restoreAnchor(anchor);
    nextFrame(() => {
      if (timer) return;
      opts.root.removeAttribute(REFLOWING_ATTR);
      engine.setFrozen(false);
      frozen = false;
    });
  }

  return {
    onViewportChange(width, height) {
      const widthChanged = width !== lastW;
      const heightChanged = height !== lastH;
      if (!frozen && !widthChanged && !(heightChanged && opts.reflowOnHeightChange)) {
        if (heightChanged) {
          lastH = height;
          engine.measure();
        }
        return;
      }
      lastW = width;
      lastH = height;
      if (!frozen) {
        anchor = engine.captureAnchor();
        opts.root.setAttribute(REFLOWING_ATTR, '');
        engine.setFrozen(true);
        frozen = true;
      }
      if (timer) cancel(timer);
      timer = schedule(land, REFLOW_QUIET_MS);
    },
  };
}
