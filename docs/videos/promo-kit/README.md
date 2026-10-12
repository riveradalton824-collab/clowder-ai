---
title: promo-kit · 宣传片共用渲染与合成
doc_kind: guide
created: 2026-10-12
status: draft
owner: 宪宪
tips_exempt: Internal film tooling; does not add a product capability or change Hub navigation.
---

# promo-kit

Shared pieces for the code-built promo films in `docs/videos/` (`clowder-promo`, `f317-companion`).

| File | Role |
|---|---|
| `render.mjs` | serves the repo, steps `window.seek(t)` frame by frame in headless Chromium, pipes to ffmpeg; runs the project’s `audio/synth.mjs` and muxes with loudnorm (−16 LUFS) |
| `util.mjs` | deterministic timing helpers (easing, windows, typed text, seeded PRNG) and tiny DOM/SVG builders |
| `dsp.mjs` | dependency-free synth: additive tones, Karplus–Strong plucks, noise hits, rolls, risers, pads, Freeverb-style reverb, WAV writer |

A project needs `composition/index.html` whose main module sets `window.seek(t)`,
`window.FILM = { name, duration, fps }` and `window.__ready = true`, and optionally `audio/synth.mjs <out.wav>`.

```bash
node docs/videos/promo-kit/render.mjs docs/videos/<project>                  # full film → <project>/output/<name>.mp4
node docs/videos/promo-kit/render.mjs docs/videos/<project> --stills 3,21.5  # PNG stills
node docs/videos/promo-kit/render.mjs docs/videos/<project> --from 17 --to 30  # silent preview
```

Needs Node 20+, ffmpeg (libx264 + aac) and Playwright with Chromium (local or `npm root -g`).
Every frame is a pure function of `t`, so any frame re-renders exactly. These films have no voiceover;
the F138 TTS + forced-alignment pipeline (`pnpm video:new`) remains the path for narrated videos.
