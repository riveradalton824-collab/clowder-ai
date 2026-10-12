---
title: 以后再说 / Someday · 团队怎样变成 AI-native（领导概念片）
doc_kind: guide
created: 2026-10-12
status: draft
owner: 宪宪
tips_exempt: Standalone concept film for a meeting; does not add a product capability or change Hub navigation.
---

# 《以后再说 / Someday》— a team becomes AI-native (170 s)

A blueprint film for a company leader: a coffee-machine team finally builds the idea that sat on its
"以后再说" wall for three years: a 3D teardown guide nobody knew how to make. It covers edge + cloud work,
several people and several cats on one piece of work, people making the call, and getting better at being
this team. It ends with the wall emptying out and a blank 「登场：＿＿」. No voiceover: on-screen Chinese with
small English, and a 2–4 s hold line at the end of each section so the presenter can pause and talk.
Story, beats and the honesty rules are in [`director-brief.md`](director-brief.md).

**Rendered film:** [`release/someday-team.mp4`](release/someday-team.mp4) (1920×1080, 30 fps, 170 s).

## Setup (once)

```bash
cd docs/videos/someday-team && npm install --no-audit --no-fund   # three@0.160.0, served locally (no CDN)
docs/videos/someday-team/tools/extract-v3-frames.sh <path-to>/clowder-ai-plugins   # 宪宪 v3 clips → assets/v3/
```

The v3 clips come from the public `zts212653/clowder-ai-plugins` repo
(`packages/companion/assets/skins/xianxian-living/clips`). Frames and `node_modules` are git-ignored.

## Render

```bash
node docs/videos/promo-kit/render.mjs docs/videos/someday-team                     # → output/someday-team.mp4
node docs/videos/promo-kit/render.mjs docs/videos/someday-team --stills 57.6,89    # → output/stills/
node docs/videos/someday-team/audio/synth.mjs out.wav                              # score only
```

## Layout

| Path | Role |
|---|---|
| `composition/js/timeline.mjs` | timing truth, notes, sections, hold lines (pure data; the score reads it too) |
| `composition/js/wall.mjs` | the wall + desk behind a camera: opening, the pounce, the rice-cooker kickoff, the ending |
| `composition/js/before.mjs` | the three opening vignettes (meeting, draft folder, buried idea) |
| `composition/js/model.mjs` | the three.js coffee machine: clay → v1 → true size → brand/round → teardown → core hidden |
| `composition/js/work.mjs` | the shared-work card around the model, size brackets, part labels, practice HUD |
| `composition/js/cloud.mjs`, `many.mjs`, `judge.mjs`, `grow.mjs` | the side panels for sections ① to ④ |
| `composition/js/cast.mjs`, `ui.mjs` | people, f321 cat stickers, 宪宪 v3 clip player; named pointer, lock glyph |
| `composition/js/overlay.mjs`, `main.mjs` | badge, chips, bands, yarn balls, end card; assembly + `seek(t)` |
| `audio/synth.mjs` | score: hums for people, per-cat instruments, the hush at ③, the resolve at 登场 |
