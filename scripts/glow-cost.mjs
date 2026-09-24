// Glow cost probe: traces one page in headless Chromium (software raster, the pessimistic
// machine) for a rest phase and a wheel-scroll phase, once per CSS variant, and reports per
// second of each phase: frames by state (PipelineReporter), raster, image decode, main-thread
// paint/layout, GPU work, and long tasks. Usage:
//   PROBE_URL=http://localhost:4322 node scripts/glow-cost.mjs [/path/] [variant ...]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.PROBE_URL ?? 'http://localhost:4322').replace(/\/$/, '');
const ROUNDS = Number(process.env.ROUNDS ?? 2);
const REST_MS = 6000;
const SCROLL_MS = 6000;
const args = process.argv.slice(2);
const path = args[0]?.startsWith('/') ? args.shift() : '/';

const VARIANTS = {
  default: '',
  off: '.home-v7__glow-ramp, .inner-run__band { display: none !important; }',
  one: '.home-v7__glow-band:not(:first-child), .inner-run__band:not(:first-child) { display: none !important; }',
  noramp: '.home-v7__glow-ramp { mask-image: none !important; -webkit-mask-image: none !important; }',
  loop: '.home-v7__glow-band { top: -125%; height: 700%; background-size: 100% 50%; background-repeat: repeat-y; animation-name: glow-loop-probe; animation-duration: calc(var(--gs, 11s) * 1.43); animation-delay: calc(var(--gd, 0s) * -1); } @keyframes glow-loop-probe { from { transform: translateY(0); } to { transform: translateY(-50%); } }',
};
const wanted = args.length ? args : ['off', 'default', 'one', 'noramp'];
for (const v of wanted) if (!(v in VARIANTS)) { console.error(`unknown variant ${v}; known: ${Object.keys(VARIANTS).join(' ')}`); process.exit(2); }

const CATEGORIES = ['-*', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'benchmark', 'cc', 'viz', 'gpu', 'toplevel', 'blink', 'blink.user_timing'];
const MAIN = new Set(['Paint', 'PrePaint', 'Layout', 'UpdateLayoutTree', 'Commit', 'Layerize', 'UpdateLayer', 'Animation']);
const RASTER = new Set(['RasterTask', 'Rasterize']);
const DECODE = new Set(['ImageDecodeTask', 'Decode Image', 'Decode LazyPixelRef']);

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../.superpowers/sdd/2026-09-22-inner-pages-port/reports');
const rawDir = process.env.GLOW_RAW_DIR ?? resolve(process.env.TMPDIR ?? '/tmp', 'glow-cost');
mkdirSync(outDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });

function summarize(events, marks) {
  const threads = new Map();
  for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
  const phases = { rest: [marks.rest, marks.scroll], scroll: [marks.scroll, marks.end] };
  const out = {};
  for (const [phase, [t0, t1]] of Object.entries(phases)) {
    const s = { seconds: (t1 - t0) / 1e6, frames: 0, presented: 0, dropped: 0, partial: 0, missing: 0, raster: 0, decode: 0, main: 0, gpu: 0, longTasks: 0, longest: 0 };
    for (const e of events) {
      if (e.ts < t0 || e.ts >= t1) continue;
      // Chromium 150 exports PipelineReporter without its state args: frames come from the
      // devtools frame instants instead.
      if (e.ph === 'I' && e.name === 'BeginFrame') { s.frames += 1; continue; }
      if (e.ph === 'I' && e.name === 'DroppedFrame') { s.dropped += 1; continue; }
      if (e.ph === 'I' && e.name === 'DrawFrame') { s.presented += 1; continue; }
      if (e.ph !== 'X' || !(e.dur > 0)) continue;
      const ms = e.dur / 1000;
      if (RASTER.has(e.name)) s.raster += ms;
      else if (DECODE.has(e.name)) s.decode += ms;
      else if (MAIN.has(e.name)) s.main += ms;
      else if (e.name === 'GPUTask') s.gpu += ms;
      else if (e.name === 'RunTask' && threads.get(`${e.pid}:${e.tid}`) === 'CrRendererMain') {
        if (ms > 50) s.longTasks += 1;
        if (ms > s.longest) s.longest = ms;
      }
    }
    out[phase] = s;
  }
  return out;
}

