import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { definitions } from '../src/generated/definitions';
import { renderers } from '../src/generated/browser';
import {
  compatible,
  contextFor,
  filesFor,
  newBlock,
  parseFiles,
  schemaChanges,
  validate,
} from '../src/core/content';
import { bindingCompatible, resolveBlock } from '../src/core/bindings';
import { catalogDefinitions, filterCatalog } from '../src/editor/catalog';
import { headerValues } from '../src/core/header';
import Header from '../src/site/Header';
import type { Field, Values } from '../src/core/types';
function fixture() {
  const files: Record<string, string> = {};
  function walk(dir: string) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (p.endsWith('.json')) files[p] = readFileSync(p, 'utf8');
    }
  }
  walk('content');
  return parseFiles(files);
}
const added = definitions.filter((d) => d.theme === 'Tailwind UI');
const definition = (type: string) => definitions.find((d) => d.type === type)!;
const list: Field = {
  key: 'faqs',
  label: 'FAQs',
  type: 'list',
  fields: [
    { key: 'question', label: 'Question', type: 'text', required: true },
    { key: 'answer', label: 'Answer', type: 'richtext', required: true },
  ],
};
it('registers three base variants for every category and filters kind, placement, version, themes and combined tags', () => {
  expect(added.filter((d) => d.kind === 'static')).toHaveLength(45);
  expect(added.filter((d) => d.kind === 'generic')).toHaveLength(27);
  for (const category of new Set(added.map((d) => d.type.split('-')[1])))
    expect(
      added.filter(
        (d) => d.type.split('-')[1] === category && d.kind === 'static',
      ),
    ).toHaveLength(3);
  const catalog = catalogDefinitions(definitions, 'static', 'page');
  expect(
    catalog.some(
      (d) => d.placement === 'footer' || d.kind === 'generic' || d.deprecated,
    ),
  ).toBe(false);
  expect(
    filterCatalog(catalog, 'split', 'Tailwind UI', ['hero', 'landing']).map(
      (d) => d.type,
    ),
  ).toEqual(['tw-hero-2']);
  expect(filterCatalog(catalog, 'not-a-block', '', [])).toEqual([]);
  expect(catalogDefinitions(definitions, 'static', 'footer')).toHaveLength(3);
});
it('renders every variant with defaults, empty optional content and long escaped content without provider or submission effects', async () => {
  const c = fixture();
  for (const d of added) {
    const loaded =
      await renderers[`${d.type}@${d.version}` as keyof typeof renderers]();
    if (!('default' in loaded)) throw Error('Expected React renderer');
    const Component = loaded.default;
    for (const props of [
      d.defaults,
      Object.fromEntries(
        d.fields.map((f) => [f.key, f.type === 'list' ? [] : null]),
      ),
      {
        ...d.defaults,
        heading: '<script>alert(1)</script>' + ' lengthy'.repeat(60),
      },
    ]) {
      const html = renderToStaticMarkup(
        createElement(Component as any, {
          props,
          context: { ...contextFor(c, 'sample'), preview: true },
        }),
      );
      expect(html, d.type).toContain('tw-block');
      expect(html).not.toContain('<script>alert');
      if (d.tags?.includes('form')) {
        expect(html).toContain('disabled=""');
        expect(html).not.toContain('action="https:');
      }
    }
    for (const field of d.fields)
      expect(
        compatible(field, d.defaults[field.key]),
        d.type + '.' + field.key,
      ).toBe(true);
  }
});
it('round trips stable list identities, rejects malformed values and protects populated child keys', () => {
  const c = fixture();
  const d = definition('tw-faq-1');
  const a = newBlock(d),
    b = newBlock(d);
  const rows = a.props.items as Values[];
  expect(rows[0]._rowId).not.toBe((b.props.items as Values[])[0]._rowId);
  a.props.items = [...rows].reverse();
  c.pages[0].blocks.push(a);
  expect(parseFiles(filesFor(c)).pages[0].blocks.at(-1)).toEqual(a);
  expect(
    compatible(list, [
      { question: 'Q', answer: 'A' },
      { question: 'Q2', answer: 'A2' },
    ]),
  ).toBe(true);
  expect(compatible(list, [{ question: 4 }])).toBe(false);
  expect(compatible(list, [{ _rowId: 'same' }, { _rowId: 'same' }])).toBe(
    false,
  );
  c.collections[0].fields.push(structuredClone(list));
  c.entries[0].values.faqs = [{ question: 'Q', answer: 'A' }];
  const next = structuredClone(c);
  (
    next.collections[0].fields.at(-1) as Extract<Field, { type: 'list' }>
  ).fields[0].key = 'renamed';
  expect(schemaChanges(c, next)).toContainEqual(
    expect.objectContaining({
      path: c.collections[0].id + '.faqs',
      phase: 'structure',
    }),
  );
  c.entries[0].values.faqs = [{ question: '', answer: 'A' }];
  expect(validate(c, definitions)).toContainEqual(
    expect.objectContaining({
      path: c.entries[0].id + '.faqs.0.question',
      phase: 'publish',
    }),
  );
  (c.collections[0].fields.at(-1) as any).fields = [{ ...list, default: [{}] }];
  expect(validate(c, definitions).some((i) => i.phase === 'structure')).toBe(
    true,
  );
  (c.collections[0].fields.at(-1) as any).fields = [null];
  expect(() => validate(c, definitions)).not.toThrow();
});
it('binds compatible schema lists with empty optional fallback and validates child types', () => {
  const d = definition('tw-faq-1-generic'),
    target = d.fields.find((f) => f.key === 'items')!;
  expect(bindingCompatible(list, target)).toBe(true);
  expect(
    bindingCompatible(
      {
        ...list,
        fields: [{ key: 'question', label: 'Question', type: 'number' }],
      },
      target,
    ),
  ).toBe(false);
  const b = { ...newBlock(d), bindings: { items: 'faqs' } };
  const values = {
    faqs: [{ question: 'Bound question', answer: 'Bound answer' }],
  };
  expect(resolveBlock(b, values).props.items).toEqual(values.faqs);
  expect(resolveBlock(b, { faqs: [] }).props.items).toEqual(b.props.items);
  const c = fixture();
  const page = c.pages.find((p) => p.kind === 'generic')!;
  page.blocks = [b];
  c.collections[0].fields.push(structuredClone(list));
  c.entries[0].values.faqs = values.faqs;
  expect(validate(c, definitions)).toEqual([]);
  c.entries[0].values.faqs = [{ question: 12, answer: 'A' }];
  expect(
    validate(c, definitions).some((i) => i.path.startsWith(c.entries[0].id)),
  ).toBe(true);
});
it('maps only selected collection fields into renderer context and rejects incompatible mappings', () => {
  const c = fixture();
  c.entries[0].values.summary = 'Visible';
  c.entries[0].values.internal = 'Not mapped';
  const b = newBlock(definition('tw-blog-1'));
  b.props = {
    ...b.props,
    collection: c.collections[0].id,
    titleField: c.collections[0].titleField,
    summaryField: 'summary',
  };
  c.pages[0].blocks.push(b);
  expect(contextFor(c, b.id).collections?.[0].entries[0].values).toEqual({
    title: c.entries[0].values.title,
    summary: 'Visible',
  });
  expect(
    contextFor(c, 'unrelated').collections?.[0].entries[0].values,
  ).toBeUndefined();
  b.props.imageField = 'summary';
  expect(validate(c, definitions)).toContainEqual(
    expect.objectContaining({
      phase: 'publish',
      path: c.pages[0].id + '.' + b.id + '.imageField',
    }),
  );
});
it('validates shared header/footer and preserves legacy navigation fallback', () => {
  const c = fixture();
  expect(headerValues(c).brand).toBe(c.site.title);
  c.site.header = {
    brand: 'New brand',
    items: [
      {
        label: 'Products',
        links: [{ label: 'Overview', url: '/products', group: 'Explore' }],
      },
    ],
  };
  c.site.footer = newBlock(definition('tw-footer-3'));
  expect(validate(c, definitions)).toEqual([]);
  expect(parseFiles(filesFor(c)).site).toEqual(c.site);
  const html = renderToStaticMarkup(createElement(Header, { content: c }));
  expect(html).toContain('Mobile main');
  expect(html).toContain('Explore');
  expect(html).toContain('/products');
  c.pages[0].blocks.push(c.site.footer);
  expect(
    validate(c, definitions).some((i) =>
      i.message.includes('belongs in the footer'),
    ),
  ).toBe(true);
  c.site.header.items = [{ label: 'Broken', links: [] }];
  expect(
    validate(c, definitions).some(
      (i) => i.path === 'site.header' && i.phase === 'publish',
    ),
  ).toBe(true);
});
it('requires a web destination to publish forms and produces native POST contracts with distinct control IDs', async () => {
  const c = fixture();
  const d = definition('tw-contact-1');
  const b = newBlock(d);
  c.pages[0].blocks.push(b);
  expect(
    validate(c, definitions).some(
      (i) => i.path.endsWith('.endpoint') && i.phase === 'publish',
    ),
  ).toBe(true);
  b.props.endpoint = 'mailto:example@example.com';
  expect(
    validate(c, definitions).some((i) => i.message.includes('HTTP or HTTPS')),
  ).toBe(true);
  b.props.endpoint = 'https://example.com/contact';
  expect(validate(c, definitions)).toEqual([]);
  const Component = (await renderers['tw-contact-1@1']()).default;
  const html = renderToStaticMarkup(
    createElement(
      'div',
      null,
      ...['a', 'b'].map((id) =>
        createElement(Component, {
          key: id,
          props: b.props,
          context: contextFor(c, id),
        }),
      ),
    ),
  );
  expect(html.match(/method="post"/g)).toHaveLength(2);
  expect(html).toContain('action="https://example.com/contact"');
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  expect(new Set(ids).size).toBe(ids.length);
  expect(html).toContain('name="email"');
  expect(html).toContain('name="message"');
});
