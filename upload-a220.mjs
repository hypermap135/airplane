#!/usr/bin/env node
/**
 * Upload A220 Air France photos to Shopify CDN
 * Usage: SHOPIFY_ADMIN_TOKEN=shpat_xxx node upload-a220.mjs
 *
 * Flow: stagedUploadsCreate → S3 multipart upload → fileCreate → print CDN URLs
 */

import { readFileSync, existsSync } from "fs";
import { basename } from "path";

const STORE    = "y823wg-nz.myshopify.com";
const TOKEN    = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VER  = "2024-07";
const GQL      = `https://${STORE}/admin/api/${API_VER}/graphql.json`;

// Photos to upload: WhatsApp Image 2026-04-23 at 18.23.27 (7-13).jpeg
// Mapped to clean Shopify filenames
const FILES = [
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (7).jpeg",  name: "a220-airfrance-1.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (8).jpeg",  name: "a220-airfrance-2.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (9).jpeg",  name: "a220-airfrance-3.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (10).jpeg", name: "a220-airfrance-4.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (11).jpeg", name: "a220-airfrance-5.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (12).jpeg", name: "a220-airfrance-6.jpg" },
  { local: "/Users/mac/Downloads/WhatsApp Image 2026-04-23 at 18.23.27 (13).jpeg", name: "a220-airfrance-lifestyle.jpg" },
];

async function gql(query, variables = {}) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function createStagedUploads(files) {
  const input = files.map(f => ({
    filename: f.name,
    mimeType: "image/jpeg",
    resource: "FILE",
    httpMethod: "POST",
  }));

  const data = await gql(`
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
  `, { input });

  const { stagedTargets, userErrors } = data.stagedUploadsCreate;
  if (userErrors.length) throw new Error(`stagedUploadsCreate errors: ${JSON.stringify(userErrors)}`);
  return stagedTargets;
}

async function uploadToS3(stagedTarget, file) {
  const { url, parameters } = stagedTarget;
  const fileBytes = readFileSync(file.local);

  const form = new FormData();
  // Must add parameters BEFORE the file
  for (const { name, value } of parameters) {
    form.append(name, value);
  }
  form.append("file", new Blob([fileBytes], { type: "image/jpeg" }), file.name);

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed for ${file.name}: HTTP ${res.status}\n${text}`);
  }
  console.log(`  ✓ Uploaded to S3: ${file.name}`);
}

async function createFiles(stagedTargets) {
  const input = stagedTargets.map(t => ({
    originalSource: t.resourceUrl,
    contentType: "IMAGE",
  }));

  const data = await gql(`
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
            image { url }
          }
          ... on GenericFile {
            id
            url
          }
        }
        userErrors { field message }
      }
    }
  `, { files: input });

  const { files, userErrors } = data.fileCreate;
  if (userErrors.length) throw new Error(`fileCreate errors: ${JSON.stringify(userErrors)}`);
  return files;
}

async function main() {
  if (!TOKEN) {
    console.error("❌  Set SHOPIFY_ADMIN_TOKEN=shpat_xxx before running this script.");
    console.error("    Shopify admin → Paramètres → Apps → Développer des apps → Créer une app");
    console.error("    → Configurer les portées Admin API (write_files, read_files) → Installer → Copier le token");
    process.exit(1);
  }

  // Verify files exist
  for (const f of FILES) {
    if (!existsSync(f.local)) {
      console.error(`❌  File not found: ${f.local}`);
      process.exit(1);
    }
  }

  console.log(`\n🛫  Uploading ${FILES.length} A220 Air France photos to Shopify...\n`);

  // Step 1: Get staged upload URLs
  console.log("1/3  Creating staged upload targets...");
  const stagedTargets = await createStagedUploads(FILES);
  console.log(`     Got ${stagedTargets.length} upload targets\n`);

  // Step 2: Upload each file to S3
  console.log("2/3  Uploading files to Shopify CDN...");
  for (let i = 0; i < FILES.length; i++) {
    await uploadToS3(stagedTargets[i], FILES[i]);
  }
  console.log();

  // Step 3: Register files in Shopify
  console.log("3/3  Registering files in Shopify...");
  const createdFiles = await createFiles(stagedTargets);
  console.log();

  // Print results
  console.log("✅  Upload complete! CDN URLs:\n");
  const cdnUrls = [];
  for (let i = 0; i < FILES.length; i++) {
    const file = createdFiles[i];
    const url = file?.image?.url || file?.url || stagedTargets[i].resourceUrl;
    console.log(`  ${FILES[i].name}:`);
    console.log(`    ${url}\n`);
    cdnUrls.push({ name: FILES[i].name, url });
  }

  // Print products.ts image snippet
  console.log("\n📋  Copy this into lib/products.ts for the A220 product:\n");
  console.log(`  image: "${cdnUrls[0].url}",`);
  console.log(`  images: [`);
  for (const { url } of cdnUrls) {
    console.log(`    "${url}",`);
  }
  console.log(`  ],`);
}

main().catch(err => {
  console.error("\n❌  Error:", err.message);
  process.exit(1);
});
