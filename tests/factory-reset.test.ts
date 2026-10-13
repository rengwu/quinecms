import { expect, it } from 'vitest';
import {
  factoryReset,
  filesFor,
  parseFiles,
  validate,
} from '../src/core/content';
import {
  layoutDefinitions,
  migrateSite,
  selectLayout,
} from '../src/core/layouts';
import { checkDraft } from '../src/integrations/repository';
import { definitions } from '../src/generated/definitions';
import { modelFixture } from './support/content-model';

it.each(['legacy', 'starter', 'chartr'])(
  'resets %s content to an empty, savable Starter draft',
  (layout) => {
    let content = modelFixture();
    content.site.header = { brand: 'Old brand', items: [] };
    content.site.globals = { theme: 'dark', pageGutter: 90 };
    if (layout !== 'legacy') {
      content = selectLayout(
        migrateSite(content),
        layoutDefinitions.find((d) => d.id === layout)!,
      );
      content.site.layouts![0].design.settings.title = 'Customized site';
    }
    content.media.push({
      formatVersion: 1,
      id: 'media_test',
      name: 'Test',
      original: {
        key: 'media_test/original.pdf',
        url: 'https://media.example.com/test.pdf',
        mime: 'application/pdf',
        bytes: 10,
      },
      variants: [],
    });
    const before = structuredClone(content);
    const reset = factoryReset(content);
    const starter = layoutDefinitions.find(
      (d) => d.id === 'starter' && d.version === 1,
    )!;
    expect(reset).toEqual({
      site: {
        formatVersion: 1,
        id: content.site.id,
        globals: {},
        layouts: [
          {
            id: `layout_${content.site.id}`,
            name: 'Main layout',
            active: true,
            design: { id: 'starter', version: 1, settings: starter.defaults },
          },
        ],
      },
      pages: [],
      entries: [],
      collections: [],
      objects: [],
      media: [],
    });
    expect(content).toEqual(before);
    expect(() => checkDraft(reset, definitions, before)).not.toThrow();
    expect(validate(reset, definitions)).toEqual([
      { path: 'pages', message: 'Create a home page at /.', phase: 'publish' },
    ]);
    expect(Object.keys(filesFor(reset))).toEqual(['content/site.json']);
    expect(parseFiles(filesFor(reset))).toEqual(reset);
    const originalHeader = structuredClone(starter.defaults.header);
    const header = reset.site.layouts![0].design.settings.header as {
      items: { label: string }[];
    };
    header.items[0].label = 'Changed label';
    expect(starter.defaults.header).toEqual(originalHeader);
    (reset.site.layouts![0].design.settings.navigation as unknown[]).push({
      label: 'New link',
    });
    expect(starter.defaults.navigation).toEqual([]);
    expect(factoryReset(reset).site.layouts![0].design.settings).toEqual(
      starter.defaults,
    );
  },
);
