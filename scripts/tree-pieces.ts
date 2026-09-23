import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { clipPiece, parsePiece, renderPiece } from '../src/lib/tree/pieces';
import { CANOPY } from '../src/scripts/tree-geometry';

const NAMES = ['topNoLeft', 'topNoRight', 'segmentSmall', 'segmentMedium', 'segmentLarge', 'segmentFlat', 'flatElastic', 'bottomNoLeft', 'bottomNoRight'];
const LIMITS: Record<string, number> = { topNoLeft: 102400, topNoRight: 102400, bottomNoLeft: 102400, bottomNoRight: 102400 };
const limitFor = (name: string) => LIMITS[name] ?? 8192;
// The canopy exports clip from above the art; the run seats them at the art's top, so their
// emitted window is the geometry's, not the export's.
const WINDOWS: Record<string, { y0: number; h: number }> = {
  [CANOPY.left.file.replace('.svg', '')]: CANOPY.left,
  [CANOPY.right.file.replace('.svg', '')]: CANOPY.right,
};
const src = join(process.cwd(), 'assets-src', 'tree');
const out = join(process.cwd(), 'public', 'assets', 'tree');

mkdirSync(out, { recursive: true });
let over = 0;
for (const name of NAMES) {
  const piece = parsePiece(readFileSync(join(src, `${name}.svg`), 'utf8'));
  const kept = clipPiece(piece);
  const spec = WINDOWS[name];
  const text = renderPiece(kept, spec ? { ...kept.window, y: spec.y0, height: spec.h } : kept.window);
  writeFileSync(join(out, `${name}.svg`), text);
  const bytes = Buffer.byteLength(text);
  const limit = limitFor(name);
  if (bytes > limit) over++;
  console.log(`${name.padEnd(14)} ${String(piece.elements.length).padStart(5)} -> ${String(kept.elements.length).padStart(4)} elements ${String(bytes).padStart(6)} bytes${bytes > limit ? ' OVER' : ''}`);
}
console.log(over ? `PIECES OVER LIMIT: ${over}` : 'PIECES OK');
process.exit(over ? 1 : 0);
