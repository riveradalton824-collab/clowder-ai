// The apps on the desktop: the tutorial video, the Clowder chat window (S1 chore),
// and the modelling app the human switches to.
import { clamp, easeInOut, easeOut, h, lerp, place, prog, typed, win } from '../../../promo-kit/util.mjs';
import { makeDonut, makeWindow } from './desktop.mjs';
import { CHAT, MODEL, MODEL_DONUT, SLIDER, VIDEO, VIDEO_DONUT } from './geo.mjs';
import { NEXT, PAIN, S } from './timeline.mjs';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export function videoTime(t) {
  if (t < PAIN.chatIn[0]) return 200 + t;
  if (t < 10.6) return lerp(200 + PAIN.chatIn[0], 245, prog(t, PAIN.chatIn[0], 10.6));
  return 245 + (t - 10.6);
}
export function roughAt(t) {
  return lerp(0.62, 0.3, easeInOut(prog(t, NEXT.slider[0], NEXT.slider[1])));
}

export function buildApps(stage) {
  const video = makeWindow(stage, { ...VIDEO, hh: VIDEO.h, title: '视频 · 甜甜圈建模教程（第 3 集）', cls: 'video' });
  const vp = h('div', 'viewport dark', video.body);
  const vDonut = makeDonut(vp, '#1d1c1a');
  Object.assign(vDonut.s.style, { left: `${VIDEO_DONUT.left}px`, top: `${VIDEO_DONUT.top}px`, width: `${VIDEO_DONUT.w}px` });
  const sub = h('div', 'v-sub', vp);
  const ctl = h('div', 'v-ctl', video.body);
  h('span', 'v-play', ctl, '❚❚');
  const track = h('div', 'v-track', ctl);
  const fill = h('div', 'v-fill', track);
  const clock = h('span', 'v-time', ctl);
  const missed = h('div', 'missed', video.n);

  const model = makeWindow(stage, { ...MODEL, hh: MODEL.h, title: '建模 · donut.blend', cls: 'model' });
  const mvp = h('div', 'viewport grid', model.body);
  const mDonut = makeDonut(mvp, '#3b3936');
  Object.assign(mDonut.s.style, { left: `${MODEL_DONUT.left}px`, top: `${MODEL_DONUT.top}px`, width: `${MODEL_DONUT.w}px` });
  const panel = h('div', 'm-panel', model.body);
  h('div', 'm-k', panel, '材质 · 釉面');
  const row = (label, value) => {
    const r = h('div', 'm-row', panel);
    h('span', '', r, label);
    return h('b', '', r, value);
  };
  const roughVal = row('粗糙度', '0.62');
  const slider = h('div', 'm-slider', panel);
  slider.style.top = `${SLIDER.y - MODEL.y - 40}px`;
  const knob = h('i', 'm-knob', slider);
  const sfill = h('div', 'm-sfill', slider);
  h('div', 'm-gap', panel);
  row('金属度', '0.00');
  row('颜色', '#EC8FAA');

  const chat = makeWindow(stage, { ...CHAT, hh: CHAT.h, title: 'Clowder AI · 砚砚', cls: 'chat' });
  const cbody = h('div', 'c-body', chat.body);
  h('div', 'c-old', cbody, '昨天 · 砚砚：周报我放在共享区了。');
  const sent = h('div', 'c-msg', cbody);
  h('div', 'thumb small', sent);
  h('div', 'c-text', sent, PAIN.text);
  const composer = h('div', 'c-compose', chat.body);
  const cThumb = h('div', 'thumb small', composer);
  const cText = h('div', 'c-input', composer);
  h('div', 'c-send', composer, '发送');

  const snip = h('div', 'snip', stage);
  const flash = h('div', 'flash', stage);
  const thumb = h('div', 'thumb float', stage);

  function update(t) {
    // Video: always playing; dims behind the chat chore and the modelling app.
    const vt = videoTime(t);
    clock.textContent = `${fmt(vt)} / 12:45`;
    fill.style.width = `${(vt / 765) * 100}%`;
    sub.textContent = vt < 214 ? '接下来，我们调一下釉面的高光——' : vt < 248 ? '……粗糙度调低，反光就会更集中。' : '然后看一下底部的接触阴影。';
    vDonut.update({ rough: 0.4, angle: Math.sin(vt / 3) * 4 });
    const behindChat = win(t, PAIN.chatIn[0], PAIN.chatOut[1], 0.4);
    const sw = easeInOut(prog(t, NEXT.switchApp[0], NEXT.switchApp[1]));
    place(video.n, { o: clamp(t / 0.6) * (1 - 0.45 * behindChat) * (1 - 0.55 * sw), s: 1 - 0.02 * sw });
    video.n.style.zIndex = t < NEXT.switchApp[0] ? 3 : 1;
    missed.style.opacity = win(t, PAIN.missed[0], PAIN.missed[1] + 0.6, 0.3);
    missed.textContent = `离开视频 ${fmt(Math.max(0, vt - 204))}`;

    // Modelling app slides in front when the human switches apps.
    model.n.style.display = t >= NEXT.switchApp[0] ? '' : 'none';
    place(model.n, { o: sw, x: (1 - sw) * 140, s: lerp(0.97, 1, sw) });
    const rough = roughAt(t);
    const angle = lerp(0, 22, easeInOut(prog(t, NEXT.rotate[0], NEXT.rotate[1])));
    mDonut.update({ rough, angle });
    roughVal.textContent = rough.toFixed(2);
    knob.style.left = `${(rough * 100).toFixed(2)}%`;
    sfill.style.width = `${(rough * 100).toFixed(2)}%`;

    // Clowder chat window: the chore in S1; shrinks to a corner where the cat waits.
    const cin = easeOut(prog(t, PAIN.chatIn[0], PAIN.chatIn[1]));
    const shrink = easeInOut(prog(t, PAIN.chatOut[0], PAIN.chatOut[1]));
    const close = easeInOut(prog(t, 13.0, 13.7));
    chat.n.style.display = t >= PAIN.chatIn[0] && t < 13.8 ? '' : 'none';
    place(chat.n, { o: cin * (1 - close), x: (1 - cin) * 90, s: lerp(1, 0.55, shrink) * lerp(1, 0.8, close) });
    chat.n.style.zIndex = 4;
    cThumb.style.opacity = t >= PAIN.paste && t < PAIN.send ? 1 : 0;
    cText.textContent = t < PAIN.send ? typed(PAIN.text, t, PAIN.type[0], PAIN.type[1]) : '';
    place(sent, { o: easeOut(prog(t, PAIN.send, PAIN.send + 0.3)), y: (1 - easeOut(prog(t, PAIN.send, PAIN.send + 0.3))) * 12 });

    // Screenshot: selection, flash, floating thumbnail that gets pasted.
    const sk = easeOut(prog(t, PAIN.snip[0], PAIN.snip[1]));
    Object.assign(snip.style, { width: `${260 * sk}px`, height: `${170 * sk}px` });
    snip.style.opacity = t >= PAIN.snip[0] && t < PAIN.flash + 0.05 ? 1 : 0;
    flash.style.opacity = t >= PAIN.flash ? 0.75 * (1 - prog(t, PAIN.flash, PAIN.flash + 0.3)) : 0;
    const tk = easeOut(prog(t, PAIN.thumb[0], PAIN.thumb[1]));
    const pk = easeInOut(prog(t, PAIN.paste - 0.35, PAIN.paste));
    place(thumb, {
      o: t >= PAIN.thumb[0] && t < PAIN.paste ? 1 : 0,
      x: lerp(1660 + (1 - tk) * 80, 900, pk),
      y: lerp(880, 724, pk),
      s: lerp(1, 0.5, pk),
    });
    stage.classList.toggle('in-pain', t < S.promise[0]);
  }
  return { update, video, model };
}
