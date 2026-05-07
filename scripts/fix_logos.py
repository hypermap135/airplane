#!/usr/bin/env python3
"""
fix_logos.py — Remove AirplaneStore logo remnants from nobg images,
and re-process dark/pack images from originals.

The logo (gold swoosh + plane icon + "Air Plane Store" text) was kept
by rembg as "foreground". We remove it by:
1. Erasing gold/yellow pixels (the icon)
2. Erasing spatial bounding boxes where the text logo appears
3. Re-processing some images from scratch with better thresholds
"""

import io
import sys
import numpy as np
import requests
from PIL import Image
from pathlib import Path
from rembg import remove

OUT_DIR = Path(__file__).parent / "rembg_out"
CDN = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files"


def load_local(name: str) -> Image.Image:
    path = OUT_DIR / name
    return Image.open(path).convert("RGBA")


def download_original(name: str) -> bytes:
    r = requests.get(f"{CDN}/{name}", timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"Download failed ({r.status_code}): {name}")
    return r.content


def erase_gold_pixels(img: Image.Image, gold_thresh=(160, 100, 0, 30)) -> Image.Image:
    """Zero out pixels that look like the gold AirplaneStore logo icon."""
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    # Gold: high R, moderate-high G, low B, visible alpha
    is_gold = (
        (r > gold_thresh[0]) &
        (g > gold_thresh[1]) &
        (b < gold_thresh[2] + 80) &    # allow some blue but keep it low
        (r > g * 0.85) &               # R >= G (warm hue)
        (g > b * 1.4) &                # G much higher than B
        (a > gold_thresh[3])
    )
    arr[is_gold] = [0, 0, 0, 0]
    return Image.fromarray(arr.astype(np.uint8))


def erase_region(img: Image.Image, x0: int, y0: int, x1: int, y1: int) -> Image.Image:
    """Erase a rectangular region (set alpha=0)."""
    arr = np.array(img)
    arr[y0:y1, x0:x1] = [0, 0, 0, 0]
    return Image.fromarray(arr)


def erase_near_white_in_region(img: Image.Image, x0, y0, x1, y1, thresh=180) -> Image.Image:
    """Erase light/white pixels in a region (logo text is usually white/light gray)."""
    arr = np.array(img, dtype=np.uint8)
    region = arr[y0:y1, x0:x1]
    r, g, b, a = region[..., 0], region[..., 1], region[..., 2], region[..., 3]
    is_light = (r > thresh) & (g > thresh) & (b > thresh) & (a > 20)
    region[is_light] = [0, 0, 0, 0]
    arr[y0:y1, x0:x1] = region
    return Image.fromarray(arr)


def place_on_canvas(img: Image.Image, size=1200, pad=0.06) -> Image.Image:
    """Place image centered on 1200x1200 transparent canvas with padding."""
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
        px = int((bbox[2] - bbox[0]) * pad)
        py = int((bbox[3] - bbox[1]) * pad)
        bbox = (max(0, bbox[0]-px), max(0, bbox[1]-py),
                min(w, bbox[2]+px), min(h, bbox[3]+py))
        img = img.crop(bbox)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img.thumbnail((size - 2*int(size*pad), size - 2*int(size*pad)), Image.LANCZOS)
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y), img)
    return canvas


def save(img: Image.Image, name: str):
    path = OUT_DIR / name
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    path.write_bytes(buf.getvalue())
    kb = len(buf.getvalue()) // 1024
    print(f"  ✅ Saved: {name} ({kb} KB)")


def reprocess_from_original(original_name: str, out_name: str):
    """Download original, run rembg, place on canvas."""
    print(f"  ⬇ Downloading original: {original_name}")
    raw = download_original(original_name)
    print(f"  🤖 Running rembg...")
    result = remove(raw)
    img = Image.open(io.BytesIO(result)).convert("RGBA")
    canvas = place_on_canvas(img)
    save(canvas, out_name)
    return canvas


# ─────────────────────────────────────────────────────────────
# FIX 1 — A380 Emirates: erase logo in top portion
# ─────────────────────────────────────────────────────────────
print("\n[1/8] A380 Emirates — erasing logo region + gold pixels...")
img = load_local("Airbus_A380_Emirates_nobg.png")
# Erase top ~30% where the logo lives (1200px canvas)
img = erase_region(img, 0, 0, 1200, 380)
# Also sweep for any remaining gold pixels
img = erase_gold_pixels(img)
save(img, "Airbus_A380_Emirates_nobg_v3.png")

# ─────────────────────────────────────────────────────────────
# FIX 2 — B777 Air France: logo bottom-right
# ─────────────────────────────────────────────────────────────
print("\n[2/8] B777 Air France — erasing logo bottom-right...")
img = load_local("B17227E2-BB4C-4D08-A770-B39827FB907C_nobg.png")
# Logo "Air Plane Store" bottom-right area
img = erase_region(img, 650, 700, 1200, 1000)
img = erase_gold_pixels(img)
save(img, "B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 3 — B737 Ryanair: gold icon top-right
# ─────────────────────────────────────────────────────────────
print("\n[3/8] B737 Ryanair — erasing gold icon top-right...")
img = load_local("5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg.png")
img = erase_region(img, 700, 0, 1200, 300)
img = erase_gold_pixels(img)
save(img, "5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 4 — Gulfstream G650: full logo top-left
# ─────────────────────────────────────────────────────────────
print("\n[4/8] Gulfstream G650 — erasing logo top-left...")
img = load_local("D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg.png")
img = erase_region(img, 0, 0, 700, 400)
img = erase_gold_pixels(img)
# Also erase any white text remnants in that region
img = erase_near_white_in_region(img, 0, 0, 700, 500, thresh=160)
save(img, "D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 5 — Concorde British Airways: logo top-center
# ─────────────────────────────────────────────────────────────
print("\n[5/8] Concorde British Airways — erasing logo top area...")
img = load_local("9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg.png")
img = erase_region(img, 150, 0, 900, 350)
img = erase_gold_pixels(img)
save(img, "9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 6 — Pack Duo: re-process from original (dark planes issue)
# ─────────────────────────────────────────────────────────────
print("\n[6/8] Pack Duo — re-processing original...")
img = reprocess_from_original("B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F.png", "B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png")
# Erase any logo remnants
img = erase_gold_pixels(img)
save(img, "B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 7 — Pack Boeing: re-process + erase logo
# ─────────────────────────────────────────────────────────────
print("\n[7/8] Pack Boeing — re-processing original...")
img = reprocess_from_original("7FA23F23-9A53-4EB8-A584-36B12C7C84BB.png", "7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png")
img = erase_gold_pixels(img)
save(img, "7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png")

# ─────────────────────────────────────────────────────────────
# FIX 8 — Horloge Murale: use original (dark object, nobg fails)
# ─────────────────────────────────────────────────────────────
print("\n[8/8] Horloge Murale — re-processing from original with better settings...")
raw = download_original("AD184BA4-005E-4FB9-B9FC-0A8B97709210.jpg")
# Use rembg with alpha matting for better dark object handling
try:
    from rembg import remove, new_session
    session = new_session("isnet-general-use")
    result = remove(raw, session=session, alpha_matting=True,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=10)
except Exception:
    result = remove(raw)
img = Image.open(io.BytesIO(result)).convert("RGBA")
canvas = place_on_canvas(img)
save(canvas, "AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png")

print("\n✅ All fixes done! Files saved to rembg_out/")
print("Next: upload v2 files to Shopify and update products.ts URLs")
