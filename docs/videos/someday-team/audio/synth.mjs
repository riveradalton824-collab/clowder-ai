#!/usr/bin/env node
// Score for《以后再说 / Someday》. No voices: people "speak" in soft hums (each a little
// higher or lower), the cats in their own instruments — 宪宪 marimba (as in《一根线》),
// 烁烁 glockenspiel, 砚砚 a low wooden tone. D minor while ideas wait on the wall; D major
// once the team starts; a hush when a person decides; a resolve when everyone is on stage.
//   node audio/synth.mjs output/score.wav
import { SR, hit, makeBus, mtof, pad, pluck, reverb, riser, roll, sweep, tone, writeWav } from '../../promo-kit/dsp.mjs';
import { BEFORE, CLOUD, DOING, DURATION, GROW, JUDGE, MANY, NOTES, RICE, STAGE, TURN, VERSIONS } from '../composition/js/timeline.mjs';

const dry = makeBus(DURATION);
const send = makeBus(DURATION);
const pads = makeBus(DURATION);
const both = (fn, ...a) => {
  fn(dry, ...a);
  fn(send, ...a);
};
const GLOCK = [[1, 1, 2.2], [2.76, 0.45, 0.8], [5.4, 0.22, 0.35], [8.93, 0.1, 0.15]];
const MARIMBA = [[1, 1, 0.9], [3.99, 0.3, 0.25], [10, 0.08, 0.06]];
const SPEECH = { xian: [[1, 1, 0.16], [3.99, 0.3, 0.06], [10, 0.08, 0.02]], shuo: [[1, 1, 0.22], [2.76, 0.4, 0.1]], yan: [[1, 1, 0.2], [2, 0.5, 0.12], [3, 0.2, 0.06]] };
const VOICE = { xian: [[69, 71, 74, 76, 78], 0.09, 0.35], shuo: [[81, 83, 86, 88, 90], 0.06, 0.4], yan: [[50, 52, 54, 57, 59], 0.11, 0.25] };
const HUM = { leslie: [60, 62, 64, 67, 69], yukina: [62, 64, 66, 69, 71], mindfn: [55, 57, 59, 62, 64], whut: [50, 52, 55, 57, 59], zlz: [57, 59, 62, 64, 66] };
const SKIP = '，。、「」？！——……· ：✓';
const chime = (t, notes, amp = 0.11, gap = 0.1) => notes.forEach((m, i) => both(tone, t + i * gap, mtof(m), { amp, partials: GLOCK, pan: 0.2 }));
const blip = (t, m, up = true, amp = 0.08) => both(sweep, t, { f0: mtof(m) * (up ? 0.7 : 1.2), f1: mtof(m), dur: 0.09, amp });
const paper = (t, amp = 0.16, pan = 0) => {
  hit(dry, t, { amp, dur: 0.03, color: 'lo', pan });
  hit(dry, t + 0.005, { amp: amp * 0.4, dur: 0.012, pan });
};
const whoosh = (t, dur = 0.5, amp = 0.05) => both(sweep, t, { f0: 2400, f1: 500, dur, amp });
const pitter = (t0, t1, amp = 0.05) => {
  for (let t = t0, i = 0; t < t1; t += 0.11, i++) hit(dry, t, { amp: amp * (i % 2 ? 0.7 : 1), dur: 0.014, color: 'lo', pan: 0.25 });
};
function cat(who, text, t0, rate = 13) {
  const [scale, amp, pan] = VOICE[who];
  Array.from(text).forEach((c, i) => {
    if (SKIP.includes(c)) return;
    both(tone, t0 + i / rate, mtof(scale[(c.codePointAt(0) * 7 + i * 3) % 5]), { amp, partials: SPEECH[who], pan });
  });
}
function human(who, text, t0, rate = 12) {
  Array.from(text).forEach((c, i) => {
    if (SKIP.includes(c) || c === ' ') return;
    const m = HUM[who][(c.codePointAt(0) * 5 + i) % 5];
    both(tone, t0 + i / rate, mtof(m), { amp: 0.055, partials: [[1, 1, 0.08], [2, 0.4, 0.05], [3, 0.15, 0.03]], pan: -0.15 });
  });
}
const xianTheme = (t0, amp = 0.17) => [[0, 62], [0.3, 66], [0.6, 69], [1.1, 71], [1.4, 69], [1.85, 74]].forEach(([d, m]) => both(tone, t0 + d, mtof(m), { amp, partials: MARIMBA, pan: 0.25 }));

