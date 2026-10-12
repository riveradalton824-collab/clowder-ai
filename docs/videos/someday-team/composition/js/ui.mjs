// Small shared UI bits: a person's own pointer (arrow, pen or fingertip, always tagged @handle)
// that glides and presses, and a lock glyph.
import { easeInOut, h, lerp, prog, svg } from '../../../promo-kit/util.mjs';
import { avatar, handle, personColor } from './cast.mjs';

export function makeCursor(parent, who, kind = 'arrow') {
  const box = h('div', `cursor ${kind}`, parent);
  if (kind === 'finger') {
    const dot = h('i', 'touch', box);
    dot.style.borderColor = personColor(who);
    dot.style.background = personColor(who, 70).replace(')', ' / 0.45)');
  } else {
    const s = svg('svg', { width: 28, height: 32, viewBox: '0 0 28 32' }, box);
    const d = kind === 'pen' ? 'M3 29 L6 20 L21 5 L26 10 L11 25 Z M6 20 L11 25' : 'M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L21 16 Z';
    svg('path', { d, fill: kind === 'pen' ? personColor(who) : '#141413', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
  }
  const tag = h('span', '', box, handle(who));
  tag.style.background = personColor(who);
  /** Glide from a to b over [t0, t1], press at `click` (a short dip), hide after `hide`. */
  box.move = (t, a, b, t0, t1, click, hide = Infinity) => {
    const k = easeInOut(prog(t, t0, t1));
    const press = click != null && t >= click && t < click + 0.18 ? 0.85 : 1;
    box.style.opacity = t >= t0 - 0.3 && t < hide ? Math.min(1, (t - t0 + 0.3) / 0.3, (hide - t) / 0.3) : 0;
    box.style.transform = `translate(${lerp(a.x, b.x, k)}px, ${lerp(a.y, b.y, k)}px) scale(${press})`;
  };
  /** Put the tip at p (visible). */
  box.at = (p, o = 1) => {
    box.style.opacity = o;
    box.style.transform = `translate(${p.x}px, ${p.y}px)`;
  };
  return box;
}

export function lock(parent, text) {
  const n = h('span', 'lock', parent);
  h('i', '', n);
  if (text) h('span', '', n, text);
  return n;
}

/** A speech line from a person: identicon + @handle + text. */
export function say(parent, who, text, cls = '') {
  const n = h('div', `say ${cls}`, parent);
  const av = h('div', 'say-who', n);
  av.appendChild(avatar(null, who, 40));
  const body = h('div', 'say-body', n);
  h('b', '', body, handle(who));
  h('span', '', body, text);
  return n;
}
