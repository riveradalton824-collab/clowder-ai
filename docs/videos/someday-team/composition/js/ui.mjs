// Small shared UI bits: a named pointer that glides and clicks, and a lock glyph.
import { easeInOut, h, lerp, prog, svg } from '../../../promo-kit/util.mjs';
import { PEOPLE } from './timeline.mjs';

export function makeCursor(parent, who) {
  const box = h('div', 'cursor', parent);
  const s = svg('svg', { width: 26, height: 30, viewBox: '0 0 26 30' }, box);
  svg('path', { d: 'M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L21 16 Z', fill: '#141413', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
  const tag = h('span', '', box, PEOPLE[who].name);
  tag.style.background = PEOPLE[who].color;
  /** Glide from a to b over [t0, t1], press at `click` (a short dip). */
  box.move = (t, a, b, t0, t1, click, hide = Infinity) => {
    const k = easeInOut(prog(t, t0, t1));
    const press = click != null && t >= click && t < click + 0.18 ? 0.85 : 1;
    box.style.opacity = t >= t0 - 0.3 && t < hide ? Math.min(1, (t - t0 + 0.3) / 0.3) : 0;
    box.style.transform = `translate(${lerp(a.x, b.x, k)}px, ${lerp(a.y, b.y, k)}px) scale(${press})`;
  };
  return box;
}

export function lock(parent, text) {
  const n = h('span', 'lock', parent);
  h('i', '', n);
  if (text) h('span', '', n, text);
  return n;
}
