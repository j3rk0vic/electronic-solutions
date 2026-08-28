---
name: add-product
description: Scaffold a new home-page product ("izlog") card for the Electronic Solution site — creates a correctly-named src/content/products/*.md with valid frontmatter and places its image. Use when the user wants to add a product to the vrt (Vrt/EGO) or dom (Dom — klima, grijanje, TV) world, or says "add a product", "novi proizvod", "dodaj proizvod".
---

# Add Product

Scaffolds a home-page product card in the `products` content collection. These are
the cards shown in the izlog on the home page — NOT the webshop (`/trgovina`), which
is generated from `src/content/shop/products.json` by `scripts/parse-shop.mjs`.

## Schema (from `src/content.config.ts`)

| Field   | Required | Notes |
|---------|----------|-------|
| `world` | ✅       | Either `vrt` (garden/EGO) or `dom` (everything else: klima, grijanje, solar, TV) |
| `order` | ✅       | Position within its world. Use the next free integer for that world. |
| `title` | ✅       | Croatian, quoted. e.g. `"Kosilice"` |
| `blurb` | ✅       | Croatian one-liner, quoted. |
| `brand` | optional | e.g. `"EGO Power+"` |
| `image` | optional | Filename only. Omit for a graceful themed placeholder card. |
| `badge` | optional | Short tag, e.g. `"56V"`, `"OLED / QLED"`. |

## Steps

1. **Collect inputs.** You need at minimum `world`, `title`, and `blurb`. Ask for any
   that are missing. `brand`, `badge`, and an image are optional — confirm whether the
   user has an image file or wants a placeholder card. Keep all copy in **Croatian** to
   match the rest of the site.

2. **Determine `order`.** List existing files for that world:
   `src/content/products/<world>-*.md`. Take the highest existing `order` and add 1
   (this becomes both the `order` field and the `NN` in the filename). Confirm you are
   not inserting between existing items — if the user wants a specific position, they
   must renumber the others.

3. **Build the filename.** `src/content/products/<world>-<NN>-<slug>.md` where:
   - `<NN>` is the order zero-padded to 2 digits (`01`, `02`, …).
   - `<slug>` is a short lowercase ASCII slug of the product (Croatian diacritics
     folded: č/ć→c, š→s, ž→z, đ→d), e.g. `Škare za živicu` → `skare`.
   - Verify the file does not already exist before writing.

4. **Place the image** (if provided). Copy/save it to `src/assets/products/`.

   Then set `image:` to the **filename only** (e.g. `"kosilica.webp"`). `resolveImage`
   in `src/lib/images.ts` globs that folder, so the file must physically exist
   there or the card renders the placeholder. Prefer `.webp`/`.avif` for size.

5. **Write the `.md`** with frontmatter only (product cards have no body). Order the
   keys: `world`, `order`, `title`, `brand?`, `blurb`, `image?`, `badge?`.

6. **Validate.** Run `npm run build` (or `npx astro sync`) — the Zod schema in
   `src/content.config.ts` will reject bad frontmatter. Report success or the exact
   schema error. Optionally suggest `npm run dev` to eyeball the new card.

## Templates

With image:

```markdown
---
world: vrt
order: 7
title: "Motorne pile"
brand: "EGO Power+"
blurb: "Akumulatorske pile za rezanje drva bez ispušnih plinova i buke."
image: "pila.webp"
badge: "56V"
---
```

Placeholder card (no image — like Solar/Servis):

```markdown
---
world: dom
order: 6
title: "Dizalice topline"
blurb: "Učinkovito grijanje i hlađenje uz niske pogonske troškove."
badge: "A+++"
---
```

## Notes

- `src/content/shop/products.json` is a **different** thing (the webshop) and is
  generated — never hand-edit it here. A product can exist in the izlog, the webshop,
  or both.
- If the user is really adding a webshop item, point them at the source txt in
  `src/assets/text_for_shop_products/` + `node scripts/parse-shop.mjs` instead.
