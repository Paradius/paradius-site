export interface Window {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PieceElement {
  tag: 'polyline' | 'line' | 'path';
  markup: string;
  box: Window;
}

export interface Piece {
  header: string;
  window: Window;
  elements: PieceElement[];
}

export type Point = [number, number];

const DEFS_CLOSE = '</defs>';
const ELEMENT_TAG = /<(polyline|line|path)\b[^>]*\/>/g;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function attr(markup: string, name: string): string {
  const match = markup.match(new RegExp(`\\b${name}="([^"]*)"`));
  if (!match) {
    throw new Error(`missing attribute ${name}`);
  }
  return match[1];
}

function parsePoints(points: string): { x: number; y: number }[] {
  const nums = points
    .trim()
    .split(/[\s,]+/)
    .filter((part) => part.length > 0)
    .map(Number);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    out.push({ x: nums[i], y: nums[i + 1] });
  }
  return out;
}

function boxOfPoints(points: { x: number; y: number }[]): Window {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function parseClipWindow(header: string): Window {
  const clip = header.match(/<clipPath id="clippath">([\s\S]*?)<\/clipPath>/);
  if (!clip) {
    throw new Error('missing clipPath');
  }
  const inner = clip[1];
  const rect = inner.match(/<rect\b[^>]*\/?>/);
  if (rect) {
    const tag = rect[0];
    return {
      x: Number(attr(tag, 'x')),
      y: Number(attr(tag, 'y')),
      width: Number(attr(tag, 'width')),
      height: Number(attr(tag, 'height')),
    };
  }
  const polyline = inner.match(/<polyline\b[^>]*\/?>/);
  if (!polyline) {
    throw new Error('clipPath has no rect or polyline');
  }
  const box = boxOfPoints(parsePoints(attr(polyline[0], 'points')));
  return {
    x: round2(box.x),
    y: round2(box.y),
    width: round2(box.width),
    height: round2(box.height),
  };
}

function elementBox(tag: PieceElement['tag'], markup: string): Window {
  if (tag === 'polyline') {
    return boxOfPoints(parsePoints(attr(markup, 'points')));
  }
  if (tag === 'line') {
    return boxOfPoints([
      { x: Number(attr(markup, 'x1')), y: Number(attr(markup, 'y1')) },
      { x: Number(attr(markup, 'x2')), y: Number(attr(markup, 'y2')) },
    ]);
  }
  const move = markup.match(/M\s*([-\d.]+)[,\s]+([-\d.]+)/);
  if (!move) {
    throw new Error('path missing M');
  }
  return {
    x: Number(move[1]) - 12,
    y: Number(move[2]) - 12,
    width: 24,
    height: 24,
  };
}

function intersects(a: Window, b: Window): boolean {
  return a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
}

function expand(window: Window, margin: number): Window {
  return {
    x: window.x - margin,
    y: window.y - margin,
    width: window.width + margin * 2,
    height: window.height + margin * 2,
  };
}

export function parsePiece(svg: string): Piece {
  const closeAt = svg.indexOf(DEFS_CLOSE);
  if (closeAt < 0) {
    throw new Error('missing </defs>');
  }
  const header = svg.slice(0, closeAt + DEFS_CLOSE.length);
  const body = svg.slice(closeAt + DEFS_CLOSE.length);
  const elements: PieceElement[] = [];
  for (const match of body.matchAll(ELEMENT_TAG)) {
    const tag = match[1] as PieceElement['tag'];
    const markup = match[0];
    elements.push({ tag, markup, box: elementBox(tag, markup) });
  }
  return { header, window: parseClipWindow(header), elements };
}

function clipSegment(p0: Point, p1: Point, box: Window): [Point, Point] | null {
  const xmin = box.x;
  const ymin = box.y;
  const xmax = box.x + box.width;
  const ymax = box.y + box.height;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, p0[0] - xmin],
    [dx, xmax - p0[0]],
    [-dy, p0[1] - ymin],
    [dy, ymax - p0[1]],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  if (t0 > t1) return null;
  return [
    [p0[0] + t0 * dx, p0[1] + t0 * dy],
    [p0[0] + t1 * dx, p0[1] + t1 * dy],
  ];
}

function near(a: Point, b: Point): boolean {
  return Math.abs(a[0] - b[0]) <= 1e-6 && Math.abs(a[1] - b[1]) <= 1e-6;
}

export function clipPolyline(points: Point[], box: Window): Point[][] {
  const runs: Point[][] = [];
  let run: Point[] | null = null;
  const close = () => {
    if (run && run.length >= 2) {
      runs.push(run.map(([x, y]) => [round2(x), round2(y)] as Point));
    }
    run = null;
  };
  for (let i = 0; i + 1 < points.length; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    if (p0[0] === p1[0] && p0[1] === p1[1]) continue;
    const inside = clipSegment(p0, p1, box);
    if (!inside) {
      close();
      continue;
    }
    const [a, b] = inside;
    if (run && near(run[run.length - 1], a)) {
      run.push(b);
    } else {
      close();
      run = [a, b];
    }
  }
  close();
  return runs;
}

function className(markup: string): string {
  const match = markup.match(/\bclass="([^"]*)"/);
  return match?.[1] ?? 'cls-2';
}

function pointsOf(el: PieceElement): Point[] {
  if (el.tag === 'polyline') {
    return parsePoints(attr(el.markup, 'points')).map((p) => [p.x, p.y]);
  }
  return [
    [Number(attr(el.markup, 'x1')), Number(attr(el.markup, 'y1'))],
    [Number(attr(el.markup, 'x2')), Number(attr(el.markup, 'y2'))],
  ];
}

function polylineMarkup(cls: string, run: Point[]): string {
  return `<polyline class="${cls}" points="${run.map(([x, y]) => `${x} ${y}`).join(' ')}"/>`;
}

export function clipPiece(piece: Piece, margin = 8): Piece {
  const box = expand(piece.window, margin);
  const pathZone = expand(piece.window, 12);
  const elements: PieceElement[] = [];
  // Stacked export groups repeat the same clipped stroke; keep identical markup once.
  const seen = new Set<string>();
  const push = (el: PieceElement) => {
    if (seen.has(el.markup)) return;
    seen.add(el.markup);
    elements.push(el);
  };
  for (const el of piece.elements) {
    if (el.tag === 'path') {
      if (intersects(el.box, pathZone)) {
        push({ tag: el.tag, markup: el.markup, box: { ...el.box } });
      }
      continue;
    }
    const cls = className(el.markup);
    for (const run of clipPolyline(pointsOf(el), box)) {
      push({
        tag: 'polyline',
        markup: polylineMarkup(cls, run),
        box: boxOfPoints(run.map(([x, y]) => ({ x, y }))),
      });
    }
  }
  return { header: piece.header, window: piece.window, elements };
}

export function renderPiece(piece: Piece): string {
  return (
    `${piece.header}\n  <g class="cls-3">\n` +
    `${piece.elements.map((el) => `    ${el.markup}`).join('\n')}\n` +
    '  </g>\n</svg>\n'
  );
}
