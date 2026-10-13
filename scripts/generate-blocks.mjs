import {
  readFile,
  writeFile as rawWriteFile,
  mkdir,
  rm,
  readdir,
} from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import semver from 'semver';
import blocks from '../blocks.config.mjs';
import { publicRoutes } from '../src/core/routes.ts';
import { pageLayout } from '../src/core/layout-state.ts';
import { generateLayouts } from './generate-layouts.mjs';
// Keep unchanged files in place so a running dev server never sees an empty registry.
const written = new Set();
async function writeFile(path, text) {
  written.add(resolve(path));
  if ((await readFile(path, 'utf8').catch(() => null)) !== text)
    await rawWriteFile(path, text);
}
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const defs = [];
const keys = new Set();
for (const path of blocks) {
  const base = resolve('src/blocks', path);
  const d = JSON.parse(
    await readFile(resolve(base, 'definition.json'), 'utf8'),
  );
  if (
    !/^[a-z][\w-]*(?:\/[a-z][\w-]*)*$/.test(d.type) ||
    !Number.isInteger(d.version) ||
    d.version < 1 ||
    !['react', 'svelte', 'vue', 'vanilla'].includes(d.framework) ||
    !['never', 'visible', 'idle', 'load'].includes(d.activation) ||
    !Array.isArray(d.fields) ||
    (d.kind !== undefined && !['static', 'generic'].includes(d.kind)) ||
    (d.theme !== undefined &&
      (typeof d.theme !== 'string' || !d.theme.trim())) ||
    (d.tags !== undefined &&
      (!Array.isArray(d.tags) ||
        d.tags.some((t) => typeof t !== 'string' || !t.trim()))) ||
    (d.placement !== undefined && !['page', 'footer'].includes(d.placement)) ||
    !d.defaults
  )
    throw Error(`Invalid block definition: ${path}`);
  const key = `${d.type}@${d.version}`;
  if (keys.has(key)) throw Error(`Duplicate ${key}`);
  keys.add(key);
  for (const [name, range] of Object.entries(d.dependencies)) {
    if (!semver.satisfies(pkg.dependencies[name] ?? '', range))
      throw Error(
        `${key} requires ${name} ${range}; root has ${pkg.dependencies[name] ?? 'nothing'}`,
      );
  }
  const required = {
    react: ['react', 'react-dom'],
    svelte: ['svelte'],
    vue: ['vue'],
    vanilla: [],
  }[d.framework];
  for (const name of required)
    if (!d.dependencies[name]) throw Error(`${key} must declare ${name}`);
  const file = resolve(base, d.component);
  if (!file.startsWith(base + '/'))
    throw Error('Renderer must be inside its block directory');
  await readFile(file);
  defs.push({ ...d, source: file });
}

await mkdir('src/generated', { recursive: true });
await writeFile(
  'src/generated/definitions.ts',
  `import type {Definition} from '../core/types';\nexport const definitions: Definition[] = ${JSON.stringify(
    defs.map(({ source, ...d }) => d),
    null,
    2,
  )};\n`,
);
for (const [i, d] of defs.entries()) {
  const imp = '../' + relative(resolve('src'), d.source);
  const vanilla =
    d.activation === 'never'
      ? '<Fragment set:html={render(props,context)} />'
      : `<div data-vanilla-block="${i}" data-block-props={JSON.stringify(props)} data-block-context={JSON.stringify(context)} set:html={render(props,context)}/><script>import {mount} from ${JSON.stringify(imp)};import {activate} from '../core/activate';for(const host of document.querySelectorAll<HTMLElement>('[data-vanilla-block="${i}"]'))activate(host,${JSON.stringify(d.activation)},()=>mount(host,JSON.parse(host.dataset.blockProps!),JSON.parse(host.dataset.blockContext!)));</script>`;
  const markup =
    d.framework === 'vanilla'
      ? vanilla
      : `<Component props={props} context={context} ${d.activation === 'never' ? '' : `client:${d.activation}`} />`;
  await writeFile(
    `src/generated/Block${i}.astro`,
    `---\nimport ${d.framework === 'vanilla' ? '{render}' : 'Component'} from ${JSON.stringify(imp)};\nconst {props,context}=Astro.props;\n---\n${markup}\n`,
  );
}
await writeFile(
  'src/generated/browser.ts',
  `export const renderers = {\n${defs.map((d) => `${JSON.stringify(d.type + '@' + d.version)}: () => import(${JSON.stringify('../' + relative(resolve('src'), d.source))})`).join(',\n')}\n};\n`,
);
console.log(`Registered ${defs.length} block versions.`);

if (process.argv.includes('--registry-only')) {
  await generateLayouts(writeFile);
  // Leave route/source output alone; the next full generation refreshes it.
  process.exit(0);
}

const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const installedLayouts = await generateLayouts(writeFile, site);
const footerIndex = site.footer
  ? defs.findIndex(
      (d) =>
        d.type === site.footer.type &&
        d.version === site.footer.version &&
        d.placement === 'footer',
    )
  : -1;
