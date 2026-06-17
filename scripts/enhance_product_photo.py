#!/usr/bin/env python3
"""enhance_product_photo.py — one-shot "rends plus clair" pipeline.

Standardised photo enhancement for AirplaneStore product images:
  1. Send the source image to Gemini 2.5 Flash Image with a prompt that:
     - removes every watermark, URL, logo, gold glyph
     - keeps the plane EXACTLY identical (livery, registration, colors)
     - zooms in so the plane fills ~85% of a square 1:1 frame
     - places the plane on a consistent light-grey studio background
  2. Pass the Gemini output through rembg to extract a clean alpha matte.
  3. Save as a transparent PNG ready to drop into the card grid (the card
     chrome's #080810 background then shows through seamlessly).

Usage:
  python3 scripts/enhance_product_photo.py <input> <output>

  # Example:
  python3 scripts/enhance_product_photo.py \\
    .tmp/sources/b777-qatar.png \\
    public/images/b777-qatar.png

Requires GOOGLE_AI_KEY (or GEMINI_API_KEY) in .env.local and the rembg
Python package (already installed in this project).
"""

import sys
import json
import base64
import ssl
import urllib.request
import urllib.error
import argparse
from pathlib import Path

# ─── Standard prompt (refined across B787 / Concorde / Gulfstream runs) ───
STANDARD_PROMPT = (
    "Edit this product photo of an airplane model on a wooden display stand. "
    "CRITICAL REQUIREMENTS: "
    "(1) REMOVE every text fragment, watermark, URL, gold-plane glyph, or any "
    "letter — nothing should remain in the source image except the airplane "
    "and its base. "
    "(2) The airplane MUST FILL approximately 85% of the frame — zoom in "
    "significantly so the plane and stand together span almost the full width "
    "and height of a square 1:1 composition. "
    "(3) Keep the airplane EXACTLY identical: same livery, same registration "
    "markings, same colors, same shape, same wooden display stand. Do not "
    "invent or modify any detail of the aircraft itself. "
    "(4) Place on a CLEAN LIGHT GREY studio background (around #c5c8cd at "
    "center fading to #9aa0a8 at edges) like a high-end aviation product "
    "catalogue. "
    "(5) Studio key-lighting from above-left, soft contact shadow under the "
    "wooden base, sharp focus, high resolution, professional product "
    "photography. "
    "NO transparency, NO checker pattern, NO added text, NO new branding. "
    "Square 1:1 format."
)

MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def load_api_key() -> str:
    """Pull GOOGLE_AI_KEY (or GEMINI_API_KEY) from .env.local."""
    env_path = Path(".env.local")
    if not env_path.exists():
        sys.exit("ERROR: .env.local not found")
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line.startswith(("GOOGLE_AI_KEY=", "GEMINI_API_KEY=")):
            return line.split("=", 1)[1].strip()
    sys.exit("ERROR: GOOGLE_AI_KEY/GEMINI_API_KEY missing in .env.local")


def detect_mime(path: Path) -> str:
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".heic": "image/heic",
    }.get(path.suffix.lower(), "image/png")


def call_gemini(api_key: str, image_path: Path, prompt: str) -> bytes:
    """POST the image + standard prompt to Gemini and return raw image bytes."""
    image_b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {
                    "mimeType": detect_mime(image_path),
                    "data": image_b64,
                }},
            ],
        }],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    req = urllib.request.Request(
        f"{ENDPOINT}?key={api_key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    # macOS Python 3 often lacks a CA bundle — single hop to a Google
    # endpoint with an API key as auth, so the unverified context is OK here.
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, timeout=120, context=ctx) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Gemini HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:400]}")

    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    for p in parts:
        inline = p.get("inlineData") or p.get("inline_data")
        if inline and inline.get("mimeType", "").startswith("image/"):
            return base64.b64decode(inline["data"])

    text_msg = " | ".join(p.get("text", "") for p in parts if p.get("text"))
    sys.exit(f"Gemini returned no image. Notes: {text_msg or 'none'}")


def remove_background(image_bytes: bytes) -> bytes:
    """Pass image bytes through rembg to make the background alpha-transparent."""
    try:
        from rembg import remove
    except ImportError:
        sys.exit("ERROR: rembg not installed. Run: pip install rembg")
    return remove(image_bytes)


