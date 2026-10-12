#!/usr/bin/env node
// The score for《一根线》. No cat voices in the cloud, so each cat gets a note
// and an instrument: wherever the ball lands, that cat "answers". The human's
// correction is a three-note motif that comes back, echoed, as memory.
//   node audio/synth.mjs output/score.wav
import {
  BALL1,
  BALL2,
  CATS,
  DURATION,
  FINALE,
  MEMORY_LINK,
  PAYOFF,
  PROMISE as P,
  THREAD1,
  THREAD2,
  WS,
  YOU_MIDI,
  tangleHops,
} from '../composition/js/timeline.mjs';
import { SR, hit, makeBus, mtof, pad, pluck, reverb, riser, roll, sweep, tone, writeWav } from './dsp.mjs';

const dry = makeBus(DURATION);
const send = makeBus(DURATION);
const pads = makeBus(DURATION);
const both = (fn, ...a) => {
  fn(dry, ...a);
  fn(send, ...a);
};

const TIMBRE = {
  xian: [[1, 1, 0.9], [3.99, 0.3, 0.25], [10, 0.08, 0.06]], // marimba
  shuo: [[1, 1, 2.2], [2.76, 0.45, 0.8], [5.4, 0.22, 0.35], [8.93, 0.1, 0.15]], // glockenspiel
  momo: [[1, 1, 2.4], [4, 0.18, 0.6]], // vibraphone
  you: [[1, 1, 2], [2, 0.5, 1.4], [3, 0.25, 0.9], [4, 0.12, 0.6], [5, 0.06, 0.4]], // soft piano
};
const PAN = { xian: -0.35, yan: -0.1, shuo: 0.3, momo: 0.45, you: 0.15 };

function voice(who, t, { amp = 0.34, up = 0 } = {}) {
  const midi = (who === 'you' ? YOU_MIDI : CATS[who].midi) + up;
  if (who === 'yan') {
    both(pluck, t, mtof(midi), { amp: amp * 0.7, pan: PAN.yan });
    both(tone, t, mtof(midi), { amp: amp * 0.4, partials: [[1, 1, 1.2]], pan: PAN.yan });
    return;
  }
  const trem = who === 'momo' ? 0.25 : 0;
  both(tone, t, mtof(midi), { amp, partials: TIMBRE[who], pan: PAN[who], trem });
}
const chime = (t, notes, amp = 0.16, gap = 0.09) =>
  notes.forEach((m, i) => both(tone, t + i * gap, mtof(m), { amp, partials: TIMBRE.shuo, pan: 0.2 }));

// S1 — the router: rising dissonance, frantic copy/paste clicks.
const winPan = [-0.6, 0.6, 0];
for (const hp of tangleHops()) {
  hit(dry, hp.t, { amp: 0.16, pan: winPan[hp.from] });
  hit(dry, hp.paste, { amp: 0.22, pan: winPan[hp.to] });
  sweep(dry, hp.paste, { f0: 2600, f1: 1800, dur: 0.02, amp: 0.05, pan: winPan[hp.to] });
}
pad(dry, 0.2, 9.0, [38, 45], { amp: 0.24, fade: 3, fadeOut: 0.04, cutoff: 400 });
pad(dry, 2.5, 9.0, [63, 64, 65, 70], { amp: 0.06, fade: 5, fadeOut: 0.04, cutoff: 1600 });
riser(dry, 6.0, 9.0, { amp: 0.1 });

// S2 — the promise: pop-ups, the knot becomes a ball, cats pass it themselves.
const blip = (t, m) => both(sweep, t, { f0: mtof(m) * 0.7, f1: mtof(m), dur: 0.09, amp: 0.08 });
blip(P.xianIn[0] + 0.15, 69);
blip(P.yanIn[0] + 0.15, 66);
blip(P.shuoIn[0] + 0.15, 76);
riser(dry, 9.45, 10.0, { amp: 0.06, f0: 600, f1: 5000 });
both(sweep, P.ballForm[0] + 0.05, { f0: 900, f1: 260, dur: 0.08, amp: 0.3 });
voice('xian', P.ballForm[0] + 0.05);
roll(dry, P.roll1[0], P.roll1[1], { pan0: -0.25, pan1: 0.3 });
voice('yan', P.yanCatch);
roll(dry, P.roll2[0], P.roll2[1], { pan0: 0.3, pan1: 0 });
voice('shuo', P.roll2[1]);
chime(P.brand[0] + 0.1, [74, 78, 81, 86], 0.13, 0.12);
roll(dry, P.fly[0], P.fly[1], { amp: 0.05, pan0: 0, pan1: 0.3 });
voice('you', P.fly[1], { amp: 0.26 });

