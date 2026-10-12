// Tiny offline synth: additive tones, Karplus–Strong plucks, noise, pads, reverb.
// Deterministic (seeded noise), no dependencies.
import fs from 'node:fs';

export const SR = 48000;
export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

export function makeBus(seconds) {
  const n = Math.ceil(seconds * SR);
  return { L: new Float32Array(n), R: new Float32Array(n), n };
}

function put(bus, i, v, pan) {
  if (i < 0 || i >= bus.n) return;
  const a = ((pan + 1) * Math.PI) / 4;
  bus.L[i] += v * Math.cos(a);
  bus.R[i] += v * Math.sin(a);
}

let seed = 1234567;
const noise = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

/** Additive tone; partials = [[ratio, amp, decaySeconds], ...]. */
export function tone(bus, t, f, { amp = 0.3, partials = [[1, 1, 1]], pan = 0, attack = 0.004, trem = 0 } = {}) {
  const len = Math.max(...partials.map((p) => p[2])) * 5;
  const norm = partials.reduce((sum, p) => sum + p[1], 0);
  const i0 = Math.round(t * SR);
  for (let k = 0; k < len * SR; k++) {
    const s = k / SR;
    let v = 0;
    for (const [r, a, d] of partials) v += a * Math.sin(2 * Math.PI * f * r * s) * Math.exp(-s / d);
    v /= norm;
    const tail = Math.min(1, (len - s) / 0.08);
    const env = tail * Math.min(1, s / attack) * (trem ? 1 - trem * (0.5 + 0.5 * Math.sin(2 * Math.PI * 5.2 * s)) : 1);
    put(bus, i0 + k, v * env * amp, pan);
  }
}

/** Karplus–Strong plucked string. */
export function pluck(bus, t, f, { amp = 0.3, pan = 0, decay = 0.996, length = 2.5 } = {}) {
  const p = Math.max(2, Math.round(SR / f));
  const buf = Float32Array.from({ length: p }, () => noise());
  const i0 = Math.round(t * SR);
  let last = 0;
  for (let k = 0; k < length * SR; k++) {
    const j = k % p;
    const v = buf[j];
    buf[j] = decay * 0.5 * (v + last);
    last = v;
    put(bus, i0 + k, v * amp * Math.min(1, k / 64, (length * SR - k) / 4000), pan);
  }
}

/** Short noise hit; 'hi' = click, 'lo' = soft thump/roll grain. */
export function hit(bus, t, { amp = 0.2, dur = 0.012, color = 'hi', pan = 0 } = {}) {
  const i0 = Math.round(t * SR);
  let lp = 0;
  for (let k = 0; k < dur * SR; k++) {
    const x = noise();
    lp += (color === 'hi' ? 0.25 : 0.03) * (x - lp);
    const v = color === 'hi' ? x - lp : lp * 4;
    put(bus, i0 + k, v * amp * Math.exp((-k / (dur * SR)) * 4), pan);
  }
}

/** Pitch-sweeping sine: pops, kicks, thuds, blips. */
export function sweep(bus, t, { f0, f1, dur, amp = 0.3, pan = 0 }) {
  const i0 = Math.round(t * SR);
  let ph = 0;
  for (let k = 0; k < dur * SR; k++) {
    const q = k / (dur * SR);
    ph += (2 * Math.PI * (f0 * (f1 / f0) ** q)) / SR;
    put(bus, i0 + k, Math.sin(ph) * amp * Math.min(1, k / 48) * (1 - q) ** 2, pan);
  }
}

/** A ball rolling: low noise with bumps, panned across. */
export function roll(bus, t0, t1, { amp = 0.08, pan0 = -0.3, pan1 = 0.3 } = {}) {
  const i0 = Math.round(t0 * SR);
  const n = Math.round((t1 - t0) * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const q = k / n;
    lp += 0.02 * (noise() - lp);
    const bump = 0.6 + 0.4 * Math.sin(2 * Math.PI * (9 + 6 * Math.sin(Math.PI * q)) * (k / SR));
    const env = Math.sin(Math.PI * q) ** 0.6;
    put(bus, i0 + k, lp * 6 * bump * env * amp, pan0 + (pan1 - pan0) * q);
  }
}

/** Noise riser through a sweeping band-pass (state-variable filter). */
export function riser(bus, t0, t1, { amp = 0.08, f0 = 300, f1 = 4000 } = {}) {
  const i0 = Math.round(t0 * SR);
  const n = Math.round((t1 - t0) * SR);
  let low = 0;
  let band = 0;
  for (let k = 0; k < n; k++) {
    const q = k / n;
    const f = 2 * Math.sin((Math.PI * (f0 * (f1 / f0) ** q)) / SR);
    const high = noise() - low - 0.5 * band;
    band += f * high;
    low += f * band;
    put(bus, i0 + k, band * amp * q * q * Math.min(1, (n - k) / 480), Math.sin(k / 9000) * 0.3);
  }
}

/** Warm pad chord: detuned triangles → one-pole low-pass, raised-cosine fades. */
export function pad(bus, t0, t1, notes, { amp = 0.05, fade = 0.6, fadeOut = fade, cutoff = 1100 } = {}) {
  const i0 = Math.round(t0 * SR);
  const n = Math.round((t1 - t0) * SR);
  const g = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  notes.forEach((m, ni) => {
    const oscs = [-7, 0, 7].map((c) => ({ f: mtof(m) * 2 ** (c / 1200), ph: (ni * 0.37 + c) % 1 }));
    let lp = 0;
    const pan = ((ni / Math.max(1, notes.length - 1)) * 2 - 1) * 0.5;
    for (let k = 0; k < n; k++) {
      let v = 0;
      for (const o of oscs) {
        o.ph = (o.ph + o.f / SR) % 1;
        v += 1 - 4 * Math.abs(o.ph - 0.5);
      }
      lp += g * (v - lp);
      const s = k / SR;
      const fin = s < fade ? 0.5 - 0.5 * Math.cos((Math.PI * s) / fade) : 1;
      const rem = (n - k) / SR;
      const fout = rem < fadeOut ? 0.5 - 0.5 * Math.cos((Math.PI * rem) / fadeOut) : 1;
      put(bus, i0 + k, (lp / 3) * amp * fin * fout, pan);
    }
  });
}

/** Freeverb-style reverb (8 combs + 4 all-passes per channel). */
export function reverb(bus, { room = 0.86, damp = 0.25 } = {}) {
  const out = { L: new Float32Array(bus.n), R: new Float32Array(bus.n), n: bus.n };
  const scale = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const alls = [556, 441, 341, 225];
  for (const [ch, spread] of [['L', 0], ['R', 23]]) {
    const src = bus[ch];
    const dst = out[ch];
    for (const c of combs) {
      const len = Math.round((c + spread) * scale);
      const buf = new Float32Array(len);
      let idx = 0;
      let store = 0;
      for (let i = 0; i < bus.n; i++) {
        const y = buf[idx];
        store = y * (1 - damp) + store * damp;
        buf[idx] = src[i] * 0.015 + store * room;
        dst[i] += y;
        idx = (idx + 1) % len;
      }
    }
    for (const a of alls) {
      const len = Math.round((a + spread) * scale);
      const buf = new Float32Array(len);
      let idx = 0;
      for (let i = 0; i < bus.n; i++) {
        const b = buf[idx];
        buf[idx] = dst[i] + b * 0.5;
        dst[i] = b - dst[i];
        idx = (idx + 1) % len;
      }
    }
  }
  return out;
}

export function writeWav(path, L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(path, buf);
}
