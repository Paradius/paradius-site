export const TRUNK_X = 738.33;
export const MAIN_SPAN = 0.65;
export const SOURCE_NODE_Y = 1000;
export const VIEW_BOX = '740.33 506 632 82';

export interface Strand {
  points: [number, number][];
  tips: string[];
}

export interface TimedTip {
  d: string;
  at: number;
}

export interface TimedStrand {
  points: [number, number][];
  at: number;
  span: number;
  tips: TimedTip[];
}

function startY(d: string): number {
  const head = /^\s*[Mm]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(d);
  return head ? parseFloat(head[2]) : 0;
}

function coords(text: string): [number, number][] {
  const flat = text.trim().split(/[\s,]+/).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
  return out;
}

export function planBranch(svg: string): Strand[] {
  const tagRe = /<(polyline|path)\b([^>]*)\/>/g;
  const strands: Strand[] = [];
  let current: Strand | null = null;
  let match = tagRe.exec(svg);
  while (match) {
    const name = match[1];
    const attrs = match[2];
    if (name === 'polyline') {
      const pointsAttr = /\bpoints="([^"]*)"/.exec(attrs);
      current = { points: coords(pointsAttr ? pointsAttr[1] : ''), tips: [] };
      strands.push(current);
    } else if (current) {
      const dAttr = /\bd="([^"]*)"/.exec(attrs);
      const d = dAttr ? dAttr[1] : '';
      if (startY(d) <= SOURCE_NODE_Y) current.tips.push(d);
    }
    match = tagRe.exec(svg);
  }
  return strands;
}

export function timeStrands(list: Strand[]): TimedStrand[] {
  let reach = 1;
  return list.map((def, i) => {
    const pts = def.points.slice();
    // The stem rides the trunk's own line, out of sight: growing it would be dead time.
    if (pts[0] && pts[0][1] > SOURCE_NODE_Y) pts.shift();
    if (i === 0 && pts.length) reach = pts[pts.length - 1][0] - TRUNK_X;
    const origin = pts[0] ?? [0, 0];
    const fromTrunk = origin[0] - TRUNK_X < 6;
    const at = fromTrunk ? 0 : MAIN_SPAN * Math.min(1, (origin[0] - TRUNK_X) / reach);
    const span = fromTrunk ? MAIN_SPAN : 1 - MAIN_SPAN;
    return {
      points: pts,
      at,
      span,
      tips: def.tips.map((d) => ({ d, at: at + span })),
    };
  });
}

/** The whole branch in white on the art window: the light's mask, so it aligns with the drawn strands. */
export function maskSvg(list: TimedStrand[]): string {
  const strokes = list.map((s) => `<polyline points="${s.points.map((p) => p.join(' ')).join(' ')}"/>`).join('');
  const tips = list.flatMap((s) => s.tips.map((t) => `<path d="${t.d}"/>`)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}"><g fill="none" stroke="#fff" stroke-width="4" stroke-miterlimit="10">${strokes}</g><g fill="#fff">${tips}</g></svg>`;
}