const fmt = (n) => n.toFixed(1).padStart(7);
function row(variant, round, phase, s) {
  const sec = s.seconds || 1;
  return `${variant.padEnd(6)} r${round} ${phase.padEnd(6)} frames ${String(s.frames).padStart(4)} drawn ${String(s.presented).padStart(4)} dropped ${String(s.dropped).padStart(4)} | ms/s: raster ${fmt(s.raster / sec)} decode ${fmt(s.decode / sec)} main ${fmt(s.main / sec)} gpu ${fmt(s.gpu / sec)} | main long>50ms ${s.longTasks} longest ${s.longest.toFixed(0)}ms`;
}

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const warm = await context.newPage();
await warm.goto(BASE + path, { waitUntil: 'networkidle' });
await warm.close();

const results = [];
for (let round = 1; round <= ROUNDS; round++) {
  for (const variant of wanted) {
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const spec = typeof VARIANTS[variant] === 'string' ? { css: VARIANTS[variant] } : VARIANTS[variant];
    if (spec.dom) await page.evaluate(spec.dom);
    if (spec.css) await page.addStyleTag({ content: spec.css });
    await page.waitForTimeout(800);
    const cdp = await context.newCDPSession(page);
    const events = [];
    cdp.on('Tracing.dataCollected', (d) => events.push(...d.value));
    const done = new Promise((ok) => cdp.once('Tracing.tracingComplete', ok));
    await cdp.send('Tracing.start', { categories: CATEGORIES.join(','), transferMode: 'ReportEvents', options: 'sampling-frequency=0' });
    const mark = (name) => page.evaluate((n) => { performance.mark(n); return performance.now(); }, name);
    await mark('glow:rest');
    await page.waitForTimeout(REST_MS);
    const y0 = await page.evaluate(() => window.scrollY);
    await mark('glow:scroll');
    await page.mouse.move(720, 450);
    const half = SCROLL_MS / 2;
    let t = Date.now();
    while (Date.now() - t < half) { await page.mouse.wheel(0, -120); await page.waitForTimeout(40); }
    const yMid = await page.evaluate(() => window.scrollY);
    t = Date.now();
    while (Date.now() - t < half) { await page.mouse.wheel(0, 120); await page.waitForTimeout(40); }
    const y1 = await page.evaluate(() => window.scrollY);
    await mark('glow:end');
    await cdp.send('Tracing.end');
    await done;
    await cdp.detach();
    await page.close();

    const marks = {};
    for (const e of events) {
      if (e.cat === 'blink.user_timing' && typeof e.name === 'string' && e.name.startsWith('glow:')) marks[e.name.slice(5)] = e.ts;
    }
    if (!('rest' in marks && 'scroll' in marks && 'end' in marks)) {
      console.error(`marks missing for ${variant}: ${JSON.stringify(marks)} (events ${events.length})`);
      process.exit(1);
    }
    if (process.env.GLOW_NAMES) {
      const census = new Map();
      for (const e of events) if (e.ph === 'X' && e.dur > 0) census.set(e.name, (census.get(e.name) ?? 0) + e.dur / 1000);
      console.log([...census].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([n, ms]) => `${n} ${ms.toFixed(0)}ms`).join('\n'));
    }
    const summary = summarize(events, marks);
    const rawPath = resolve(rawDir, `glow-cost-${variant}-r${round}.json`);
    writeFileSync(rawPath, JSON.stringify({ traceEvents: events }));
    results.push({ variant, round, scroll: [y0, yMid, y1], ...summary });
    console.log(row(variant, round, 'rest', summary.rest));
    console.log(row(variant, round, 'scroll', summary.scroll) + `  scrollY ${y0}->${yMid}->${y1}`);
  }
}
await browser.close();
const outPath = resolve(outDir, `glow-cost-${path === '/' ? 'home' : path.replace(/\//g, '')}.json`);
writeFileSync(outPath, JSON.stringify({ base: BASE, path, viewport: '1440x900', headless: true, restMs: REST_MS, scrollMs: SCROLL_MS, results }, null, 2));
console.log(`GLOW COST OK -> ${outPath} (raw traces in ${rawDir})`);
