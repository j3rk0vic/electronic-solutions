/**
 * Derives a green twin of red_logo.png so the nav can cross-fade the two
 * lockups with zero geometry shift. Run once; output is committed.
 *
 * The source is effectively two colors (white text/bracket + red "E") with
 * straight alpha, so every pixel can be decomposed as a mix of WHITE and RED.
 * We recover that mix factor and re-mix against the green accent, which keeps
 * the anti-aliased edges clean instead of hard-thresholding them.
 */
import sharp from 'sharp';

const WHITE = [254, 254, 254];
const RED = [237, 50, 55];
const GREEN = [108, 226, 76]; // --accent in the vrt (green) world

const SRC = 'src/assets/logo/red_logo.png';
const OUT = 'src/assets/logo/green_logo_lockup.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

let recolored = 0;
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  if (r - g < 8) continue; // white / neutral pixel: leave it alone

  // k = how much of this pixel is RED (1 = pure red, 0 = pure white)
  const k = Math.min(1, Math.max(0, (WHITE[1] - g) / (WHITE[1] - RED[1])));
  for (let c = 0; c < 3; c++) data[i + c] = Math.round(k * GREEN[c] + (1 - k) * WHITE[c]);
  recolored++;
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`${OUT}: ${info.width}x${info.height}, recolored ${recolored} px`);
