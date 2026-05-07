#!/usr/bin/env python3
"""Remove airplanestore.fr watermark via cv2 inpainting on bright-pixel mask.

Usage:
  python3 scripts/remove_watermark.py <input> <output> [--zone x1,y1,x2,y2] [--threshold N]

If --zone is omitted, defaults to bottom-right quadrant of the image.
"""
import sys, argparse
import cv2
import numpy as np
from PIL import Image

def clean(input_path, output_path, zone=None, threshold=100, dilate=2, radius=7):
    im = Image.open(input_path).convert("RGB")
    arr = np.array(im)
    h, w = arr.shape[:2]
    if zone is None:
        # Default: bottom-right quadrant — covers most studio-shot watermarks
        zone = (int(w * 0.55), int(h * 0.65), w, h)
    x1, y1, x2, y2 = zone
    region = arr[y1:y2, x1:x2]
    gray = region.mean(axis=2)
    local = (gray > threshold).astype(np.uint8) * 255
    if local.sum() == 0:
        Image.fromarray(arr).save(output_path, optimize=True)
        print(f"  no bright pixels in zone — copied as-is")
        return
    kernel = np.ones((9, 9), np.uint8)
    local = cv2.dilate(local, kernel, iterations=dilate)
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[y1:y2, x1:x2] = local
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    out = cv2.inpaint(bgr, mask, radius, cv2.INPAINT_TELEA)
    Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)).save(output_path, optimize=True)
    print(f"  inpainted {(mask > 0).sum()} px, saved → {output_path}")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--zone")
    p.add_argument("--threshold", type=int, default=100)
    p.add_argument("--dilate", type=int, default=2)
    p.add_argument("--radius", type=int, default=7)
    args = p.parse_args()
    zone = tuple(int(v) for v in args.zone.split(",")) if args.zone else None
    clean(args.input, args.output, zone, args.threshold, args.dilate, args.radius)

if __name__ == "__main__":
    main()
