import { expect, it } from 'vitest';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { contextFor, parseFiles, validate } from '../src/core/content';
import { publicRoutes } from '../src/core/routes';
import { resolveBlock } from '../src/core/bindings';
import { definitions } from '../src/generated/definitions';
import {
  Projects,
  ProjectHero,
  ProjectStory,
  Gallery,
} from '../src/themes/archline/v1/components';
import type { Content } from '../src/core/types';

async function example() {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const item of await readdir(join('examples/archline', dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${item.name}`;
      if (item.isDirectory()) await walk(path);
      else if (path.endsWith('.json'))
        files[path] = await readFile(join('examples/archline', path), 'utf8');
    }
  }
  await walk('content');
  return parseFiles(files);
}

it('publishes the isolated Archline example with a matching backup, local media and generated project routes', async () => {
  const content = await example();
  expect(validate(content, definitions)).toEqual([]);
  expect(
    JSON.parse(await readFile('examples/archline/backup.json', 'utf8')),
  ).toEqual(content);
  const routes = publicRoutes(content);
  expect(routes.map((route) => route.path)).toHaveLength(8);
  expect(
    routes.find((route) => route.path === '/projects/atelier-19-residence')
      ?.page.kind,
  ).toBe('generic');
  for (const media of content.media)
    for (const file of [media.original, ...media.variants]) {
      expect(file.url).toMatch(/^\/archline\/v1\//);
      expect((await stat(join('public', file.url))).size).toBe(file.bytes);
    }
});

it('propagates a shared project edit to both grids and its bound detail, including reordered chapters and galleries', async () => {
  const content = await example();
  const entry = content.entries[0];
  entry.values.title = 'A revised project name';
  entry.values.year = '2030';
  const collection = content.collections[0];
  for (const type of ['archline-projects', 'archline-project-index']) {
    const block = content.pages
      .flatMap((page) => page.blocks)
      .find((block) => block.type === type)!;
    const html = renderToStaticMarkup(
      createElement(Projects, {
        props: block.props,
        context: contextFor(content, block.id),
      }),
    );
    expect(html).toContain('A revised project name');
    expect(html).toContain('2030');
    expect(html).toContain('href="/projects/atelier-19-residence"');
  }
  entry.values.chapters = [
    {
      _rowId: 'changed',
      title: 'A new story',
      description: 'Written once, rendered through the template.',
      image: null,
    },
  ];
  entry.values.gallery = [
    { _rowId: 'second', image: entry.values.image, caption: 'First now' },
    { _rowId: 'first', image: entry.values.image, caption: 'Second now' },
  ];
  const template = content.pages.find((page) => page.kind === 'generic')!;
  for (const [i, Component, expected] of [
    [0, ProjectHero, 'A revised project name'],
    [1, ProjectStory, 'A new story'],
    [2, Gallery, 'First now'],
  ] as const) {
    const block = resolveBlock(
      template.blocks[i],
      entry.values,
      content,
      collection.fields,
    );
    const html = renderToStaticMarkup(
      createElement(Component, {
        props: block.props,
        context: contextFor(content, block.id),
      }),
    );
    expect(html).toContain(expected);
    if (i === 2)
      expect(html.indexOf('First now')).toBeLessThan(
        html.indexOf('Second now'),
      );
  }
});

it('keeps incomplete project blocks renderable and rejects unsafe media and card links', () => {
  const content = {
    site: { formatVersion: 1, id: 'site', globals: {} },
    pages: [],
    collections: [],
    objects: [],
    entries: [],
    media: [],
  } as Content;
  const context = { ...contextFor(content, 'new-block'), preview: true };
  expect(
    renderToStaticMarkup(createElement(Projects, { props: {}, context })),
  ).toContain('Choose a project collection');
  context.collections = [
    {
      id: 'projects',
      name: 'Projects',
      entries: [
        {
          id: 'unsafe',
          title: 'Unsafe URL',
          url: 'javascript:alert(1)',
          values: {},
        },
      ],
    },
  ];
  expect(
    renderToStaticMarkup(
      createElement(Projects, { props: { collection: 'projects' }, context }),
    ),
  ).not.toContain('javascript:');
});
