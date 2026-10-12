// Fixed stage geometry (px). Cursor paths, clicks and overlays all read from here.

export const VIDEO = { x: 220, y: 110, w: 1120, h: 690 };
export const MODEL = { x: 300, y: 150, w: 1140, h: 700 };
export const CHAT = { x: 840, y: 190, w: 900, h: 640 };
export const BAR = 40; // window title bar height

// Donut placement inside each window's body (svg box, viewBox 600×420).
export const VIDEO_DONUT = { left: 180, top: 34, w: 760 };
export const MODEL_DONUT = { left: 90, top: 100, w: 640 };

/** Stage point for a donut viewBox point inside a window. */
export function donutPoint(win, donut, p) {
  const k = donut.w / 600;
  return { x: win.x + donut.left + p.x * k, y: win.y + BAR + donut.top + p.y * k };
}

export const PET_W = 192;
export const PET_H = 208;
export const petCenter = (spot) => ({ x: spot.x + 96, y: spot.y + 110 });

// Live-style dock under the cat at its video spot.
export const DOCK = { x: 1290, y: 800, w: 330 };
export const DOCK_BTN = {
  begin: { x: 1455, y: 880 },
  write: { x: 1493, y: 880 },
  share: { x: 1380, y: 934 },
};

// Screen-share picker and the shared-window chip (vision register).
export const PICKER = { x: 660, y: 360, w: 440, rowY: [452, 502, 552] };
export const shareChip = (win) => ({ x: win.x, y: win.y + win.h + 12, w: 440, pause: { x: win.x + 386, y: win.y + win.h + 30 } });

// Modelling app material panel slider (roughness).
export const SLIDER = { x0: 1150, x1: 1410, y: 330 };
export const sliderX = (v) => SLIDER.x0 + v * (SLIDER.x1 - SLIDER.x0);
