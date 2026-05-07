#!/usr/bin/env python3
"""Edit A220 photo via Gemini Image to add real LED glow."""
import base64, json, os, sys, time
from pathlib import Path
from urllib import request, error

ROOT = Path(__file__).parent
SRC = ROOT / "a220-source.jpg"
OUT_DIR = ROOT
KEY = os.environ["GEMINI_API_KEY"]

PROMPT = """Edit this exact photograph of an Airbus A220-300 Air France resin model on a stand.
Keep the airplane's silhouette, livery, decals, registration F-CDG, and angle PIXEL-PERFECT identical.
DO NOT regenerate the plane. Only modify the lighting and environment:

1. Replace the beige/tan background with a deep dark studio environment (almost black, subtle navy gradient).
2. Turn ON the LED system: the cockpit windscreen glows warm white, every cabin window glows warm amber-white from inside, and a soft cyan-blue LED accent (#3a8eff) lights the underside of the fuselage and the stand.
3. Add a subtle volumetric blue haze under the plane.
4. The reflection on the dark glossy surface below should pick up the warm cabin glow.
5. Photorealistic, premium product photography style, no plastic look, no AI artifacts, sharp details preserved.

Output only the edited image, no text overlay, no badges, no logos added."""

models = [
    "gemini-3-pro-image-preview",
    "gemini-2.5-flash-image",
]

def call(model: str) -> bytes | None:
    img_b64 = base64.b64encode(SRC.read_bytes()).decode()
    body = {
        "contents": [{
            "role": "user",
            "parts": [
                {"text": PROMPT},
                {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
            ],
        }],
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}"
    req = request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method="POST")
    print(f"→ {model}: requesting…", flush=True)
    t0 = time.time()
    try:
        resp = request.urlopen(req, timeout=180)
    except error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:600]}")
        return None
    payload = json.loads(resp.read())
    dt = time.time() - t0
    print(f"  ✓ {dt:.1f}s — finishReason={payload.get('candidates', [{}])[0].get('finishReason')}")
    for cand in payload.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
            if "inline_data" in part:
                return base64.b64decode(part["inline_data"]["data"])
    print("  no image returned. raw keys:", list(payload.keys()))
    print(json.dumps(payload, indent=2)[:1500])
    return None

for m in models:
    img = call(m)
    if not img:
        continue
    out = OUT_DIR / f"a220-led-on-{m.replace('/', '_')}.png"
    out.write_bytes(img)
    print(f"  → saved {out} ({len(img)/1024:.0f} KB)")
