#!/usr/bin/env python3
"""Strip the 'Air Plane Store / www.airplanestore.fr' watermark from the
Boeing 787 Air France product photo.

The source is already RGBA with a transparent backdrop, so we don't need
inpainting — we just zero the alpha of every pixel inside the watermark
zone (bottom-right corner). The wooden stand sits a bit left of center,
so the watermark zone (right half, lower band) doesn't touch the plane.

Output → public/images/b787-af.png so we can repoint products.ts to
a local file and avoid a CDN re-upload.
"""

import sys
from pathlib import Path
from PIL import Image

SRC = Path(".tmp/boeing-af/7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454_nobg.png")
OUT = Path("public/images/b787-af.png")

# Watermark zone (source is 1200x1200). Watermark sits roughly at
# x=390..880, y=820..970. Wipe a comfortable margin around it without
# touching the wooden stand which is centered around x=350..560,
# y=680..780. So the wipe x1 stays safely past the stand's right edge.
WIPE_X1 = 660
WIPE_Y1 = 700
WIPE_X2 = 1200
WIPE_Y2 = 1200


def main() -> int:
    if not SRC.exists():
        print(f"ERROR: source not found: {SRC}", file=sys.stderr)
        return 1

    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    print(f"loaded {SRC} ({w}x{h}, {img.mode})")

    pixels = img.load()
    wiped = 0
    for y in range(WIPE_Y1, min(WIPE_Y2, h)):
        for x in range(WIPE_X1, min(WIPE_X2, w)):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (r, g, b, 0)
                wiped += 1
    print(f"wiped {wiped} watermark pixels in ({WIPE_X1},{WIPE_Y1})-({WIPE_X2},{WIPE_Y2})")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"saved {OUT} ({OUT.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
