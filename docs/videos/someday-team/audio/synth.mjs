#!/usr/bin/env node
// Score for《以后再说 / Someday》: a real-instrument arrangement (arrange.mjs → MIDI → fluidsynth with
// the FluidR3_GM soundfont), plus a small set of on-screen sound effects, mixed and ducked a little
// under each hold line so the presenter can talk over it.
//   node audio/synth.mjs output/score.wav
// Needs fluidsynth and a GM soundfont: apt install fluidsynth fluid-soundfont-gm
// (or set SOMEDAY_SF2=/path/to/soundfont.sf2).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SR, hit, makeBus, reverb, riser, roll, sweep, writeWav } from '../../promo-kit/dsp.mjs';
import { BEFORE, CLOUD, DOING, DURATION, GROW, JUDGE, MANY, NOTES, RICE, STAGE, TURN, VERSIONS } from '../composition/js/timeline.mjs';
import { arrange } from './arrange.mjs';

const out = process.argv[2] || 'score.wav';
const SF2 = process.env.SOMEDAY_SF2 || '/usr/share/sounds/sf2/FluidR3_GM.sf2';

// ---------- music ----------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'someday-'));
const mid = path.join(tmp, 'score.mid');
const musicWav = path.join(tmp, 'music.wav');
fs.writeFileSync(mid, arrange());
execFileSync('fluidsynth', ['-ni', '-q', '-g', '0.55', '-r', String(SR), '-O', 's16', '-T', 'wav', '-F', musicWav,
  '-o', 'synth.reverb.room-size=0.62', '-o', 'synth.reverb.level=0.55', '-o', 'synth.chorus.level=0.6', SF2, mid], { stdio: 'inherit' });

function readWav(file) {
  const b = fs.readFileSync(file);
  let p = 12;
  let ch = 2;
  while (p < b.length) {
    const id = b.toString('ascii', p, p + 4);
    const len = b.readUInt32LE(p + 4);
    if (id === 'fmt ') ch = b.readUInt16LE(p + 10);
    if (id === 'data') {
      const n = Math.floor(len / (2 * ch));
      const L = new Float32Array(n);
      const R = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        L[i] = b.readInt16LE(p + 8 + i * 2 * ch) / 32768;
        R[i] = b.readInt16LE(p + 8 + i * 2 * ch + (ch > 1 ? 2 : 0)) / 32768;
      }
      return { L, R, n };
    }
    p += 8 + len + (len % 2);
  }
  throw new Error(`no data chunk in ${file}`);
}
const music = readWav(musicWav);
fs.rmSync(tmp, { recursive: true, force: true });

// ---------- sound effects: only what you see happen ----------
const dry = makeBus(DURATION);
const send = makeBus(DURATION);
const both = (fn, ...a) => {
  fn(dry, ...a);
  fn(send, ...a);
};
const paper = (t, amp = 0.16, pan = 0) => {
  hit(dry, t, { amp, dur: 0.03, color: 'lo', pan });
  hit(dry, t + 0.005, { amp: amp * 0.4, dur: 0.012, pan });
};
const click = (t, amp = 0.1) => hit(dry, t, { amp, dur: 0.01 });
const whoosh = (t, dur = 0.5, amp = 0.05) => both(sweep, t, { f0: 2400, f1: 500, dur, amp });
const pitter = (t0, t1, amp = 0.04) => {
  for (let t = t0, i = 0; t < t1; t += 0.11, i++) hit(dry, t, { amp: amp * (i % 2 ? 0.7 : 1), dur: 0.014, color: 'lo', pan: 0.25 });
};
const ticks = (t0, t1, amp = 0.025, step = 0.08, pan = 0.3) => {
  for (let t = t0; t < t1; t += step) hit(dry, t, { amp, dur: 0.005, pan });
};
const scratch = (t0, len, pan) => {
  for (let t = t0; t < t0 + len; t += 0.035) hit(dry, t, { amp: 0.016, dur: 0.012, pan });
};

