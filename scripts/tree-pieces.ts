import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { clipPiece, parsePiece, renderPiece } from '../src/lib/tree/pieces';

const NAMES = ['topNoLeft', 'topNoRight', 'segmentSmall', 'segmentMedium', 'segmentLarge', 'segmentFlat', 'flatElastic', 'bottomNoLeft', 'bottomNoRight'];
const LIMITS: Record<string, number> = { topNoLeft: 102400, topNoRight: 102400, bottomNoLeft: 102400, bottomNoRight: 102400 };
const limitFor = (name: string) => LIMITS[name] ?? 8192;
const src = join(process.cwd(), 'assets-src', 'tree');
const out = join(process.cwd(), 'public', 'assets', 'tree');

mkdirSync(out, { recursive: true });
let over = 0;
for (const name of NAMES) {
  const piece = parsePiece(readFileSync(join(src, `${name}.svg`), 'utf8'));
  const kept = clipPiece(piece);
  const text = renderPiece(kept);
  writeFileSync(join(out, `${name}.svg`), text);
  const bytes = Buffer.byteLength(text);
  const limit = limitFor(name);
  if (bytes > limit) over++;
  console.log(`${name.padEnd(14)} ${String(piece.elements.length).padStart(5)} -> ${String(kept.elements.length).padStart(4)} elements ${String(bytes).padStart(6)} bytes${bytes > limit ? ' OVER' : ''}`);
}
console.log(over ? `PIECES OVER LIMIT: ${over}` : 'PIECES OK');
process.exit(over ? 1 : 0);
