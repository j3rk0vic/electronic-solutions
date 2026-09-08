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
    // Tri širine umjesto Astrovih osam. Deploy ide FTP-om na cPanel, gdje svaki
    // fajl otvara vlastitu vezu — osam varijanti po slici značilo je 350+ fajlova
    // i firewall bi prekinuo prijenos. Ove tri pokrivaju mobitel/tablet/desktop.
    breakpoints: [640, 1080, 1920],
  },
});
