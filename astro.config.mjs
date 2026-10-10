import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://zrishen.github.io',
  base: '/',
  build: {
    format: 'file'
  }
});
