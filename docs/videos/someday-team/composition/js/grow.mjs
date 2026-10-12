// ④ It gets better at being this team: practice rounds against the true outline; Zhou's one
// line freezes the montage and becomes part of the method; two new methods compared under the
// same conditions and re-checked on a new task; B struck; Wang adopts A, reversible.
import { easeInOut, easeOut, h, place, prog, quad } from '../../../promo-kit/util.mjs';
import { avatar, catFace } from './cast.mjs';
import { makeWang } from './judge.mjs';
import { GROW, S } from './timeline.mjs';
import { VIEW } from './work.mjs';

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export function buildGrow(stage) {
  const method = h('div', 'rz panel method', stage);
  const mh = h('div', 'panel-h', method);
  mh.appendChild(catFace(null, 'xian', 32));
  const mTitle = h('span', '', mh, '宪宪的练法 v1');
  const mb = h('div', 'panel-b', method);
  const add = h('div', 'me-row new', mb, '⓪ 先打稿（大形），再上细节');
  h('em', '', add, '← 小周说的');
  for (const r of ['① 照着照片捏', '② 和真实轮廓比对，打分', '③ 不像就重捏，再比']) h('div', 'me-row', mb, r);

  const wash = h('div', 'freeze-wash', stage);
  const freeze = h('div', 'freeze', stage);
  freeze.appendChild(avatar(null, 'zhou', 48));
  h('span', '', freeze, '「先打稿，再上细节。」');

  const cmp = h('div', 'rz panel cmp', stage);
  const ch = h('div', 'panel-h', cmp, '宪宪又想了两种新练法');
  ch.style.gap = '10px';
  const cb = h('div', 'panel-b', cmp);
  const chips = h('div', 'cmp-h', cb);
  for (const c of ['同一批练习', '同样条件', '再到没参与挑选的新任务上复验']) h('span', '', chips, c);
  const cards = h('div', 'cmp-cards', cb);
  const card = (k, t, lines) => {
    const n = h('div', 'cc', cards);
    h('div', 'cc-k', n, k);
    h('div', 'cc-t', n, t);
    const m = h('div', 'cc-m', n);
    for (const [label, v, cls] of lines) {
      const row = h('div', '', m, `${label} `);
      h('b', cls, row, v);
    }
    return n;
  };
  const A = card('A', '先打稿，按真实尺寸比对', [['练习分', '96%', ''], ['新任务复验', '尺寸对 ✓', 'good']]);
  const B = card('B', '为了少问人、分数好看，直接从网图猜尺寸', [['练习分', '97%', ''], ['新任务复验', '尺寸是编的 ✗', 'bad']]);
  const strike = h('div', 'strike', B);
  const adoptRow = h('div', '', A);
  const adopt = h('div', 'adopt', adoptRow, '王总点头 · 已采用');
  const undo = h('div', 'undo', adoptRow, '随时可退回');
  const wang = makeWang(stage);
  const practiceBall = { x: VIEW.x + VIEW.w - 70, y: VIEW.y + 130 };

  function update(t) {
    const on = t >= S.grow[0] && t < GROW.toWall[1];
    const mk = easeOut(prog(t, GROW.montage1[0], GROW.montage1[0] + 0.6));
    place(method, { o: on ? mk * (1 - prog(t, GROW.compare[0] - 0.4, GROW.compare[0])) : 0, x: (1 - mk) * 30 });
    const ck = easeOut(prog(t, GROW.compare[0], GROW.compare[0] + 0.6));
    const out = 1 - prog(t, GROW.toWall[0], GROW.toWall[0] + 0.6);
    place(cmp, { o: on ? ck * out : 0, x: (1 - ck) * 30 });
    const wk = easeOut(prog(t, GROW.ballToWang[0] - 0.6, GROW.ballToWang[0] - 0.2));
    place(wang, { o: on ? wk * out : 0, y: (1 - wk) * 16 });
    const fz = Math.min(prog(t, GROW.freeze[0], GROW.freeze[0] + 0.25), 1 - prog(t, GROW.montage2[0] - 0.3, GROW.montage2[0]));
    wash.style.opacity = on ? fz : 0;
    const fk = easeOut(prog(t, GROW.freeze[0] + 0.2, GROW.freeze[0] + 0.6));
    place(freeze, { o: on ? fz * fk : 0, y: (1 - fk) * 14 });
    if (!on) return [];

    const ak = easeOut(prog(t, GROW.method[0], GROW.method[0] + 0.5));
    place(add, { o: ak, x: (1 - ak) * -20 });
    mTitle.textContent = t >= GROW.method[0] + 0.3 ? '宪宪的练法 v2 · 自己改的' : '宪宪的练法 v1';
    A.style.opacity = prog(t, GROW.compare[0] + 0.6, GROW.compare[0] + 1.0);
    B.style.opacity = prog(t, GROW.compare[0] + 1.0, GROW.compare[0] + 1.4);
    strike.style.transform = `rotate(-14deg) scaleX(${easeOut(prog(t, GROW.strike, GROW.strike + 0.35))})`;
    B.style.opacity *= t >= GROW.strike + 0.4 ? 0.7 : 1;
    A.classList.toggle('win', t >= GROW.adopt);
    adopt.style.opacity = prog(t, GROW.adopt, GROW.adopt + 0.3);
    undo.style.opacity = prog(t, GROW.adopt + 0.5, GROW.adopt + 0.8);

    // the ball stays with the practising cat, then goes to Wang for the nod
    const to = center(wang.firstChild.firstChild);
    const bk = easeInOut(prog(t, GROW.ballToWang[0], GROW.ballToWang[1]));
    const p = quad(practiceBall, { x: 1300, y: 300 }, { x: to.x, y: to.y - 58 }, bk);
    return [{ x: p.x, y: p.y + (bk ? 0 : Math.sin(t * 3) * 3), rot: t * 50 + bk * 600, o: prog(t, GROW.montage1[0], GROW.montage1[0] + 0.4) * out }];
  }
  return { update };
}
