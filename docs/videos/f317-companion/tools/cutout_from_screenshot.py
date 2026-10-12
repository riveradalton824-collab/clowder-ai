#!/usr/bin/env python3
"""Stand-in desktop cat for the F317 film, cut from an operator screenshot.

The current companion art (宪宪 v3) is not in this repository, so the film uses a
cut-out of the operator's screenshot until the official sprite is available.
Same idea as the house sprite pipeline: clear UI behind the cat, then flood-fill
the light background from the image border; the cat's dark outline stops the fill,
so white fur stays opaque.

    python3 -I tools/cutout_from_screenshot.py <screenshot.png> composition/img/xianxian-v3-from-screenshot.png
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

BG = (255, 251, 246)


def flood_background(fillable):
    h, w = fillable.shape
    seeds = np.zeros((h, w), bool)
    seeds[[0, -1], :] = True
    seeds[:, [0, -1]] = True
    return flood_from(seeds & fillable, fillable)


def flood_from(seeds, fillable):
    h, w = fillable.shape
    bg = seeds.copy()
    q = deque(zip(*np.nonzero(seeds)))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and fillable[yy, xx] and not bg[yy, xx]:
                bg[yy, xx] = True
                q.append((yy, xx))
    return bg


def largest_component(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), int)
    best, best_id, n = 0, 0, 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1
                lab[y, x] = n
                q, size = deque([(y, x)]), 0
                while q:
                    cy, cx = q.popleft()
                    size += 1
                    for yy, xx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                            lab[yy, xx] = n
                            q.append((yy, xx))
                if size > best:
                    best, best_id = size, n
    return lab == best_id


def main(src, dst):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(int).copy()
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w]

    # 1. The send button is a terracotta disc behind the tail tip (the cat also casts a soft
    #    shadow on it). Find the disc by its flat colour, then grow over everything inside it
    #    that is not behind the tail's dark outline; the outline (dilated 1 px to close
    #    anti-aliasing gaps) keeps the growth out of the fur. Grown pixels become background.
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    warm = (r - b > 30) & (r > 185) & (g > 150) & (yy > h * 0.65) & (xx < w * 0.35)
    ref = np.median(a[warm], axis=0)
    flat = warm & (np.abs(a - ref).max(axis=2) < 14)
    ys, xs = np.nonzero(flat)
    top, bottom, left = np.percentile(ys, 0.5), np.percentile(ys, 99.5), np.percentile(xs, 0.5)
    rad = (bottom - top + 1) / 2
    cy, cx = (bottom + top) / 2, left + rad - 0.5
    d = np.hypot(yy - cy, xx - cx)
    dark = Image.fromarray(((a.min(axis=2) < 150) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3))
    outside_outline = (d < rad + 3) & ~(np.asarray(dark) > 0)
    # seed only from the disc itself: a few beige fur pixels inside the tail also match its colour
    button = flood_from(largest_component(flat & outside_outline), outside_outline)
    # the shadowed rim hugging the outline: warm, not dark, within 3 px of the cleared disc
    grown = np.asarray(Image.fromarray((button * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))) > 0
    rim = grown & (d < rad + 3) & (a.min(axis=2) >= 150) & (r - b > 12)
    a[button | rim] = BG

    # 2. Flood the light, near-neutral background (canvas, input box and its border).
    mn, mx = a.min(axis=2), a.max(axis=2)
    bg = flood_background((mn > 172) & ((mx - mn) < 34))
    cat = largest_component(~bg)
    # 3. Opening (erode → dilate) drops 1–3 px slivers left by anti-aliased UI edges.
    mask = Image.fromarray((cat * 255).astype('uint8')).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    cat = largest_component(np.asarray(mask) > 127) & cat

    alpha = Image.fromarray((cat * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))
    out = Image.fromarray(a.astype('uint8'), 'RGB').convert('RGBA')
    out.putalpha(alpha)
    x0, y0, x1, y1 = out.getbbox()
    out.crop((x0 - 2, y0 - 2, x1 + 2, y1 + 2)).save(dst)
    print(f'button ({cx:.0f},{cy:.0f}) r={rad:.1f} cleared {button.sum()} px · cat {cat.sum()} px → {dst}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
