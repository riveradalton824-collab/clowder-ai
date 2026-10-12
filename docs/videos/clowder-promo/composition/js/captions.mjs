// Chapter captions above the product, and the payoff line beside the phone.
import { CAPTIONS, PAYOFF } from './timeline.mjs';
import { easeOut, h, place, prog, win } from './util.mjs';

export function buildCaptions(stage) {
  const caps = CAPTIONS.map((c, i) => {
    const n = h('div', 'chapter', stage);
    h('span', 'chapter-no', n, String(i + 1));
    const tx = h('div', 'chapter-tx', n);
    h('div', 'chapter-zh', tx, c.zh);
    h('div', 'chapter-en', tx, c.en);
    return { n, c };
  });
  const pay = h('div', 'payoff', stage);
  h('div', 'payoff-zh', pay, '它跑起来了。');
  h('div', 'payoff-sub', pay, '从一句话，到一个能用的东西。');
  h('div', 'payoff-en', pay, 'From one sentence to something that works.');

  function update(t) {
    for (const { n, c } of caps) {
      const k = easeOut(prog(t, c.at[0], c.at[0] + 0.5));
      place(n, { o: win(t, c.at[0], c.at[1], 0.4), y: (1 - k) * -10 });
    }
    const pk = easeOut(prog(t, PAYOFF.text[0], PAYOFF.text[0] + 0.7));
    place(pay, { o: win(t, PAYOFF.text[0], PAYOFF.text[1], 0.5), x: (1 - pk) * -24 });
  }
  return { update };
}
