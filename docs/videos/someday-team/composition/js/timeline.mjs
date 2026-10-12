// 《以后再说 / Someday》v2 — an AI-native team: people step past their own trade by hand, cats help
// them across; whoever owns a call makes it. Single source of timing truth (pure data): imported by
// the composition and audio/synth.mjs. Brief: meow-club/cat-cafe-map issue 3 (direction A, v2 board).

export const FPS = 30;
export const DURATION = 178;

export const S = {
  before: [0, 24],
  turn: [24, 34],
  cloud: [34, 66],
  many: [66, 98],
  judge: [98, 120],
  grow: [120, 156],
  stage: [156, DURATION],
};

export const BADGE = '企业协作蓝图 · 基于开源实践探索';

/** meow-club members; the roles in the film are invented for it. */
export const PEOPLE = {
  yukina: { handle: 'YukinaXSer', role: '设计', hue: 330 },
  mindfn: { handle: 'mindfn', role: '产品', hue: 205 },
  whut: { handle: 'whutzefengxie-ops', role: '结构', hue: 145 },
  leslie: { handle: 'LeslieKuo', role: '用户支持', hue: 28 },
  zlz: { handle: 'zlzfun', role: '', hue: 265 },
};
export const CATS = {
  xian: { name: '宪宪', sticker: 'xianxian', midi: 69 },
  yan: { name: '砚砚', sticker: 'yanyan', midi: 54 },
  shuo: { name: '烁烁', sticker: 'shuoshuo', midi: 76 },
  momo: { name: '墨墨', sticker: 'momo', midi: 71 },
};

/** The "以后再说" wall: big things a dev team shelves because nobody knows X. Board-local (1460×760). */
export const NOTES = [
  { id: 'photo', text: '用户拍照\n自动诊断故障', sub: '（没人做过视觉）', date: '2024.03', x: 60, y: 100, r: -1, at: 0.7 },
  { id: 'lang', text: '12 种语言\n同时上线', sub: '（没人会这么多语言）', date: '2024.08', x: 70, y: 380, r: 3, at: 1.1 },
  { id: 'offline', text: '离线也能用的\n说明书', sub: '（没人做过离线同步）', date: '2024.11', x: 380, y: 440, r: -4, at: 1.5 },
  { id: 'sound', text: '听声音\n判断哪坏了', sub: '（没人懂声学）', date: '2025.02', x: 700, y: 370, r: -2, at: 1.9 },
  { id: 'repair', text: '维修记录变成\n会答题的助手', sub: '（没人做过搜索）', date: '2025.06', x: 1020, y: 210, r: 4, at: 2.3 },
  { id: 'voice', text: '能语音问答的\n说明书', sub: '（没人做过语音）', date: '2025.09', x: 1000, y: 480, r: 2, at: 2.7 },
  { id: 'hero', text: '咖啡机 3D\n拆解说明书', sub: '（没人会 3D）', date: '2023.04', x: 360, y: 120, r: -3, at: 8.0 },
  { id: 'ar', text: 'AR 门店导航', sub: '（没人做过 AR）', date: '2023.09', x: 700, y: 90, r: 2, at: 18.6 },
];
export const RICE = { id: 'rice', text: '电饭煲 3D\n拆解说明书', sub: '（下一张）', date: '2026.10', x: 1190, y: 40, r: -2, at: 144.4 };

export const BEFORE = {
  quote: [0.8, 8.6],
  meeting: [2.6, 8.8],
  meetingLines: [
    { who: 'leslie', at: 3.1, text: '用户总问滤芯怎么换，做个 3D 拆解说明书？' },
    { who: 'yukina', at: 4.9, text: '好主意……可我们没人会 3D。' },
  ],
  /** No single speaker shelves it: the room nods together. */
  shelve: { at: 6.6, text: '下季度吧……' },
  folder: [8.8, 13.6],
  issues: [13.6, 19.2],
  wallLine: [19.4, 24.0],
};

export const TURN = {
  trotIn: [24.0, 25.2],
  pounce: [25.0, 32.0],
  noteFall: [29.3, 30.2],
  pen: [30.0, 30.7],
  yukLine: [30.7, 33.6],
  catLine: [31.7, 33.8],
  tabletOn: 32.2,
  toWork: [33.0, 34.4],
};

/** ① Yukina sketches; the cloud sculpts from it; Whut's machine reads the drawings; Mindfn wires a prototype. */
export const CLOUD = {
  sketch: [34.6, 39.0],
  blob: [38.8, 42.6],
  v1Note: [42.6, 45.4],
  ballDown: [44.6, 45.8],
  catIn: 45.6,
  allowBar: [46.0, 48.4],
  allowClick: 48.0,
  trot: [48.3, 49.5],
  carry: [49.5, 56.0],
  drop: 55.7,
  ballUp: [56.0, 57.2],
  keepLocal: [50.4, 58.6],
  snap: [57.2, 58.6],
  proto: [58.8, 66.0],
  buttons: [59.4, 60.2, 61.0],
  wire: 61.6,
  runs: 62.2,
  hold: [63.0, 66.0],
};

