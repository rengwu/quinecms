import { describe, expect, it } from 'vitest';
import { fixture } from './support/fixture';
import { filesFor, parseFiles, validate } from '../src/core/content';
import { migrateSite } from '../src/core/layout-state';
import { publicRoutes } from '../src/core/routes';
import {
  applyView,
  copyIssues,
  localize,
  pruneCopies,
  recordView,
} from '../src/core/languages';
import { definitions as installed } from '../src/generated/definitions';
import type {
  Content,
  Definition,
  Entry,
  Field,
  Page,
} from '../src/core/types';

// Journal entries translate title, body and step names; everything else is shared.
const localizedKeys = new Set(['title', 'body', 'name', 'question', 'answer']);
const localize_ = (fields: Field[]): Field[] =>
  fields.map((f) =>
    f.type === 'array' && f.of.type === 'object' && f.of.fields
      ? { ...f, of: { ...f.of, fields: localize_(f.of.fields) } }
      : localizedKeys.has(f.key)
        ? { ...f, localized: true }
        : f,
  );
const definitions: Definition[] = installed.map((d) =>
  d.type === 'accordion' ? { ...d, fields: localize_(d.fields) } : d,
);
function site(): Content {
  const c = migrateSite(fixture());
  c.site.i18n = {
    enabled: true,
    main: 'en',
    languages: ['id'],
    missing: 'fallback',
  };
  const journal = c.collections[0];
  journal.fields = localize_([
    ...journal.fields,
    {
      key: 'steps',
      label: 'Steps',
      type: 'array',
      of: {
        type: 'object',
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'amount', label: 'Amount', type: 'text' },
        ],
      },
    },
  ]);
  for (const e of c.entries)
    e.values.steps = [{ _rowId: `row_${e.id}`, name: 'Plan', amount: '1' }];
  return c;
}
const entry = (c: Content, id = 'entry_essentials') =>
  c.entries.find((e) => e.id === id)!;
const home = (c: Content) => c.pages.find((p) => p.id === 'page_home')!;

