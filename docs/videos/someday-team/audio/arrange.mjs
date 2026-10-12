// The arrangement of《以后再说》as MIDI, rendered with a GM soundfont (FluidR3_GM, MIT) by synth.mjs.
// D minor piano while ideas wait on the wall → a build as the cat pounces → a D major band groove
// for ① ② (marimba = 宪宪's hook, glockenspiel = 烁烁) → a piano breakdown for ③ that goes quiet
// until Leslie picks → a driving montage for ④ with a tape stop on the freeze → the ending chorus.
// Bars are 2 s at 120 bpm; every section starts on a bar line of its own grid.
import { CLOUD, GROW, JUDGE, MANY, STAGE } from '../composition/js/timeline.mjs';
import { createSong } from './midi.mjs';

const CH = {
  D: { ep: [54, 57, 62, 64], bass: 38, str: [50, 57, 62, 66, 69], arp: [62, 66, 69, 74], pno: [50, 57, 62, 66] },
  A: { ep: [52, 57, 61, 64], bass: 33, str: [45, 52, 57, 61, 64], arp: [61, 64, 69, 73], pno: [45, 52, 57, 61] },
  Bm: { ep: [54, 59, 62, 66], bass: 35, str: [47, 54, 59, 62, 66], arp: [62, 66, 71, 74], pno: [47, 54, 59, 62] },
  G: { ep: [55, 59, 62, 66], bass: 31, str: [43, 50, 59, 62, 67], arp: [62, 67, 71, 74], pno: [43, 50, 55, 59] },
  Em: { ep: [55, 59, 62, 64], bass: 40, str: [40, 52, 55, 59, 64], arp: [59, 64, 67, 71], pno: [40, 52, 55, 59] },
  Asus: { ep: [52, 57, 62, 64], bass: 33, str: [45, 52, 57, 62, 64], arp: [62, 64, 69, 74], pno: [45, 52, 57, 62] },
};
const LOOP = ['D', 'A', 'Bm', 'G'];
// 宪宪's hook, four bars in beats: [beat, midi, beats]
const HOOK = [
  [[0, 78, 1], [1, 81, 0.5], [1.5, 83, 0.5], [2, 81, 1.5]],
  [[0, 76, 1], [1, 73, 0.5], [1.5, 76, 0.5], [2, 78, 1], [3, 76, 1]],
  [[0, 74, 1], [1, 78, 0.5], [1.5, 74, 0.5], [2, 71, 1.5]],
  [[0, 74, 0.5], [0.5, 76, 0.5], [1, 78, 1], [2, 79, 0.5], [2.5, 78, 0.5], [3, 76, 1]],
];
const HOOK_END = [[0, 74, 0.5], [0.5, 76, 0.5], [1, 78, 1], [2, 81, 2]];

