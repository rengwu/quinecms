import { expect, it } from 'vitest';
import { fixture } from './support/fixture';
import {
  parseFiles,
  validate,
  contextFor,
  resolveLink,
  filesFor,
  switchVersion,
} from '../src/core/content';
import { resolveBlock } from '../src/core/bindings';
import { publicRoutes } from '../src/core/routes';
import { definitions } from '../src/generated/definitions';
import type { Definition } from '../src/core/types';

it('generates only explicit static pages and assigned entry routes, never a template or automatic index', () => {
  const c = fixture();
  expect(publicRoutes(c).map((r) => r.path)).toContain(
    '/journal/a-slower-way-to-build',
  );
  expect(
    publicRoutes(c).some((r) => r.page.kind === 'generic' && !r.entry),
  ).toBe(false);
  c.pages = c.pages.filter((p) => p.path !== '/journal');
  expect(publicRoutes(c).map((r) => r.path)).not.toContain('/journal');
  c.collections[0].genericPageId = undefined;
  expect(publicRoutes(c).some((r) => r.entry)).toBe(false);
  expect(
    resolveLink(c, { kind: 'entry', id: c.entries[0].id }),
  ).toBeUndefined();
  expect(contextFor(c, 'list').collections?.[0].entries).toHaveLength(2);
  expect(contextFor(c, 'list').collections?.[0].entries[0].url).toBeUndefined();
});
it('accepts explicit collection indexes but rejects static/entry route collisions', () => {
  const c = fixture();
  expect(validate(c, definitions)).toEqual([]);
  c.pages.find((p) => p.path === '/journal')!.path =
    '/journal/' + c.entries[0].slug;
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('URL is already used'),
    ),
  ).toBe(true);
});
it('keeps binding failures draft-saveable even with no entries and checks every assigned schema', () => {
  const c = fixture(),
    page = c.pages.find((p) => p.kind === 'generic')!;
  const other = structuredClone(c.collections[0]);
  other.id = 'collection_other';
  other.name = 'Other';
  other.path = '/other';
  c.collections.push(other);
  expect(validate(c, definitions)).toEqual([]);
  other.fields = other.fields.filter((f) => f.key !== 'title');
  other.titleField = 'summary';
  const issues = validate(c, definitions);
  expect(issues.every((i) => i.phase === 'publish')).toBe(true);
  expect(issues.some((i) => i.message.includes('Other: binding "title"'))).toBe(
    true,
  );
  other.fields.push({ key: 'title', label: 'Title', type: 'number' });
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('incompatible field type'),
    ),
  ).toBe(true);
  c.collections.pop();
  page.blocks[0].bindings!.title = 'missing';
  page.blocks[0].props.title = 'Fallback cannot hide a broken binding';
  expect(
    validate(c, definitions).some((i) => i.message.includes('"missing"')),
  ).toBe(true);
  expect(filesFor(parseFiles(filesFor(c)))).toEqual(filesFor(c));
});
it('distinguishes empty optional values from false and zero, without mutating template props', () => {
  const block = {
    id: 'b',
    type: 'generic-test',
    version: 1,
    props: { text: 'Fallback', number: 42, toggle: true },
    bindings: { text: 'summary', number: 'count', toggle: 'enabled' },
  };
  expect(
    resolveBlock(block, { summary: '', count: 0, enabled: false }).props,
  ).toEqual({ text: 'Fallback', number: 0, toggle: false });
  expect(block.props.number).toBe(42);
  expect(resolveBlock({ ...block, props: {} }, {}).props).toEqual({
    text: null,
    number: null,
    toggle: null,
  });
  const c = fixture();
  for (const e of c.entries) {
    e.values.summary = '';
    e.values.image = null;
  }
  expect(validate(c, definitions)).toEqual([]);
});
it('restricts block catalogs, rejects entry block arrays, and rejects missing template assignments', () => {
  const c = fixture(),
    generic = c.pages.find((p) => p.kind === 'generic')!;
  expect(resolveLink(c, { kind: 'page', id: generic.id })).toBeUndefined();
  generic.blocks.push(structuredClone(c.pages[0].blocks[0]));
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('only available on static'),
    ),
  ).toBe(true);
  (c.entries[0] as any).blocks = [];
  expect(
    validate(c, definitions).some(
      (i) =>
        i.phase === 'structure' &&
        i.message.includes('Entries contain schema fields only'),
    ),
  ).toBe(true);
  delete (c.entries[0] as any).blocks;
  c.collections[0].genericPageId = c.pages[0].id;
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('Select an existing generic page'),
    ),
  ).toBe(true);
});
it('validates resolved target constraints and preserves only compatible bindings when switching versions', () => {
  const c = fixture(),
    page = c.pages.find((p) => p.kind === 'generic')!;
  c.collections[0].fields.push({
    key: 'count',
    label: 'Count',
    type: 'number',
  });
  c.entries[0].values.count = 100;
  const definition: Definition = {
    type: 'generic-count',
    version: 1,
    label: 'Count',
    kind: 'generic',
    framework: 'react',
    activation: 'never',
    component: 'Count.tsx',
    dependencies: {},
    defaults: {},
    fields: [{ key: 'value', label: 'Count', type: 'number', max: 10 }],
  };
  const block = {
    id: 'count',
    type: definition.type,
    version: 1,
    props: { value: 0 },
    bindings: { value: 'count' },
  };
  page.blocks.push(block);
  const issues = validate(c, [...definitions, definition]);
  expect(
    issues.some(
      (i) => i.phase === 'publish' && i.message.includes('incompatible value'),
    ),
  ).toBe(true);
  expect(issues.some((i) => i.phase === 'structure')).toBe(false);
  expect(
    switchVersion(block, definition, { ...definition, version: 2 }).bindings,
  ).toEqual({ value: 'count' });
  expect(
    switchVersion(block, definition, { ...definition, version: 2, fields: [] })
      .bindings,
  ).toEqual({});
});
it('rejects missing rich-text media only on publish and allows valid YouTube embeds', () => {
  const c = fixture();
  c.entries[0].values.body = '![Cover](media:missing)';
  expect(validate(c, definitions).every((i) => i.phase === 'publish')).toBe(
    true,
  );
  expect(validate(c, definitions).length).toBeGreaterThan(0);
  c.entries[0].values.body = '![Video](youtube:jNQXAC9IVRw)';
  expect(validate(c, definitions)).toEqual([]);
});
