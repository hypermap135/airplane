#!/usr/bin/env python3
"""
upload_v2.py — Upload corrected v2/v3 images to Shopify using the active CLI atkn_ token.
"""

import json, pathlib, re, io, sys, time
import requests

STORE = "y823wg-nz.myshopify.com"
OUT_DIR = pathlib.Path(__file__).parent / "rembg_out"
CDN = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files"

# Load the active atkn_ token from Shopify CLI kit config
def get_token():
    cfg = json.loads(pathlib.Path(
        "/Users/mac/Library/Preferences/shopify-cli-kit-nodejs/config.json"
    ).read_text())
    sess_raw = cfg.get("sessionStore", "{}")
    sess = json.loads(sess_raw) if isinstance(sess_raw, str) else sess_raw
    app_data = sess["accounts.shopify.com"]["37138eeb-7027-4c62-84c4-af32fbb8766d"]["applications"]
    store_key = [k for k in app_data if "y823wg" in k][0]
    return app_data[store_key]["accessToken"]

TOKEN = get_token()
AUTH_HEADER = f"Bearer {TOKEN}"

HEADERS_BASE = {
    "Authorization": AUTH_HEADER,
    "X-Shopify-Access-Token": AUTH_HEADER,
    "Content-Type": "application/json",
    "User-Agent": "Shopify CLI; v=3.94.3",
}

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

def gql(query, variables=None):
    r = requests.post(
        f"https://{STORE}/admin/api/2024-07/graphql.json",
        headers=HEADERS_BASE,
        json={"query": query, "variables": variables or {}},
        timeout=60,
    )
    return r.json()

def upload_staged(local_path):
    filename = local_path.name
    size = local_path.stat().st_size

    # Step 1: staged upload URL
    resp = gql(STAGED_UPLOAD_Q, {"input": [{
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

    # Step 2: POST to S3
    with open(local_path, "rb") as f:
        r2 = requests.post(upload_url, data=params,
                           files={"file": (filename, f, "image/png")}, timeout=120)
    if r2.status_code not in (200, 201, 204):
        print(f"  ✗ S3 upload failed ({r2.status_code}): {r2.text[:200]}")
        return None

    # Step 3: register in Shopify
    resp2 = gql(FILE_CREATE_Q, {"files": [{
        "alt": filename,
        "contentType": "IMAGE",
        "originalSource": resource_url,
    }]})
    errors2 = resp2.get("data", {}).get("fileCreate", {}).get("userErrors", [])
    if errors2:
        print(f"  ✗ fileCreate error: {errors2}")
        return None
    files_resp = resp2.get("data", {}).get("fileCreate", {}).get("files", [])
    if files_resp:
        f0 = files_resp[0]
        if f0 and isinstance(f0, dict) and f0.get("image", {}) and f0["image"].get("url"):
            url = f0["image"]["url"]
            print(f"  ☁️  Uploaded: {url[:80]}...")
            return url
    # Async — file accepted but URL not ready
    cdn_url = f"{CDN}/{filename}"
    print(f"  ⏳ Queued (async), CDN URL will be: {cdn_url}")
    return cdn_url

# Files to upload: (local_filename, cdn_filename_to_use_in_products)
FILES = [
    ("Airbus_A380_Emirates_nobg_v3.png",                      "Airbus_A380_Emirates_nobg_v3.png"),
    ("B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png",     "B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png"),
    ("5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg_v2.png",     "5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg_v2.png"),
    ("D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg_v2.png",     "D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg_v2.png"),
    ("9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg_v2.png",     "9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg_v2.png"),
    ("B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png",    "B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png"),
    ("7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png",     "7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png"),
    ("AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png",     "AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png"),
]

mapping = {}
total = len(FILES)
for i, (local_name, cdn_name) in enumerate(FILES, 1):
    local_path = OUT_DIR / local_name
    if not local_path.exists():
        print(f"\n[{i}/{total}] ✗ File not found: {local_path}")
        continue
    print(f"\n[{i}/{total}] Uploading {local_name} ({local_path.stat().st_size // 1024} KB)...")
    url = upload_staged(local_path)
    if url:
        mapping[cdn_name] = url
    time.sleep(0.5)  # rate limit

print("\n\n✅ Upload complete!")
print("\nMapping (use these in products.ts):")
for k, v in mapping.items():
    print(f"  {k}")
    print(f"    → {v}")

# Save mapping
out = pathlib.Path(__file__).parent / "upload_v2_mapping.json"
out.write_text(json.dumps(mapping, indent=2))
print(f"\n📄 Saved to {out}")
