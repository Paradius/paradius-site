#!/usr/bin/env node
// Drives the home with real wheel input over CDP (an Edge/Chrome launched with
// --remote-debugging-port) and records every animation frame together with the
// instants each block toggles its --moving layer promotion.
// Usage: node scripts/home-frame-probe.mjs [cdpUrl] [pageUrlPrefix] [variant ...]
// A variant injects a CSS override after load (see VARIANTS); 'default' injects nothing.
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const CDP = process.argv[2] ?? 'http://127.0.0.1:9222';
const PREFIX = process.argv[3] ?? 'http://localhost:4322/';
const NOTCH = 120;
import { VARIANTS } from './home-variants.mjs';
const variants = process.argv.slice(4);
if (variants.length === 0) variants.push('default');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {};
for (const variant of variants) {
const browser = await chromium.connectOverCDP(CDP);
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().startsWith(PREFIX));
if (!page) throw new Error(`no tab starting with ${PREFIX}`);
await page.bringToFront();
await page.reload({ waitUntil: 'load' });
await sleep(1500);
const visible = await page.evaluate(() => document.visibilityState);
if (visible !== 'visible') throw new Error(`tab is ${visible}; bring it to the front`);
if (VARIANTS[variant]) await page.addStyleTag({ content: VARIANTS[variant] });
await sleep(400);

await page.evaluate(() => {
  const probe = { frames: [], toggles: [], t0: performance.now() };
  window.__probe = probe;
  const loop = (t) => { probe.frames.push(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  const clips = [...document.querySelectorAll('.home-v7__clip')];
  clips.forEach((el, i) => {
    let was = el.classList.contains('home-v7__clip--moving');
    let wasNear = el.classList.contains('home-v7__clip--near');
    new MutationObserver(() => {
      const now = el.classList.contains('home-v7__clip--moving');
      const near = el.classList.contains('home-v7__clip--near');
      if (now !== was) { was = now; probe.toggles.push({ t: performance.now(), i, kind: now ? 'moving+' : 'moving-' }); }
      if (near !== wasNear) { wasNear = near; probe.toggles.push({ t: performance.now(), i, kind: near ? 'near+' : 'near-' }); }
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  });
});

const vp = page.viewportSize() ?? { width: 1440, height: 900 };
await page.mouse.move(vp.width / 2, vp.height / 2);
const phases = [];
async function wheel(label, notches, sign, gapMs) {
  const from = await page.evaluate(() => performance.now());
  for (let i = 0; i < notches; i++) { await page.mouse.wheel(0, sign * NOTCH); await sleep(gapMs); }
  await sleep(900);
  const to = await page.evaluate(() => performance.now());
  phases.push({ label, from, to });
}
await sleep(500);
await wheel('down-fast', 140, 1, 45);
await wheel('up-medium', 60, -1, 80);
await wheel('down-slow', 90, 1, 140);
await wheel('up-fast', 120, -1, 45);

const data = await page.evaluate(() => window.__probe);
await browser.close().catch(() => {});

const dts = [];
for (let i = 1; i < data.frames.length; i++) dts.push({ t: data.frames[i], dt: data.frames[i] - data.frames[i - 1] });
const sorted = dts.map((d) => d.dt).sort((a, b) => a - b);
const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const median = q(0.5);
const longFrames = dts.filter((d) => d.dt > Math.max(20, median * 1.8));
const WINDOW = 30;
const nearToggle = (t) => data.toggles.filter((g) => g.t <= t && g.t > t - d0(t) - WINDOW);
const d0 = (t) => dts.find((d) => d.t === t)?.dt ?? 0;
const longWithToggle = longFrames.filter((d) => nearToggle(d.t).length > 0);
const anyWithToggle = dts.filter((d) => nearToggle(d.t).length > 0);
const byKind = {};
for (const d of longWithToggle) for (const g of nearToggle(d.t)) byKind[g.kind] = (byKind[g.kind] ?? 0) + 1;
const perPhase = phases.map((p) => {
  const inP = dts.filter((d) => d.t >= p.from && d.t <= p.to);
  const lg = inP.filter((d) => d.dt > Math.max(20, median * 1.8));
  return { ...p, frames: inP.length, long: lg.length, worst: Math.max(0, ...inP.map((d) => d.dt)).toFixed(1) };
});
const summary = {
  frames: dts.length, medianMs: +median.toFixed(2), p95Ms: +q(0.95).toFixed(2), maxMs: +sorted[sorted.length - 1].toFixed(1),
  over20: dts.filter((d) => d.dt > 20).length, over33: dts.filter((d) => d.dt > 33).length,
  longFrames: longFrames.length, longWithToggleWithin30ms: longWithToggle.length,
  baselineFramesWithToggleWithin30ms: anyWithToggle.length, toggles: data.toggles.length, longByToggleKind: byKind,
  phases: perPhase,
  longList: longFrames.map((d) => ({ t: +(d.t - data.t0).toFixed(0), dt: +d.dt.toFixed(1), toggles: nearToggle(d.t).map((g) => `${g.kind}#${g.i}`) })),
};
writeFileSync(`reports/home-frame-probe-${variant}.json`, JSON.stringify({ summary, toggles: data.toggles, frames: data.frames }, null, 1));
results[variant] = summary;
console.log(`${variant.padEnd(9)} frames ${summary.frames} median ${summary.medianMs} p95 ${summary.p95Ms} max ${summary.maxMs} over20 ${summary.over20} over33 ${summary.over33} | phases long: ${summary.phases.map((p) => `${p.label} ${p.long}`).join(', ')}`);
}
