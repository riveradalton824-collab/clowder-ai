// The ball travels between whoever holds the task; the yarn it unwinds stays
// behind as the thread's visible history.
import { makeBall, placeBall } from './faces.mjs';
import { clamp, easeBack, easeInOut, prog, quad, svg } from './util.mjs';

const R = 15;

export function buildYarn(parent, steps, { visibleFrom, hideAfter }) {
  // Trails sit behind the bubbles (threading through the gaps); the ball rides on top.
  const back = svg('svg', { class: 'yarn-layer' });
  parent.prepend(back);
  const layer = svg('svg', { class: 'yarn-layer' }, parent);
  back.style.zIndex = 0;
  layer.style.zIndex = 2;
  const trails = steps.filter((s) => s.from).map(() => svg('path', { class: 'yarn', pathLength: 1 }, back));
  const ball = makeBall(layer, R);
  let curves = [];

  function layout(anchors, height) {
    for (const l of [back, layer]) {
      l.setAttribute('width', 900);
      l.setAttribute('height', height);
      l.style.height = `${height}px`;
    }
    let acc = 0;
    let ti = 0;
    curves = steps.map((s) => {
      const b = anchors[s.to];
      if (!s.from) return { s, a: b, b, c: b, len: 0, acc };
      const a = anchors[s.from];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let c;
      if (s.kind === 'hop') {
        c = { x: a.x + (a.you ? 70 : -70), y: mid.y };
      } else {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        c = { x: mid.x - dy * 0.18, y: mid.y + dx * 0.18 };
      }
      let len = 0;
      let prev = a;
      for (let i = 1; i <= 24; i++) {
        const p = quad(a, c, b, i / 24);
        len += Math.hypot(p.x - prev.x, p.y - prev.y);
        prev = p;
      }
      const path = trails[ti++];
      path.setAttribute('d', `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`);
      const out = { s, a, b, c, len, acc, path };
      acc += len;
      return out;
    });
  }

  function update(t) {
    const shown = t >= visibleFrom && t < hideAfter;
    layer.style.display = shown ? '' : 'none';
    back.style.display = shown ? '' : 'none';
    if (!shown) return;
    let pos = curves[0].s.from ? curves[0].a : curves[0].b;
    let rot = 0;
    let scale = 1;
    for (const cv of curves) {
      if (!cv.path) continue;
      cv.path.style.strokeDashoffset = 1 - easeInOut(prog(t, cv.s.at[0], cv.s.at[1]));
      cv.path.style.opacity = t >= cv.s.at[0] ? 1 : 0;
    }
    for (const cv of curves) {
      const { s } = cv;
      if (t < s.at[0]) break;
      const k = easeInOut(prog(t, s.at[0], s.at[1]));
      if (s.kind === 'pop') {
        pos = cv.b;
        scale = clamp(easeBack(k), 0, 1.3);
      } else {
        pos = quad(cv.a, cv.c, cv.b, k);
        rot = ((cv.acc + cv.len * k) / R) * (180 / Math.PI);
      }
    }
    placeBall(ball, pos.x, pos.y, rot, Math.max(scale, 0.001), 1);
  }

  /** Who holds the ball at t: { id, flying, to }. */
  function holder(t) {
    let id = steps[0].from || steps[0].to;
    for (const s of steps) {
      if (t < s.at[0]) break;
      if (t < s.at[1]) return { id: s.from || s.to, flying: true, to: s.to };
      id = s.to;
    }
    return { id, flying: false };
  }
  return { layer, layout, update, holder };
}
