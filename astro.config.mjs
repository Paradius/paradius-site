// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { dataLayerIntegration } from './integrations/data-layer';

// https://astro.build/config
export default defineConfig({
  site: 'https://paradius.dev',
  output: 'static',
  integrations: [
    dataLayerIntegration(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://paradius.dev/') {
          return { ...item, priority: 1.0 };
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
