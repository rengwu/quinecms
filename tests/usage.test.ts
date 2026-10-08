import { expect, it } from 'vitest';
import { describeUsage } from '../src/editor/usage';
import { incomingUsage, definitionUses } from '../src/core/schema';
import { migrateSite } from '../src/core/layouts';
import { headerValues } from '../src/core/header';
import {
  starterContent,
  withHeader,
} from '../src/site-layouts/starter/v1/policy';
import { modelFixture } from './support/content-model';

it('names the navigation item and editor instead of exposing IDs and storage paths', () => {
  const content = migrateSite(modelFixture());
  const use = incomingUsage(content).get('page_home')![0];
  expect(describeUsage(content, use)).toEqual({
    title: 'Site Layout',
    location: 'Header › Navigation › Home',
    target: { area: 'layout' },
  });
});

it('resolves field labels, named objects and stable array rows to readable locations', () => {
  const content = modelFixture();
  const uses = incomingUsage(content).get('author_ada')!;
  const nested = uses.find((use) => use.path.includes('groups[group_1]'))!;
  const before = structuredClone(content);
  expect(describeUsage(content, nested)).toEqual({
    title: content.entries[0].values.title,
    location:
      'Content › Journal › Groups › Specifications › Rows › Item 1 › Detail › Owner',
    target: { area: 'content', id: content.entries[0].id },
  });
  expect(
    describeUsage(content, definitionUses(content, 'object_seo')[0]),
  ).toEqual({
    title: 'Journal',
    location: 'Schemas › Collections › SEO',
    target: { area: 'collections', id: content.collections[0].id },
  });
  expect(content).toEqual(before);
});

it('distinguishes schema defaults and routes block uses to their owning block', () => {
  const content = modelFixture();
  content.collections[0].fields.find(
    (field) => field.key === 'author',
  )!.default = 'author_ada';
  const use = incomingUsage(content)
    .get('author_ada')!
    .find((use) => use.path.includes('.default.'))!;
  expect(describeUsage(content, use)).toMatchObject({
    title: 'Journal',
    location: 'Schemas › Collections › Author › Default value',
  });
  const page = content.pages.find((p) => p.id === 'page_home')!;
  const block = page.blocks[0];
  expect(
    describeUsage(content, {
      ownerId: page.id,
      label: page.id,
      path: 'blocks[0].props.ctaLink',
    }),
  ).toMatchObject({
    title: 'Home',
    target: { area: 'pages', id: page.id, blockId: block.id },
  });
  expect(
    describeUsage(content, {
      ownerId: 'missing_record',
      label: 'missing_record',
      path: 'secret.field',
    }),
  ).toEqual({
    title: 'Unavailable content',
    location: 'Reference location unavailable',
  });
});

it('clears removed or changed inherited links while preserving unchanged links and their order', () => {
  const content = migrateSite(modelFixture());
  const settings = content.site.layout!.settings;
  const header = headerValues(starterContent(content, settings));
  const items = header.items as Record<string, any>[];
  const edited = {
    ...header,
    items: [items[2], { ...items[0], label: 'Start' }],
  };
  const next = withHeader(content, settings, edited);
  expect((next.navigation as any[]).map((n) => [n.id, n.label])).toEqual([
    ['nav_blocks', 'Blocks'],
    ['nav_home', 'Start'],
  ]);
  const retargeted = withHeader(content, next, {
    ...header,
    items: [{ ...items[0], url: '/elsewhere' }],
  });
  expect(retargeted.navigation).toEqual([]);
  expect(settings.navigation).toHaveLength(3);
});
