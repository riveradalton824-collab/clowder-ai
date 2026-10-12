// S8「领养团队」: the ball leaves the thread, the family gathers around it,
// one yarn ties them together, and the brand closes on the relationship.
import { makeBall, makeFace, placeBall, updateFace } from './faces.mjs';
import { FINALE as F } from './timeline.mjs';
import { clamp, easeBack, easeInOut, easeOut, h, lerp, place, prog, quad, svg, win } from './util.mjs';

const CENTER = { x: 960, y: 420 };
const SPOTS = { xian: { x: 600, y: 410 }, yan: { x: 780, y: 250 }, shuo: { x: 1140, y: 250 }, momo: { x: 1320, y: 410 } };

export function buildFinale(stage, startAt) {
  const root = h('div', 'scene s-finale', stage);
  const layer = svg('svg', { class: 'layer', viewBox: '0 0 1920 1080' }, root);
  const ties = F.pops.map(({ who }) => {
    const s = SPOTS[who];
    const c = { x: (s.x + CENTER.x) / 2 + (s.x < CENTER.x ? -30 : 30), y: Math.max(s.y, CENTER.y) + 60 };
    return svg('path', { class: 'yarn tie', pathLength: 1, d: `M${CENTER.x} ${CENTER.y} Q${c.x} ${c.y} ${s.x} ${s.y}` }, layer);
  });
  const faces = F.pops.map(({ who, at }) => {
    const f = makeFace(root, who, 190, 'face finale-face');
    f.style.left = `${SPOTS[who].x - 95}px`;
    f.style.top = `${SPOTS[who].y - 95}px`;
    return { f, at };
  });
  const ball = makeBall(layer, 15);

  const tag = h('div', 'tagline', root);
  h('div', 'tagline-zh', tag, '领养团队，一起长出世界。');
  h('div', 'tagline-en', tag, 'Build AI teams, not just agents.');

  const end = h('div', 'endcard', root);
  const logo = h('img', 'end-logo', end);
  logo.src = '/site/assets/logo-transparent.png';
  logo.alt = '';
  h('div', 'end-name', end, 'Clowder AI');
  h('div', 'end-motto', end, 'Hard Rails. Soft Power. Shared Mission.');
  h('div', 'end-meta', end, '开源 · MIT · Claude · GPT · Gemini · opencode');
  h('div', 'end-url', end, 'zts212653.github.io/clowder-ai');
  const note = h('div', 'end-note', root, '示意动画 · Illustrated sequence');

  function update(t) {
    const on = t >= F.appOut[0];
    root.style.display = on ? '' : 'none';
    if (!on) return;
    const bk = easeInOut(prog(t, F.ballCenter[0], F.ballCenter[1]));
    const from = startAt(F.ballCenter[0]);
    const p = quad(from, { x: (from.x + CENTER.x) / 2, y: from.y - 160 }, CENTER, bk);
    const settle = easeOut(prog(t, F.endcard[0], F.endcard[0] + 1.2));
    placeBall(ball, p.x, lerp(p.y, CENTER.y - 70, settle), bk * 720, lerp(1, 2.6, bk) * lerp(1, 0.8, settle), 1);

    faces.forEach(({ f, at }, i) => {
      const k = clamp(easeBack(prog(t, at, at + 0.45)), 0, 1.2);
      place(f, { o: prog(t, at, at + 0.15), s: k * lerp(1, 0.78, settle), y: settle * -96 });
      updateFace(f, t, 'applied');
      ties[i].style.strokeDashoffset = 1 - easeInOut(prog(t, at, at + 0.7));
      ties[i].style.opacity = (t >= at ? 1 : 0) * (1 - settle);
    });
    const tk = easeOut(prog(t, F.tagline[0], F.tagline[0] + 0.8));
    place(tag, { o: win(t, F.tagline[0], F.tagline[1], 0.6), y: (1 - tk) * 18 });
    const ek = easeOut(prog(t, F.endcard[0] + 0.3, F.endcard[0] + 1.3));
    place(end, { o: ek, y: (1 - ek) * 18 });
    note.style.opacity = ek * 0.7;
    root.style.opacity = 1 - prog(t, F.endcard[1] - 0.5, F.endcard[1]);
  }
  return { update };
}
