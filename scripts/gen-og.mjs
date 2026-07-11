/**
 * Generates the social share image (public/og.png, 1200×630) shown when a page
 * link is posted to WhatsApp / Facebook / Google. Brand gradient (green world →
 * red world) + the logo lockup + tagline. Run: node scripts/gen-og.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const W = 1200;
const H = 630;
const OUT = 'public/og.png';

// Logo lockup (white wordmark + red "E") composited on top of the SVG art.
const LOGO = 'src/assets/logo/red_logo.png';
const logoW = 500;
const logoMeta = await sharp(LOGO).metadata();
const logoH = Math.round((logoMeta.height / logoMeta.width) * logoW);
const logoBuf = await sharp(LOGO).resize(logoW).png().toBuffer();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1710"/>
      <stop offset="0.55" stop-color="#0c130f"/>
      <stop offset="1" stop-color="#1a0a08"/>
    </linearGradient>
    <radialGradient id="g1" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#6ce24c" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#6ce24c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#e24a2c" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#e24a2c" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="150" cy="120" r="360" fill="url(#g1)"/>
  <circle cx="1080" cy="560" r="380" fill="url(#g2)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="2"/>

  <!-- tagline + region (logo is composited separately, above this text block) -->
  <text x="600" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#eef5ec">
    Prodaja i servis — vrt i dom
  </text>
  <text x="600" y="468" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" fill="#96b296" letter-spacing="1">
    Metković · od Zadra do Dubrovnika
  </text>

  <g font-family="Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="2" fill="#6ce24c" opacity="0.9">
    <text x="600" y="556" text-anchor="middle">EGO POWER+ · VIESSMANN · FUJITSU · SAMSUNG · LG</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: logoBuf, top: Math.round(H * 0.26 - logoH / 2), left: Math.round((W - logoW) / 2) }])
  .png()
  .toFile(OUT);

console.log(`wrote ${OUT} (${W}×${H}), logo ${logoW}×${logoH}`);
