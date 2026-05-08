#!/usr/bin/env python3
"""Lift shadows + warm-tone the a220-on LED photo so the plane is visible.

Source mean luminance is 11%, so even modest CSS filter doesn't help.
This script does proper tone mapping:
  1. Gamma-lift the shadows (so the fuselage silhouette is readable)
  2. Slight contrast boost
  3. Warm hue shift (push any cool LED toward amber)
  4. Re-saturate
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC  = ROOT / "public" / "led" / "a220-on.jpg"
OUT  = ROOT / "public" / "led" / "a220-on-bright.jpg"

img = Image.open(SRC).convert("RGB")
arr = np.array(img).astype(np.float32) / 255.0
print(f"Source mean luminance: {arr.mean()*100:.1f}%")

# 1. Gamma lift (gamma < 1 lifts midtones; lower = more lift)
gamma = 0.42
lifted = np.power(arr, gamma)

# 2. Soft tone curve — lift shadows specifically
# Lift values below 0.5, leave highlights alone
shadow_mask = (lifted < 0.5).astype(np.float32)
lifted = lifted + (lifted * shadow_mask * 0.20)
lifted = np.clip(lifted, 0, 1)

# 3. Warm hue shift in HSL — convert to HSV, push hue toward amber for any
#    bright pixel (LEDs and reflections)
arr_uint = (lifted * 255).astype(np.uint8)
img_lifted = Image.fromarray(arr_uint, mode="RGB")

# Convert RGB → HSV
hsv = img_lifted.convert("HSV")
h_arr = np.array(hsv).astype(np.int16)

# Find brighter pixels (the LEDs and lit areas)
v_channel = h_arr[:, :, 2]
mask_bright = v_channel > 100  # pixels brighter than ~40%
mask_blue = (h_arr[:, :, 0] > 130) & (h_arr[:, :, 0] < 200)  # blue hue range

# Force ANY bright + blue-ish pixel toward warm amber (hue ~25 in PIL HSV scale)
recolor = mask_bright & mask_blue
h_arr[recolor, 0] = 25  # warm amber hue
h_arr[recolor, 1] = np.minimum(h_arr[recolor, 1] + 20, 255)  # boost saturation

# Slightly warm-shift ALL pixels (subtle global shift toward amber)
# Hue 240 (blue) drifts down toward 25 over distance — only nudge cool hues
nudge_mask = (h_arr[:, :, 0] > 100) & (h_arr[:, :, 0] < 200)
h_arr[nudge_mask, 0] = np.maximum(h_arr[nudge_mask, 0] - 15, 25)

h_arr = np.clip(h_arr, 0, 255).astype(np.uint8)
hsv_warm = Image.fromarray(h_arr, mode="HSV")
rgb_warm = hsv_warm.convert("RGB")

# 4. Final contrast + saturation enhance
rgb_warm = ImageEnhance.Contrast(rgb_warm).enhance(1.15)
rgb_warm = ImageEnhance.Color(rgb_warm).enhance(1.25)

# Stats
final_arr = np.array(rgb_warm).astype(np.float32) / 255.0
print(f"Output mean luminance: {final_arr.mean()*100:.1f}%")

rgb_warm.save(OUT, quality=88, optimize=True)
print(f"✓ Saved → {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
