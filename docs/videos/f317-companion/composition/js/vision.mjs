// NEXT register (in development): blueprint wash, choosing what it sees,
// pointing both ways, following across apps, stale answers, pause.
import { clamp, easeInOut, easeOut, h, lerp, place, prog, svg, win } from '../../../promo-kit/util.mjs';
import { MODEL, MODEL_DONUT, PICKER, VIDEO, VIDEO_DONUT, donutPoint, shareChip } from './geo.mjs';
import { NEXT, SPOT } from './timeline.mjs';

const HL = { x: 222, y: 148 };
const CONTACT = { x: 300, y: 318 };

export function buildVision(stage) {
  const wash = h('div', 'blueprint', stage);
  const intro = h('div', 'next-intro', stage);
  h('div', 'ni-zh', intro, '接下来，它要陪你一起看。');
  h('div', 'ni-en', intro, 'Next — in development');

  const picker = h('div', 'picker', stage);
  Object.assign(picker.style, { left: `${PICKER.x}px`, top: `${PICKER.y}px`, width: `${PICKER.w}px` });
  h('div', 'pk-title', picker, '选择要共享的窗口');
  const rows = ['视频 · 甜甜圈建模教程', '建模 · donut.blend', '整个屏幕'].map((t) => h('div', 'pk-row', picker, t));
  h('div', 'pk-note', picker, '只共享你选的范围 · 系统声音默认关闭');

  const layer = svg('svg', { class: 'layer vision-layer', viewBox: '0 0 1920 1080' }, stage);
  const frame = svg('rect', { class: 'share-frame', rx: 18 }, layer);
  const ring = svg('circle', { class: 'click-ring', r: 30 }, layer);
  const mark = (cls) => svg('ellipse', { class: `mark ${cls}`, pathLength: 1 }, layer);
  const markVideo = mark('cat');
  const markModel = mark('cat');
  const markShadow = mark('cat');
  const chip = h('div', 'share-chip', stage);
  const chipTxt = h('span', '', chip);
  const pause = h('button', 'pause', chip, '暂停共享');
  const youTag = h('div', 'tag you-tag', stage, '你指的位置');
  const catTag = h('div', 'tag cat-tag', stage, '砚砚指回来 · 这块高光？');
  const shadowTag = h('div', 'tag cat-tag', stage, '底部接触阴影');
  const answer = h('div', 'answer', stage);
  h('div', 'an-k', answer, '砚砚 · 深思中的回答');
  h('div', 'an-txt', answer, '建议：提高环境光遮蔽，让高光更柔和。');
  const staleTag = h('div', 'an-stale', answer, '你换了说法 · 旧答案已作废');
  const thought = h('div', 'thought', stage);
  h('i', 'dots', thought);
  h('span', '', thought, '我在核对这处阴影，你继续说。');

  const vHL = donutPoint(VIDEO, VIDEO_DONUT, HL);
  const mHL = donutPoint(MODEL, MODEL_DONUT, HL);
  const ellipse = (el, c, rx, ry, k) => {
    Object.entries({ cx: c.x, cy: c.y, rx, ry }).forEach(([a, v]) => el.setAttribute(a, v));
    el.style.strokeDashoffset = 1 - k;
  };

  function update(t) {
    const on = t >= NEXT.wash[0] - 0.1 && t < NEXT.end + 0.6;
    for (const n of [wash, layer, chip, picker, youTag, catTag, shadowTag, answer, thought]) n.style.display = on ? '' : 'none';
    wash.style.opacity = win(t, NEXT.wash[0], NEXT.end + 0.5, 0.8);
    place(intro, { o: win(t, NEXT.intro[0], NEXT.intro[1], 0.4), y: (1 - easeOut(prog(t, NEXT.intro[0], NEXT.intro[0] + 0.6))) * 14 });
    if (!on) return;

    const pk = win(t, NEXT.pick[0], NEXT.pick[1], 0.2);
    place(picker, { o: pk, s: lerp(0.96, 1, pk) });
    rows.forEach((r, i) => r.classList.toggle('sel', i === 0 && t >= NEXT.pick[0] + 0.8));

    // Shared-window frame follows video → model, and stops at once on pause.
    const sw = easeInOut(prog(t, NEXT.switchApp[0], NEXT.switchApp[1]));
    const box = ['x', 'y', 'w', 'h'].reduce((o, k) => ({ ...o, [k]: lerp(VIDEO[k], MODEL[k], sw) }), {});
    const fk = easeOut(prog(t, NEXT.frame[0], NEXT.frame[1]));
    const sharing = t >= NEXT.frame[0] && t < NEXT.pause;
    Object.entries({ x: box.x - 8, y: box.y - 8, width: box.w + 16, height: box.h + 16 }).forEach(([a, v]) => frame.setAttribute(a, v));
    frame.style.opacity = sharing ? fk : 0;
    frame.style.strokeDashoffset = -t * 40;
    const c = shareChip(box);
    chip.style.left = `${c.x}px`;
    chip.style.top = `${c.y}px`;
    chip.classList.toggle('stopped', t >= NEXT.pause);
    chipTxt.textContent =
      t >= NEXT.pause ? '已停止共享 · 不再看画面' : sw > 0.5 ? '共享中：建模窗口 · 本次跟随' : '共享中：视频窗口 · 系统声音关';
    pause.style.display = t >= NEXT.pause ? 'none' : '';
    chip.style.opacity = t >= NEXT.frame[0] ? fk * (1 - prog(t, NEXT.end - 0.6, NEXT.end)) : 0;

    // Pointing both ways on the video frame.
    const rk = prog(t, NEXT.pointAt, NEXT.pointAt + 0.6);
    ring.setAttribute('cx', vHL.x);
    ring.setAttribute('cy', vHL.y);
    ring.setAttribute('r', 14 + 30 * easeOut(rk));
    ring.style.opacity = rk > 0 && rk < 1 ? 1 - rk : 0;
    place(youTag, { o: win(t, NEXT.pointAt, NEXT.pointBack + 0.2, 0.2), x: vHL.x - 70, y: vHL.y + 40 });
    const vis1 = win(t, NEXT.pointBack, NEXT.switchApp[0], 0.25);
    ellipse(markVideo, vHL, 86, 36, easeInOut(prog(t, NEXT.pointBack, NEXT.pointBack + 0.6)));
    markVideo.style.opacity = vis1;
    place(catTag, { o: vis1, x: vHL.x - 40, y: vHL.y - 92 });

    // Same topic in the modelling app; then the target changes while it thinks.
    const vis2 = win(t, NEXT.switchApp[1] + 0.6, NEXT.rotate[0], 0.25);
    ellipse(markModel, mHL, 72, 30, easeInOut(prog(t, NEXT.switchApp[1] + 0.6, NEXT.switchApp[1] + 1.2)));
    markModel.style.opacity = vis2;
    const shadowAt = donutPoint(MODEL, MODEL_DONUT, { x: CONTACT.x + 22 * 1.4, y: CONTACT.y });
    ellipse(markShadow, shadowAt, 210, 40, easeInOut(prog(t, NEXT.newMark, NEXT.newMark + 0.7)));
    const vis3 = win(t, NEXT.newMark, NEXT.pause, 0.25);
    markShadow.style.opacity = vis3;
    place(shadowTag, { o: vis3, x: shadowAt.x - 70, y: shadowAt.y + 50 });

    const ak = easeOut(prog(t, NEXT.think[0] + 1.2, NEXT.think[0] + 1.6));
    place(answer, { o: win(t, NEXT.think[0] + 1.2, NEXT.stale + 1.3, 0.3), y: (1 - ak) * 10 });
    answer.classList.toggle('stale', t >= NEXT.stale);
    staleTag.style.opacity = clamp(prog(t, NEXT.stale, NEXT.stale + 0.2));
    const tk = win(t, NEXT.think[0], NEXT.think[1], 0.25);
    thought.style.right = `${1920 - (SPOT.model.x + 40)}px`;
    thought.style.bottom = `${1080 - (SPOT.model.y + 30)}px`;
    place(thought, { o: tk, y: (1 - easeOut(prog(t, NEXT.think[0], NEXT.think[0] + 0.3))) * 8 });
  }
  return { update };
}