// ---------- before: the wall (D minor, sparse) ----------
for (const n of NOTES) if (n.at < 8) paper(n.at, 0.14, -0.2 + (n.x / 1460) * 0.4);
for (const l of BEFORE.meetingLines) human(l.who, l.text, l.at, Array.from(l.text).length / 1.1);
// the whole room, softly together: nobody in particular
for (const who of ['leslie', 'yukina', 'mindfn', 'whut']) human(who, BEFORE.shelve.text, BEFORE.shelve.at + 0.02, 8);
[0.1, 0.25, 0.4].forEach((d) => hit(dry, BEFORE.shelve.at + 0.9 + d, { amp: 0.05, dur: 0.02, color: 'lo', pan: 0.4 }));
const hero = NOTES.find((n) => n.id === 'hero');
const ar = NOTES.find((n) => n.id === 'ar');
whoosh(hero.at, 0.8);
paper(hero.at + 0.9, 0.18);
for (let i = 0; i < 6; i++) {
  const t = BEFORE.issues[0] + 0.9 + i * 0.55 + 0.3;
  hit(dry, t, { amp: 0.1, dur: 0.03, color: 'lo', pan: 0.4 });
  both(sweep, t - 0.05, { f0: 900, f1: 700, dur: 0.06, amp: 0.03 });
}
whoosh(ar.at, 0.8);
paper(ar.at + 0.9, 0.18);
[[0.9, 74], [3.9, 72], [6.6, 69], [9.6, 70], [12.8, 69], [15.6, 65], [18.4, 67], [21.0, 64]].forEach(([t, m]) => pluck(dry, t, mtof(m), { amp: 0.09, pan: 0.15, decay: 0.997, length: 3 }));

// ---------- turn: a cat pounces ----------
pitter(TURN.trotIn[0], TURN.trotIn[1]);
riser(dry, TURN.pounce[0] + 1.6, TURN.noteFall[0], { amp: 0.05, f0: 200, f1: 1600 });
both(sweep, TURN.noteFall[0] - 0.1, { f0: 300, f1: 1100, dur: 0.25, amp: 0.1 });
whoosh(TURN.noteFall[0] + 0.1, 0.7, 0.06);
paper(TURN.noteFall[1], 0.22);
hit(dry, TURN.pounce[0] + 5.7, { amp: 0.16, dur: 0.06, color: 'lo' });
hit(dry, TURN.pen[1] - 0.1, { amp: 0.14, dur: 0.02 });
human('yukina', '这个，我来打稿。', TURN.yukLine[0] + 0.1);
cat('xian', '我帮你捏。', TURN.catLine[0] + 0.15, 10);
chime(TURN.tabletOn, [74, 78, 81], 0.1, 0.11);
roll(dry, TURN.tabletOn - 0.3, TURN.tabletOn + 0.6, { amp: 0.05, pan0: -0.1, pan1: 0.3 });
riser(dry, TURN.toWork[0], TURN.toWork[0] + 1.0, { amp: 0.06, f0: 500, f1: 5000 });
chime(TURN.toWork[1], [86, 90, 93], 0.07, 0.08);

