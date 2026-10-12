#!/usr/bin/env node
// Score for《我在这里 / Right Here》(G major, lo-fi evening). No real voices:
// the cat "speaks" in soft plucks per character, the human in low hums, so you
// can hear a conversation without a faked voice. The tutorial video keeps
// playing underneath, muffled whenever something covers it.
//   node audio/synth.mjs output/score.wav
import { SR, hit, makeBus, mtof, pad, pluck, reverb, riser, roll, sweep, tone, writeWav } from '../../promo-kit/dsp.mjs';
import { CLICKS, PRESSES } from '../composition/js/cursor.mjs';
import { BUBBLES, DURATION, NEXT, PAIN, PET, SPEECH, TODAY } from '../composition/js/timeline.mjs';

const dry = makeBus(DURATION);
const send = makeBus(DURATION);
const pads = makeBus(DURATION);
const vid = makeBus(DURATION);
const both = (fn, ...a) => {
  fn(dry, ...a);
  fn(send, ...a);
};
const GLOCK = [[1, 1, 2.2], [2.76, 0.45, 0.8], [5.4, 0.22, 0.35], [8.93, 0.1, 0.15]];
const chime = (t, notes, amp = 0.12, gap = 0.09) => notes.forEach((m, i) => both(tone, t + i * gap, mtof(m), { amp, partials: GLOCK, pan: 0.25 }));
const blip = (t, m, up = true) => both(sweep, t, { f0: mtof(m) * (up ? 0.7 : 1.2), f1: mtof(m), dur: 0.09, amp: 0.08 });
const PENTA = [67, 69, 71, 74, 76];
const HUM = [55, 57, 59, 62, 64];

function catTalk(text, t0, t1) {
  const chars = Array.from(text);
  chars.forEach((c, i) => {
    if ('，。、「」？——……· '.includes(c)) return;
    const m = PENTA[(c.codePointAt(0) * 7 + i * 3) % 5];
    both(pluck, t0 + ((t1 - t0) * i) / chars.length, mtof(m), { amp: 0.07, pan: 0.35, decay: 0.986, length: 0.4 });
  });
}
function humanTalk(text, t0, t1) {
  const chars = Array.from(text);
  chars.forEach((c, i) => {
    if ('，。？ '.includes(c)) return;
    const m = HUM[(c.codePointAt(0) * 5 + i) % 5];
    both(tone, t0 + ((t1 - t0) * i) / chars.length, mtof(m), { amp: 0.06, partials: [[1, 1, 0.07], [2, 0.4, 0.05], [3, 0.15, 0.03]], pan: -0.15 });
  });
}
const typing = (t0, t1, n, amp = 0.06) => {
  for (let i = 0; i < n; i++) hit(dry, t0 + ((t1 - t0) * i) / n, { amp, dur: 0.008, pan: -0.2 });
};

// The tutorial's own background music (muffled later by automation).
for (let t = 0, i = 0; t < 64; t += 0.4, i++) {
  const chord = Math.floor(t / 1.6) % 2 ? [64, 67, 71, 74] : [67, 71, 74, 78];
  pluck(vid, t, mtof(chord[i % 4]), { amp: 0.16, pan: -0.25, decay: 0.993, length: 1.2 });
  if (i % 4 === 0) tone(vid, t, mtof(chord[0] - 24), { amp: 0.08, partials: [[1, 1, 0.5]], pan: -0.25 });
}

// S1 — the chore.
for (const t of CLICKS) hit(dry, t, { amp: 0.14, dur: 0.01 });
for (const t of PRESSES) hit(dry, t, { amp: 0.1, dur: 0.012, color: 'lo' });
hit(dry, PAIN.flash, { amp: 0.3, dur: 0.05 });
both(sweep, PAIN.flash + 0.04, { f0: 1800, f1: 900, dur: 0.06, amp: 0.08 });
typing(PAIN.type[0], PAIN.type[1], Array.from(PAIN.text).length / 2, 0.08);
pad(dry, 5.0, 11.4, [78, 79], { amp: 0.05, fade: 5, fadeOut: 0.05, cutoff: 3000 });
riser(dry, 8.4, 11.3, { amp: 0.05, f0: 400, f1: 3000 });
both(sweep, PAIN.missed[0], { f0: 140, f1: 60, dur: 0.35, amp: 0.25 });

