import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import { readFileSync, realpathSync } from 'node:fs';
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
      name: 'command-specific-vite-settings',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          // Check/build can run beside dev, including in linked example copies.
          // Each command must leave the running server's optimized modules intact.
          updateConfig({
            vite: {
              cacheDir: `.astro/vite/${command}`,
              // NODE_ENV / --mode must never enable the dev login in a build.
              define: {
                'import.meta.env.LEAN_DEV_SERVER': JSON.stringify(
                  command === 'dev',
                ),
              },
            },
          });
        },
      },
    },
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
    // Isolated examples/tests share installed dependencies through a symlink.
    // Permit that directory so Astro's hydration renderer can load in dev.
    server: {
      fs: {
        allow: [
          process.cwd(),
          realpathSync(new URL('./node_modules', import.meta.url)),
        ],
      },
    },
    plugins: [kumoStyles(), ...buildAssets()],
    resolve: { dedupe: dependencies },
    build: { sourcemap: false },
  },
});
