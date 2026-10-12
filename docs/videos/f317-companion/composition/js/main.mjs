// Assembles《我在这里 / Right Here》and exposes a deterministic seek(t).
import { buildApps } from './apps.mjs';
import { buildCursor } from './cursor.mjs';
import { buildDesktop } from './desktop.mjs';
import { buildDock } from './dock.mjs';
import { buildOverlay } from './overlay.mjs';
import { SHEET, buildPet } from './pet.mjs';
import { BUBBLES, DURATION, FPS, PAIN, SPEECH } from './timeline.mjs';
import { buildVision } from './vision.mjs';

const stage = document.getElementById('stage');
buildDesktop(stage);
const parts = [buildApps(stage), buildVision(stage), buildDock(stage), buildPet(stage), buildOverlay(stage), buildCursor(stage)];

function seek(t) {
  const tt = Math.max(0, Math.min(DURATION - 1e-3, t));
  for (const p of parts) p.update(tt);
}

// Typed-in text starts empty; lay every dynamic string out once so its font subsets load before frame 0.
const warm = document.createElement('div');
warm.className = 'warmup';
const dynamic = [PAIN.text, ...BUBBLES.flatMap((b) => [b.text, b.source || '']), ...SPEECH.map((s) => s.text), '好，先这样，我接着看视频。'].join(' ');
for (const [family, weight] of [['--sans', 400], ['--sans', 500], ['--sans', 600], ['--sans', 700], ['--serif', 700], ['--mono', 500]]) {
  const span = document.createElement('span');
  Object.assign(span.style, { fontFamily: `var(${family})`, fontWeight: weight });
  span.textContent = dynamic;
  warm.appendChild(span);
}
stage.appendChild(warm);

const urls = [SHEET, '/site/assets/logo-transparent.png'];
await Promise.all(
  urls.map(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
  }),
);
await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
await document.fonts.ready;
window.seek = seek;
window.FILM = { name: 'f317-right-here', duration: DURATION, fps: FPS };
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
