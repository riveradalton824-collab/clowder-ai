// The "以后再说" wall and the desk in front of it, seen through a camera: the opening, the pounce
// (Yukina pins the note under her pen), the next task in ④ (rice cooker), and the ending: only the
// coffee machine goes on stage, two notes start, the rest stay, and its old spot gets a blank note.
import { clamp, easeBack, easeIn, easeInOut, easeOut, h, lerp, place, prog, quad, win } from '../../../promo-kit/util.mjs';
import { avatar, catFace, handle, makeClip } from './cast.mjs';
import { MEET_FROM, TICKET_FROM } from './before.mjs';
import { DOING, FIRSTS, GROW, NOTES, RICE, S, STAGE, TURN } from './timeline.mjs';
import { makeCursor, say } from './ui.mjs';

const BX = 246; // board inner origin (world)
const BY = 106;
const PANEL = { x: 1756, y: 106 }; // 已上场 inner origin (world)
const NW = 250;
const NH = 165;
const COLORS = { photo: 'c5', lang: 'c4', offline: 'c3', sound: 'c2', repair: 'c5', voice: 'c3', hero: '', ar: 'c2', rice: '' };
const CAMS = {
  before: { s: 0.78, cx: 1242, cy: 573 },
  full: { s: 1, cx: 960, cy: 540 },
  turn: { s: 1.2, cx: 760, cy: 600 },
  phone: { s: 5.4, cx: 1088, cy: 784 },
  end: { s: 0.86, cx: 1260, cy: 636 },
};
const PHONE_AT = 1.0; // seconds into toWork when the phone screen fills the frame
const CAT = { x: 690, feet: 905, scale: 1.5 }; // the pounce, centred under the hero note
const END_CAT = { x: 1230, feet: 905, scale: 1.9 };
const SIGN = { x: 127, y: 166 }; // centre of the blank sign in the `wait` frame (half-size px)
const LAND = { x: CAT.x - 250, y: 868 }; // where the coffee note lands on the desk

function mix(a, b, k) {
  return { s: lerp(a.s, b.s, k), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) };
}
/** Camera: which world point sits at the screen centre, and how big. */
export function camAt(t) {
  let c = CAMS.before;
  if (t >= 19.0) c = mix(CAMS.before, CAMS.full, easeInOut(prog(t, 19.0, 20.6)));
  if (t >= 24.2) c = mix(CAMS.full, CAMS.turn, easeInOut(prog(t, 24.2, 26.2)));
  if (t >= TURN.toWork[0]) c = mix(CAMS.turn, CAMS.phone, easeInOut(prog(t, TURN.toWork[0], TURN.toWork[0] + PHONE_AT)));
  if (t >= GROW.toWall[0]) c = CAMS.full;
  if (t >= STAGE.pan[0]) c = mix(CAMS.full, CAMS.end, easeInOut(prog(t, STAGE.pan[0], STAGE.pan[1])));
  return c;
}
export const toScreen = (c, wx, wy) => ({ x: (wx - c.cx) * c.s + 960, y: (wy - c.cy) * c.s + 540 });
const toWorld = (c, sx, sy) => ({ x: (sx - 960) / c.s + c.cx, y: (sy - 540) / c.s + c.cy });

/** Whole-wall visibility (the workspace takes over between the turn and the end of ④). */
export function wallShown(t) {
  if (t < S.turn[1]) return t < TURN.toWork[1] ? 1 : 0;
  return prog(t, GROW.toWall[0], GROW.toWall[1]);
}

const slot = (n) => ({ x: BX + n.x + NW / 2, y: BY + n.y + NH / 2 });
function slapIn(t, at) {
  const k = prog(t, at, at + 0.28);
  return { o: k > 0 ? 1 : 0, s: lerp(1.3, 1, easeOut(k)), dr: (1 - easeOut(k)) * 6 };
}
const HERO_ON = { x: 30 + NW * 0.36, y: 84 + NH * 0.36, s: 0.72 }; // its slot in 已上场 (panel-local)

function makeNote(parent, n) {
  const el = h('div', `note ${COLORS[n.id] ?? ''}`, parent);
  h('div', 'n-text', el, n.text);
  if (n.sub) h('div', 'n-sub', el, n.sub);
  h('div', 'n-date', el, n.date);
  return el;
}

