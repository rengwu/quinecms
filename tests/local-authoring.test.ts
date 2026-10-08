import { expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fixtureDirectory } from './support/fixture';
import { projectFixture } from './support/project';

const exec = promisify(execFile);
const command = (cwd: string, args: string[]) =>
  exec(process.execPath, args, { cwd, maxBuffer: 16 * 1024 * 1024 });
const validator = [
  resolve('node_modules/tsx/dist/cli.mjs'),
  resolve('scripts/validate-content.ts'),
];

it('validates unfinished drafts and baseline schema changes without modifying content', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lean-validation-test-'));
  try {
    await cp(fixtureDirectory, join(directory, 'content'), { recursive: true });
    const git = (args: string[]) => exec('git', args, { cwd: directory });
    await git(['init', '-q']);
    await git(['add', 'content']);
    await git([
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      '-c',
      'commit.gpgsign=false',
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '-qm',
      'fixture',
    ]);
    const pagePath = join(directory, 'content/pages/page_home.json');
    const page = JSON.parse(await readFile(pagePath, 'utf8'));
    page.title = '';
    page.path = '';
    const raw = JSON.stringify(page);
    await writeFile(pagePath, raw);
    await command(directory, [...validator, '--draft']);
    await expect(command(directory, validator)).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('[publish]'),
    });
    expect(await readFile(pagePath, 'utf8')).toBe(raw);

    const schemaPath = join(
      directory,
      'content/collections/collection_journal.json',
    );
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    schema.fields = schema.fields.filter(
      (field: { key: string }) => field.key !== 'summary',
    );
    await writeFile(schemaPath, JSON.stringify(schema));
    await command(directory, [...validator, '--draft']);
    await expect(
      command(directory, [...validator, '--draft', '--base', 'HEAD']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('This field contains content'),
    });
    schema.fields[0].key = '';
    await writeFile(schemaPath, JSON.stringify(schema));
    await expect(
      command(directory, [...validator, '--draft']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('[structure]'),
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);

it('checks a fresh site independently of demo routes and keeps static-demo coverage in a fixture', async () => {
  const directory = await projectFixture();
  try {
    const build = async () => {
      await command(directory, ['scripts/generate-blocks.mjs']);
      await command(directory, ['node_modules/astro/bin/astro.mjs', 'build']);
      const result = await command(directory, ['scripts/check-build.mjs']);
      return JSON.parse(result.stdout);
    };
    const demo = await build();
    for (const path of [
      'journal/index.html',
      'journal/a-slower-way-to-build/index.html',
    ])
      expect(
        demo.pages.find((page: { page: string }) => page.page === path)
          ?.javascriptModules,
      ).toBe(0);
    for (const name of [
      'react',
      'react-dom',
      'svelte',
      '@vue/runtime-core',
      '@vue/runtime-dom',
    ])
      expect(demo.runtimeCopies[name]).toBe(1);

    await rm(join(directory, 'content'), { recursive: true });
    await mkdir(join(directory, 'content/pages'), { recursive: true });
    await writeFile(
      join(directory, 'content/site.json'),
      JSON.stringify({
        formatVersion: 1,
        id: 'site_client',
        globals: {},
        layout: {
          id: 'starter',
          version: 1,
          settings: { title: 'Client site', navigation: [] },
        },
      }),
    );
    const pagePath = join(directory, 'content/pages/page_client.json');
    const page = {
      formatVersion: 1,
      id: 'page_client',
      kind: 'static',
      path: '',
      title: '',
      blocks: [],
    };
    await writeFile(pagePath, JSON.stringify(page));
    await command(directory, [
      'scripts/generate-blocks.mjs',
      '--registry-only',
    ]);
    await command(directory, [
      'node_modules/tsx/dist/cli.mjs',
      'scripts/validate-content.ts',
      '--draft',
    ]);
    await expect(
      command(directory, [
        'node_modules/tsx/dist/cli.mjs',
        'scripts/validate-content.ts',
      ]),
    ).rejects.toMatchObject({ code: 1 });
    page.title = 'Client home';
    page.path = '/';
    await writeFile(pagePath, JSON.stringify(page));
    const fresh = await build();
    expect(
      fresh.pages.map((page: { page: string }) => page.page).sort(),
    ).toEqual(['admin/index.html', 'index.html']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 60000);
