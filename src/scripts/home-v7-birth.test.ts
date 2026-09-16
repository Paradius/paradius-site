// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BIRTH_STAGGER_MS, setupBirths, teardownBirths } from './home-v7-birth';

type IOCallback = (
  entries: Partial<IntersectionObserverEntry>[],
  observer: IntersectionObserver,
) => void;

/** Minimal injectable IO double: records observed targets, lets tests fire. */
function makeIO() {
  const observed = new Set<Element>();
  let callback: IOCallback = () => {};
  let instance: IntersectionObserver;
  const unobserve = vi.fn((el: Element) => observed.delete(el));
  const disconnect = vi.fn(() => observed.clear());
  class FakeIO {
    constructor(cb: IOCallback) {
      callback = cb;
      instance = this as unknown as IntersectionObserver;
    }
    observe = (el: Element) => void observed.add(el);
    unobserve = unobserve;
    disconnect = disconnect;
  }
  // The real IO hands its callback the observer itself as second argument.
  const fire = (el: Element) =>
    callback([{ target: el, isIntersecting: true } as IntersectionObserverEntry], instance);
  return { FakeIO: FakeIO as unknown as typeof IntersectionObserver, observed, fire, unobserve, disconnect };
}

function fixture(): HTMLElement {
  document.body.innerHTML = `
    <div class="home-v7">
      <section data-home-v7-node>
        <div class="home-v7__clip">a</div>
        <div class="home-v7__clip">b</div>
      </section>
      <section data-home-v7-node>
        <div class="home-v7__clip">c</div>
      </section>
    </div>`;
  return document.querySelector('.home-v7') as HTMLElement;
}

/** Same shape plus a clip that hangs off no node: nothing observes it, so nothing
 *  can ever birth it. Hiding it would leave it invisible forever. */
function fixtureWithOrphanClip(): HTMLElement {
  document.body.innerHTML = `
    <div class="home-v7">
      <section data-home-v7-node>
        <div class="home-v7__clip">a</div>
        <div class="home-v7__clip">b</div>
      </section>
      <section data-home-v7-node>
        <div class="home-v7__clip">c</div>
      </section>
      <section class="home-v7__row--orphan">
        <div class="home-v7__clip" id="orphan">d</div>
      </section>
    </div>`;
  return document.querySelector('.home-v7') as HTMLElement;
}

describe('setupBirths', () => {
  // The module keeps a singleton observer: reset it even when an assertion throws,
  // otherwise a failed test makes every later setup a silent no-op.
  afterEach(() => teardownBirths());

  it('marks every clip as pre-birth on setup', () => {
    const { FakeIO } = makeIO();
    setupBirths(fixture(), FakeIO);
    const clips = document.querySelectorAll('.home-v7__clip--birth');
    expect(clips.length).toBe(3);
  });

  it('leaves a clip outside every observed node visible', () => {
    const { FakeIO } = makeIO();
    setupBirths(fixtureWithOrphanClip(), FakeIO);
    const orphan = document.getElementById('orphan') as HTMLElement;
    expect(orphan.classList.contains('home-v7__clip--birth')).toBe(false);
    expect(document.querySelectorAll('.home-v7__clip--birth').length).toBe(3);
  });

  it('births every clip it hid once all nodes have fired and the scroll settled', () => {
    const { FakeIO, fire } = makeIO();
    const root = fixtureWithOrphanClip();
    setupBirths(root, FakeIO);
    root.querySelectorAll('[data-home-v7-node]').forEach((node) => fire(node));
    window.dispatchEvent(new Event('scrollend'));
    const birth = document.querySelectorAll('.home-v7__clip--birth').length;
    const born = document.querySelectorAll('.home-v7__clip--born').length;
    expect(birth).toBeGreaterThan(0);
    expect(born).toBe(birth);
  });

  it('holds a mid-scroll intersection pending until the scroll settles', () => {
    const { FakeIO, fire } = makeIO();
    const root = fixture();
    setupBirths(root, FakeIO);
    const nodes = root.querySelectorAll<HTMLElement>('[data-home-v7-node]');
    fire(nodes[0]); // initial batch: the landing page births immediately
    fire(nodes[1]); // page turn in flight: must NOT birth yet
    const clip = nodes[1].querySelector('.home-v7__clip') as HTMLElement;
    expect(clip.classList.contains('home-v7__clip--born')).toBe(false);
    window.dispatchEvent(new Event('scrollend'));
    expect(clip.classList.contains('home-v7__clip--born')).toBe(true);
  });

  it('observes each node', () => {
    const { FakeIO, observed } = makeIO();
    setupBirths(fixture(), FakeIO);
    expect(observed.size).toBe(2);
  });

  it('births the clips of an intersecting node with staggered delays', () => {
    const { FakeIO, fire } = makeIO();
    const root = fixture();
    setupBirths(root, FakeIO);
    const node = root.querySelector('[data-home-v7-node]') as HTMLElement;
    fire(node);
    const clips = node.querySelectorAll<HTMLElement>('.home-v7__clip');
    expect(clips[0].classList.contains('home-v7__clip--born')).toBe(true);
    expect(clips[1].classList.contains('home-v7__clip--born')).toBe(true);
    expect(clips[0].style.getPropertyValue('--birth-delay')).toBe('0ms');
    expect(clips[1].style.getPropertyValue('--birth-delay')).toBe(`${BIRTH_STAGGER_MS}ms`);
  });

  it('unobserves a node after birth: born stays born', () => {
    const { FakeIO, fire, unobserve } = makeIO();
    const root = fixture();
    setupBirths(root, FakeIO);
    const node = root.querySelector('[data-home-v7-node]') as HTMLElement;
    fire(node);
    expect(unobserve).toHaveBeenCalledWith(node);
  });

  it('is idempotent: a second setup does not duplicate observers', () => {
    const { FakeIO, observed } = makeIO();
    const root = fixture();
    setupBirths(root, FakeIO);
    setupBirths(root, FakeIO);
    expect(observed.size).toBe(2);
  });

  it('teardown disconnects the observer', () => {
    const { FakeIO, disconnect } = makeIO();
    setupBirths(fixture(), FakeIO);
    teardownBirths();
    expect(disconnect).toHaveBeenCalled();
  });
});
