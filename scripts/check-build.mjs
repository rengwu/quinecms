import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import installedLayouts from '../layouts.config.mjs';
const graph = JSON.parse(await readFile('.astro/client-graph.json', 'utf8'));
const assets = new Set(await readdir('dist/_astro'));
const packages = new Map(),
  moduleOwners = new Map();
for (const [file, chunk] of Object.entries(graph)) {
  assert(assets.has(file.replace('_astro/', '')), `Missing ${file}`);
  const code = await readFile('dist/' + file, 'utf8');
  for (const [, css] of code.matchAll(/["'](_astro\/[^"']+\.css)["']/g))
    assert(assets.has(css.replace('_astro/', '')), `Missing CSS ${css}`);
  for (const id of chunk.modules) {
    if (id.includes('node_modules/') && !id.startsWith('\0')) {
      assert(!moduleOwners.has(id), `Module emitted twice: ${id}`);
      moduleOwners.set(id, file);
      const match = id.match(
        /node_modules\/\.pnpm\/([^/]+)\/node_modules\/((?:@[^/]+\/)?[^/]+)\//,
      );
      if (match) {
        const [, version, name] = match;
        const versions = packages.get(name) ?? new Set();
        versions.add(version);
        packages.set(name, versions);
      }
    }
  }
}
for (const name of [
  'react',
  'react-dom',
  'svelte',
  '@vue/runtime-core',
  '@vue/runtime-dom',
])
  assert.equal(
    packages.get(name)?.size,
    1,
    `Expected exactly one installed runtime for ${name}`,
  );
async function htmlFiles(dir) {
  const result = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const path = dir + '/' + f.name;
    if (f.isDirectory()) result.push(...(await htmlFiles(path)));
    else if (path.endsWith('.html')) result.push(path);
  }
  return result;
}
const summary = [];
for (const file of await htmlFiles('dist')) {
  const html = await readFile(file, 'utf8');
  for (const iframe of html.matchAll(/<iframe\b[^>]*>/g))
    assert(
      /src="https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}"/.test(
        iframe[0],
      ),
      'Unexpected iframe destination',
    );
  const references = [
    ...html.matchAll(
      /(?:src|href|component-url|renderer-url)="(\/_astro\/[^"?]+)"/g,
    ),
  ].map((m) => m[1].slice(1));
  for (const ref of references) await stat('dist/' + ref);
  const reachable = new Set();
  function visit(path) {
    if (reachable.has(path)) return;
    reachable.add(path);
    for (const dep of graph[path]?.imports ?? []) visit(dep);
  }
  for (const ref of references) if (ref.endsWith('.js')) visit(ref);
  const bytes = await Promise.all(
    [...reachable]
      .filter((f) => f.endsWith('.js'))
      .map(async (f) => gzipSync(await readFile('dist/' + f)).length),
  );
  summary.push({
    page: file.slice(5),
    javascriptModules: [...reachable].filter((f) => f.endsWith('.js')).length,
    gzipJavaScriptBytes: bytes.reduce((a, b) => a + b, 0),
  });
  if (!file.includes('/admin/')) {
    assert(
      ![...reachable].some((f) =>
        graph[f]?.modules.some(
          (m) =>
            m.includes('src/editor/') ||
            m.includes('@cloudflare/kumo') ||
            m.includes('@octokit/') ||
            m.includes('@aws-sdk/'),
        ),
      ),
      'Public page loads editor/UI/provider modules',
    );
  }
}
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const selected = site.layout ?? { id: 'starter', version: 1 };
const layouts = await Promise.all(
  installedLayouts.map(async (path) =>
    JSON.parse(
      await readFile(`src/site-layouts/${path}/definition.json`, 'utf8'),
    ),
  ),
);
const layout = layouts.find(
  (d) => d.id === selected.id && d.version === selected.version,
);
assert(layout, 'Active layout version must be installed');
if (layout.activation === 'never') {
  assert.equal(
    summary.find((p) => p.page === 'journal/index.html')?.javascriptModules,
    0,
    'Collection listing should have no JS',
  );
  assert.equal(
    summary.find((p) => p.page === 'journal/a-slower-way-to-build/index.html')
      ?.javascriptModules,
    0,
    'Generic entry should have no JS',
  );
}
console.log(
  JSON.stringify(
    {
      runtimeCopies: Object.fromEntries(
        [...packages]
          .filter(([p]) =>
            [
              'react',
              'react-dom',
              'svelte',
              '@vue/runtime-core',
              '@vue/runtime-dom',
            ].includes(p),
          )
          .map(([p, v]) => [p, v.size]),
      ),
      pages: summary,
    },
    null,
    2,
  ),
);
