#!/usr/bin/env python3
"""Crop watermark out of b737-ryanair, rembg, center on 1200x1200."""
import io
from pathlib import Path
from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
SRC  = ROOT / "public" / "images" / "b737-ryanair.png"
OUT  = ROOT / "public" / "images" / "b737-ryanair.png"
BACKUP = ROOT / "public" / "images" / "b737-ryanair.original.png"

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print(f"Source: {w}x{h}")

if not BACKUP.exists():
    img.save(BACKUP)
    print(f"Backup saved: {BACKUP.name}")

# Crop bottom 55% — watermark sits in top half
crop = img.crop((0, int(h * 0.45), w, h))
buf = io.BytesIO()
crop.save(buf, format="PNG")

# Re-rembg the clean crop
result = remove(buf.getvalue())
plane = Image.open(io.BytesIO(result)).convert("RGBA")

# Tight crop to airplane bbox + 6% padding
bbox = plane.getbbox()
if bbox:
    pw, ph = plane.size
    pad_x = int((bbox[2] - bbox[0]) * 0.06)
    pad_y = int((bbox[3] - bbox[1]) * 0.06)
    bbox = (
        max(0, bbox[0] - pad_x), max(0, bbox[1] - pad_y),
        min(pw, bbox[2] + pad_x), min(ph, bbox[3] + pad_y),
    )
    plane = plane.crop(bbox)

# Center on 1200x1200 transparent canvas (same as A320 reference)
canvas = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
plane.thumbnail((1100, 1100), Image.LANCZOS)
x = (1200 - plane.width) // 2
y = (1200 - plane.height) // 2
canvas.paste(plane, (x, y))

out_buf = io.BytesIO()
canvas.save(out_buf, format="PNG", optimize=True)
OUT.write_bytes(out_buf.getvalue())
kb = len(out_buf.getvalue()) // 1024
print(f"Done: {OUT.name} ({kb} KB, 1200x1200)")
