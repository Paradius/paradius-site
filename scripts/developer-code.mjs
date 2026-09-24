#!/usr/bin/env node
// Usage: node scripts/developer-code.mjs "Full Name"  ->  PA-XXXXXX
// The code is the first six hex digits of sha256 over the lower-cased, accent-stripped name.
import { createHash } from 'node:crypto';

const name = process.argv.slice(2).join(' ').trim();
if (!name) {
  console.error('usage: node scripts/developer-code.mjs "Full Name"');
  process.exit(1);
}
const normalized = name
  .normalize('NFKD')
  .replace(/\p{M}/gu, '')
  .toLowerCase()
  .replace(/\s+/g, ' ');
const hex = createHash('sha256').update(normalized).digest('hex').slice(0, 6).toUpperCase();
console.log(`PA-${hex}`);
