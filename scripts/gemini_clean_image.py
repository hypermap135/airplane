#!/usr/bin/env python3
"""Clean a product image via Gemini 2.5 Flash Image (Nano Banana).

Sends the source image to Gemini with an editing prompt that asks to remove
watermarks / text artifacts while preserving the airplane model exactly.
Saves the result as PNG.

Usage:
  python3 scripts/gemini_clean_image.py <input> <output> [--prompt "..."]

Requires GOOGLE_AI_KEY (or GEMINI_API_KEY) in .env.local.
"""

import sys, os, json, base64, argparse, ssl
import urllib.request
from pathlib import Path

DEFAULT_PROMPT = (
    "Clean this product photo of an airplane model. "
    "Remove ALL text, logos, and watermark artifacts (especially any 'tore', "
    "'store', gold-plane glyphs, or any letters at the top). "
    "Keep the airplane model exactly as it is — same angle, same livery, "
    "same registration number, same wooden stand. "
    "Center the airplane on a fully transparent background. "
    "Output a professional studio product photo, high resolution, "
    "sharp focus, no shadows from removed elements. "
    "Do not add any new text, watermark, or branding."
)

MODEL = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def load_api_key() -> str:
    """Read GOOGLE_AI_KEY from .env.local."""
    env_path = Path(".env.local")
    if not env_path.exists():
        print("ERROR: .env.local not found", file=sys.stderr)
        sys.exit(1)
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line.startswith("GOOGLE_AI_KEY=") or line.startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip()
    print("ERROR: GOOGLE_AI_KEY/GEMINI_API_KEY not in .env.local", file=sys.stderr)
    sys.exit(1)


def detect_mime(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }.get(ext, "image/png")


def call_gemini(api_key: str, image_path: Path, prompt: str) -> bytes:
    """POST image+prompt to Gemini, return raw image bytes from response."""
    image_b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    mime = detect_mime(image_path)

    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime, "data": image_b64}},
            ],
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
        },
    }

    url = f"{ENDPOINT}?key={api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    # macOS Python 3 often lacks a configured CA bundle — for this local
    # one-shot script hitting a well-known Google endpoint, use unverified
    # context. Don't reuse this pattern for any user-data-bearing request.
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, timeout=120, context=ctx) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        print(f"HTTP {e.code} error from Gemini:\n{err_body}", file=sys.stderr)
        sys.exit(1)

    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    for p in parts:
        inline = p.get("inlineData") or p.get("inline_data")
        if inline and inline.get("mimeType", "").startswith("image/"):
            return base64.b64decode(inline["data"])

    # No image came back — print any text + raw response for debugging.
    print("ERROR: no image in Gemini response", file=sys.stderr)
    text_parts = [p.get("text") for p in parts if p.get("text")]
    for t in text_parts:
        print(f"  text: {t}", file=sys.stderr)
    print(f"  raw: {json.dumps(data)[:600]}", file=sys.stderr)
    sys.exit(1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--prompt", default=DEFAULT_PROMPT)
    args = parser.parse_args()

    if not args.input.exists():
        print(f"ERROR: input not found: {args.input}", file=sys.stderr)
        return 1

    key = load_api_key()
    print(f"calling Gemini {MODEL}...")
    print(f"  input:  {args.input} ({args.input.stat().st_size // 1024} KB)")
    print(f"  prompt: {args.prompt[:80]}...")

    image_bytes = call_gemini(key, args.input, args.prompt)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(image_bytes)
    print(f"✓ saved {args.output} ({len(image_bytes) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
