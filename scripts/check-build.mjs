import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import installedLayouts from '../layouts.config.mjs';
const adminHtml = await readFile('dist/admin/index.html', 'utf8');
const payload = adminHtml.match(
  /<script\b[^>]*id="admin-payload"[^>]*>([\s\S]*?)<\/script>/,
);
assert(payload, 'Admin must contain an encrypted payload');
assert(
  /<button\b(?=[^>]*type="submit")(?=[^>]*disabled)[^>]*>/.test(adminHtml),
  'Login must remain disabled until the local decryption handler is ready',
);
const envelope = JSON.parse(payload[1]);
assert.equal(envelope.parameters.kdf, 'argon2id');
assert.equal(envelope.parameters.cipher, 'AES-256-GCM');
assert.equal(Buffer.from(envelope.salt, 'base64').length, 32);
assert.equal(Buffer.from(envelope.iv, 'base64').length, 12);
assert(Buffer.from(envelope.ciphertext, 'base64').length > 16);
assert(
  !adminHtml.includes('passwordHash'),
  'Legacy password verifier must not be deployed',
);
assert(
  !adminHtml.includes('<astro-island'),
  'Admin props must not be published as an Astro island',
);
assert(
  !(await readdir('dist')).includes('.prerender'),
  'Build-only prerender files must not be deployed',
);
const graph = JSON.parse(await readFile('.astro/client-graph.json', 'utf8'));
const assets = new Set(await readdir('dist/_astro'));
const packages = new Map(),
  moduleOwners = new Map();
for (const [file, chunk] of Object.entries(graph)) {
  assert(
    !chunk.modules.some(
      (id) => id.includes('src/editor/') || id.includes('src/integrations/'),
    ),
    `Plaintext editor module in public output: ${file}`,
  );
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
  assert(
    (packages.get(name)?.size ?? 0) <= 1,
    `Expected at most one emitted runtime version for ${name}`,
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
            m.includes('src/integrations/') ||
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
const selections = site.layouts?.map((layout) => layout.design) ?? [
  site.layout ?? { id: 'starter', version: 1 },
];
const layouts = await Promise.all(
  installedLayouts.map(async (path) =>
    JSON.parse(
      await readFile(`src/site-layouts/${path}/definition.json`, 'utf8'),
    ),
  ),
);
for (const selected of selections) {
  assert(
    layouts.some((d) => d.id === selected.id && d.version === selected.version),
    'Every saved layout design version must be installed',
  );
}
// Page-specific budgets belong to site or regression fixtures. Custom layouts
// and blocks may intentionally add scripts or embeds to any public route.
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