/** Yukina's rough shape, stroke by stroke (tablet px). work.mjs traces them in the viewport too. */
export const SKETCH = [
  'M200 206 H462 V222 H200 Z',
  'M226 206 V62 H420 V206',
  'M214 62 H432 V48 H214 Z',
  'M226 96 H186 V126 H226',
  'M176 132 H214 V144 H176 Z M176 138 H122',
  'M170 186 H232 V194 H170 Z',
  'M420 76 H450 V192 H420',
];

/** ② Two people's notes on one model; each person adopts their own; Leslie hands the phone on. */
export const MANY = {
  yukPin: 67.0,
  shuoReply: 69.0,
  brand: [69.4, 70.4],
  slider: [70.8, 72.6],
  yukAdopt: 73.4,
  lesPin: 74.4,
  xianReply: 76.2,
  review: 77.6,
  spacing: [79.0, 81.6],
  glow: [81.4, 82.4],
  lesAdopt: 83.2,
  v2: 84.0,
  phone: [85.0, 93.4],
  pull: [87.6, 89.0],
  handoff: [90.6, 91.6],
  hold: [93.6, 98.0],
};

/** ③ The call goes to whoever is closest to it: Leslie owns the user side. */
export const JUDGE = { card: [98.6, 120], ballToLeslie: [101.2, 102.6], pick: 104.2, reason: [104.6, 111.4], hideCore: [106.4, 108.4], hold: [115.6, 120.0] };

/** ④ Practice rounds; Yukina's sketch becomes the method; A/B under the same conditions; Yukina nods. */
export const GROW = {
  montage1: [121.0, 127.0],
  freeze: [127.0, 130.4],
  method: [128.6, 130.4],
  montage2: [130.4, 133.0],
  compare: [133.2, 140.0],
  strike: 136.6,
  ballToYukina: [138.6, 139.6],
  adopt: 140.4,
  toWall: [143.6, 145.0],
  rice: [145.0, 150.6],
  hold: [151.6, 156.0],
};
export const VERSIONS = [
  { at: 121.0, v: 1, score: 38, skew: 1, prop: [1.25, 0.78, 0.9], label: '歪嘴了' },
  { at: 122.4, v: 3, score: 47, skew: 0.6, prop: [1.15, 0.86, 0.95] },
  { at: 123.6, v: 6, score: 55, skew: 0.35, prop: [0.9, 1.12, 1.05] },
  { at: 124.8, v: 9, score: 61, skew: 0.2, prop: [1.08, 0.92, 1.0] },
  { at: 125.8, v: 14, score: 64, skew: 0.15, prop: [0.95, 1.06, 0.97] },
  { at: 130.4, v: 18, score: 82, skew: 0.05, prop: [1.03, 0.98, 1.0] },
  { at: 131.4, v: 23, score: 91, skew: 0.02, prop: [1.01, 1.0, 1.0] },
  { at: 132.3, v: 27, score: 96, skew: 0, prop: [1, 1, 1] },
];

/** 登场: only the coffee machine goes on stage; two notes start; the rest stay; a blank note for the room. */
export const STAGE = {
  pan: [156.0, 157.6],
  heroMove: [157.2, 158.6],
  firsts: [158.8, 0.9],
  doing: [162.6, 2.4],
  blank: 168.0,
  cat: 168.6,
  tagline: 169.4,
  endcard: [173.4, DURATION],
};
export const FIRSTS = [
  { who: 'yukina', text: '第一次做 3D' },
  { who: 'mindfn', text: '第一次自己做出能跑的原型' },
  { who: 'whut', text: '第一次调拆解动画，图纸一张没出门' },
  { who: 'leslie', text: '第一次亲手拆开它，递给下一个人' },
];
export const DOING = [
  { id: 'lang', tag: '在做 5/12', who: 'zlz', cat: 'momo' },
  { id: 'photo', tag: '在做', who: 'mindfn', cat: 'shuo' },
];

export const SECTIONS = [
  { n: '①', at: S.cloud, zh: '在哪都能把活交出去', en: 'Hand work off from anywhere' },
  { n: '②', at: S.many, zh: '几个人和几只猫，围着同一件作品', en: 'Several people, several cats, one piece of work' },
  { n: '③', at: S.judge, zh: '谁的领域谁拍板', en: 'Whoever owns it makes the call' },
  { n: '④', at: S.grow, zh: '越干越懂这个团队', en: 'It gets better at being this team' },
];
export const HOLDS = [
  { at: BEFORE.wallLine, zh: '每个好点子，最后都贴回了这面墙。', en: 'Every good idea ends up back on this wall.' },
  { at: CLOUD.hold, zh: '活在哪儿干都行：图纸不出门，结论回到作品。', en: 'Work runs where it must. The drawings stay; the answer comes back.' },
  { at: MANY.hold, zh: '两个人的意见，长进了同一个版本。', en: 'Two people’s notes, one better version.' },
  { at: JUDGE.hold, zh: '猫把取舍摆清楚，离这件事最近的人拍板。', en: 'The cats lay out the trade-off. Whoever is closest decides.' },
  { at: GROW.hold, zh: '猫自己练、自己改练法；变好要人点头，也能退回。', en: 'They practise and improve how they practise — adopted with a nod, reversible.' },
];