// S2 — the cat walks out of the window.
blip(PET[0][0] + 0.1, 74);
both(sweep, 12.4, { f0: 300, f1: 900, dur: 0.25, amp: 0.1 });
hit(dry, 13.1, { amp: 0.2, dur: 0.06, color: 'lo' });
both(pluck, 13.12, mtof(55), { amp: 0.2, pan: 0.3 });
for (const b of BUBBLES) catTalk(b.text, b.at[0] + 0.15, b.at[0] + 0.15 + Array.from(b.text).length / 14);
chime(17.9, [79, 83, 86], 0.11, 0.12);

// S3 — today.
blip(TODAY.drag[0], 71);
blip(TODAY.drag[1], 67, false);
both(sweep, TODAY.dockOpen, { f0: 500, f1: 800, dur: 0.07, amp: 0.1 });
chime(TODAY.connect + 0.45, [74, 79], 0.1, 0.12);
for (const s of SPEECH) humanTalk(s.text, s.at[0] + 0.1, s.at[1]);
riser(dry, TODAY.lookup[0], TODAY.lookup[0] + 0.5, { amp: 0.04, f0: 2000, f1: 6000 });
for (let t = TODAY.lookup[0] + 0.5; t < TODAY.lookup[1] - 0.4; t += 0.17) hit(dry, t, { amp: 0.035, dur: 0.006, pan: -0.3 });
chime(TODAY.lookup[1] - 0.35, [83, 86], 0.1);
both(sweep, TODAY.history[0], { f0: 500, f1: 800, dur: 0.07, amp: 0.08 });
typing(TODAY.historyType[0], TODAY.historyType[1], 12);
blip(TODAY.historyType[1] + 0.2, 79);

// S4 — next (in development): airy, glassier.
riser(dry, NEXT.wash[0], NEXT.wash[0] + 1.0, { amp: 0.05, f0: 1500, f1: 7000 });
chime(NEXT.intro[0] + 0.2, [86, 88, 91], 0.07, 0.1);
both(sweep, NEXT.pick[0], { f0: 500, f1: 800, dur: 0.07, amp: 0.08 });
chime(NEXT.frame[0], [71, 76], 0.1, 0.14);
both(tone, NEXT.pointAt, mtof(88), { amp: 0.12, partials: GLOCK, pan: -0.3 });
both(pluck, NEXT.pointBack, mtof(55), { amp: 0.22, pan: 0.3 });
both(tone, NEXT.pointBack + 0.05, mtof(79), { amp: 0.1, partials: GLOCK, pan: 0.3 });
riser(dry, NEXT.switchApp[0], NEXT.switchApp[1], { amp: 0.06, f0: 300, f1: 2500 });
roll(dry, NEXT.switchApp[0], NEXT.switchApp[1], { amp: 0.05, pan0: 0.4, pan1: -0.1 });
for (let t = 52.6; t < 53.6; t += 0.12) hit(dry, t, { amp: 0.05, dur: 0.02, color: 'lo', pan: 0.3 });
for (let t = NEXT.slider[0]; t < NEXT.slider[1]; t += 0.09) hit(dry, t, { amp: 0.03, dur: 0.005, pan: 0.2 });
both(sweep, NEXT.stale, { f0: 200, f1: 70, dur: 0.3, amp: 0.2 });
both(tone, NEXT.newMark, mtof(83), { amp: 0.1, partials: GLOCK, pan: -0.1 });
chime(NEXT.pause, [76, 71], 0.09, 0.16);

// S5 — home: the cat comes to sit beside you; its theme, then the family chord.
for (let t = 66.2; t < 67.6; t += 0.12) hit(dry, t, { amp: 0.045, dur: 0.02, color: 'lo', pan: 0.2 });
[[67.2, 67], [67.55, 71], [67.9, 74], [68.5, 72], [68.85, 71], [69.3, 67]].forEach(([t, m]) =>
  both(pluck, t, mtof(m), { amp: 0.16, pan: 0.25, decay: 0.995, length: 2.4 }),
);
chime(71.6, [79, 83, 86, 91], 0.09, 0.14);
chime(75.7, [91, 95], 0.07, 0.12);

