#!/usr/bin/env python3
"""split_metal_accessories.py — split the IMG-7037 lot photo.

The Shopify source lumps two distinct items in one image:
  - a circular jet-engine "fan" clock
  - a rectangular AIR FRANCE red metal keychain

This script crops each from the source, pads to square, writes them
to public/images/ as the per-variant source photos. Run relight_metal.py
afterwards to swap them for lifestyle Gemini shots.
"""

from pathlib import Path
from PIL import Image

SRC = Path(".tmp/preview/accessoires-metal-source.png")
OUT = Path("public/images")

# Manual crops — read from the source by eye.
ITEMS = [
    # (handle, (left, top, right, bottom)) — derived from bbox detection
    ("accessoire-horloge-turbine",   (270, 100, 610, 410)),
    ("accessoire-portecle-metal-af", (560, 70,  890, 410)),
]

def main():
    if not SRC.exists():
        raise SystemExit(f"missing: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)

    img = Image.open(SRC).convert("RGBA")
    for handle, box in ITEMS:
        crop = img.crop(box)
        side = max(crop.size)
        sq = Image.new("RGBA", (side, side), (255, 255, 255, 0))
        off = ((side - crop.size[0]) // 2, (side - crop.size[1]) // 2)
        sq.paste(crop, off, crop)
        dest = OUT / f"{handle}.png"
        sq.save(dest, "PNG", optimize=True)
        print(f"  → {dest}  ({crop.size[0]}x{crop.size[1]})")

    print(f"\n{len(ITEMS)} accessories written to {OUT}")

if __name__ == "__main__":
    main()
