# Agent Product Promo — Director Brief · F317《我在这里 / Right Here》

> Method: `cat-cafe-skills/agent-product-promo-director` → `video-forge`. Status: **draft cut rendered, awaiting operator acceptance**.
> Source of truth for what is real: [`docs/features/F317-coactive-companion.md`](../../features/F317-coactive-companion.md).

## Belief change

- Audience: people who already work with AI cats in a chat window
- Before belief: “To ask about what I’m looking at, I screenshot, switch to the chat, and explain everything again — and the video moves on.”
- After belief: “The cat can sit right beside what I’m doing. Today I can already click it and talk; soon it will look where I point.”
- Product-hero sentence: `F317 lets [a named house cat] [stay beside whatever you are doing on the desktop] while [you choose what it sees and can pause it at once].`
- Artifact replacement test: the donut tutorial can become a meeting, a paper or a game; the story (cat beside you → talk → look together → point → pause) still holds. ✅

## Format

- Brand teaser · 78 s · 16:9 1080p30. The spec’s Phase D says a promo video can never stand in for acceptance; this film is a teaser, not evidence.
- Emotional spine: the house’s own design-draft line「我在这里，你接着看。」(`desktop/companion-design/index.html`).

## Honesty registers (the core of this brief)

| Register | On screen | What F317 records | Disclosure |
|---|---|---|---|
| **TODAY · 原型实测** | cat on the desktop, drag it, click → Live-style dock, voice or typing, read the F317 feature doc and answer with source, typed history | #4661 cat body + menu + typing/history, operator-confirmed drag/typing; voice cat-ball talked with by a person (intermittent drops noted); `read_file_slice` returned the correct F317 title in the native session | green chip “今天 · 原型实测 / Prototype, tested by people”; present tense |
| **NEXT · 开发中** | choose a window to share, point at it / it points back, follow from video to modelling app, talk while it thinks and drop stale answers, pause sharing | I2/C1–C4, B2 and the Primary Journey are in development; screen and pointing not accepted | blue dashed chip “接下来 · 开发中 / In development”, blueprint grid wash, dashed outlines, every caption starts with “接下来：” |

Not shown on purpose: memory search across threads, cross-thread delegation, meetings, “who is busy” (#4829 merged read-only but not activated). They are real scope, but not yet experiences a person has had.

## Beat sheet

| # | Time | Viewer question | Claim | Proof on screen | Register |
|---|---|---|---|---|---|
| 1 | 0–11.6 | Why bother? | Asking about what you see costs a context switch | snip → flash → Clowder window covers the video → long re-explanation typed → video has moved on (“离开视频 00:41”) | designed_explanation |
| 2 | 11.4–21 | What if…? | The cat can live beside the work | 砚砚 (the Live `/pet.webp` sprite) jumps out of the Clowder window onto the desktop: 「我在这里，你接着看。」; title card | designed_explanation |
| 3 | 21–40 | What works today? | Drag, click to talk or type, it reads the doc with source | drag → dock (`点开始聊天，直接对我说话`) → “F317 讲的是什么？” → source card → 「标题是『猫猫走进共同生活现场』。」→ typed history | TODAY |
| 4 | 40–66 | Where is it going? | You choose what it sees; pointing both ways; follow across apps; stale answers drop; pause stops at once | picker → dashed share frame → click ring + cat’s ellipse → modelling app, roughness 0.62→0.30 → 「我在核对这处阴影，你继续说。」→ old answer struck → pause → “已停止共享” | NEXT |
| 5 | 66–78 | So? | A companion that stays, without turning every sentence into a task | cat walks over and sits; 「想聊就说，想指就指。不必每句话都变成一件任务。」; end card with both registers listed; cat waves | designed_explanation |

## Sound map

| Event | Job | Cue | Proven or vision |
|---|---|---|---|
| cat speaks | “someone is talking” without faking a voice | one soft pluck per character (G pentatonic) | illustrative |
| human speaks | the human’s voice | low hum per character | illustrative |
| tutorial playing | the world goes on | the video’s own lo-fi loop, muffled when covered, gone after the app switch | illustrative |
| connect / found / share on | state confirmed | short glockenspiel chimes | illustrative |
| stale answer | correction lands | dull thunk | vision |
| pause sharing | trust | two falling notes, pad drops away for a breath | vision |
| home | it stays | 砚砚’s pluck theme, G major resolve | illustrative |

## Provenance ledger

| Asset | Class | Source |
|---|---|---|
| Desktop cat | product asset | `packages/web/public/concierge/skins/yanyan-codex/spritesheet.webp` (served as `/pet.webp` by `desktop/companion-live/server.mjs`) |
| Dock copy and layout | re-drawn from product | `desktop/companion-live/index.html` |
| 「我在这里，你接着看。」/「我在核对这处阴影，你继续说。」/「想聊就说，想指就指。」 | house copy | `desktop/companion-design/index.html` |
| Desktop, windows, donut, modelling app | designed_explanation | drawn for the film; no third-party product names or logos |
| Score | original | `audio/synth.mjs` |

## operator acceptance

1. Does the line between TODAY and NEXT match what you would say on stage? Anything in TODAY you would move to NEXT (or back)?
2. Is 砚砚 the right companion for this film (F317’s owner is a Maine Coon; Live uses the 砚砚 skin)?
3. Which beat makes people want it — the hush when the cat steps out, the doc lookup, or the pause?
4. Once a real Primary Journey is accepted, should beats 4a–4e be re-shot as real_capture?
