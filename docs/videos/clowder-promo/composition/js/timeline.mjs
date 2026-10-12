// 《一根线 / One Thread》— single source of timing truth.
// Pure data (no DOM): the composition and the audio synth both import it,
// so every sound cue lands on the frame that motivates it.

export const FPS = 30;
export const DURATION = 85;

export const CATS = {
  xian: { name: '宪宪', model: 'Claude', sticker: 'xianxian', midi: 69 },
  yan: { name: '砚砚', model: 'GPT', sticker: 'yanyan', midi: 54 },
  shuo: { name: '烁烁', model: 'Gemini', sticker: 'shuoshuo', midi: 76 },
  momo: { name: '墨墨', model: 'Kimi', sticker: 'momo', midi: 71 },
};
export const YOU_MIDI = 62;

/** Scene windows (seconds). */
export const S = {
  tangle: [0, 9.0],
  promise: [9.0, 17.6],
  thread: [16.8, 72.6],
  payoff: [54.0, 62.4],
  night: [62.0, 63.6],
  finale: [72.0, DURATION],
};

/** S1: the human as a router — copy/paste hops between three chat windows. */
export function tangleHops() {
  const hops = [];
  let state = 7;
  const rand = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  let t = 0.5;
  let from = 0;
  for (let i = 0; t < 8.1; i++) {
    const dt = Math.max(0.17, 0.62 - i * 0.024);
    const to = (from + 1 + Math.floor(rand() * 2)) % 3;
    hops.push({ t, dt, from, to, paste: t + dt * 0.72 });
    from = to;
    t += dt;
  }
  return hops;
}

/** S2: stickers on the café counter pass the yarn ball without the human. */
export const PROMISE = {
  warm: [9.4, 10.6],
  xianIn: [9.5, 10.05],
  ballForm: [10.0, 10.45],
  yanIn: [10.6, 11.15],
  roll1: [11.4, 12.3],
  yanCatch: 12.3,
  shuoIn: [12.7, 13.2],
  roll2: [13.0, 13.7],
  question: [10.8, 13.6],
  brand: [13.9, 16.5],
  fly: [16.4, 17.6],
};

// Thread 1 — a whole small project in one thread.
export const THREAD1 = [
  { id: 'm1', who: 'you', at: 17.6, type: [17.9, 19.7], text: '给小区流浪猫做个投喂打卡页 @宪宪' },
  { id: 'm2', who: 'xian', at: 20.6, textAt: 21.2, text: '收到。我先搭骨架，顺手把测试写好。' },
  { id: 'm3', who: 'xian', at: 27.7, textAt: 27.8, text: '@砚砚 帮我 review 一下？' },
  {
    id: 'm4',
    who: 'yan',
    at: 30.0,
    textAt: 33.0,
    busy: 'review 中',
    tag: 'P1',
    text: '没防重复打卡——橘子一天能被“喂”五顿。',
  },
  {
    id: 'm5',
    who: 'xian',
    at: 37.3,
    textAt: 37.9,
    text: '修好了：同一只猫一天只记一次，补了测试。',
    react: { who: 'yan', at: 40.4, text: 'LGTM' },
  },
  { id: 'm7', who: 'xian', at: 41.7, textAt: 41.8, text: '@烁烁 视觉交给你～' },
  { id: 'm8', who: 'shuo', at: 43.2, textAt: 45.2, busy: '设计中', text: '配色和布局好啦，走简约风。' },
  { id: 'm9', who: 'you', at: 46.9, type: [47.9, 50.1], text: '等等——来喂猫的多是楼下阿姨。字要大，按钮要大。' },
  { id: 'm10', who: 'shuo', at: 50.8, textAt: 51.3, text: '明白！字号放到 28，按钮做成整行大块。' },
];

