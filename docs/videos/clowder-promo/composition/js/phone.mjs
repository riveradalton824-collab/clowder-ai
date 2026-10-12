// Live preview phone. It morphs as the cats work (skeleton → plain → styled →
// big buttons after the human's correction), then takes the stage in the payoff.
import { PAYOFF, WS } from './timeline.mjs';
import { easeInOut, easeOut, h, hexLerp, lerp, place, prog, win } from '../../../promo-kit/util.mjs';

const PH = { x: 1305, y: 394, w: 250, h: 500 };
const CW = 206;
const HERO = { dx: -280, dy: -219, s: 1.62 };

export function buildPhone(app) {
  const dim = h('div', 'dim', app);
  const phone = h('div', 'phone', app);
  phone.style.left = `${PH.x}px`;
  phone.style.top = `${PH.y}px`;
  const screen = h('div', 'screen', phone);
  h('div', 'notch', phone);
  const ph = h('div', 'p-placeholder', screen, '预览');
  const skel = h('div', 'skel', screen);
  for (let i = 0; i < 5; i++) h('div', `sk sk-${i}`, skel);

  const feed = h('div', 'page feed', screen);
  const title = h('div', 'p-title', feed, '投喂打卡');
  const sub = h('div', 'p-sub', feed);
  const rows = [
    { name: '橘子', color: '#e39b4f', fed: '✓ 今天已喂 07:50' },
    { name: '煤球', color: '#2d2b27', fed: '✓ 已喂 08:31' },
  ].map((d) => {
    const r = h('div', 'p-row', feed);
    const pic = h('div', 'pic', r);
    pic.style.background = d.color;
    const nm = h('div', 'pname', r, d.name);
    const btn = h('div', 'pbtn', r);
    return { ...d, r, pic, nm, btn };
  });
  const ripple = h('div', 'ripple', feed);

  const adopt = h('div', 'page adopt', screen);
  h('div', 'p-title big', adopt, '领养登记');
  h('div', 'p-sub big', adopt, '大字 · 大按钮');
  h('div', 'field', adopt, '你的名字');
  h('div', 'field', adopt, '想领养谁');
  h('div', 'pbtn big-btn', adopt, '提交登记');

  function update(t) {
    const dk = win(t, PAYOFF.dim[0], PAYOFF.dim[1], 0.7);
    dim.style.opacity = dk * 0.9;
    const hk = easeInOut(prog(t, PAYOFF.lift[0], PAYOFF.lift[1])) * (1 - easeInOut(prog(t, PAYOFF.back[0], PAYOFF.back[1])));
    place(phone, { x: HERO.dx * hk, y: HERO.dy * hk, s: lerp(1, HERO.s, hk) });
    phone.classList.toggle('hero', hk > 0.01);

    ph.style.opacity = 1 - prog(t, WS.skeleton[0], WS.skeleton[0] + 0.3);
    skel.style.opacity = win(t, WS.skeleton[0], WS.skeleton[1] + 0.2, 0.3);
    skel.style.setProperty('--shine', `${((t * 160) % 420) - 120}px`);
    const ak = easeInOut(prog(t, WS.adopt[0], WS.adopt[1]));
    feed.style.opacity = prog(t, WS.skeleton[1], WS.skeleton[1] + 0.4) * (1 - ak);
    adopt.style.opacity = ak;

    const k2 = easeInOut(prog(t, WS.styled[0], WS.styled[1]));
    const k3 = easeInOut(prog(t, WS.bigger[0], WS.bigger[1]));
    const tapped = t >= PAYOFF.tap + 0.12;
    title.style.fontSize = `${lerp(16, 30, k3)}px`;
    sub.style.fontSize = `${lerp(11, 16, k3)}px`;
    sub.textContent = k3 < 0.4 ? '今天 · 2 只猫' : `今天 · ${tapped ? 2 : 1}/2 已喂`;
    const top0 = lerp(80, 128, k3);
    const rh = lerp(50, 124, k3);
    rows.forEach((row, i) => {
      place(row.r, { y: top0 + i * (rh + lerp(6, 14, k3)) });
      row.r.style.height = `${rh}px`;
      row.r.style.background = `rgba(247,242,234,${k2})`;
      row.r.style.borderBottomColor = `rgba(229,223,213,${1 - k2})`;
      const ps = lerp(lerp(0, 28, k2), 44, k3);
      Object.assign(row.pic.style, { width: `${ps}px`, height: `${ps}px`, opacity: k2, top: `${lerp(11, 8, k3)}px` });
      Object.assign(row.nm.style, {
        left: `${lerp(lerp(10, 46, k2), 64, k3)}px`,
        top: `${lerp(15, 14, k3)}px`,
        fontSize: `${lerp(14, 26, k3)}px`,
      });
      const big = k3 > 0.4;
      const fed = big && (i === 0 || tapped);
      row.btn.textContent = fed ? row.fed : big ? '我喂过了' : '打卡';
      const bg = fed ? '#3f8552' : hexLerp('#ffffff', '#b05f45', k2);
      const press = i === 1 ? 1 - Math.sin(Math.PI * prog(t, PAYOFF.tap - 0.1, PAYOFF.tap + 0.15)) * 0.05 : 1;
      Object.assign(row.btn.style, {
        left: `${lerp(CW - 50, 8, k3)}px`,
        top: `${lerp(12, 62, k3)}px`,
        width: `${lerp(52, CW - 16, k3)}px`,
        height: `${lerp(26, 52, k3)}px`,
        fontSize: `${lerp(12, fed ? 18 : 22, k3)}px`,
        borderRadius: `${lerp(lerp(4, 13, k2), 14, k3)}px`,
        background: bg,
        color: k2 > 0.5 || fed ? '#ffffff' : '#3d3d3a',
        borderColor: `rgba(216,209,198,${1 - k2})`,
        transform: `scale(${press})`,
      });
    });
    const rk = prog(t, PAYOFF.tap - 0.05, PAYOFF.tap + 0.55);
    const ry = top0 + rh + lerp(6, 14, k3) + 62 + 26;
    place(ripple, { o: rk > 0 && rk < 1 ? 0.55 * (1 - rk) : 0, x: CW / 2 + 14 - 40, y: ry - 40, s: easeOut(rk) * 2.4 });
  }
  return { update };
}