// Thread: the ball's journey is the melody.
function typing(m) {
  if (!m.type) return;
  const n = Array.from(m.text).length;
  for (let i = 0; i < n; i++) hit(dry, m.type[0] + ((m.type[1] - m.type[0]) * i) / n, { amp: 0.07, dur: 0.008, pan: 0.3 });
}
[...THREAD1, ...THREAD2].forEach(typing);
const whoOf = (id) => [...THREAD1, ...THREAD2].find((m) => m.id === id).who;
const CORRECTION = BALL1.find((s) => s.to === 'm9').at[1];
for (const s of [...BALL1, ...BALL2]) {
  if (s.kind === 'pass') {
    roll(dry, s.at[0], s.at[1], { amp: 0.06, pan0: whoOf(s.from) === 'you' ? 0.4 : -0.3, pan1: whoOf(s.to) === 'you' ? 0.4 : -0.3 });
    if (s.at[1] !== CORRECTION) voice(whoOf(s.to), s.at[1]);
  } else if (s.kind === 'pop') {
    voice('you', s.at[0], { amp: 0.26 });
  } else {
    hit(dry, s.at[1], { amp: 0.05, color: 'lo' });
  }
}
chime(WS.tests1[1], [81, 86], 0.12);
both(sweep, WS.bugAt, { f0: 130, f1: 45, dur: 0.4, amp: 0.45 });
both(pluck, WS.bugAt + 0.02, mtof(47), { amp: 0.25, pan: -0.1 });
both(pluck, WS.bugAt + 0.05, mtof(48), { amp: 0.2, pan: 0.1 });
voice('xian', WS.fixAt, { amp: 0.3, up: 12 });
chime(WS.tests2[1], [81, 86], 0.12);
voice('yan', THREAD1[4].react.at, { amp: 0.35, up: 12 });
chime(WS.styled[0] + 0.2, [76, 78, 81], 0.09, 0.07);
// The correction: everything goes quiet, and the human's motif sounds alone.
const MOTIF = [0, 4, 7];
MOTIF.forEach((d, i) => voice('you', CORRECTION + i * 0.45, { amp: 0.2, up: d }));
riser(dry, WS.bigger[0], WS.bigger[1], { amp: 0.04, f0: 400, f1: 3000 });
chime(WS.bigger[1], [78, 81], 0.1);

// Payoff.
riser(dry, PAYOFF.lift[0], PAYOFF.lift[1], { amp: 0.05, f0: 300, f1: 2500 });
both(sweep, PAYOFF.tap, { f0: 700, f1: 300, dur: 0.07, amp: 0.25 });
[['you', 0], ['xian', 0], ['yan', 12], ['shuo', 0], ['you', 12]].forEach(([w, up], i) =>
  voice(w, PAYOFF.tap + 0.12 + i * 0.11, { amp: 0.3, up }),
);

// Night and morning, then memory: yesterday's motif returns, echoed.
both(tone, 62.05, mtof(50), { amp: 0.22, partials: [[1, 1, 2.5], [2, 0.3, 1.2]] });
chime(63.25, [74, 78, 81], 0.09, 0.1);
MOTIF.forEach((d, i) => {
  [0, 0.32, 0.64].forEach((e, j) => voice('you', MEMORY_LINK[0] + i * 0.3 + e, { amp: 0.22 * 0.45 ** j, up: d }));
});
voice('xian', 69.0);
chime(WS.adopt[0] + 0.1, [76, 78, 81], 0.08, 0.07);
chime(WS.adopt[1], [81, 86], 0.1);

