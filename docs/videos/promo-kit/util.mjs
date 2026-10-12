// Small deterministic helpers. Every visual is a pure function of time t.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
export const easeOut = (k) => 1 - (1 - k) ** 3;
export const easeIn = (k) => k ** 3;
export const easeInOut = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
export function easeBack(k) {
  const c = 1.70158;
  return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
}
export function easeBounce(k) {
  const n = 7.5625;
  const d = 2.75;
  if (k < 1 / d) return n * k * k;
  if (k < 2 / d) return n * (k - 1.5 / d) ** 2 + 0.75;
  if (k < 2.5 / d) return n * (k - 2.25 / d) ** 2 + 0.9375;
  return n * (k - 2.625 / d) ** 2 + 0.984375;
}

/** Fade in over [t0, t0+d] and out over [t1-d, t1]. */
export const win = (t, t0, t1, d = 0.4) => clamp(Math.min((t - t0) / d, (t1 - t) / d));

/** Text revealed character by character between t0 and t1. */
export function typed(text, t, t0, t1) {
  const chars = Array.from(text);
  const n = Math.round(chars.length * prog(t, t0, t1));
  return chars.slice(0, n).join('');
}

/** Seeded PRNG (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function h(tag, cls, parent, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  if (parent) parent.appendChild(n);
  return n;
}

export function svg(tag, attrs, parent) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

/** Set opacity + transform in one call. */
export function place(node, { o = 1, x = 0, y = 0, s = 1, r = 0 } = {}) {
  node.style.opacity = o;
  node.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
}

/** Point on a quadratic Bézier. */
export function quad(p0, c, p1, k) {
  const u = 1 - k;
  return { x: u * u * p0.x + 2 * u * k * c.x + k * k * p1.x, y: u * u * p0.y + 2 * u * k * c.y + k * k * p1.y };
}

export function hexLerp(a, b, k) {
  const pa = [1, 3, 5].map((i) => Number.parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => Number.parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`;
}

/** Latest [time, value] entry at or before t, plus when it started. */
export function stateAt(entries, t) {
  let cur = entries[0];
  for (const e of entries) if (e[0] <= t) cur = e;
  return { since: cur[0], value: cur[1] };
}
