// Cat faces come only from the f321 sticker set (the house's canonical look),
// and the yarn ball is the visual stand-in for 球权 (who holds the task).
import { CATS, MOODS } from './timeline.mjs';
import { clamp, h, stateAt, svg } from './util.mjs';

const STICKERS = '/packages/web/public/f321/stickers/';
export const STATES = ['applied', 'drilled', 'invalidated', 'dormant'];
export const stickerUrl = (who, state) => `${STICKERS}${CATS[who].sticker}-${state}.png`;
export const allStickerUrls = () => Object.keys(CATS).flatMap((w) => STATES.map((s) => stickerUrl(w, s)));

/** A face = four stacked sticker states; only one is visible at a time. */
export function makeFace(parent, who, size, cls = 'face') {
  const box = h('div', cls, parent);
  box.style.width = `${size}px`;
  box.style.height = `${size}px`;
  box._imgs = {};
  const inner = h('div', 'face-in', box);
  for (const s of STATES) {
    const img = h('img', 'face-img', inner);
    img.src = stickerUrl(who, s);
    img.alt = '';
    box._imgs[s] = img;
  }
  box._who = who;
  return box;
}

/** Apply the cat's mood at time t; a short squash marks each change. */
export function updateFace(box, t, override) {
  const mood = override ? { value: override, since: -9 } : stateAt(MOODS[box._who], t);
  for (const s of STATES) box._imgs[s].style.opacity = s === mood.value ? 1 : 0;
  const k = clamp((t - mood.since) / 0.32);
  const pulse = k < 1 ? Math.sin(Math.PI * k) * 0.14 : 0;
  box.style.setProperty('--sx', 1 + pulse);
  box.style.setProperty('--sy', 1 - pulse * 0.7);
}

/** The yarn ball, drawn in SVG so it can roll (rotate) cleanly. */
export function makeBall(parent, r) {
  const g = svg('g', { class: 'ball' }, parent);
  svg('circle', { r, fill: '#c46a4d', stroke: '#8f4730', 'stroke-width': Math.max(1.5, r * 0.09) }, g);
  const arcs = [
    `M ${-r * 0.82} ${-r * 0.3} Q 0 ${-r * 0.95} ${r * 0.82} ${-r * 0.3}`,
    `M ${-r * 0.92} ${r * 0.12} Q 0 ${-r * 0.42} ${r * 0.92} ${r * 0.12}`,
    `M ${-r * 0.74} ${r * 0.55} Q 0 ${r * 0.08} ${r * 0.74} ${r * 0.55}`,
    `M ${-r * 0.2} ${-r * 0.96} Q ${r * 0.45} 0 ${-r * 0.1} ${r * 0.98}`,
  ];
  for (const d of arcs) {
    svg('path', { d, fill: 'none', stroke: '#f3e3da', 'stroke-opacity': 0.75, 'stroke-width': Math.max(1, r * 0.08) }, g);
  }
  return g;
}

export function placeBall(g, x, y, rot = 0, s = 1, o = 1) {
  g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
  g.setAttribute('opacity', o);
}
