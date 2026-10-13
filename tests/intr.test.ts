import { expect, it } from 'vitest';
import { readFile, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prepareExample } from '../scripts/example-site.mjs';
import {
  contextFor,
  filesFor,
  parseFiles,
  validate,
} from '../src/core/content';
import { definitions } from '../src/generated/definitions';
import { Projects, Gallery } from '../src/themes/intr/v1/components';
import type { Content, Block } from '../src/core/types';

async function records(root: string) {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const item of await readdir(join(root, dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${item.name}`;
      if (item.isDirectory()) await walk(path);
      else if (item.name.endsWith('.json'))
        files[path] = await readFile(join(root, path), 'utf8');
    }
  }
  await walk('content');
  return files;
}
const renderProjects = (content: Content, block: Block) =>
  renderToStaticMarkup(
    createElement(Projects, {
      props: block.props,
      context: contextFor(content, block.id),
    }),
  );

it('stages exactly the agreed Intr routes with local media and a restorable backup, preserving the active demo', async () => {
  const before = await records('.');
  const directory = await prepareExample('intr');
  try {
    const content = parseFiles(await records(directory));
    expect(content.site.layout?.id).toBe('intr');
    expect(content.pages.map((page) => page.path).sort()).toEqual([
      '/',
      '/projects',
      '/projects/maison-doree',
    ]);
    expect(validate(content, definitions)).toEqual([]);
    expect(parseFiles(filesFor(content))).toEqual(content);
    expect(
      JSON.parse(await readFile('examples/intr/backup.json', 'utf8')),
    ).toEqual(content);
    for (const media of content.media) {
      for (const file of [media.original, ...media.variants]) {
        expect(file.url).toMatch(/^\/intr\/v1\//);
        expect((await stat(join(directory, 'public', file.url))).size).toBe(
          file.bytes,
        );
      }
    }
    expect(await readFile(join(directory, '.env'), 'utf8')).toBe(
      'ADMIN_EMAIL=intr@example.test\nADMIN_PASSWORD=intr-preview\n',
    );
    expect(await records('.')).toEqual(before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it('shares project edits across ordered grids and maps only safe optional detail links', async () => {
  const content = parseFiles(await records('examples/intr'));
  const home = content.pages
    .find((page) => page.path === '/')!
    .blocks.find((block) => block.type === 'intr-projects')!;
  const index = content.pages.find((page) => page.path === '/projects')!
    .blocks[0];
  const project = content.entries.find(
    (entry) => entry.id === 'entry_intr_private',
  )!;
  project.values.title = 'A newly named home';
  project.values.location = 'A new location';
  project.values.url = '/projects/maison-doree';
  for (const block of [home, index]) {
    const html = renderProjects(content, block);
    expect(html).toContain('A newly named home');
    expect(html).toContain('A new location');
    expect(html).toContain(
      'href="/projects/maison-doree" aria-label="View A newly named home"',
    );
    expect(html).not.toContain('href=""');
  }
  project.values.url = 'javascript:alert(1)';
  expect(renderProjects(content, home)).not.toContain('javascript:');
  home.props.projects = [];
  const empty = renderToStaticMarkup(
    createElement(Projects, {
      props: home.props,
      context: { ...contextFor(content, home.id), preview: true },
    }),
  );
  expect(empty).toContain('Select projects in this block');
});

it('keeps galleries readable without hydration and preserves captions and responsive media', async () => {
  const content = parseFiles(await records('examples/intr'));
  const block = content.pages
    .find((page) => page.path === '/projects/maison-doree')!
    .blocks.find((block) => block.type === 'intr-gallery')!;
  const html = renderToStaticMarkup(
    createElement(Gallery, {
      props: block.props,
      context: contextFor(content, block.id),
    }),
  );
  expect(html).toContain('<figcaption>');
  expect(html).toContain('srcSet=');
  expect(html).toContain('loading="lazy"');
  expect(html).not.toContain('<video');
});