describe('language copies', () => {
  it('edits a merged view and splits shared and localized values back', () => {
    const c = site();
    const e = entry(c);
    e.copies = { id: {} };
    const view = recordView(c, e, 'id', definitions);
    expect(view.values).toMatchObject({
      title: null,
      summary: 'Content that stays yours.',
      steps: [{ _rowId: 'row_entry_essentials', name: null, amount: '1' }],
    });
    view.values = {
      ...view.values,
      title: 'Simpan yang penting',
      summary: 'Shared summary',
      steps: [{ ...(view.values.steps as any)[0], name: 'Rencana' }],
    };
    const next = applyView(c, e, 'id', view, definitions);
    expect(next.values).toMatchObject({
      title: 'Keep the essentials',
      summary: 'Shared summary',
      steps: [{ _rowId: 'row_entry_essentials', name: 'Plan', amount: '1' }],
    });
    expect(next.copies).toEqual({
      id: {
        title: 'Simpan yang penting',
        steps: { row_entry_essentials: { name: 'Rencana' } },
      },
    });
    expect(parseFiles(filesFor({ ...c, entries: [next] })).entries[0]).toEqual(
      next,
    );
  });

  it('keeps alt text per language for a shared image', () => {
    const c = site();
    c.media.push({
      formatVersion: 1,
      id: 'media_cover',
      name: 'Cover',
      original: {
        key: 'cover',
        url: '/cover.jpg',
        mime: 'image/jpeg',
        bytes: 1,
      },
      variants: [],
    });
    const e = entry(c);
    e.values.image = { mediaId: 'media_cover', alt: 'A desk' };
    e.copies = { id: { image: { alt: 'Sebuah meja' } } };
    expect(recordView(c, e, 'id', definitions).values.image).toEqual({
      mediaId: 'media_cover',
      alt: 'Sebuah meja',
    });
    const view = recordView(c, e, 'id', definitions);
    view.values.image = { mediaId: 'media_cover', alt: 'Meja kayu' };
    const next = applyView(c, e, 'id', view, definitions);
    expect(next.values.image).toEqual({
      mediaId: 'media_cover',
      alt: 'A desk',
    });
    expect(next.copies!.id.image).toEqual({ alt: 'Meja kayu' });
  });

  it('serves eligible copies, falls back whole items and prefixes paths', () => {
    const c = site();
    entry(c).copies = {
      id: { title: 'Simpan yang penting', body: 'Isi', steps: {} },
    };
    const page = home(c);
    page.copies = {
      id: {
        title: 'Beranda',
        blocks: { block_3: { question: 'Bagaimana?', answer: 'Begini.' } },
      },
    };
    const visitor = localize(c, 'id', definitions);
    expect(
      visitor.content.pages.find((p) => p.id === 'page_home'),
    ).toMatchObject({
      title: 'Beranda',
      path: '/id',
    });
    // A missing required step name makes the copy ineligible: the whole entry falls back.
    const e = visitor.content.entries.find((e) => e.id === 'entry_essentials')!;
    expect(e.values.title).toBe('Keep the essentials');
    expect(visitor.fallback.has('entry_essentials')).toBe(true);
    expect(visitor.fallback.has('entry_slow')).toBe(true);
    expect(visitor.fallback.has('page_home')).toBe(false);
    expect(e).not.toHaveProperty('copies');
    expect(visitor.content.site).not.toHaveProperty('i18n');
    expect(publicRoutes(visitor.content).map((r) => r.path)).toContain(
      '/id/journal/keep-the-essentials',
    );
    // Draft mode shows the incomplete copy, blanks included.
    const draft = localize(c, 'id', definitions, 'draft');
    expect(
      draft.content.entries.find((e) => e.id === 'entry_essentials')!.values,
    ).toMatchObject({ title: 'Simpan yang penting', steps: [{ name: null }] });
    expect(copyIssues(c, 'id', definitions).get('entry_essentials')).toEqual([
      expect.objectContaining({ path: 'entry_essentials.steps.0.name' }),
    ]);
    // Completing the copy makes it eligible without any other state.
    entry(c).copies!.id.steps = { row_entry_essentials: { name: 'Rencana' } };
    const complete = localize(c, 'id', definitions);
    expect(complete.fallback.has('entry_essentials')).toBe(false);
    expect(
      complete.content.entries.find((e) => e.id === 'entry_essentials')!.values
        .steps,
    ).toEqual([
      { _rowId: 'row_entry_essentials', name: 'Rencana', amount: '1' },
    ]);
  });

  it('uses the main language unchanged', () => {
    const c = site();
    expect(localize(c, 'en', definitions).content).toBe(c);
  });

  it('blocks publication only under the strict policy', () => {
    const c = site();
    expect(validate(c, definitions)).toEqual([]);
    c.site.i18n!.missing = 'strict';
    const issues = validate(c, definitions);
    expect(issues).toContainEqual({
      path: 'entry_essentials',
      message: 'Indonesian copy is missing.',
      phase: 'publish',
    });
    expect(issues.every((i) => i.phase === 'publish')).toBe(true);
    entry(c).copies = { id: { title: 'Simpan', steps: {} } };
    expect(validate(c, definitions)).toContainEqual({
      path: 'entry_essentials.body',
      message: 'Indonesian: Body is required.',
      phase: 'publish',
    });
    // Turning i18n off ignores stored copies.
    c.site.i18n!.enabled = false;
    expect(validate(c, definitions)).toEqual([]);
  });

  it('rejects unknown copies, invalid settings and reserved paths', () => {
    const c = site();
    entry(c).copies = { fr: {} };
    expect(validate(c, definitions)).toContainEqual(
      expect.objectContaining({
        path: 'entry_essentials.copies',
        phase: 'structure',
      }),
    );
    delete entry(c).copies;
    c.site.i18n!.languages = ['en'];
    expect(validate(c, definitions)).toEqual([
      expect.objectContaining({ path: 'site.i18n', phase: 'structure' }),
    ]);
    c.site.i18n!.languages = ['id'];
    const steps = c.collections[0].fields.find((f) => f.key === 'steps')!;
    steps.localized = true;
    expect(validate(c, definitions)).toContainEqual(
      expect.objectContaining({
        path: 'collection_journal.steps',
        message: 'Only single-value fields can vary by language.',
      }),
    );
    delete steps.localized;
    c.pages.find((p) => p.id === 'page_blocks')!.path = '/id/blocks';
    expect(validate(c, definitions)).toContainEqual({
      path: 'page_blocks',
      message: 'This URL is reserved for Indonesian.',
      phase: 'publish',
    });
  });

  it('prunes copy values for removed rows and blocks', () => {
    const c = site();
    const e: Entry = {
      ...entry(c),
      copies: {
        id: {
          title: 'Simpan',
          steps: { row_entry_essentials: { name: 'Rencana' }, row_gone: {} },
        },
      },
    };
    e.values = { ...e.values, steps: [] };
    expect(pruneCopies(c, e, definitions).copies).toEqual({
      id: { title: 'Simpan' },
    });
    const page: Page = {
      ...home(c),
      copies: {
        id: {
          title: 'Beranda',
          blocks: {
            block_3: { question: 'Bagaimana?' },
            block_removed: { question: 'x' },
          },
        },
      },
    };
    expect(pruneCopies(c, page, definitions).copies).toEqual({
      id: { title: 'Beranda', blocks: { block_3: { question: 'Bagaimana?' } } },
    });
  });
});
