// ③ People make the call: the cats lay the trade-off out with its basis; the ball goes to
// Wang, the music hushes, he picks "only the parts users can replace".
import { easeInOut, easeOut, h, place, prog, quad } from '../../../promo-kit/util.mjs';
import { avatar, catFace } from './cast.mjs';
import { JUDGE, S } from './timeline.mjs';

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** Wang's avatar, bottom right; ③ and ④ both hand him the ball. */
export function makeWang(stage) {
  const n = h('div', 'wang', stage);
  n.appendChild(avatar(null, 'wang', 60, true));
  return n;
}

export function buildJudge(stage) {
  const card = h('div', 'rz panel trade', stage);
  const hd = h('div', 'panel-h', card);
  const faces = h('span', 'who-row', hd);
  faces.appendChild(catFace(null, 'momo', 32));
  faces.appendChild(catFace(null, 'xian', 32));
  h('span', '', hd, '取舍 · 墨墨整理，宪宪核对');
  const b = h('div', 'panel-b', card);
  h('div', 'tr-q', b, '内部结构要全部公开吗？');
  h('div', 'tr-by', b, '透明了用户更信任；可竞品也看得见。');
  const basis = h('div', 'tr-basis', b, '依据：近一年七成售后问题，出在滤芯、水箱、滴水盘（老陈的售后记录）');
  const opt = (k, t, s) => {
    const n = h('div', 'tr-opt', b);
    h('b', '', n, `${k} · ${t}`);
    h('span', '', n, s);
    return { n, check: h('div', 'tr-check', n, '王总拍板') };
  };
  const A = opt('A', '全部公开', '最透明；核心结构也一并给人看。');
  const B = opt('B', '只公开用户自己能换的部件', '滤芯、水箱、滴水盘看得清；核心结构不外露。');
  const wang = makeWang(stage);

  function update(t) {
    const on = t >= S.judge[0] && t < S.judge[1] + 0.4;
    const k = easeOut(prog(t, JUDGE.card[0], JUDGE.card[0] + 0.6));
    place(card, { o: on ? k * (1 - prog(t, S.judge[1] - 0.4, S.judge[1])) : 0, x: (1 - k) * 30 });
    const wk = easeOut(prog(t, JUDGE.ballToWang[0] - 0.4, JUDGE.ballToWang[0]));
    place(wang, { o: on ? wk * (1 - prog(t, S.judge[1] - 0.4, S.judge[1])) : 0, y: (1 - wk) * 16 });
    if (!on) return [];
    basis.style.opacity = prog(t, JUDGE.card[0] + 1.4, JUDGE.card[0] + 1.8);
    A.n.style.opacity = prog(t, JUDGE.card[0] + 2.0, JUDGE.card[0] + 2.4);
    B.n.style.opacity = prog(t, JUDGE.card[0] + 2.4, JUDGE.card[0] + 2.8);
    const picked = t >= JUDGE.pick;
    B.n.classList.toggle('picked', picked);
    B.check.style.opacity = prog(t, JUDGE.pick, JUDGE.pick + 0.3);
    A.n.style.opacity *= picked ? 0.55 : 1;

    const from = center(faces);
    const to = center(wang.firstChild.firstChild);
    const bk = easeInOut(prog(t, JUDGE.ballToWang[0], JUDGE.ballToWang[1]));
    const p = quad({ x: 1826, y: from.y }, { x: 1900, y: 520 }, { x: to.x, y: to.y - 58 }, bk);
    return [{ x: p.x, y: p.y, rot: bk * 900, o: prog(t, JUDGE.card[0] + 0.6, JUDGE.card[0] + 1.0) }];
  }
  return { update };
}
