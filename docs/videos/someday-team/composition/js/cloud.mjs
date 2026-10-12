// ① Hand work off from anywhere: Yukina sketches the rough shape on her tablet and the cloud sculpts
// v1 from it; on Whut's computer, with his permission, 宪宪 reads the drawings there and carries back
// only the sizes. (Mindfn's runnable prototype is proto.mjs.)
import { easeIn, easeInOut, easeOut, h, lerp, place, prog, quad, svg, win } from '../../../promo-kit/util.mjs';
import { avatar, handle, makeClip } from './cast.mjs';
import { CLOUD, S, SKETCH } from './timeline.mjs';
import { lock, makeCursor } from './ui.mjs';
import { VIEW } from './work.mjs';

const SCR = { x: 1174, y: 494, w: 672, h: 382 }; // the monitor's screen (stage px)
const CAT_FEET = 306; // local y where the desktop cat sits, above the permission bar
const SIGN = { x: 127, y: 166 };
const PAD = { x: 1182, y: 176 }; // the tablet's drawing area (stage px, 656×236)

function cad(parent) {
  const w = h('div', 'cad', parent);
  const hd = h('div', 'cad-h', w, 'CM-3 结构图.dwg');
  hd.appendChild(lock(null, ' 仅本机')).style.marginLeft = 'auto';
  const s = svg('svg', { width: 380, height: 222 }, w);
  const line = (d, c = '#5f88a8', wd = 1.6) => svg('path', { d, fill: 'none', stroke: c, 'stroke-width': wd }, s);
  line('M120 30 H260 V190 H120 Z M120 60 H260 M150 90 H230 V120 H150 Z M140 190 V205 H240 V190');
  line('M300 30 V190 M296 30 H304 M296 190 H304', '#8fb0c8', 1.2);
  line('M120 205 H260 M120 201 V209 M260 201 V209', '#8fb0c8', 1.2);
  const hot = [line('M300 30 V190', '#f0a050', 3), line('M120 205 H260', '#f0a050', 3), line('M150 90 H230 V120 H150 Z', '#f0a050', 3)];
  const tx = (x, y, t) => {
    const n = svg('text', { x, y, fill: '#9fb6c9', 'font-size': 12, 'font-family': 'JetBrains Mono, monospace' }, s);
    n.textContent = t;
    return n;
  };
  tx(308, 114, '380');
  tx(176, 220, '300');
  tx(30, 60, '滤芯座 A-12');
  tx(30, 120, '水箱 B-03');
  return { w, hot };
}

