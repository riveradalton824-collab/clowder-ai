// The product world: an illustrated Clowder workspace (sidebar, thread, ball
// holder, workspace). Day 1 and day 2 are two threads; memory links them.
import { makeBall, makeFace, placeBall, updateFace } from './faces.mjs';
import { VIEW_H, buildList } from './messages.mjs';
import { BALL1, BALL2, CATS, MEMORY_LINK, PROMISE, S, THREAD1, THREAD2 } from './timeline.mjs';
import { easeInOut, easeOut, h, lerp, place, prog, svg, win } from './util.mjs';
import { buildYarn } from './yarn.mjs';

export const APP = { x: 100, y: 120, w: 1720, h: 920 };
const COL = { x: 240, y: 64 };
const DAY2 = 63.0;
const ITEM_Y0 = 112;
const ITEM_DY = 78;
const STATE_LABEL = { xian: '执行中', yan: 'review 中', shuo: '设计中', you: '输入中' };

export function buildThread(stage) {
  const app = h('div', 'app', stage);
  const side = h('div', 'side', app);
  const sb = h('div', 'side-brand', side);
  const logo = h('img', '', sb);
  logo.src = '/site/assets/logo-transparent.png';
  logo.alt = '';
  h('span', '', sb, 'Clowder AI');
  h('div', 'side-label', side, '对话');
  const item = (title, sub, cls = '') => {
    const n = h('div', `side-item ${cls}`, side);
    h('div', 'si-title', n, title);
    h('div', 'si-sub', n, sub);
    return n;
  };
  const itAdopt = item('领养登记页', '宪宪 · 进行中');
  const itFeed = item('流浪猫投喂打卡', '3 只猫 · 进行中');
  const olds = [item('周报自动化', '昨天', 'old'), item('猫咖菜单重排', '上周', 'old')];

  const head = h('div', 'head', app);
  const t1 = h('div', 'head-title', head, '流浪猫投喂打卡');
  const t2 = h('div', 'head-title', head, '领养登记页');
  const members = h('div', 'members', head);
  const mfaces = ['xian', 'yan', 'shuo'].map((w) => makeFace(members, w, 38, 'face mface'));
  h('div', 'ws-label', head, '工作区');

  const col = h('div', 'col', app);
  const list1 = buildList(col, THREAD1);
  const list2 = buildList(col, THREAD2);
  const yarn1 = buildYarn(list1.root, BALL1, { visibleFrom: PROMISE.fly[1], hideAfter: S.night[0] + 0.7 });
  const yarn2 = buildYarn(list2.root, BALL2, { visibleFrom: BALL2[0].at[0], hideAfter: S.finale[0] + 0.25 });
  const night = h('div', 'night', col);
  h('div', 'moon', night);
  h('div', 'night-txt', night, '第二天');

  const status = h('div', 'status', app);
  const chip = h('div', 'holder', status);
  h('span', 'holder-k', chip, '球在');
  const mini = svg('svg', { width: 26, height: 26, viewBox: '-13 -13 26 26' }, chip);
  const miniBall = makeBall(mini, 10);
  const holderTxt = h('span', 'holder-v', chip);
  h('div', 'input', status, '输入消息，@ 一只猫…');

  const overlay = svg('svg', { class: 'app-overlay', viewBox: `0 0 ${APP.w} ${APP.h}` }, app);
  const memLink = svg('path', { class: 'yarn memo-link', pathLength: 1 }, overlay);

  function layout() {
    list1.layout();
    list2.layout();
    yarn1.layout(list1.anchors, list1.root.offsetHeight);
    yarn2.layout(list2.anchors, list2.root.offsetHeight);
  }

  const nameOf = (list, id) => {
    const who = list.items.find((i) => i.m.id === id).m.who;
    return who === 'you' ? '你' : CATS[who].name;
  };
  const whoOf = (list, id) => list.items.find((i) => i.m.id === id).m.who;

  function update(t) {
    const appIn = easeOut(prog(t, S.thread[0], PROMISE.fly[1]));
    app.style.display = t >= S.thread[0] && t < S.finale[0] + 1.4 ? '' : 'none';
    const out = easeInOut(prog(t, S.finale[0], S.finale[0] + 1.2));
    place(app, { o: appIn * (1 - out), s: lerp(0.97, 1, appIn) * lerp(1, 0.96, out) });

    const d2 = easeInOut(prog(t, DAY2, DAY2 + 0.6));
    place(itAdopt, { o: d2, y: ITEM_Y0 + (d2 - 1) * 30 });
    place(itFeed, { y: ITEM_Y0 + ITEM_DY * d2 });
    olds.forEach((n, i) => place(n, { o: 0.6, y: ITEM_Y0 + ITEM_DY * (i + 1 + d2) }));
    itFeed.classList.toggle('active', t < DAY2 + 0.3);
    itAdopt.classList.toggle('active', t >= DAY2 + 0.3);
    t1.style.opacity = 1 - d2;
    t2.style.opacity = d2;
    for (const f of mfaces) updateFace(f, t);

    const n1 = easeInOut(prog(t, S.night[0], S.night[0] + 0.45));
    list1.root.style.opacity = 1 - n1;
    list1.update(t);
    list1.root.style.transform += ` translateY(${-50 * n1}px)`;
    list2.root.style.display = t >= S.night[1] - 0.2 ? '' : 'none';
    list2.update(t);
    yarn1.update(t);
    yarn2.update(t);
    place(night, { o: win(t, S.night[0] + 0.45, S.night[1], 0.3), s: lerp(0.96, 1, prog(t, S.night[0], S.night[1])) });

    const day2 = t >= S.night[1] - 0.2;
    const list = day2 ? list2 : list1;
    const hold = (day2 ? yarn2 : yarn1).holder(t);
    const id = hold.flying ? hold.to : hold.id;
    const who = whoOf(list, id);
    holderTxt.textContent = hold.flying ? `→ ${nameOf(list, id)}` : `${nameOf(list, id)} · ${STATE_LABEL[who]}`;
    placeBall(miniBall, 0, 0, t * 90 * (hold.flying ? 4 : 0), 1, 1);
    chip.style.opacity = t >= S.night[0] && t < S.night[1] ? 0 : 1;

    // Memory: a dashed yarn from yesterday's thread (sidebar) into today's reply.
    const mk = easeInOut(prog(t, MEMORY_LINK[0], MEMORY_LINK[1]));
    if (t >= MEMORY_LINK[0] && t < S.finale[0] + 1.4) {
      const a = { x: 228, y: ITEM_Y0 + ITEM_DY + 30 };
      const m = list2.anchors['n2:memo'];
      const b = { x: COL.x + m.x, y: COL.y + m.y - list2.scrollAt(t) };
      memLink.setAttribute('d', `M${a.x} ${a.y} C${a.x + 120} ${a.y} ${b.x - 160} ${b.y} ${b.x} ${b.y}`);
      memLink.style.opacity = 1;
      memLink.style.strokeDashoffset = 1 - mk;
    } else {
      memLink.style.opacity = 0;
    }
  }

  /** Stage coordinates of a message's ball anchor at time t. */
  function anchorOnStage(id, t) {
    const list = id.startsWith('n') ? list2 : list1;
    const a = list.anchors[id];
    return { x: APP.x + COL.x + a.x, y: APP.y + COL.y + a.y - list.scrollAt(t) };
  }
  return { app, layout, update, anchorOnStage, VIEW_H };
}
