/**
 * remove-bg.mjs
 *
 * Removes backgrounds from all product images using remove.bg API,
 * then uploads transparent PNGs to Shopify CDN.
 *
 * Usage:
 *   REMOVE_BG_API_KEY=your_key node scripts/remove-bg.mjs
 *
 * Get your free API key at: https://www.remove.bg/api (50 free/month)
 */

import fs from "fs";
import path from "path";
import https from "https";
import { FormData } from "undici";

const CDN_BASE = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files";
const REMOVE_BG_KEY = process.env.REMOVE_BG_API_KEY;

// Shopify credentials
const SHOPIFY_STORE = "y823wg-nz.myshopify.com";
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN || "";

// All unique product images
const IMAGES = [
  "B4394411-C0CC-4A86-AE83-F10D4A500029.jpg",
  "CD86650C-845D-487B-9A81-2CA67C80A28A.png",
  "031DDDDC-70E9-43CC-B424-BB7BBC77F75B.png",
  "0DD70AD8-A997-4B31-8A95-0DBBA2C32358.png",
  "1C22E355-7DE6-46E2-A665-53491B42E69B.png",
  "4BC16D16-D848-4680-A696-696A31D55734.png",
  "5EF8FED8-8EAF-4191-934E-A558A9A1D6EF.png",
  "7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454.png",
  "7FA23F23-9A53-4EB8-A584-36B12C7C84BB.png",
  "9A131FF0-EAB2-4176-9236-7B2761E44FB5.png",
  "AD184BA4-005E-4FB9-B9FC-0A8B97709210.jpg",
  "Airbus_A350_Air_France.jpg",
  "Airbus_A380_AIR_FRANCE.jpg",
  "Airbus_A380_Emirates.png",
  "Airbus_A380_Singapore_Airlines.png",
  "B17227E2-BB4C-4D08-A770-B39827FB907C.png",
  "B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F.png",
  "D056EBB6-7CF5-4F52-9B3E-DD90854A7885.png",
  "D1FC9309-F3A3-46FE-9F1F-7612F7CBAC54.png",
  "DF8AE5B5-7A2D-4A02-B2BD-118AAF5D58AD.jpg",
  "IMG-7011.png",
  "IMG-7037.jpg",
  "IMG-7237.png",
  "WhatsApp_Image_2026-04-23_at_18.23.27_7.jpg",
];

const OUT_DIR = path.resolve("scripts/processed-images");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function removeBg(imageUrl, filename) {
  const outFilename = filename.replace(/\.(jpg|jpeg|png)$/i, "_nobg.png");
  const outPath = path.join(OUT_DIR, outFilename);

  if (fs.existsSync(outPath)) {
    console.log(`  ✓ Already processed: ${outFilename}`);
    return outPath;
  }

  console.log(`  ⏳ Processing: ${filename}`);

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVE_BG_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: `${CDN_BASE}/${filename}`,
      size: "auto",
      format: "png",
      crop: true,           // Auto-crop to subject bounds
      crop_margin: "10%",   // Add 10% breathing room around the plane
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ remove.bg error for ${filename}: ${res.status} ${err}`);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✅ Saved: ${outFilename} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return outPath;
}

async function uploadToShopify(localPath, filename) {
  // Shopify Files API upload
  const nobgFilename = path.basename(localPath);
  const fileBuffer = fs.readFileSync(localPath);
  const base64 = fileBuffer.toString("base64");

  const query = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
            image { url }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const res = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: {
        files: [{
          alt: nobgFilename,
          contentType: "IMAGE",
          originalSource: `data:image/png;base64,${base64}`,
        }],
      },
    }),
  });

  const data = await res.json();
  const file = data?.data?.fileCreate?.files?.[0];
  if (file?.image?.url) {
    console.log(`  ☁️  Uploaded: ${file.image.url}`);
    return { original: filename, nobg: nobgFilename, url: file.image.url };
  }

  const errors = data?.data?.fileCreate?.userErrors;
  console.error(`  ✗ Shopify upload error:`, errors || data);
  return null;
}

async function main() {
  if (!REMOVE_BG_KEY) {
    console.error(`
❌ Missing REMOVE_BG_API_KEY environment variable.

Get your free API key at: https://www.remove.bg/api
Then run:
  REMOVE_BG_API_KEY=your_key SHOPIFY_TOKEN=your_token node scripts/remove-bg.mjs
`);
    process.exit(1);
  }

  // Check API credits
  const creditsRes = await fetch("https://api.remove.bg/v1.0/account", {
    headers: { "X-Api-Key": REMOVE_BG_KEY },
  });
  const credits = await creditsRes.json();
  console.log(`\n🔑 remove.bg account: ${credits?.data?.attributes?.credits?.total ?? "?"} credits available`);
  console.log(`📦 Processing ${IMAGES.length} images...\n`);

  const results = [];

  for (const img of IMAGES) {
    const localPath = await removeBg(`${CDN_BASE}/${img}`, img);
    if (localPath && SHOPIFY_TOKEN) {
      const result = await uploadToShopify(localPath, img);
      if (result) results.push(result);
    }
  }

  // Output mapping file
  const mappingPath = path.resolve("scripts/image-mapping.json");
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Done! Mapping saved to: ${mappingPath}`);
  console.log(`\nNext step: update lib/products.ts with the new URLs from ${mappingPath}`);
}

main().catch(console.error);
