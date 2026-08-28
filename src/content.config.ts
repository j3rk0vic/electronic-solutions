import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * All editable text + products live here so the owner can maintain the site
 * without touching components. Five collections:
 *   - settings : one singleton (site.md) — company info, nav, brands, SEO
 *   - sections : per-section headline/eyebrow/copy/stats (home page)
 *   - products : one file per product, grouped by "world" (vrt | dom | tv)
 *   - works    : one file per site photo — the "Radovi" gallery on the home page
 *   - pages    : the standalone pages (trgovina, servis, o-nama)
 */

const stat = z.object({
  value: z.string(),
  label: z.string(),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/settings' }),
  schema: z.object({
    company: z.string(),
    tagline: z.string(),
    // Company details — PLACEHOLDERS for the owner to replace (see site.md).
    address: z.string(),
    phone: z.string(),
    phoneHref: z.string(),
    email: z.string(),
    hours: z.string(),
    // Machine-readable twin of `hours` for schema.org (e.g. "Mo-Fr 08:00-16:00").
    // The display string is prose, which Google cannot parse as opening hours.
    hoursSchema: z.string().default(''),
    region: z.string(),
    // Where the contact form POSTs. See the comment block in site.md.
    formEndpoint: z.string().default('[FORM ENDPOINT]'),
    formAccessKey: z.string().default(''),
    // Secondary nav — the standalone pages. Rendered in the header and footer.
    nav: z.array(z.object({ label: z.string(), href: z.string() })),
    brands: z.array(z.string()),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogImageAlt: z.string(),
    }),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sections' }),
  schema: z.object({
    order: z.number(),
    world: z.enum(['neutral', 'vrt', 'dom']).default('neutral'),
    num: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string(),
    lead: z.string().optional(),
    stats: z.array(stat).optional(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    // Two worlds: vrt is the EGO Power+ range, dom is everything else the home
    // needs — klima, grijanje, solar and televisions. The home page morphs
    // green→red across exactly these two.
    world: z.enum(['vrt', 'dom']),
    order: z.number(),
    title: z.string(),
    brand: z.string().optional(),
    blurb: z.string(),
    // Filename inside src/assets/products. Resolved to an optimized
    // <Image /> at render time via import.meta.glob. Optional: cards without an
    // image (e.g. Solar, Servis) render a graceful themed gradient placeholder.
    image: z.string().optional(),
    // true = the image is a photograph, not a cut-out packshot. The tile then
    // fills edge to edge instead of sitting contained on the white ground.
    photo: z.boolean().default(false),
    badge: z.string().optional(),
  }),
});

/**
 * WORKS — the "Radovi" gallery (real jobs, photographed on site). One file per
 * photo; `span` drives the mosaic (wide = full-bleed feature row, std = a 4:5
 * portrait tile). Drop a new JPG in src/assets/work and add a file here.
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    /** Short line under the title in the tile + lightbox. */
    caption: z.string(),
    /** Mono chip on the tile — the kind of job (e.g. "Podno grijanje"). */
    tag: z.string(),
    /** Filename inside src/assets/work. Missing file = tile is skipped. */
    image: z.string(),
    /** wide = 21:9 feature spanning the row; std = 4:5 portrait tile. */
    span: z.enum(['wide', 'std']).default('std'),
    /** Optional place/context line, shown in the lightbox only. */
    location: z.string().optional(),
    /** CSS object-position for the tile crop (e.g. "center 38%"). */
    focus: z.string().default('center'),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lead: z.string(),
    /**
     * Palette for the page. The home page morphs green→red across its two
     * worlds; a standalone page has no second world to morph into, so it
     * simply pins one end of the scale (see :root[data-theme] in global.css).
     */
    theme: z.enum(['morph', 'vrt', 'dom']).default('morph'),
    stats: z.array(stat).default([]),
    // `href` turns a block into a link — how the Usluge hub points at each
    // service page while /servis keeps using the same grid for plain text.
    blocks: z
      .array(z.object({ num: z.string(), title: z.string(), body: z.string(), href: z.string().optional() }))
      .default([]),
    /**
     * Questions people actually type before calling a tradesman. Rendered as an
     * accordion and emitted as schema.org FAQPage, which is what lets Google
     * show the answers directly under the result for a service query.
     */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
});

/**
 * The webshop on /trgovina. Generated from the owner's txt by
 * `node scripts/parse-shop.mjs` → src/content/shop/products.json. Prices are
 * kept as display strings (e.g. "€132.00 – €530.50"); `variants` holds the
 * per-option pricing shown in the product's detail dialog.
 */
const shop = defineCollection({
  loader: file('./src/content/shop/products.json'),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    image: z.string(),
    // Top-level split on /trgovina: vrt is the EGO Power+ range, dom is
    // everything else (klima, grijanje, TV …). Derived from the category by
    // parse-shop.mjs, so a new category only has to be classified in one place.
    world: z.enum(['vrt', 'dom']).default('dom'),
    category: z.string().default('Ostalo'),
    price: z.string(),
    description: z.string().default(''),
    variants: z.array(z.object({ label: z.string(), price: z.string() })).default([]),
    // true = image supplied but no txt yet; shown with "Cijena na upit".
    needsInfo: z.boolean().default(false),
  }),
});

export const collections = { settings, sections, products, works, pages, shop };
