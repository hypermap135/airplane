#!/usr/bin/env python3
"""Finalize the A320 LED-on image (desk + notebook + clock scene):
  1. Remove Gemini watermark (bottom-right corner) via cv2 inpainting
  2. Center-crop to square (preserve full airplane visibility)
  3. Resize to 1400×1400 (slightly larger — this is the LED hero photo)
  4. Save → public/led/a320-led-on.jpg
"""
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC  = ROOT / ".tmp" / "feedback" / "a320-led-on-target.png"
OUT  = ROOT / "public" / "led" / "a320-led-on.jpg"

# 1. Load + remove watermark
img = Image.open(SRC).convert("RGB")
arr = np.array(img)
h, w = arr.shape[:2]
print(f"Source: {w}×{h}")

x1 = int(w * 0.93)
y1 = int(h * 0.92)
x2, y2 = w, h

gray = arr.mean(axis=2)
mask = np.zeros((h, w), dtype=np.uint8)
zone = gray[y1:y2, x1:x2]
local_mask = (zone > 90).astype(np.uint8) * 255
kernel = np.ones((9, 9), np.uint8)
local_mask = cv2.dilate(local_mask, kernel, iterations=2)
mask[y1:y2, x1:x2] = local_mask
print(f"Watermark pixels: {(mask > 0).sum()}")

bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
inpainted_bgr = cv2.inpaint(bgr, mask, 7, cv2.INPAINT_TELEA)
clean = cv2.cvtColor(inpainted_bgr, cv2.COLOR_BGR2RGB)

# 2. Center-crop to square — but keep airplane in frame
# Airplane is roughly centered horizontally, slightly above center vertically
size = min(h, w)  # 1838
# Crop horizontally centered
left = (w - size) // 2
top = 0  # keep from top to preserve airplane (which is in upper portion)
cropped = clean[top:top + size, left:left + size]
print(f"Cropped to square: {size}×{size}")

# 3. Resize to 1400
final = cv2.resize(cropped, (1400, 1400), interpolation=cv2.INTER_LANCZOS4)

# 4. Save as JPG (the photo is photographic, JPG fine + smaller)
OUT.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(final).save(OUT, quality=88, optimize=True)
print(f"✓ Saved → {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
