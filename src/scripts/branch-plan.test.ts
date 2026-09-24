import { describe, expect, it } from 'vitest';
import { MAIN_SPAN, VIEW_BOX, maskSvg, planBranch, timeStrands } from './branch-plan';

const JUNIOR = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1430 1360">
  <defs>
    <style>
      .cls-1 { fill: none; stroke: #000; stroke-miterlimit: 10; stroke-width: 4px; }
    </style>
  </defs>
  <g id="A1">
    <g>
      <polyline class="cls-1" points="738.33 1017.06 738.33 558.22 773.6 526.19 1024.27 524.99"/>
      <path d="M733.32,1020.36c0-2.77,2.24-5.01,5.01-5.01Z"/>
      <path d="M1027.55,519.96c-2.77.01-5,2.27-4.99,5.04Z"/>
    </g>
  </g>
  <g>
    <polyline class="cls-1" points="981 524.95 1009.48 539.49 1217.16 539.49"/>
    <path d="M1220.46,534.48c-2.77,0-5.01,2.24-5.01,5.01Z"/>
  </g>
  <g>
    <polyline class="cls-1" points="738.94 578.76 784.02 537.62 915.25 537.5"/>
    <path d="M918.55,532.48c-2.77,0-5.01,2.25-5.01,5.02Z"/>
  </g>
</svg>`;

describe('planBranch', () => {
  it('reads one strand per polyline with the tips that follow it, dropping the source node', () => {
    const strands = planBranch(JUNIOR);
    expect(strands).toHaveLength(3);
    expect(strands[0].points).toEqual([[738.33, 1017.06], [738.33, 558.22], [773.6, 526.19], [1024.27, 524.99]]);
    expect(strands[0].tips).toHaveLength(1);
    expect(strands[0].tips[0].startsWith('M1027.55,519.96')).toBe(true);
    expect(strands[1].tips).toHaveLength(1);
    expect(strands[2].tips).toHaveLength(1);
  });
});

describe('timeStrands', () => {
  it('times the trunk strands first and the far strand after the main span', () => {
    const timed = timeStrands(planBranch(JUNIOR));
    expect(timed[0].points[0]).toEqual([738.33, 558.22]);
    expect(timed[0].at).toBe(0);
    expect(timed[0].span).toBe(MAIN_SPAN);
    expect(timed[1].at).toBeCloseTo(0.552, 3);
    expect(timed[1].span).toBeCloseTo(0.35, 5);
    expect(timed[2].at).toBe(0);
    expect(timed[2].span).toBe(MAIN_SPAN);
    expect(timed[0].tips[0].at).toBeCloseTo(0.65, 5);
    expect(timed[1].tips[0].at).toBeCloseTo(0.902, 3);
  });
  it('does not mutate its input', () => {
    const strands = planBranch(JUNIOR);
    const before = JSON.stringify(strands);
    timeStrands(strands);
    expect(JSON.stringify(strands)).toBe(before);
  });
});

describe('maskSvg', () => {
  it('draws every strand and tip of the branch in white, whole, on the art window', () => {
    const strands = timeStrands(planBranch(JUNIOR));
    const svg = maskSvg(strands);
    expect(svg).toContain(`viewBox="${VIEW_BOX}"`);
    expect(svg.match(/<polyline /g)).toHaveLength(strands.length);
    expect(svg.match(/<path /g)).toHaveLength(strands.reduce((n, s) => n + s.tips.length, 0));
    expect(svg).toContain('stroke="#fff"');
    expect(svg).not.toContain('dasharray');
  });
});