export function buildCloud(stage) {
  const pad = h('div', 'rz panel tablet', stage);
  const ph = h('div', 'panel-h', pad);
  ph.appendChild(avatar(null, 'yukina', 30));
  h('span', '', ph, `${handle('yukina')} 的平板 · 打稿`);
  const sk = svg('svg', { class: 'sketch', width: 656, height: 236 }, h('div', 'pad-paper', pad));
  const strokes = SKETCH.map((d) => svg('path', { d, fill: 'none', stroke: '#2d2a26', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sk));
  const lens = [];
  const padNote = h('div', 'pad-note', pad, '大形 · 先不管细节');
  const pen = makeCursor(stage, 'yukina', 'pen');

  const pc = h('div', 'rz pc', stage);
  const who = h('div', 'who-row mon-who', pc);
  who.appendChild(avatar(null, 'whut', 34));
  h('span', '', who, `${handle('whut')} 的电脑 · 结构图纸在这台机器上`);
  const mon = h('div', 'monitor', pc);
  const scr = h('div', 'mon-scr', mon);
  const draw = cad(scr);
  const cat = makeClip(scr, 1.1);
  const sign = h('div', 'sign-text', scr, '可以吗？');
  sign.style.fontSize = '17px';
  const allow = h('div', 'allow', scr);
  lock(allow);
  h('span', '', allow, '允许宪宪：在这台电脑上读结构图纸');
  h('em', '', allow, '仅本次');
  const btn = h('b', '', allow, '允许');
  const keep = h('div', 'keep', pc);
  lock(keep);
  h('span', '', keep, '图纸留在这台电脑，只把尺寸带回作品');
  const cursor = makeCursor(stage, 'whut');
  const drop = h('div', 'dropcard', stage, '尺寸 + 零件表');

  const catLocal = { x: 430, feet: CAT_FEET };
  const ballAtPad = { x: PAD.x + 620, y: PAD.y + 210 };
  const ballAtCloud = { x: VIEW.x + VIEW.w - 70, y: VIEW.y + 60 };
  const ballAtPc = { x: SCR.x + SCR.w - 40, y: SCR.y + SCR.h + 30 };
  const workSpot = { x: VIEW.x + 140, y: VIEW.y + 90 };

  function update(t) {
    const on = t >= S.cloud[0] - 0.5 && t < CLOUD.proto[0] + 0.6;
    const out = 1 - prog(t, CLOUD.proto[0] - 0.2, CLOUD.proto[0] + 0.4);
    const tk = easeOut(prog(t, CLOUD.sketch[0] - 0.4, CLOUD.sketch[0] + 0.2));
    place(pad, { o: on ? tk * out : 0, x: (1 - tk) * 30 });
    const pk = easeOut(prog(t, CLOUD.ballDown[0] - 0.6, CLOUD.ballDown[0]));
    place(pc, { o: on ? pk * out : 0, y: (1 - pk) * 30 });
    pen.style.opacity = 0;
    const balls = [];
    if (!on) {
      cursor.style.opacity = 0;
      drop.style.opacity = 0;
      return balls;
    }

    // Yukina draws the rough shape, stroke by stroke; her pen follows the line
    if (!lens.length) for (const p of strokes) lens.push(p.getTotalLength());
    const per = (CLOUD.sketch[1] - CLOUD.sketch[0] - 0.4) / strokes.length;
    strokes.forEach((p, i) => {
      const k = easeInOut(prog(t, CLOUD.sketch[0] + i * per, CLOUD.sketch[0] + (i + 0.85) * per));
      p.setAttribute('stroke-dasharray', `${lens[i]} ${lens[i]}`);
      p.setAttribute('stroke-dashoffset', lens[i] * (1 - k));
      if (t >= CLOUD.sketch[0] + i * per && t < CLOUD.sketch[0] + (i + 1) * per) {
        const q = p.getPointAtLength(lens[i] * k);
        pen.at({ x: PAD.x + q.x, y: PAD.y + q.y });
      }
    });
    padNote.style.opacity = prog(t, CLOUD.sketch[1] - 0.4, CLOUD.sketch[1]);

    // the desktop cat: arrives with the work, asks, runs into the drawings, comes back carrying the sizes
    sign.style.opacity = 0;
    if (t < CLOUD.trot[0]) {
      cat.scale = 1.1;
      cat.at('wait', t - CLOUD.catIn, true);
      const [w, hh] = cat.size('wait');
      const k = easeOut(prog(t, CLOUD.catIn, CLOUD.catIn + 0.5));
      place(cat.el, { o: k, x: catLocal.x, y: catLocal.feet - hh + (1 - k) * 30 });
      place(sign, { o: prog(t, CLOUD.catIn + 0.6, CLOUD.catIn + 0.9) * (1 - prog(t, CLOUD.allowClick, CLOUD.allowClick + 0.2)), x: catLocal.x + SIGN.x * 1.1, y: catLocal.feet - hh + SIGN.y * 1.1 + (1 - k) * 30 });
      sign.style.transform += ' translate(-50%, -50%)';
    } else if (t < CLOUD.carry[0]) {
      cat.scale = 1.0;
      cat.at('trot', t - CLOUD.trot[0], true);
      const [w, hh] = cat.size('trot');
      const k = easeIn(prog(t, CLOUD.trot[0], CLOUD.trot[1]));
      cat.el.style.opacity = 1 - prog(t, CLOUD.trot[1] - 0.3, CLOUD.trot[1]);
      cat.el.style.transform = `translate(${lerp(catLocal.x, 150, k)}px, ${catLocal.feet - hh * lerp(1, 0.6, k)}px) scale(${lerp(-1, -0.6, k)}, ${lerp(1, 0.6, k)})`;
      cat.el.style.transformOrigin = '50% 0';
    } else {
      cat.scale = 1.0;
      cat.at('carry', t - CLOUD.carry[0]);
      const [, hh] = cat.size('carry');
      cat.el.style.transformOrigin = '50% 100%';
      place(cat.el, { o: prog(t, CLOUD.carry[0], CLOUD.carry[0] + 0.3) * (1 - prog(t, CLOUD.ballUp[1], CLOUD.ballUp[1] + 0.5)), x: 290, y: catLocal.feet - hh });
    }
    const reading = win(t, CLOUD.trot[1] - 0.2, CLOUD.carry[0] + 1.6, 0.25);
    draw.hot.forEach((p, i) => p.setAttribute('opacity', reading * (0.6 + 0.4 * Math.sin(t * 8 + i))));

    const ak = easeOut(prog(t, CLOUD.allowBar[0], CLOUD.allowBar[0] + 0.4));
    place(allow, { o: Math.min(ak, 1 - prog(t, CLOUD.allowBar[1], CLOUD.allowBar[1] + 0.4)), y: (1 - ak) * 20 });
    btn.textContent = t >= CLOUD.allowClick ? '已允许' : '允许';
    btn.classList.toggle('on', t >= CLOUD.allowClick);
    const bx = SCR.x + SCR.w - 70;
    const by = SCR.y + SCR.h - 48;
    cursor.move(t, { x: bx - 260, y: by + 120 }, { x: bx, y: by }, CLOUD.allowBar[0] + 0.8, CLOUD.allowClick - 0.15, CLOUD.allowClick, CLOUD.allowBar[1] + 0.3);
    const kk = easeOut(prog(t, CLOUD.keepLocal[0], CLOUD.keepLocal[0] + 0.5));
    place(keep, { o: Math.min(kk, 1 - prog(t, CLOUD.keepLocal[1] - 0.4, CLOUD.keepLocal[1])), x: (1 - kk) * 16 });

    // the yarn ball: Yukina's tablet → the cloud (where 宪宪 sculpts) → Whut's computer → back with the sizes
    const dropFrom = { x: SCR.x + 470, y: SCR.y + CAT_FEET - 6 };
    if (t < CLOUD.ballDown[0]) {
      const k = easeInOut(prog(t, CLOUD.sketch[1] - 0.4, CLOUD.blob[0] + 0.4));
      const p = quad(ballAtPad, { x: 1150, y: 120 }, ballAtCloud, k);
      balls.push({ x: p.x, y: p.y + (k >= 1 ? Math.sin(t * 3) * 3 : 0), rot: t * 30 + k * 500, o: tk });
    } else if (t < CLOUD.ballUp[0]) {
      const k = easeInOut(prog(t, CLOUD.ballDown[0], CLOUD.ballDown[1]));
      const p = quad(ballAtCloud, { x: 1250, y: 380 }, ballAtPc, k);
      balls.push({ x: p.x, y: p.y, rot: k * 720, o: 1 });
    } else {
      const k = easeInOut(prog(t, CLOUD.ballUp[0], CLOUD.ballUp[1]));
      const p = quad(dropFrom, { x: 1150, y: 200 }, workSpot, k);
      balls.push({ x: p.x, y: p.y, rot: k * -720, o: 1 - prog(t, CLOUD.proto[0], CLOUD.proto[0] + 0.3) });
      const dk = prog(t, CLOUD.drop, CLOUD.drop + 0.3);
      place(drop, { o: dk * (1 - prog(t, CLOUD.snap[0] + 0.2, CLOUD.snap[0] + 0.6)), x: p.x + 26, y: p.y - 20, s: lerp(1, 0.85, k) });
    }
    if (t < CLOUD.drop) drop.style.opacity = 0;
    return balls;
  }
  return { update };
}
