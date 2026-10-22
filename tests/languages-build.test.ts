import { expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { projectFixture } from './support/project';

const exec = promisify(execFile);
const cli = resolve('bin/quinecms.mjs');
const command = (cwd: string, args: string[]) =>
  exec(process.execPath, [cli, ...args], {
    cwd,
    maxBuffer: 16 * 1024 * 1024,
  });

it('builds additional languages with prefixed routes, fallback metadata and language links', async () => {
  const directory = await projectFixture();
  const edit = async (path: string, change: (data: any) => void) => {
    const file = join(directory, path);
    const data = JSON.parse(await readFile(file, 'utf8'));
    change(data);
    await writeFile(file, JSON.stringify(data));
  };
  const html = (path: string) =>
    readFile(join(directory, 'dist', path, 'index.html'), 'utf8');
  try {
    await writeFile(
      join(directory, 'extensions/local/src/layouts/alpha/View.tsx'),
      `import type {LayoutProps} from 'quinecms/core/layout-contract'; export default function View({children,languages}:LayoutProps){return <main>{languages?.map(l=><a key={l.code} href={l.path} aria-current={l.current ? 'page' : undefined}>{l.code}</a>)}{children}</main>}`,
    );
    await edit('content/site.json', (site) => {
      site.i18n = {
        enabled: true,
        main: 'en',
        languages: ['id'],
        missing: 'fallback',
      };
    });
    await edit('content/collections/collection_journal.json', (c) => {
      c.fields[0].localized = true;
    });
    await edit('content/pages/page_home.json', (page) => {
      page.copies = { id: { title: 'Beranda' } };
    });
    await command(directory, ['validate']);
    await command(directory, ['build']);

    const home = await html('');
    expect(home).toContain('<html lang="en"');
    expect(home).not.toContain('noindex');
    expect(home).toContain('<a href="/id">id</a>');

    const translated = await html('id');
    expect(translated).toContain('<html lang="id"');
    expect(translated).toContain('<title>Beranda');
    expect(translated).not.toContain('noindex');
    expect(translated).toContain('<div lang="id" style="display: contents">');
    expect(translated).toContain('<a href="/id" aria-current="page">id</a>');

    // No Indonesian copy: the whole entry falls back inside the Indonesian page.
    const fallback = await html('id/journal/a-slower-way-to-build');
    expect(fallback).toContain('<html lang="id"');
    expect(fallback).toContain('<meta name="robots" content="noindex">');
    expect(fallback).toContain('<title>First entry');
    expect(fallback).toContain('<div lang="en" style="display: contents">');
    expect(fallback).toContain(
      '<a href="/journal/a-slower-way-to-build">en</a>',
    );

    await edit('content/site.json', (site) => {
      site.i18n.missing = 'strict';
    });
    await expect(command(directory, ['validate'])).rejects.toMatchObject({
      stderr: expect.stringContaining('Indonesian copy is missing.'),
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 120000);
