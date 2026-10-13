import { expect, it } from 'vitest';
import { fixture } from './support/fixture';
import { definitions } from '../src/generated/definitions';
import {
  contextFor,
  filesFor,
  parseFiles,
  validate,
} from '../src/core/content';
import {
  contentForPage,
  layoutDefinitions,
  layoutGlobals,
  layoutPages,
  migrateSite,
  pageLayout,
  removeLayout,
  selectLayout,
  setLayoutActive,
} from '../src/core/layouts';
import { incomingUsage } from '../src/core/schema';
import { describeUsage } from '../src/editor/usage';
import { publicRoutes } from '../src/core/routes';
import { checkDraft, checkPublication } from '../src/integrations/repository';
import type { Content, Snapshot } from '../src/core/types';

function twoLayouts() {
  const content = migrateSite(fixture());
  const second = structuredClone(content.site.layouts![0]);
  second.id = 'layout_alternate';
  second.name = 'Alternate';
  second.design.settings = structuredClone(
    layoutDefinitions.find((d) => d.id === 'starter')!.defaults,
  );
  second.design.settings.contentMaxWidth = 800;
  content.site.layouts!.push(second);
  return content;
}
const snapshot = (content: Content): Snapshot => ({
  content,
  files: filesFor(content),
  sourceFiles: {},
  blobs: {},
  sha: 'saved',
  treeSha: 'tree',
});

it('stores independent instances of the same design and renders each page with its own settings', () => {
  const content = twoLayouts();
  const page = content.pages[1];
  page.layoutId = 'layout_alternate';
  expect(pageLayout(content, page).name).toBe('Alternate');
  expect(
    layoutGlobals(contentForPage(content, page).site).contentMaxWidth,
  ).toBe(800);
  expect(contextFor(content, page.blocks[0].id).globals.contentMaxWidth).toBe(
    800,
  );
  expect(
    contextFor(content, content.pages[0].blocks[0].id).globals.contentMaxWidth,
  ).not.toBe(800);
  const chartr = layoutDefinitions.find((d) => d.id === 'chartr')!;
  const switched = selectLayout(content, chartr, 'layout_alternate');
  expect(switched.site.layouts![0]).toBe(content.site.layouts![0]);
  expect(switched.pages).toBe(content.pages);
  expect(pageLayout(switched, page).design.id).toBe('chartr');
  expect(parseFiles(filesFor(switched))).toEqual(switched);
  expect(validate(switched, definitions)).toEqual([]);
});

it('counts generic pages without entries and all their routes inherit their assigned layout', () => {
  const content = twoLayouts();
  const generic = content.pages.find((page) => page.kind === 'generic')!;
  generic.layoutId = 'layout_alternate';
  const routes = publicRoutes(content).filter(
    (route) => route.page.id === generic.id,
  );
  expect(routes.length).toBeGreaterThan(0);
  expect(
    routes.every(
      (route) => pageLayout(content, route.page).id === 'layout_alternate',
    ),
  ).toBe(true);
  content.entries = [];
  expect(layoutPages(content, 'layout_alternate')).toEqual([generic]);
  expect(() => setLayoutActive(content, 'layout_alternate', false)).toThrow(
    'Reassign',
  );
  expect(() => removeLayout(content, 'layout_alternate')).toThrow('Reassign');
  expect(
    describeUsage(content, incomingUsage(content).get('layout_alternate')![0]),
  ).toEqual({
    title: generic.title,
    location: 'Pages › Site layout',
    target: { area: 'pages', id: generic.id },
  });
});

it('allows unused instances to be deactivated, reactivated and deleted but always keeps an active instance', () => {
  const content = twoLayouts();
  const first = content.site.layouts![0].id;
  expect(() => removeLayout(content, first)).toThrow('Reassign');
  const inactive = setLayoutActive(content, 'layout_alternate', false);
  expect(inactive.site.layouts![1].active).toBe(false);
  expect(content.site.layouts![1].active).toBe(true);
  expect(validate(inactive, definitions)).toEqual([]);
  expect(
    setLayoutActive(inactive, 'layout_alternate', true).site.layouts![1].active,
  ).toBe(true);
  const empty = { ...inactive, pages: [] };
  expect(() => setLayoutActive(empty, first, false)).toThrow('At least one');
  expect(() => removeLayout(empty, first)).toThrow('At least one');
  expect(removeLayout(empty, 'layout_alternate').site.layouts).toHaveLength(1);
});

it.each([true, false])(
  'lets an unused active=%s layout stay incomplete but validates its structure',
  (active) => {
    const content = twoLayouts();
    const spare = content.site.layouts![1];
    spare.active = active;
    spare.design.settings.title = '';
    expect(() => checkDraft(content, definitions)).not.toThrow();
    expect(() =>
      checkPublication(snapshot(content), definitions, {}),
    ).not.toThrow();
    spare.design.settings.pageGutter = -1;
    expect(() => checkDraft(content, definitions)).toThrow('Page gutter');
    delete spare.design.settings.pageGutter;
    spare.active = true;
    content.pages[0].layoutId = spare.id;
    expect(() => checkDraft(content, definitions)).not.toThrow();
    expect(() => checkPublication(snapshot(content), definitions, {})).toThrow(
      'Site title',
    );
  },
);

it.each([
  'missing',
  'inactive',
  'unassigned',
  'no-active',
  'duplicate',
  'uninstalled',
])(
  'rejects %s layout state from draft/import/publication boundaries',
  (problem) => {
    const content = twoLayouts();
    if (problem === 'missing') content.pages[0].layoutId = 'missing';
    if (problem === 'inactive') {
      content.pages[0].layoutId = 'layout_alternate';
      content.site.layouts![1].active = false;
    }
    if (problem === 'unassigned') delete content.pages[0].layoutId;
    if (problem === 'no-active')
      content.site.layouts!.forEach((layout) => (layout.active = false));
    if (problem === 'duplicate')
      content.site.layouts![1].id = content.site.layouts![0].id;
    if (problem === 'uninstalled')
      content.site.layouts![1].design.version = 900;
    const restored = parseFiles(filesFor(content));
    expect(() => checkDraft(restored, definitions)).toThrow();
    expect(() =>
      checkPublication(snapshot(restored), definitions, {}),
    ).toThrow();
  },
);

it('rejects persisting a render-only selection alongside canonical layout instances', () => {
  const content = twoLayouts();
  expect(() =>
    checkDraft(contentForPage(content, content.pages[0]), definitions),
  ).toThrow('site.layouts only');
});