// Finale: each cat answers as it joins; the family chord closes the film.
roll(dry, FINALE.ballCenter[0], FINALE.ballCenter[1], { amp: 0.06, pan0: -0.3, pan1: 0 });
for (const { who, at } of FINALE.pops) voice(who, at + 0.05);
voice('you', FINALE.tagline[0], { amp: 0.28 });
const end = FINALE.endcard[0];
['you', 'xian', 'shuo', 'momo'].forEach((w) => voice(w, end, { amp: 0.2 }));
voice('yan', end, { amp: 0.24, up: -12 });
chime(end + 0.6, [86, 90, 93], 0.08, 0.16);

// Harmony bed (D major): pads with crossfades; the correction ducks them.
const C = {
  D: [50, 57, 62, 64, 66], Bm: [47, 54, 57, 62, 66], G: [43, 50, 54, 59, 62], A: [45, 52, 57, 61, 64],
  As: [45, 52, 57, 62, 64], T: [47, 54, 59, 60, 64], GA: [45, 55, 59, 62], DD: [38, 50, 57, 62, 64, 66],
};
const plan = [[10.0, 'D', 1.2], [13.8, 'G'], [15.6, 'As']];
const loop = (t0, t1) => {
  for (let t = t0, i = 0; t < t1 - 0.01; t += 2.6, i++) plan.push([t, ['D', 'Bm', 'G', 'A'][i % 4]]);
};
loop(17.6, 33.0);
plan.push([33.0, 'T'], [35.3, 'GA']);
loop(37.7, 47.0);
plan.push([47.0, 'A'], [48.6, 'G'], [51.2, 'As'], [52.6, 'A'], [54.2, 'DD', 1.0, 1.25], [58.0, 'G'], [59.8, 'D']);
plan.push([62.0, 'Bm', 0.6, 0.5]);
loop(63.4, 72.6);
plan.push([72.6, 'G'], [75.2, 'D'], [79.0, 'DD', 1.0, 1.25]);
plan.forEach(([t0, c, fade = 0.6, gain = 1], i) => {
  const t1 = i + 1 < plan.length ? plan[i + 1][0] : DURATION;
  const last = i + 1 === plan.length;
  pad(pads, Math.max(0, t0 - 0.3), Math.min(DURATION, t1 + 0.3), C[c], { amp: 0.1 * gain, fade, fadeOut: last ? 4 : 0.6 });
});
const duck = (t) => {
  if (t < 46.9 || t > 51.4) return 1;
  if (t < 47.1) return 1 - 0.88 * ((t - 46.9) / 0.2);
  if (t < 48.6) return 0.12;
  return 0.12 + 0.88 * ((t - 48.6) / 2.8);
};
for (const [a, b] of [[17.6, 46.8], [51.2, 61.8], [63.4, 72.4]]) {
  for (let t = a; t < b; t += 0.65) sweep(dry, t, { f0: 110, f1: 42, dur: 0.2, amp: t > 63 ? 0.07 : 0.1 });
}

// Mix: dry + ducked pads + reverb, soft-clipped and normalised.
for (let i = 0; i < pads.n; i++) {
  const g = duck(i / SR);
  for (const ch of ['L', 'R']) {
    dry[ch][i] += pads[ch][i] * g;
    send[ch][i] += pads[ch][i] * g * 0.6;
  }
}
const wet = reverb(send);
let peak = 0;
for (const ch of ['L', 'R']) {
  for (let i = 0; i < dry.n; i++) {
    const fadeOut = Math.min(1, (DURATION - i / SR) / 1.2);
    dry[ch][i] = Math.tanh((dry[ch][i] + wet[ch][i] * 0.35) * 1.1) * fadeOut;
    peak = Math.max(peak, Math.abs(dry[ch][i]));
  }
}
for (const ch of ['L', 'R']) for (let i = 0; i < dry.n; i++) dry[ch][i] *= 0.89 / peak;
writeWav(process.argv[2] || 'score.wav', dry.L, dry.R);
console.log(`score → ${process.argv[2] || 'score.wav'} (${DURATION}s, peak ${peak.toFixed(2)})`);
