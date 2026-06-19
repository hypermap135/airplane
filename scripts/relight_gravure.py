#!/usr/bin/env python3
"""relight_gravure.py — replace the engraved English text on the wooden base.

The Shopify source shows a rosewood/cherry display base engraved with
"Customize Your Plane Model & Name". We re-render the same base, same
wood, same lighting, but with the engraving in French.
"""

import sys
import json
import base64
import ssl
import urllib.request
import urllib.error
from pathlib import Path

SRC = Path(".tmp/preview/gravure-source.png")
OUT = Path(".tmp/preview/gravure-base-vide.png")
MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

PROMPT = (
    "Re-render this product photo of a wooden airplane display base. "
    "ABSOLUTE REQUIREMENTS — keep the EXACT same wooden base: same "
    "rosewood / cherry colour, same trapezoidal slanted shape, same "
    "highlights, same shadow, same camera angle, same composition. "
    ""
    "ONLY CHANGE: REMOVE every engraving / text from the slanted front "
    "face. The slope must be completely smooth, bare wood, no letters, "
    "no marks, no carving. Show ONLY the polished wooden base with its "
    "natural grain. "
    ""
    "Square 1:1 frame, transparent or pure white background (same as the "
    "source). No scene, no props, no watermark, no text anywhere in the "
    "image."
)


def load_api_key() -> str:
    env = Path(".env.local")
    if not env.exists():
        sys.exit("ERROR: .env.local not found")
    for line in env.read_text().splitlines():
        line = line.strip()
        if line.startswith(("GOOGLE_AI_KEY=", "GEMINI_API_KEY=")):
            return line.split("=", 1)[1].strip()
    sys.exit("ERROR: GOOGLE_AI_KEY/GEMINI_API_KEY missing in .env.local")


def call_gemini(api_key: str, src: Path) -> bytes:
    parts = [
        {"text": PROMPT},
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
    if not SRC.exists():
        sys.exit(f"missing: {SRC}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    api_key = load_api_key()
    print("  → Gemini gravure-personnalisee…", flush=True)
    img = call_gemini(api_key, SRC)
    OUT.write_bytes(img)
    print(f"     ✓ {len(img) // 1024} kB → {OUT}")
    print("\nReview, then cp to public/images/.")


if __name__ == "__main__":
    main()
