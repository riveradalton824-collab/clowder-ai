// The prototype phone. ① Mindfn drags three buttons into an empty phone frame, 宪宪 wires them to
// the model, and it runs. ② Leslie spins v2, pulls the filter out with her finger and hands it on.
import { easeInOut, easeOut, h, lerp, place, prog, svg, win } from '../../../promo-kit/util.mjs';
import { avatar, catFace, handle } from './cast.mjs';
import { CLOUD, MANY, S } from './timeline.mjs';
import { makeCursor, say } from './ui.mjs';
import { VIEW } from './work.mjs';

const PH = { x: 1460, y: 150 };
const SCR = { x: PH.x + 16, y: PH.y + 16 }; // screen origin (stage px), 328×688
const CV = { y: 100, w: 328, h: 380 }; // the model view inside the screen
const CROP = { w: 600, h: 695 }; // the part of the work canvas the phone shows
const LABELS = ['转一转', '拆开', '换滤芯'];
const slotCenter = (i) => ({ x: SCR.x + 14 + i * 102.7 + 47.3, y: SCR.y + 512 + 25 });
const chipHome = (i) => ({ x: 1260, y: 400 + i * 84 });

export function buildProto(stage, work) {
  const phone = h('div', 'proto', stage);
  const scr = h('div', 'pr-scr', phone);
  const top = h('div', 'pr-top', scr, '咖啡机拆解说明书');
  const sub = h('span', '', top, `原型 · ${handle('mindfn')} 搭的`);
  const cv = h('canvas', 'pr-canvas', scr);
  cv.width = CV.w;
  cv.height = CV.h;
  const ctx = cv.getContext('2d');
  const slots = h('div', 'pr-slots', scr);
  const slotEls = LABELS.map((l) => h('i', '', slots, l));
  const wires = svg('svg', { class: 'pr-wires', width: 328, height: 688 }, scr);
  const wireEls = LABELS.map((_, i) => svg('path', { d: `M${14 + i * 102.7 + 47.3} 512 Q${164 + (i - 1) * 40} 470 164 300`, fill: 'none', stroke: '#c46a4d', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' }, wires));
  const ok = h('div', 'pr-ok', scr, '能跑了 ✓');
  const chips = LABELS.map((l) => h('div', 'pr-btn', stage, l));
  const catBadge = h('div', 'pr-cat', stage);
  catBadge.appendChild(catFace(null, 'xian', 44));
  const mind = makeCursor(stage, 'mindfn');
  const mindSay = say(stage, 'mindfn', '原型能跑了，你们转转看。');
  mindSay.querySelector('.say-body').style.maxWidth = '250px';

  const finger = makeCursor(stage, 'leslie', 'finger');
  const lesSay = say(stage, 'leslie', '你也拆一次。');
  const taker = h('div', 'taker', stage);
  taker.appendChild(avatar(null, 'zlz', 46));
  h('div', 'p-name', taker, `${handle('zlz')} 接过手机`);
  const zFinger = makeCursor(stage, 'zlz', 'finger');

  function drawModel() {
    ctx.clearRect(0, 0, CV.w, CV.h);
    ctx.drawImage(work.canvas, (VIEW.w - CROP.w) / 2, (VIEW.h - CROP.h) / 2, CROP.w, CROP.h, 0, 0, CV.w, CV.h);
  }
  /** Where a model part shows up on the phone (stage px), following the phone's own transform. */
  function onPhone(part, off, d) {
    const p = work.project(part, off);
    const k = CV.w / CROP.w;
    const lx = SCR.x + (p.x - VIEW.x - (VIEW.w - CROP.w) / 2) * k;
    const ly = SCR.y + CV.y + (p.y - VIEW.y - (VIEW.h - CROP.h) / 2) * k;
    return { x: lx + d.x, y: ly + d.y };
  }

  function update(t) {
    const inOne = t >= CLOUD.proto[0] && t < S.cloud[1] + 0.2;
    const inTwo = t >= MANY.phone[0] - 0.6 && t < S.many[1] + 0.2;
    for (const n of [mind, finger, zFinger]) n.style.opacity = 0;
    for (const n of [...chips, catBadge, mindSay, lesSay, taker]) n.style.opacity = 0;
    if (!inOne && !inTwo) {
      phone.style.opacity = 0;
      return [];
    }
    const balls = [];
    if (inOne) {
      const k = easeOut(prog(t, CLOUD.proto[0], CLOUD.proto[0] + 0.6));
      place(phone, { o: k * (1 - prog(t, S.cloud[1] - 0.3, S.cloud[1])), x: (1 - k) * 60 });
      sub.textContent = `原型 · ${handle('mindfn')} 搭的`;
      // Mindfn drags each button into the empty frame
      CLOUD.buttons.forEach((b, i) => {
        const from = chipHome(i);
        const to = slotCenter(i);
        const dk = easeInOut(prog(t, b - 0.2, b + 0.4));
        place(chips[i], { o: dk < 1 ? prog(t, CLOUD.proto[0] + 0.3, CLOUD.proto[0] + 0.6) : 0, x: lerp(from.x, to.x, dk) - 48, y: lerp(from.y, to.y, dk) - 25, s: dk > 0 ? 1.06 : 1 });
        slotEls[i].classList.toggle('filled', dk >= 1);
        if (t >= b - 0.6 && t < b + 0.4) {
          const grab = easeInOut(prog(t, b - 0.6, b - 0.2));
          const prev = i ? slotCenter(i - 1) : { x: 1240, y: 800 };
          const p = t < b - 0.2 ? { x: lerp(prev.x, from.x, grab), y: lerp(prev.y, from.y, grab) } : { x: lerp(from.x, to.x, dk), y: lerp(from.y, to.y, dk) };
          mind.at({ x: p.x + 10, y: p.y + 6 });
        }
      });
      if (t >= CLOUD.buttons[2] + 0.4) {
        const s3 = slotCenter(0);
        mind.move(t, slotCenter(2), s3, CLOUD.runs - 0.2, CLOUD.runs + 0.2, CLOUD.runs + 0.25, S.cloud[1] - 0.3);
      }
      // 宪宪 wires them to the model; then it runs
      wireEls.forEach((w, i) => {
        const wk = prog(t, CLOUD.wire + i * 0.15, CLOUD.wire + i * 0.15 + 0.45);
        w.setAttribute('opacity', wk > 0 ? 1 : 0);
        w.setAttribute('stroke-dashoffset', (1 - wk) * 200 - t * 20);
      });
      place(catBadge, { o: win(t, CLOUD.wire - 0.2, CLOUD.runs + 0.6, 0.3), x: SCR.x + 230, y: SCR.y + 430 });
      ok.style.opacity = prog(t, CLOUD.runs, CLOUD.runs + 0.3);
      const sk = easeOut(prog(t, CLOUD.runs + 0.5, CLOUD.runs + 0.9));
      place(mindSay, { o: sk * (1 - prog(t, S.cloud[1] - 0.6, S.cloud[1] - 0.2)), x: 1150, y: 620 + (1 - sk) * 10 });
      balls.push({ x: PH.x + 330, y: PH.y + 750, rot: t * 30, o: prog(t, CLOUD.proto[0] + 0.3, CLOUD.proto[0] + 0.8) * (1 - prog(t, S.cloud[1] - 0.4, S.cloud[1])) });
    } else {
      // ② v2 on Leslie's phone: spin, pull the filter out, hand it to the next person
      const k = easeOut(prog(t, MANY.phone[0] - 0.6, MANY.phone[0]));
      const hk = easeInOut(prog(t, MANY.handoff[0], MANY.handoff[1]));
      const d = { x: (1 - k) * 80 - hk * 170, y: hk * 50 };
      place(phone, { o: k * (1 - prog(t, S.many[1] - 0.3, S.many[1])), x: d.x, y: d.y, r: -7 * hk, s: lerp(1, 0.94, hk) });
      sub.textContent = 'v2 · 2 处意见已采用';
      for (const el of slotEls) el.classList.add('filled');
      wireEls.forEach((w) => w.setAttribute('opacity', 0));
      ok.style.opacity = 0;
      if (t < MANY.pull[0]) {
        finger.move(t, { x: SCR.x + 80, y: SCR.y + CV.y + 300 }, { x: SCR.x + 250, y: SCR.y + CV.y + 300 }, MANY.phone[0] + 0.6, MANY.phone[0] + 2.4, null, MANY.pull[0]);
      } else if (t < MANY.handoff[0]) {
        const pk = easeInOut(prog(t, MANY.pull[0], MANY.pull[1]));
        finger.at(onPhone('filter', [0, 0.1, 0], d), 1);
        finger.style.transform += ` scale(${pk > 0 && pk < 1 ? 0.9 : 1})`;
      }
      const lk = easeOut(prog(t, MANY.pull[1] + 0.2, MANY.pull[1] + 0.6));
      place(lesSay, { o: lk * (1 - prog(t, MANY.handoff[0] + 0.2, MANY.handoff[0] + 0.5)), x: 1150, y: 540 + (1 - lk) * 10 });
      place(taker, { o: prog(t, MANY.handoff[0] - 0.4, MANY.handoff[0]), y: 0 });
      if (t >= MANY.handoff[1] + 0.4) zFinger.at({ x: slotCenter(1).x + d.x - 8, y: slotCenter(1).y + d.y + 6 }, prog(t, MANY.handoff[1] + 0.4, MANY.handoff[1] + 0.7));
    }
    if (phone.style.opacity > 0) drawModel();
    return balls;
  }
  return { update };
}
