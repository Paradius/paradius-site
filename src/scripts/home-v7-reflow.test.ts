// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createReflow, REFLOWING_ATTR, REFLOW_QUIET_MS, type HomeEngine } from './home-v7-reflow';

function harness(reflowOnHeightChange: boolean) {
  const log: string[] = [];
  let timer: (() => void) | null = null;
  let frame: (() => void) | null = null;
  const engine: HomeEngine<number> = {
    mount: () => log.push('mount'),
    measure: () => log.push('measure'),
    captureAnchor: () => {
      log.push('capture');
      return 7;
    },
    restoreAnchor: (a) => log.push(`restore:${a}`),
    setFrozen: (f) => log.push(`frozen:${f}`),
  };
  const root = document.documentElement;
  const reflow = createReflow(engine, {
    root,
    width: 400,
    height: 900,
    reflowOnHeightChange,
    schedule: (fn, ms) => {
      expect(ms).toBe(REFLOW_QUIET_MS);
      timer = fn;
      return 1;
    },
    cancel: () => {
      timer = null;
    },
    nextFrame: (fn) => {
      frame = fn;
    },
  });
  return {
    log,
    root,
    reflow,
    fireTimer: () => timer?.(),
    fireFrame: () => frame?.(),
  };
}

describe('createReflow', () => {
  beforeEach(() => document.documentElement.removeAttribute(REFLOWING_ATTR));

  it('freezes once for a burst and lands once when the viewport goes quiet', () => {
    const h = harness(false);
    h.reflow.onViewportChange(500, 900);
    h.reflow.onViewportChange(700, 900);
    h.reflow.onViewportChange(900, 400);
    expect(h.log).toEqual(['capture', 'frozen:true']);
    expect(h.root.hasAttribute(REFLOWING_ATTR)).toBe(true);

    h.fireTimer();
    expect(h.log).toEqual(['capture', 'frozen:true', 'measure', 'restore:7']);
    expect(h.root.hasAttribute(REFLOWING_ATTR)).toBe(true);

    h.fireFrame();
    expect(h.log).toEqual(['capture', 'frozen:true', 'measure', 'restore:7', 'frozen:false']);
    expect(h.root.hasAttribute(REFLOWING_ATTR)).toBe(false);
  });

  it('only re-measures on a height-only change when heights do not reflow', () => {
    const h = harness(false);
    h.reflow.onViewportChange(400, 820);
    expect(h.log).toEqual(['measure']);
    expect(h.root.hasAttribute(REFLOWING_ATTR)).toBe(false);
  });

  it('reflows on a height-only change when heights do reflow', () => {
    const h = harness(true);
    h.reflow.onViewportChange(400, 700);
    expect(h.log).toEqual(['capture', 'frozen:true']);
  });

  it('ignores an event that changes nothing', () => {
    const h = harness(true);
    h.reflow.onViewportChange(400, 900);
    expect(h.log).toEqual([]);
  });
});
