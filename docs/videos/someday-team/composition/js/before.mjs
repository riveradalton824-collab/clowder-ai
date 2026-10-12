// Before: three quick vignettes beside the wall: the meeting where it is put off, the draft
// folder untouched for three years, and a new idea buried under tickets. Screen coordinates.
import { easeIn, easeOut, h, place, prog, rng, typed, win } from '../../../promo-kit/util.mjs';
import { avatar } from './cast.mjs';
import { BEFORE, NOTES } from './timeline.mjs';

/** Where the hero note and the AR note take off from (screen px, the `before` camera). */
export const MEET_FROM = { x: 1600, y: 300 };
export const TICKET_FROM = { x: 1615, y: 456 };
const TICKETS = ['#4128 修复登录超时', '#4130 导出报表少一列', '#4131 门店价签更新', '#4133 会员积分对不上', '#4136 打印机驱动', '#4137 首页改版排期', '#4139 发票抬头校验'];

function card(stage, title) {
  const n = h('div', 'vig', stage);
  h('div', 'vig-h', n, title);
  return { n, b: h('div', 'vig-b', n) };
}
const show = (n, t, [a, b]) => {
  const k = easeOut(prog(t, a, a + 0.4));
  place(n, { o: win(t, a, b, 0.35), y: (1 - k) * 24 });
};

export function buildBefore(stage) {
  const meet = card(stage, '周会 · 2023.04');
  const lines = BEFORE.meetingLines.map((l) => {
    const row = h('div', 'mline', meet.b);
    row.appendChild(avatar(null, l.who, 44));
    const txt = h('div', `txt${l.who === 'lin' ? ' hot' : ''}`, row);
    return { row, txt, l };
  });
  const nods = h('div', 'nods', meet.b, '全场点头 · 记入「以后再说」');

  const folder = card(stage, '共享盘 › 产品 › 2023');
  const fr = h('div', 'frow', folder.b);
  h('div', 'fold', fr);
  h('span', '', fr, '3D说明书_draft');
  h('span', 'fmeta', fr, '最后修改：3 年前');
  for (const [name, date] of [['外壳参考图', '2023.03'], ['滤芯问题汇总.xlsx', '2023.04']]) {
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

  const tk = card(stage, '本周工单 · 待处理 37');
  tk.b.style.height = '440px';
  const ar = NOTES.find((n) => n.id === 'ar');
  const idea = h('div', 'ticket idea', tk.b, `${ar.text}？`);
  idea.style.top = '160px';
  const tickets = TICKETS.map((text, i) => {
    const n = h('div', 'ticket', tk.b);
    n.style.top = '0px';
    const [no, ...rest] = text.split(' ');
    h('b', '', n, no);
    h('span', '', n, rest.join(' '));
    return { n, at: BEFORE.tickets[0] + 0.7 + i * 0.42, y: 350 - i * 52 };
  });

  function update(t) {
    show(meet.n, t, BEFORE.meeting);
    for (const { row, txt, l } of lines) {
      row.style.opacity = prog(t, l.at - 0.2, l.at);
      txt.textContent = typed(l.text, t, l.at, l.at + 1.1) || ' ';
    }
    nods.style.opacity = prog(t, 7.9, 8.3);
    show(folder.n, t, BEFORE.folder);
    for (const p of dust) {
      const y = (p.y0 + (t - BEFORE.folder[0]) * p.v) % 280;
      place(p.d, { x: p.x + Math.sin(t * 0.8 + p.ph) * 6, y, o: 0.8 });
    }
    show(tk.n, t, BEFORE.tickets);
    idea.style.opacity = t < ar.at ? prog(t, BEFORE.tickets[0] + 0.3, BEFORE.tickets[0] + 0.6) : 0;
    for (const { n, at, y } of tickets) {
      const k = prog(t, at, at + 0.35);
      place(n, { o: k > 0 ? 1 : 0, y: y - (1 - easeIn(k)) * 420, r: (1 - k) * -4 });
    }
  }
  return { update };
}
