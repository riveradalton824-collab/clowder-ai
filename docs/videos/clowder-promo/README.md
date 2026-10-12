---
title: 一根线 / One Thread · Clowder AI 宣传片
doc_kind: guide
created: 2026-10-12
status: draft
owner: 宪宪
tips_exempt: Standalone promo film; does not add a product capability or change Hub navigation.
---

# 《一根线 / One Thread》— Clowder AI promo (85 s)

A brand-hero film: one human, a cross-model team of cats, and a yarn ball that shows who holds the task.
The full creative contract (belief change, beats, sound map, provenance) is in [`director-brief.md`](director-brief.md).

## Render

```bash
node docs/videos/promo-kit/render.mjs docs/videos/clowder-promo                       # → output/clowder-one-thread.mp4 (≈3 min)
node docs/videos/promo-kit/render.mjs docs/videos/clowder-promo --stills 9.8,34,57.5  # → output/stills/*.png
node docs/videos/promo-kit/render.mjs docs/videos/clowder-promo --from 42 --to 55     # → output/preview.mp4 (silent)
node docs/videos/clowder-promo/audio/synth.mjs output/score.wav                       # score only
```

The renderer, timing helpers and synth live in [`../promo-kit`](../promo-kit/README.md) (shared with `f317-companion`).
Needs Node 20+, ffmpeg (libx264 + aac), and Playwright with Chromium (resolved from local or global `npm root -g`).
Fonts load from Google Fonts at render time (Noto Serif SC / Noto Sans SC / Inter / JetBrains Mono / Source Serif 4).
`output/` is git-ignored.

To scrub it live in a browser, serve the repo root and open
`/docs/videos/clowder-promo/composition/index.html?play` (or `?t=33.5` for one frame).

## How it is built

| Path | Role |
|---|---|
| `composition/js/timeline.mjs` | **single source of timing truth**, pure data; picture and score both import it |
| `composition/js/scene-open.mjs` | S1 “the router”: windows, copy/paste, tangle → knot |
| `composition/js/scene-promise.mjs` | S2 “one thread”: knot → yarn ball, cats relay on the counter |
| `composition/js/thread.mjs`, `messages.mjs`, `yarn.mjs` | product world: sidebar, two threads, ball holder, trails, memory link |
| `composition/js/workspace.mjs`, `phone.mjs` | files / tests / review card; preview phone morphs and the payoff |
| `composition/js/captions.mjs`, `finale.mjs` | chapter captions, payoff line, family + end card |
| `audio/synth.mjs` | score: each cat has a note; the human’s correction motif returns as memory (synth in `promo-kit/dsp.mjs`) |

Every visual is a pure function of `t` (no CSS animations, seeded randomness), so any frame can be re-rendered exactly.

Why not `pnpm video:new`: that scaffold targets the F138 TTS + forced-alignment pipeline (voice-script, asset-markers,
video-spec). This film has no voiceover, so `timeline.mjs` plays the video-spec role and drives picture and score directly.

## Assets and honesty

- Cat faces come only from `packages/web/public/f321/stickers/` (four cats × applied / drilled / invalidated / dormant).
- The product UI is **re-drawn**, not screen-captured; the end card says “示意动画 · Illustrated sequence”.
- Claims stay inside the README’s feature list: @mention routing, cross-model review, shared memory, persistent identity.
- Brand assets follow [`TRADEMARKS.md`](../../../TRADEMARKS.md).
