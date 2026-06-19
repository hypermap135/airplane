#!/usr/bin/env python3
"""relight_metal_accessories.py — lifestyle shots for the 2 metal accessories.

Each item has its own context:
  - Horloge turbine: on an oak desk or shelf next to a stack of aviation books,
    afternoon light, slight angle.
  - Porte-clé métal AF: held by a silver house key on warm-toned oak desk,
    soft window light. Same vibe as the fabric keychains.

Source = the cropped per-item PNGs written by split_metal_accessories.py.
Output goes to .tmp/preview/ for review; move to public/images/ to publish.
"""

import sys
import json
import base64
import ssl
import urllib.request
import urllib.error
from pathlib import Path

IN_DIR  = Path("public/images")
OUT_DIR = Path(".tmp/preview")
MODEL   = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

ITEMS = [
    {
        "handle": "accessoire-horloge-turbine",
        "prompt": (
            "Re-render this object as a LIFESTYLE product photo. "
            "ABSOLUTE REQUIREMENT — the object must remain 100% identical: "
            "same exact metallic turbine fan shape, same chrome rim, same "
            "yellow-green clock hands, same hub. Do NOT redraw or "
            "reinterpret it — preserve it pixel-faithful. "
            ""
            "SCENE: Place the turbine clock standing slightly tilted on a "
            "warm-toned oak shelf, with one hardcover book and a pair of "
            "pilot wings pin lying beside it (small, secondary, out of "
            "focus). Soft natural window light from the upper-left, warm "
            "5200K. Subtle shadow grounding the clock. Square 1:1 frame, "
            "clock occupies ~70% of the frame width, centered slightly low. "
            "Shallow depth of field — clock face tack-sharp, surrounding "
            "props gently blurred. No watermarks, no text overlays."
        ),
    },
    {
        "handle": "accessoire-portecle-metal-af",
        "prompt": (
            "Re-render this object as a LIFESTYLE product photo. "
            "ABSOLUTE REQUIREMENT — the keychain must remain 100% identical: "
            "same exact red background, same chrome metal frame, same "
            "AIR FRANCE wording, same rooster crest logo, same split ring. "
            "Do NOT redraw or reinterpret it — preserve it pixel-faithful. "
            ""
            "SCENE: Place the keychain so its split ring is attached to a "
            "single modern silver house key. Both rest naturally on a "
            "warm-toned oak desk. Slight diagonal composition, keychain "
            "reading left-to-right, key partially visible at top-left. "
            "Soft natural window light from the upper-left, warm 5200K. "
            "Square 1:1 frame, keychain occupies ~65% of the frame "
            "horizontally, centered slightly low. Shallow depth of field. "
            "No watermarks, no text overlays."
        ),
    },
]


def load_api_key() -> str:
    env = Path(".env.local")
    if not env.exists():
        sys.exit("ERROR: .env.local not found")
    for line in env.read_text().splitlines():
        line = line.strip()
        if line.startswith(("GOOGLE_AI_KEY=", "GEMINI_API_KEY=")):
            return line.split("=", 1)[1].strip()
    sys.exit("ERROR: GOOGLE_AI_KEY/GEMINI_API_KEY missing in .env.local")


def call_gemini(api_key: str, src: Path, prompt: str) -> bytes:
    parts = [
        {"text": prompt},
        {
            "inlineData": {
                "mimeType": "image/png",
                "data": base64.b64encode(src.read_bytes()).decode("ascii"),
            }
        },
    ]
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    req = urllib.request.Request(
        f"{ENDPOINT}?key={api_key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, timeout=180, context=ctx) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Gemini HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:400]}")

    for p in data.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        inline = p.get("inlineData") or p.get("inline_data")
        if inline and inline.get("mimeType", "").startswith("image/"):
            return base64.b64decode(inline["data"])
    sys.exit("Gemini returned no image")


def main():
    api_key = load_api_key()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    needle = sys.argv[1].lower() if len(sys.argv) > 1 else None
    for item in ITEMS:
        if needle and needle not in item["handle"]:
            continue
        src = IN_DIR / f"{item['handle']}.png"
        if not src.exists():
            print(f"  ⚠  {src} missing, skipping")
            continue
        out = OUT_DIR / f"{item['handle']}.png"
        print(f"  → Gemini {item['handle']}…", flush=True)
        img = call_gemini(api_key, src, item["prompt"])
        out.write_bytes(img)
        print(f"     ✓ {len(img) // 1024} kB → {out}")

    print(f"\nWritten to {OUT_DIR}. Review then cp to public/images/.")


if __name__ == "__main__":
    main()
