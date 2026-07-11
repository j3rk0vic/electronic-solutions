/**
 * Company details in site.md ship as `[ADRESA]`-style placeholders until the
 * owner supplies the real values. Nothing should ever build a `tel:` link, a
 * form action, or structured data out of an unfilled placeholder.
 */
export const isPlaceholder = (v?: string) => !v || v.trim().startsWith('[');

/** The value, or undefined if it is still a placeholder. */
export const real = (v?: string) => (isPlaceholder(v) ? undefined : v);
