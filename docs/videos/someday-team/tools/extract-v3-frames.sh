#!/usr/bin/env bash
# Extract 宪宪 v3 ("xianxian-living") alpha clips into WebP frame sequences for the composition.
# Source: public repo zts212653/clowder-ai-plugins → packages/companion/assets/skins/xianxian-living/clips
#   tools/extract-v3-frames.sh <path-to-clowder-ai-plugins>
# Output (git-ignored): assets/v3/<clip>/NNN.webp at 24 fps, half size.
set -euo pipefail
SRC="${1:?path to clowder-ai-plugins}/packages/companion/assets/skins/xianxian-living/clips"
OUT="$(cd "$(dirname "$0")/.." && pwd)/assets/v3"
for clip in pounce carry trot wait think peek; do
  mkdir -p "$OUT/$clip"
  rm -f "$OUT/$clip"/*.webp
  # libvpx-vp9 keeps the alpha channel; the native decoder would drop it.
  ffmpeg -v error -y -c:v libvpx-vp9 -i "$SRC/$clip.webm" -vf "fps=24,scale=iw/2:-1" \
    -c:v libwebp -lossless 0 -q:v 88 -start_number 0 "$OUT/$clip/%03d.webp"
  echo "$clip: $(ls "$OUT/$clip" | wc -l) frames"
done
