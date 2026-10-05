import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import { readFileSync } from 'node:fs';
const dependencies = Object.keys(
  JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    .dependencies,
);
import { buildAssets } from './scripts/build-assets.mjs';
import { kumoStyles } from './scripts/kumo-styles.mjs';
import routes from './src/generated/routes.mjs';
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'never' },
  integrations: [
    react(),
    svelte(),
    vue(),
    {
      name: 'content-routes',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          for (const route of routes) injectRoute(route);
        },
      },
    },
  ],
  vite: {
    plugins: [kumoStyles(), ...buildAssets()],
    resolve: { dedupe: dependencies },
    build: { sourcemap: false },
  },
});
