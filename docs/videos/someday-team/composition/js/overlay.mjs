// Always-on blueprint badge, section chips, the bottom band (quote, hold lines, tagline),
// the yarn balls, and the end card.
import { makeBall, placeBall } from '../../../promo-kit/ball.mjs';
import { easeOut, h, place, prog, svg, win } from '../../../promo-kit/util.mjs';
import { BADGE, BEFORE, DURATION, GROW, HOLDS, SECTIONS, STAGE } from './timeline.mjs';

const LOGO = '/site/assets/logo-transparent.png';
const BALL_R = 22;
const BANDS = [
  { at: [BEFORE.quote[0], BEFORE.quote[1]], zh: '「就差一个会 3D 的。」这句话，在会上说了三年。', en: '“We just need someone who knows 3D.” Said in meetings for three years.' },
  ...HOLDS.map((x) => ({ ...x, hold: true })),
  { at: [GROW.strike + 0.3, GROW.ballToWang[0] + 0.4], zh: '看着像，尺寸是编的。', en: 'Looks right. The sizes were made up.' },
  { at: [STAGE.tagline, STAGE.endcard[0] + 0.2], zh: '不是让人退场，是让人上场。', en: 'Not stepping aside. Stepping up.', big: true },
];

export const BAND_TEXT = BANDS.map((b) => `${b.zh} ${b.en}`).join(' ');

export function buildOverlay(stage) {
  const balls = svg('svg', { class: 'layer', width: 1920, height: 1080 }, stage);
  balls.style.zIndex = 60;
  const ballEls = [makeBall(balls, BALL_R), makeBall(balls, BALL_R)];

  const badge = h('div', 'badge', stage);
  h('i', '', badge);
  h('span', '', badge, BADGE);

  const chips = SECTIONS.map((s) => {
    const n = h('div', 'chip', stage);
    h('div', 'chip-n', n, s.n.replace(/[①②③④]/, (c) => String('①②③④'.indexOf(c) + 1)));
    const tx = h('div', '', n);
    h('div', 'chip-zh', tx, s.zh);
    h('div', 'chip-en', tx, s.en);
    return { n, s };
  });

  const bands = BANDS.map((b) => {
    const n = h('div', `band${b.hold ? ' hold' : ''}`, stage);
    const zh = h('div', 'band-zh', n, b.zh);
    if (b.big) zh.style.fontSize = '46px';
    h('div', 'band-en', n, b.en);
    return { n, b };
  });

  const end = h('div', 'endcard', stage);
  const ei = h('div', 'ec-in', end);
  const logo = h('img', 'ec-logo', ei);
  logo.src = LOGO;
  logo.alt = '';
  h('div', 'ec-name', ei, 'Clowder AI');
  h('div', 'ec-line', ei, '这是我们正在走向的样子');
  h('div', 'ec-en', ei, 'This is where we’re heading.');
  h('div', 'ec-badge', ei, BADGE);
  h('div', 'ec-note', end, '概念片 · 公司、人物与界面均为示意，不代表已上线的产品功能');

  function update(t, ballStates = []) {
    for (const { n, s } of chips) {
      const k = easeOut(prog(t, s.at[0], s.at[0] + 0.5));
      place(n, { o: win(t, s.at[0], s.at[1], 0.4), x: (1 - k) * -14 });
    }
    for (const { n, b } of bands) {
      const k = easeOut(prog(t, b.at[0], b.at[0] + 0.5));
      place(n, { o: win(t, b.at[0], b.at[1], 0.4), y: (1 - k) * 12 });
    }
    ballEls.forEach((g, i) => {
      const b = ballStates[i];
      if (!b || b.o <= 0) placeBall(g, -100, -100, 0, 1, 0);
      else placeBall(g, b.x, b.y, b.rot ?? 0, (b.r ?? BALL_R) / BALL_R, b.o ?? 1);
    });
    const ek = easeOut(prog(t, STAGE.endcard[0], STAGE.endcard[0] + 0.9));
    place(end, { o: ek, y: 0 });
    badge.style.opacity = 1 - ek;
    if (t > DURATION) end.style.opacity = 1;
  }
  return { update };
}
