import { expect, it } from 'vitest';
import { fixture } from './content.test';
import {
  activeLayout,
  layoutChoices,
  layoutDefinitions,
  layoutGlobals,
  layoutTitle,
  layoutWhitelist,
  migrateSite,
  selectLayout,
} from '../src/core/layouts';
import { filesFor, parseFiles, validate } from '../src/core/content';
import { definitions } from '../src/generated/definitions';

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
    globals: { contentMaxWidth: 960, pageGutter: 0 },
    layout: {
      id: 'starter',
      version: 1,
      settings: {
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

it('limits future picker choices without invalidating an excluded active layout', () => {
  const c = migrateSite(fixture());
  const another = { ...layoutDefinitions[0], id: 'another' };
  const installed = [...layoutDefinitions, another];
  const allowed = layoutWhitelist(' another,another ', installed);
  expect(layoutChoices(allowed, installed).map((d) => d.id)).toEqual([
    'another',
  ]);
  expect(layoutChoices(undefined, installed)).toEqual(installed);
  expect(layoutWhitelist(undefined)).toBeUndefined();
  expect(activeLayout(c.site).id).toBe('starter');
  expect(layoutTitle(c.site)).toBeTruthy();
  expect(validate(c, definitions)).toEqual([]);
  expect(parseFiles(filesFor(c)).site.layout).toEqual(c.site.layout);
  expect(() => layoutWhitelist('')).toThrow('at least one');
  expect(() => layoutWhitelist('unknown')).toThrow('Unknown');
  c.site.layout!.version = 900;
  expect(validate(c, definitions)).toContainEqual(
    expect.objectContaining({ path: 'site.layout', phase: 'structure' }),
  );
});
