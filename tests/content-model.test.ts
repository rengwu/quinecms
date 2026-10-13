import { expect, it } from 'vitest';
import { modelFixture, groupsTarget } from './support/content-model';
import {
  filesFor,
  parseFiles,
  validate,
  schemaChanges,
  compatible,
  resolveLink,
  contextFor,
} from '../src/core/content';
import { bindingValid, resolveBlock } from '../src/core/bindings';
import { fieldDefaults, normalizeLists } from '../src/core/lists';
import {
  incomingUsage,
  schemaIssues,
  definitionUses,
  resolvePath,
  fieldPaths,
} from '../src/core/schema';
import { publicRoutes } from '../src/core/routes';
import { definitions } from '../src/generated/definitions';
import type { Binding, Values, Block } from '../src/core/types';

it('persists named schemas and nested values through every Git JSON record', () => {
  const c = modelFixture();
  expect(validate(c, definitions)).toEqual([]);
  expect(filesFor(c)['content/objects/object_seo.json']).toContain('SEO');
  expect(parseFiles(filesFor(c))).toEqual(c);
  const restored = JSON.parse(JSON.stringify(c));
  expect(validate(restored, definitions)).toEqual([]);
  expect(restored.entries[0].values.groups).toEqual(c.entries[0].values.groups);
});
it('shares definitions, keeps owned values independent, and clones nested row identities', () => {
  const c = modelFixture(),
    col = c.collections[0];
  const shape = col.fields.find((f) => f.key === 'groups')!;
  const a = normalizeLists(shape, c.entries[0].values.groups, c) as Values[];
  const b = normalizeLists(shape, c.entries[0].values.groups, c) as Values[];
  expect(a[0]._rowId).not.toBe(b[0]._rowId);
  expect((a[0].rows as Values[])[0]._rowId).not.toBe(
    (b[0].rows as Values[])[0]._rowId,
  );
  (a[0].rows as Values[])[0].detail = { label: 'Changed' };
  expect(((b[0].rows as Values[])[0].detail as Values).label).toBe('Weight');
  const defaults = fieldDefaults(col.fields, c);
  expect(defaults.seo).toEqual({ title: null });
  expect(defaults.related).toEqual([]);
});
it('checks named and inline depth at each use and allows independent reuse', () => {
  const c = modelFixture();
  expect(schemaIssues(c)).toEqual([]);
  c.objects.push({
    formatVersion: 1,
    id: 'extra',
    name: 'Extra',
    fields: [
      { key: 'value', label: 'Value', type: 'object', objectId: 'object_seo' },
    ],
  });
  c.collections[0].fields.push({
    type: 'object',
    key: 'extra',
    label: 'Extra',
    objectId: 'extra',
  });
  expect(schemaIssues(c)).toEqual([]);
  const groups = c.collections[0].fields.find((f) => f.key === 'groups') as any;
  groups.of.fields[1].of.fields[0].fields.push({
    type: 'object',
    key: 'seo',
    label: 'SEO',
    objectId: 'object_seo',
  });
  expect(schemaIssues(c)).toContainEqual(
    expect.objectContaining({
      path: `${c.collections[0].id}.groups.rows.detail.seo`,
      message: expect.stringContaining('three owned'),
    }),
  );
});
it('rejects direct and indirect ownership recursion without rejecting reference cycles', () => {
  const c = modelFixture();
  expect(
    resolvePath(
      'mentor.mentor.name',
      { fields: c.collections[1].fields, values: c.entries.at(-2)!.values },
      c,
    )?.value,
  ).toBe('Ada');
  c.objects[0].fields.push({
    type: 'object',
    key: 'self',
    label: 'Self',
    objectId: 'object_seo',
  });
  expect(schemaIssues(c).some((i) => i.message.includes('Recursive'))).toBe(
    true,
  );
  c.objects[0].fields = [
    { type: 'object', key: 'other', label: 'Other', objectId: 'other' },
  ];
  c.objects.push({
    formatVersion: 1,
    id: 'other',
    name: 'Other',
    fields: [
      { type: 'object', key: 'seo', label: 'SEO', objectId: 'object_seo' },
    ],
  });
  expect(schemaIssues(c).some((i) => i.message.includes('Recursive'))).toBe(
    true,
  );
  expect(() => fieldPaths(c.collections[0].fields, c)).not.toThrow();
});
it('keeps reference drafts repairable and validates target membership and uniqueness', () => {
  const c = modelFixture(),
    field = c.collections[0].fields.find((f) => f.key === 'author')!;
  field.required = true;
  c.entries[0].values.author = null;
  expect(
    validate(c, definitions).filter((i) => i.phase === 'structure'),
  ).toEqual([]);
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('Author is required'),
    ),
  ).toBe(true);
  c.entries[0].values.author = 'missing';
  expect(
    validate(c, definitions).filter((i) => i.phase === 'structure'),
  ).toEqual([]);
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('target collection'),
    ),
  ).toBe(true);
  c.entries[0].values.author = c.entries[1].id;
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('target collection'),
    ),
  ).toBe(true);
  const related = c.collections[0].fields.find((f) => f.key === 'related')!;
  expect(compatible(related, [c.entries[1].id, c.entries[1].id], c)).toBe(
    false,
  );
});
it('indexes incoming references at every owned depth and prevents unsafe deletions', () => {
  const c = modelFixture();
  expect(
    incomingUsage(c)
      .get('author_ada')
      ?.some((use) =>
        use.path.includes('groups[group_1].rows[row_1].detail.owner'),
      ),
  ).toBe(true);
  const next = structuredClone(c);
  next.entries = next.entries.filter((e) => e.id !== 'author_ada');
  expect(
    schemaChanges(c, next).some((i) => i.message.includes('before deleting')),
  ).toBe(true);
  const removed = structuredClone(c);
  removed.objects = [];
  expect(
    schemaChanges(c, removed).some((i) =>
      i.message.includes('object definition'),
    ),
  ).toBe(true);
  expect(definitionUses(c, 'object_seo')).toHaveLength(1);
});
it('checks populated shared-object fields across collections and allows explicit value repair', () => {
  const c = modelFixture(),
    next = structuredClone(c);
  next.objects[0].fields = [];
  expect(schemaChanges(c, next)).toContainEqual(
    expect.objectContaining({ path: `${c.entries[0].id}.seo.title` }),
  );
  next.entries[0].values.seo = {};
  expect(schemaChanges(c, next)).toEqual([]);
});
it('resolves forward references and nested explicit projections in stored order', () => {
  const c = modelFixture(),
    col = c.collections[0],
    entry = c.entries[0];
  const mapping: Binding = {
    source: 'groups',
    fields: {
      title: 'name',
      items: { source: 'rows', fields: { text: 'detail.label' } },
    },
  };
  expect(
    bindingValid(mapping, groupsTarget, { fields: col.fields, values: {} }, c),
  ).toBe(true);
  const block: Block = {
    id: 'example',
    type: 'example',
    version: 1,
    props: {},
    bindings: {
      title: 'seo.title',
      author: 'author.name',
      items: mapping,
      people: {
        source: 'credits',
        fields: { name: 'person.name', role: 'role' },
      },
    },
  };
  const props = resolveBlock(block, entry.values, c, col.fields).props;
  expect(props.title).toBe('Search title');
  expect(props.author).toBe('Ada');
  expect(props.items).toEqual([
    {
      _rowId: 'group_1',
      title: 'Specifications',
      items: [{ _rowId: 'row_1', text: 'Weight' }],
    },
  ]);
  expect(props.people).toEqual([
    { _rowId: 'credit_1', name: 'Grace', role: 'Editor' },
  ]);
  entry.values.related = [c.entries[1].id, c.entries[0].id];
  block.bindings = {
    items: {
      source: 'related',
      fields: { title: 'title', author: 'author.name' },
    },
  };
  const projected = resolveBlock(block, entry.values, c, col.fields).props
    .items as Values[];
  expect(projected.map((row) => row.title)).toEqual([
    c.entries[1].values.title,
    entry.values.title,
  ]);
  c.entries.find((e) => e.id === 'author_ada')!.values.name = 'Ada edited';
  expect(
    (
      resolveBlock(block, entry.values, c, col.fields).props.items as Values[]
    )[1].author,
  ).toBe('Ada edited');
});
it('validates bindings even when source values are empty, with a bounded forward path', () => {
  const c = modelFixture(),
    col = c.collections[0];
  const page = c.pages.find((p) => p.id === col.genericPageId)!;
  page.blocks[0].bindings = { title: 'seo.missing' };
  delete c.entries[0].values.seo;
  expect(
    validate(c, definitions).some((i) => i.message.includes('seo.missing')),
  ).toBe(true);
  const path = Array(14).fill('mentor').join('.') + '.name';
  expect(
    resolvePath(path, { fields: c.collections[1].fields, values: {} }, c),
  ).toBeUndefined();
});
it('supports data-only targets, single-entry routes and path collision checks', () => {
  const c = modelFixture();
  expect(resolveLink(c, { kind: 'entry', id: 'author_ada' })).toBeUndefined();
  expect(publicRoutes(c).some((r) => r.entry?.id === 'author_ada')).toBe(false);
  const author = c.collections[1];
  author.mode = 'single';
  c.entries = c.entries.filter((e) => e.id !== 'author_grace');
  c.entries.find((e) => e.id === 'author_ada')!.values.mentor = null;
  c.entries[0].values.credits = [];
  c.pages.push({
    formatVersion: 1,
    id: 'profile_page',
    kind: 'generic',
    title: 'Profile',
    blocks: [],
  });
  author.genericPageId = 'profile_page';
  author.path = '/about';
  expect(validate(c, definitions)).toEqual([]);
  expect(resolveLink(c, { kind: 'entry', id: 'author_ada' })).toBe('/about');
  expect(publicRoutes(c).find((r) => r.entry?.id === 'author_ada')?.path).toBe(
    '/about',
  );
  author.path = '/';
  expect(
    validate(c, definitions).some((i) => i.message.includes('already used')),
  ).toBe(true);
  c.entries.push({
    formatVersion: 1,
    id: 'author_extra',
    collectionId: author.id,
    values: { name: 'Extra' },
  });
  expect(
    validate(c, definitions).some((i) => i.message.includes('exactly one')),
  ).toBe(true);
});
it('uses the same forward paths for collection card mappings', () => {
  const c = modelFixture();
  const index = c.pages.find((p) =>
    p.blocks.some((b) => b.props.collection === c.collections[0].id),
  )!;
  const block = index.blocks.find(
    (b) => b.props.collection === c.collections[0].id,
  )!;
  block.props.titleField = 'author.name';
  expect(
    contextFor(c, block.id).collections?.[0].entries[0].values?.['author.name'],
  ).toBe('Ada');
});
it('protects references and shared values held in schema defaults', () => {
  const c = modelFixture();
  c.collections[0].fields.find((f) => f.key === 'author')!.default =
    'author_ada';
  expect(
    incomingUsage(c)
      .get('author_ada')
      ?.some((use) => use.label.includes('default')),
  ).toBe(true);
  c.collections[0].fields.find((f) => f.key === 'seo')!.default = {
    title: 'Default search title',
  };
  c.entries[0].values.seo = {};
  const next = structuredClone(c);
  next.objects[0].fields = [];
  expect(
    schemaChanges(c, next).some((i) => i.path.includes('.default.seo.title')),
  ).toBe(true);
});
