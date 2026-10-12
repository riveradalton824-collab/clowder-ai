// 《以后再说 / Someday》— a team becomes AI-native: it starts doing what it never could.
// Single source of timing truth (pure data): imported by the composition and audio/synth.mjs.
// Brief: meow-club/cat-cafe-map briefs/2026-10-12-leadership-concept-film (direction A, issue #3).

export const FPS = 30;
export const DURATION = 170;

export const S = {
  before: [0, 25],
  turn: [25, 36],
  cloud: [36, 66],
  many: [66, 96],
  judge: [96, 116],
  grow: [116, 152],
  stage: [152, DURATION],
};

export const BADGE = '企业协作蓝图 · 基于开源实践探索';

export const PEOPLE = {
  lin: { name: '林姐', role: '产品', color: '#b05f45' },
  zhou: { name: '小周', role: '设计', color: '#5c5fac' },
  chen: { name: '老陈', role: '售后', color: '#3f8552' },
  jie: { name: '阿杰', role: '结构工程', color: '#4d7fa3' },
  wang: { name: '王总', role: '负责人', color: '#8f4d89' },
};
export const CATS = {
  xian: { name: '宪宪', sticker: 'xianxian', midi: 69 },
  yan: { name: '砚砚', sticker: 'yanyan', midi: 54 },
  shuo: { name: '烁烁', sticker: 'shuoshuo', midi: 76 },
  momo: { name: '墨墨', sticker: 'momo', midi: 71 },
};

/** The "以后再说" wall. x/y are board-local (board 1460×760); `hero` is the one the film follows. */
export const NOTES = [
  { id: 'board', text: '门店数据看板', sub: '', date: '2025.08', x: 60, y: 100, r: -1, at: 0.7 },
  { id: 'lang', text: '德语版说明书', sub: '（没人懂德语）', date: '2024.06', x: 70, y: 380, r: 3, at: 1.1 },
  { id: 'visit', text: '老客户回访小程序', sub: '', date: '2024.11', x: 380, y: 440, r: -4, at: 1.5 },
  { id: 'repair', text: '把十年维修记录', sub: '变成助手', date: '2024.02', x: 700, y: 370, r: -2, at: 1.9 },
  { id: 'video', text: '售后视频自动剪辑', sub: '', date: '2025.03', x: 1020, y: 210, r: 4, at: 2.3 },
  { id: 'kb', text: '客服话术知识库', sub: '', date: '2025.11', x: 1000, y: 480, r: 2, at: 2.7 },
  { id: 'hero', text: '咖啡机 3D 拆解说明书', sub: '（没人会 3D）', date: '2023.04', x: 360, y: 120, r: -3, at: 8.6 },
  { id: 'ar', text: 'AR 门店导航', sub: '（没人做过 AR）', date: '2023.09', x: 700, y: 90, r: 2, at: 19.2 },
];
export const RICE = { id: 'rice', text: '电饭煲 3D 拆解说明书', sub: '（下一张）', date: '2026.10', x: 1190, y: 40, r: -2, at: 140.4 };

export const BEFORE = {
  quote: [0.8, 9.0],
  meeting: [3.0, 9.4],
  meetingLines: [
    { who: 'lin', at: 3.5, text: '要不做个 3D 拆解说明书？用户总问滤芯怎么换。' },
    { who: 'zhou', at: 5.3, text: '好主意……可我们没人会 3D。' },
    { who: 'wang', at: 6.9, text: '先放放，下季度再说。' },
  ],
  folder: [9.4, 14.2],
  tickets: [14.2, 20.0],
  wallLine: [20.0, 25.0],
};

export const TURN = {
  trotIn: [25.0, 26.2],
  pounce: [26.0, 33.0],
  noteFall: [30.3, 31.2],
  line: [31.8, 34.8],
  phoneOn: 32.4,
  toWork: [34.6, 36.0],
};

/** ① 端云：云上先捏，图纸在阿杰电脑上，只带回尺寸。 */
export const CLOUD = {
  blob: [36.4, 40.5],
  v1Note: [40.6, 43.0],
  ballDown: [42.8, 44.2],
  catIn: 44.0,
  allowBar: [44.4, 47.0],
  allowClick: 46.6,
  trot: [46.9, 48.1],
  carry: [48.1, 54.6],
  drop: 54.3,
  ballUp: [54.6, 56.0],
  keepLocal: [49.0, 57.6],
  snap: [56.0, 57.4],
  phone: [57.8, 66.0],
  hold: [62.8, 66.0],
};

