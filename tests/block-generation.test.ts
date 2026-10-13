import { afterEach, expect, it } from 'vitest';
import {
  cp,
  mkdir,
  readFile,
  writeFile,
  stat,
  rm,
  symlink,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { projectFixture } from './support/project';
import { prepareSite } from '../scripts/site-workspace.mjs';
const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const directories: string[] = [];
afterEach(async () => {
  for (const dir of directories.splice(0))
    await rm(dir, { recursive: true, force: true });
});
async function fixture() {
  const dir = await projectFixture();
  directories.push(dir);
  return dir;
}
const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
async function edit(path: string, change: (data: any) => void) {
  const data = await json(path);
  change(data);
  await writeFile(path, JSON.stringify(data));
}
async function generate(dir: string) {
  const { workspace } = await prepareSite(dir);
  await exec(
    process.execPath,
    ['--import', require.resolve('tsx/esm'), 'scripts/generate-blocks.mjs'],
    { cwd: workspace },
  );
  return workspace;
}

it('assembles a site without copying engine code into its tracked tree, and hashes site inputs only', async () => {
  const dir = await fixture();
  const workspace = await generate(dir);
  await expect(stat(join(dir, 'src/core'))).rejects.toThrow();
  const inputs = await json(join(workspace, 'build-inputs.json'));
  expect(inputs).toHaveProperty('package.json');
  expect(inputs).toHaveProperty('quinecms.config.json');
  expect(Object.keys(inputs).some((p) => p.startsWith('extensions/'))).toBe(
    true,
  );
  expect(
    Object.keys(inputs).some(
      (p) =>
        p.startsWith('content/') ||
        p.includes('node_modules') ||
        p === '.env' ||
        p.startsWith('src/core/'),
    ),
  ).toBe(false);
  const bytes = await readFile(join(dir, 'package.json'));
  expect(inputs['package.json']).toBe(
    createHash('sha1')
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest('hex'),
  );
  const path = join(workspace, 'src/generated/definitions.ts');
  const before = (await stat(path)).mtimeMs;
  await writeFile(join(workspace, 'src/generated/stale.astro'), 'stale');
  await generate(dir);
  expect((await stat(path)).mtimeMs).toBe(before);
  await expect(
    stat(join(workspace, 'src/generated/stale.astro')),
  ).rejects.toThrow();
  expect(
    await readFile(join(workspace, 'src/generated/site-config.ts'), 'utf8'),
  ).toContain('alpha');
});
it('generates static and entry routes from their own assigned designs', async () => {
  const dir = await fixture();
  await edit(join(dir, 'content/site.json'), (s) =>
    s.layouts.push({
      id: 'layout_beta',
      name: 'Journal',
      active: true,
      design: { id: 'beta', version: 1, settings: { title: 'Journal' } },
    }),
  );
  await edit(
    join(dir, 'content/pages/page_entry.json'),
    (p) => (p.layoutId = 'layout_beta'),
  );
  const workspace = await generate(dir);
  expect(
    await readFile(
      join(workspace, 'src/generated/pages/page_home.astro'),
      'utf8',
    ),
  ).toContain("from '../Layout0.astro'");
  const entry = await readFile(
    join(workspace, 'src/generated/pages/entry_first.astro'),
    'utf8',
  );
  expect(entry).toContain("from '../Layout1.astro'");
  expect(entry).toContain("from '../LayoutHead1.astro'");
  expect(entry).toContain('contentForPage(fullContent,page)');
});
it('keeps retained implementation versions selectable without changing saved designs', async () => {
  const dir = await fixture();
  const base = join(dir, 'extensions/local');
  await cp(join(base, 'src/layouts/alpha'), join(base, 'src/layouts/alpha2'), {
    recursive: true,
  });
  await edit(
    join(base, 'src/layouts/alpha2/definition.json'),
    (d) => (d.version = 2),
  );
  await edit(join(base, 'quinecms.library.json'), (d) =>
    d.layouts.push('src/layouts/alpha2'),
  );
  const workspace = await generate(dir);
  expect(
    await readFile(join(workspace, 'src/generated/Layout0.astro'), 'utf8'),
  ).toContain('layouts/alpha/View.tsx');
  const registry = await readFile(
    join(workspace, 'src/generated/layout-browser.ts'),
    'utf8',
  );
  expect(registry).toContain('alpha@1');
  expect(registry).toContain('alpha@2');
  expect(
    (await json(join(dir, 'content/site.json'))).layouts[0].design.version,
  ).toBe(1);
});
it('rejects duplicate definitions, missing initial designs, escaped paths and loose production pins', async () => {
  const dir = await fixture();
  const config = join(dir, 'quinecms.config.json'),
    manifest = join(dir, 'extensions/local/quinecms.library.json');
  await edit(config, (c) => (c.initialLayout.id = 'missing'));
  await expect(prepareSite(dir)).rejects.toThrow('Initial layout missing@1');
  await edit(config, (c) => (c.initialLayout.id = 'alpha'));
  await edit(manifest, (m) => m.blocks.push(m.blocks[0]));
  await expect(generate(dir)).rejects.toThrow('Duplicate text@1');
  await edit(manifest, (m) => m.blocks.pop());
  await edit(manifest, (m) => m.blocks.push('../outside'));
  await expect(prepareSite(dir)).rejects.toThrow('stay inside');
  await edit(manifest, (m) => m.blocks.pop());
  await edit(
    join(dir, 'package.json'),
    (p) => (p.dependencies.quinecms = '^0.2.0'),
  );
  await expect(prepareSite(dir)).rejects.toThrow('Pin quinecms');
});
it('installs a declared library unchanged, registers custom fields, and rejects conflicting public assets', async () => {
  const dir = await fixture(),
    library = join(dir, 'node_modules/fixture-library');
  await cp(join(dir, 'extensions/local'), library, { recursive: true });
  await writeFile(
    join(library, 'package.json'),
    JSON.stringify({ name: 'fixture-library', version: '1.0.0' }),
  );
  await edit(join(library, 'quinecms.library.json'), (m) => {
    m.id = 'library';
    m.public = 'public';
    m.customFields = [
      { id: 'rating', validator: 'src/rating.ts', component: 'src/Rating.tsx' },
    ];
  });
  await writeFile(
    join(library, 'src/rating.ts'),
    'export default (v:unknown)=>typeof v === "number";',
  );
  await writeFile(
    join(library, 'src/Rating.tsx'),
    'export default function Rating(){return null;}',
  );
  await mkdir(join(library, 'public'));
  await writeFile(join(library, 'public/logo.svg'), '<svg/>');
  await edit(
    join(dir, 'package.json'),
    (p) => (p.dependencies['fixture-library'] = '1.0.0'),
  );
  await edit(join(dir, 'quinecms.config.json'), (c) => {
    c.libraries = ['fixture-library'];
    delete c.extensions;
  });
  const before = await readFile(join(library, 'src/rating.ts'));
  const workspace = await generate(dir);
  expect(await readFile(join(library, 'src/rating.ts'))).toEqual(before);
  expect(
    await readFile(join(workspace, 'src/generated/custom-fields.ts'), 'utf8'),
  ).toContain('rating');
  expect(await readFile(join(workspace, 'public/logo.svg'), 'utf8')).toBe(
    '<svg/>',
  );
  await mkdir(join(dir, 'public'));
  await writeFile(join(dir, 'public/logo.svg'), '<svg/>');
  await expect(prepareSite(dir)).rejects.toThrow('Site asset conflicts');
  await rm(join(dir, 'public/logo.svg'));
  await edit(
    join(dir, 'package.json'),
    (p) => (p.dependencies['fixture-library'] = 'latest'),
  );
  await expect(prepareSite(dir)).rejects.toThrow('Pin fixture-library');
});

it('factory reset uses the configured initial design and preserves only the site identity', async () => {
  const dir = await fixture();
  await edit(
    join(dir, 'quinecms.config.json'),
    (c) => (c.initialLayout.id = 'beta'),
  );
  const workspace = await generate(dir);
  const result = await exec(
    process.execPath,
    [
      '--import',
      require.resolve('tsx/esm'),
      '--input-type=module',
      '-e',
      `
    import {factoryReset} from './src/core/content.ts';
    console.log(JSON.stringify(factoryReset({site:{id:'keep-site'}})));
  `,
    ],
    { cwd: workspace },
  );
  const reset = JSON.parse(result.stdout);
  expect(reset.site.id).toBe('keep-site');
  expect(reset.site.layouts).toHaveLength(1);
  expect(reset.site.layouts[0]).toMatchObject({
    active: true,
    design: { id: 'beta', version: 1, settings: { title: 'Fixture' } },
  });
  expect(reset.pages).toEqual([]);
});