// ---------- ① cloud ↔ Ajie's computer ----------
// Yukina's pen on the tablet: soft scratchy strokes
for (let i = 0; i < 7; i++) {
  const t0 = CLOUD.sketch[0] + (i * (CLOUD.sketch[1] - CLOUD.sketch[0] - 0.4)) / 7;
  for (let t = t0; t < t0 + 0.45; t += 0.035) hit(dry, t, { amp: 0.018, dur: 0.012, pan: 0.35 });
}
roll(dry, CLOUD.sketch[1] - 0.4, CLOUD.blob[0] + 0.4, { amp: 0.05, pan0: 0.4, pan1: -0.1 });
for (let t = CLOUD.blob[0] + 0.3; t < CLOUD.blob[1]; t += 0.55) both(sweep, t, { f0: 120, f1: 220, dur: 0.18, amp: 0.05 });
paper(CLOUD.v1Note[0], 0.12);
roll(dry, CLOUD.ballDown[0], CLOUD.ballDown[1], { amp: 0.06, pan0: 0.5, pan1: 0.4 });
blip(CLOUD.catIn + 0.1, 74);
chime(CLOUD.allowBar[0] + 0.1, [76, 81], 0.08, 0.12);
hit(dry, CLOUD.allowClick, { amp: 0.14, dur: 0.01 });
chime(CLOUD.allowClick + 0.05, [81, 85, 88], 0.09, 0.07);
pitter(CLOUD.trot[0], CLOUD.trot[1]);
for (let t = CLOUD.trot[1]; t < CLOUD.carry[0] + 1.6; t += 0.09) hit(dry, t, { amp: 0.03, dur: 0.005, pan: 0.4 });
pitter(CLOUD.carry[0] + 1.6, CLOUD.carry[0] + 5.6, 0.035);
paper(CLOUD.drop, 0.12, 0.4);
roll(dry, CLOUD.ballUp[0], CLOUD.ballUp[1], { amp: 0.06, pan0: 0.4, pan1: -0.3 });
hit(dry, CLOUD.snap[0], { amp: 0.25, dur: 0.05, color: 'lo' });
chime(CLOUD.snap[0] + 0.05, [74, 78, 81, 86], 0.1, 0.06);
// Mindfn drags three buttons in; 宪宪 wires them; it runs
CLOUD.buttons.forEach((b, i) => {
  hit(dry, b - 0.2, { amp: 0.1, dur: 0.01 });
  both(tone, b + 0.4, mtof([79, 83, 86][i]), { amp: 0.08, partials: GLOCK, pan: 0.3 });
});
for (let i = 0; i < 3; i++) both(sweep, CLOUD.wire + i * 0.15, { f0: 600, f1: 1400, dur: 0.3, amp: 0.03 });
chime(CLOUD.runs, [86, 88, 90, 93], 0.08, 0.08);
hit(dry, CLOUD.runs + 0.25, { amp: 0.1, dur: 0.01 });
both(sweep, CLOUD.runs + 0.4, { f0: 400, f1: 900, dur: 1.1, amp: 0.035 });
both(sweep, CLOUD.runs + 1.5, { f0: 900, f1: 400, dur: 1.1, amp: 0.035 });
human('mindfn', '原型能跑了，你们转转看。', CLOUD.runs + 0.6);

