// The human's desktop: wallpaper, menu bar, generic window chrome and the donut
// that both the tutorial video and the modelling app show.
import { h, svg } from '../../../promo-kit/util.mjs';

export function buildDesktop(stage) {
  const root = h('div', 'desktop', stage);
  h('div', 'wallpaper', root);
  const bar = h('div', 'menubar', root);
  h('span', 'mb-apple', bar, '●');
  for (const w of ['访达', '文件', '编辑', '显示', '窗口']) h('span', '', bar, w);
  h('span', 'mb-spacer', bar);
  h('span', 'mb-clock', bar, '周日 21:40');
  return { root };
}

/** A generic app window with traffic lights and a title. */
export function makeWindow(parent, { x, y, w, hh, title, cls = '' }) {
  const n = h('div', `win ${cls}`, parent);
  Object.assign(n.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hh}px` });
  const bar = h('div', 'win-bar', n);
  for (const c of ['#ec6a5e', '#f4bf4f', '#61c554']) h('i', 'light', bar).style.background = c;
  h('span', 'win-title', bar, title);
  const body = h('div', 'win-body', n);
  return { n, body, box: { x, y, w, h: hh } };
}

/** Donut drawn in SVG; roughness drives the glaze highlight, angle turns it. */
export function makeDonut(parent, bg) {
  const s = svg('svg', { class: 'donut', viewBox: '0 0 600 420' }, parent);
  const defs = svg('defs', {}, s);
  const blur = svg('filter', { id: `hl-${bg.slice(1)}`, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  const gauss = svg('feGaussianBlur', { stdDeviation: 6 }, blur);
  const soft = svg('filter', { id: `sh-${bg.slice(1)}`, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  svg('feGaussianBlur', { stdDeviation: 10 }, soft);
  const shadow = svg('ellipse', { cx: 300, cy: 318, rx: 190, ry: 30, fill: '#000', opacity: 0.5, filter: `url(#sh-${bg.slice(1)})` }, s);
  const g = svg('g', {}, s);
  svg('ellipse', { cx: 300, cy: 210, rx: 172, ry: 112, fill: '#d49559' }, g);
  svg('ellipse', { cx: 300, cy: 222, rx: 172, ry: 100, fill: '#b9773f', opacity: 0.55 }, g);
  let d = '';
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r = 1 + (i % 2 ? 0.035 : -0.02);
    d += `${i ? 'L' : 'M'}${300 + Math.cos(a) * 156 * r} ${198 + Math.sin(a) * 94 * r}`;
  }
  svg('path', { d: `${d}Z`, fill: '#ec8faa' }, g);
  svg('ellipse', { cx: 300, cy: 196, rx: 62, ry: 30, fill: '#c9708b' }, g);
  svg('ellipse', { cx: 300, cy: 200, rx: 52, ry: 24, fill: bg }, g);
  const colors = ['#fff3c4', '#7fc4e8', '#9be08a', '#ffffff', '#f6a35b'];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + 0.3;
    const rr = i % 2 ? 118 : 96;
    const x = 300 + Math.cos(a) * rr;
    const y = 198 + Math.sin(a) * rr * 0.6;
    svg('rect', { x: x - 8, y: y - 2.5, width: 16, height: 5, rx: 2.5, fill: colors[i % 5], transform: `rotate(${(i * 47) % 180} ${x} ${y})` }, g);
  }
  const hl = svg('ellipse', { cx: 222, cy: 148, rx: 52, ry: 17, fill: '#fff', transform: 'rotate(-16 222 148)', filter: `url(#hl-${bg.slice(1)})` }, g);

  function update({ rough = 0.62, angle = 0 } = {}) {
    gauss.setAttribute('stdDeviation', (2 + rough * 14).toFixed(2));
    hl.setAttribute('opacity', (0.95 - rough * 0.7).toFixed(3));
    hl.setAttribute('rx', (30 + rough * 40).toFixed(1));
    g.setAttribute('transform', `rotate(${angle} 300 210)`);
    shadow.setAttribute('cx', 300 + angle * 1.4);
  }
  update();
  return { s, update, highlight: { x: 222, y: 148 }, contact: { x: 300, y: 318 } };
}