export function arrange() {
  const song = createSong(120);
  const pno = song.part('piano', { ch: 0, prog: 0, vol: 100, rev: 60 });
  const ep = song.part('ep', { ch: 1, prog: 4, vol: 84, pan: 54, rev: 50, cho: 30 });
  const bass = song.part('bass', { ch: 2, prog: 33, vol: 100, rev: 10 });
  const mar = song.part('marimba', { ch: 3, prog: 12, vol: 104, pan: 76, rev: 55 });
  const glk = song.part('glock', { ch: 4, prog: 9, vol: 70, pan: 44, rev: 70 });
  const str = song.part('strings', { ch: 5, prog: 48, vol: 82, rev: 70 });
  const gtr = song.part('guitar', { ch: 6, prog: 25, vol: 64, pan: 88, rev: 45 });
  const rev = song.part('swell', { ch: 7, prog: 119, vol: 70, rev: 60 });
  const cel = song.part('celesta', { ch: 8, prog: 8, vol: 86, pan: 70, rev: 80 });
  const dr = song.part('drums', { ch: 9, vol: 100, rev: 25 });
  const melodic = [pno, ep, bass, mar, glk, str, gtr, cel];
  for (const p of melodic) p.raw(0, [0xb0 | p.ch, 6, 12], 0); // bend range 12 semitones for the tape stop

  const beat = 0.5;
  const bar = 2;
  /** One bar of band at t: kick/snare/hats, bass, EP, guitar, strings, shaped by `o`. */
  function bandBar(t, c, o) {
    const C = CH[c];
    const v = o.vel ?? 1;
    if (o.kick === 'pop') for (const b of [0, 1.5, 2]) dr.note(t + b * beat, 0.2, 36, 100 * v);
    if (o.kick === 'four') for (let b = 0; b < 4; b++) dr.note(t + b * beat, 0.2, 36, 104 * v);
    if (o.kick === 'half') for (const b of [0, 2]) dr.note(t + b * beat, 0.2, 36, 84 * v);
    if (o.snare) for (const b of [1, 3]) {
      dr.note(t + b * beat, 0.2, 39, 92 * v);
      dr.note(t + b * beat, 0.2, 38, 54 * v);
    }
    if (o.hats) {
      const step = o.hats === 16 ? 0.25 : 0.5;
      for (let b = 0; b < 4; b += step) dr.note(t + b * beat + (b % 1 === 0.5 ? 0.02 : 0), 0.1, 42, ((b % 1 === 0 ? 52 : 74) + (b % 1 === 0.25 || b % 1 === 0.75 ? -18 : 0)) * v);
      if (o.open) dr.note(t + 3.5 * beat, 0.3, 46, 60 * v);
    }
    if (o.shaker) for (let b = 0; b < 4; b += 0.25) dr.note(t + b * beat, 0.08, 70, (b % 0.5 ? 40 : 58) * v);
    if (o.bass === 'pop') {
      bass.note(t, 0.7, C.bass, 96 * v);
      bass.note(t + 1.5 * beat, 0.24, C.bass, 80 * v);
      bass.note(t + 2 * beat, 0.45, C.bass + 12, 84 * v);
      bass.note(t + 3 * beat, 0.24, C.bass, 80 * v);
      bass.note(t + 3.5 * beat, 0.24, C.bass + 7, 76 * v);
    }
    if (o.bass === 'oct') for (let b = 0; b < 4; b += 0.5) bass.note(t + b * beat, 0.22, C.bass + (b % 1 ? 12 : 0), (b % 1 ? 74 : 94) * v);
    if (o.bass === 'long') bass.note(t, bar - 0.05, C.bass, 84 * v);
    if (o.ep) {
      ep.chord(t, 0.45, C.ep, 64 * v, 0.008);
      ep.chord(t + 1.5 * beat, 0.4, C.ep, 72 * v, 0.008);
      ep.chord(t + 3 * beat, 0.3, C.ep, 58 * v, 0.008);
      ep.chord(t + 3.5 * beat, 0.45, C.ep, 70 * v, 0.008);
    }
    if (o.arp) {
      const step = o.arp === 16 ? 0.25 : 0.5;
      const order = [0, 1, 2, 3, 2, 1, 3, 2];
      for (let b = 0, i = 0; b < 4; b += step, i++) gtr.note(t + b * beat, step * beat * 1.6, C.arp[order[i % 8]] + (o.arp === 16 && i % 4 === 3 ? 12 : 0), (i % 2 ? 50 : 62) * v);
    }
    if (o.strings) str.chord(t, bar, C.str, (o.strings === 'soft' ? 46 : 62) * v);
    if (o.pad) str.chord(t, bar, C.str.slice(1), 52 * v);
  }
  function band(t0, bars, o, seq = LOOP) {
    for (let i = 0; i < bars; i++) bandBar(t0 + i * bar, seq[i % seq.length], typeof o === 'function' ? o(i) : o);
  }
  function hook(p, t0, { vel = 92, oct = 0, end = false, bars = 4 } = {}) {
    for (let i = 0; i < bars; i++) {
      const notes = end && i === bars - 1 ? HOOK_END : HOOK[i % 4];
      for (const [b, m, d] of notes) p.note(t0 + i * bar + b * beat, d * beat * 0.95, m + oct, vel);
    }
  }
  function crash(t, v = 96) {
    dr.note(t, 1.5, 49, v);
    dr.note(t, 0.2, 36, 110);
  }
  function roll(t0, t1, v0 = 40, v1 = 100) {
    const n = Math.round((t1 - t0) / 0.125);
    for (let i = 0; i < n; i++) dr.note(t0 + i * 0.125, 0.1, 38, v0 + ((v1 - v0) * i) / n);
  }
  function swell(tEnd, len = 2.2) {
    rev.note(tEnd - len, len, 60, 100);
  }

  // ---------- 0–24 before: D minor, solo piano over soft strings ----------
  const intro = [
    [0, 6, [50, 57, 62, 65, 69], [38, 45]],
    [6, 12, [46, 53, 57, 62, 65], [34, 41]],
    [12, 18, [41, 53, 57, 60, 64], [29, 41]],
    [18, 21, [40, 48, 55, 60, 64], [28, 40]],
    [21, 24.6, [45, 52, 57, 62, 67], [33, 45]],
  ];
  for (const [a, b, s, lh] of intro) {
    str.chord(a + 0.1, b - a, s, 60);
    pno.chord(a + 0.05, b - a - 0.1, lh, 70);
  }
  str.ramp(0, 3, 11, 60, 110);
  const melody = [
    [0.8, 69, 1], [1.8, 74, 0.6], [2.4, 76, 0.6], [3.0, 77, 2.0], [5.2, 76, 0.4], [5.6, 74, 0.4],
    [6.0, 74, 1.4], [7.5, 72, 0.5], [8.0, 74, 1.0], [9.0, 77, 1.8], [11.0, 81, 1.0],
    [12.0, 79, 1.2], [13.2, 77, 0.6], [13.8, 76, 0.6], [14.4, 72, 2.2], [16.8, 69, 1.2],
    [18.0, 67, 1.0], [19.0, 72, 1.0], [20.0, 76, 1.0], [21.0, 74, 3.4],
  ];
  for (const [t, m, d] of melody) pno.note(t, d, m, t >= 19.4 ? 70 : 84);
  for (const [t, m] of [[3.0, 65], [9.0, 69], [14.4, 64]]) pno.note(t, 1.6, m, 56);

  // ---------- 24–34 turn: a clock, a heartbeat, a swell, the reveal ----------
  for (let t = 24; t < 29.5; t += beat) dr.note(t, 0.05, 42, t < 26 ? 50 : 62);
  for (let t = 26; t < 29.4; t += beat) dr.note(t, 0.2, 36, 60 + (t - 26) * 8);
  str.chord(24.6, 4.8, CH.Asus.str, 62);
  str.ramp(25, 29.3, 11, 70, 127);
  swell(29.5, 2.4);
  crash(29.5, 104);
  pno.chord(29.5, 1.4, [38, 50, 57, 62, 66, 69], 92, 0.01);
  str.chord(29.5, 2.5, CH.D.str, 70);
  glk.chord(29.55, 1, [74, 78, 81], 70, 0.05);
  band(30, 2, (i) => ({ kick: 'half', hats: 8, ep: true, bass: 'long', vel: 0.85 + i * 0.1 }), ['D', 'G']);
  roll(33.0, 34.0, 30, 96);
  swell(34.0, 1.6);

  // ---------- 34–66 ① the band arrives ----------
  crash(34);
  band(34, 14, (i) => ({ kick: 'pop', snare: true, hats: 8, shaker: i >= 4, bass: 'pop', ep: true, arp: i >= 2 ? 8 : 0, strings: i >= 8 ? 'soft' : 0, vel: i < 2 ? 0.85 : 1 }));
  hook(mar, 42, { vel: 96 });
  hook(mar, 50, { vel: 96, end: true });
  for (const [i, b] of CLOUD.buttons.entries()) glk.note(b + 0.4, 0.6, [79, 83, 86][i], 66);
  cel.chord(CLOUD.runs, 1.5, [74, 78, 81, 86], 70, 0.07);
  // hold 63–66: the band steps back, then a roll back in
  band(62, 1, { kick: 'pop', snare: true, hats: 8, bass: 'pop', ep: true, arp: 8 }, ['D']);
  str.chord(64, 2, CH.G.str, 54);
  ep.chord(64, 2, CH.G.ep, 58);
  bass.note(64, 2, CH.G.bass, 70);
  roll(65.0, 66.0, 30, 90);

  // ---------- 66–98 ② everyone on one model ----------
  crash(66);
  band(66, 13, (i) => ({ kick: 'pop', snare: true, hats: i >= 4 ? 16 : 8, open: i >= 4, shaker: true, bass: 'pop', ep: true, arp: 8, strings: i >= 4 ? 'soft' : 0 }));
  hook(mar, 66, { vel: 88 });
  // 烁烁 answers in glockenspiel
  for (let i = 0; i < 8; i++) {
    const t = 74 + i * bar;
    const C = CH[LOOP[i % 4]].arp;
    glk.note(t + 3 * beat, 0.4, C[3] + 12, 60);
    glk.note(t + 3.5 * beat, 0.4, C[2] + 12, 54);
  }
  hook(mar, 82, { vel: 92, end: true });
  crash(MANY.v2 - 0.0, 90);
  cel.chord(MANY.v2, 1.4, [78, 81, 86, 90], 66, 0.06);
  glk.chord(MANY.handoff[1], 1, [81, 86, 90], 62, 0.05);
  // hold 93.6–98: strings and a held Bm, no drums
  str.chord(92, 2, CH.Bm.str, 56);
  str.chord(94, 4, CH.G.str, 50);
  ep.chord(94, 3.8, CH.G.ep, 50);
  bass.note(94, 3.8, CH.G.bass, 60);
  band(92, 1, { kick: 'half', hats: 8, bass: 'pop', ep: true, vel: 0.8 }, ['Bm']);

  // ---------- 98–120 ③ a piano breakdown; it goes quiet until Leslie picks ----------
  str.chord(98, 4.2, CH.Bm.str, 58);
  pno.chord(98, 2, CH.Bm.pno, 68);
  pno.chord(100, 2.4, CH.G.pno, 64);
  for (const [t, m, d] of [[98.5, 78, 1], [99.5, 76, 0.5], [100, 74, 1.5], [101.5, 71, 1]]) pno.note(t, d, m, 76);
  str.note(102.4, 1.9, 78, 34);
  // the pick: a warm D/F#, then a gentle pulse back
  pno.chord(JUDGE.pick, 2, [42, 50, 57, 62, 66, 69], 74, 0.02);
  str.chord(JUDGE.pick, 2, CH.D.str, 62);
  cel.note(JUDGE.pick + 0.05, 1.5, 86, 70);
  const grid3 = JUDGE.pick;
  const seq3 = ['D', 'A', 'Bm', 'G', 'D', 'Asus'];
  seq3.forEach((c, i) => {
    const t = grid3 + i * bar;
    if (t + bar > 120.2) return;
    str.chord(t, bar, CH[c].str, 54);
    pno.chord(t, bar - 0.1, CH[c].pno, 62);
    if (i >= 1) bandBar(t, c, { kick: 'half', shaker: true, bass: 'long', vel: 0.75 });
  });
  hook(pno, grid3 + bar, { vel: 74, oct: -12, bars: 4 });
  str.chord(116.2, 3.8, CH.Asus.str, 56);
  swell(120, 2.6);

  // ---------- 120–156 ④ the montage, a tape stop, the nod, the next task ----------
  crash(120);
  band(120, 3, { kick: 'four', snare: true, hats: 16, bass: 'oct', ep: true, arp: 16, strings: 'soft' });
  band(126, 1, { kick: 'four', snare: true, hats: 16, bass: 'oct', ep: true, arp: 16 }, ['G']);
  hook(mar, 120, { vel: 90, bars: 3 });
  hook(glk, 120, { vel: 58, oct: 12, bars: 3 });
  // tape stop on the freeze: everything bends down and stops; the band comes back on its own grid
  song.silence(GROW.freeze[0], GROW.montage2[0]);
  const VOL = new Map([[str, 82], [ep, 84], [glk, 70], [gtr, 64], [cel, 86], [mar, 104], [pno, 100], [bass, 100]]);
  for (const p of melodic) {
    for (let i = 0; i <= 12; i++) p.bend(GROW.freeze[0] + i * 0.05, -i / 12);
    p.cc(GROW.freeze[0] + 0.65, 7, 0);
    p.bend(GROW.freeze[0] + 0.7, 0);
    p.cc(128.15, 7, VOL.get(p));
  }
  str.chord(128.2, GROW.montage2[0] - 128.2, CH.Em.str, 40);
  for (let i = 0; i < 4; i++) cel.note(128.4 + i * 0.42, 0.5, [74, 78, 81, 83][i], 50);
  swell(GROW.montage2[0], 2.0);
  // restart on its own grid
  const g4 = GROW.montage2[0];
  crash(g4);
  band(g4, 7, (i) => ({ kick: i === 3 ? 'half' : 'four', snare: true, hats: 16, open: true, bass: 'oct', ep: true, arp: 16, strings: i >= 4 ? 'loud' : 'soft' }));
  hook(mar, g4 + bar, { vel: 94 });
  crash(GROW.adopt, 104);
  cel.chord(GROW.adopt, 1.6, [74, 78, 81, 86, 90], 72, 0.06);
  hook(mar, GROW.adopt, { vel: 96, end: true, bars: 2 });
  // back at the wall: lighter, the rice cooker starts
  band(g4 + 7 * bar, 3, (i) => ({ kick: i === 0 ? 0 : 'pop', snare: i > 0, hats: 8, shaker: true, bass: 'pop', ep: true, arp: 8, strings: 'soft' }));
  bandBar(g4 + 10 * bar, 'Bm', { kick: 'half', hats: 8, bass: 'pop', ep: true, vel: 0.85 });
  str.chord(GROW.hold[0], 2.4, CH.G.str, 50);
  str.chord(154, 2, CH.Asus.str, 56);
  ep.chord(GROW.hold[0], 4.3, CH.G.ep, 48);
  bass.note(GROW.hold[0], 4.3, CH.G.bass, 56);
  swell(156, 2.2);

  // ---------- 156–178 登场 ----------
  const g5 = 156;
  str.chord(g5, 2.8, CH.D.str, 60);
  pno.chord(g5, 2.8, CH.D.pno, 60);
  band(g5 + bar, 2, { kick: 'half', hats: 8, shaker: true, bass: 'long', ep: true, strings: 'soft', vel: 0.85 }, ['A', 'Bm']);
  [74, 78, 81, 86].forEach((m, i) => cel.note(STAGE.firsts[0] + i * STAGE.firsts[1], 1.2, m, 82));
  band(162, 2, { kick: 'pop', snare: true, hats: 8, shaker: true, bass: 'pop', ep: true, arp: 8, strings: 'soft' }, ['G', 'D']);
  band(166, 1, { kick: 'pop', snare: true, hats: 16, bass: 'pop', ep: true, arp: 16 }, ['A']);
  for (let i = 0; i < 5; i++) glk.note(STAGE.doing[0] + 0.5 + i * 0.32, 0.3, [86, 88, 90, 93, 95][i], 56);
  glk.chord(STAGE.doing[0] + STAGE.doing[1] + 0.35, 0.8, [83, 86], 60, 0.1);
  roll(167.0, 168.0, 40, 104);
  // the blank note lands on the downbeat; the room gets the whole band
  crash(STAGE.blank, 110);
  band(STAGE.blank, 3, { kick: 'pop', snare: true, hats: 16, open: true, bass: 'pop', ep: true, arp: 16, strings: 'loud' }, ['D', 'G', 'A']);
  hook(mar, STAGE.blank, { vel: 100, end: true, bars: 3 });
  hook(glk, STAGE.blank, { vel: 60, oct: 12, end: true, bars: 3 });
  const fin = STAGE.endcard[0] + 0.6;
  crash(fin, 96);
  pno.chord(fin, 4.0, [38, 50, 57, 62, 66, 69, 76], 80, 0.03);
  str.chord(fin, 4.0, [50, 57, 62, 66, 69, 76], 66);
  ep.chord(fin, 4.0, [54, 57, 62, 64, 69], 60, 0.02);
  bass.note(fin, 4.0, 38, 84);
  cel.chord(fin + 0.1, 3.5, [86, 90, 93, 98], 66, 0.14);
  str.ramp(fin + 1, 178, 11, 127, 40);
  return song.bytes();
}
