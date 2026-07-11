import type { ImageMetadata } from 'astro';

/**
 * Resolve a product image filename (as stored in content frontmatter) to the
 * imported ImageMetadata that <Image /> needs. Eagerly globs both asset folders
 * so any mix of webp/jpg/avif inputs is served as one optimized format + size
 * set. Returns undefined for imageless products (Solar, Servis) so the card can
 * render its graceful themed placeholder instead.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  ['../assets/products/*.{webp,jpg,jpeg,png,avif}', '../assets/tv/*.{webp,jpg,jpeg,png,avif}'],
  { eager: true }
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  const file = path.split('/').pop()!;
  byName.set(file, mod.default);
}

export function resolveImage(name?: string): ImageMetadata | undefined {
  if (!name) return undefined;
  return byName.get(name);
}

/** Same idea for the webshop images (src/assets/shop_products). */
const shopModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/shop_products/*.{webp,jpg,jpeg,png,avif}',
  { eager: true }
);
const shopByName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(shopModules)) {
  shopByName.set(path.split('/').pop()!, mod.default);
}

export function resolveShopImage(name?: string): ImageMetadata | undefined {
  if (!name) return undefined;
  return shopByName.get(name);
}
