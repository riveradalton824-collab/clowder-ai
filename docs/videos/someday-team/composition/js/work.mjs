// The shared work: one card, one real 3D model, and everything the film does to it —
// clay → v1 → true size → brand + round → teardown → only user parts public → practice rounds.
import { clamp, easeBack, easeInOut, easeOut, h, lerp, place, prog, stateAt, svg } from '../../../promo-kit/util.mjs';
import { avatar, catFace } from './cast.mjs';
import { createModel } from './model.mjs';
import { CATS, CLOUD, GROW, JUDGE, MANY, PEOPLE, S, SKETCH, TURN, VERSIONS } from './timeline.mjs';

export const VIEW = { x: 100, y: 194, w: 1000, h: 716 };
const V1 = [1.2, 0.84, 1.0];
const PRACTICE_ROT = -0.42;
// Corners (world units, relative to the base part) whose screen box the size brackets wrap.
const BOX = [];
for (const x of [-0.6, 0.6]) for (const z of [-0.84, 0.74]) for (const y of [-0.09, 1.38]) BOX.push([x, y, z]);
const LABELS = [
  { part: 'filter', off: [0, 0.32, 0], text: '滤芯 · 用户可换', from: MANY.glow[0] + 0.4, cls: 'hot' },
  { part: 'tank', off: [0, 0.46, -0.13], text: '水箱 · 用户可换', from: JUDGE.hideCore[1] - 0.4 },
  { part: 'tray', off: [0.42, 0, 0.2], text: '滴水盘 · 用户可换', from: JUDGE.hideCore[1] },
  { part: 'boiler', off: [0.2, 0.1, 0], text: '核心结构 · 不公开', from: JUDGE.hideCore[0] + 0.6, cls: 'muted' },
];
const inPractice = (t) => t >= GROW.montage1[0] - 0.8;

/** Every model parameter as a pure function of t. */
export function modelAt(t) {
  if (inPractice(t)) {
    const v = stateAt(VERSIONS.map((x) => [x.at, x]), Math.max(t, VERSIONS[0].at)).value;
    const tt = t >= GROW.freeze[0] && t < GROW.montage2[0] ? GROW.freeze[0] : t;
    return {
      grow: lerp(0.25, 1, prog(t, GROW.montage1[0] - 0.8, GROW.montage1[0])),
      clay: 1,
      prop: v.prop,
      skew: v.skew,
      rotY: PRACTICE_ROT,
      pulse: 1 - prog(tt, v.at, v.at + 0.3),
    };
  }
  const snap = prog(t, CLOUD.snap[0], CLOUD.snap[1]);
  const spin = (easeInOut(prog(t, CLOUD.runs + 0.4, CLOUD.runs + 2.6)) + easeInOut(prog(t, MANY.phone[0] + 0.6, MANY.phone[0] + 2.4))) * Math.PI * 2;
  const k = easeBack(snap);
  return {
    grow: prog(t, CLOUD.blob[0], CLOUD.blob[1]),
    clay: 1 - snap,
    prop: V1.map((a) => lerp(a, 1, k)),
    pulse: Math.sin(Math.PI * clamp(snap * 1.5)),
    brand: easeOut(prog(t, MANY.brand[0], MANY.brand[1])),
    round: t >= (MANY.slider[0] + MANY.slider[1]) / 2 ? 1 : 0,
    explode: easeInOut(prog(t, MANY.spacing[0] + 0.3, MANY.spacing[1])),
    pull: easeInOut(prog(t, MANY.pull[0], MANY.pull[1])) * (1 - easeInOut(prog(t, MANY.hold[0], MANY.hold[0] + 1.2))),
    glow: prog(t, MANY.glow[0], MANY.glow[1]) * (0.85 + 0.15 * Math.sin(t * 3)),
    hideCore: easeInOut(prog(t, JUDGE.hideCore[0], JUDGE.hideCore[1])),
    rotY: -0.55 + 0.32 * Math.sin((t - S.cloud[0]) * 0.21) + spin,
  };
}

export function workShown(t) {
  return prog(t, TURN.toWork[0] + 0.75, TURN.toWork[1]) * (1 - prog(t, GROW.toWall[0], GROW.toWall[0] + 0.8));
}