/** ② 多人多 agent：两个人的意见长进同一个版本。 */
export const MANY = {
  zhouPin: 67.6,
  zhouReply: 70.0,
  chenPin: 72.6,
  chenReply: 75.0,
  review: 77.6,
  zhouAdopt: 80.0,
  brand: [80.2, 81.2],
  slider: [81.4, 83.0],
  chenAdopt: 84.4,
  explode: [84.6, 86.0],
  glow: [85.8, 86.8],
  v2: 87.2,
  hold: [91.6, 96.0],
};

/** ③ 判断在人：内部结构要不要全公开。 */
export const JUDGE = { card: [96.6, 104.4], ballToWang: [99.2, 100.6], pick: 102.2, hideCore: [104.4, 106.4], hold: [111.6, 116.0] };

/** ④ RSI：自己练、自己改练法；人拉方向、点头采用、可退回；新任务上复验。 */
export const GROW = {
  montage1: [117.0, 123.0],
  freeze: [123.0, 126.4],
  method: [124.6, 126.4],
  montage2: [126.4, 129.0],
  compare: [129.2, 136.0],
  strike: 132.6,
  ballToWang: [134.6, 135.6],
  adopt: 136.4,
  toWall: [139.6, 141.0],
  rice: [141.0, 146.6],
  hold: [147.6, 152.0],
};
export const VERSIONS = [
  { at: 117.0, v: 1, score: 38, skew: 1, prop: [1.25, 0.78, 0.9], label: '歪嘴了' },
  { at: 118.4, v: 3, score: 47, skew: 0.6, prop: [1.15, 0.86, 0.95] },
  { at: 119.6, v: 6, score: 55, skew: 0.35, prop: [0.9, 1.12, 1.05] },
  { at: 120.8, v: 9, score: 61, skew: 0.2, prop: [1.08, 0.92, 1.0] },
  { at: 121.8, v: 14, score: 64, skew: 0.15, prop: [0.95, 1.06, 0.97] },
  { at: 126.4, v: 18, score: 82, skew: 0.05, prop: [1.03, 0.98, 1.0] },
  { at: 127.4, v: 23, score: 91, skew: 0.02, prop: [1.01, 1.0, 1.0] },
  { at: 128.3, v: 27, score: 96, skew: 0, prop: [1, 1, 1] },
];

/** 登场：咖啡机那张先上场（每人一行「第一次」，都在前面演过），其余点子陆续挪过去，墙空下去。 */
export const STAGE = {
  pan: [152.0, 153.6],
  heroMove: [153.2, 154.6],
  firsts: [154.8, 0.85],
  rest: [158.4, 0.4],
  blank: 162.2,
  cat: 162.8,
  tagline: 163.6,
  endcard: [166.6, DURATION],
};
export const FIRSTS = [
  { who: 'lin', text: '第一次自己做出能跑的原型' },
  { who: 'zhou', text: '第一次做 3D' },
  { who: 'chen', text: '意见第一次变成了画面' },
  { who: 'jie', text: '图纸一张没出门' },
];
export const REST_ORDER = ['ar', 'repair', 'rice', 'board', 'kb', 'video', 'visit', 'lang'];

export const SECTIONS = [
  { n: '①', at: S.cloud, zh: '在哪都能把活交出去', en: 'Hand work off from anywhere' },
  { n: '②', at: S.many, zh: '几个人和几只猫，围着同一件作品', en: 'Several people, several cats, one piece of work' },
  { n: '③', at: S.judge, zh: '判断始终在人', en: 'People make the call' },
  { n: '④', at: S.grow, zh: '越干越懂这个团队', en: 'It gets better at being this team' },
];
export const HOLDS = [
  { at: BEFORE.wallLine, zh: '每个好点子，最后都贴回了这面墙。', en: 'Every good idea ends up back on this wall.' },
  { at: CLOUD.hold, zh: '活在哪儿干都行：图纸不出门，结论回到作品。', en: 'Work runs where it must. The drawings stay; the answer comes back.' },
  { at: MANY.hold, zh: '两个人的意见，长进了同一个版本。', en: 'Two people’s notes, one better version.' },
  { at: JUDGE.hold, zh: '猫把取舍摆清楚，拍板的是人。', en: 'The cats lay out the trade-off. People decide.' },
  { at: GROW.hold, zh: '猫自己练、自己改练法；变好要人点头，也能退回。', en: 'They practise and improve how they practise — adopted with a nod, reversible.' },
];
