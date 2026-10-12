// ② Several people, several cats, one piece of work: Zhou (design) and Chen (after-sales) pin
// different notes on the model; cats answer at the pin; each person adopts; v1 becomes v2.
import { easeInOut, easeOut, h, lerp, place, prog, quad } from '../../../promo-kit/util.mjs';
import { avatar, catFace } from './cast.mjs';
import { MANY, PEOPLE, S } from './timeline.mjs';
import { lock, makeCursor } from './ui.mjs';

const PINS = [
  { n: 1, who: 'zhou', part: 'bodyRound', off: [0.57, 0.32, 0.1], at: MANY.zhouPin },
  { n: 2, who: 'chen', part: 'filter', off: [0, 0.18, 0], at: MANY.chenPin },
];

function msg(parent, face, text, sub) {
  const row = h('div', 'th-msg', parent);
  row.appendChild(face);
  const tx = h('div', 'tx', row, text);
  if (sub) h('small', '', tx, sub);
  return { row, face };
}
function pinDot(n, who) {
  const d = h('div', 'th-pin', null, String(n));
  d.style.background = PEOPLE[who].color;
  return d;
}
const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export function buildMany(stage, work) {
  const zone = h('div', 'rz threads', stage);
  const th1 = h('div', 'thread', zone);
  const z1 = msg(th1, pinDot(1, 'zhou'), '颜色和圆角要像我们家的。', '小周 · 设计 · 钉在外壳上');
  const s1 = msg(th1, catFace(null, 'shuo', 38), '品牌色换好了。圆角给你个滑杆，你来定。', '烁烁 · 改了外观');
  const a1 = h('div', 'th-acts', th1);
  const y1 = h('b', 'yes', a1, '采用这次修改');
  h('b', '', a1, '再改改');
  const slider = h('div', 'slider', th1, '圆角');
  const track = h('div', 'sl-track', slider);
  const fill = h('div', 'sl-fill', track);
  const knob = h('div', 'sl-knob', track);
  const val = h('div', 'sl-val', slider, '8 mm');

  const th2 = h('div', 'thread', zone);
  const c2 = msg(th2, pinDot(2, 'chen'), '拆开时把滤芯标出来，用户最常问。', '老陈 · 售后 · 钉在滤芯上');
  const x2 = msg(th2, catFace(null, 'xian', 38), '加了拆解动画，滤芯会亮。', '宪宪 · 写');
  const r2 = msg(th2, catFace(null, 'yan', 38), '审过：零件编号和尺寸对得上 ✓', '砚砚 · 审');
  const a2 = h('div', 'th-acts', th2);
  const y2 = h('b', 'yes', a2, '采用这次修改');
  h('b', '', a2, '再改改');
  const priv = h('div', 'privnote', zone);
  lock(priv);
  h('span', '', priv, '私人对话不进共享区，这里只有批注和改动');

  const pins = PINS.map((p) => {
    const el = h('div', 'pin', stage, String(p.n));
    el.style.background = PEOPLE[p.who].color;
    return { ...p, el };
  });
  const curZ = makeCursor(stage, 'zhou');
  const curC = makeCursor(stage, 'chen');

  function update(t) {
    const on = t >= S.many[0] && t < S.many[1] + 0.4;
    const zk = easeOut(prog(t, S.many[0] + 0.3, S.many[0] + 0.9));
    place(zone, { o: on ? zk * (1 - prog(t, S.many[1] - 0.4, S.many[1])) : 0, x: (1 - zk) * 30 });
    for (const p of pins) p.el.style.opacity = 0;
    curZ.style.opacity = 0;
    curC.style.opacity = 0;
    if (!on) return [];

    const fade = (el, at) => {
      const k = easeOut(prog(t, at, at + 0.4));
      place(el, { o: k, y: (1 - k) * 10 });
    };
    fade(th1, MANY.zhouPin + 0.1);
    fade(z1.row, MANY.zhouPin + 0.1);
    fade(s1.row, MANY.zhouReply);
    fade(a1, MANY.zhouReply + 0.6);
    fade(th2, MANY.chenPin + 0.1);
    fade(c2.row, MANY.chenPin + 0.1);
    fade(x2.row, MANY.chenReply);
    fade(r2.row, MANY.review);
    fade(a2, MANY.review + 0.6);
    fade(priv, MANY.v2 + 0.8);
    y1.classList.toggle('on', t >= MANY.zhouAdopt);
    y1.textContent = t >= MANY.zhouAdopt ? '已采用 · 小周' : '采用这次修改';
    y2.classList.toggle('on', t >= MANY.chenAdopt);
    y2.textContent = t >= MANY.chenAdopt ? '已采用 · 老陈' : '采用这次修改';
    slider.style.opacity = prog(t, MANY.zhouAdopt + 0.8, MANY.zhouAdopt + 1.2);
    const sk = easeInOut(prog(t, MANY.slider[0] + 0.3, MANY.slider[1]));
    fill.style.width = `${lerp(10, 80, sk)}%`;
    knob.style.left = `${lerp(10, 80, sk)}%`;
    val.textContent = `${Math.round(lerp(8, 24, sk))} mm`;

    // pins sit on the model and follow it as it turns
    const pinPos = {};
    for (const p of pins) {
      const q = work.project(p.part, p.off);
      pinPos[p.n] = q;
      const k = easeOut(prog(t, p.at, p.at + 0.35));
      p.el.style.opacity = k;
      p.el.style.transform = `translate(${q.x}px, ${q.y - 40}px) scale(${lerp(0.4, 1, k)})`;
    }
    const pz = pinPos[1];
    const pc = pinPos[2];
    const yb1 = center(y1);
    const yb2 = center(y2);
    const kc = center(knob);
    if (t < MANY.zhouAdopt - 1.2) curZ.move(t, { x: 640, y: 980 }, { x: pz.x + 6, y: pz.y - 18 }, MANY.zhouPin - 1.1, MANY.zhouPin - 0.1, MANY.zhouPin - 0.05, MANY.zhouPin + 0.8);
    else if (t < MANY.slider[0]) curZ.move(t, { x: 1080, y: 800 }, { x: yb1.x, y: yb1.y }, MANY.zhouAdopt - 1.0, MANY.zhouAdopt - 0.1, MANY.zhouAdopt);
    else curZ.move(t, { x: yb1.x, y: yb1.y }, { x: kc.x, y: kc.y }, MANY.slider[0] - 0.3, MANY.slider[0] + 0.3, MANY.slider[0] + 0.3, MANY.slider[1] + 0.6);
    if (t >= MANY.slider[0] + 0.3) {
      curZ.style.transform = `translate(${kc.x}px, ${kc.y}px)`;
    }
    if (t < MANY.chenAdopt - 1.2) curC.move(t, { x: 300, y: 980 }, { x: pc.x + 6, y: pc.y - 18 }, MANY.chenPin - 1.1, MANY.chenPin - 0.1, MANY.chenPin - 0.05, MANY.chenPin + 0.8);
    else curC.move(t, { x: 1080, y: 860 }, { x: yb2.x, y: yb2.y }, MANY.chenAdopt - 1.0, MANY.chenAdopt - 0.1, MANY.chenAdopt, MANY.chenAdopt + 0.8);

    // two balls at once: each note is its own piece of work, held by the cat answering it
    const balls = [];
    const ballFor = (pin, faces, at0, adopt) => {
      if (t < at0) return null;
      const k1 = easeInOut(prog(t, at0, at0 + 0.6));
      let p = quad(pin, { x: (pin.x + faces[0][0].x) / 2, y: Math.min(pin.y, faces[0][0].y) - 80 }, faces[0][0], k1);
      p = { x: p.x - 34 * k1, y: p.y };
      for (const [f, at] of faces.slice(1)) {
        const k = easeInOut(prog(t, at - 0.6, at));
        p = { x: lerp(p.x, f.x - 34, k), y: lerp(p.y, f.y, k) };
      }
      const back = easeInOut(prog(t, adopt, adopt + 0.8));
      return { x: lerp(p.x, pin.x, back), y: lerp(p.y, pin.y, back), rot: t * 40, r: 18, o: 1 - prog(t, adopt + 0.6, adopt + 1.0) };
    };
    balls.push(ballFor(pz, [[center(s1.face), MANY.zhouReply]], MANY.zhouReply - 0.6, MANY.zhouAdopt));
    balls.push(ballFor(pc, [[center(x2.face), MANY.chenReply], [center(r2.face), MANY.review]], MANY.chenReply - 0.6, MANY.chenAdopt));
    return balls.map((b) => b ?? { o: 0 });
  }
  return { update };
}
