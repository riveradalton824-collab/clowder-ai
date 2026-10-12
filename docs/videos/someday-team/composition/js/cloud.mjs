// ① Hand work off from anywhere: the cloud drafts v1 from photos; on Ajie's computer, with his
// permission, 宪宪 reads the drawings there and carries back only the sizes; Lin spins v1 on her phone.
import { easeIn, easeInOut, easeOut, h, lerp, place, prog, quad, svg, win } from '../../../promo-kit/util.mjs';
import { avatar, catFace, makeClip } from './cast.mjs';
import { CLOUD, S } from './timeline.mjs';
import { lock, makeCursor } from './ui.mjs';
import { VIEW } from './work.mjs';

const SCR = { x: 1174, y: 494, w: 672, h: 382 }; // the monitor's screen (stage px)
const CAT_FEET = 306; // local y where the desktop cat sits, above the permission bar
const SIGN = { x: 127, y: 166 };

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

export function buildCloud(stage, work) {
  const cloud = h('div', 'rz panel cloud-card', stage);
  const ch = h('div', 'panel-h', cloud, '团队云 · 照着产品照片先捏一版');
  ch.style.gap = '10px';
  const cb = h('div', 'panel-b', cloud);
  const photos = h('div', 'cl-photos', cb);
  for (let i = 0; i < 3; i++) h('div', 'cl-photo', photos);
  h('div', 'cl-cap', cb, '产品照片 ×3 · 真实尺寸不知道');
  const cc = h('div', 'cl-cat', cloud);
  cc.appendChild(catFace(null, 'xian', 70));
  h('span', '', cc, '宪宪 · 在云上');

  const pc = h('div', 'rz pc', stage);
  const who = h('div', 'who-row mon-who', pc);
  who.appendChild(avatar(null, 'jie', 34));
  h('span', '', who, '阿杰的电脑 · 结构图纸在这台机器上');
  const mon = h('div', 'monitor', pc);
  const scr = h('div', 'mon-scr', mon);
  const draw = cad(scr);
  const cat = makeClip(scr, 1.1);
  const sign = h('div', 'sign-text', scr, '可以吗？');
  sign.style.fontSize = '17px';
  const allow = h('div', 'allow', scr);
  lock(allow);
  h('span', '', allow, '阿杰允许宪宪：在这台电脑上读结构图纸');
  h('em', '', allow, '仅本次');
  const btn = h('b', '', allow, '允许');
  const keep = h('div', 'keep', pc);
  lock(keep);
  h('span', '', keep, '图纸留在这台电脑，只把尺寸带回作品');
  const cursor = makeCursor(stage, 'jie');
  const drop = h('div', 'dropcard', stage, '尺寸 + 零件表');

  const phone = h('div', 'phone', stage);
  const ps = h('div', 'ph-scr', phone);
  const pt = h('div', 'ph-top', ps, '咖啡机拆解说明书');
  h('span', '', pt, '原型 · 林姐做的 · 能转能拆');
  const pcv = h('canvas', 'ph-canvas', ps);
  pcv.width = 368;
  pcv.height = 420;
  const pctx = pcv.getContext('2d');
  const btns = h('div', 'ph-btns', ps);
  h('b', '', btns, '拆开看看');
  h('b', '', btns, '换滤芯');
  const swipe = h('div', 'ph-swipe', ps);
  const seen = h('div', 'ph-seen', ps);
  for (const w of ['zhou', 'chen', 'jie', 'wang']) seen.appendChild(avatar(null, w, 24));
  h('span', '', seen, ' 已打开，在转');
  const say = h('div', 'lin-say', stage);
  say.appendChild(avatar(null, 'lin', 46));
  const sayB = h('div', 'say-b', say, '我自己搭了个能转的原型，大家手机上转转看！');

  const catLocal = { x: 430, feet: CAT_FEET };
  const ballAtCloud = { x: 1712, y: 236 };
  const ballAtPc = { x: SCR.x + SCR.w - 40, y: SCR.y + SCR.h + 30 };
  const workSpot = { x: VIEW.x + 140, y: VIEW.y + 90 };

  function update(t) {
    const on = t >= S.cloud[0] - 0.5 && t < S.cloud[1] + 0.5;
    const out = 1 - prog(t, CLOUD.phone[0] - 0.4, CLOUD.phone[0] + 0.2);
    const ck = easeOut(prog(t, CLOUD.blob[0], CLOUD.blob[0] + 0.6));
    place(cloud, { o: on ? ck * out : 0, x: (1 - ck) * 30 });
    const pk = easeOut(prog(t, CLOUD.ballDown[0] - 0.6, CLOUD.ballDown[0]));
    place(pc, { o: on ? pk * out : 0, y: (1 - pk) * 30 });
    const balls = [];
    if (!on) {
      cursor.style.opacity = 0;
      drop.style.opacity = 0;
      phone.style.opacity = 0;
      say.style.opacity = 0;
      return balls;
    }

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

    // the yarn ball: on the cloud → down to Ajie's computer → back up into the work, with the sizes
    const dropFrom = { x: SCR.x + 470, y: SCR.y + CAT_FEET - 6 };
    if (t < CLOUD.ballDown[0]) {
      balls.push({ x: ballAtCloud.x, y: ballAtCloud.y + Math.sin(t * 3) * 3, rot: t * 30, o: ck });
    } else if (t < CLOUD.ballUp[0]) {
      const k = easeInOut(prog(t, CLOUD.ballDown[0], CLOUD.ballDown[1]));
      const p = quad(ballAtCloud, { x: 1890, y: 600 }, ballAtPc, k);
      balls.push({ x: p.x, y: p.y, rot: k * 720, o: 1 });
    } else {
      const k = easeInOut(prog(t, CLOUD.ballUp[0], CLOUD.ballUp[1]));
      const p = quad(dropFrom, { x: 1150, y: 200 }, workSpot, k);
      const rest = prog(t, CLOUD.phone[0], CLOUD.phone[0] + 0.8);
      const end = { x: lerp(p.x, 1580, easeInOut(rest)), y: lerp(p.y, 960, easeInOut(rest)) };
      balls.push({ x: end.x, y: end.y, rot: k * -720 + rest * 360, o: 1 - prog(t, S.cloud[1] - 0.4, S.cloud[1]) });
      const dk = prog(t, CLOUD.drop, CLOUD.drop + 0.3);
      place(drop, { o: dk * (1 - prog(t, CLOUD.snap[0] + 0.2, CLOUD.snap[0] + 0.6)), x: p.x + 26, y: p.y - 20, s: lerp(1, 0.85, k) });
    }
    if (t < CLOUD.drop) drop.style.opacity = prog(t, CLOUD.drop, CLOUD.drop + 0.3);

    // Lin's phone: her first prototype that runs, opened by everyone
    const fk = easeOut(prog(t, CLOUD.phone[0], CLOUD.phone[0] + 0.6));
    place(phone, { o: fk, x: 80 + (1 - fk) * 120 });
    place(say, { o: prog(t, CLOUD.phone[0] + 0.5, CLOUD.phone[0] + 0.9) * (1 - prog(t, CLOUD.hold[0] - 0.2, CLOUD.hold[0] + 0.2)), y: 0 });
    sayB.style.opacity = 1;
    if (fk > 0) {
      pctx.clearRect(0, 0, 368, 420);
      const src = work.canvas;
      const sw = 640;
      const sh = (sw * 420) / 368;
      pctx.drawImage(src, (VIEW.w - sw) / 2, (VIEW.h - sh) / 2 + 30, sw, sh, 0, 0, 368, 420);
    }
    const sp = prog(t, CLOUD.phone[0] + 1.4, CLOUD.phone[0] + 4.4);
    place(swipe, { o: win(t, CLOUD.phone[0] + 1.2, CLOUD.phone[0] + 4.6, 0.25), x: lerp(70, 280, easeInOut((sp * 2) % 1)), y: 330 });
    seen.style.opacity = prog(t, CLOUD.phone[0] + 2.6, CLOUD.phone[0] + 3.0);
    return balls;
  }
  return { update };
}
