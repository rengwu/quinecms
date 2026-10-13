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

it('switches with fresh defaults, preserves every content record, and pins retained versions', () => {
  const c = migrateSite(fixture());
  c.site.layouts![0].design.settings.title = 'Personalized';
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
  expect(next.site.layouts![0].design.settings).not.toBe(v2.defaults);
  expect(selectLayout(next, v1).site.layouts![0].design.settings).toEqual(
    v1.defaults,
  );
  // Installing new code does not change the saved selection.
  expect(activeLayout(c.site).version).toBe(1);
  expect(selectLayout(c, v1).site.layouts![0].design.settings.title).toBe(
    'Personalized',
  );
});

it('rejects missing layout versions while retaining the saved selection', () => {
  const c = migrateSite(fixture());
  c.site.layouts![0].design.version = 900;
  expect(validate(c, definitions)).toContainEqual(
    expect.objectContaining({
      path: 'site.layouts[0].design.settings',
      phase: 'structure',
    }),
  );
  expect(parseFiles(filesFor(c)).site.layouts).toEqual(c.site.layouts);
});

it('owns spacing per layout, applies its defaults on switching and round-trips overrides', () => {
  const starter = layoutDefinitions.find((d) => d.id === 'starter')!;
  const chartr = layoutDefinitions.find((d) => d.id === 'chartr')!;
  const c = migrateSite(fixture());
  Object.assign(c.site.layouts![0].design.settings, {
    contentMaxWidth: 880,
    pageGutter: 0,
  });
  const next = selectLayout(c, chartr);
  expect(layoutGlobals(next.site)).toMatchObject({
    contentMaxWidth: 1512,
    pageGutter: 40,
  });
  Object.assign(next.site.layouts![0].design.settings, {
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
  expect(c.site.layouts![0].design.settings).toMatchObject({
    contentMaxWidth: 880,
    pageGutter: 0,
  });
});

it('validates layout spacing and uses that layout defaults for empty or invalid overrides', () => {
  for (const definition of layoutDefinitions) {
    const c = selectLayout(migrateSite(fixture()), definition);
    const settings = c.site.layouts![0].design.settings;
    const fallback = siteStyle(definition.defaults);
    for (const [key, values] of Object.entries({
      contentMaxWidth: [0, -1, '900px', Infinity],
      pageGutter: [-1, '24px', Infinity],
    })) {
      for (const value of values) {
        settings[key] = value;
        expect(validate(c, definitions)).toContainEqual(
          expect.objectContaining({
            path: `site.layouts[0].design.settings.${key}`,
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
