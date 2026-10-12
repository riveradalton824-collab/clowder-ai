// 宪宪 on the desktop. The current companion art (宪宪 v3) is not in this repository,
// so this is a stand-in cut from the operator's screenshot (tools/cutout_from_screenshot.py).
// One still image, so states are acted with body motion: breathe, lean in to listen,
// sway while thinking, hop when it finds something, bounce when walking, wiggle to wave.
import { clamp, easeOut, h, lerp, place, prog, typed, win } from '../../../promo-kit/util.mjs';
import { PET_H, PET_W } from './geo.mjs';
import { BUBBLES, PET, SPOT, TODAY } from './timeline.mjs';

export const SHEET = '/docs/videos/f317-companion/composition/img/xianxian-v3-from-screenshot.png';

/** Where the pet is (box top-left) and what it is doing at t. */
export function petAt(t) {
  const seg = PET.find((p) => t >= p[0] && t < p[1]) || PET[PET.length - 1];
  const [t0, t1, state, from, to] = seg;
  const a = SPOT[from];
  const b = SPOT[to];
  const k = state === 'jumping' ? prog(t, t0, t1) : easeOut(prog(t, t0, t1));
  let y = lerp(a.y, b.y, k);
  if (state === 'jumping') y -= Math.sin(Math.PI * prog(t, t0, t1)) * 150;
  return { x: lerp(a.x, b.x, k), y, state, local: t - t0 };
}

/** Body motion for a state: offset, tilt (deg) and squash. */
function pose(state, local, t) {
  const breathe = Math.sin((2 * Math.PI * t) / 2.6);
  const p = { dx: 0, dy: 0, rot: 0, sx: 1 - 0.006 * breathe, sy: 1 + 0.012 * breathe };
  const lean = easeOut(clamp(local / 0.4));
  if (state === 'waiting') p.rot = -5 * lean; // listening: leans toward you
  if (state === 'running') {
    p.rot = 3 * Math.sin(2 * Math.PI * local * 0.9);
    p.dy = -3 * Math.abs(Math.sin(2 * Math.PI * local * 0.9));
  }
  if (state === 'review') {
    p.dy = -18 * Math.sin(Math.PI * clamp(local / 0.34));
    p.rot = 3 * lean;
  }
  if (state === 'running-right' || state === 'running-left') {
    const dir = state === 'running-right' ? 1 : -1;
    p.dy = -12 * Math.abs(Math.sin((Math.PI * local) / 0.22));
    p.rot = dir * (3 + 3 * Math.sin((2 * Math.PI * local) / 0.44));
  }
  if (state === 'jumping') {
    p.sx = 0.94;
    p.sy = 1.07;
  }
  if (state === 'waving') {
    p.rot = 7 * Math.sin(2 * Math.PI * local * 1.6);
    p.dy = -6 * Math.abs(Math.sin(2 * Math.PI * local * 1.6));
  }
  return p;
}

export function buildPet(stage) {
  const pet = h('div', 'pet', stage);
  Object.assign(pet.style, { width: `${PET_W}px`, height: `${PET_H}px` });
  const img = h('img', 'pet-img', pet);
  img.src = SHEET;
  img.alt = '';
  const bubble = h('div', 'bubble', stage);
  const btxt = h('div', 'b-txt', bubble);
  const bsrc = h('div', 'b-src', bubble);

  function update(t) {
    const on = t >= PET[0][0];
    pet.style.display = on ? '' : 'none';
    bubble.style.display = on ? '' : 'none';
    if (!on) return;
    const at = petAt(t);
    const p = pose(at.state, at.local, t);
    if (t >= TODAY.drag[0] && t < TODAY.drag[1]) {
      // lifted by the pointer: a little dangle
      p.dy -= 10;
      p.rot = -4 + 3 * Math.sin(2 * Math.PI * (t - TODAY.drag[0]) * 1.4);
    }
    const land = prog(t, 13.1, 13.4);
    const squash = land > 0 && land < 1 ? Math.sin(Math.PI * land) * 0.1 : 0;
    pet.style.opacity = easeOut(prog(t, PET[0][0], PET[0][0] + 0.4));
    pet.style.transform = `translate(${at.x + p.dx}px, ${at.y + p.dy}px)`;
    img.style.transform = `rotate(${p.rot}deg) scale(${p.sx * (1 + squash)}, ${p.sy * (1 - squash)})`;
    pet.style.zIndex = t < 13.0 ? 5 : 30;

    const b = BUBBLES.find((x) => t >= x.at[0] - 0.05 && t < x.at[1] + 0.3);
    if (!b) {
      bubble.style.opacity = 0;
      return;
    }
    const len = Array.from(b.text).length;
    btxt.textContent = typed(b.text, t, b.at[0] + 0.15, b.at[0] + 0.15 + len / 14);
    bsrc.textContent = b.source || '';
    bsrc.style.display = b.source ? '' : 'none';
    bsrc.style.opacity = clamp(prog(t, b.at[0] + 0.15 + len / 14, b.at[0] + 0.45 + len / 14));
    const bk = easeOut(prog(t, b.at[0], b.at[0] + 0.3));
    bubble.style.right = `${1920 - (at.x + 46)}px`;
    bubble.style.bottom = `${1080 - (at.y + 34)}px`;
    place(bubble, { o: win(t, b.at[0], b.at[1] + 0.3, 0.25), y: (1 - bk) * 10, s: lerp(0.94, 1, bk) });
  }
  return { update };
}
