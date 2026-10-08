import { describe, it, expect } from 'vitest';
import { fixture } from './support/fixture';
import {
  compatible,
  filesFor,
  parseFiles,
  resolveLink,
  safeURL,
  schemaChanges,
  serialize,
  switchVersion,
  validate,
} from '../src/core/content';
import { markdown } from '../src/core/markdown';
import { definitions } from '../src/generated/definitions';
import { siteStyle } from '../src/core/site-style';

describe('content contract', () => {
  it('round trips site width, supports older sites and rejects invalid widths', () => {
    const c = fixture();
    c.site.globals.contentMaxWidth = 880;
    expect(parseFiles(filesFor(c)).site.globals.contentMaxWidth).toBe(880);
    expect(siteStyle(c.site.globals)).toMatchObject({
      '--site-content-max-width': '880px',
    });
    for (const invalid of [0, -20, '900px', Infinity]) {
      c.site.globals.contentMaxWidth = invalid;
      expect(validate(c, definitions)).toContainEqual(
        expect.objectContaining({
          path: 'site.globals.contentMaxWidth',
          phase: 'structure',
        }),
      );
      expect(siteStyle(c.site.globals)['--site-content-max-width']).toBe(
        '1200px',
      );
    }
    c.site.globals.contentMaxWidth = null;
    expect(validate(c, definitions)).toEqual([]);
    delete c.site.globals.contentMaxWidth;
    expect(validate(c, definitions)).toEqual([]);
    expect(siteStyle(c.site.globals)['--site-content-max-width']).toBe(
      '1200px',
    );
  });
  it('round trips site typography and gutter, with safe defaults for older or invalid records', () => {
    const c = fixture();
    c.site.globals = {
      bodyFont: 'arial',
      headingFont: 'georgia',
      bodyFontSize: 18.5,
      bodyLineHeight: 1.8,
      pageGutter: 0,
    };
    expect(validate(c, definitions)).toEqual([]);
    expect(parseFiles(filesFor(c)).site.globals).toEqual(c.site.globals);
    expect(siteStyle(c.site.globals)).toMatchObject({
      '--site-body-font': 'Arial, Helvetica, sans-serif',
      '--site-heading-font': 'Georgia, serif',
      '--site-body-font-size': '18.5px',
      '--site-body-line-height': '1.8',
      '--site-page-gutter': '0px',
    });
    const defaults = siteStyle({});
    expect(defaults).toMatchObject({
      '--site-body-font-size': '16px',
      '--site-body-line-height': '1.6',
      '--site-page-gutter': '24px',
    });
    const invalid: Record<string, unknown[]> = {
      bodyFont: ['url(https://example.com/font)', 'unknown', 12, {}],
      headingFont: ['', false, []],
      bodyFontSize: [0, -1, '16px', Infinity],
      bodyLineHeight: [0, -1, '1.6', NaN],
      pageGutter: [-1, '24px', Infinity],
    };
    for (const [key, values] of Object.entries(invalid)) {
      for (const value of values) {
        c.site.globals = { [key]: value } as typeof c.site.globals;
        expect(validate(c, definitions)).toContainEqual(
          expect.objectContaining({
            path: `site.globals.${key}`,
            phase: 'structure',
          }),
        );
        expect(siteStyle(c.site.globals)).toEqual(defaults);
      }
      c.site.globals = { [key]: null };
      expect(validate(c, definitions)).toEqual([]);
      expect(siteStyle(c.site.globals)).toEqual(defaults);
    }
  });
  it('round trips ID-based files deterministically', () => {
    const c = fixture();
    expect(validate(c, definitions)).toEqual([]);
    expect(filesFor(parseFiles(filesFor(c)))).toEqual(filesFor(c));
    expect(serialize({ b: 1, a: 2 })).toBe(serialize({ a: 2, b: 1 }));
  });
  it('renames paths without changing record files or internal references', () => {
    const c = fixture();
    const paths = Object.keys(filesFor(c));
    c.pages[0].path = '/renamed';
    expect(Object.keys(filesFor(c))).toEqual(paths);
    expect(resolveLink(c, { kind: 'page', id: c.pages[0].id })).toBe(
      '/renamed',
    );
  });
  it('retains deprecated versions and switches without defaulting unmatched fields', () => {
    const c = fixture(),
      b = c.pages[0].blocks[0];
    const v1 = definitions.find((d) => d.type === 'hero' && d.version === 1)!,
      v2 = definitions.find((d) => d.type === 'hero' && d.version === 2)!;
    const old = switchVersion(b, v2, v1);
    expect(old.props.title).toBe(b.props.title);
    const next = switchVersion(old, v1, v2);
    expect(next.props.eyebrow).toBeNull();
    expect(next.props.align).toBeNull();
    expect(next.props.presentation).toBeNull();
    expect(b.version).toBe(2);
    c.pages[0].blocks[0] = old;
    expect(validate(c, definitions)).toEqual([]);
  });
  it('keeps incomplete drafts structurally valid and blocks publishing', () => {
    const c = fixture();
    c.pages[0].blocks[0].props.title = '';
    const issues = validate(c, definitions);
    expect(issues.some((i) => i.phase === 'publish')).toBe(true);
    expect(issues.some((i) => i.phase === 'structure')).toBe(false);
  });
  it('preserves missing block data but rejects publication', () => {
    const c = fixture();
    c.pages[0].blocks[0].version = 900;
    const before = serialize(c);
    expect(validate(c, definitions)[0].phase).toBe('publish');
    expect(serialize(c)).toBe(before);
  });
  it('rejects duplicate IDs, routes, reserved paths, and missing media', () => {
    const c = fixture();
    c.pages.push({ ...c.pages[0], id: 'page_other' });
    expect(
      validate(c, definitions).some((i) =>
        i.message.includes('URL is already'),
      ),
    ).toBe(true);
    c.pages[1].path = '/admin';
    expect(
      validate(c, definitions).some((i) => i.message.includes('public path')),
    ).toBe(true);
    c.pages[1].id = c.pages[0].id;
    expect(
      validate(c, definitions).some((i) =>
        i.message.includes('Duplicate record'),
      ),
    ).toBe(true);
  });
  it('handles malformed dates and collection fields without exceptions', () => {
    expect(
      compatible({ type: 'date', key: 'd', label: 'Date' }, '9999-99-99'),
    ).toBe(false);
    const c = fixture();
    (c.collections[0].fields as any) = [null];
    expect(() => validate(c, definitions)).not.toThrow();
    expect(validate(c, definitions).some((i) => i.phase === 'structure')).toBe(
      true,
    );
  });
  it('protects populated collection field types and keys', () => {
    const c = fixture(),
      next = structuredClone(c);
    next.collections[0].fields[0] = {
      key: 'title',
      label: 'Title',
      type: 'number',
    };
    expect(schemaChanges(c, next).map((i) => i.path)).toEqual(
      c.entries.map((e) => `${e.id}.title`),
    );
    next.collections[0].fields[0] = {
      key: 'title',
      label: 'New label',
      type: 'text',
    };
    expect(schemaChanges(c, next)).toEqual([]);
  });
  it('validates custom fields through the shared pure registry', () => {
    const f = definitions
      .find((d) => d.type === 'hero' && d.version === 2)!
      .fields.find((f) => f.type === 'custom')!;
    expect(compatible(f, { accent: '#ffffff', inset: 80 })).toBe(true);
    expect(compatible(f, { accent: 'url(evil)', inset: 80 })).toBe(false);
  });
  it('escapes raw HTML and disallows executable link destinations', () => {
    expect(markdown('<script>alert(1)</script>')).not.toContain('<script>');
    expect(markdown('[bad](javascript:alert(1))')).not.toContain('href=');
    expect(safeURL('/\\evil.example')).toBe(false);
    expect(safeURL('//evil.example')).toBe(false);
    expect(safeURL('https://example.com')).toBe(true);
  });
  it('does not allow ID/file mismatches or arbitrary content paths', () => {
    const files = filesFor(fixture());
    files['content/pages/wrong.json'] = files['content/pages/page_home.json'];
    expect(() => parseFiles(files)).toThrow('ID does not match');
  });
});
