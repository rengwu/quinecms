import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseFiles } from '../../src/core/content';
import type { Field } from '../../src/core/types';
export function modelFixture() {
  const files: Record<string, string> = {};
  function walk(dir: string) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, f.name);
      if (f.isDirectory()) walk(path);
      else if (path.endsWith('.json')) files[path] = readFileSync(path, 'utf8');
    }
  }
  walk('content');
  const c = parseFiles(files);
  c.objects.push({
    formatVersion: 1,
    id: 'object_seo',
    name: 'SEO',
    fields: [{ key: 'title', label: 'SEO title', type: 'text' }],
  });
  c.collections.push({
    formatVersion: 1,
    id: 'authors',
    name: 'Authors',
    mode: 'many',
    titleField: 'name',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      {
        key: 'mentor',
        label: 'Mentor',
        type: 'reference',
        collectionId: 'authors',
      },
    ],
  });
  c.entries.push(
    {
      formatVersion: 1,
      id: 'author_ada',
      collectionId: 'authors',
      values: { name: 'Ada', mentor: 'author_grace' },
    },
    {
      formatVersion: 1,
      id: 'author_grace',
      collectionId: 'authors',
      values: { name: 'Grace', mentor: 'author_ada' },
    },
  );
  const articles = c.collections[0];
  articles.fields.push(
    { type: 'object', key: 'seo', label: 'SEO', objectId: 'object_seo' },
    {
      type: 'reference',
      key: 'author',
      label: 'Author',
      collectionId: 'authors',
    },
    {
      type: 'array',
      key: 'related',
      label: 'Related',
      of: { type: 'reference', collectionId: articles.id },
    },
    {
      type: 'array',
      key: 'credits',
      label: 'Credits',
      of: {
        type: 'object',
        fields: [
          {
            type: 'reference',
            key: 'person',
            label: 'Person',
            collectionId: 'authors',
          },
          { type: 'text', key: 'role', label: 'Role' },
        ],
      },
    },
    {
      type: 'array',
      key: 'groups',
      label: 'Groups',
      of: {
        type: 'object',
        fields: [
          { type: 'text', key: 'name', label: 'Group' },
          {
            type: 'array',
            key: 'rows',
            label: 'Rows',
            of: {
              type: 'object',
              fields: [
                {
                  type: 'object',
                  key: 'detail',
                  label: 'Detail',
                  fields: [
                    { type: 'text', key: 'label', label: 'Label' },
                    {
                      type: 'reference',
                      key: 'owner',
                      label: 'Owner',
                      collectionId: 'authors',
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  );
  c.entries[0].values = {
    ...c.entries[0].values,
    seo: { title: 'Search title' },
    author: 'author_ada',
    related: [c.entries[1].id],
    credits: [{ _rowId: 'credit_1', person: 'author_grace', role: 'Editor' }],
    groups: [
      {
        _rowId: 'group_1',
        name: 'Specifications',
        rows: [
          { _rowId: 'row_1', detail: { label: 'Weight', owner: 'author_ada' } },
        ],
      },
    ],
  };
  return c;
}
export const groupsTarget: Field = {
  type: 'list',
  key: 'items',
  label: 'Items',
  fields: [
    { type: 'text', key: 'title', label: 'Title' },
    {
      type: 'list',
      key: 'items',
      label: 'Rows',
      fields: [{ type: 'text', key: 'text', label: 'Text' }],
    },
  ],
};
