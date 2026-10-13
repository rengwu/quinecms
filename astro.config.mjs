import { resolve } from 'node:path';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import { readFileSync, realpathSync } from 'node:fs';
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);
const dependencies = Object.keys(pkg.dependencies);
const alias = Object.fromEntries(
  Object.entries(pkg.exports ?? {})
    .filter(([key]) => key !== './package.json')
    .map(([key, path]) => ['quinecms/' + key.slice(2), resolve(path)]),
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
    envDir: process.env.QUINECMS_SITE_ROOT ?? process.cwd(),
    // Isolated examples/tests share installed dependencies through a symlink.
    // Permit that directory so Astro's hydration renderer can load in dev.
    server: {
      fs: {
        allow: [
          process.cwd(),
          process.env.QUINECMS_SITE_ROOT ?? process.cwd(),
          process.env.QUINECMS_ENGINE_ROOT ?? process.cwd(),
          realpathSync(new URL('./node_modules', import.meta.url)),
        ],
      },
    },
    plugins: [kumoStyles(), ...buildAssets()],
    resolve: { dedupe: dependencies, alias },
    build: { sourcemap: false },
  },
});