export function buildWork(stage) {
  const root = h('div', 'scene work', stage);
  const card = h('div', 'wcard', root);
  const head = h('div', 'w-head', card);
  const title = h('div', 'w-title', head);
  const tZh = h('b', '', title, '共同作品 · 咖啡机 3D 拆解说明书');
  const tEn = h('span', '', title, 'Shared work');
  const ver = h('div', 'w-ver', head, 'v1');
  const verNote = h('div', 'w-vnote', head, '');
  const team = h('div', 'w-team', head);
  for (const w of Object.keys(PEOPLE)) team.appendChild(avatar(null, w, 30));
  for (const w of Object.keys(CATS)) team.appendChild(catFace(null, w, 30));
  const cloudTag = h('div', 'w-cloud', head, '团队云 · 有权限的人都能看');

  const vp = h('div', 'viewport', card);
  const canvas = h('canvas', 'w-canvas', vp);
  const model = createModel(canvas, VIEW.w, VIEW.h);
  const ghost = h('canvas', 'w-ghost', vp);
  ghost.width = VIEW.w;
  ghost.height = VIEW.h;
  const flash = h('div', 'w-flash', vp);
  const dimsSvg = svg('svg', { class: 'w-dims', width: VIEW.w, height: VIEW.h }, vp);
  const bracket = (labelText, anchor) => {
    const line = svg('path', { fill: 'none', stroke: '#4d7fa3', 'stroke-width': 2.5 }, dimsSvg);
    const lab = svg('text', { fill: '#2f5876', 'font-size': 24, 'font-weight': 700, 'text-anchor': anchor }, dimsSvg);
    lab.textContent = labelText;
    return { line, lab };
  };
  const hBr = bracket('高 380 mm', 'start');
  const wBr = bracket('宽 300 · 深 330 mm', 'middle');
  const labels = LABELS.map((l) => ({ ...l, el: h('div', `w-label ${l.cls ?? ''}`, vp, l.text) }));
  const v1note = h('div', 'w-sticky', vp, 'v1 · 照 @YukinaXSer 的稿子捏 · 尺寸靠猜');
  // her strokes, traced behind the clay while the cloud sculpts from them
  const trace = svg('svg', { class: 'w-trace', width: VIEW.w, height: VIEW.h }, vp);
  const tg = svg('g', { transform: 'translate(14 81) scale(1.56 2.6)' }, trace);
  for (const d of SKETCH) svg('path', { d, fill: 'none', stroke: '#2d2a26', 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tg);
  const sculpt = h('div', 'w-sculpt', vp);
  sculpt.appendChild(catFace(null, 'xian', 40));
  h('span', '', sculpt, '宪宪 · 在云上照着稿子捏');

  // practice HUD (④)
  const hud = h('div', 'w-hud', vp);
  const round = h('div', 'hud-round', hud);
  const score = h('div', 'hud-score', hud);
  const bars = h('div', 'hud-bars', hud);
  const barEls = VERSIONS.map(() => h('i', '', bars));
  const ref = h('div', 'hud-ref', vp, '虚线：真实轮廓（按 @whutzefengxie-ops 给的尺寸）');
  const oops = h('div', 'w-oops', vp, '歪嘴了');

  // the reference silhouette for practice, drawn once from the true-size model
  model.update({ grow: 1, clay: 1, rotY: PRACTICE_ROT });
  {
    const tmp = document.createElement('canvas');
    tmp.width = VIEW.w;
    tmp.height = VIEW.h;
    const tc = tmp.getContext('2d');
    tc.drawImage(canvas, 0, 0);
    const a = tc.getImageData(0, 0, VIEW.w, VIEW.h).data;
    const gc = ghost.getContext('2d');
    const out = gc.createImageData(VIEW.w, VIEW.h);
    const on = (x, y) => a[(y * VIEW.w + x) * 4 + 3] > 90;
    for (let y = 2; y < VIEW.h - 2; y++) {
      for (let x = 2; x < VIEW.w - 2; x++) {
        if (!on(x, y)) continue;
        if (on(x - 2, y) && on(x + 2, y) && on(x, y - 2) && on(x, y + 2)) continue;
        if (Math.floor((x + y) / 9) % 2) continue;
        const i = (y * VIEW.w + x) * 4;
        out.data.set([47, 110, 160, 235], i);
      }
    }
    gc.putImageData(out, 0, 0);
  }

  const project = (name, off) => {
    const p = model.project(name, off);
    return { x: VIEW.x + p.x, y: VIEW.y + p.y };
  };

  function update(t) {
    const shown = workShown(t);
    root.style.visibility = shown > 0 ? 'visible' : 'hidden';
    if (shown <= 0) return;
    const k = easeOut(prog(t, TURN.toWork[0] + 0.75, TURN.toWork[1]));
    root.style.opacity = shown;
    root.style.transform = `scale(${lerp(0.94, 1, k)})`;
    const p = modelAt(t);
    model.update(p);
    const practice = inPractice(t);

    tZh.textContent = practice ? '练习场 · 宪宪自己练捏模' : '共同作品 · 咖啡机 3D 拆解说明书';
    tEn.textContent = practice ? 'Practice' : 'Shared work';
    ver.textContent = t >= MANY.v2 ? 'v2' : 'v1';
    ver.style.opacity = !practice && t >= CLOUD.v1Note[0] ? 1 : 0;
    ver.classList.toggle('up', t >= MANY.v2 && t < MANY.v2 + 0.6);
    verNote.textContent = t >= JUDGE.pick ? '公开范围：@LeslieKuo 定' : t >= MANY.v2 ? '2 处意见已采用' : t >= CLOUD.snap[0] ? '真实尺寸' : '';
    verNote.style.opacity = practice ? 0 : 1;
    team.style.opacity = practice ? 0 : 1;
    cloudTag.style.opacity = practice ? 0 : 1;
    trace.style.opacity = 0.32 * Math.min(prog(t, CLOUD.sketch[1] - 0.3, CLOUD.blob[0] + 0.3), 1 - prog(t, CLOUD.v1Note[1] - 0.6, CLOUD.v1Note[1]));
    sculpt.style.opacity = Math.min(prog(t, CLOUD.blob[0] - 0.2, CLOUD.blob[0] + 0.3), 1 - prog(t, CLOUD.ballDown[0], CLOUD.ballDown[0] + 0.5));
    v1note.style.opacity = Math.min(prog(t, CLOUD.v1Note[0], CLOUD.v1Note[0] + 0.4), 1 - prog(t, CLOUD.snap[0], CLOUD.snap[0] + 0.4));
    vp.classList.toggle('practice', practice);
    flash.style.opacity = Math.max(1 - prog(t, CLOUD.snap[0], CLOUD.snap[0] + 0.5), 0) * (t >= CLOUD.snap[0] ? 0.7 : 0) + (practice ? 1 - prog(t, GROW.montage1[0] - 0.8, GROW.montage1[0] - 0.3) : 0) * 0.9;

    const dk = Math.min(prog(t, CLOUD.snap[0] + 0.4, CLOUD.snap[0] + 1.0), 1 - prog(t, S.cloud[1] - 0.6, S.cloud[1]));
    dimsSvg.style.opacity = dk;
    if (dk > 0) {
      const pts = BOX.map((o) => model.project('base', o));
      const x0 = Math.min(...pts.map((q) => q.x));
      const x1 = Math.max(...pts.map((q) => q.x));
      const y0 = Math.min(...pts.map((q) => q.y));
      const y1 = Math.max(...pts.map((q) => q.y));
      const hx = x1 + 30;
      hBr.line.setAttribute('d', `M${hx - 8} ${y0} H${hx + 8} M${hx} ${y0} V${y1} M${hx - 8} ${y1} H${hx + 8}`);
      hBr.lab.setAttribute('x', hx + 16);
      hBr.lab.setAttribute('y', (y0 + y1) / 2 + 8);
      const wy = y1 + 24;
      wBr.line.setAttribute('d', `M${x0} ${wy - 8} V${wy + 8} M${x0} ${wy} H${x1} M${x1} ${wy - 8} V${wy + 8}`);
      wBr.lab.setAttribute('x', (x0 + x1) / 2);
      wBr.lab.setAttribute('y', wy + 32);
    }
    for (const l of labels) {
      const o = practice ? 0 : prog(t, l.from, l.from + 0.5);
      l.el.style.opacity = o;
      if (o > 0) {
        const q = model.project(l.part, l.off);
        l.el.style.transform = `translate(${q.x}px, ${q.y}px) translate(-50%, -100%)`;
      }
    }

    hud.style.opacity = practice ? prog(t, GROW.montage1[0] - 0.3, GROW.montage1[0]) : 0;
    ghost.style.opacity = practice ? 0.95 * prog(t, GROW.montage1[0] - 0.3, GROW.montage1[0]) : 0;
    ref.style.opacity = ghost.style.opacity;
    if (practice) {
      const cur = stateAt(VERSIONS.map((x) => [x.at, x]), Math.max(t, VERSIONS[0].at)).value;
      round.textContent = `第 ${cur.v} 轮`;
      score.textContent = `和真实轮廓重合 ${cur.score}%`;
      VERSIONS.forEach((v, i) => {
        barEls[i].style.height = `${v.score * 0.9}px`;
        barEls[i].style.opacity = t >= v.at ? 1 : 0.12;
      });
      place(oops, { o: Math.min(prog(t, VERSIONS[0].at + 0.3, VERSIONS[0].at + 0.5), 1 - prog(t, VERSIONS[1].at - 0.2, VERSIONS[1].at)), r: -6 });
    } else oops.style.opacity = 0;
  }
  return { update, project, canvas };
}
