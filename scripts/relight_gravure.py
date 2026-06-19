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
OUT = Path(".tmp/preview/gravure-personnalisee.png")
MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

PROMPT = (
    "PHOTOREALISTIC re-render of this wooden airplane display base. "
    "Keep the same trapezoidal slanted base shape and the same rich "
    "rosewood / dark cherry colour. "
    ""
    "BACKGROUND: a clean dark studio scene — deep matte black with a "
    "subtle warm spotlight grazing the wood from the upper-left, "
    "creating soft highlights on the top edge and a soft shadow on the "
    "tabletop. Not pure-black flat: real photo-studio darkness with "
    "tonal gradient. Slight reflection of the base on the tabletop. "
    ""
    "ENGRAVING: on the slanted front face, render a REAL LASER "
    "ENGRAVING with this French text on TWO lines, centered horizontally, "
    "elegant serif font, slightly burnt-darker than the wood with a "
    "tiny inner highlight (genuine carved depth, not flat overlay):\n"
    "\n"
    "    Personnalisez votre\n"
    "    modèle\n"
    "\n"
    "STRICT SPELLING — letters in order: "
    "Line 1: P, e, r, s, o, n, n, a, l, i, s, e, z (then space) v, o, t, r, e. "
    "Line 2: m, o, d, è, l, e. "
    "The word Personnalisez has TWO N letters in a row and ONE S "
    "between i and e. The word modèle uses a grave accent on the è. "
    "No other accents, no umlauts, no hyphens. Re-check the spelling "
    "before generating. "
    ""
    "Square 1:1 frame. Wood base occupies ~70% of the frame, centered. "
    "Photo-realistic lighting and depth-of-field. No watermark, no "
    "extra text anywhere in the image, only the two engraved lines."
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
