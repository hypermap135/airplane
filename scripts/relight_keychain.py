#!/usr/bin/env python3
"""relight_keychain.py — lifestyle product shot for the 8 fabric keychains.

Takes each cropped keychain PNG and asks Gemini to re-render it in a
lifestyle context: held with a real house/car key on a wooden desk or
linen surface, soft natural light, shallow depth of field. The
embroidered design must remain 1:1 identical (every letter, color and
plane silhouette preserved).

Usage:
  python3 scripts/relight_keychain.py            # all 8
  python3 scripts/relight_keychain.py captain    # just the matching one
"""

import sys
import json
import base64
import ssl
import urllib.request
import urllib.error
from pathlib import Path

KEYCHAINS = [
    "porte-cle-air-france-lhr",           # AIR FRANCE SkyTeam (red)
    "porte-cle-remove-before-flight",
    "porte-cle-air-france-navy",
    "porte-cle-air-france-rouge-navy",
    "porte-cle-captain",
    "porte-cle-pilot",
    "porte-cle-silhouette-avion-1",
    "porte-cle-silhouette-avion-2",
]

IN_DIR  = Path("public/images")              # source = current bare crops
OUT_DIR = Path(".tmp/preview")                # write previews here first
MODEL   = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

PROMPT = (
    "Re-render this fabric keychain as a LIFESTYLE product photo. "
    "ABSOLUTE REQUIREMENTS — the embroidered keychain must remain 100% "
    "identical: same exact text, same exact font, same exact colors, "
    "same embroidered logos and plane silhouettes. Do NOT redraw or "
    "reinterpret the embroidery — preserve it pixel-faithful. "
    ""
    "SCENE: Place the keychain so its split ring is attached to one "
    "modern house key (silver, recently cut). Both the keychain and "
    "the key rest naturally on a textured surface — a warm-toned oak "
    "desk OR a neutral linen cloth. Composition is slightly diagonal, "
    "keychain reading left-to-right, key partially visible at top-left. "
    ""
    "LIGHTING: Soft natural window light from the upper-left, warm 5200K. "
    "Subtle shadows that ground the keychain. No harsh studio reflections. "
    ""
    "DEPTH: Shallow depth of field — the keychain text is tack-sharp, the "
    "surface beneath it gently falls out of focus toward the edges. "
    ""
    "FRAMING: Square 1:1, the keychain occupies ~70% of the frame "
    "horizontally, centered slightly low. No watermarks, no extra text, "
    "no other keychains in the scene. Background is unobstructed."
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
    api_key = load_api_key()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    handles = KEYCHAINS
    if len(sys.argv) > 1:
        needle = sys.argv[1].lower()
        handles = [h for h in KEYCHAINS if needle in h]
        if not handles:
            sys.exit(f"no keychain matches '{needle}'")

    for h in handles:
        src = IN_DIR / f"{h}.png"
        if not src.exists():
            print(f"  ⚠  {src} missing, skipping")
            continue
        out = OUT_DIR / f"{h}.png"
        print(f"  → Gemini {h}…", flush=True)
        img = call_gemini(api_key, src)
        out.write_bytes(img)
        print(f"     ✓ {len(img) // 1024} kB → {out}")

    print(f"\n{len(handles)} previews written to {OUT_DIR}")
    print("Review them, then move to public/images/ to publish.")


if __name__ == "__main__":
    main()