// ---------- ② two people, one model ----------
for (const at of [MANY.yukPin, MANY.lesPin]) {
  hit(dry, at - 0.05, { amp: 0.12, dur: 0.01 });
  blip(at + 0.05, 83);
}
human('yukina', '颜色和圆角要像我们家的。', MANY.yukPin + 0.2);
roll(dry, MANY.shuoReply - 0.6, MANY.shuoReply, { amp: 0.04, pan0: -0.2, pan1: 0.4 });
cat('shuo', '品牌色换好了。圆角给你个滑杆，你来定。', MANY.shuoReply + 0.1);
human('leslie', '拆开时把滤芯标出来，用户最常问。', MANY.lesPin + 0.2);
roll(dry, MANY.xianReply - 0.6, MANY.xianReply, { amp: 0.04, pan0: -0.2, pan1: 0.4 });
cat('xian', '加了拆解动画，滤芯会亮。', MANY.xianReply + 0.1);
cat('yan', '审过：零件编号和尺寸对得上', MANY.review + 0.1);
for (const at of [MANY.yukAdopt, MANY.lesAdopt]) {
  hit(dry, at, { amp: 0.14, dur: 0.01 });
  chime(at + 0.05, [78, 81, 86], 0.09, 0.08);
}
both(sweep, MANY.brand[0], { f0: 300, f1: 700, dur: 0.8, amp: 0.04 });
for (let t = MANY.slider[0] + 0.3; t < MANY.slider[1]; t += 0.08) hit(dry, t, { amp: 0.03, dur: 0.005, pan: 0.2 });
both(sweep, (MANY.slider[0] + MANY.slider[1]) / 2, { f0: 200, f1: 420, dur: 0.12, amp: 0.08 });
for (let t = MANY.spacing[0] + 0.3; t < MANY.spacing[1]; t += 0.08) hit(dry, t, { amp: 0.03, dur: 0.005, pan: 0.3 });
whoosh(MANY.spacing[0] + 0.3, 2.0, 0.045);
// Leslie spins v2, pulls the filter out, hands the phone on
both(sweep, MANY.phone[0] + 0.6, { f0: 400, f1: 900, dur: 0.9, amp: 0.03 });
both(sweep, MANY.phone[0] + 1.5, { f0: 900, f1: 400, dur: 0.9, amp: 0.03 });
both(sweep, MANY.pull[0], { f0: 300, f1: 1200, dur: 1.2, amp: 0.05 });
chime(MANY.pull[1] - 0.1, [86, 90], 0.08, 0.1);
human('leslie', '你也拆一次。', MANY.pull[1] + 0.3, 9);
whoosh(MANY.handoff[0], 0.9, 0.04);
hit(dry, MANY.handoff[1] + 0.5, { amp: 0.1, dur: 0.01 });
riser(dry, MANY.glow[0], MANY.glow[1], { amp: 0.04, f0: 2000, f1: 6000 });
chime(MANY.glow[0] + 0.3, [90, 93], 0.07, 0.12);
chime(MANY.v2, [74, 78, 81, 86, 90], 0.1, 0.07);

// ---------- ③ the call is a person's ----------
chime(JUDGE.card[0] + 0.2, [71, 74], 0.07, 0.15);
roll(dry, JUDGE.ballToLeslie[0], JUDGE.ballToLeslie[1], { amp: 0.06, pan0: 0.5, pan1: 0.2 });
hit(dry, JUDGE.pick, { amp: 0.14, dur: 0.01 });
both(tone, JUDGE.pick + 0.05, mtof(50), { amp: 0.14, partials: MARIMBA, pan: 0 });
chime(JUDGE.pick + 0.3, [74, 78, 83], 0.08, 0.12);
human('leslie', '用户要的是自己能换的那三样；核心结构拆给他们看，只会多出一堆电话。', JUDGE.reason[0] + 0.2, 11);
both(sweep, JUDGE.hideCore[0], { f0: 700, f1: 250, dur: 1.4, amp: 0.035 });

