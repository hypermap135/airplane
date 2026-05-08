#!/usr/bin/env python3
"""Finalize the A320 New Livery target image:
  1. Remove Gemini watermark (bottom-right corner) via cv2 inpainting
  2. Center-crop to square (preserve full airplane visibility)
  3. Resize to 1200×1200
  4. Save → public/images/a320-new-livery-af.png
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC  = ROOT / ".tmp" / "feedback" / "a320-new-livery-target.png"
OUT  = ROOT / "public" / "images" / "a320-new-livery-af.png"

# ── 1. Load + remove Gemini watermark in bottom-right ─────────────────────────
img = Image.open(SRC).convert("RGB")
arr = np.array(img)
h, w = arr.shape[:2]
print(f"Source: {w}×{h}")

# Watermark zone: bottom-right corner, ~6% of width × ~7% of height
x1 = int(w * 0.93)
y1 = int(h * 0.92)
x2, y2 = w, h
print(f"Watermark zone: ({x1},{y1}) → ({x2},{y2})")

# Build mask for bright pixels in that zone (the watermark is bright white/silver)
gray = arr.mean(axis=2)
mask = np.zeros((h, w), dtype=np.uint8)
zone = gray[y1:y2, x1:x2]
local_mask = (zone > 90).astype(np.uint8) * 255
# Dilate so we cover the watermark fully
kernel = np.ones((9, 9), np.uint8)
local_mask = cv2.dilate(local_mask, kernel, iterations=2)
mask[y1:y2, x1:x2] = local_mask
print(f"Watermark pixels detected: {(mask > 0).sum()}")

# Inpaint
bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
inpainted_bgr = cv2.inpaint(bgr, mask, 7, cv2.INPAINT_TELEA)
clean = cv2.cvtColor(inpainted_bgr, cv2.COLOR_BGR2RGB)

# ── 2. Center-crop to square ──────────────────────────────────────────────────
# The image is 2304×1838 (~1.25:1). Crop sides equally to make it square.
size = min(h, w)
left = (w - size) // 2
top = (h - size) // 2
cropped = clean[top:top + size, left:left + size]
print(f"Cropped to square: {size}×{size}")

# ── 3. Resize to 1200×1200 ────────────────────────────────────────────────────
final = cv2.resize(cropped, (1200, 1200), interpolation=cv2.INTER_LANCZOS4)

# ── 4. Save ───────────────────────────────────────────────────────────────────
OUT.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(final).save(OUT, optimize=True, compress_level=6)
print(f"✓ Saved → {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
