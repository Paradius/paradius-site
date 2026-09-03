// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { GLOW_SELECTOR, prepareGlowClones } from './home-v7-glow';

function fixture(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('prepareGlowClones', () => {
  it('clones text into data-text and marks the host', () => {
    const root = fixture('<p class="home-v7__force-text">Guardrails on every line.</p>');

    const count = prepareGlowClones(root);

    const el = root.querySelector<HTMLElement>('.home-v7__force-text');
    expect(count).toBe(1);
    expect(el?.dataset.text).toBe('Guardrails on every line.');
    expect(el?.classList.contains('home-v7__glow-host')).toBe(true);
  });

  it('flattens mixed content to its text run (the graft with a link)', () => {
    const root = fixture(
      '<p class="home-v7__graft">Read <a class="x" href="/how-we-work">how we work</a></p>',
    );

    prepareGlowClones(root);

    expect(root.querySelector<HTMLElement>('.home-v7__graft')?.dataset.text).toBe(
      'Read how we work',
    );
  });

  it('never touches the bespoke prophecy elements', () => {
    const root = fixture(`
      <p class="home-v7__peak home-v7__peak--confession home-v7__peak--oneline">Dawn</p>
      <p class="home-v7__peak-lead home-v7__peak-lead--oneline">Let the ones</p>
    `);

    const count = prepareGlowClones(root);

    expect(count).toBe(0);
    expect(root.querySelector('.home-v7__glow-host')).toBeNull();
  });

  it('covers both tone groups and is idempotent', () => {
    const root = fixture(`
      <p class="home-v7__peak">White peak</p>
      <p class="home-v7__peak home-v7__peak--dim">Dim peak</p>
      <p class="home-v7__voice">Voice</p>
      <p class="home-v7__peak-lead">Lead</p>
      <a class="home-v7__graft-link" href="/x">Link</a>
    `);

    const first = prepareGlowClones(root);
    const second = prepareGlowClones(root);

    expect(first).toBe(5);
    expect(second).toBe(5);
    expect(root.querySelectorAll('.home-v7__glow-host')).toHaveLength(5);
  });

  it('keeps an owner-set data-text (does not overwrite)', () => {
    const root = fixture('<p class="home-v7__voice" data-text="Custom">Rendered</p>');

    prepareGlowClones(root);

    expect(root.querySelector<HTMLElement>('.home-v7__voice')?.dataset.text).toBe('Custom');
  });

  it('exposes one combined selector for CSS parity checks', () => {
    expect(GLOW_SELECTOR).toContain('.home-v7__graft');
    expect(GLOW_SELECTOR).toContain(':not(.home-v7__peak--oneline)');
  });
});
