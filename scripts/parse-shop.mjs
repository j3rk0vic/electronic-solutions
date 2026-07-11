/**
 * Parses src/assets/text_for_shop_products/*.txt into the structured product
 * list the shop reads (src/content/shop/products.json). Run after editing the
 * source txt:  node scripts/parse-shop.mjs
 *
 * The txt is authored by hand, so this also reconciles it against the actual
 * image files and reports any mismatch instead of guessing.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const TXT = 'src/assets/text_for_shop_products/proizvodi_electronic_solution.txt';
const IMG_DIR = 'src/assets/shop_products';
const OUT = 'src/content/shop/products.json';

// The txt filename does not always match the actual image file byte-for-byte.
const IMAGE_REMAP = { 'prijenosni_interter.png': 'prijernosni_inverter.png' };
// Nice display names for images that have no txt entry (no diacritics in files).
const NAME_FOR_UNTEXTED = { 'prikljucak_za_teleskopsku_pilu.png': 'Priključak za teleskopsku pilu' };

// Filter categories on /trgovina. Product id (filename without .png) → kategorija.
// Owner can recategorize here and re-run. Unknown ids fall back to "Ostalo".
const CATEGORY = {
  kosilica: 'Kosilice',
  robotska_kosilica: 'Kosilice',
  komplet_za_malciranje: 'Kosilice',
  noz_za_malciranje: 'Kosilice',
  trimer_33_cm: 'Trimeri',
  trimer_35_cm: 'Trimeri',
  trimer_38_cm: 'Trimeri',
  trimer_40_cm: 'Trimeri',
  nit_za_trimer: 'Trimeri',
  prikljucak_za_trimer: 'Trimeri',
  ostrica: 'Trimeri',
  rotocut_glava_za_rezanje: 'Trimeri',
  zamjenske_ostrice_rotocut: 'Trimeri',
  pila: 'Pile',
  zamjenski_lanac_za_motornu_pilu: 'Pile',
  prikljucak_za_teleskopsku_pilu: 'Pile',
  puhac_lisca: 'Puhači i usisavači',
  puhac_usisavac: 'Puhači i usisavači',
  suho_mokro_usisivac: 'Puhači i usisavači',
  skare_za_zivicu: 'Škare za živicu',
  baterija: 'Baterije i energija',
  punjac_za_baterije: 'Baterije i energija',
  prijernosni_inverter: 'Baterije i energija',
  prijenosni_reflektor: 'Baterije i energija',
  prikljucak_za_teleskopski_komplet: 'Pribor',
};

const files = new Set(readdirSync(IMG_DIR).filter((f) => f.toLowerCase().endsWith('.png')));
const blocks = readFileSync(TXT, 'utf8')
  .split(/\n-{5,}\n?/)
  .map((b) => b.trim())
  .filter(Boolean);

const used = new Set();
const products = [];
const warnings = [];
let order = 0;

for (const block of blocks) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  let image = '', name = '', price = '', description = '';
  const variants = [];
  let inVariants = false;

  for (const line of lines) {
    if (line.startsWith('naziv slike:')) image = line.slice(12).trim();
    else if (line.startsWith('puni naziv za web:')) name = line.slice(18).trim();
    else if (line.startsWith('cijena:')) { price = line.slice(7).trim(); inVariants = true; }
    else if (line.startsWith('opis:')) { description = line.slice(5).trim(); inVariants = false; }
    else if (inVariants) {
      let label, vprice;
      if (line.includes('->')) {
        const i = line.indexOf('->');
        label = line.slice(0, i).trim();
        vprice = line.slice(i + 2).trim();
      } else {
        const m = line.match(/^(.*?)-\s*(€[\d.,]+)\s*$/);
        if (m) { label = m[1].trim(); vprice = m[2].trim(); }
      }
      if (label && vprice) variants.push({ label, price: vprice });
    }
  }

  if (IMAGE_REMAP[image]) image = IMAGE_REMAP[image];
  if (!files.has(image)) warnings.push(`⚠ image not found for "${name}": ${image}`);
  else used.add(image);

  const id = image.replace(/\.png$/i, '');
  products.push({ id, order: order++, name, image, category: CATEGORY[id] ?? 'Ostalo', price, description, variants });
}

// Images the owner gave us but the txt does not describe yet.
for (const f of [...files].sort()) {
  if (used.has(f)) continue;
  const uid = f.replace(/\.png$/i, '');
  products.push({
    id: uid,
    order: order++,
    name: NAME_FOR_UNTEXTED[f] ?? uid.replace(/_/g, ' '),
    image: f,
    category: CATEGORY[uid] ?? 'Ostalo',
    price: 'Cijena na upit',
    description: '',
    variants: [],
    needsInfo: true,
  });
  warnings.push(`⚠ image without txt entry (added with "Cijena na upit"): ${f}`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(products, null, 2) + '\n', 'utf8');

console.log(`wrote ${products.length} products → ${OUT}`);
console.log(`  ${products.filter((p) => p.variants.length).length} with variant pricing`);
if (warnings.length) console.log('\n' + warnings.join('\n'));
