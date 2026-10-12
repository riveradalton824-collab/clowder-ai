// ② Several people, several cats, one piece of work: Yukina (design) and Leslie (user support) pin
// different notes on the model; cats answer at the pin; Yukina drags the corner radius herself, Whut
// drags the teardown spacing on his own machine; each person adopts their own edit; v1 becomes v2.
import { easeInOut, easeOut, h, lerp, place, prog, quad } from '../../../promo-kit/util.mjs';
import { catFace, handle, personColor } from './cast.mjs';
import { MANY, S } from './timeline.mjs';
import { lock, makeCursor } from './ui.mjs';

// pin 1 sits on the shell's front-upper-left, where nothing inside shows through once it turns glassy
const PINS = [
  { n: 1, who: 'yukina', part: 'bodyRound', off: [-0.36, 0.42, 0.51], at: MANY.yukPin },
  { n: 2, who: 'leslie', part: 'filter', off: [0, 0.18, 0], at: MANY.lesPin },
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
  d.style.background = personColor(who);
  return d;
}
function sliderRow(parent, label, unit) {
  const row = h('div', 'slider', parent, label);
  const track = h('div', 'sl-track', row);
  const fill = h('div', 'sl-fill', track);
  const knob = h('div', 'sl-knob', track);
  const val = h('div', 'sl-val', row, unit);
  return { row, fill, knob, val };
}
const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export function buildMany(stage, work) {
  const zone = h('div', 'rz threads', stage);
  const th1 = h('div', 'thread', zone);
  const z1 = msg(th1, pinDot(1, 'yukina'), '颜色和圆角要像我们家的。', `${handle('yukina')} · 钉在外壳上`);
  const s1 = msg(th1, catFace(null, 'shuo', 38), '品牌色换好了。圆角给你个滑杆，你来定。', '烁烁 · 改了外观');
  const sl1 = sliderRow(th1, '圆角', '8 mm');
  const a1 = h('div', 'th-acts', th1);
  const y1 = h('b', 'yes', a1, '采用这次修改');
  h('b', '', a1, '再改改');

  const th2 = h('div', 'thread', zone);
  const c2 = msg(th2, pinDot(2, 'leslie'), '拆开时把滤芯标出来，用户最常问。', `${handle('leslie')} · 钉在滤芯上`);
  const x2 = msg(th2, catFace(null, 'xian', 38), '加了拆解动画，滤芯会亮。', '宪宪 · 写');
  const r2 = msg(th2, catFace(null, 'yan', 38), '审过：零件编号和尺寸对得上 ✓', '砚砚 · 审');
  const a2 = h('div', 'th-acts', th2);
  const y2 = h('b', 'yes', a2, '采用这次修改');
  h('b', '', a2, '再改改');
  const priv = h('div', 'privnote', zone);
  lock(priv);
  h('span', '', priv, '私人对话不进共享区，这里只有批注和改动');

  // Whut tunes the teardown on his own machine
  const lap = h('div', 'rz panel lap', stage);
  h('div', 'panel-h', lap, `${handle('whut')} 的电脑 · 调拆解动画`);
  const sl2 = sliderRow(h('div', 'panel-b', lap), '拆开间距', '0 mm');
  const lapNote = h('div', 'lap-note', lap, '按装配顺序拆');

  const pins = PINS.map((p) => {
    const el = h('div', 'pin', stage, String(p.n));
    el.style.background = personColor(p.who);
    return { ...p, el };
  });
  const curY = makeCursor(stage, 'yukina');
  const curL = makeCursor(stage, 'leslie');
  const curW = makeCursor(stage, 'whut');

  function update(t) {
    const on = t >= S.many[0] && t < MANY.phone[0] + 0.2;
    const zk = easeOut(prog(t, S.many[0] + 0.3, S.many[0] + 0.9));
    const out = 1 - prog(t, MANY.phone[0] - 0.6, MANY.phone[0]);
    place(zone, { o: on ? zk * out : 0, x: (1 - zk) * 30 });
    const lk = easeOut(prog(t, MANY.spacing[0] - 0.6, MANY.spacing[0]));
    place(lap, { o: on ? lk * out : 0, y: (1 - lk) * 20 });
    for (const p of pins) p.el.style.opacity = 0;
    for (const c of [curY, curL, curW]) c.style.opacity = 0;
    if (!on) return [];

    const fade = (el, at) => {
      const k = easeOut(prog(t, at, at + 0.4));
      place(el, { o: k, y: (1 - k) * 10 });
    };
    fade(th1, MANY.yukPin + 0.1);
    fade(z1.row, MANY.yukPin + 0.1);
    fade(s1.row, MANY.shuoReply);
    fade(sl1.row, MANY.slider[0] - 0.4);
    fade(a1, MANY.slider[1]);
    fade(th2, MANY.lesPin + 0.1);
    fade(c2.row, MANY.lesPin + 0.1);
    fade(x2.row, MANY.xianReply);
    fade(r2.row, MANY.review);
    fade(a2, MANY.review + 0.6);
    fade(priv, MANY.review + 0.9);
    y1.classList.toggle('on', t >= MANY.yukAdopt);
    y1.textContent = t >= MANY.yukAdopt ? `已采用 · ${handle('yukina')}` : '采用这次修改';
    y2.classList.toggle('on', t >= MANY.lesAdopt);
    y2.textContent = t >= MANY.lesAdopt ? `已采用 · ${handle('leslie')}` : '采用这次修改';
    const k1 = easeInOut(prog(t, MANY.slider[0] + 0.3, MANY.slider[1]));
    sl1.fill.style.width = `${lerp(10, 80, k1)}%`;
    sl1.knob.style.left = `${lerp(10, 80, k1)}%`;
    sl1.val.textContent = `${Math.round(lerp(8, 24, k1))} mm`;
    const k2 = easeInOut(prog(t, MANY.spacing[0] + 0.3, MANY.spacing[1]));
    sl2.fill.style.width = `${lerp(4, 82, k2)}%`;
    sl2.knob.style.left = `${lerp(4, 82, k2)}%`;
    sl2.val.textContent = `${Math.round(lerp(0, 60, k2))} mm`;
    lapNote.style.opacity = prog(t, MANY.spacing[1] - 0.4, MANY.spacing[1]);

    // pins sit on the model and follow it as it turns
    const pinPos = {};
    for (const p of pins) {
      const q = work.project(p.part, p.off);
      pinPos[p.n] = q;
      const k = easeOut(prog(t, p.at, p.at + 0.35));
      p.el.style.opacity = k * out;
      p.el.style.transform = `translate(${q.x}px, ${q.y - 40}px) scale(${lerp(0.4, 1, k)})`;
    }
    const p1 = pinPos[1];
    const p2 = pinPos[2];
    const b1 = center(y1);
    const b2 = center(y2);
    const kn1 = center(sl1.knob);
    const kn2 = center(sl2.knob);
    // Yukina: pin → drag her own slider → adopt her own edit
    if (t < MANY.slider[0] - 0.6) curY.move(t, { x: 640, y: 980 }, { x: p1.x + 6, y: p1.y - 18 }, MANY.yukPin - 1.1, MANY.yukPin - 0.1, MANY.yukPin - 0.05, MANY.yukPin + 0.8);
    else if (t < MANY.slider[1] + 0.1) {
      curY.move(t, { x: 1080, y: 760 }, kn1, MANY.slider[0] - 0.6, MANY.slider[0] + 0.3, null, MANY.yukAdopt + 0.8);
      if (t >= MANY.slider[0] + 0.3) curY.at(kn1);
    } else curY.move(t, kn1, b1, MANY.slider[1] + 0.1, MANY.yukAdopt - 0.1, MANY.yukAdopt, MANY.yukAdopt + 0.8);
    // Leslie: pin → adopt her own edit
    if (t < MANY.lesAdopt - 1.2) curL.move(t, { x: 300, y: 980 }, { x: p2.x + 6, y: p2.y - 18 }, MANY.lesPin - 1.1, MANY.lesPin - 0.1, MANY.lesPin - 0.05, MANY.lesPin + 0.8);
    else curL.move(t, { x: 1080, y: 860 }, b2, MANY.lesAdopt - 1.0, MANY.lesAdopt - 0.1, MANY.lesAdopt, MANY.lesAdopt + 0.8);
    // Whut: drags the spacing on his own machine
    curW.move(t, { x: kn2.x - 200, y: kn2.y + 90 }, kn2, MANY.spacing[0] - 0.5, MANY.spacing[0] + 0.3, null, MANY.spacing[1] + 0.6);
    if (t >= MANY.spacing[0] + 0.3 && t < MANY.spacing[1] + 0.6) curW.at(kn2);

    // two balls at once: each note is its own piece of work, held by the cat answering it
    const ballFor = (pin, faces, at0, adopt) => {
      if (t < at0) return null;
      const k1b = easeInOut(prog(t, at0, at0 + 0.6));
      let p = quad(pin, { x: (pin.x + faces[0][0].x) / 2, y: Math.min(pin.y, faces[0][0].y) - 80 }, faces[0][0], k1b);
      p = { x: p.x - 34 * k1b, y: p.y };
      for (const [f, at] of faces.slice(1)) {
        const k = easeInOut(prog(t, at - 0.6, at));
        p = { x: lerp(p.x, f.x - 34, k), y: lerp(p.y, f.y, k) };
      }
      const back = easeInOut(prog(t, adopt, adopt + 0.8));
      return { x: lerp(p.x, pin.x, back), y: lerp(p.y, pin.y, back), rot: t * 40, r: 18, o: 1 - prog(t, adopt + 0.6, adopt + 1.0) };
    };
    return [
      ballFor(p1, [[center(s1.face), MANY.shuoReply]], MANY.shuoReply - 0.6, MANY.yukAdopt) ?? { o: 0 },
      ballFor(p2, [[center(x2.face), MANY.xianReply], [center(r2.face), MANY.review]], MANY.xianReply - 0.6, MANY.lesAdopt) ?? { o: 0 },
    ];
  }
  return { update };
}
