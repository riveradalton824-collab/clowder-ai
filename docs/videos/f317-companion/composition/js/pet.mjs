// 砚砚 on the desktop — the same spritesheet the F317 Live prototype serves as
// /pet.webp — plus its short speech bubbles.
import { clamp, easeInOut, easeOut, h, lerp, place, prog, typed, win } from '../../../promo-kit/util.mjs';
import { PET_H, PET_W } from './geo.mjs';
import { BUBBLES, PET, SPOT } from './timeline.mjs';

export const SHEET = '/packages/web/public/concierge/skins/yanyan-codex/spritesheet.webp';
const ROWS = {
  idle: [0, [1200, 400, 400, 500, 500, 800]],
  'running-right': [1, [120, 120, 120, 120, 120, 120, 120, 220]],
  'running-left': [2, [120, 120, 120, 120, 120, 120, 120, 220]],
  waving: [3, [140, 140, 140, 280]],
  jumping: [4, [140, 140, 140, 140, 280]],
  waiting: [6, [150, 150, 150, 150, 150, 260]],
  running: [7, [120, 120, 120, 120, 120, 220]],
  review: [8, [150, 150, 150, 150, 150, 280]],
};

function frameOf(state, local) {
  const [row, durs] = ROWS[state];
  const total = durs.reduce((a, b) => a + b, 0) / 1000;
  let tt = ((local % total) + total) % total;
  let f = 0;
  while (f < durs.length - 1 && tt >= durs[f] / 1000) tt -= durs[f++] / 1000;
  return { row, f };
}

/** Where the pet is (top-left) and what it is doing at t. */
export function petAt(t) {
  const seg = PET.find((p) => t >= p[0] && t < p[1]) || PET[PET.length - 1];
  const [t0, t1, state, from, to] = seg;
  const a = SPOT[from];
  const b = SPOT[to];
  const k = easeInOut(prog(t, t0, t1));
  let y = lerp(a.y, b.y, k);
  if (state === 'jumping') y -= Math.sin(Math.PI * prog(t, t0, t1)) * 150;
  return { x: lerp(a.x, b.x, k), y, state, local: t - t0, t0 };
}

export function buildPet(stage) {
  const pet = h('div', 'pet', stage);
  Object.assign(pet.style, { width: `${PET_W}px`, height: `${PET_H}px`, backgroundImage: `url(${SHEET})` });
  const bubble = h('div', 'bubble', stage);
  const btxt = h('div', 'b-txt', bubble);
  const bsrc = h('div', 'b-src', bubble);

  function update(t) {
    const on = t >= PET[0][0];
    pet.style.display = on ? '' : 'none';
    bubble.style.display = on ? '' : 'none';
    if (!on) return;
    const p = petAt(t);
    const { row, f } = frameOf(p.state, p.local);
    pet.style.backgroundPosition = `${-f * PET_W}px ${-row * PET_H}px`;
    const appear = easeOut(prog(t, PET[0][0], PET[0][0] + 0.4));
    const land = prog(t, 13.1, 13.4);
    const squash = land > 0 && land < 1 ? Math.sin(Math.PI * land) * 0.1 : 0;
    pet.style.opacity = appear;
    pet.style.transform = `translate(${p.x}px, ${p.y}px) scale(${1 + squash}, ${1 - squash})`;
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
    bubble.style.right = `${1920 - (p.x + 46)}px`;
    bubble.style.bottom = `${1080 - (p.y + 34)}px`;
    place(bubble, { o: win(t, b.at[0], b.at[1] + 0.3, 0.25), y: (1 - bk) * 10, s: lerp(0.94, 1, bk) });
  }
  return { update };
}
