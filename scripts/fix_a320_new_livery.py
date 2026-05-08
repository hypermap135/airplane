#!/usr/bin/env python3
"""Lift the cockpit/nose shadows on the A320 New Livery Air France image.

The Shopify CDN source has the cockpit area visibly darker than the rest
of the fuselage (mean 91 vs 113 luminance). Apply a soft elliptical mask
on the front-top portion of the plane and gamma-lift just that region.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC  = ROOT / ".tmp" / "feedback" / "a320-new-livery-source.png"
OUT  = ROOT / "public" / "images" / "a320-new-livery-af.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.float32)
h, w = arr.shape[:2]
alpha = arr[:, :, 3] / 255.0

# Find airplane bbox
ys, xs = np.where(alpha > 0.12)
x0, x1 = xs.min(), xs.max()
y0, y1 = ys.min(), ys.max()
plane_w = x1 - x0
plane_h = y1 - y0
print(f"Plane bbox: x[{x0}-{x1}]  y[{y0}-{y1}]  ({plane_w}x{plane_h})")

# Build elliptical mask centered on the cockpit area
# The cockpit is at the front (~15% from left of plane) and top (~25% from top)
cockpit_cx = x0 + plane_w * 0.18
cockpit_cy = y0 + plane_h * 0.28
# Ellipse radii — wide enough to cover cockpit + nose smoothly
rx = plane_w * 0.22
ry = plane_h * 0.30

yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
dx = (xx - cockpit_cx) / rx
dy = (yy - cockpit_cy) / ry
dist = np.sqrt(dx * dx + dy * dy)
# Soft falloff: 1 at center, 0 at edges, smooth
mask = np.clip(1.0 - dist, 0, 1)
# Smoothstep for organic falloff
mask = mask * mask * (3 - 2 * mask)
# Only apply on opaque pixels
mask = mask * alpha

# Apply gamma lift on RGB where mask is strong
gamma = 0.55  # < 1 lifts shadows; lower = stronger lift
rgb = arr[:, :, :3] / 255.0

# Compute lifted version
lifted = np.power(rgb, gamma)
# Slight warm/neutral boost on lifted area
# Lifted gets a tiny brightness add too
lifted = np.clip(lifted * 1.02, 0, 1)

# Blend: original + (lifted - original) * mask
mask_3 = mask[:, :, None]
result = rgb * (1 - mask_3) + lifted * mask_3
result = np.clip(result * 255, 0, 255).astype(np.uint8)

# Reassemble RGBA
out_arr = np.dstack([result, arr[:, :, 3].astype(np.uint8)])
Image.fromarray(out_arr, mode="RGBA").save(OUT, optimize=True)

# Stats
out_gray = result.mean(axis=2)
opaque = alpha > 0.12
cockpit_box = (
    slice(int(cockpit_cy - ry), int(cockpit_cy + ry)),
    slice(int(cockpit_cx - rx), int(cockpit_cx + rx)),
)
cockpit_after = out_gray[cockpit_box][opaque[cockpit_box]].mean()
print(f"Cockpit luminance after lift: {cockpit_after:.1f}  (was 91.2)")
print(f"✓ Saved → {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")
