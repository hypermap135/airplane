#!/usr/bin/env python3
"""Strip the 'Air Plane Store' watermark from the A380 Emirates rembg PNG.

The v3 file already has a transparent background (rembg) but the watermark
text "Air Plane Store" + swoosh in the top portion of the canvas was kept
as foreground. Since the airplane sits below that zone, we can just zero
out alpha in the top band to delete the watermark cleanly.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT  = Path(__file__).resolve().parent.parent
SRC   = ROOT / "scripts" / "rembg_out" / "Airbus_A380_Emirates_nobg_v3.png"
OUT   = ROOT / "public" / "images" / "a380-emirates.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]
print(f"Source: {SRC.name}  {w}×{h}")

# Watermark zone — top band of canvas. The plane top fairing starts around
# 30% from the top in the v3 layout, so wiping the top 28% is safe.
y_cut = int(h * 0.28)

# Auto-detect: scan rows from top down, find first row with substantial
# non-transparent pixels NEAR the center (where the plane lives) — that's
# our boundary. Watermark text is mostly mid-canvas too, but text rows have
# fewer opaque pixels than the plane fuselage.
opaque_per_row = (arr[:, :, 3] > 32).sum(axis=1)
plane_threshold = w * 0.25  # plane fuselage spans >25% of width per row
plane_top = next((y for y in range(int(h * 0.15), h) if opaque_per_row[y] > plane_threshold), y_cut)
y_cut = max(int(h * 0.20), plane_top - 12)
print(f"Auto-detected wipe boundary: y < {y_cut}  (plane top ≈ {plane_top})")

# Zero alpha above the cut
arr[:y_cut, :, 3] = 0

cleaned = Image.fromarray(arr, mode="RGBA")

# Optional tighter crop: trim extra transparent margin all around
bbox = cleaned.getbbox()
if bbox:
    px = int((bbox[2] - bbox[0]) * 0.04)
    py = int((bbox[3] - bbox[1]) * 0.04)
    bbox = (
        max(0, bbox[0] - px),
        max(0, bbox[1] - py),
        min(w, bbox[2] + px),
        min(h, bbox[3] + py),
    )
    cleaned = cleaned.crop(bbox)
    print(f"Cropped to airplane bbox: {cleaned.size}")

# Recenter on a clean square canvas (1200×1200) with transparent margin
final_size = 1200
canvas = Image.new("RGBA", (final_size, final_size), (0, 0, 0, 0))
cw, ch = cleaned.size
ratio = min((final_size * 0.92) / cw, (final_size * 0.92) / ch)
new_w = int(cw * ratio)
new_h = int(ch * ratio)
resized = cleaned.resize((new_w, new_h), Image.LANCZOS)
ox = (final_size - new_w) // 2
oy = (final_size - new_h) // 2
canvas.paste(resized, (ox, oy), resized)

OUT.parent.mkdir(parents=True, exist_ok=True)
canvas.save(OUT, optimize=True)
print(f"✓ Saved → {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
