// The human's pointer. PATH and CLICKS are pure data (the score imports CLICKS);
// while dragging the cat or the slider, the pointer rides the dragged object.
import { easeInOut, h, lerp, prog } from '../../../promo-kit/util.mjs';
import { DOCK_BTN, MODEL, PICKER, SLIDER, VIDEO, VIDEO_DONUT, donutPoint, petCenter, shareChip, sliderX } from './geo.mjs';
import { NEXT, PAIN, SPOT, TODAY } from './timeline.mjs';

const vHL = donutPoint(VIDEO, VIDEO_DONUT, { x: 222, y: 148 });
const land = petCenter(SPOT.land);
const atVideo = petCenter(SPOT.video);
const pauseBtn = shareChip(MODEL).pause;

/** [t, x, y, kind] — kind holds until the next keyframe. */
export const PATH = [
  [0, 980, 720, 'arrow'], [2.5, 560, 300, 'cross'], [2.8, 560, 300, 'cross'], [3.4, 820, 470, 'cross'],
  [3.6, 820, 470, 'arrow'], [4.7, 1180, 760, 'arrow'], [5.0, 1180, 760, 'arrow'], [8.4, 1670, 768, 'arrow'],
  [8.7, 1670, 768, 'arrow'], [10.0, 1100, 640, 'arrow'],
  [20.4, 1250, 900, 'arrow'], [21.0, land.x, land.y, 'grab'], [23.4, atVideo.x, atVideo.y, 'arrow'],
  [23.8, atVideo.x, atVideo.y, 'arrow'], [24.5, DOCK_BTN.begin.x, DOCK_BTN.begin.y, 'arrow'],
  [24.7, DOCK_BTN.begin.x, DOCK_BTN.begin.y, 'arrow'], [25.6, 1180, 990, 'arrow'],
  [34.3, DOCK_BTN.write.x, DOCK_BTN.write.y, 'arrow'], [34.6, DOCK_BTN.write.x, DOCK_BTN.write.y, 'arrow'],
  [35.4, 1100, 760, 'arrow'], [39.0, atVideo.x, atVideo.y, 'arrow'], [39.3, atVideo.x, atVideo.y, 'arrow'],
  [40.2, 1180, 990, 'arrow'],
  [42.2, atVideo.x, atVideo.y, 'arrow'], [42.5, atVideo.x, atVideo.y, 'arrow'],
  [42.85, DOCK_BTN.share.x, DOCK_BTN.share.y, 'arrow'], [43.0, DOCK_BTN.share.x, DOCK_BTN.share.y, 'arrow'],
  [43.6, PICKER.x + 200, PICKER.rowY[0], 'arrow'], [43.8, PICKER.x + 200, PICKER.rowY[0], 'arrow'],
  [44.8, 980, 620, 'arrow'], [46.9, vHL.x, vHL.y, 'arrow'], [47.2, vHL.x, vHL.y, 'arrow'], [48.4, 760, 540, 'arrow'],
  [52.6, 1000, 700, 'arrow'], [54.8, sliderX(0.62), SLIDER.y, 'grab'], [55.0, sliderX(0.62), SLIDER.y, 'grab'],
  [56.6, sliderX(0.3), SLIDER.y, 'arrow'], [57.9, 560, 520, 'grab'], [58.2, 560, 520, 'grab'],
  [60.0, 700, 520, 'arrow'], [60.3, 743, 650, 'arrow'], [62.8, pauseBtn.x, pauseBtn.y, 'arrow'],
  [63.2, pauseBtn.x, pauseBtn.y, 'arrow'], [64.6, 900, 990, 'arrow'],
];
export const CLICKS = [PAIN.paste, PAIN.send, TODAY.dockOpen, TODAY.connect, TODAY.history[0], TODAY.dockClose - 0.1, 42.5, 43.0, 43.8, NEXT.pointAt, NEXT.pause];
export const PRESSES = [PAIN.snip[0], TODAY.drag[0], NEXT.slider[0], NEXT.rotate[0]];
const VISIBLE = [[0, 10.8], [20.4, 66.0]];

export function cursorAt(t) {
  let i = 0;
  while (i < PATH.length - 1 && PATH[i + 1][0] <= t) i++;
  const a = PATH[i];
  const b = PATH[Math.min(i + 1, PATH.length - 1)];
  const k = b[0] > a[0] ? easeInOut(prog(t, a[0], b[0])) : 0;
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), kind: a[3] };
}

export function buildCursor(stage) {
  const n = h('div', 'cursor', stage);
  n.innerHTML = `
    <svg class="k-arrow" width="34" height="44" viewBox="0 0 34 44"><path d="M3 3 L3 36 L12 28 L18 41 L24 38 L18 25 L30 25 Z" fill="#fff" stroke="#181715" stroke-width="2.5" stroke-linejoin="round"/></svg>
    <svg class="k-cross" width="44" height="44" viewBox="-22 -22 44 44"><path d="M-18 0H18M0 -18V18" stroke="#181715" stroke-width="5"/><path d="M-18 0H18M0 -18V18" stroke="#fff" stroke-width="2"/></svg>
    <svg class="k-grab" width="40" height="40" viewBox="0 0 40 40"><path d="M9 16q0-4 4-4t4 4v-3q0-4 4-4t4 4v3q0-3 3.5-3t3.5 3v10q0 10-11 10h-2q-8 0-11-8l-3-7q-1-3 1.5-4t4 2z" fill="#fff" stroke="#181715" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
  const ripple = h('div', 'ripple', stage);

  function update(t) {
    const vis = Math.max(...VISIBLE.map(([a, b]) => Math.min(prog(t, a, a + 0.3), 1 - prog(t, b - 0.4, b))));
    let { x, y, kind } = cursorAt(t);
    if (t >= TODAY.drag[0] && t < TODAY.drag[1]) {
      const k = easeInOut(prog(t, TODAY.drag[0], TODAY.drag[1]));
      x = lerp(land.x, atVideo.x, k);
      y = lerp(land.y, atVideo.y, k);
      kind = 'grab';
    }
    n.style.opacity = vis;
    n.style.transform = `translate(${x}px, ${y}px)`;
    n.dataset.kind = kind;
    const c = CLICKS.find((ct) => t >= ct && t < ct + 0.45);
    ripple.style.opacity = c != null ? 0.6 * (1 - prog(t, c, c + 0.45)) : 0;
    const rk = c != null ? prog(t, c, c + 0.45) : 0;
    ripple.style.transform = `translate(${x - 20}px, ${y - 20}px) scale(${0.4 + rk * 1.2})`;
  }
  return { update };
}
