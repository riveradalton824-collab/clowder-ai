// Assembles《以后再说 / Someday》and exposes a deterministic seek(t).
import { buildBefore } from './before.mjs';
import { preload } from './cast.mjs';
import { buildCloud } from './cloud.mjs';
import { buildGrow } from './grow.mjs';
import { buildJudge } from './judge.mjs';
import { buildMany } from './many.mjs';
import { BAND_TEXT, buildOverlay } from './overlay.mjs';
import { BEFORE, DURATION, FPS } from './timeline.mjs';
import { buildWall } from './wall.mjs';
import { buildWork } from './work.mjs';

const stage = document.getElementById('stage');
const wall = buildWall(stage);
const before = buildBefore(stage);
const work = buildWork(stage);
const sections = [buildCloud(stage, work), buildMany(stage, work), buildJudge(stage), buildGrow(stage)];
const overlay = buildOverlay(stage);

function seek(t) {
  const tt = Math.max(0, Math.min(DURATION - 1e-3, t));
  const balls = [];
  const w = wall.update(tt);
  if (w.ball) balls.push(w.ball);
  before.update(tt);
  work.update(tt);
  for (const s of sections) balls.push(...s.update(tt).filter(Boolean));
  overlay.update(tt, balls);
}

// Text that is typed in or swapped at runtime: lay it out once so its font subsets load before frame 0.
const dynamic = [
  ...BEFORE.meetingLines.map((l) => l.text),
  BAND_TEXT,
  '练习场 · 宪宪自己练捏模 Practice 共同作品 第 0123456789 轮 和真实轮廓重合 % mm v1 v2',
  '王总定：只公开用户能换的部件 2 处意见已采用 真实尺寸 已允许 已采用 · 小周 老陈 宪宪的练法 v2 · 自己改的',
].join(' ');
const warm = document.createElement('div');
warm.className = 'warmup';
for (const [family, weight] of [['--sans', 400], ['--sans', 500], ['--sans', 600], ['--sans', 700], ['--sans', 800], ['--serif', 700], ['--mono', 500], ['--mono', 700], ['--hand', 400]]) {
  const span = document.createElement('span');
  Object.assign(span.style, { fontFamily: `var(${family})`, fontWeight: weight });
  span.textContent = dynamic;
  warm.appendChild(span);
}
stage.appendChild(warm);

await preload();
await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
await document.fonts.ready;
window.seek = seek;
window.FILM = { name: 'someday-team', duration: DURATION, fps: FPS };
const q = new URLSearchParams(location.search);
seek(Number(q.get('t') || 0));
window.__ready = true;
if (q.has('play')) {
  const t0 = performance.now();
  const tick = () => {
    seek(((performance.now() - t0) / 1000) % DURATION);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
