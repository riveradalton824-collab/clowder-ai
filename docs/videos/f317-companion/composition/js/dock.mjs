// The Live-style dock under the cat, the human's live transcript, the source the
// cat reads, and the typed history — the TODAY (prototype-tested) surface.
import { clamp, easeBack, easeOut, h, place, prog, typed, win } from '../../../promo-kit/util.mjs';
import { DOCK } from './geo.mjs';
import { NEXT, SPEECH, TODAY } from './timeline.mjs';

const ICON = {
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/></svg>',
  write: '<svg viewBox="0 0 24 24"><path d="M13 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7M15 4l5 5M9 15l1-5 8-8 4 4-8 8z"/></svg>',
  end: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10M7 17 17 7"/></svg>',
};
const SHARE_DOCK = [42.5, 44.6];

function status(t) {
  if (t >= SHARE_DOCK[0]) return t >= NEXT.pick[0] ? ['pending', '请在选择器里选一个窗口'] : ['live', '已连接 · 在听'];
  if (t < TODAY.connect) return ['idle', '点开始聊天，直接对我说话'];
  if (t < TODAY.connect + 0.45) return ['connecting', '连接中…'];
  if (t >= TODAY.lookup[0] && t < TODAY.lookup[1]) return ['lookup', '查资料 · F317 功能文档'];
  if (t >= TODAY.lookup[1] && t < 34.4) return ['speaking', '在说话'];
  return ['live', '已连接 · 在听'];
}

export function buildDock(stage) {
  const dock = h('div', 'dock', stage);
  Object.assign(dock.style, { left: `${DOCK.x}px`, top: `${DOCK.y}px`, width: `${DOCK.w}px` });
  const vs = h('div', 'voice-state', dock);
  const orb = h('i', 'orb', vs);
  const stxt = h('span', '', vs);
  const begin = h('button', 'begin', dock, '开始聊天');
  const controls = h('div', 'controls', dock);
  const writeBtn = [['mic', '静音'], ['speaker', '关声音'], ['write', '文字'], ['end', '结束']].map(([k, label]) => {
    const b = h('button', '', controls);
    b.innerHTML = `${ICON[k]}<span>${label}</span>`;
    return b;
  })[2];
  const access = h('div', 'access', dock);
  const share = h('button', 'share vision', access, '共享屏幕');
  const docs = h('button', '', access);

  const pill = h('div', 'speech', stage);
  const wave = h('span', 'wave', pill);
  const bars = Array.from({ length: 5 }, () => h('i', '', wave));
  h('b', '', pill, '你');
  const ptxt = h('span', 'p-txt', pill);

  const card = h('div', 'doc-card', stage);
  h('div', 'dc-k', card, '资料查询 · 只读');
  h('div', 'dc-path', card, 'docs/features/F317-coactive-companion.md');
  const line = h('div', 'dc-line', card, '# F317: Coactive Companion — 猫猫走进共同生活现场');
  const scan = h('div', 'dc-scan', card);
  const dstate = h('div', 'dc-state', card);

  const hist = h('div', 'history', stage);
  h('div', 'hi-head', hist, '宪宪 · 本次交流');
  h('div', 'hi-line you', hist, '你：F317 讲的是什么？');
  h('div', 'hi-line cat', hist, '宪宪：标题是「猫猫走进共同生活现场」。');
  const sentLine = h('div', 'hi-line you', hist, '你：好，先这样，我接着看视频。');
  const hcomp = h('div', 'hi-compose', hist);

  function update(t) {
    const open = Math.max(win(t, TODAY.dockOpen, TODAY.dockClose, 0.25), win(t, SHARE_DOCK[0], SHARE_DOCK[1], 0.25));
    const at = t >= SHARE_DOCK[0] - 0.3 ? SHARE_DOCK[0] : TODAY.dockOpen;
    const pop = clamp(easeBack(prog(t, at, at + 0.35)), 0, 1.1);
    dock.style.display = open > 0 ? '' : 'none';
    place(dock, { o: open, s: 0.85 + 0.15 * pop, y: (1 - pop) * 12 });
    const [st, label] = status(t);
    dock.dataset.state = st;
    stxt.textContent = label;
    orb.style.opacity = ['connecting', 'lookup', 'pending'].includes(st) ? 0.55 + 0.45 * Math.cos(t * 7) : 1;
    const connected = t >= TODAY.connect + 0.45;
    begin.style.display = connected ? 'none' : '';
    controls.style.display = connected ? '' : 'none';
    writeBtn.classList.toggle('on', t >= TODAY.history[0] && t < TODAY.history[1]);
    share.style.display = t >= SHARE_DOCK[0] ? '' : 'none';
    docs.textContent = connected ? '资料查询 · 已连接' : '资料查询';

    const sp = SPEECH.find((s) => t >= s.at[0] && t < s.at[1] + 0.7);
    pill.style.opacity = sp ? win(t, sp.at[0], sp.at[1] + 0.7, 0.2) : 0;
    if (sp) {
      ptxt.textContent = typed(sp.text, t, sp.at[0] + 0.1, sp.at[1]);
      const talking = t < sp.at[1];
      bars.forEach((b, i) => {
        b.style.height = `${talking ? 6 + Math.abs(Math.sin(t * (9 + i * 2.3) + i)) * 18 : 4}px`;
      });
    }

    const ck = easeOut(prog(t, TODAY.lookup[0], TODAY.lookup[0] + 0.35));
    place(card, { o: win(t, TODAY.lookup[0], 34.6, 0.3), x: (1 - ck) * 30 });
    const found = t >= TODAY.lookup[1] - 0.4;
    line.classList.toggle('hit', found);
    scan.style.opacity = found ? 0 : 1;
    scan.style.transform = `translateY(${(Math.floor((t - TODAY.lookup[0]) * 6) % 3) * 22}px)`;
    dstate.textContent = found ? '✓ 已读取 · 回答带出处' : '读取中…';

    const hk = easeOut(prog(t, TODAY.history[0], TODAY.history[0] + 0.35));
    place(hist, { o: win(t, TODAY.history[0], TODAY.history[1], 0.3), y: (1 - hk) * 14 });
    hcomp.textContent = t < TODAY.historyType[1] + 0.2 ? typed('好，先这样，我接着看视频。', t, TODAY.historyType[0], TODAY.historyType[1]) || '写一句…' : '写一句…';
    hcomp.classList.toggle('empty', t < TODAY.historyType[0] || t >= TODAY.historyType[1] + 0.2);
    sentLine.style.opacity = easeOut(prog(t, TODAY.historyType[1] + 0.2, TODAY.historyType[1] + 0.5));
  }
  return { update };
}
