// The yarn ball: who holds a piece of work right now. Drawn in SVG so it can roll.
import { svg } from './util.mjs';

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
