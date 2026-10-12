// The cast: people (avatar + name), house cats (f321 stickers) and 宪宪 v3 (alpha clip frames).
import { h, svg } from '../../../promo-kit/util.mjs';
import { CATS, PEOPLE } from './timeline.mjs';

const STICKERS = '/packages/web/public/f321/stickers/';
const V3 = '/docs/videos/someday-team/assets/v3/';
export const CLIPS = { pounce: 168, carry: 180, trot: 28, wait: 42, think: 53, peek: 130 };
const SIZES = { pounce: [305, 313], carry: [344, 291], trot: [265, 236], wait: [198, 253], think: [266, 257], peek: [153, 234] };

export const stickerUrl = (who, state = 'applied') => `${STICKERS}${CATS[who].sticker}-${state}.png`;
export const clipFrameUrl = (clip, i) => `${V3}${clip}/${String(i).padStart(3, '0')}.webp`;
/** Decoded images by URL, filled by preload() before frame 0 so drawImage never sees a pending image. */
export const IMAGES = new Map();
export async function preload() {
  await Promise.all(
    preloadUrls().map(async (u) => {
      const img = new Image();
      img.src = u;
      await img.decode();
      IMAGES.set(u, img);
    }),
  );
}
export function preloadUrls() {
  const urls = [];
  for (const w of Object.keys(CATS)) for (const s of ['applied', 'drilled', 'invalidated', 'dormant']) urls.push(stickerUrl(w, s));
  for (const [c, n] of Object.entries(CLIPS)) for (let i = 0; i < n; i++) urls.push(clipFrameUrl(c, i));
  return urls;
}

/** A person's colour, from the hue picked for their handle. */
export const personColor = (who, l = 46) => `hsl(${PEOPLE[who].hue} 55% ${l}%)`;
export const handle = (who) => `@${PEOPLE[who].handle}`;

function hash(str) {
  let x = 2166136261;
  for (const c of str) {
    x ^= c.codePointAt(0);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

/** A person: a GitHub-style identicon square (5×5, mirrored) made from the handle, plus an optional @handle. */
export function avatar(parent, who, size = 56, withLabel = false) {
  const box = h('div', 'person', parent);
  const sq = h('div', 'p-av id', box);
  Object.assign(sq.style, { width: `${size}px`, height: `${size}px` });
  const g = svg('svg', { viewBox: '0 0 6 6', width: size, height: size }, sq);
  const bits = hash(PEOPLE[who].handle);
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 5; row++) {
      if (!((bits >>> (col * 5 + row)) & 1)) continue;
      for (const x of col === 2 ? [2] : [col, 4 - col]) svg('rect', { x: x + 0.5, y: row + 0.5, width: 1.02, height: 1.02, fill: personColor(who, 52) }, g);
    }
  }
  if (withLabel) h('div', 'p-name', box, handle(who));
  return box;
}

/** A house cat as a round sticker face with switchable expressions. */
export function catFace(parent, who, size = 52, cls = '') {
  const box = h('div', `cat-face ${cls}`, parent);
  Object.assign(box.style, { width: `${size}px`, height: `${size}px` });
  box._imgs = {};
  for (const s of ['applied', 'drilled', 'invalidated', 'dormant']) {
    const img = h('img', '', box);
    img.src = stickerUrl(who, s);
    img.alt = '';
    box._imgs[s] = img;
  }
  box.mood = (state) => {
    for (const [s, img] of Object.entries(box._imgs)) img.style.opacity = s === state ? 1 : 0;
  };
  box.mood('applied');
  return box;
}

/** 宪宪 v3: plays one of the extracted 24 fps alpha clips on a canvas, frame-exact. `scale` may change per shot. */
export function makeClip(parent, scale = 1, cls = '') {
  const c = h('canvas', `clip ${cls}`, parent);
  const ctx = c.getContext('2d');
  let shown = '';
  const api = { el: c, scale };
  function frame(clip, i) {
    const key = `${clip}:${i}:${api.scale}`;
    if (key === shown) return;
    shown = key;
    const [w, hh] = SIZES[clip];
    if (c.width !== Math.round(w * api.scale) || c.height !== Math.round(hh * api.scale)) {
      c.width = Math.round(w * api.scale);
      c.height = Math.round(hh * api.scale);
    }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(IMAGES.get(clipFrameUrl(clip, i)), 0, 0, c.width, c.height);
  }
  /** Show clip at local time (s); loop or hold on the last frame. */
  api.at = (clip, local, loop = false) => {
    const n = CLIPS[clip];
    let i = Math.floor(Math.max(0, local) * 24);
    i = loop ? i % n : Math.min(i, n - 1);
    frame(clip, i);
  };
  api.size = (clip) => SIZES[clip].map((v) => v * api.scale);
  return api;
}
