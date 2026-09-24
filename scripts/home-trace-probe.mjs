#!/usr/bin/env node
// Same wheel drive as home-frame-probe, but under a Chrome trace: every long
// main-thread task is broken down (style, layout, paint, JS, GC) and paired
// with the raster work and the --moving/--near toggles that fall inside it.
// Usage: node scripts/home-trace-probe.mjs [cdpUrl] [pageUrlPrefix]
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const CDP = process.argv[2] ?? 'http://127.0.0.1:9222';
const PREFIX = process.argv[3] ?? 'http://localhost:4322/';
const NOTCH = 120;
const LONG_MS = 20;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.connectOverCDP(CDP);
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().startsWith(PREFIX));
if (!page) throw new Error(`no tab starting with ${PREFIX}`);
await page.bringToFront();
await page.reload({ waitUntil: 'load' });
await sleep(1500);
if ((await page.evaluate(() => document.visibilityState)) !== 'visible') throw new Error('tab hidden');

await page.evaluate(() => {
  document.querySelectorAll('.home-v7__clip').forEach((el, i) => {
    let was = el.classList.contains('home-v7__clip--moving');
    let wasNear = el.classList.contains('home-v7__clip--near');
    new MutationObserver(() => {
      const now = el.classList.contains('home-v7__clip--moving');
      const near = el.classList.contains('home-v7__clip--near');
      if (now !== was) { was = now; performance.mark(`${now ? 'moving+' : 'moving-'}#${i}`); }
      if (near !== wasNear) { wasNear = near; performance.mark(`${near ? 'near+' : 'near-'}#${i}`); }
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  });
});

const cdp = await page.context().newCDPSession(page);
const events = [];
cdp.on('Tracing.dataCollected', (e) => events.push(...e.value));
const done = new Promise((r) => cdp.on('Tracing.tracingComplete', r));
await cdp.send('Tracing.start', {
  transferMode: 'ReportEvents',
  traceConfig: {
    recordMode: 'recordContinuously',
    includedCategories: ['toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'v8.execute', 'disabled-by-default-v8.gc', '__metadata'],
  },
});

await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
await cdp.send('Profiler.start');
const vp = page.viewportSize() ?? { width: 1440, height: 900 };
await page.mouse.move(vp.width / 2, vp.height / 2);
async function wheel(notches, sign, gapMs) {
  for (let i = 0; i < notches; i++) { await page.mouse.wheel(0, sign * NOTCH); await sleep(gapMs); }
  await sleep(900);
}
await page.evaluate(() => performance.mark('phase:down-fast'));
await wheel(140, 1, 45);
await page.evaluate(() => performance.mark('phase:up-medium'));
await wheel(60, -1, 80);
await page.evaluate(() => performance.mark('phase:down-slow'));
await wheel(90, 1, 140);
await page.evaluate(() => performance.mark('phase:end'));

const { profile } = await cdp.send('Profiler.stop');
await cdp.send('Tracing.end');
await done;
await browser.close().catch(() => {});

// Main thread of the page's renderer: the thread with the most style recalcs.
const threadNames = new Map();
for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') threadNames.set(`${e.pid}:${e.tid}`, e.args.name);
const styleCount = new Map();
for (const e of events) if (e.name === 'UpdateLayoutTree' || e.name === 'ScheduleStyleRecalculation') {
  const k = `${e.pid}:${e.tid}`; styleCount.set(k, (styleCount.get(k) ?? 0) + 1);
}
const [mainKey] = [...styleCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
if (!mainKey) throw new Error('no renderer main thread found in trace');
const [mainPid, mainTid] = mainKey.split(':').map(Number);
const onMain = (e) => e.pid === mainPid && e.tid === mainTid;
const complete = events.filter((e) => e.ph === 'X' && e.dur != null);
const runTasks = complete.filter((e) => onMain(e) && (e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask') && e.dur / 1000 > LONG_MS).sort((a, b) => a.ts - b.ts);
const tasks = runTasks.filter((t, i) => !(i > 0 && Math.abs(runTasks[i - 1].ts - t.ts) < 50 && Math.abs(runTasks[i - 1].dur - t.dur) < 200));
const marks = events.filter((e) => e.cat?.includes('blink.user_timing') && (e.ph === 'R' || e.ph === 'I' || e.ph === 'i'));
const raster = complete.filter((e) => e.pid === mainPid && !onMain(e) && /RasterTask|Rasterize|ImageDecode/.test(e.name));
const BREAKDOWN = ['UpdateLayoutTree', 'Layout', 'PrePaint', 'UpdateLayerTree', 'Paint', 'Commit', 'CompositeLayers', 'FunctionCall', 'EventDispatch', 'TimerFire', 'MinorGC', 'MajorGC', 'V8.GCScavenger', 'V8.GCFinalizeMC', 'HitTest', 'ParseHTML', 'ResourceReceivedData', 'DecodeImage', 'Animation'];
const t0 = complete.filter(onMain).reduce((m, e) => Math.min(m, e.ts), Infinity);
const phaseMarks = marks.filter((m) => m.name.startsWith('phase:')).map((m) => ({ name: m.name.slice(6), ts: m.ts }));
const phaseOf = (ts) => { let p = 'pre'; for (const m of phaseMarks) if (m.ts <= ts) p = m.name; return p; };
const rows = tasks.map((task) => {
  const end = task.ts + task.dur;
  const inside = complete.filter((e) => onMain(e) && e.ts >= task.ts && e.ts + e.dur <= end && e !== task);
  const sums = {};
  for (const e of inside) if (BREAKDOWN.includes(e.name)) sums[e.name] = (sums[e.name] ?? 0) + e.dur / 1000;
  const top = Object.entries(sums).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n, v]) => `${n} ${v.toFixed(1)}`);
  const rasterMs = raster.filter((e) => e.ts + e.dur > task.ts - 5000 && e.ts < end + 5000).reduce((s, e) => s + e.dur / 1000, 0);
  const toggles = marks.filter((m) => !m.name.startsWith('phase:') && m.ts >= task.ts - 30000 && m.ts <= end).map((m) => m.name);
  const fns = inside.filter((e) => e.name === 'FunctionCall' && e.dur / 1000 > 2).map((e) => `${e.args?.data?.functionName ?? '?'}@${(e.args?.data?.url ?? '').split('/').pop()}:${e.args?.data?.lineNumber ?? '?'} ${(e.dur / 1000).toFixed(1)}`);
  const other = {};
  for (const e of inside) if (!BREAKDOWN.includes(e.name) && !/RunTask|FunctionCall/.test(e.name) && e.dur / 1000 > 1) other[e.name] = +((other[e.name] ?? 0) + e.dur / 1000).toFixed(1);
  return { t: +((task.ts - t0) / 1000).toFixed(0), phase: phaseOf(task.ts), ts: task.ts, end, dur: +(task.dur / 1000).toFixed(1), top, rasterMs: +rasterMs.toFixed(1), toggles, fns, other };
});
const agg = {};
for (const r of rows) for (const s of r.top) { const [n, v] = s.split(' '); agg[n] = +((agg[n] ?? 0) + +v).toFixed(1); }
const nodeById = new Map(profile.nodes.map((n) => [n.id, n]));
let pt = profile.startTime;
const selfAll = new Map();
const selfLong = new Map();
const label = (n) => `${n.callFrame.functionName || '(anonymous)'}@${(n.callFrame.url || '').split('/').pop()}:${n.callFrame.lineNumber}`;
let inLongSamples = 0;
for (let i = 0; i < profile.samples.length; i++) {
  pt += profile.timeDeltas[i];
  const n = nodeById.get(profile.samples[i]);
  const d = profile.timeDeltas[i] / 1000;
  const key = label(n);
  selfAll.set(key, (selfAll.get(key) ?? 0) + d);
  if (rows.some((r) => pt >= r.ts && pt <= r.end)) { inLongSamples++; selfLong.set(key, (selfLong.get(key) ?? 0) + d); }
}
const topOf = (m, n = 12) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${v.toFixed(1)}ms ${k}`);
console.log('clock check: profile.startTime', profile.startTime, 'trace t0', t0, 'samples in long tasks', inLongSamples, 'of', profile.samples.length);
console.log('SELF TIME, whole drive:'); for (const l of topOf(selfAll)) console.log('  ' + l);
console.log('SELF TIME, inside long tasks:'); for (const l of topOf(selfLong)) console.log('  ' + l);
const summary = {
  mainThread: threadNames.get(mainKey), longTasks: rows.length, longTasksMs: +rows.reduce((s, r) => s + r.dur, 0).toFixed(0),
  withMovingToggle: rows.filter((r) => r.toggles.some((t) => t.startsWith('moving'))).length,
  withNearToggle: rows.filter((r) => r.toggles.some((t) => t.startsWith('near'))).length,
  byPhase: Object.fromEntries(['pre', 'down-fast', 'up-medium', 'down-slow'].map((p) => [p, rows.filter((r) => r.phase === p).length])),
  breakdownMsAcrossLongTasks: agg, rasterMsTotal: +raster.reduce((s, e) => s + e.dur / 1000, 0).toFixed(0), events: events.length,
};
writeFileSync('reports/home-trace-probe.json', JSON.stringify({ summary, rows }, null, 1));
console.log(JSON.stringify(summary, null, 1));
for (const r of rows) console.log(`${String(r.t).padStart(6)}ms ${r.phase.padEnd(10)} ${String(r.dur).padStart(6)}ms  raster ${String(r.rasterMs).padStart(6)}ms  ${r.top.join(' | ')}  ${r.toggles.join(',')}  fns[${r.fns.join('; ')}] other ${JSON.stringify(r.other)}`);
