# Agent Product Promo — Director Brief ·《一根线 / One Thread》

> Method: `cat-cafe-skills/agent-product-promo-director` → `video-forge` (path B, own renderer).
> Status: **draft cut rendered, awaiting operator acceptance** (creative ground truth = operator).

## Belief change

- Audience: developers who already juggle Claude / GPT / Gemini (Bilibili · linux.do · X)
- Before belief: “Using several AIs together means *I* become the router — copy, paste, keep track.”
- After belief: “They can pass the work along, review each other and remember; I keep the vision and the final say.”
- Product-hero sentence: `Clowder lets one person [lead a cross-model team of cats] [from one sentence to something that runs] while [the judgment stays theirs].`
- Artifact replacement test: the feeding check-in page can be swapped for any small app; the story (ball → review → correction → memory) still holds. ✅

## Format

- Format: brand hero · 85 s · 16:9 1080p30
- Why: the README already has a 3:45 walkthrough (demo film). This one only has to make people *want* it.
- Emotional spine: **the yarn ball**. In the house, “球权” (who holds the task) is a real concept; a ball of yarn is the cat-native way to show it. Wherever it rolls, that cat holds the task; the yarn it leaves behind *is* the thread (线程 ↔ 毛线).

## Observable Agent loop

- Intent: “给小区流浪猫做个投喂打卡页 @宪宪”
- Acceptance / delegation: @mention → the ball rolls to 宪宪; status bar reads “球在 宪宪 · 执行中”
- Visible work state: files appear, tests run, preview phone goes skeleton → plain page
- Handoff / tool / action: 宪宪 @砚砚 → code card, magnifier scan, P1 flagged on a real line, fix inserted, 4 passed
- Human correction / control: “等等——来喂猫的多是楼下阿姨。字要大，按钮要大。” — the ball comes back to 你, music drops away, then 烁烁 resizes the page
- Durable outcome: the page runs (橘子 already fed today → the dedupe fix is visible; tap 煤球 → fed)
- Continuity / resume: next day, new thread; 宪宪 quotes yesterday’s correction from shared memory and starts big from the first draft

## Beat sheet

| # | Time | Viewer question | Claim | Proof (on screen) | Focal anchor | State change | Sound cue | Source class |
|---|---|---|---|---|---|---|---|---|
| 1 | 0–9 | Why is this painful? | You became the router | Cursor copy-pastes between 3 windows; each paste drags a yarn line; lines tangle into a knot | cursor + knot | calm → tangled | clicks, rising cluster, riser → hard cut | designed_explanation |
| 2 | 9–17.6 | What if…? | They can relay by themselves | 宪宪 inspects the knot with her magnifier → it becomes a yarn ball; cats pass it along the café counter | the ball | knot → ball → passed | silence → pop → each cat’s note | designed_explanation |
| 3 | 17.6–28 | How do I hand off? | @ routes; you can see who holds it | message → ball rolls to 宪宪; files + tests + skeleton appear | ball / status chip | holder: 你 → 宪宪 | roll + marimba (宪宪) | designed_explanation |
| 4 | 28–42 | Is the work trustworthy? | Cross-model review is built in | 砚砚 scans checkin.ts, flags P1 (double check-ins), 宪宪 inserts the fix, 4 passed, LGTM | code line 2 | bug → fixed | low thud on P1; resolve on fix | designed_explanation |
| 5 | 42–54 | Who decides? | The judgment stays yours | ball returns to 你; correction typed; phone buttons grow | the phone | small → big | **pads duck to near silence**; human’s 3-note motif alone | designed_explanation |
| 6 | 54–62 | Did it work? | From one sentence to something usable | phone lifts to centre; 橘子 already fed (dedupe), tap 煤球 → fed | the button | 1/2 → 2/2 | chord bloom, all cats’ notes in a row | designed_explanation |
| 7 | 62–72 | Will I repeat myself tomorrow? | Shared memory across threads | “第二天”, new thread; blue thread from yesterday’s thread → quoted correction; adoption page starts big | memory quote | drilled → applied | **yesterday’s motif returns, echoed** | designed_explanation |
| 8 | 72–85 | So what is this? | Adopt a team | ball leaves the product; four cats join, tied by one yarn; logo + URL | ball + family | — | each cat answers; family chord | designed_explanation |

## Sound map

| Picture event | Semantic job | Cue | Priority / ducking | Proven or vision |
|---|---|---|---|---|
| ball lands on a cat | “this cat holds it now” | that cat’s note: 宪宪 marimba A4 · 砚砚 plucked F#3 · 烁烁 glockenspiel E5 · 墨墨 vibraphone B4 | above pads | illustrative |
| human holds the ball / types | the author’s voice | soft piano D4 → motif D–F#–A | pads ducked to 12% during the correction | illustrative |
| P1 found | something is wrong | low thud + B/C dissonant pluck | short | illustrative |
| tests pass / fix lands | proof arrived | two-note chime | short | illustrative |
| memory link draws | “it remembers” | motif replayed with echoes | quiet | illustrative |
| finale | the team is whole | each cat’s note → D major family chord | resolve, fade | illustrative |

No voiceover: the house CosyVoice cat voices are not reachable from the cloud, so the cats speak in notes, and on-screen text carries the narration.

## Provenance ledger

| Asset / shot | Class | Source | Claim permitted | Disclosure |
|---|---|---|---|---|
| Cat faces (all shots) | brand asset | `packages/web/public/f321/stickers/*` (operator-confirmed canonical look) | identity only | — |
| Logo | brand asset | `site/assets/logo-transparent.png` | brand | — |
| Product UI, thread, workspace, phone | designed_explanation | re-drawn in HTML with DESIGN.md tokens; not a screen capture | mechanisms in README: @mention routing, cross-model review, shared memory, persistent identity | “示意动画 · Illustrated sequence” on the end card |
| Code in the review card | designed_explanation | written for the film | “review can catch a real bug” | illustrated register |
| Memory quote across threads | designed_explanation | README “Shared Memory: lessons learned, decision logs” | lessons persist across threads | caption avoids claiming automatic capture of every correction |
| Score | original | `audio/synth.mjs` (code-synthesized) | — | — |

## operator acceptance

1. Is the hero Clowder (ball / review / correction / memory) and not the feeding page?
2. Does it feel like home? Where should people start to *want* it — beat 5 (the hush at the correction) or beat 7 (it remembers)?
3. Which shot or sound feels least like us and should be cut rather than polished?
4. Language: keep bilingual captions, or cut separate zh / en versions?

## Handoff to video-forge

- Brief status: draft cut rendered (this file + `output/clowder-one-thread.mp4`)
- Missing purpose-recorded shots: a real-capture version of beats 3–5 from a live Clowder session would upgrade them from designed_explanation to real_capture
- Narration direction: if CosyVoice cat voices are available at home, add one line each at beats 3/4/5 over the existing score (duck pads −6 dB)
- Production must not be published as “real footage”; it is an illustrated film
