// ③ Whoever owns it makes the call: the cats lay the trade-off out with its basis; the ball goes to
// Leslie, who owns the user side; the music hushes; she picks and says why in her own words.
import { easeInOut, easeOut, h, place, prog, quad } from '../../../promo-kit/util.mjs';
import { avatar, catFace, handle } from './cast.mjs';
import { JUDGE, S } from './timeline.mjs';
import { makeCursor, say } from './ui.mjs';

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** The person a call belongs to, bottom right: avatar, @handle, and why it is theirs. ③ and ④ use it. */
export function makeOwner(stage, who, why) {
  const n = h('div', 'owner', stage);
  n.appendChild(avatar(null, who, 56));
  const col = h('div', '', n);
  h('b', '', col, handle(who));
  h('span', '', col, why);
  n.av = n.firstChild.firstChild;
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
  h('div', 'tr-q', b, '内部结构公开到哪？');
  h('div', 'tr-by', b, '透明了用户更信任；可竞品也看得见。');
  const basis = h('div', 'tr-basis', b, '依据：近一年七成售后问题，出在滤芯、水箱、滴水盘（售后记录）');
  const opt = (k, t, s) => {
    const n = h('div', 'tr-opt', b);
    h('b', '', n, `${k} · ${t}`);
    h('span', '', n, s);
    return { n, check: h('div', 'tr-check', n, `${handle('leslie')} 定`) };
  };
  const A = opt('A', '全部公开', '最透明；核心结构也一并给人看。');
  const B = opt('B', '只公开用户自己能换的部件', '滤芯、水箱、滴水盘看得清；核心结构不外露。');
  const owner = makeOwner(stage, 'leslie', '离这件事最近：用户这一块归她');
  const reason = say(stage, 'leslie', '用户要的是自己能换的那三样；核心结构拆给他们看，只会多出一堆电话。');
  reason.querySelector('.say-body').style.maxWidth = '560px';
  const cur = makeCursor(stage, 'leslie');

  function update(t) {
    const on = t >= S.judge[0] && t < S.judge[1] + 0.4;
    const out = 1 - prog(t, S.judge[1] - 0.4, S.judge[1]);
    const k = easeOut(prog(t, JUDGE.card[0], JUDGE.card[0] + 0.6));
    place(card, { o: on ? k * out : 0, x: (1 - k) * 30 });
    const wk = easeOut(prog(t, JUDGE.ballToLeslie[0] - 0.4, JUDGE.ballToLeslie[0]));
    place(owner, { o: on ? wk * out : 0, y: (1 - wk) * 16 });
    cur.style.opacity = 0;
    if (!on) {
      reason.style.opacity = 0;
      return [];
    }
    basis.style.opacity = prog(t, JUDGE.card[0] + 1.4, JUDGE.card[0] + 1.8);
    A.n.style.opacity = prog(t, JUDGE.card[0] + 2.0, JUDGE.card[0] + 2.4);
    B.n.style.opacity = prog(t, JUDGE.card[0] + 2.4, JUDGE.card[0] + 2.8);
    const picked = t >= JUDGE.pick;
    B.n.classList.toggle('picked', picked);
    B.check.style.opacity = prog(t, JUDGE.pick, JUDGE.pick + 0.3);
    A.n.style.opacity *= picked ? 0.55 : 1;
    const bc = center(B.n);
    cur.move(t, { x: bc.x - 120, y: bc.y + 200 }, { x: bc.x + 40, y: bc.y }, JUDGE.pick - 1.0, JUDGE.pick - 0.1, JUDGE.pick, JUDGE.pick + 0.9);
    const rk = easeOut(prog(t, JUDGE.reason[0], JUDGE.reason[0] + 0.4));
    place(reason, { o: rk * (1 - prog(t, JUDGE.reason[1] - 0.4, JUDGE.reason[1])), x: 1160, y: 700 + (1 - rk) * 10 });

    const from = center(faces);
    const to = center(owner.av);
    const bk = easeInOut(prog(t, JUDGE.ballToLeslie[0], JUDGE.ballToLeslie[1]));
    const p = quad({ x: 1826, y: from.y }, { x: 1900, y: 520 }, { x: to.x, y: to.y - 58 }, bk);
    return [{ x: p.x, y: p.y, rot: bk * 900, o: prog(t, JUDGE.card[0] + 0.6, JUDGE.card[0] + 1.0) * out }];
  }
  return { update };
}
