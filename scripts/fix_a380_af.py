#!/usr/bin/env python3
"""
fix_a380_af.py — Process A380 Air France: remove background + logo, upload to Shopify.
"""
import io, json, pathlib, time
import numpy as np
import requests
from PIL import Image
from rembg import remove, new_session

CDN = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files"
OUT_DIR = pathlib.Path(__file__).parent / "rembg_out"
STORE = "y823wg-nz.myshopify.com"

# ── Auth ──────────────────────────────────────────────────────────────────────
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
AUTH = f"Bearer {TOKEN}"
HEADERS = {
    "Authorization": AUTH,
    "X-Shopify-Access-Token": AUTH,
    "Content-Type": "application/json",
    "User-Agent": "Shopify CLI; v=3.94.3",
}

STAGED_Q = """
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url resourceUrl parameters { name value } }
    userErrors { field message }
  }
}
"""
FILE_Q = """
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
        headers=HEADERS, json={"query": query, "variables": variables or {}}, timeout=60,
    )
    return r.json()

def upload_to_shopify(local_path):
    filename = local_path.name
    size = local_path.stat().st_size
    resp = gql(STAGED_Q, {"input": [{
        "filename": filename, "mimeType": "image/png",
        "httpMethod": "POST", "resource": "FILE", "fileSize": str(size),
    }]})
    targets = resp.get("data", {}).get("stagedUploadsCreate", {}).get("stagedTargets", [])
    errors  = resp.get("data", {}).get("stagedUploadsCreate", {}).get("userErrors", [])
    if errors or not targets:
        print(f"  ✗ Staged error: {errors or resp}"); return None
    target = targets[0]
    params = {p["name"]: p["value"] for p in target["parameters"]}
    with open(local_path, "rb") as f:
        r2 = requests.post(target["url"], data=params,
                           files={"file": (filename, f, "image/png")}, timeout=120)
    if r2.status_code not in (200, 201, 204):
        print(f"  ✗ S3 failed ({r2.status_code}): {r2.text[:200]}"); return None
    resp2 = gql(FILE_Q, {"files": [{"alt": filename, "contentType": "IMAGE",
                                     "originalSource": target["resourceUrl"]}]})
    errors2 = resp2.get("data", {}).get("fileCreate", {}).get("userErrors", [])
    if errors2:
        print(f"  ✗ fileCreate: {errors2}"); return None
    cdn_url = f"{CDN}/{filename}"
    print(f"  ✅ Uploaded → {cdn_url}")
    return cdn_url

# ── Image helpers ─────────────────────────────────────────────────────────────
def erase_region(img, x0, y0, x1, y1):
    arr = np.array(img)
    arr[y0:y1, x0:x1] = [0, 0, 0, 0]
    return Image.fromarray(arr)

def erase_gold(img, thresh=(150, 90, 0, 25)):
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[...,0], arr[...,1], arr[...,2], arr[...,3]
    mask = (r > thresh[0]) & (g > thresh[1]) & (b < thresh[2]+90) & \
           (r > g*0.82) & (g > b*1.3) & (a > thresh[3])
    arr[mask] = [0, 0, 0, 0]
    return Image.fromarray(arr.astype(np.uint8))

def erase_near_white(img, x0, y0, x1, y1, thresh=170):
    arr = np.array(img, dtype=np.uint8)
    reg = arr[y0:y1, x0:x1]
    r, g, b, a = reg[...,0], reg[...,1], reg[...,2], reg[...,3]
    mask = (r > thresh) & (g > thresh) & (b > thresh) & (a > 20)
    reg[mask] = [0, 0, 0, 0]
    arr[y0:y1, x0:x1] = reg
    return Image.fromarray(arr)

def place_on_canvas(img, size=1200, pad=0.06):
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
        px = int((bbox[2]-bbox[0])*pad)
        py = int((bbox[3]-bbox[1])*pad)
        bbox = (max(0,bbox[0]-px), max(0,bbox[1]-py),
                min(w,bbox[2]+px), min(h,bbox[3]+py))
        img = img.crop(bbox)
    canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    img.thumbnail((size-2*int(size*pad), size-2*int(size*pad)), Image.LANCZOS)
    x = (size - img.width)//2
    y = (size - img.height)//2
    canvas.paste(img, (x, y), img)
    return canvas

def save(img, name):
    path = OUT_DIR / name
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    path.write_bytes(buf.getvalue())
    print(f"  💾 Saved: {name} ({len(buf.getvalue())//1024} KB)")
    return path

# ── PROCESS A380 Air France ───────────────────────────────────────────────────
print("\n[1] Downloading Airbus_A380_AIR_FRANCE.jpg from CDN...")
r = requests.get(f"{CDN}/Airbus_A380_AIR_FRANCE.jpg", timeout=30)
print(f"  HTTP {r.status_code} ({len(r.content)//1024} KB)")

print("[2] Running rembg (isnet-general-use)...")
try:
    session = new_session("isnet-general-use")
    result = remove(r.content, session=session)
except Exception as e:
    print(f"  isnet failed ({e}), falling back to u2net...")
    result = remove(r.content)

img = Image.open(io.BytesIO(result)).convert("RGBA")
print(f"  Image size after rembg: {img.size}")

print("[3] Erasing logo region (bottom area, gold pixels, white text)...")
# The AirplaneStore logo tends to appear in bottom-left or top area
# Erase bottom 20% where text logo often appears
w, h = img.size
img = erase_region(img, 0, int(h*0.80), w, h)          # bottom strip
img = erase_region(img, 0, 0, w, int(h*0.10))           # top strip
img = erase_gold(img)
img = erase_near_white(img, 0, 0, w, int(h*0.15))       # white text top
img = erase_near_white(img, 0, int(h*0.75), w, h)       # white text bottom

print("[4] Placing on 1200×1200 canvas...")
canvas = place_on_canvas(img)

out_name = "Airbus_A380_AIR_FRANCE_nobg.png"
path = save(canvas, out_name)

print("[5] Uploading to Shopify CDN...")
url = upload_to_shopify(path)

print(f"\n✅ Done! CDN URL: {url}")
print(f"\nUpdate products.ts:")
print(f'  image: `${{CDN}}/{out_name}`,')