// before
for (const n of NOTES) if (n.at < 8) paper(n.at, 0.12, -0.2 + (n.x / 1460) * 0.4);
const hero = NOTES.find((n) => n.id === 'hero');
const ar = NOTES.find((n) => n.id === 'ar');
for (const n of [hero, ar]) {
  whoosh(n.at, 0.8, 0.035);
  paper(n.at + 0.9, 0.16);
}
for (let i = 0; i < 6; i++) hit(dry, BEFORE.issues[0] + 1.2 + i * 0.55, { amp: 0.08, dur: 0.03, color: 'lo', pan: 0.4 });
// turn
pitter(TURN.trotIn[0], TURN.trotIn[1]);
whoosh(TURN.noteFall[0] + 0.1, 0.7, 0.05);
paper(TURN.noteFall[1], 0.2);
click(TURN.pen[1] - 0.1, 0.12);
roll(dry, TURN.tabletOn - 0.3, TURN.tabletOn + 0.6, { amp: 0.04, pan0: -0.1, pan1: 0.3 });
riser(dry, TURN.toWork[0], TURN.toWork[0] + 1.0, { amp: 0.035, f0: 500, f1: 5000 });
// ①
for (let i = 0; i < 7; i++) scratch(CLOUD.sketch[0] + (i * (CLOUD.sketch[1] - CLOUD.sketch[0] - 0.4)) / 7, 0.45, 0.35);
roll(dry, CLOUD.sketch[1] - 0.4, CLOUD.blob[0] + 0.4, { amp: 0.04, pan0: 0.4, pan1: -0.1 });
paper(CLOUD.v1Note[0], 0.1);
roll(dry, CLOUD.ballDown[0], CLOUD.ballDown[1], { amp: 0.05, pan0: 0.5, pan1: 0.4 });
click(CLOUD.allowClick, 0.13);
pitter(CLOUD.trot[0], CLOUD.trot[1]);
ticks(CLOUD.trot[1], CLOUD.carry[0] + 1.6, 0.02, 0.09, 0.4);
pitter(CLOUD.carry[0] + 1.6, CLOUD.carry[0] + 5.6, 0.03);
paper(CLOUD.drop, 0.1, 0.4);
roll(dry, CLOUD.ballUp[0], CLOUD.ballUp[1], { amp: 0.05, pan0: 0.4, pan1: -0.3 });
hit(dry, CLOUD.snap[0], { amp: 0.2, dur: 0.05, color: 'lo' });
for (const b of CLOUD.buttons) click(b - 0.2, 0.09);
click(CLOUD.runs + 0.25, 0.09);
// ②
for (const at of [MANY.yukPin, MANY.lesPin]) click(at - 0.05, 0.11);
for (const at of [MANY.yukAdopt, MANY.lesAdopt]) click(at, 0.12);
ticks(MANY.slider[0] + 0.3, MANY.slider[1], 0.025, 0.08, 0.2);
ticks(MANY.spacing[0] + 0.3, MANY.spacing[1], 0.025, 0.08, 0.3);
whoosh(MANY.spacing[0] + 0.3, 2.0, 0.03);
both(sweep, MANY.pull[0], { f0: 300, f1: 1200, dur: 1.2, amp: 0.04 });
whoosh(MANY.handoff[0], 0.9, 0.035);
click(MANY.handoff[1] + 0.5, 0.09);
// ③
roll(dry, JUDGE.ballToLeslie[0], JUDGE.ballToLeslie[1], { amp: 0.05, pan0: 0.5, pan1: 0.2 });
click(JUDGE.pick, 0.12);
// ④
for (const v of VERSIONS) hit(dry, v.at, { amp: 0.07, dur: 0.02, color: 'lo' });
both(sweep, VERSIONS[0].at + 0.3, { f0: 500, f1: 180, dur: 0.25, amp: 0.07 });
both(sweep, VERSIONS[0].at + 0.55, { f0: 180, f1: 420, dur: 0.2, amp: 0.06 });
for (let i = 0; i < 7; i++) scratch(GROW.freeze[0] + 1.4 + i * 0.23, 0.2, -0.2);
ticks(GROW.method[0] + 0.1, GROW.method[1], 0.03, 0.07, 0.3);
both(sweep, GROW.strike, { f0: 900, f1: 120, dur: 0.3, amp: 0.1 });
hit(dry, GROW.strike + 0.28, { amp: 0.14, dur: 0.05, color: 'lo' });
roll(dry, GROW.ballToYukina[0], GROW.ballToYukina[1], { amp: 0.05, pan0: -0.2, pan1: 0.3 });
whoosh(GROW.toWall[0], 1.0, 0.04);
paper(RICE.at + 0.2, 0.18, 0.4);
hit(dry, GROW.rice[0] + 0.4, { amp: 0.16, dur: 0.05, color: 'lo', pan: 0.4 });
// 登场
whoosh(STAGE.heroMove[0], 1.2, 0.04);
DOING.forEach((_, i) => hit(dry, STAGE.doing[0] + i * STAGE.doing[1], { amp: 0.1, dur: 0.03, color: 'lo', pan: -0.3 }));
paper(STAGE.blank, 0.22);

// ---------- mix ----------
const wet = reverb(send);
// a little room under each hold line so the presenter can talk; ③'s hush is in the arrangement
const holds = [BEFORE.wallLine, CLOUD.hold, MANY.hold, JUDGE.hold, GROW.hold];
const duck = (t) => {
  let g = 1;
  for (const [a, b] of holds) {
    const k = Math.min(1, Math.max(0, (t - a - 0.3) / 0.6), Math.max(0, (b + 0.2 - t) / 0.4));
    g = Math.min(g, 1 - 0.3 * k);
  }
  return g;
};
const mix = { L: new Float32Array(dry.n), R: new Float32Array(dry.n) };
// clear the sub-rumble below ~35 Hz that room speakers can't play anyway (one-pole high-pass)
const hpA = Math.exp((-2 * Math.PI * 35) / SR);
const hp = { L: [0, 0], R: [0, 0] };
let peak = 0;
for (let i = 0; i < dry.n; i++) {
  const t = i / SR;
  const g = duck(t) * 1.25;
  const fade = Math.min(1, (DURATION - t) / 2.5, t / 0.05);
  for (const ch of ['L', 'R']) {
    const x = i < music.n ? music[ch][i] : 0;
    const m = hpA * (hp[ch][1] + x - hp[ch][0]);
    hp[ch][0] = x;
    hp[ch][1] = m;
    const v = (m * g + (dry[ch][i] + wet[ch][i] * 0.3) * 0.9) * fade;
    mix[ch][i] = Math.tanh(v * 1.15) / 1.15;
    peak = Math.max(peak, Math.abs(mix[ch][i]));
  }
}
for (const ch of ['L', 'R']) for (let i = 0; i < dry.n; i++) mix[ch][i] *= 0.89 / peak;
writeWav(out, mix.L, mix.R);
console.log(`score → ${out} (${DURATION}s, peak ${peak.toFixed(2)})`);
