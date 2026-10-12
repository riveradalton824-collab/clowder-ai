// S1「路由器」: three chat windows, one human copy-pasting between them.
// Every paste drags a yarn line; the lines tangle, then pull into a knot.
import { PROMISE, tangleHops } from './timeline.mjs';
import { clamp, easeInOut, easeOut, h, lerp, place, prog, rng, svg, win } from '../../../promo-kit/util.mjs';

const WINDOWS = [
  { name: 'Claude', x: 210, y: 150 },
  { name: 'GPT', x: 1270, y: 150 },
  { name: 'Gemini', x: 740, y: 520 },
];
const WW = 440;
const WH = 270;
export const KNOT = { x: 960, y: 470 };

export function buildOpen(stage) {
  const root = h('div', 'scene s-open', stage);
  const dark = h('div', 'bg-dark', root);
  const lines = svg('svg', { class: 'layer', viewBox: '0 0 1920 1080' }, root);
  const r = rng(11);
  const hops = tangleHops();

  const wins = WINDOWS.map((w, i) => {
    const n = h('div', 'chatwin', root);
    n.style.left = `${w.x}px`;
    n.style.top = `${w.y}px`;
    const head = h('div', 'chatwin-head', n);
    h('i', `dot dot-${i}`, head);
    h('span', '', head, w.name);
    const body = h('div', 'chatwin-body', n);
    const bars = Array.from({ length: 6 }, () => {
      const b = h('div', 'bar', body);
      b._w = 30 + r() * 62;
      return b;
    });
    return { n, bars, cx: w.x + WW / 2, cy: w.y + WH / 2 };
  });

  const pt = (wi) => {
    const w = WINDOWS[wi];
    return { x: w.x + 40 + r() * (WW - 80), y: w.y + 60 + r() * (WH - 100) };
  };
  const strands = hops.map((hp, i) => {
    const p0 = pt(hp.from);
    const p3 = pt(hp.to);
    const c1 = { x: 200 + r() * 1520, y: 120 + r() * 760 };
    const c2 = { x: 200 + r() * 1520, y: 120 + r() * 760 };
    const knot = Array.from({ length: 4 }, () => ({ x: KNOT.x + (r() - 0.5) * 120, y: KNOT.y + (r() - 0.5) * 90 }));
    const path = svg('path', { class: 'strand', pathLength: 1 }, lines);
    return { hp, pts: [p0, c1, c2, p3], knot, path, ph: r() * 6.28, sp: 1.1 + (i % 5) * 0.21 };
  });

  const cursor = h('div', 'cursor', root);
  cursor.innerHTML =
    '<svg width="34" height="44" viewBox="0 0 34 44"><path d="M3 3 L3 36 L12 28 L18 41 L24 38 L18 25 L30 25 Z" fill="#faf9f5" stroke="#181715" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  const capC = h('div', 'keycap', root, '⌘C');
  const capV = h('div', 'keycap', root, '⌘V');
  const counter = h('div', 'counter', root);
  const line1 = h('div', 'open-line', root, 'Claude、GPT、Gemini——各有所长。');
  const line2 = h('div', 'open-line', root);
  line2.innerHTML = '可要让它们一起干活，你就成了那个<em>路由器</em>。';

  function update(t) {
    root.style.display = t < PROMISE.ballForm[1] + 0.2 ? '' : 'none';
    if (t >= PROMISE.ballForm[1] + 0.2) return;
    dark.style.opacity = 1 - easeInOut(prog(t, PROMISE.warm[0], PROMISE.warm[1]));
    const tension = prog(t, 0, 8.6);
    const toKnot = easeInOut(prog(t, 8.1, 9.0));
    const collapse = easeInOut(prog(t, PROMISE.ballForm[0], PROMISE.ballForm[1]));

    for (const s of strands) {
      const amp = 14 + 70 * tension;
      const wob = (k) => Math.sin(t * s.sp + s.ph + k) * amp * (1 - toKnot);
      const p = s.pts.map((q, k) => {
        const knotted = { x: lerp(q.x, s.knot[k].x, toKnot), y: lerp(q.y, s.knot[k].y, toKnot) };
        const loose = k === 0 || k === 3 ? knotted : { x: knotted.x + wob(k), y: knotted.y + wob(k + 2) };
        return { x: lerp(loose.x, KNOT.x, collapse), y: lerp(loose.y, KNOT.y, collapse) };
      });
      s.path.setAttribute('d', `M${p[0].x} ${p[0].y} C${p[1].x} ${p[1].y} ${p[2].x} ${p[2].y} ${p[3].x} ${p[3].y}`);
      const drawn = prog(t, s.hp.t, s.hp.paste);
      s.path.style.strokeDashoffset = 1 - drawn;
      s.path.style.opacity = drawn > 0 ? 0.82 * (1 - collapse) : 0;
    }

    const wf = 1 - easeInOut(prog(t, 8.0, 8.9));
    let pastes = 0;
    const got = [0, 0, 0];
    const lastPaste = [-9, -9, -9];
    for (const hp of hops) {
      if (t >= hp.paste) {
        pastes++;
        got[hp.to]++;
        lastPaste[hp.to] = hp.paste;
      }
    }
    wins.forEach((w, i) => {
      const jit = Math.sin(t * 23 + i * 2) * 3 * tension * wf;
      place(w.n, { o: wf * clamp(t / 0.5), x: jit, s: lerp(0.92, 1, wf) });
      const n = Math.min(6, got[i] + 1);
      w.bars.forEach((b, k) => {
        const grow = k === n - 1 ? easeOut(prog(t, lastPaste[i], lastPaste[i] + 0.35)) : 1;
        b.style.width = k < n ? `${b._w * (k === 0 ? 1 : grow)}%` : '0%';
      });
    });

    const cur = hops.findLast((hp) => hp.t <= t) || hops[0];
    const a = wins[cur.from];
    const b = wins[cur.to];
    const k = easeInOut(prog(t, cur.t, cur.paste));
    const cx = lerp(a.cx, b.cx, k) + 30;
    const cy = lerp(a.cy, b.cy, k) - Math.sin(Math.PI * k) * 60;
    place(cursor, { o: clamp(t / 0.4) * (1 - prog(t, 8.1, 8.4)), x: cx, y: cy });
    place(capC, { o: win(t, cur.t, cur.t + 0.32, 0.06) * wf, x: a.cx - 30, y: a.cy - 70, s: 1 });
    place(capV, { o: win(t, cur.paste, cur.paste + 0.32, 0.06) * wf, x: b.cx - 30, y: b.cy - 70, s: 1 });
    counter.textContent = `复制 → 粘贴 × ${pastes}`;
    counter.style.opacity = clamp(t - 1.2) * wf;

    place(line1, { o: win(t, 0.6, 4.1, 0.5), y: 10 * (1 - easeOut(prog(t, 0.6, 1.2))) });
    place(line2, { o: win(t, 4.4, 8.7, 0.5), y: 10 * (1 - easeOut(prog(t, 4.4, 5.0))) });
  }
  return { update };
}
