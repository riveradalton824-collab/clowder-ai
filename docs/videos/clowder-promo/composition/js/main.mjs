// Assembles the film and exposes a deterministic seek(t) for the renderer.
import { buildCaptions } from './captions.mjs';
import { allStickerUrls } from './faces.mjs';
import { buildFinale } from './finale.mjs';
import { buildPhone } from './phone.mjs';
import { buildOpen } from './scene-open.mjs';
import { buildPromise } from './scene-promise.mjs';
import { buildThread } from './thread.mjs';
import { DURATION, PROMISE } from './timeline.mjs';
import { buildWorkspace } from './workspace.mjs';

const stage = document.getElementById('stage');
const open = buildOpen(stage);
const thread = buildThread(stage);
const workspace = buildWorkspace(thread.app);
const phone = buildPhone(thread.app);
const promise = buildPromise(stage, () => thread.anchorOnStage('m1', PROMISE.fly[1]));
const captions = buildCaptions(stage);
const finale = buildFinale(stage, (t) => thread.anchorOnStage('n2', t));
const parts = [open, promise, thread, workspace, phone, captions, finale];

function seek(t) {
  const tt = Math.max(0, Math.min(DURATION - 1e-3, t));
  for (const p of parts) p.update(tt);
}

async function preload() {
  const urls = [...allStickerUrls(), '/site/assets/logo-transparent.png'];
  await Promise.all(
    urls.map(async (u) => {
      const img = new Image();
      img.src = u;
      await img.decode();
    }),
  );
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  await document.fonts.ready;
}

await preload();
thread.layout();
await document.fonts.ready;
window.seek = seek;
window.DURATION = DURATION;
seek(Number(new URLSearchParams(location.search).get('t') || 0));
window.__ready = true;

// Live preview when opened in a browser without the renderer: ?play
if (new URLSearchParams(location.search).has('play')) {
  const t0 = performance.now();
  const tick = () => {
    seek(((performance.now() - t0) / 1000) % DURATION);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
