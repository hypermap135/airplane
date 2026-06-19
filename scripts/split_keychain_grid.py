#!/usr/bin/env python3
"""split_keychain_grid.py — one-shot grid cropper.

Takes the source 2x4-grid keychain photo (8 keychains in a single image)
and writes 8 individual PNGs to public/images/, one per keychain.

Layout assumed:
    +----+----+
    | k1 | k2 |
    +----+----+
    | k3 | k4 |
    +----+----+
    | k5 | k6 |
    +----+----+
    | k7 | k8 |
    +----+----+

Each output keeps the source's aspect ratio for its cell and is padded
to a clean square so the product grid stays uniform.
"""

from pathlib import Path
from PIL import Image

SRC  = Path(".tmp/preview/keychain-source.png")
OUT  = Path("public/images")
COLS = 2
ROWS = 4

# Output handles in row-major order (left → right, top → bottom).
HANDLES = [
    "porte-cle-air-france-lhr",         # row 1, col 1 — red AIR FRANCE LHR
    "porte-cle-remove-before-flight",   # row 1, col 2 — red REMOVE BEFORE FLIGHT
    "porte-cle-air-france-navy",        # row 2, col 1 — navy compact AF
    "porte-cle-air-france-rouge-navy",  # row 2, col 2 — red + navy AF
    "porte-cle-captain",                # row 3, col 1 — black gold wings CAPTAIN
    "porte-cle-silhouette-avion-1",     # row 3, col 2 — yellow plane silhouette
    "porte-cle-pilot",                  # row 4, col 1 — black gold wings PILOT
    "porte-cle-silhouette-avion-2",     # row 4, col 2 — yellow plane silhouette
]

def main():
    if not SRC.exists():
        raise SystemExit(f"source not found: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)

    img = Image.open(SRC).convert("RGBA")
    # Crop to actual content first — the nobg source has ~150-300px of
    # transparent padding around the 2x4 grid which would otherwise
    # produce mostly-empty cells.
    bbox = img.getbbox()
    img = img.crop(bbox)
    W, H = img.size
    cw, ch = W // COLS, H // ROWS

    for r in range(ROWS):
        for c in range(COLS):
            idx = r * COLS + c
            handle = HANDLES[idx]
            box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            crop = img.crop(box)

            # Pad to a clean square so the product card aspect stays 1:1.
            side = max(crop.size)
            sq = Image.new("RGBA", (side, side), (255, 255, 255, 0))
            off = ((side - crop.size[0]) // 2, (side - crop.size[1]) // 2)
            sq.paste(crop, off, crop)

            dest = OUT / f"{handle}.png"
            sq.save(dest, "PNG", optimize=True)
            print(f"  → {dest}")

    print(f"\n{len(HANDLES)} keychains written to {OUT}")

if __name__ == "__main__":
    main()