if (site.footer && footerIndex === -1)
  throw Error('Missing installed site footer');
await writeFile(
  'src/generated/Footer.astro',
  footerIndex === -1
    ? `---
const {content}=Astro.props;
---
<footer class="site-footer">{content.site.title}</footer>
`
    : `---
import Block from './Block${footerIndex}.astro';
import {contextFor} from '../core/content';
const {content}=Astro.props;
---
<Block props={content.site.footer.props} context={contextFor(content,content.site.footer.id)}/>
`,
);

const content = { site, pages: [], collections: [], entries: [] };
async function walk(dir, kind) {
  const entries = await readdir(dir, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  for (const f of entries) {
    if (f.isDirectory()) await walk(resolve(dir, f.name), kind);
    else if (f.name.endsWith('.json'))
      content[kind].push(
        JSON.parse(await readFile(resolve(dir, f.name), 'utf8')),
      );
  }
}
await walk('content/pages', 'pages');
await walk('content/collections', 'collections');
await walk('content/entries', 'entries');
await mkdir('src/generated/pages', { recursive: true });
const routes = [];
for (const { path, page, entry } of publicRoutes(content)) {
  const record = entry ?? page;
  const design = pageLayout(content, page).design;
  const layoutIndex = installedLayouts.findIndex(
    (d) => d.id === design.id && d.version === design.version,
  );
  if (layoutIndex < 0)
    throw Error(`Missing installed layout ${design.id}@${design.version}`);
  if (
    !/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*$/.test(path) ||
    /^\/(admin|_astro|assets)(\/|$)/.test(path) ||
    routes.some((r) => r.pattern.replace(/\/$/, '') === path.replace(/\/$/, ''))
  )
    throw Error('Invalid or duplicate route ' + path);
  const selected = [
    ...new Set(
      page.blocks.map((b) =>
        defs.findIndex((d) => d.type === b.type && d.version === b.version),
      ),
    ),
  ];
  if (selected.includes(-1))
    throw Error('Missing installed block in ' + page.id);
  const imports = selected
    .map((i) => `import Block${i} from '../Block${i}.astro';`)
    .join('\n');
  const markup = page.blocks
    .map((b, j) => {
      const i = defs.findIndex(
        (d) => d.type === b.type && d.version === b.version,
      );
      return `<Block${i} props={blocks[${j}].props} context={contextFor(content,blocks[${j}].id)}/>`;
    })
    .join('\n');
  await writeFile(
    `src/generated/pages/${record.id}.astro`,
    `---
import Public from '../../layouts/Public.astro';
import PageLayout from '../Layout${layoutIndex}.astro';
import PageHead from '../LayoutHead${layoutIndex}.astro';
import {contentForPage} from '../../core/layout-state';
import {loadContent} from '../../core/load';
import {contextFor} from '../../core/content';
${entry ? "import {resolveBlock} from '../../core/bindings';" : ''}
${imports}
const fullContent=await loadContent();
const page=fullContent.pages.find(p=>p.id===${JSON.stringify(page.id)})!;
const content=contentForPage(fullContent,page);
${
  entry
    ? `const entry=content.entries.find(e=>e.id===${JSON.stringify(entry.id)})!;
const collection=content.collections.find(c=>c.id===entry.collectionId)!;
const title=String(entry.values[collection.titleField] ?? entry.slug);
const blocks=page.blocks.map(b=>resolveBlock(b,entry.values,content,collection.fields));`
    : `const title=page.title;
const blocks=page.blocks;`
}
---
<Public content={content} title={title}><PageHead slot="head" content={content}/><PageLayout content={content}>${markup}</PageLayout></Public>
`,
  );
  routes.push({
    pattern: path,
    entrypoint: `./src/generated/pages/${record.id}.astro`,
  });
}
await writeFile(
  'src/generated/routes.mjs',
  `export default ${JSON.stringify(routes, null, 2)};\n`,
);

const sources = {};
async function sourceFile(path) {
  const bytes = await readFile(path);
  sources[path] = createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
}
async function sourceDir(dir) {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const path = dir + '/' + f.name;
    if (path === 'src/generated') continue;
    if (f.isSymbolicLink())
      throw Error('Source symlinks are not supported: ' + path);
    if (f.isDirectory()) await sourceDir(path);
    else await sourceFile(path);
  }
}
await sourceDir('src');
await sourceDir('scripts');
await sourceDir('public');
for (const path of [
  'package.json',
  'pnpm-lock.yaml',
  'astro.config.mjs',
  'blocks.config.mjs',
  'layouts.config.mjs',
  'tsconfig.json',
])
  await sourceFile(path);
await writeFile(
  'src/generated/sources.ts',
  `export const sourceFiles: Record<string,string> = ${JSON.stringify(sources, null, 2)};\n`,
);

async function prune(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) await prune(path);
    else if (!written.has(path)) await rm(path);
  }
}
await prune('src/generated');
