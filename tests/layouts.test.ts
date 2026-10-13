import { expect, it } from 'vitest';
import { fixture } from './support/fixture';
import {
  activeLayout,
  layoutDefinitions,
  layoutGlobals,
  layoutTitle,
  migrateSite,
  selectLayout,
} from '../src/core/layouts';
import { filesFor, parseFiles, validate } from '../src/core/content';
import { definitions } from '../src/generated/definitions';
import { contextFor } from '../src/core/content';
import { siteStyle } from '../src/core/site-style';

it('converts old Site Options losslessly and round-trips only the active settings', () => {
  const old = fixture();
  old.site.globals = {
    theme: 'dark',
    bodyFont: 'georgia',
    contentMaxWidth: 960,
    pageGutter: 0,
  };
  old.site.header = { brand: 'Legacy brand', items: [] };
  const before = structuredClone(old);
  const converted = migrateSite(old);
  expect(old).toEqual(before);
  expect(converted.site).toEqual({
    formatVersion: 1,
    id: old.site.id,
    globals: {},
    layout: {
      id: 'starter',
      version: 1,
      settings: {
        contentMaxWidth: 960,
        pageGutter: 0,
        title: old.site.title,
        navigation: old.site.navigation,
        theme: 'dark',
        bodyFont: 'georgia',
        header: old.site.header,
        ...(old.site.footer ? { footer: old.site.footer } : {}),
      },
    },
  });
  expect(layoutTitle(converted.site)).toBe(old.site.title);
  expect(layoutGlobals(converted.site)).toMatchObject(before.site.globals);
  expect(parseFiles(filesFor(converted))).toEqual(converted);
  expect(validate(converted, definitions)).toEqual([]);
});

it('switches with fresh defaults, preserves every content record, and pins retained versions', () => {
  const c = migrateSite(fixture());
  c.site.layout!.settings.title = 'Personalized';
  const v1 = layoutDefinitions.find((d) => d.id === 'starter')!;
  const v2 = {
    ...v1,
    version: 2,
    defaults: { title: 'Version two', arbitrary: { enabled: true } },
  };
  const next = selectLayout(c, v2);
  expect(next.pages).toBe(c.pages);
  expect(next.collections).toBe(c.collections);
  expect(next.entries).toBe(c.entries);
  expect(next.media).toBe(c.media);
  expect(next.site.globals).toEqual(c.site.globals);
  expect(activeLayout(next.site)).toEqual({
    id: 'starter',
    version: 2,
    settings: v2.defaults,
  });
  expect(next.site.layout!.settings).not.toBe(v2.defaults);
  expect(selectLayout(next, v1).site.layout!.settings).toEqual(v1.defaults);
  // Installing new code does not change the saved selection.
  expect(activeLayout(c.site).version).toBe(1);
  expect(selectLayout(c, v1).site.layout!.settings.title).toBe('Personalized');
});

it('rejects missing layout versions while retaining the saved selection', () => {
  const c = migrateSite(fixture());
  c.site.layout!.version = 900;
  expect(validate(c, definitions)).toContainEqual(
    expect.objectContaining({ path: 'site.layout', phase: 'structure' }),
  );
  expect(parseFiles(filesFor(c)).site.layout).toEqual(c.site.layout);
});

it('owns spacing per layout, applies its defaults on switching and round-trips overrides', () => {
  const starter = layoutDefinitions.find((d) => d.id === 'starter')!;
  const chartr = layoutDefinitions.find((d) => d.id === 'chartr')!;
  const c = migrateSite(fixture());
  Object.assign(c.site.layout!.settings, {
    contentMaxWidth: 880,
    pageGutter: 0,
  });
  const next = selectLayout(c, chartr);
  expect(layoutGlobals(next.site)).toMatchObject({
    contentMaxWidth: 1512,
    pageGutter: 40,
  });
  Object.assign(next.site.layout!.settings, {
    contentMaxWidth: 1024,
    pageGutter: 0,
  });
  const restored = parseFiles(filesFor(next));
  expect(contextFor(restored, 'test').globals).toMatchObject({
    contentMaxWidth: 1024,
    pageGutter: 0,
  });
  expect(selectLayout(restored, chartr)).toBe(restored);
  expect(layoutGlobals(selectLayout(restored, starter).site)).toMatchObject({
    contentMaxWidth: 1200,
    pageGutter: 0,
  });
  expect(c.site.layout!.settings).toMatchObject({
    contentMaxWidth: 880,
    pageGutter: 0,
  });
});

it('validates layout spacing and uses that layout defaults for empty or invalid overrides', () => {
  for (const definition of layoutDefinitions) {
    const c = selectLayout(migrateSite(fixture()), definition);
    const settings = c.site.layout!.settings;
    const fallback = siteStyle(definition.defaults);
    for (const [key, values] of Object.entries({
      contentMaxWidth: [0, -1, '900px', Infinity],
      pageGutter: [-1, '24px', Infinity],
    })) {
      for (const value of values) {
        settings[key] = value;
        expect(validate(c, definitions)).toContainEqual(
          expect.objectContaining({
            path: `site.layout.settings.${key}`,
            phase: 'structure',
          }),
        );
        const token =
          key === 'contentMaxWidth'
            ? '--site-content-max-width'
            : '--site-page-gutter';
        expect(siteStyle(layoutGlobals(c.site))[token]).toBe(fallback[token]);
      }
      settings[key] = null;
      expect(validate(c, definitions)).toEqual([]);
      delete settings[key];
      expect(validate(c, definitions)).toEqual([]);
    }
    expect(layoutGlobals(c.site)).toMatchObject({
      contentMaxWidth: definition.defaults.contentMaxWidth,
      pageGutter: definition.defaults.pageGutter,
    });
  }
});
