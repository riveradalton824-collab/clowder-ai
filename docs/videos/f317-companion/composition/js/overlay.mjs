// Narration captions, the TODAY / NEXT register chip, the title card, and the
// closing line + end card.
import { easeOut, h, place, prog, win } from '../../../promo-kit/util.mjs';
import { CAPTIONS, HOME, S, TITLE } from './timeline.mjs';

const LOGO = '/site/assets/logo-transparent.png';

export function buildOverlay(stage) {
  const caps = CAPTIONS.map((c) => {
    const n = h('div', 'caption', stage);
    h('div', 'cap-zh', n, c.zh);
    h('div', 'cap-en', n, c.en);
    return { n, c };
  });
  const reg = (cls, zh, en) => {
    const n = h('div', `register ${cls}`, stage);
    h('i', '', n);
    h('b', '', n, zh);
    h('span', '', n, en);
    return n;
  };
  const today = reg('today', '今天 · 原型实测', 'Prototype, tested by people');
  const next = reg('next', '接下来 · 开发中', 'In development');

  const title = h('div', 'title-card', stage);
  const tl = h('img', '', title);
  tl.src = LOGO;
  tl.alt = '';
  const tt = h('div', 'tc-text', title);
  h('div', 'tc-no', tt, 'F317 · Coactive Companion');
  h('div', 'tc-zh', tt, '猫猫走进共同生活现场');

  const homeWash = h('div', 'home-wash', stage);
  const line = h('div', 'home-line', stage);
  h('div', 'hl-zh', line, '我在这里，你接着看。');
  h('div', 'hl-sub', line, '想聊就说，想指就指。');
  h('div', 'hl-sub', line, '不必每句话都变成一件任务。');
  h('div', 'hl-en', line, "I'm right here — keep watching.");

  const end = h('div', 'endcard', stage);
  const el = h('img', 'ec-logo', end);
  el.src = LOGO;
  el.alt = '';
  h('div', 'ec-name', end, 'Clowder AI');
  h('div', 'ec-feat', end, 'F317 · Coactive Companion · 猫猫走进共同生活现场');
  const st = h('div', 'ec-status', end);
  h('div', 'ec-row today', st, '● 今天：桌面上的猫 · 点猫语音或打字 · 查功能文档（原型实测）');
  h('div', 'ec-row next', st, '○ 接下来：选共享范围 · 互相指点 · 跨应用跟随 · 随时暂停（开发中）');
  h('div', 'ec-url', end, 'zts212653.github.io/clowder-ai');
  const note = h('div', 'ec-note', stage, '示意动画 · 「今天」依据 F317 记录的原型测试；「接下来」为开发中的设计，以实际交付为准');

  function update(t) {
    for (const { n, c } of caps) {
      const k = easeOut(prog(t, c.at[0], c.at[0] + 0.45));
      place(n, { o: win(t, c.at[0], c.at[1], 0.35), y: (1 - k) * -8 });
    }
    today.style.opacity = win(t, S.today[0], S.today[1], 0.4);
    next.style.opacity = win(t, S.next[0] + 0.4, S.next[1], 0.4);
    const tk = easeOut(prog(t, TITLE.at[0], TITLE.at[0] + 0.6));
    place(title, { o: win(t, TITLE.at[0], TITLE.at[1], 0.5), y: (1 - tk) * 14 });

    homeWash.style.opacity = easeOut(prog(t, S.home[0], S.home[0] + 1.0)) * 0.92;
    const lk = easeOut(prog(t, HOME.line[0], HOME.line[0] + 0.8));
    place(line, { o: win(t, HOME.line[0], HOME.line[1], 0.6), x: (1 - lk) * -20 });
    const ek = easeOut(prog(t, HOME.end[0] + 0.3, HOME.end[0] + 1.3));
    place(end, { o: ek * (1 - prog(t, HOME.end[1] - 0.5, HOME.end[1])), y: (1 - ek) * 16 });
    note.style.opacity = ek * 0.75 * (1 - prog(t, HOME.end[1] - 0.5, HOME.end[1]));
  }
  return { update };
}
