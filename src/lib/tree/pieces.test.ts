import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { clipPiece, clipPolyline, parsePiece, renderPiece } from './pieces';

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1430 1360">
  <defs>
    <style>
      .cls-1, .cls-2 { fill: none; }
      .cls-2 { stroke: #000; stroke-miterlimit: 10; stroke-width: 4px; }
      .cls-3 { clip-path: url(#clippath); }
    </style>
    <clipPath id="clippath">
      <rect class="cls-1" x="657.06" y="589.59" width="103.81" height="53.9"/>
    </clipPath>
  </defs>
  <g class="cls-3">
    <g id="A1">
      <polyline class="cls-2" points="700 100 700 200"/>
      <polyline class="cls-2" points="700 580 700 600 720 600"/>
      <line class="cls-2" x1="702.63" y1="1319.07" x2="702.63" y2="189.02"/>
      <path d="M782.45,1207.58c0-2.77,2.24-5.01,5.01-5.01Z"/>
      <path d="M770,640c0-2.77,2.24-5.01,5.01-5.01Z"/>
    </g>
  </g>
</svg>`;

const SMALL = ['segmentSmall', 'segmentMedium', 'segmentLarge', 'segmentFlat', 'flatElastic'];
const LARGE = ['topNoLeft', 'topNoRight', 'bottomNoLeft', 'bottomNoRight'];
const BOX = { x: 0, y: 0, width: 100, height: 100 };

describe('parsePiece', () => {
  it('reads the clip window from a rect', () => {
    const piece = parsePiece(FIXTURE);
    expect(piece.window).toEqual({ x: 657.06, y: 589.59, width: 103.81, height: 53.9 });
    expect(piece.elements).toHaveLength(5);
  });

  it('reads the clip window from a four-point polyline', () => {
    const text = FIXTURE.replace('<rect class="cls-1" x="657.06" y="589.59" width="103.81" height="53.9"/>', '<polyline class="cls-1" points="760.87 589.59 760.87 643.49 657.06 643.49 657.06 589.59"/>');
    expect(parsePiece(text).window).toEqual({ x: 657.06, y: 589.59, width: 103.81, height: 53.9 });
  });
});

describe('clipPolyline', () => {
  it('keeps a segment that lies inside', () => {
    expect(clipPolyline([[10, 10], [90, 90]], BOX)).toEqual([[[10, 10], [90, 90]]]);
  });
  it('cuts a segment at the edge it crosses', () => {
    expect(clipPolyline([[50, 50], [150, 50]], BOX)).toEqual([[[50, 50], [100, 50]]]);
  });
  it('splits a trace that leaves and comes back into two runs', () => {
    expect(clipPolyline([[50, 50], [150, 50], [150, 60], [50, 60]], BOX)).toEqual([[[50, 50], [100, 50]], [[100, 60], [50, 60]]]);
  });
  it('drops a trace that never enters', () => {
    expect(clipPolyline([[150, 10], [150, 90]], BOX)).toEqual([]);
  });
  it('joins consecutive inside segments into one run', () => {
    expect(clipPolyline([[10, 10], [20, 20], [30, 10]], BOX)).toEqual([[[10, 10], [20, 20], [30, 10]]]);
  });
});

describe('clipPiece', () => {
  it('clips traces to the window plus the margin, keeps near rings, drops the rest', () => {
    const kept = clipPiece(parsePiece(FIXTURE)).elements.map((el) => el.markup);
    expect(kept).toEqual([
      '<polyline class="cls-2" points="700 581.59 700 600 720 600"/>',
      '<polyline class="cls-2" points="702.63 651.49 702.63 581.59"/>',
      '<path d="M770,640c0-2.77,2.24-5.01,5.01-5.01Z"/>',
    ]);
  });
  it('does not mutate its input', () => {
    const piece = parsePiece(FIXTURE);
    const before = JSON.stringify(piece);
    clipPiece(piece);
    expect(JSON.stringify(piece)).toBe(before);
  });
});

describe('renderPiece', () => {
    it('narrows the viewBox to the clip window with its margin and keeps the style, the clipPath and the clipped group', () => {
    const out = renderPiece(clipPiece(parsePiece(FIXTURE)));
    expect(out.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(out).toContain('viewBox="0 581.59 1430 69.9"');
    expect(out).toContain('clip-path: url(#clippath)');
    expect(out).toContain('<clipPath id="clippath">');
    expect(out).toContain('<g class="cls-3">');
    expect(out).not.toContain('700 100 700 200');
    expect(out).not.toContain('M782.45');
  });
});

describe('the nine sources', () => {
  const read = (name: string) => readFileSync(join(process.cwd(), 'assets-src', 'tree', `${name}.svg`), 'utf8');
  for (const name of SMALL) {
    it(`${name} clips to under 8KB`, () => {
      const out = renderPiece(clipPiece(parsePiece(read(name))));
      expect(out.length).toBeLessThan(8192);
      expect(out).toContain('<clipPath id="clippath">');
    });
  }
  for (const name of LARGE) {
    it(`${name} clips to under 100KB`, () => {
      const out = renderPiece(clipPiece(parsePiece(read(name))));
      expect(out.length).toBeLessThan(102400);
      expect(out).toContain('<clipPath id="clippath">');
    });
  }
  it('a clipped piece is a fixed point of the clipper', () => {
    const out = renderPiece(clipPiece(parsePiece(read('segmentSmall'))));
    expect(renderPiece(clipPiece(parsePiece(out)))).toBe(out);
  });
});
