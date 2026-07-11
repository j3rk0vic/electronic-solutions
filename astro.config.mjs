// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Static output, tuned for Cloudflare Pages (Vercel also works with zero changes).
// https://astro.build/config
export default defineConfig({
  site: 'https://electronic-solution.hr',
  output: 'static',
  // Generates /sitemap-index.xml (+ sitemap-0.xml) from all pages for Google.
  integrations: [sitemap({ i18n: undefined })],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // astro:assets serves optimized AVIF/WebP; sharp is the default service.
    responsiveStyles: true,
    layout: 'constrained',
  },
});