export function buildWall(stage) {
  const root = h('div', 'scene wall', stage);
  const cam = h('div', 'cam', root);
  h('div', 'room', cam);
  const board = h('div', 'board', cam);
  const bt = h('div', 'board-title', board, '以后再说');
  h('small', '', bt, 'SOMEDAY');
  const panel = h('div', 'board on', cam);
  const pt = h('div', 'board-title', panel, '已上场');
  h('small', '', pt, 'ON STAGE');
  h('div', 'desk', cam);
  h('div', 'mug', cam);
  const phone = h('div', 'dphone', cam);
  const scr = h('div', 'dphone-scr', phone);
  const phoneOn = h('div', 'dphone-on', scr);
  h('b', '', phoneOn, '空白画布');
  h('div', 'dstand', cam);

  const firsts = FIRSTS.map((f, i) => {
    const row = h('div', 'first', cam);
    row.appendChild(avatar(null, f.who, 50));
    const col = h('div', '', row);
    h('b', '', col, handle(f.who));
    h('span', '', col, f.text);
    Object.assign(row.style, { left: `${PANEL.x + 24}px`, top: `${PANEL.y + 236 + i * 84}px` });
    return row;
  });

  const notes = {};
  for (const n of [...NOTES, RICE]) notes[n.id] = { n, el: makeNote(cam, n) };
  const heroStamp = h('div', 'stamp', notes.hero.el, '做出来了 · v2');
  const riceStamp = h('div', 'stamp', notes.rice.el, '开工');
  const doing = DOING.map((d) => {
    const tag = h('div', 'doing', notes[d.id].el);
    h('span', '', tag, `${d.tag} · ${handle(d.who)} +`);
    tag.appendChild(catFace(null, d.cat, 22));
    const pop = h('div', 'prog', cam);
    const scr2 = h('div', 'prog-scr', pop);
    if (d.id === 'lang') {
      const word = h('div', 'prog-lang', scr2, '换滤芯');
      h('div', 'prog-cap', pop, '说明书 · 5/12 种语言');
      return { d, tag, pop, word };
    }
    h('div', 'prog-photo', scr2);
    h('div', 'prog-box', scr2);
    h('div', 'prog-tag', scr2, '滴水盘满了？');
    h('div', 'prog-cap', pop, '用户拍的照片 · 自动框出问题');
    return { d, tag, pop };
  });
  const LANGS = ['换滤芯', 'Replace filter', 'フィルター交換', 'Filter wechseln', 'Cambiar filtro'];
  const blank = h('div', 'note blank', cam);
  h('span', 'blank-line', h('div', 'n-text', blank, '登场：@'));

  const kick = h('div', 'kick', cam);
  const kh = h('div', 'kick-h', kick);
  kh.appendChild(catFace(null, 'xian', 34));
  h('span', '', kh, '电饭煲 · 开工第一步');
  h('div', 'kick-sub', kick, '按宪宪自己改过的练法 v2');
  const kRows = [
    ['① 先打稿：@YukinaXSer 已经在画了', ''],
    ['② 找 @whutzefengxie-ops 要真实尺寸', '不从网图猜'],
  ].map(([a, b]) => {
    const r = h('div', 'kick-row', kick, a);
    if (b) h('em', '', r, ` · ${b}`);
    return r;
  });
  const ask = h('div', 'kick-ask', kick);
  ask.appendChild(avatar(null, 'whut', 30));
  h('span', '', ask, '已请 @whutzefengxie-ops：电饭煲的结构图尺寸');

  const cat = makeClip(cam, CAT.scale);
  cat.el.style.zIndex = 6;
  const bubble = h('div', 'bubble', cam, '我帮你捏。');
  bubble.style.zIndex = 7;
  const yukSay = say(cam, 'yukina', '这个，我来打稿。');
  const pen = makeCursor(cam, 'yukina', 'pen');
  const sign = h('div', 'sign-text', cam, '到你们了');
  sign.style.zIndex = 7;

  function noteState(id, t, c) {
    const { n } = notes[id];
    const home = slot(n);
    let st = { x: home.x, y: home.y, r: n.r, s: 1, o: 0 };
    if (id === 'hero' || id === 'ar') {
      const from = toWorld(CAMS.before, ...(id === 'hero' ? [MEET_FROM.x, MEET_FROM.y] : [TICKET_FROM.x, TICKET_FROM.y]));
      const k = easeInOut(prog(t, n.at, n.at + 0.9));
      const p = quad(from, { x: lerp(from.x, home.x, 0.5), y: Math.min(from.y, home.y) - 160 }, home, k);
      st = { x: p.x, y: p.y, r: lerp(-10, n.r, k), s: lerp(0.55, 1, k), o: t >= n.at ? 1 : 0 };
    } else {
      const si = slapIn(t, n.at);
      st = { ...st, o: si.o, s: si.s, r: n.r + si.dr };
    }
    if (id === 'hero' && t >= TURN.noteFall[0] && t < GROW.toWall[0]) {
      const k = prog(t, TURN.noteFall[0], TURN.noteFall[1]);
      const p = quad(home, { x: home.x - 140, y: home.y + 40 }, LAND, easeIn(k));
      const press = Math.sin(Math.PI * prog(t, TURN.pen[1] - 0.25, TURN.pen[1] + 0.1)) * 0.05;
      st = { ...st, x: p.x, y: p.y, r: lerp(n.r, 9, k), s: lerp(1, 0.9, k) - press };
    }
    if (id === 'hero' && t >= GROW.toWall[0]) st = { ...st, r: 0 };
    if (id === 'rice' && t >= GROW.rice[0]) st.s *= lerp(1, 1.12, easeBack(prog(t, GROW.rice[0], GROW.rice[0] + 0.5)));
    // ending: only the coffee machine moves to 已上场
    if (id === 'hero' && t >= STAGE.heroMove[0]) {
      const to = { x: PANEL.x + HERO_ON.x, y: PANEL.y + HERO_ON.y };
      const k = easeInOut(prog(t, STAGE.heroMove[0], STAGE.heroMove[1]));
      const p = quad({ x: st.x, y: st.y }, { x: lerp(st.x, to.x, 0.5), y: Math.min(st.y, to.y) - 120 }, to, k);
      st = { ...st, x: p.x, y: p.y, r: lerp(st.r, 0, k), s: lerp(st.s, HERO_ON.s, k) };
    }
    return st;
  }

  function update(t) {
    const shown = wallShown(t);
    root.style.opacity = shown;
    root.style.visibility = shown > 0 ? 'visible' : 'hidden';
    if (shown <= 0) return { ball: null };
    const c = camAt(t);
    cam.style.transform = `translate(${960 - c.cx * c.s}px, ${540 - c.cy * c.s}px) scale(${c.s})`;

    const dim = lerp(1, 0.45, easeOut(prog(t, GROW.rice[0], GROW.rice[0] + 0.6)) * (1 - prog(t, STAGE.pan[0], STAGE.pan[0] + 0.6)));
    for (const id of Object.keys(notes)) {
      const st = noteState(id, t, c);
      const focus = id === 'rice' || id === 'hero' ? 1 : dim;
      place(notes[id].el, { o: st.o * focus, x: st.x - NW / 2, y: st.y - NH / 2, s: st.s, r: st.r });
      notes[id].el.style.zIndex = id === 'hero' || id === 'rice' ? 3 : 2;
    }
    heroStamp.style.opacity = t >= GROW.toWall[0] ? 1 - prog(t, STAGE.heroMove[0], STAGE.heroMove[0] + 0.5) : 0;
    const rk = prog(t, GROW.rice[0] + 0.3, GROW.rice[0] + 0.6);
    riceStamp.style.opacity = rk;
    riceStamp.style.transform = `rotate(8deg) scale(${lerp(1.6, 1, easeOut(rk))})`;

    // the kickoff card for the next task: the new practice shows up on the first step
    const kOut = 1 - prog(t, STAGE.pan[0], STAGE.pan[0] + 0.5);
    const kk = easeOut(prog(t, GROW.rice[0] + 0.7, GROW.rice[0] + 1.2));
    place(kick, { o: kk * kOut, y: (1 - kk) * 20 });
    kRows.forEach((r, i) => {
      r.style.opacity = prog(t, GROW.rice[0] + 1.4 + i * 0.9, GROW.rice[0] + 1.8 + i * 0.9);
    });
    ask.style.opacity = prog(t, GROW.rice[0] + 3.2, GROW.rice[0] + 3.6);

    phoneOn.style.opacity = t < S.turn[1] ? prog(t, TURN.tabletOn, TURN.tabletOn + 0.4) : 0;
    panel.style.opacity = prog(t, STAGE.pan[0] + 0.2, STAGE.pan[0] + 1.2);
    firsts.forEach((row, i) => {
      const at = STAGE.firsts[0] + i * STAGE.firsts[1];
      const k = easeOut(prog(t, at, at + 0.5));
      place(row, { o: k, x: (1 - k) * -16 });
    });
    // two notes start, each with a one-breath look at the progress
    doing.forEach(({ d, tag, pop, word }, i) => {
      const at = STAGE.doing[0] + i * STAGE.doing[1];
      const k = easeBack(prog(t, at, at + 0.4));
      tag.style.opacity = prog(t, at, at + 0.3);
      tag.style.transform = `scale(${lerp(1.4, 1, k)})`;
      const pk = easeOut(prog(t, at + 0.3, at + 0.7)) * (1 - prog(t, at + 2.0, at + 2.4));
      const n = slot(NOTES.find((x) => x.id === d.id));
      place(pop, { o: pk, x: n.x + NW / 2 + 20, y: n.y - 100, s: lerp(0.7, 1, pk) });
      if (word) word.textContent = LANGS[Math.min(LANGS.length - 1, Math.floor(Math.max(0, t - at - 0.5) / 0.32))];
    });
    const hs = slot(NOTES.find((x) => x.id === 'hero'));
    const bk = prog(t, STAGE.blank, STAGE.blank + 0.3);
    place(blank, { o: bk > 0 ? 1 : 0, x: hs.x - 150, y: hs.y - 100, s: lerp(1.35, 1, easeOut(bk)), r: lerp(-6, -2, easeOut(bk)) });

    // 宪宪 v3 on the desk
    let ball = null;
    bubble.style.opacity = 0;
    sign.style.opacity = 0;
    yukSay.style.opacity = 0;
    pen.style.opacity = 0;
    if (t < S.turn[1] && t >= TURN.trotIn[0]) {
      const k = prog(t, TURN.trotIn[0], TURN.trotIn[1]);
      cat.scale = CAT.scale;
      if (t < TURN.pounce[0]) {
        cat.at('trot', t - TURN.trotIn[0], true);
      } else {
        cat.at('pounce', t - TURN.pounce[0]);
      }
      const [w, hh] = cat.size(t < TURN.pounce[0] ? 'trot' : 'pounce');
      const local = t - TURN.pounce[0];
      const hop = Math.sin(Math.PI * clamp((local - 4.0) / 1.5)) * 80;
      const x = t < TURN.pounce[0] ? lerp(CAT.x - 900, CAT.x, easeOut(k)) : CAT.x;
      place(cat.el, { o: 1, x: x - w / 2, y: CAT.feet - hh - hop });
      const bk2 = easeOut(prog(t, TURN.catLine[0], TURN.catLine[0] + 0.35));
      place(bubble, { o: win(t, TURN.catLine[0], TURN.catLine[1], 0.3), x: CAT.x - 30, y: 380 + (1 - bk2) * 12, s: lerp(0.9, 1, bk2) });
      // Yukina takes it: her pen comes down on the note, she says she'll sketch it
      pen.move(t, { x: LAND.x + 260, y: LAND.y - 260 }, { x: LAND.x + 20, y: LAND.y - 10 }, TURN.pen[0], TURN.pen[1], TURN.pen[1] - 0.1, TURN.toWork[0] + 0.4);
      const yk = easeOut(prog(t, TURN.yukLine[0], TURN.yukLine[0] + 0.35));
      place(yukSay, { o: win(t, TURN.yukLine[0], TURN.yukLine[1], 0.3), x: LAND.x - 230, y: 610 + (1 - yk) * 12 });
      // the work starts: a yarn ball rolls from her note to the tablet
      const rb = prog(t, TURN.tabletOn - 0.3, TURN.tabletOn + 0.6);
      if (rb > 0) {
        const p = { x: lerp(LAND.x + 140, 1088, easeInOut(rb)), y: 880 - Math.sin(Math.PI * rb) * 30 };
        const sp = toScreen(c, p.x, p.y);
        ball = { x: sp.x, y: sp.y, r: 22 * c.s, rot: rb * 540, o: 1 - prog(t, TURN.tabletOn + 0.7, TURN.tabletOn + 1.1) };
      }
    } else if (t >= GROW.rice[0] - 0.4 && t < STAGE.pan[0] + 0.6) {
      cat.scale = 1.2;
      cat.at('think', t - GROW.rice[0] + 0.4);
      const [w, hh] = cat.size('think');
      place(cat.el, { o: (1 - prog(t, STAGE.pan[0], STAGE.pan[0] + 0.6)) * prog(t, GROW.rice[0] - 0.4, GROW.rice[0]), x: 1560 - w / 2, y: 905 - hh });
    } else if (t >= STAGE.cat) {
      cat.scale = END_CAT.scale;
      cat.at('wait', t - STAGE.cat, true);
      const [w, hh] = cat.size('wait');
      const k = easeOut(prog(t, STAGE.cat, STAGE.cat + 0.5));
      place(cat.el, { o: k, x: END_CAT.x, y: END_CAT.feet - hh + (1 - k) * 40 });
      place(sign, { o: prog(t, STAGE.cat + 0.5, STAGE.cat + 0.9), x: END_CAT.x + SIGN.x * END_CAT.scale, y: END_CAT.feet - hh + SIGN.y * END_CAT.scale + (1 - k) * 40 });
      sign.style.transform += ' translate(-50%, -50%)';
    } else {
      cat.el.style.opacity = 0;
    }
    return { ball };
  }
  return { update };
}