export const BALL1 = [
  { kind: 'pass', at: [20.2, 21.0], from: 'm1', to: 'm2' },
  { kind: 'hop', at: [27.8, 28.2], from: 'm2', to: 'm3' },
  { kind: 'pass', at: [29.6, 30.4], from: 'm3', to: 'm4' },
  { kind: 'pass', at: [36.9, 37.7], from: 'm4', to: 'm5' },
  { kind: 'hop', at: [41.8, 42.2], from: 'm5', to: 'm7' },
  { kind: 'pass', at: [42.8, 43.6], from: 'm7', to: 'm8' },
  { kind: 'pass', at: [47.0, 47.8], from: 'm8', to: 'm9' },
  { kind: 'pass', at: [50.4, 51.2], from: 'm9', to: 'm10' },
];

// Thread 2 — next day, a new thread; the correction from yesterday comes back as memory.
export const THREAD2 = [
  { id: 'n1', who: 'you', at: 63.7, type: [63.9, 65.2], text: '再做个领养登记页 @宪宪' },
  {
    id: 'n2',
    who: 'xian',
    at: 66.1,
    textAt: 69.2,
    busy: '翻记忆中',
    memory: { at: 67.9, from: '共享记忆 · 来自《流浪猫投喂打卡》· 昨天', quote: '“来喂猫的多是楼下阿姨。字要大，按钮要大。”' },
    text: '记得。这次一开始就用大字、大按钮。',
  },
];
export const BALL2 = [
  { kind: 'pop', at: [63.7, 64.0], to: 'n1' },
  { kind: 'pass', at: [65.4, 66.2], from: 'n1', to: 'n2' },
];
export const MEMORY_LINK = [67.0, 67.9];

/** Expressions (f321 sticker states) per cat: [time, state]. */
export const MOODS = {
  xian: [[0, 'applied'], [33.2, 'invalidated'], [37.7, 'applied'], [62.0, 'dormant'], [63.2, 'applied'], [66.2, 'drilled'], [69.0, 'applied']],
  yan: [[0, 'applied'], [30.4, 'drilled'], [33.0, 'invalidated'], [40.4, 'applied'], [62.0, 'dormant'], [63.3, 'applied']],
  shuo: [[0, 'applied'], [43.6, 'drilled'], [45.2, 'applied'], [47.6, 'invalidated'], [51.2, 'drilled'], [52.9, 'applied'], [62.0, 'dormant'], [63.4, 'applied']],
  momo: [[0, 'applied']],
};

/** Workspace beats. */
export const WS = {
  files: [
    { at: 22.6, name: 'index.html', by: 'xian' },
    { at: 23.1, name: 'checkin.ts', by: 'xian' },
    { at: 23.6, name: 'checkin.test.ts', by: 'xian' },
  ],
  tests1: [24.9, 25.9],
  code: [30.5, 40.6],
  bugAt: 33.0,
  fixAt: 38.0,
  tests2: [38.4, 39.4],
  skeleton: [24.4, 26.2],
  styled: [44.0, 45.2],
  bigger: [51.6, 53.2],
  adopt: [70.3, 71.1],
};

export const PAYOFF = { dim: [54.0, 62.4], lift: [54.2, 55.5], tap: 56.9, back: [60.9, 62.2], text: [55.6, 61.4] };

export const CAPTIONS = [
  { at: [17.7, 27.6], zh: '@ 一只猫，球就到它手里', en: '@mention routing — you always see who holds the ball' },
  { at: [27.9, 41.6], zh: 'Claude 写，GPT 审', en: 'Cross-model review, built in' },
  { at: [41.9, 53.6], zh: '判断，始终是你的', en: 'You stay the author' },
  { at: [63.6, 71.8], zh: '共享记忆：换个线程，也记得', en: 'Shared memory, across threads' },
];

export const FINALE = {
  appOut: [72.0, 73.2],
  ballCenter: [72.2, 73.4],
  pops: [
    { who: 'xian', at: 73.5 },
    { who: 'yan', at: 73.9 },
    { who: 'shuo', at: 74.3 },
    { who: 'momo', at: 74.7 },
  ],
  tagline: [75.2, 79.2],
  endcard: [79.0, DURATION],
};
