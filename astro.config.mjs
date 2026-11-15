import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://felipefrf.com',
  integrations: [sitemap({ filter: (page) => !page.includes('bb102c75') })],
});