// ---------- ④ practice, a new method, a nod ----------
VERSIONS.forEach((v, i) => {
  hit(dry, v.at, { amp: 0.1, dur: 0.02, color: 'lo' });
  both(tone, v.at + 0.02, mtof(66 + Math.round((v.score - 38) / 4)), { amp: 0.08, partials: MARIMBA, pan: 0.2 + 0.05 * i });
});
both(sweep, VERSIONS[0].at + 0.3, { f0: 500, f1: 180, dur: 0.25, amp: 0.1 });
both(sweep, VERSIONS[0].at + 0.55, { f0: 180, f1: 420, dur: 0.2, amp: 0.08 });
both(sweep, GROW.freeze[0], { f0: 600, f1: 90, dur: 0.6, amp: 0.1 });
for (let i = 0; i < 7; i++) for (let t = GROW.freeze[0] + 0.4 + i * 0.23; t < GROW.freeze[0] + 0.6 + i * 0.23; t += 0.035) hit(dry, t, { amp: 0.016, dur: 0.012, pan: -0.2 });
for (let t = GROW.method[0] + 0.1; t < GROW.method[1]; t += 0.07) hit(dry, t, { amp: 0.035, dur: 0.006, pan: 0.3 });
riser(dry, GROW.montage2[0] - 0.3, GROW.montage2[0] + 0.2, { amp: 0.05, f0: 300, f1: 2400 });
chime(GROW.compare[0] + 0.6, [76], 0.08);
chime(GROW.compare[0] + 1.0, [79], 0.08);
both(sweep, GROW.strike, { f0: 900, f1: 120, dur: 0.3, amp: 0.12 });
hit(dry, GROW.strike + 0.28, { amp: 0.16, dur: 0.05, color: 'lo' });
roll(dry, GROW.ballToYukina[0], GROW.ballToYukina[1], { amp: 0.06, pan0: -0.2, pan1: 0.3 });
both(tone, GROW.adopt, mtof(50), { amp: 0.14, partials: MARIMBA });
chime(GROW.adopt + 0.15, [74, 78, 81, 86], 0.09, 0.09);
whoosh(GROW.toWall[0], 1.0, 0.06);
paper(RICE.at + 0.2, 0.2, 0.4);
hit(dry, GROW.rice[0] + 0.4, { amp: 0.2, dur: 0.05, color: 'lo', pan: 0.4 });
[1.4, 2.3].forEach((d) => blip(GROW.rice[0] + d, 81));
chime(GROW.rice[0] + 3.2, [78, 83], 0.08, 0.1);

// ---------- 登场: the wall clears ----------
whoosh(STAGE.heroMove[0], 1.2, 0.06);
[74, 78, 81, 86].forEach((m, i) => both(tone, STAGE.firsts[0] + i * STAGE.firsts[1], mtof(m), { amp: 0.16, partials: MARIMBA, pan: 0.3 }));
DOING.forEach((d, i) => {
  const t = STAGE.doing[0] + i * STAGE.doing[1];
  hit(dry, t, { amp: 0.12, dur: 0.03, color: 'lo', pan: -0.3 });
  chime(t + 0.35, i ? [83, 86] : [81, 85], 0.07, 0.1);
  if (!i) for (let k = 0; k < 5; k++) pluck(dry, t + 0.5 + k * 0.32, mtof([86, 88, 90, 93, 95][k]), { amp: 0.05, pan: -0.3, decay: 0.995, length: 1 });
});
paper(STAGE.blank, 0.24);
xianTheme(STAGE.cat + 0.2);
chime(STAGE.endcard[0] + 0.3, [86, 90, 93, 98], 0.08, 0.14);

