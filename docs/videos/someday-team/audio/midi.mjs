// A tiny Standard MIDI File writer. Events are placed in seconds; one fixed tempo maps them to ticks.

const PPQ = 480;

function vlq(n) {
  const out = [n & 0x7f];
  for (let v = n >> 7; v > 0; v >>= 7) out.unshift((v & 0x7f) | 0x80);
  return out;
}
const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];

/** A song: named parts on channels, each collecting timed events. */
export function createSong(bpm = 120) {
  const parts = new Map();
  const tick = (t) => Math.max(0, Math.round((t * PPQ * bpm) / 60));
  function part(name, { ch, prog = 0, vol = 100, pan = 64, rev = 40, cho = 0, bendRange = 2 }) {
    const ev = [];
    const p = { name, ch, ev };
    const raw = (t, bytes, order = 1) => ev.push({ k: tick(t), order, bytes });
    p.raw = raw;
    if (ch !== 9) raw(0, [0xc0 | ch, prog], 0);
    for (const [c, v] of [[7, vol], [10, pan], [91, rev], [93, cho], [101, 0], [100, 0], [6, bendRange], [11, 127]]) raw(0, [0xb0 | ch, c, v], 0);
    p.note = (t, dur, m, vel = 90) => {
      if (m < 0 || m > 127 || dur <= 0) return;
      raw(t, [0x90 | ch, m, Math.max(1, Math.min(127, Math.round(vel)))], 2);
      raw(t + dur, [0x80 | ch, m, 0], 1);
    };
    p.chord = (t, dur, notes, vel = 80, strum = 0) => notes.forEach((m, i) => p.note(t + i * strum, dur - i * strum, m, vel));
    p.cc = (t, c, v) => raw(t, [0xb0 | ch, c, Math.max(0, Math.min(127, Math.round(v)))], 1);
    p.ramp = (t0, t1, c, v0, v1, steps = 24) => {
      for (let i = 0; i <= steps; i++) p.cc(t0 + ((t1 - t0) * i) / steps, c, v0 + ((v1 - v0) * i) / steps);
    };
    /** Pitch bend, -1..1 of the bend range. */
    p.bend = (t, x) => {
      const v = Math.max(0, Math.min(16383, Math.round(8192 + x * 8191)));
      raw(t, [0xe0 | ch, v & 0x7f, v >> 7], 1);
    };
    parts.set(name, p);
    return p;
  }
  /** Drop note-ons in [t0, t1) from every part except those named in `keep` (a clean cut). */
  function silence(t0, t1, keep = []) {
    const k0 = tick(t0);
    const k1 = tick(t1);
    for (const p of parts.values()) {
      if (keep.includes(p.name)) continue;
      p.ev.splice(0, p.ev.length, ...p.ev.filter((e) => !((e.bytes[0] & 0xf0) === 0x90 && e.k >= k0 && e.k < k1)));
    }
  }
  function bytes() {
    const tracks = [];
    const tempo = Math.round(60000000 / bpm);
    tracks.push([0, 0xff, 0x51, 0x03, (tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255, 0, 0xff, 0x2f, 0x00]);
    for (const p of parts.values()) {
      const ev = [...p.ev].sort((a, b) => a.k - b.k || a.order - b.order);
      const data = [];
      let last = 0;
      for (const e of ev) {
        data.push(...vlq(e.k - last), ...e.bytes);
        last = e.k;
      }
      data.push(0, 0xff, 0x2f, 0x00);
      tracks.push(data);
    }
    const out = [0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 1, (tracks.length >> 8) & 255, tracks.length & 255, (PPQ >> 8) & 255, PPQ & 255];
    for (const tr of tracks) out.push(0x4d, 0x54, 0x72, 0x6b, ...u32(tr.length), ...tr);
    return Uint8Array.from(out);
  }
  return { part, silence, bytes };
}
