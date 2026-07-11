import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * All editable text + products live here so the owner can maintain the site
 * without touching components. Four collections:
 *   - settings : one singleton (site.md) — company info, nav, brands, SEO
 *   - sections : per-section headline/eyebrow/copy/stats (home page)
 *   - products : one file per product, grouped by "world" (vrt | dom | tv)
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
    world: z.enum(['neutral', 'vrt', 'dom', 'tv']).default('neutral'),
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
    world: z.enum(['vrt', 'dom', 'tv']),
    order: z.number(),
    title: z.string(),
    brand: z.string().optional(),
    blurb: z.string(),
    // Filename inside src/assets/products (or /tv). Resolved to an optimized
    // <Image /> at render time via import.meta.glob. Optional: cards without an
    // image (e.g. Solar, Servis) render a graceful themed gradient placeholder.
    image: z.string().optional(),
    badge: z.string().optional(),
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
    blocks: z.array(z.object({ num: z.string(), title: z.string(), body: z.string() })).default([]),
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
    category: z.string().default('Ostalo'),
    price: z.string(),
    description: z.string().default(''),
    variants: z.array(z.object({ label: z.string(), price: z.string() })).default([]),
    // true = image supplied but no txt yet; shown with "Cijena na upit".
    needsInfo: z.boolean().default(false),
  }),
});

export const collections = { settings, sections, products, pages, shop };
