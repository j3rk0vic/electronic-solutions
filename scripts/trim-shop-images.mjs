/**
 * Crops the empty margin off every packshot in src/assets/shop_products (the
 * webshop) and the cut-out ones in src/assets/products (the home-page izlog).
 *
 * Supplier images arrive on canvases with the product sitting in the middle
 * third — the rest is white or transparent air. Padded again by the card's own
 * inset, a 40 cm trimmer rendered as a sliver. Trimming here, once, at the
 * source means every product fills its tile the same way, and the site's
 * responsive derivatives are cut from real pixels instead of margin.
 *
 * Safe to re-run: an already-trimmed file changes by at most a pixel. Run after
 * adding new packshots:  node scripts/trim-shop-images.mjs
 */
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['src/assets/shop_products', 'src/assets/products'];
/** Photographs and shots on a coloured ground — nothing to trim, leave as is. */
const SKIP = new Set(['ugradnja-servis.webp']);
/** Breathing room kept around the product, as a fraction of the longer side. */
const MARGIN = 0.03;

const jobs = DIRS.flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => /\.(png|webp|jpe?g|avif)$/i.test(f) && !SKIP.has(f))
    .map((f) => ({ dir, file: f }))
);

for (const { dir, file } of jobs) {
  const path = join(dir, file);
  // Read once into memory: Windows refuses the rename while sharp still holds
  // the source open, so work on a buffer and write the result straight back.
  const src = readFileSync(path);
  const before = await sharp(src).metadata();
  // Flatten onto white first so white-canvas and transparent-canvas images trim
  // the same way; the threshold absorbs JPEG-ish noise around the edges.
  const trimmed = await sharp(src).flatten({ background: '#fff' }).trim({ threshold: 12 }).toBuffer();
  const t = await sharp(trimmed).metadata();
  const pad = Math.round(Math.max(t.width, t.height) * MARGIN);
  // Keep each file's own format so nothing else (frontmatter, products.json)
  // has to change; lossy formats get a quality high enough not to add ringing.
  const out = sharp(trimmed).extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#fff' });
  const ext = file.split('.').pop().toLowerCase();
  const encoded =
    ext === 'png' ? out.png({ compressionLevel: 9 })
    : ext === 'webp' ? out.webp({ quality: 90 })
    : ext === 'avif' ? out.avif({ quality: 70 })
    : out.jpeg({ quality: 90, mozjpeg: true });
  const result = await encoded.toBuffer();
  writeFileSync(path, result);
  const after = await sharp(result).metadata();
  console.log(`${join(dir, file).padEnd(58)} ${before.width}×${before.height} → ${after.width}×${after.height}`);
}
