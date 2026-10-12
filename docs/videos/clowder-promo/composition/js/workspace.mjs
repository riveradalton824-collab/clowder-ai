// Workspace panel: files the cats create, tests they run, and the code card
// where cross-model review finds and fixes a real bug.
import { makeFace, updateFace } from './faces.mjs';
import { WS } from './timeline.mjs';
import { clamp, easeInOut, easeOut, h, place, prog, win } from '../../../promo-kit/util.mjs';

const CODE = [
  ['kw', 'export function ', 'fn', 'checkIn', '', '(cat, feeder) {'],
  ['', '  records.', 'fn', 'push', '', '({ cat, feeder, at: now() })'],
  ['kw', '  return ', 'fn', 'ok', '', '(cat)'],
  ['', '}'],
];
const FIX = ['kw', '  if ', 'fn', '(fedToday(cat)) ', 'kw', 'return ', 'fn', 'already', '', '(cat)'];
const LH = 34;

function codeLine(parent, parts) {
  const n = h('div', 'cl', parent);
  for (let i = 0; i < parts.length; i += 2) h('span', parts[i], n, parts[i + 1]);
  return n;
}

export function buildWorkspace(app) {
  const ws = h('div', 'ws', app);
  const files = h('div', 'card files', ws);
  h('div', 'card-k', files, '文件');
  const empty = h('div', 'empty', files, '还没有文件');
  const rows = WS.files.map((f, i) => {
    const r = h('div', 'frow', files);
    r.style.top = `${48 + i * 52}px`;
    h('span', 'ficon', r, f.name.split('.').pop().slice(0, 4));
    h('span', 'fname', r, f.name);
    const tag = h('span', 'ftag', r, '新建');
    makeFace(r, f.by, 30, 'face fface');
    return { r, f, tag };
  });
  const adoptRows = ['adopt.html', 'adopt.ts'].map((name, i) => {
    const r = h('div', 'frow', files);
    r.style.top = `${48 + i * 52}px`;
    h('span', 'ficon', r, name.split('.').pop());
    h('span', 'fname', r, name);
    h('span', 'ftag', r, '新建');
    makeFace(r, 'xian', 30, 'face fface');
    return r;
  });

  const code = h('div', 'card code', ws);
  const ch = h('div', 'code-head', code);
  h('span', 'fname', ch, 'checkin.ts');
  const reviewer = h('span', 'reviewer', ch);
  const yface = makeFace(reviewer, 'yan', 28, 'face fface');
  h('span', '', reviewer, '砚砚 review 中');
  const body = h('div', 'code-body', code);
  const scan = h('div', 'scan', body);
  const lines = CODE.map((p) => codeLine(body, p));
  const fix = codeLine(body, FIX);
  fix.classList.add('fix');
  const bugNote = h('div', 'bug-note', body, 'P1 · 同一只猫可被重复打卡');

  const tests = h('div', 'tests', ws);
  const spin = h('span', 'spin', tests);
  const ttxt = h('span', 'ttxt', tests);

  function update(t) {
    const day2 = t >= WS.adopt[0];
    let shown = 0;
    for (const { r, f, tag } of rows) {
      const k = easeOut(prog(t, f.at, f.at + 0.35));
      if (t >= f.at) shown++;
      place(r, { o: k * (1 - prog(t, WS.adopt[0], WS.adopt[0] + 0.3)), x: (1 - k) * 20 });
      updateFace(r.lastChild, t);
      const modified = f.name === 'checkin.ts' && t >= WS.fixAt;
      tag.textContent = modified ? '已修改' : '新建';
      tag.classList.toggle('mod', modified);
    }
    adoptRows.forEach((r, i) => {
      const k = easeOut(prog(t, WS.adopt[0] + 0.3 + i * 0.3, WS.adopt[0] + 0.6 + i * 0.3));
      place(r, { o: k, x: (1 - k) * 20 });
      updateFace(r.lastChild, t);
    });
    empty.style.opacity = shown === 0 && !day2 ? 1 : 0;

    const ck = win(t, WS.code[0], WS.code[1], 0.35);
    place(code, { o: ck, y: (1 - ck) * 10 });
    place(files, { o: 1 - ck });
    updateFace(yface, t);
    reviewer.style.opacity = t < WS.bugAt + 3.9 ? 1 : 0;
    const fk = easeInOut(prog(t, WS.fixAt, WS.fixAt + 0.5));
    lines.forEach((n, i) => {
      place(n, { y: i * LH + (i >= 1 ? fk * LH : 0) });
      n.classList.toggle('bug', i === 1 && t >= WS.bugAt && t < WS.fixAt + 0.6);
    });
    place(fix, { o: fk, y: LH + (1 - fk) * 6 });
    const sk = prog(t, WS.code[0] + 0.5, WS.bugAt);
    place(scan, { o: sk > 0 && sk < 1 ? 0.9 : 0, y: (Math.floor(sk * 6) % 4) * LH });
    place(bugNote, { o: win(t, WS.bugAt, WS.fixAt + 0.3, 0.25), y: 2 * LH + fk * LH + 6 });

    let label = '';
    let state = 'idle';
    if (t >= WS.tests1[0]) [label, state] = ['运行测试…', 'run'];
    if (t >= WS.tests1[1]) [label, state] = ['✓ 3 passed', 'ok'];
    if (t >= WS.bugAt) [label, state] = ['△ review：P1 待修', 'warn'];
    if (t >= WS.tests2[0]) [label, state] = ['运行测试…', 'run'];
    if (t >= WS.tests2[1]) [label, state] = ['✓ 4 passed · 新增：同日去重', 'ok'];
    if (day2) [label, state] = t >= WS.adopt[1] ? ['✓ 2 passed', 'ok'] : ['运行测试…', 'run'];
    ttxt.textContent = label;
    tests.className = `tests ${state}`;
    tests.style.opacity = clamp(prog(t, WS.tests1[0], WS.tests1[0] + 0.3));
    spin.style.transform = `rotate(${t * 360}deg)`;
    spin.style.display = state === 'run' ? '' : 'none';
  }
  return { ws, update };
}
