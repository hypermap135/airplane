#!/usr/bin/env python3
"""Fix Gulfstream G650 product image.

Issues with the source on the CDN:
  1. Residual watermark "[gold plane glyph] tore" in the top-right area —
     leftover from an earlier background-removal pass.
  2. The plane sits in the lower half of the 1200x1200 canvas → cards
     show empty space at the top.

This script:
  1. Loads the RGBA source (transparent background).
  2. Wipes a top band (alpha = 0) wide enough to nuke the watermark
     fragments without touching the plane (which sits centered-bottom).
  3. Detects the actual non-transparent bounding box AFTER the wipe,
     crops to that bbox + padding, and re-centers on a clean 1200x1200
     transparent canvas so the plane is vertically + horizontally centered.

Output is saved as public/images/gulfstream-g650.png so we can repoint
products.ts to the local file (no CDN re-upload needed).
"""

import sys
from pathlib import Path
from PIL import Image

SRC = Path(".tmp/gulfstream/source.png")
OUT = Path("public/images/gulfstream-g650.png")

# Watermark wipe zone in source-pixel coordinates (source is 1200x1200).
# The watermark sits roughly from y=60 to y=280, spread across the upper
# center. We wipe everything in y=0..300 to be safe — the plane starts
# around y=320 in the source so this is a comfortable margin.
WIPE_TOP = 0
WIPE_BOTTOM = 400

# Padding ratio around the bbox after cropping (% of bbox max dimension).
PAD_RATIO = 0.08

# Final canvas size (square).
CANVAS = 1200


def main() -> int:
    if not SRC.exists():
        print(f"ERROR: source not found: {SRC}", file=sys.stderr)
        return 1

    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    print(f"loaded {SRC} ({w}x{h}, {img.mode})")

    # 1) Wipe watermark band — set alpha=0 in the top region.
    pixels = img.load()
    wiped = 0
    for y in range(WIPE_TOP, min(WIPE_BOTTOM, h)):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (r, g, b, 0)
                wiped += 1
    print(f"wiped {wiped} non-transparent pixels in y={WIPE_TOP}..{WIPE_BOTTOM}")

    # 2) Detect bbox of remaining non-transparent content (the plane).
    bbox = img.getbbox()
    if bbox is None:
        print("ERROR: image is fully transparent after wipe", file=sys.stderr)
        return 1
    x1, y1, x2, y2 = bbox
    bw, bh = x2 - x1, y2 - y1
    print(f"plane bbox: ({x1},{y1})-({x2},{y2})  size={bw}x{bh}")

    # 3) Crop tight to the bbox.
    cropped = img.crop(bbox)

    # 4) Compute padding and final centering on a square canvas.
    longest = max(bw, bh)
    pad = int(longest * PAD_RATIO)
    target = longest + 2 * pad

    # Scale-down so the padded plane fits within the CANVAS keeping aspect.
    if target > CANVAS:
        scale = CANVAS / target
        new_w = max(1, int(bw * scale))
        new_h = max(1, int(bh * scale))
        cropped = cropped.resize((new_w, new_h), Image.LANCZOS)
        bw, bh = new_w, new_h
        print(f"scaled to fit canvas: {bw}x{bh}")

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    off_x = (CANVAS - bw) // 2
    off_y = (CANVAS - bh) // 2
    canvas.paste(cropped, (off_x, off_y), cropped)
    print(f"pasted at ({off_x},{off_y}) on {CANVAS}x{CANVAS} canvas")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, optimize=True)
    size_kb = OUT.stat().st_size / 1024
    print(f"saved {OUT} ({size_kb:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
