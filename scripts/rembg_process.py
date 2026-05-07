#!/usr/bin/env python3
"""
rembg_process.py — Remove backgrounds from all primary product images,
upload transparent PNGs to Shopify CDN via staged uploads, output URL mapping.

Usage: python3 scripts/rembg_process.py
"""

import os, json, base64, sys, time
from pathlib import Path
import requests
from rembg import remove
from PIL import Image
import io

CDN        = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files"
STORE      = "y823wg-nz.myshopify.com"
TOKEN      = "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"
OUT_DIR    = Path(__file__).parent / "rembg_out"
MAP_FILE   = Path(__file__).parent / "image-mapping.json"
OUT_DIR.mkdir(exist_ok=True)

IMAGES = [
    "031DDDDC-70E9-43CC-B424-BB7BBC77F75B.png",
    "0DD70AD8-A997-4B31-8A95-0DBBA2C32358.png",
    "1C22E355-7DE6-46E2-A665-53491B42E69B.png",
    "4BC16D16-D848-4680-A696-696A31D55734.png",
    "5EF8FED8-8EAF-4191-934E-A558A9A1D6EF.png",
    "7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454.png",
    "7FA23F23-9A53-4EB8-A584-36B12C7C84BB.png",
    "9A131FF0-EAB2-4176-9236-7B2761E44FB5.png",
    "Airbus_A350_Air_France_cote_gauche.png",
    "Airbus_A380_Emirates.png",
    "Airbus_A380_Singapore_Airlines.png",
    "B17227E2-BB4C-4D08-A770-B39827FB907C.png",
    "B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F.png",
    "CD86650C-845D-487B-9A81-2CA67C80A28A.png",
    "D056EBB6-7CF5-4F52-9B3E-DD90854A7885.png",
    "D1FC9309-F3A3-46FE-9F1F-7612F7CBAC54.png",
    "DF8AE5B5-7A2D-4A02-B2BD-118AAF5D58AD.jpg",
    "IMG-7011.png",
    "IMG-7037.jpg",
    "IMG-7237.png",
    "WhatsApp_Image_2026-04-23_at_18.23.27_7.jpg",
    "Airbus_A320_Air_France.png",
    "AD184BA4-005E-4FB9-B9FC-0A8B97709210.jpg",
]

GQL = "https://{store}/admin/api/2024-07/graphql.json"

def gql(store, token, query, variables=None):
    r = requests.post(
        f"https://{store}/admin/api/2024-07/graphql.json",
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": token},
        json={"query": query, "variables": variables or {}},
        timeout=60,
    )
    return r.json()

STAGED_UPLOAD_Q = """
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters { name value }
    }
    userErrors { field message }
  }
}
"""

FILE_CREATE_Q = """
mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files { ... on MediaImage { id image { url } } }
    userErrors { field message }
  }
}
"""

def download(filename):
    url = f"{CDN}/{filename}"
    r = requests.get(url, timeout=30)
    if r.status_code != 200:
        print(f"  ✗ Download failed ({r.status_code}): {filename}")
        return None
    return r.content

def process_rembg(img_bytes, filename):
    stem = Path(filename).stem
    out_path = OUT_DIR / f"{stem}_nobg.png"
    if out_path.exists():
        print(f"  ✓ Already processed: {out_path.name}")
        return out_path
    print(f"  🤖 Removing bg: {filename}")
    result = remove(img_bytes)
    img = Image.open(io.BytesIO(result)).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
        pad_x = int((bbox[2] - bbox[0]) * 0.06)
        pad_y = int((bbox[3] - bbox[1]) * 0.06)
        bbox = (
            max(0, bbox[0] - pad_x), max(0, bbox[1] - pad_y),
            min(w, bbox[2] + pad_x), min(h, bbox[3] + pad_y),
        )
        img = img.crop(bbox)
    # Square canvas (1200x1200) so all images have same aspect ratio
    canvas = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
    img.thumbnail((1100, 1100), Image.LANCZOS)
    x = (1200 - img.width) // 2
    y = (1200 - img.height) // 2
    canvas.paste(img, (x, y))
    buf = io.BytesIO()
    canvas.save(buf, format="PNG", optimize=True)
    out_path.write_bytes(buf.getvalue())
    kb = len(buf.getvalue()) // 1024
    print(f"  ✅ Saved 1200×1200: {out_path.name} ({kb} KB)")
    return out_path

def upload_staged(local_path):
    """Upload via Shopify staged uploads (no base64 limit)."""
    filename = local_path.name
    size = local_path.stat().st_size

    # Step 1: get signed upload URL
    resp = gql(STORE, TOKEN, STAGED_UPLOAD_Q, {"input": [{
        "filename": filename,
        "mimeType": "image/png",
        "httpMethod": "POST",
        "resource": "FILE",
        "fileSize": str(size),
    }]})
    targets = resp.get("data", {}).get("stagedUploadsCreate", {}).get("stagedTargets", [])
    errors  = resp.get("data", {}).get("stagedUploadsCreate", {}).get("userErrors", [])
    if errors or not targets:
        print(f"  ✗ Staged upload error: {errors or resp}")
        return None
    target = targets[0]
    upload_url  = target["url"]
    resource_url = target["resourceUrl"]
    params = {p["name"]: p["value"] for p in target["parameters"]}

    # Step 2: POST file to signed S3/GCS URL
    with open(local_path, "rb") as f:
        files = {"file": (filename, f, "image/png")}
        r2 = requests.post(upload_url, data=params, files=files, timeout=120)
    if r2.status_code not in (200, 201, 204):
        print(f"  ✗ S3 upload failed ({r2.status_code}): {r2.text[:200]}")
        return None

    # Step 3: register file in Shopify Files
    resp2 = gql(STORE, TOKEN, FILE_CREATE_Q, {"files": [{
        "alt": filename,
        "contentType": "IMAGE",
        "originalSource": resource_url,
    }]})
    files_resp = resp2.get("data", {}).get("fileCreate", {}).get("files", [])
    errors2    = resp2.get("data", {}).get("fileCreate", {}).get("userErrors", [])

    # Shopify may return empty url right away — file is processing async
    if errors2:
        print(f"  ✗ fileCreate error: {errors2}")
        return None
    if files_resp:
        f0 = files_resp[0]
        if f0 and isinstance(f0, dict) and f0.get("image", {}) and f0["image"].get("url"):
            url = f0["image"]["url"]
            print(f"  ☁️  Uploaded: {url[:80]}...")
            return url
    # File accepted but URL not ready yet (async processing) — return resource_url
    print(f"  ⏳ File queued in Shopify (async), using resourceUrl")
    return resource_url

def main():
    mapping = []
    total = len(IMAGES)
    for i, filename in enumerate(IMAGES, 1):
        print(f"\n[{i}/{total}] {filename}")
        raw = download(filename)
        if raw is None:
            continue
        out_path = process_rembg(raw, filename)
        if out_path is None:
            continue
        url = upload_staged(out_path)
        if url:
            mapping.append({"original": filename, "nobg": out_path.name, "url": url})

    MAP_FILE.write_text(json.dumps(mapping, indent=2, ensure_ascii=False))
    print(f"\n✅ Done! {len(mapping)}/{total} images processed.")
    print(f"📄 Mapping → {MAP_FILE}")
    for m in mapping:
        print(f"  {m['original']:55s} → {m['url'][:60]}...")

if __name__ == "__main__":
    main()
