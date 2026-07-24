// Convert all PNG in /Users/mac/airplane/public/images/ to WebP.
// Keeps the same filename but with .webp extension. Deletes the PNG.
// Resizes to max 1600px width (keeps aspect ratio). Quality 82.
//
// After running, update all references in /components and /lib from .png to .webp.

import { readdirSync, statSync, unlinkSync } from "fs";
import { join, extname, basename } from "path";
import sharp from "sharp";

const DIR = "/Users/mac/airplane/public/images";
const MAX_WIDTH = 1600;
const QUALITY = 82;

const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"));
console.log(`Found ${files.length} PNG files in ${DIR}`);

let totalBefore = 0;
let totalAfter = 0;
let errors = 0;
let converted = 0;

for (const file of files) {
  const src = join(DIR, file);
  const dst = join(DIR, basename(file, ".png") + ".webp");
  const srcSize = statSync(src).size;
  totalBefore += srcSize;

  try {
    const img = sharp(src);
    const meta = await img.metadata();
    const width = meta.width || 0;

    let pipeline = img;
    if (width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }
    await pipeline
      .webp({ quality: QUALITY, effort: 6, alphaQuality: 90 })
      .toFile(dst);

    const dstSize = statSync(dst).size;
    totalAfter += dstSize;
    const pct = Math.round((1 - dstSize / srcSize) * 100);
    console.log(`  ✓ ${file} : ${(srcSize/1024).toFixed(0)}KB → ${(dstSize/1024).toFixed(0)}KB (-${pct}%)`);
    unlinkSync(src);
    converted++;
  } catch (err) {
    console.error(`  ✗ ${file} : ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. ${converted} converted, ${errors} errors.`);
console.log(`Total : ${(totalBefore/1024/1024).toFixed(1)} MB → ${(totalAfter/1024/1024).toFixed(1)} MB (saved ${((totalBefore-totalAfter)/1024/1024).toFixed(1)} MB)`);
