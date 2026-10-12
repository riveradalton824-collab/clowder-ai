// S2「一根线」: a cat pops up, the knot becomes a yarn ball, and the cats pass it
// along the café counter by themselves. Then the ball flies into the product.
import { makeBall, makeFace, placeBall, updateFace } from './faces.mjs';
import { KNOT } from './scene-open.mjs';
import { PROMISE as P } from './timeline.mjs';
import { easeBack, easeBounce, easeInOut, easeOut, h, lerp, place, prog, quad, svg, win } from '../../../promo-kit/util.mjs';

const COUNTER_Y = 770;
const R = 26;
const BALL_Y = COUNTER_Y - R + 2;
const SPOTS = { xian: 700, shuo: 1000, yan: 1300 };
const STOPS = { drop: 900, yan: 1150, shuo: 1000 };

export function buildPromise(stage, flyTarget) {
  const root = h('div', 'scene s-promise', stage);
  const faces = {};
  for (const who of ['xian', 'shuo', 'yan']) {
    faces[who] = makeFace(root, who, 300, 'face promise-face');
    faces[who].style.left = `${SPOTS[who] - 150}px`;
    faces[who].style.top = `${COUNTER_Y - 300 + 40}px`;
  }
  const counter = h('div', 'counter-top', root);
  counter.style.top = `${COUNTER_Y}px`;
  const layer = svg('svg', { class: 'layer', viewBox: '0 0 1920 1080' }, root);
  const trail1 = svg('path', { class: 'yarn', pathLength: 1, d: wavy(STOPS.drop, STOPS.yan) }, layer);
  const trail2 = svg('path', { class: 'yarn', pathLength: 1, d: wavy(STOPS.yan, STOPS.shuo) }, layer);
  const ball = makeBall(layer, R);

  const q = h('div', 'promise-q', root, '如果，它们自己会接力呢？');
  const brand = h('div', 'brand', root);
  const logo = h('img', 'brand-logo', brand);
  logo.src = '/site/assets/logo-transparent.png';
  logo.alt = '';
  h('div', 'brand-name', brand, 'Clowder AI');
  h('div', 'brand-sub', brand, '把孤立的 AI，变成一支团队。');

  function popIn(face, t, [t0, t1], tilt) {
    const k = easeBack(prog(t, t0, t1));
    const out = easeInOut(prog(t, P.fly[0], P.fly[0] + 0.6));
    place(face, { o: t >= t0 ? 1 - out : 0, y: lerp(300, 0, k) + out * 60, r: tilt });
  }
  const bat = (t, at) => Math.sin(Math.PI * prog(t, at, at + 0.3)) * -12;

  function update(t) {
    const on = t >= P.warm[0] && t < P.fly[1] + 0.1;
    root.style.display = on ? '' : 'none';
    if (!on) return;
    popIn(faces.xian, t, P.xianIn, bat(t, 11.2) * -1);
    popIn(faces.yan, t, P.yanIn, bat(t, 12.85));
    popIn(faces.shuo, t, P.shuoIn, 0);
    updateFace(faces.xian, t, t < P.ballForm[1] ? 'drilled' : 'applied');
    updateFace(faces.yan, t, t >= P.yanCatch && t < P.yanCatch + 0.6 ? 'drilled' : 'applied');
    updateFace(faces.shuo, t, 'applied');
    counter.style.opacity = easeOut(prog(t, 9.9, 10.6)) * (1 - prog(t, P.fly[0], P.fly[0] + 0.6));

    // Ball: forms from the knot, drops to the counter, rolls twice, then flies.
    let x = STOPS.drop;
    let y = BALL_Y;
    let s = 1;
    let rot = 0;
    const form = easeBack(prog(t, P.ballForm[0], P.ballForm[1]));
    if (t < P.ballForm[1]) {
      x = KNOT.x;
      y = KNOT.y;
      s = form;
    } else if (t < P.ballForm[1] + 0.6) {
      const k = prog(t, P.ballForm[1], P.ballForm[1] + 0.6);
      x = lerp(KNOT.x, STOPS.drop, easeOut(k));
      y = lerp(KNOT.y, BALL_Y, easeBounce(k));
    } else if (t < P.roll2[0]) {
      x = lerp(STOPS.drop, STOPS.yan, easeInOut(prog(t, P.roll1[0], P.roll1[1])));
    } else {
      x = lerp(STOPS.yan, STOPS.shuo, easeInOut(prog(t, P.roll2[0], P.roll2[1])));
    }
    rot = ((x - STOPS.drop) / R) * (180 / Math.PI);
    if (t >= P.fly[0]) {
      const k = easeInOut(prog(t, P.fly[0], P.fly[1]));
      const dst = flyTarget();
      const p = quad({ x: STOPS.shuo, y: BALL_Y }, { x: (STOPS.shuo + dst.x) / 2, y: 120 }, dst, k);
      x = p.x;
      y = p.y;
      s = lerp(1, 15 / R, k);
      rot += k * 540;
    }
    placeBall(ball, x, y, rot, Math.max(s, 0.001), t >= P.ballForm[0] ? 1 : 0);
    trail1.style.strokeDashoffset = 1 - easeInOut(prog(t, P.roll1[0], P.roll1[1]));
    trail2.style.strokeDashoffset = 1 - easeInOut(prog(t, P.roll2[0], P.roll2[1]));
    const trailOut = 1 - prog(t, P.fly[0], P.fly[0] + 0.5);
    trail1.style.opacity = trailOut;
    trail2.style.opacity = trailOut;

    place(q, { o: win(t, P.question[0], P.question[1], 0.5), y: 12 * (1 - easeOut(prog(t, P.question[0], 11.4))) });
    const bk = easeOut(prog(t, P.brand[0], P.brand[0] + 0.7));
    place(brand, { o: win(t, P.brand[0], P.brand[1], 0.5), y: 16 * (1 - bk), s: lerp(0.97, 1, bk) });
  }
  return { update };
}

function wavy(x0, x1) {
  const y = COUNTER_Y - 3;
  const n = 6;
  let d = `M${x0} ${y}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(x0, x1, i / n);
    const cx = lerp(x0, x1, (i - 0.5) / n);
    d += ` Q${cx} ${y + (i % 2 ? 5 : -5)} ${x} ${y}`;
  }
  return d;
}
