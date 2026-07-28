#!/usr/bin/env python3
"""Genère une variante de chaque photo produit avec train d'atterrissage
sorti + socle bois parfaitement droit + reste inchangé.

Utilise Gemini 2.5 Flash Image (edit mode) : envoie l'image source + un
prompt d'édition contraint pour préserver la maquette (livrée, angle,
proportions) et ne modifier QUE le train d'atterrissage et l'alignement
du socle.

Usage:
  python3 scripts/gemini_add_landing_gear.py

Config :
  - Lit .env.local pour GEMINI_API_KEY / GOOGLE_AI_KEY
  - Écrit dans /public/images/{name}--gear.webp (variante, ne remplace pas)
  - Skip si le fichier de sortie existe déjà (rerunnable)
"""

import base64, json, os, ssl, sys, subprocess
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "public" / "images"

MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

PROMPT = (
    "Edit this scale-model airplane product photo to make TWO changes only:\n"
    "1. Deploy/extend the landing gear (all 3 wheels: nose gear and both main gears "
    "under the wings) fully so they are clearly visible under the aircraft. If the "
    "aircraft has retracted gear, extend it. Keep the wheels realistic and "
    "proportional to the aircraft model.\n"
    "2. Straighten the wooden display stand if it appears tilted or crooked so the "
    "aircraft sits perfectly horizontal, and align the stand base straight to the "
    "camera. Keep the same wooden material and finish.\n\n"
    "STRICT REQUIREMENTS — preserve exactly:\n"
    "- The exact same aircraft model, livery, colors, registration number, decals\n"
    "- The same camera angle and framing\n"
    "- The same background (do not change background color or add elements)\n"
    "- The same lighting mood\n"
    "- Overall aircraft proportions and shape\n"
    "- Any LED/lights on the fuselage\n\n"
    "Do NOT add: watermarks, text, logos, hands, other objects.\n"
    "Output: photorealistic product studio photo, sharp focus, professional catalog quality."
)


def load_api_key() -> str:
    env_path = ROOT / ".env.local"
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_AI_KEY="):
            return line.split("=", 1)[1].strip()
    raise SystemExit("no api key")


def convert_to_webp(input_png: Path, output_webp: Path, width: int = 1400):
    """Convert PNG output from Gemini to WebP via sharp (installed in node_modules)."""
    node_script = f"""
const sharp = require('{ROOT}/node_modules/sharp');
sharp('{input_png}').resize({{width: {width}, withoutEnlargement: true}})
  .webp({{quality: 85}}).toFile('{output_webp}').then(() => process.exit(0));
"""
    subprocess.run(["node", "-e", node_script], check=True, capture_output=True)


def generate(src: Path, api_key: str) -> Path | None:
    """Send src to Gemini, save result as {src.stem}--gear.webp."""
    out_webp = IMG_DIR / f"{src.stem}--gear.webp"
    if out_webp.exists():
        return out_webp  # rerunnable — skip existing

    # Load source image as base64
    b64_src = base64.b64encode(src.read_bytes()).decode()
    body = json.dumps({
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {"inline_data": {"mime_type": "image/webp", "data": b64_src}},
            ]
        }],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()

    req = urllib.request.Request(
        f"{ENDPOINT}?key={api_key}",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=120) as r:
            data = json.load(r)
    except Exception as e:
        print(f"  ✗ {src.name}: request failed — {str(e)[:80]}")
        return None

    for p in data.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in p:
            png_bytes = base64.b64decode(p["inlineData"]["data"])
            tmp_png = IMG_DIR / f".tmp_{src.stem}.png"
            tmp_png.write_bytes(png_bytes)
            try:
                convert_to_webp(tmp_png, out_webp)
                tmp_png.unlink()
                size_kb = out_webp.stat().st_size // 1024
                print(f"  ✓ {src.name} → {out_webp.name} ({size_kb} KB)")
                return out_webp
            except Exception as e:
                print(f"  ✗ {src.name}: webp conv failed — {e}")
                if tmp_png.exists(): tmp_png.unlink()
                return None

    err = str(data)[:200]
    print(f"  ✗ {src.name}: no image in response — {err}")
    return None


def main():
    api_key = load_api_key()
    # Main product photos only (no --alt, no already-generated --gear)
    KEYWORDS = ["a220", "a320", "a321", "a350", "a380", "737", "747", "777",
                "787", "concorde", "jet-prive", "gulfstream", "rafale",
                "mirage", "f16"]
    srcs = []
    for f in sorted(IMG_DIR.glob("*.webp")):
        if any(s in f.name for s in ["--", "hero/", "led-", "logo-", "og-", ".original."]):
            continue
        if any(k in f.name.lower() for k in KEYWORDS):
            srcs.append(f)

    print(f"→ {len(srcs)} photos à traiter")
    ok = 0
    for i, src in enumerate(srcs, 1):
        print(f"[{i:2}/{len(srcs)}] {src.name}")
        if generate(src, api_key):
            ok += 1
    print(f"\n=== {ok}/{len(srcs)} générées ===")


if __name__ == "__main__":
    main()