// Harmony: G – Em – C – D, slower in "next", a held Am while it thinks.
const C = {
  G: [43, 55, 59, 62, 66], Em: [40, 52, 55, 59, 62], C: [48, 52, 55, 59, 64], D: [50, 54, 57, 62, 66],
  Am: [45, 52, 55, 60, 64], Ds: [50, 55, 57, 62, 64], G9: [43, 55, 59, 62, 69],
};
const plan = [];
const loop = (t0, t1, seq, len) => {
  for (let t = t0, i = 0; t < t1 - 0.01; t += len, i++) plan.push([t, seq[i % seq.length]]);
};
loop(15.8, 40.0, ['G', 'Em', 'C', 'D'], 3.2);
loop(40.0, 57.4, ['Em', 'C', 'G', 'D'], 3.2);
plan.push([57.4, 'Am'], [60.3, 'Ds'], [61.6, 'D'], [63.2, 'C'], [66.2, 'G9'], [71.4, 'C'], [73.0, 'G9']);
plan.forEach(([t0, c], i) => {
  const t1 = i + 1 < plan.length ? plan[i + 1][0] : DURATION;
  const last = i + 1 === plan.length;
  pad(pads, Math.max(0, t0 - 0.3), Math.min(DURATION, t1 + 0.3), C[c], { amp: 0.06, fade: i ? 0.6 : 1.5, fadeOut: last ? 4 : 0.6 });
});
const padGain = (t) => {
  if (t >= NEXT.pause && t < NEXT.pause + 1.4) return 0.2 + 0.8 * Math.max(0, (t - NEXT.pause - 0.6) / 0.8);
  if (t >= NEXT.think[0] && t < NEXT.think[1]) return 0.75 + 0.25 * Math.sin(2 * Math.PI * 2.2 * t);
  return 1;
};
// The video is muffled when covered, quieter once the companion is there, gone after the app switch.
const vidGain = (t) => {
  if (t < PAIN.chatIn[0]) return 1;
  if (t < 11.4) return 0.7;
  if (t < NEXT.switchApp[0]) return 0.32;
  return Math.max(0, 0.32 * (1 - (t - NEXT.switchApp[0]) / 1.5));
};
const vidCut = (t) => (t >= PAIN.chatIn[0] && t < 11.4 ? 900 : 2600);
let lpL = 0;
let lpR = 0;
for (let i = 0; i < dry.n; i++) {
  const t = i / SR;
  const g = 1 - Math.exp((-2 * Math.PI * vidCut(t)) / SR);
  lpL += g * (vid.L[i] - lpL);
  lpR += g * (vid.R[i] - lpR);
  const vg = vidGain(t);
  const pg = padGain(t);
  dry.L[i] += lpL * vg + pads.L[i] * pg;
  dry.R[i] += lpR * vg + pads.R[i] * pg;
  send.L[i] += pads.L[i] * pg * 0.6 + lpL * vg * 0.2;
  send.R[i] += pads.R[i] * pg * 0.6 + lpR * vg * 0.2;
}

const wet = reverb(send);
let peak = 0;
for (const ch of ['L', 'R']) {
  for (let i = 0; i < dry.n; i++) {
    const fadeOut = Math.min(1, (DURATION - i / SR) / 1.5);
    dry[ch][i] = Math.tanh((dry[ch][i] + wet[ch][i] * 0.35) * 1.1) * fadeOut;
    peak = Math.max(peak, Math.abs(dry[ch][i]));
  }
}
for (const ch of ['L', 'R']) for (let i = 0; i < dry.n; i++) dry[ch][i] *= 0.89 / peak;
writeWav(process.argv[2] || 'score.wav', dry.L, dry.R);
console.log(`score → ${process.argv[2] || 'score.wav'} (${DURATION}s, peak ${peak.toFixed(2)})`);