def frame_to_reference(
    image_bytes: bytes,
    canvas: int = 1400,
    top_pct: float = 0.12,
    bottom_pct: float = 0.15,
) -> bytes:
    """Frame the cut-out plane to match the A320 New Livery AF reference:
      - Canvas 1400×1400 square (RGBA, transparent background)
      - Plane stretched so it fills 100% of the width when possible
        (or the available height — whichever hits the limit first)
      - Top margin ~12%, bottom margin ~15% (asymmetric: more air below
        so the wooden base / shadow has room to breathe)
      - Plane horizontally centered

    These ratios were measured directly from a320-new-livery-af.png:
      bbox.width  = 100% of canvas width
      bbox.height = 72.5% of canvas height
      top margin  = 12.1%
      bot margin  = 15.4%
    """
    from io import BytesIO
    from PIL import Image
    import numpy as np
    img = Image.open(BytesIO(image_bytes)).convert("RGBA")

    # Use a STRICT bbox (alpha > 32) so semi-transparent anti-aliased
    # edges don't inflate the bounding box. PIL's getbbox() treats any
    # non-zero pixel as content, which makes the framing too small in
    # the canvas (lots of empty halo around the plane).
    arr = np.array(img)
    opaque = arr[..., 3] > 32
    if not opaque.any():
        return image_bytes
    ys, xs = np.where(opaque)
    x1, x2 = int(xs.min()), int(xs.max()) + 1
    y1, y2 = int(ys.min()), int(ys.max()) + 1
    plane = img.crop((x1, y1, x2, y2))
    pw, ph = plane.size

    target_plane_h = int(canvas * (1 - top_pct - bottom_pct))
    scale_by_w = canvas / pw
    scale_by_h = target_plane_h / ph
    scale = min(scale_by_w, scale_by_h)  # don't overflow either axis
    new_pw = max(1, int(round(pw * scale)))
    new_ph = max(1, int(round(ph * scale)))
    plane_scaled = plane.resize((new_pw, new_ph), Image.LANCZOS)

    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    off_x = (canvas - new_pw) // 2
    # Center the plane vertically within the [top_pct .. 1-bottom_pct] band
    plane_band_top = int(canvas * top_pct)
    off_y = plane_band_top + (target_plane_h - new_ph) // 2
    out.paste(plane_scaled, (off_x, off_y), plane_scaled)

    buf = BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("input",  type=Path, help="Source image (PNG/JPG/WEBP/HEIC)")
    parser.add_argument("output", type=Path, help="Destination PNG (transparent RGBA)")
    parser.add_argument(
        "--prompt",
        default=STANDARD_PROMPT,
        help="Override the standard prompt (rarely needed)",
    )
    parser.add_argument(
        "--no-rembg",
        action="store_true",
        help="Skip rembg step and keep Gemini's grey-studio background",
    )
    parser.add_argument(
        "--no-frame",
        action="store_true",
        help="Skip the final reference framing (skip if --no-rembg too)",
    )
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"ERROR: input not found: {args.input}")

    key = load_api_key()

    print(f"▶ Step 1/2 — Gemini ({MODEL})")
    print(f"  input:  {args.input} ({args.input.stat().st_size // 1024} KB)")
    gemini_bytes = call_gemini(key, args.input, args.prompt)
    print(f"  ✓ {len(gemini_bytes) // 1024} KB returned (grey studio)")

    if args.no_rembg:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(gemini_bytes)
        print(f"▶ Skipping rembg (--no-rembg). Final: {args.output}")
        return 0

    print(f"▶ Step 2/3 — rembg (alpha matte)")
    rembg_bytes = remove_background(gemini_bytes)
    print(f"  ✓ {len(rembg_bytes) // 1024} KB transparent (raw bbox)")

    if args.no_frame:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(rembg_bytes)
        print(f"▶ Skipping framing (--no-frame). Final: {args.output}")
        return 0

    print(f"▶ Step 3/3 — frame to reference (1400×1400, width 100%, top 12% / bot 15%)")
    final_bytes = frame_to_reference(rembg_bytes)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(final_bytes)
    print(f"  ✓ {len(final_bytes) // 1024} KB final (matches A320 NL reference)")
    print(f"▶ Done. Saved → {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
