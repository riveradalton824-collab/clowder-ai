// 《我在这里 / Right Here》— F317 Coactive Companion. Single source of timing truth.
// Pure data: imported by the composition and by audio/synth.mjs.
//
// Honesty registers (see director-brief.md):
//   TODAY  = behaviour F317 records as prototype-tested (cat on desktop, drag, click → voice/typing,
//            reading the F317 feature doc with source, typed history).
//   NEXT   = F317 scope still in development (choose what it sees, point both ways, follow across apps,
//            keep talking while it thinks, pause sharing). Always labelled and drawn in the blueprint register.

export const FPS = 30;
export const DURATION = 78;

export const S = {
  pain: [0, 11.6],
  promise: [11.4, 21.0],
  today: [21.0, 40.0],
  next: [40.0, 66.0],
  home: [66.0, DURATION],
};

/** S1 — the chore of asking about what you're looking at. */
export const PAIN = {
  question: [0.8, 3.8],
  snip: [2.8, 3.4],
  flash: 3.45,
  thumb: [3.5, 4.3],
  chatIn: [4.2, 4.9],
  paste: 5.0,
  type: [5.3, 8.5],
  send: 8.7,
  missed: [8.9, 11.0],
  chatOut: [10.7, 11.5],
  text: '我在看一个甜甜圈建模教程，大概 3 分 20 秒那里，他调了釉面的高光，就是左上那块亮的……我用的是同一个版本，想问一下这里为什么这样做？',
};

/** Pet positions (sprite top-left, stage px) and moves. */
export const SPOT = {
  inApp: { x: 1500, y: 300 },
  land: { x: 1440, y: 650 },
  video: { x: 1352, y: 588 },
  model: { x: 1432, y: 628 },
  home: { x: 1230, y: 600 },
};
export const PET = [
  // [t0, t1, state, from, to]   state names follow the Live projection map
  [11.6, 12.4, 'idle', 'inApp', 'inApp'],
  [12.4, 13.1, 'jumping', 'inApp', 'land'],
  [13.1, 21.0, 'idle', 'land', 'land'],
  [21.0, 23.4, 'idle', 'land', 'video'], // dragged by the human
  [23.4, 26.0, 'idle', 'video', 'video'],
  [26.0, 28.2, 'waiting', 'video', 'video'], // listening
  [28.2, 30.6, 'running', 'video', 'video'], // thinking
  [30.6, 34.4, 'review', 'video', 'video'], // found
  [34.4, 46.6, 'idle', 'video', 'video'],
  [46.6, 48.6, 'waiting', 'video', 'video'],
  [48.6, 52.0, 'review', 'video', 'video'],
  [52.6, 53.6, 'running-right', 'video', 'model'],
  [53.6, 57.4, 'idle', 'model', 'model'],
  [57.4, 60.4, 'running', 'model', 'model'], // thinking while you keep talking
  [60.4, 62.6, 'review', 'model', 'model'],
  [62.6, 66.2, 'idle', 'model', 'model'],
  [66.2, 67.6, 'running-left', 'model', 'home'], // comes to sit beside you
  [67.6, 75.6, 'idle', 'home', 'home'],
  [75.6, DURATION, 'waving', 'home', 'home'],
];

/** Cat bubbles (short, like the Live companion). */
export const BUBBLES = [
  { at: [15.8, 18.6], text: '我在这里，你接着看。' },
  { at: [30.7, 34.6], text: '标题是「猫猫走进共同生活现场」。', source: '来源 · docs/features/F317-coactive-companion.md' },
  { at: [49.0, 52.2], text: '这块高光：釉面粗糙度低，反光才这么集中。' },
  { at: [53.8, 57.2], text: '接着刚才那块高光——把粗糙度调低一点试试。' },
  { at: [61.0, 63.0], text: '明白，是底部这圈接触阴影。' },
];

/** What the human says (live transcript pill) — typed-in-time with murmurs in the score. */
export const SPEECH = [
  { at: [26.1, 28.0], text: 'F317 讲的是什么？' },
  { at: [46.7, 48.4], text: '刚才这里，为什么这样？' },
  { at: [58.4, 60.2], text: '不对，我说的是下面这圈阴影。' },
];

export const TODAY = {
  drag: [21.0, 23.4],
  dockOpen: 23.8,
  connect: 24.7,
  lookup: [28.3, 30.5],
  history: [34.6, 39.0],
  historyType: [35.8, 37.0],
  dockClose: 39.4,
};

export const NEXT = {
  wash: [40.0, 41.2],
  intro: [40.4, 42.8],
  pick: [43.0, 44.2],
  frame: [44.2, 45.0],
  pointAt: 47.2,
  pointBack: 48.8,
  switchApp: [52.0, 52.9],
  slider: [55.0, 56.6],
  think: [57.4, 60.4],
  rotate: [58.2, 60.0],
  stale: 60.3,
  newMark: 60.8,
  pause: 63.2,
  end: 66.0,
};

export const CAPTIONS = [
  { at: [0.8, 4.0], zh: '看教程时，冒出一个问题。', en: 'A question, mid-tutorial.' },
  { at: [4.3, 8.6], zh: '截图、切窗、再从头交代一遍——', en: 'Screenshot. Switch. Explain it all again.' },
  { at: [8.9, 11.2], zh: '回头一看，视频已经播过去了。', en: 'And the video has moved on.' },
  { at: [12.6, 15.6], zh: '要是它，就在旁边呢？', en: 'What if it was right there?' },
  { at: [21.2, 23.6], zh: '拖到哪，它就待在哪。', en: 'Put it wherever you like.' },
  { at: [23.9, 28.2], zh: '点猫就聊——开口说，或者打字。', en: 'Click the cat. Talk, or type.' },
  { at: [28.4, 34.4], zh: '问功能文档，它自己翻原文，带出处回答。', en: 'It reads the source and tells you where.' },
  { at: [34.6, 39.6], zh: '关了声音，也能打字、翻这次的记录。', en: 'Voice off? Type, and scroll back.' },
  { at: [42.9, 46.4], zh: '接下来：你选它看哪里。', en: 'Next: you choose what it can see.' },
  { at: [46.6, 51.8], zh: '接下来：你指给它看，它也指回来。', en: 'Next: point at it — it points back.' },
  { at: [52.0, 57.2], zh: '接下来：换个应用，话题接着走。', en: 'Next: switch apps, keep the thread.' },
  { at: [57.4, 62.6], zh: '接下来：它想的时候你接着说；说法变了，旧答案作废。', en: 'Next: talk while it thinks; stale answers drop.' },
  { at: [62.8, 65.8], zh: '接下来：随时暂停，立刻停下。', en: 'Next: pause, and it stops looking — now.' },
];

export const TITLE = { at: [17.8, 21.0] };
export const HOME = { line: [66.8, 71.6], end: [71.4, DURATION] };
