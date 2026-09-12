/**
 * Prepares a site photo for the Radovi gallery: rotates per EXIF, caps the long
 * side at 2000 px (what the existing photos are — the build derives everything
 * smaller from that), re-encodes as JPEG without metadata and drops it into
 * src/assets/work under a clean slug.
 *
 *   node scripts/prep-work-photo.mjs "postavljanje/PHOTO-2026-08-19 (2).jpg" podno-grijanje-kupaonica
 *
 * Prints the final filename + dimensions + orientation (portrait → span: std,
 * landscape → span: wide) so the caller can fill the frontmatter.
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'src/assets/work';
const MAX = 2000;

const [src, slugArg] = process.argv.slice(2);
if (!src || !slugArg) {
  console.error('Upotreba: node scripts/prep-work-photo.mjs <izvorna-fotka> <slug>');
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`Nema datoteke: ${src}`);
  process.exit(1);
}

// Fold Croatian diacritics and anything else non-ASCII into a URL-safe slug.
const slug = slugArg
  .toLowerCase()
  .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
if (!slug) {
  console.error(`Slug "${slugArg}" ne sadrži ništa upotrebljivo.`);
  process.exit(1);
}

const out = join(OUT_DIR, `${slug}.jpg`);
if (existsSync(out)) {
  console.error(`Već postoji: ${out} — odaberi drugi slug.`);
  process.exit(1);
}

const info = await sharp(src)
  .rotate() // bake EXIF orientation in; metadata is stripped below
  .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(out);

const orientation = info.width > info.height ? 'landscape' : 'portrait';
console.log(`${out}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB  ${orientation}`);
console.log(`image: "${slug}.jpg"`);
console.log(`span: "${orientation === 'landscape' ? 'wide' : 'std'}"`);
