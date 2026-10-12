// Before: three quick vignettes beside the wall: the meeting where the room puts it off together,
// the draft folder untouched for three years, and an idea issue scrolled away by bugs. Screen px.
import { easeInOut, easeOut, h, place, prog, rng, typed, win } from '../../../promo-kit/util.mjs';
import { avatar, handle } from './cast.mjs';
import { BEFORE, NOTES } from './timeline.mjs';

/** Where the hero note and the AR note take off from (screen px, the `before` camera). */
export const MEET_FROM = { x: 1600, y: 300 };
export const TICKET_FROM = { x: 1615, y: 600 };
const BUGS = ['#131 登录偶尔超时', '#133 iOS 打开闪退', '#134 导出少一列', '#136 首页白屏', '#137 推送发了两遍', '#139 价格显示错位'];
const ROW = 58;

function card(stage, title) {
  const n = h('div', 'vig', stage);
  h('div', 'vig-h', n, title);
  return { n, b: h('div', 'vig-b', n) };
}
const show = (n, t, [a, b]) => {
  const k = easeOut(prog(t, a, a + 0.4));
  place(n, { o: win(t, a, b, 0.35), y: (1 - k) * 24 });
};
function issueRow(parent, no, title, label, cls) {
  const r = h('div', `issue ${cls}`, parent);
  h('i', '', r);
  h('b', '', r, no);
  h('span', '', r, title);
  h('em', '', r, label);
  return r;
}

export function buildBefore(stage) {
  const meet = card(stage, '周会 · 2023.04');
  const lines = BEFORE.meetingLines.map((l) => {
    const row = h('div', 'mline', meet.b);
    row.appendChild(avatar(null, l.who, 44));
    const col = h('div', '', row);
    h('div', 'mwho', col, handle(l.who));
    const txt = h('div', `txt${l.who === 'leslie' ? ' hot' : ''}`, col);
    return { row, txt, l };
  });
  // nobody in particular shelves it: the room nods, and it goes on the wall
  const shelf = h('div', 'mline shelf', meet.b);
  const heads = h('div', 'nodders', shelf);
  for (const w of ['leslie', 'yukina', 'mindfn', 'whut']) heads.appendChild(avatar(null, w, 30));
  const shelfTxt = h('div', 'txt', shelf);
  const nods = h('div', 'nods', meet.b, '大家一起点头 · 记入「以后再说」');

  const folder = card(stage, '共享盘 › 产品 › 2023');
  const fr = h('div', 'frow', folder.b);
  h('div', 'fold', fr);
  h('span', '', fr, '3D说明书_draft');
  h('span', 'fmeta', fr, '最后修改：3 年前');
  for (const [name, date] of [['外壳草图', '2023.03'], ['滤芯问题汇总.xlsx', '2023.04']]) {
    const r = h('div', 'frow dim', folder.b);
    h('div', 'fold', r).style.opacity = 0.45;
    h('span', '', r, name);
    h('span', 'fmeta', r, date).style.color = '#b9b3a8';
  }
  folder.b.style.height = '300px';
  const R = rng(7);
  const dust = Array.from({ length: 26 }, () => {
    const d = h('div', 'dust', folder.b);
    return { d, x: R() * 470, y0: R() * 260, v: 6 + R() * 14, ph: R() * 6 };
  });

  const iss = card(stage, 'Issues · 214 open');
  iss.b.style.height = '340px';
  iss.b.style.overflow = 'hidden';
  const ar = NOTES.find((n) => n.id === 'ar');
  const idea = issueRow(iss.b, '#128', ar.text, '以后再说', 'idea');
  const bugs = BUGS.map((text, i) => {
    const [no, ...rest] = text.split(' ');
    return { n: issueRow(iss.b, no, rest.join(' '), 'bug', 'bug'), at: BEFORE.issues[0] + 0.9 + i * 0.55 };
  });

  function update(t) {
    show(meet.n, t, BEFORE.meeting);
    for (const { row, txt, l } of lines) {
      row.style.opacity = prog(t, l.at - 0.2, l.at);
      txt.textContent = typed(l.text, t, l.at, l.at + 1.1) || ' ';
    }
    shelf.style.opacity = prog(t, BEFORE.shelve.at - 0.2, BEFORE.shelve.at);
    shelfTxt.textContent = typed(BEFORE.shelve.text, t, BEFORE.shelve.at, BEFORE.shelve.at + 0.6) || ' ';
    heads.childNodes.forEach((n, i) => {
      n.style.transform = `translateY(${Math.max(0, Math.sin((t - BEFORE.shelve.at - i * 0.12) * 9)) * 5 * (t > BEFORE.shelve.at && t < BEFORE.shelve.at + 1.2 ? 1 : 0)}px)`;
    });
    nods.style.opacity = prog(t, BEFORE.shelve.at + 0.8, BEFORE.shelve.at + 1.1);
    show(folder.n, t, BEFORE.folder);
    for (const p of dust) {
      const y = (((p.y0 + (t - BEFORE.folder[0]) * p.v) % 280) + 280) % 280;
      place(p.d, { x: p.x + Math.sin(t * 0.8 + p.ph) * 6, y, o: 0.8 });
    }
    show(iss.n, t, BEFORE.issues);
    // each new bug lands on top and pushes everything below it down, until the idea scrolls away
    let pushed = 0;
    for (const b of bugs) pushed += easeInOut(prog(t, b.at, b.at + 0.35));
    place(idea, { o: t < ar.at ? 1 : 0, y: 8 + pushed * ROW });
    bugs.forEach((b, i) => {
      let above = 0;
      for (let j = i + 1; j < bugs.length; j++) above += easeInOut(prog(t, bugs[j].at, bugs[j].at + 0.35));
      const k = prog(t, b.at, b.at + 0.35);
      place(b.n, { o: k, y: 8 + above * ROW, x: (1 - easeOut(k)) * -30 });
    });
  }
  return { update };
}
