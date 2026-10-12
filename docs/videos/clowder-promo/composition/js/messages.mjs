// A thread's message list: built once, measured once, then driven by time.
import { makeFace, updateFace } from './faces.mjs';
import { CATS } from './timeline.mjs';
import { clamp, easeBack, easeOut, h, lerp, place, prog, typed } from '../../../promo-kit/util.mjs';

const COL_W = 900;
const PAD = 24;
const GAP = 30;
export const VIEW_H = 776;

export function buildList(parent, msgs) {
  const root = h('div', 'scroll', parent);
  const items = msgs.map((m) => {
    const n = h('div', `msg ${m.who === 'you' ? 'you' : 'cat'}`, root);
    const it = { m, n };
    if (m.who === 'you') {
      it.av = h('div', 'av you-av', n, '你');
    } else {
      it.av = makeFace(n, m.who, 72, 'face av');
    }
    const body = h('div', 'm-body', n);
    const meta = h('div', 'm-meta', body);
    if (m.who === 'you') {
      h('b', '', meta, '你');
    } else {
      h('b', '', meta, CATS[m.who].name);
      h('span', 'model', meta, CATS[m.who].model);
      if (m.busy) {
        it.busy = h('span', 'busy', meta);
        it.busyLabel = m.busy;
      }
    }
    it.bubble = h('div', 'bubble', body);
    if (m.memory) {
      it.mem = h('div', 'memo', it.bubble);
      h('div', 'memo-from', it.mem, m.memory.from);
      h('div', 'memo-quote', it.mem, m.memory.quote);
    }
    if (m.tag) it.tag = h('span', 'tag', it.bubble, m.tag);
    it.txt = h('span', 'txt', it.bubble, m.text);
    it.caret = h('span', 'caret', it.bubble);
    if (m.react) {
      it.react = h('div', 'react', body);
      makeFace(it.react, m.react.who, 26, 'face react-face');
      h('span', '', it.react, `${m.react.text} ✓`);
    }
    return it;
  });

  const anchors = {};
  const targets = [];
  function layout() {
    let y = PAD;
    for (const it of items) {
      it.bubble.style.width = `${Math.ceil(it.bubble.getBoundingClientRect().width) + 1}px`;
      it.bubble.style.minHeight = `${Math.ceil(it.bubble.getBoundingClientRect().height)}px`;
      it.n.style.top = `${y}px`;
      it.top = y;
      const ht = it.n.offsetHeight;
      const you = it.m.who === 'you';
      anchors[it.m.id] = { x: you ? COL_W - PAD - 36 - 30 : PAD + 36 + 30, y: y + 66, you };
      if (it.mem) {
        const my = y + it.bubble.offsetTop + it.mem.offsetTop + it.mem.offsetHeight / 2;
        anchors[`${it.m.id}:memo`] = { x: PAD + it.bubble.offsetLeft + 6, y: my };
      }
      targets.push({ at: it.m.at, s: Math.max(0, y + ht + 40 - VIEW_H) });
      y += ht + GAP;
    }
    root.style.height = `${y}px`;
  }

  function scrollAt(t) {
    let s = 0;
    for (const g of targets) {
      if (t < g.at) break;
      s = lerp(s, g.s, easeOut(prog(t, g.at, g.at + 0.6)));
    }
    return s;
  }

  function update(t) {
    root.style.transform = `translateY(${-scrollAt(t)}px)`;
    for (const it of items) {
      const { m } = it;
      const k = easeOut(prog(t, m.at, m.at + 0.35));
      place(it.n, { o: k, y: (1 - k) * 14 });
      if (m.who !== 'you') updateFace(it.av, t);
      const showAt = m.type ? m.at : Math.min(m.textAt, m.memory ? m.memory.at : m.textAt);
      const bk = easeOut(prog(t, showAt, showAt + 0.3));
      it.bubble.style.opacity = bk;
      it.bubble.style.transform = `scale(${lerp(0.96, 1, bk)})`;
      if (m.type) {
        it.txt.textContent = typed(m.text, t, m.type[0], m.type[1]);
        const typing = t >= m.at && t < m.type[1] + 0.5;
        const blink = t >= m.type[0] && t <= m.type[1] ? 1 : Math.floor(t * 2.4) % 2;
        it.caret.style.opacity = typing ? blink : 0;
      } else {
        const len = Array.from(m.text).length;
        it.txt.textContent = typed(m.text, t, m.textAt, m.textAt + Math.max(0.5, len / 24));
        it.caret.style.opacity = 0;
      }
      if (it.tag) it.tag.style.opacity = prog(t, m.textAt, m.textAt + 0.2);
      if (it.mem) {
        const mk = easeOut(prog(t, m.memory.at, m.memory.at + 0.45));
        place(it.mem, { o: mk, x: (1 - mk) * -16 });
      }
      if (it.busy) {
        const on = t >= m.at + 0.3 && t < m.textAt;
        it.busy.style.opacity = on ? 1 : 0;
        it.busy.textContent = `${it.busyLabel}${'·'.repeat(1 + (Math.floor(t * 3) % 3))}`;
      }
      if (it.react) {
        const rk = clamp(easeBack(prog(t, m.react.at, m.react.at + 0.35)), 0, 1.2);
        place(it.react, { o: prog(t, m.react.at, m.react.at + 0.15), s: rk });
        updateFace(it.react.firstChild, t);
      }
    }
  }
  return { root, items, anchors, layout, scrollAt, update };
}
