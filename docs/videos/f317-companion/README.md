---
title: 我在这里 / Right Here · F317 Coactive Companion 宣传片
doc_kind: guide
created: 2026-10-12
status: draft
owner: 宪宪
tips_exempt: Standalone promo film; does not add a product capability or change Hub navigation.
---

# 《我在这里 / Right Here》— F317 Coactive Companion (78 s)

A teaser for F317: the cat steps out of the Clowder window and stays beside whatever you are doing.
What already works is drawn as **TODAY · 原型实测**; what F317 is still building is drawn in a separate
blueprint register as **NEXT · 开发中**. The split and its sources are in [`director-brief.md`](director-brief.md).

## Render

```bash
node docs/videos/promo-kit/render.mjs docs/videos/f317-companion                   # → output/f317-right-here.mp4
node docs/videos/promo-kit/render.mjs docs/videos/f317-companion --stills 32,49.8   # → output/stills/
node docs/videos/f317-companion/audio/synth.mjs out.wav                             # score only
```

## Layout

| Path | Role |
|---|---|
| `composition/js/timeline.mjs` | timing truth and the TODAY / NEXT registers (pure data) |
| `composition/js/geo.mjs` | fixed stage geometry shared by pointer, dock and overlays |
| `composition/js/desktop.mjs`, `apps.mjs` | wallpaper, window chrome, donut; tutorial video, Clowder chat chore, modelling app |
| `composition/js/pet.mjs` | 宪宪 (v3 look, still image) acted with body motion per state, and her short bubbles |
| `tools/cutout_from_screenshot.py`, `composition/img/` | stand-in cat cut from the operator’s screenshot (button un-layered, outline-bounded flood fill); replace with the official v3 sprite when available |
| `composition/js/dock.mjs` | Live-style dock, live transcript, source card, typed history (TODAY) |
| `composition/js/vision.mjs` | blueprint wash, picker, share frame, pointing, stale answer, pause (NEXT) |
| `composition/js/cursor.mjs`, `overlay.mjs`, `main.mjs` | pointer path + clicks, captions / registers / title / end card, assembly |
| `audio/synth.mjs` | score; cat speech as per-character plucks, human speech as hums |
