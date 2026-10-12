import { expect, it } from 'vitest';
import { readFile, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { prepareExample } from '../scripts/example-site.mjs';
import { filesFor, parseFiles, validate } from '../src/core/content';
import { definitions } from '../src/generated/definitions';
import { contextFor } from '../src/core/content';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import Works from '../src/blocks/quine-works/v1/View';

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

it('stages the complete Quine example without altering demo content or copying repository credentials', async () => {
  const original = await records('.');
  const directory = await prepareExample('quine');
  try {
    const staged = await records(directory);
    const content = parseFiles(staged);
    expect(content.site.layout?.id).toBe('quine');
    expect(content.pages.map((page) => page.path)).toEqual(['/']);
    expect(content.pages[0].blocks).toHaveLength(5);
    expect(content.collections).toEqual([]);
    expect(validate(content, definitions)).toEqual([]);
    expect(parseFiles(filesFor(content))).toEqual(content);
    for (const media of content.media)
      await stat(join(directory, 'public', media.original.url));
    expect(await readFile(join(directory, '.env'), 'utf8')).toBe(
      'ADMIN_EMAIL=quine@example.test\nADMIN_PASSWORD=quine-preview\n',
    );
    expect(await records('.')).toEqual(original);
    const block = content.pages[0].blocks.find(
      (block) => block.type === 'quine-works',
    )!;
    const context = contextFor(content, block.id);
    const html = renderToStaticMarkup(
      createElement(Works, { props: block.props, context }),
    );
    expect(html).toContain('Flanksource Website');
    expect(html).toContain('/quine/v1/flanksource.png');
    expect(html).toContain('role="tablist"');
    const empty = renderToStaticMarkup(
      createElement(Works, {
        props: { projects: [] },
        context: { ...context, preview: true },
      }),
    );
    expect(empty).toContain('Add projects to this block');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
