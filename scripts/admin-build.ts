import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
const engine = JSON.parse(readFileSync('package.json', 'utf8'));
const alias = Object.fromEntries(
  Object.entries(engine.exports ?? {})
    .filter(([key]) => key !== './package.json')
    .map(([key, path]) => [
      'quinecms/' + key.slice(2),
      resolve(path as string),
    ]),
);
import { kumoStyles } from './kumo-styles.mjs';

// A separate, self-contained editor never enters Astro's public asset graph.
// write:false keeps every plaintext admin asset out of the publish directory.
export async function adminBundle(development = false) {
  const result = await build({
    configFile: false,
    envDir: false,
    publicDir: false,
    logLevel: 'error',
    // The parent Astro dev server has NODE_ENV=development. Keep this compiled
    // bundle's JSX consistent with the production React runtime below.
    oxc: { jsx: { development: false } },
    plugins: [
      kumoStyles(),
      svelte({ configFile: false, compilerOptions: { dev: false } }),
      vue(),
    ],
    resolve: { dedupe: ['react', 'react-dom', 'svelte', 'vue'], alias },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.DEV': JSON.stringify(development),
    },
    build: {
      write: false,
      minify: true,
      sourcemap: false,
      cssCodeSplit: false,
      modulePreload: false,
      lib: {
        entry: resolve('src/editor/mount.tsx'),
        formats: ['es'],
        fileName: 'admin',
      },
      rolldownOptions: { output: { codeSplitting: false } },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) =>
    'output' in r ? r.output : [],
  );
  const chunks = outputs.filter((r) => r.type === 'chunk');
  if (
    chunks.length !== 1 ||
    chunks[0].imports.length ||
    chunks[0].dynamicImports.some((id) => id !== chunks[0].fileName)
  )
    throw Error(
      'The encrypted admin must be a self-contained bundle: ' +
        JSON.stringify(
          chunks.map((r) => ({
            file: r.fileName,
            imports: r.imports,
            dynamicImports: r.dynamicImports,
          })),
        ),
    );
  const styles = outputs
    .filter((r) => r.type === 'asset')
    .filter((r) => r.fileName.endsWith('.css'));
  if (outputs.length !== chunks.length + styles.length)
    throw Error(
      'An admin asset could not be embedded in the encrypted bundle.',
    );
  return { code: chunks[0].code, css: styles.map((r) => r.source).join('\n') };
}
