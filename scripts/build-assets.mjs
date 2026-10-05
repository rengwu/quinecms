import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
// Astro deduplicates SSR CSS by deleting client copies. A dynamic preview import
// still has Vite preload references to those copies. Preserve only referenced
// assets; public pages continue using Astro's route-specific stylesheets.
export function buildAssets() {
  const css = new Map(),
    missing = new Map();
  return [
    {
      name: 'lean:capture-client-css',
      enforce: 'pre',
      apply: 'build',
      generateBundle(_options, bundle) {
        if (this.environment?.name !== 'client') return;
        for (const [name, asset] of Object.entries(bundle))
          if (asset.type === 'asset' && name.endsWith('.css'))
            css.set(name, asset);
      },
    },
    {
      name: 'lean:verify-client-assets',
      enforce: 'post',
      apply: 'build',
      generateBundle: {
        order: 'post',
        async handler(_options, bundle) {
          if (this.environment?.name !== 'client') return;
          for (const chunk of Object.values(bundle)) {
            if (chunk.type !== 'chunk') continue;
            for (const match of chunk.code.matchAll(
              /["'](_astro\/[^"']+\.css)["']/g,
            )) {
              const name = match[1];
              if (!bundle[name]) {
                if (!css.has(name)) throw Error(`Missing stylesheet: ${name}`);
                missing.set(name, css.get(name).source);
              }
            }
          }
          const graph = Object.fromEntries(
            Object.values(bundle)
              .filter((c) => c.type === 'chunk')
              .map((c) => [
                c.fileName,
                {
                  imports: c.imports,
                  dynamicImports: c.dynamicImports,
                  bytes: Buffer.byteLength(c.code),
                  modules: Object.keys(c.modules).map((id) =>
                    id.replace(process.cwd() + '/', ''),
                  ),
                },
              ]),
          );
          await mkdir('.astro', { recursive: true });
          await writeFile(
            '.astro/client-graph.json',
            JSON.stringify(graph, null, 2),
          );
        },
      },
      async writeBundle(options) {
        if (this.environment?.name !== 'client') return;
        for (const [name, source] of missing) {
          const path = resolve(options.dir, name);
          await mkdir(dirname(path), { recursive: true });
          await writeFile(path, source);
        }
      },
    },
  ];
}