// ---------- harmony ----------
const C = {
  Dm: [38, 50, 53, 57, 62], Bb: [34, 46, 50, 53, 58], F: [41, 53, 57, 60, 65], Cmaj: [36, 48, 52, 55, 60],
  Asus: [45, 57, 62, 64, 69], D: [38, 50, 54, 57, 62], Bm: [35, 47, 50, 54, 59], G: [43, 55, 59, 62, 67],
  A: [45, 57, 61, 64, 69], Em: [40, 52, 55, 59, 64], D9: [38, 50, 54, 57, 64, 66],
};
const plan = [];
const loop = (t0, t1, seq, len) => {
  for (let t = t0, i = 0; t < t1 - 0.01; t += len, i++) plan.push([t, seq[i % seq.length]]);
};
loop(0, 24, ['Dm', 'Bb', 'F', 'Cmaj'], 6);
plan.push([24, 'Asus'], [TURN.noteFall[0], 'D']);
loop(34, 98, ['D', 'Bm', 'G', 'A'], 3.2);
loop(98, 120, ['Bm', 'G', 'Em', 'A'], 5.5);
loop(120, GROW.freeze[0], ['D', 'A', 'Bm', 'G'], 1.6);
plan.push([GROW.freeze[0], 'Em']);
loop(GROW.montage2[0], GROW.toWall[0], ['D', 'A', 'Bm', 'G'], 1.6);
loop(GROW.toWall[0], 156, ['G', 'A', 'D', 'Bm'], 3.1);
plan.push([156, 'G'], [STAGE.firsts[0], 'A'], [STAGE.doing[0], 'Bm'], [STAGE.doing[0] + STAGE.doing[1], 'G'], [STAGE.blank, 'A'], [STAGE.tagline, 'D9']);
plan.forEach(([t0, c], i) => {
  const t1 = i + 1 < plan.length ? plan[i + 1][0] : DURATION;
  const last = i + 1 === plan.length;
  pad(pads, Math.max(0, t0 - 0.3), Math.min(DURATION, t1 + 0.3), C[c], { amp: 0.06, fade: i ? 0.5 : 1.5, fadeOut: last ? 5 : 0.5 });
});
// arpeggios once the team is working: steady in ①②, sparse in ③, quick in the ④ montage
const arp = (t0, t1, step, amp) => {
  for (let t = t0, i = 0; t < t1 - 0.01; t += step, i++) {
    let cur = plan[0][1];
    for (const [pt, c] of plan) if (pt <= t + 1e-6) cur = c;
    const notes = C[cur].slice(1).map((m) => m + 12);
    pluck(dry, t, mtof(notes[[0, 2, 1, 3, 2, 1][i % 6] % notes.length]), { amp, pan: (i % 2 ? 0.25 : -0.25), decay: 0.994, length: 1 });
    if (i % 4 === 0) hit(dry, t, { amp: amp * 0.5, dur: 0.05, color: 'lo' });
  }
};
arp(34.4, CLOUD.hold[0], 0.4, 0.06);
arp(66.0, MANY.hold[0], 0.4, 0.06);
arp(JUDGE.hideCore[1], JUDGE.hold[0], 0.8, 0.04);
arp(120.0, GROW.freeze[0], 0.2, 0.055);
arp(GROW.montage2[0], GROW.adopt, 0.2, 0.055);
arp(GROW.rice[0], GROW.hold[0], 0.4, 0.05);
arp(STAGE.firsts[0], STAGE.blank - 0.2, 0.4, 0.05);
arp(STAGE.tagline, STAGE.endcard[0] + 1.6, 0.4, 0.045);

// the hush when a person decides; quieter under each hold so the presenter can talk
const holds = [[BEFORE.wallLine[0], BEFORE.wallLine[1]], [CLOUD.hold[0], CLOUD.hold[1]], [MANY.hold[0], MANY.hold[1]], [JUDGE.hold[0], JUDGE.hold[1]], [GROW.hold[0], GROW.hold[1]]];
const padGain = (t) => {
  if (t >= JUDGE.ballToLeslie[1] && t < JUDGE.pick + 0.6) return 0.25 + 0.75 * Math.max(0, (t - JUDGE.pick) / 0.6);
  if (t >= GROW.freeze[0] && t < GROW.method[0]) return 0.5;
  if (t >= STAGE.blank - 0.3 && t < STAGE.cat) return 0.4;
  for (const [a, b] of holds) if (t >= a + 0.4 && t < b) return 0.7;
  return 1;
};
for (let i = 0; i < dry.n; i++) {
  const g = padGain(i / SR);
  dry.L[i] += pads.L[i] * g;
  dry.R[i] += pads.R[i] * g;
  send.L[i] += pads.L[i] * g * 0.6;
  send.R[i] += pads.R[i] * g * 0.6;
}
const wet = reverb(send);
let peak = 0;
for (const ch of ['L', 'R']) {
  for (let i = 0; i < dry.n; i++) {
    const fadeOut = Math.min(1, (DURATION - i / SR) / 2.0);
    dry[ch][i] = Math.tanh((dry[ch][i] + wet[ch][i] * 0.35) * 1.1) * fadeOut;
    peak = Math.max(peak, Math.abs(dry[ch][i]));
  }
}
for (const ch of ['L', 'R']) for (let i = 0; i < dry.n; i++) dry[ch][i] *= 0.89 / peak;
writeWav(process.argv[2] || 'score.wav', dry.L, dry.R);
console.log(`score → ${process.argv[2] || 'score.wav'} (${DURATION}s, peak ${peak.toFixed(2)})`);
