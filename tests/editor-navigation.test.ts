// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import { modelFixture } from './support/content-model';
import { entryPath } from '../src/core/routes';
import type { Block, Content } from '../src/core/types';
import { readRecovery, retain } from '../src/editor/recovery';
import { layoutDefinitions, selectLayout } from '../src/core/layouts';
import { adminThemeKey } from '../src/editor/AdminTheme';
import { repositoryKey } from '../src/integrations/git';
vi.mock('../src/editor/Island', () => ({
  default: ({ block }: { block: Block }) =>
    createElement('div', {
      'data-preview-island': block.id,
      'data-preview-props': JSON.stringify(block.props),
    }),
}));
const config = {
  owner: '',
  repo: '',
  branch: 'draft',
  encryptedAdmin: false,
  r2: { accountId: '', bucket: '', publicURL: '' },
};
const content: Content = {
  site: {
    formatVersion: 1,
    id: 'site',
    title: 'Site',
    globals: {},
    navigation: [
      {
        id: 'nav_entry',
        label: 'Read entry',
        to: { kind: 'entry', id: 'entry_one' },
      },
    ],
  },
  pages: [
    {
      formatVersion: 1,
      id: 'page_home',
      kind: 'static',
      title: 'Home',
      path: '/',
      blocks: [],
    },
  ],
  objects: [],
  collections: [
    {
      formatVersion: 1,
      id: 'collection_journal',
      name: 'Journal',
      mode: 'many',
      path: '/journal',
      titleField: 'title',
      fields: [{ key: 'title', label: 'Title', type: 'text', required: true }],
    },
  ],
  entries: [
    {
      formatVersion: 1,
      id: 'entry_one',
      collectionId: 'collection_journal',
      slug: 'one',
      values: { title: 'First entry' },
    },
  ],
  media: [],
};
let root: Root, host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  sessionStorage.clear();
  localStorage.removeItem(adminThemeKey);
  vi.restoreAllMocks();
});
async function mount(initial = content, allowedLayoutIds?: string[]) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      createElement(App, {
        initial: structuredClone(initial),
        config: { ...config, allowedLayoutIds },
      }),
    ),
  );
}
const editorPanel = () =>
  host.querySelector<HTMLElement>(
    '[aria-label="Site builder"], [aria-label="Admin workspace"]',
  )!;
function button(label: string, scope: Element = host) {
  const found = [...scope.querySelectorAll('button')].find(
    (el) => el.textContent?.trim() === label && !el.closest('[hidden]'),
  );
  expect(
    found,
    `button ${label}: ${[...scope.querySelectorAll('button')]
      .filter((b) => !b.closest('[hidden]'))
      .map((b) => b.textContent)
      .join(' | ')}`,
  ).toBeDefined();
  return found!;
}

it('opens layout navigation and footer items in dedicated levels, hiding all parent settings', async () => {
  const chartr = layoutDefinitions.find((d) => d.id === 'chartr')!;
  await mount(selectLayout(structuredClone(content), chartr));
  await click('Site Layout');
  await click('Workspace');
  const level = () =>
    editorPanel().querySelector<HTMLElement>(
      '[data-panel-level]:not([hidden])',
    )!;
  expect(level().querySelector('h2')?.textContent).toBe('Workspace');
  expect(level().querySelector('[aria-label="Label"]')).not.toBeNull();
  expect(level().querySelector('[aria-label="Source link label"]')).toBeNull();
  expect(
    editorPanel()
      .querySelector('[aria-label="Source link label"]')
      ?.closest('[hidden]'),
  ).not.toBeNull();
  await click('← Back', level());
  expect(level()).toBeNull();
  await click('GitHub');
  expect(level().textContent).toContain('Footer links');
  expect(level().querySelector('[aria-label="Copyright"]')).toBeNull();
  await click('← Back', level());
  expect(
    editorPanel()
      .querySelector('[aria-label="Copyright"]')
      ?.closest('[hidden]'),
  ).toBeNull();
  await click('Workspace');
  await click('Settings');
  expect(editorPanel().querySelector('[data-panel-level]')).toBeNull();
  expectAdminView();
});

it('focuses chartr mobile navigation and returns focus on Escape', async () => {
  const chartr = layoutDefinitions.find((d) => d.id === 'chartr')!;
  await mount(selectLayout(structuredClone(content), chartr));
  await click('Site Layout');
  const toggle = host.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
  await act(async () => toggle.click());
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  const firstLink = host.querySelector('nav.mobile-menu a')!;
  expect(document.activeElement).toBe(firstLink);
  await act(async () =>
    firstLink.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    ),
  );
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(toggle);
});

it('gives nested navigation items their own levels, returning one parent at a time', async () => {
  const initial = structuredClone(content);
  initial.site.header = {
    brand: 'Site',
    items: [
      {
        _rowId: 'group-one',
        label: 'Resources',
        links: [
          {
            _rowId: 'link-one',
            label: 'Documentation',
            url: '/docs',
            description: 'Manual',
          },
        ],
      },
    ],
  };
  await mount(initial);
  await click('Site Layout');
  await click('Resources');
  const level = () =>
    editorPanel().querySelector<HTMLElement>(
      '[data-panel-level]:not([hidden])',
    )!;
  expect(level().querySelector('h2')?.textContent).toBe('Resources');
  expect(
    editorPanel()
      .querySelector('[aria-label="Site title"]')
      ?.closest('[hidden]'),
  ).not.toBeNull();
  await click('Documentation');
  expect(level().querySelector('h2')?.textContent).toBe('Documentation');
  expect(
    editorPanel().querySelector('[aria-label="Label"]')?.closest('[hidden]'),
  ).not.toBeNull();
  await input('Description', 'Updated manual');
  await click('← Back', level());
  expect(level().querySelector('h2')?.textContent).toBe('Resources');
  expect(level().textContent).toContain('Documentation');
  await click('← Back', level());
  expect(level()).toBeNull();
  expect(
    editorPanel()
      .querySelector('[aria-label="Site title"]')
      ?.closest('[hidden]'),
  ).toBeNull();
  expect(
    (readRecovery()!.content.site.layout!.settings.header as any).items[0]
      .links[0].description,
  ).toBe('Updated manual');
});
async function click(label: string, scope?: Element) {
  await act(async () => {
    button(label, scope).click();
  });
  await act(async () => {
    await vi.dynamicImportSettled();
  });
}
async function chooseOption(label: string, option: string) {
  await act(async () =>
    editorPanel()
      .querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!
      .click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((o) => o.textContent === option)!
      .click(),
  );
}
function expectCreation(label: string) {
  const buttons = [...editorPanel().querySelectorAll('button')]
    .filter((b) => !b.closest('[hidden]'))
    .map((b) => b.textContent?.trim());
  expect(buttons).toContain(`Create ${label}`);
  expect(buttons).toContain('Cancel');
  expect(buttons).not.toContain('← Back');
  expect(buttons.some((t) => /^(Delete|Remove|Clear) /.test(t ?? ''))).toBe(
    false,
  );
}
async function input(label: string, value: string) {
  const el = editorPanel().querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  expect(el).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function openEntry() {
  await click('Content');
  expectAdminView();
  await click('Journal');
  expectAdminView();
  await click('First entryData only');
}

function expectAdminView() {
  expect(
    host.querySelector('main[aria-label="Admin workspace"]'),
  ).not.toBeNull();
  expect(host.querySelector('aside[aria-label="Site builder"]')).toBeNull();
  expect(
    host.querySelector('aside[aria-label="Main navigation"]'),
  ).not.toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  expect(host.querySelector('[aria-label="Toggle preview width"]')).toBeNull();
  expect(host.querySelector('[data-preview-island]')).toBeNull();
}

it('persists the admin theme across navigation and reload without changing site content or preview theme', async () => {
  await mount();
  const adminSurfaces = () => [...host.querySelectorAll('.kumo-ui')];
  expect(
    adminSurfaces().every((el) => el.getAttribute('data-mode') === 'dark'),
  ).toBe(true);
  await click('Settings');
  const snapshot = structuredClone(readRecovery()!.content);
  const saveWasDisabled = button('Save draft').disabled;
  const toggle = () =>
    editorPanel().querySelector<HTMLButtonElement>('[role="switch"]')!;
  expect(toggle().getAttribute('aria-checked')).toBe('true');
  await act(async () => toggle().click());
  expect(toggle().getAttribute('aria-checked')).toBe('false');
  expect(localStorage.getItem(adminThemeKey)).toBe('light');
  expect(
    adminSurfaces().every((el) => el.getAttribute('data-mode') === 'light'),
  ).toBe(true);
  expect(readRecovery()!.content).toEqual(snapshot);
  expect(button('Save draft').disabled).toBe(saveWasDisabled);

  await click('Connection');
  expect(
    host
      .querySelector('[role="dialog"]')!
      .closest('[data-mode]')
      ?.getAttribute('data-mode'),
  ).toBe('light');
  await click('Close');
  await click('Pages');
  expect(
    host.querySelector('main[aria-label="Pages"]')?.getAttribute('data-mode'),
  ).toBe('light');
  await click('Home');
  const preview = host.querySelector('[aria-label="Live preview"]')!;
  expect(preview.closest('.kumo-ui, [data-mode]')).toBeNull();
  expect(
    preview.querySelector('.starter-layout')?.getAttribute('data-theme'),
  ).toBe('light');
  expect(readRecovery()!.content).toEqual(snapshot);

  await act(async () => root.unmount());
  host.remove();
  await mount();
  expect(
    adminSurfaces().every((el) => el.getAttribute('data-mode') === 'light'),
  ).toBe(true);
  await click('Settings');
  await act(async () => toggle().click());
  expect(localStorage.getItem(adminThemeKey)).toBe('dark');
  expect(
    adminSurfaces().every((el) => el.getAttribute('data-mode') === 'dark'),
  ).toBe(true);
});

it('falls back from an invalid admin preference and can toggle when persistence is blocked', async () => {
  localStorage.setItem(adminThemeKey, 'invalid');
  await mount();
  await click('Settings');
  const toggle =
    editorPanel().querySelector<HTMLButtonElement>('[role="switch"]')!;
  expect(toggle.getAttribute('aria-checked')).toBe('true');
  const setItem = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key === adminThemeKey) throw new Error('Storage unavailable');
    setItem.call(this, key, value);
  });
  await act(async () => toggle.click());
  expect(toggle.getAttribute('aria-checked')).toBe('false');
  expect(host.querySelector('header')?.getAttribute('data-mode')).toBe('light');
});

it('preserves site width across navigation and scopes it to the live preview', async () => {
  await mount();
  await click('Settings');
  expect(
    editorPanel().querySelector('[aria-label="Content max-width"]'),
  ).toBeNull();
  expect(editorPanel().querySelector('[aria-label="Page gutter"]')).toBeNull();
  await click('Site Layout');
  await input('Content max-width', '880');
  expect(readRecovery()?.content.site.layout?.settings.contentMaxWidth).toBe(
    880,
  );
  await click('Pages');
  await click('Home');
  const preview = () =>
    host.querySelector<HTMLElement>(
      '[aria-label="Live preview"] .starter-layout',
    )!;
  expect(preview().style.getPropertyValue('--site-content-max-width')).toBe(
    '880px',
  );
  expect(
    host
      .querySelector<HTMLElement>('aside')!
      .style.getPropertyValue('--site-content-max-width'),
  ).toBe('');
  await click('Site Layout');
  expect(
    editorPanel().querySelector<HTMLInputElement>(
      '[aria-label="Content max-width"]',
    )!.value,
  ).toBe('880');
  await input('Content max-width', '');
  await click('Pages');
  await click('Home');
  expect(preview().style.getPropertyValue('--site-content-max-width')).toBe(
    '1200px',
  );
});

it('edits site fonts, size, line height and gutter together, recovers them and clears numeric overrides', async () => {
  await mount();
  await click('Site Layout');
  for (const [label, choice] of [
    ['Body font', 'Arial'],
    ['Heading font', 'Georgia'],
  ]) {
    const trigger = editorPanel().querySelector<HTMLButtonElement>(
      `[aria-label="${label}"]`,
    )!;
    await act(async () => trigger.click());
    const popup = document.getElementById(
      trigger.getAttribute('aria-controls')!,
    );
    expect(popup).not.toBeNull();
    await act(async () =>
      [...popup!.querySelectorAll<HTMLElement>('[role="option"]')]
        .find((option) => option.textContent === choice)!
        .click(),
    );
  }
  await input('Body font size', '18');
  await input('Body line height', '1.8');
  await input('Page gutter', '40');
  expect(readRecovery()?.content.site.layout?.settings.pageGutter).toBe(40);
  expect(readRecovery()?.content.site.layout?.settings).toMatchObject({
    bodyFont: 'arial',
    headingFont: 'georgia',
    bodyFontSize: 18,
    bodyLineHeight: 1.8,
  });
  // A remount exercises actual tab recovery rather than passing edited initial props.
  await act(async () => root.unmount());
  host.remove();
  await mount();
  await click('Pages');
  await click('Home');
  const preview = () =>
    host.querySelector<HTMLElement>(
      '[aria-label="Live preview"] .starter-layout',
    )!;
  expect(preview().classList.contains('site-surface')).toBe(true);
  const expected = {
    '--site-body-font': 'Arial, Helvetica, sans-serif',
    '--site-heading-font': 'Georgia, serif',
    '--site-body-font-size': '18px',
    '--site-body-line-height': '1.8',
    '--site-page-gutter': '40px',
  };
  for (const [key, value] of Object.entries(expected)) {
    expect(preview().style.getPropertyValue(key)).toBe(value);
    expect(editorPanel().style.getPropertyValue(key)).toBe('');
    expect(
      host
        .querySelector('aside[aria-label="Main navigation"]')
        ?.closest('.site-surface'),
    ).toBeNull();
  }
  await click('Site Layout');
  expect(
    editorPanel().querySelector('[aria-label="Body font"]')?.textContent,
  ).toContain('Arial');
  expect(
    editorPanel().querySelector('[aria-label="Heading font"]')?.textContent,
  ).toContain('Georgia');
  await input('Body font size', '');
  await input('Body line height', '');
  await input('Page gutter', '');
  await click('Pages');
  await click('Home');
  expect(preview().style.getPropertyValue('--site-body-font-size')).toBe(
    '16px',
  );
  expect(preview().style.getPropertyValue('--site-body-line-height')).toBe(
    '1.6',
  );
  expect(preview().style.getPropertyValue('--site-page-gutter')).toBe('0px');
});

it('keeps field-only entry authoring in Content and restores each parent', async () => {
  await mount();
  await openEntry();
  expectAdminView();
  expect(editorPanel().querySelector('[aria-label="Editor areas"]')).toBeNull();
  expect(editorPanel().querySelector('[aria-label="Page"]')).toBeNull();
  expect(editorPanel().querySelector('[aria-label="Field key"]')).toBeNull();
  await input('Title', 'Edited entry');
  expect(host.querySelector('main')?.textContent).toContain('Edited entry');
  expect(editorPanel().textContent).not.toContain('Add block');
  expect(editorPanel().querySelector('[aria-label="Blocks"]')).toBeNull();
  await click('← Back');
  expect(editorPanel().textContent).toContain('Edited entryData only');
  expect(editorPanel().querySelector('[aria-label="Label"]')).toBeNull();
  await click('← Back');
  await click('Pages');
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('table[aria-label="Pages"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Title"]')).toBeNull();
  expect(host.querySelector('table')?.textContent).not.toContain(
    'Edited entry',
  );
  expect(button('Save draft', host).disabled).toBe(false);
  expect(readRecovery()?.content.entries[0].values.title).toBe('Edited entry');
});

it('edits schemas and defaults separately, protects populated fields, and uses defaults for new entries', async () => {
  await mount();
  await click('Schemas');
  await click('Collections');
  expectAdminView();
  await click('Journal · 1 fields');
  expectAdminView();
  expect(editorPanel().textContent).not.toContain('Add entry');
  expect(editorPanel().querySelector('[aria-label="Title"]')).toBeNull();
  await click('Titletext · Required');
  expectAdminView();
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Field key"]')
      ?.disabled,
  ).toBe(true);
  expect(button('Remove field').disabled).toBe(true);
  await input('Label', 'Heading');
  await click('← Back');
  await click('Add field');
  await input('Label', 'Summary');
  await click('Edit default value');
  await input('Summary', 'Default summary');
  await click('← Back');
  await click('Create field');
  await click('← Back');
  await click('Content');
  await click('Journal');
  await click('Add entry');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Summary"]')
      ?.value,
  ).toBe('Default summary');
  expect(editorPanel().querySelector('[aria-label="Heading"]')).not.toBeNull();
  expect(editorPanel().querySelector('[aria-label="Field key"]')).toBeNull();
  await click('Create entry');
  await click('← Back');
  expect(
    editorPanel().querySelectorAll('[aria-label="Entries"] > li'),
  ).toHaveLength(2);
  const saved = readRecovery()!.content;
  expect(saved.collections[0].fields[0].label).toBe('Heading');
  expect(saved.entries[0].values.title).toBe('First entry');
  expect(saved.entries[1].values.field1).toBe('Default summary');
});

it('opens entries from public preview links in Content and blocks referenced deletion', async () => {
  await mount();
  await click('Pages');
  await click('Home');
  await act(async () =>
    host
      .querySelector<HTMLAnchorElement>('main a[data-document-id="entry_one"]')!
      .click(),
  );
  expectAdminView();
  expect(editorPanel().textContent).toContain('← Back');
  expect(button('Delete entry').disabled).toBe(true);
  expect(editorPanel().textContent).toContain('Used in 1 place');
  expect(editorPanel().textContent).toContain(
    'Header › Navigation › Read entry',
  );
  expect(editorPanel().textContent).not.toContain('site.layout.settings');
  await click('Open', editorPanel());
  expect(editorPanel().textContent).toContain('Site Layout');
  await click('Read entry', editorPanel());
  await click('Remove item');
  await openEntry();
  expect(button('Delete entry').disabled).toBe(false);
  expect(editorPanel().textContent).not.toContain('Used in');
});
it('deletes unreferenced entries and then their empty collection', async () => {
  const initial = structuredClone(content);
  initial.site.navigation = [];
  await mount(initial);
  await openEntry();
  await click('Delete entry');
  await click('Continue', host);
  expect(editorPanel().textContent).toContain('No entries yet.');
  expect(editorPanel().textContent).toContain('Add entry');
  expect(editorPanel().querySelector('[aria-label="Field key"]')).toBeNull();
  await click('← Back');
  await click('Schemas');
  await click('Collections');
  await click('Journal · 1 fields');
  expect(button('Delete empty collection').disabled).toBe(false);
  await click('Delete empty collection');
  expect(
    editorPanel().querySelectorAll('[aria-label="Collection schemas"] li'),
  ).toHaveLength(0);
  await click('Content');
  expect(editorPanel().textContent).toContain('Create a collection in Schemas');
});

it('opens readable object usages in the owning collection schema and can return to its list', async () => {
  await mount(modelFixture());
  await click('Schemas');
  await click('Objects');
  await click('SEO · 1 fields');
  expect(editorPanel().textContent).toContain('Schemas › Collections › SEO');
  expect(editorPanel().textContent).not.toContain('collection_journal.seo');
  await click('Open', editorPanel());
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Name"]')?.value,
  ).toBe('Journal');
  expect(editorPanel().textContent).toContain('Fields');
  await click('← Back');
  expect(
    editorPanel().querySelector('[aria-label="Collection schemas"]'),
  ).not.toBeNull();
  await click('Objects');
  await click('SEO · 1 fields');
  await click('Open', editorPanel());
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Name"]')?.value,
  ).toBe('Journal');
});

it('does not present a self-reference as a deletion blocker', async () => {
  const initial = structuredClone(content);
  initial.site.navigation = [];
  initial.collections[0].fields.push({
    key: 'self',
    label: 'Self',
    type: 'reference',
    collectionId: initial.collections[0].id,
  });
  initial.entries[0].values.self = initial.entries[0].id;
  await mount(initial);
  await openEntry();
  expect(button('Delete entry').disabled).toBe(false);
  expect(editorPanel().textContent).not.toContain('Used in');
});

it('expands schema navigation without navigating and opens leaf lists without a Back button', async () => {
  await mount();
  const schemas = button('Schemas');
  const children = document.getElementById(
    schemas.getAttribute('aria-controls')!,
  )!;
  expect(schemas.getAttribute('aria-expanded')).toBe('false');
  expect(children.hidden).toBe(true);
  await click('Home');
  await input('Page title', 'Retained page edit');
  await click('Schemas');
  expect(schemas.getAttribute('aria-expanded')).toBe('true');
  expect(children.hidden).toBe(false);
  expect(schemas.hasAttribute('aria-current')).toBe(false);
  expect(button('Pages').getAttribute('aria-current')).toBe('page');
  expect(
    editorPanel().querySelector('[aria-label="Page title"]'),
  ).not.toBeNull();
  await click('Collections');
  expectAdminView();
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Collections');
  expect(editorPanel().textContent).not.toContain('← Back');
  expect(button('Collections').getAttribute('aria-current')).toBe('page');
  await click('Journal · 1 fields');
  await click('← Back');
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Collections');
  await click('Add collection');
  await input('Name', 'Uncommitted collection');
  await click('Schemas');
  expect(children.hidden).toBe(true);
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Name"]')?.value,
  ).toBe('Uncommitted collection');
  await click('Schemas');
  await click('Objects');
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Objects');
  expect(editorPanel().textContent).not.toContain('← Back');
  expect(button('Objects').getAttribute('aria-current')).toBe('page');
  expect(button('Collections').hasAttribute('aria-current')).toBe(false);
  await click('Add object');
  await input('Name', 'Uncommitted object');
  await click('Collections');
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Collections');
  expect(editorPanel().textContent).not.toContain('Uncommitted');
  expect(readRecovery()!.content.collections).toHaveLength(1);
  expect(readRecovery()!.content.objects).toHaveLength(0);
  await click('Pages');
  await click('Retained page edit');
});

it('keeps the compact navigation open for group toggles and closes it only after choosing a leaf', async () => {
  await mount();
  await click('Menu');
  const dialog = host.querySelector('[role="dialog"]')!;
  await click('Schemas', dialog);
  expect(host.querySelector('[role="dialog"]')).toBe(dialog);
  expect(host.querySelector('table[aria-label="Pages"]')).not.toBeNull();
  await click('Objects', dialog);
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Objects');
  await click('Menu');
  const reopened = host.querySelector('[role="dialog"]')!;
  expect(button('Schemas', reopened).getAttribute('aria-expanded')).toBe(
    'true',
  );
  expect(button('Objects', reopened).getAttribute('aria-current')).toBe('page');
  await click('Schemas', reopened);
  expect(button('Schemas', reopened).getAttribute('aria-expanded')).toBe(
    'false',
  );
  expect(editorPanel().querySelector('h2')?.textContent).toBe('Objects');
});

it('starts at Pages and keeps navigation available outside the nested editing sidebar', async () => {
  await mount();
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  expect(
    [...host.querySelectorAll('[aria-label="Editor areas"] button')].filter(
      (button) => !button.closest('[hidden]'),
    ),
  ).toHaveLength(6);
  await click('Pages');
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  expect(host.querySelector('table[aria-label="Pages"]')).not.toBeNull();
  await click('Home');
  expect(button('Pages').getAttribute('aria-current')).toBe('page');
  expect(
    [...host.querySelectorAll('[aria-label="Editor areas"] button')].filter(
      (button) => !button.closest('[hidden]'),
    ),
  ).toHaveLength(6);
  expect(editorPanel().querySelector('[aria-label="Editor areas"]')).toBeNull();
  expect(editorPanel().querySelector('[aria-label="Page"]')).toBeNull();
  await input('Page title', 'Changed page');
  await click('Content');
  expectAdminView();
  expect(button('Content').getAttribute('aria-current')).toBe('page');
  await click('Pages');
  await click('Changed page');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Page title"]')
      ?.value,
  ).toBe('Changed page');
  await click('← Back');
  await click('Media');
  expectAdminView();
  expect(button('Media').getAttribute('aria-current')).toBe('page');
  expect(editorPanel().textContent).toContain('Storage settings');
  expect(editorPanel().querySelector('[aria-label="Editor areas"]')).toBeNull();
  await click('Settings');
  expectAdminView();
  expect(
    editorPanel().querySelector('[aria-label="Content max-width"]'),
  ).toBeNull();
  expect(editorPanel().querySelector('[aria-label="Site title"]')).toBeNull();
});

it('lists every page and keeps page edits through the table and block hierarchy', async () => {
  const initial = structuredClone(content);
  initial.pages[0].blocks = [
    { id: 'page_quote', type: 'quote', version: 1, props: {} },
  ];
  initial.pages.push({
    formatVersion: 1,
    id: 'page_about',
    kind: 'static',
    title: 'About',
    path: '/about',
    blocks: [],
  });
  await mount(initial);
  await click('Pages');
  expect(host.querySelectorAll('table tbody tr')).toHaveLength(2);
  expect(
    [...host.querySelectorAll('table th')].map((el) => el.textContent),
  ).toEqual(['Page title', 'Type', 'URL path']);
  expect(host.querySelector('table')?.textContent).toContain('/about');
  expect(host.querySelector('[aria-label="Toggle preview width"]')).toBeNull();
  await click('Home');
  expect(host.querySelector('aside')).not.toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).not.toBeNull();
  expect(
    host.querySelector('[aria-label="Toggle preview width"]'),
  ).not.toBeNull();
  expect(
    host.querySelector('[data-preview-island="page_quote"]'),
  ).not.toBeNull();
  expect(editorPanel().textContent).not.toContain('Add page');
  expect(editorPanel().textContent).not.toContain('← Home');
  await input('Page title', 'Welcome');
  await input('URL path', '/welcome');
  await click('Quote v1');
  expect(host.querySelector('[aria-label="Live preview"]')).not.toBeNull();
  expect(editorPanel().querySelector('[aria-label="Page title"]')).toBeNull();
  await click('← Back');
  expect(editorPanel().textContent).toContain('← Back');
  await click('← Back');
  expect(host.querySelector('[data-preview-island]')).toBeNull();
  expect(host.querySelector('table')?.textContent).toContain('/welcome');
  // The row's path cell is also a mouse target; its title button provides keyboard access.
  await act(async () =>
    host.querySelectorAll<HTMLTableRowElement>('table tbody tr')[1].click(),
  );
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Page title"]')
      ?.value,
  ).toBe('About');
  await click('← Back');
  await click('Welcome');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="URL path"]')
      ?.value,
  ).toBe('/welcome');
  expect(readRecovery()?.content.pages[0].title).toBe('Welcome');
});

it('creates pages from an empty table and returns deletion to the table', async () => {
  await mount({ ...content, pages: [] });
  await click('Pages');
  expect(host.querySelector('table')?.textContent).toContain('No pages yet.');
  await click('Add page');
  await click('Static page', host);
  expect(editorPanel().textContent).not.toContain('← Back');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Page title"]')
      ?.value,
  ).toBe('New page');
  await input('Page title', 'Created page');
  await click('Create page');
  await click('← Back');
  expect(host.querySelector('table')?.textContent).toContain('Created page');
  await click('Created page');
  await click('Delete page');
  await click('Cancel', host);
  expect(editorPanel().textContent).toContain('Created page');
  await click('Delete page');
  await click('Continue', host);
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('table')?.textContent).toContain('No pages yet.');
  expect(readRecovery()?.content.pages).toEqual([]);
});

it('creates generic pages with their own block catalog and field bindings, and keeps static blocks separate', async () => {
  await mount();
  await click('Pages');
  await click('Add page');
  await click('Generic page', host);
  expect(editorPanel().querySelector('[aria-label="URL path"]')).toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  await input('Page title', 'Article template');
  await click('Create page');
  await click('Add block');
  const dialog = host.querySelector('[role="dialog"]')!;
  expect(dialog.textContent).toContain('Entry heading');
  expect(dialog.textContent).not.toContain('Collection list');
  expect(
    [...dialog.querySelectorAll('button')].some(
      (b) => b.textContent === 'Hero',
    ),
  ).toBe(false);
  await click('Entry heading', host);
  await input('Bind Heading', 'title');
  await input('Fallback value', 'Untitled');
  await click('Create block');
  const saved = readRecovery()!.content.pages.find(
    (p) => p.kind === 'generic',
  )!;
  expect(saved.path).toBeUndefined();
  expect(saved.blocks[0].bindings).toEqual({ title: 'title' });
  expect(saved.blocks[0].props.title).toBe('Untitled');
  await click('← Back');
  await click('← Back');
  expect(host.querySelector('table')?.textContent).toContain('Generic');
  await click('Home');
  await click('Add block');
  const staticDialog = host.querySelector('[role="dialog"]')!;
  expect(staticDialog.textContent).toContain('Collection list');
  expect(staticDialog.textContent).not.toContain('Entry heading');
});

it('assigns only generic pages to schemas and persists an explicit data-only selection', async () => {
  const initial = structuredClone(content);
  initial.pages.push({
    formatVersion: 1,
    id: 'template',
    kind: 'generic',
    title: 'Article layout',
    blocks: [],
  });
  await mount(initial);
  await click('Schemas');
  await click('Collections');
  await click('Journal · 1 fields');
  const selector = () =>
    editorPanel().querySelector<HTMLButtonElement>(
      '[aria-label="Generic page"]',
    )!;
  expect(selector().textContent).toContain('None · data only');
  await act(async () => selector().click());
  const options = () => [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ];
  expect(options().map((o) => o.textContent)).toEqual([
    'None · data only',
    'Article layout',
  ]);
  await act(async () =>
    options()
      .find((o) => o.textContent === 'Article layout')!
      .click(),
  );
  expect(readRecovery()?.content.collections[0].genericPageId).toBe('template');
  await act(async () => selector().click());
  await act(async () =>
    options()
      .find((o) => o.textContent === 'None · data only')!
      .click(),
  );
  expect(selector().textContent).toContain('None · data only');
  expect(readRecovery()?.content.collections[0].genericPageId).toBeUndefined();
});

it('keeps an excluded active layout editable while restricting future selections and keeping previews nonmutating', async () => {
  await mount(content, ['chartr']);
  await click('Site Layout');
  await input('Content max-width', '880');
  await input('Page gutter', '12');
  const before = structuredClone(readRecovery()!.content);
  expect(
    editorPanel().querySelector('[aria-label="Site title"]'),
  ).not.toBeNull();
  await click('Change layout');
  let dialog = host.querySelector('[role="dialog"]')!;
  expect(dialog.querySelector('[aria-label="Use Starter layout"]')).toBeNull();
  expect(
    dialog.querySelector('[aria-label="Use chartr layout"]'),
  ).not.toBeNull();
  await act(async () =>
    (
      dialog.querySelector(
        '[aria-label="Preview chartr layout"]',
      ) as HTMLElement
    ).click(),
  );
  await act(async () => {
    await vi.dynamicImportSettled();
  });
  expect(readRecovery()!.content).toEqual(before);
  const candidate = dialog.querySelector<HTMLElement>('.chartr-site')!;
  expect(candidate.style.getPropertyValue('--site-content-max-width')).toBe(
    '1512px',
  );
  expect(candidate.style.getPropertyValue('--site-page-gutter')).toBe('40px');
  await act(async () =>
    (
      dialog.querySelector('[aria-label="Close layout library"]') as HTMLElement
    ).click(),
  );
  expect(readRecovery()!.content).toEqual(before);
  await click('Change layout');
  dialog = host.querySelector('[role="dialog"]')!;
  await act(async () =>
    (
      dialog.querySelector('[aria-label="Use chartr layout"]') as HTMLElement
    ).click(),
  );
  await act(async () => {
    await vi.dynamicImportSettled();
  });
  expect(readRecovery()!.content.site.layout?.id).toBe('chartr');
  expect(readRecovery()!.content.site.layout?.settings).toMatchObject({
    contentMaxWidth: 1512,
    pageGutter: 40,
  });
  const chartrPreview = () =>
    host.querySelector<HTMLElement>(
      '[aria-label="Live preview"] .chartr-site',
    )!;
  expect(
    editorPanel().querySelector<HTMLInputElement>(
      '[aria-label="Content max-width"]',
    )!.value,
  ).toBe('1512');
  await input('Content max-width', '1000');
  await input('Page gutter', '0');
  expect(
    chartrPreview().style.getPropertyValue('--site-content-max-width'),
  ).toBe('1000px');
  expect(chartrPreview().style.getPropertyValue('--site-page-gutter')).toBe(
    '0px',
  );
  await input('Content max-width', '');
  await input('Page gutter', '');
  expect(
    chartrPreview().style.getPropertyValue('--site-content-max-width'),
  ).toBe('1512px');
  expect(chartrPreview().style.getPropertyValue('--site-page-gutter')).toBe(
    '40px',
  );
  expect(readRecovery()!.content.pages).toEqual(before.pages);
  expect(readRecovery()!.content.entries).toEqual(before.entries);
  await click('Change layout');
  expect(
    host.querySelector('[role="dialog"] [aria-label="Use Starter layout"]'),
  ).toBeNull();
});

it('creates reusable object schemas and a single-entry collection, edits owned values and recovers them', async () => {
  await mount();
  await click('Schemas');
  await click('Objects');
  await click('Add object');
  await input('Name', 'Address');
  await click('Add field');
  await input('Label', 'City');
  await input('Field key', 'city');
  await click('Create field');
  await click('Create object');
  await click('← Back');
  await click('Collections');
  await click('Add single-entry collection');
  await input('Name', 'Company');
  expect(editorPanel().textContent).toContain('Single entry');
  expect(editorPanel().querySelector('[aria-label="URL path"]')).toBeNull();
  await click('Add field');
  await input('Label', 'Address');
  await input('Field key', 'address');
  async function choose(label: string, option: string) {
    await act(async () =>
      editorPanel()
        .querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!
        .click(),
    );
    await act(async () =>
      [...document.querySelectorAll<HTMLElement>('[role="option"]')]
        .find((o) => o.textContent === option)!
        .click(),
    );
  }
  await choose('Field type', 'object');
  await choose('Object definition', 'Address');
  await click('Create field');
  await click('Create collection');
  await click('Content');
  await click('Company');
  expect(editorPanel().querySelector('[aria-label="Entries"]')).toBeNull();
  expect(editorPanel().querySelector('[aria-label="URL slug"]')).toBeNull();
  expect(editorPanel().textContent).not.toContain('Delete entry');
  await input('Title', 'Our company');
  await click('Edit Address');
  expect(
    editorPanel().querySelector('[aria-label="Title"]')?.closest('[hidden]'),
  ).not.toBeNull();
  await input('City', 'Kuala Lumpur');
  await click('← Back');
  const saved = readRecovery()!.content;
  expect(saved.objects[0].fields[0].key).toBe('city');
  const company = saved.collections.find((c) => c.name === 'Company')!;
  expect(
    saved.entries.filter((e) => e.collectionId === company.id),
  ).toHaveLength(1);
  expect(
    saved.entries.find((e) => e.collectionId === company.id)!.values.address,
  ).toEqual({ city: 'Kuala Lumpur' });
  await act(async () => root.unmount());
  host.remove();
  await mount();
  await click('Content');
  await click('Company');
  await click('Edit Address');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="City"]')?.value,
  ).toBe('Kuala Lumpur');
  await click('← Back');
  await click('← Back');
  expect(
    editorPanel().querySelector('[aria-label="Content collections"]'),
  ).not.toBeNull();
});

it('edits three owned levels and selects and reorders references through dedicated editors', async () => {
  const initial = modelFixture(),
    col = initial.collections[0],
    entry = initial.entries[0];
  await mount(initial);
  await click('Content');
  await click(col.name);
  await click(String(entry.values[col.titleField]) + entryPath(col, entry));
  await click('Edit SEO');
  await input('SEO title', 'New search title');
  await click('← Back');
  await click('Specifications');
  await click('Item 1');
  await click('Edit Detail');
  await input('Label', 'Updated specification');
  await click('Ada');
  await input('Search Owner', 'Grace');
  await click('Grace');
  await click('← Back');
  await click('← Back');
  await click('← Back');
  await click('Ada');
  await input('Search Author', 'Grace');
  await click('Grace');
  await click('1 selected · Related');
  await click(String(entry.values.title));
  const selected = editorPanel().querySelector(
    '[aria-label="Selected Related"]',
  )!;
  await act(async () =>
    selected
      .querySelector<HTMLButtonElement>(
        `[aria-label="Move ${String(entry.values.title)} up"]`,
      )!
      .click(),
  );
  await click('← Back');
  const saved = readRecovery()!.content.entries.find((e) => e.id === entry.id)!;
  expect(saved.values.author).toBe('author_grace');
  expect(saved.values.related).toEqual([entry.id, initial.entries[1].id]);
  expect(saved.values.seo).toEqual({ title: 'New search title' });
  expect((saved.values.groups as any)[0].rows[0].detail).toEqual({
    label: 'Updated specification',
    owner: 'author_grace',
  });
  await click('Content');
  await click('Authors');
  await click('GraceData only');
  expect(button('Delete entry').disabled).toBe(true);
  expect(editorPanel().textContent).toContain('Used in');
});

it('authors nested array projections in dedicated levels and retains the binding map', async () => {
  const initial = modelFixture();
  const page = initial.pages.find(
    (p) => p.id === initial.collections[0].genericPageId,
  )!;
  page.blocks = [
    {
      id: 'details',
      type: 'structured-details',
      version: 1,
      props: { heading: '', author: '', groups: [] },
    },
  ];
  await mount(initial);
  await click('Pages');
  await click(page.title);
  await click('Structured details v1');
  await input('Bind Heading', 'seo.title');
  await input('Bind Author', 'author.name');
  await input('Bind Groups', 'groups');
  await click('Map Groups items');
  expect(
    editorPanel()
      .querySelector('[aria-label="Bind Heading"]')
      ?.closest('[hidden]'),
  ).not.toBeNull();
  await input('Bind Title', 'name');
  await input('Bind Rows', 'rows');
  await click('Map Rows items');
  await input('Bind Label', 'detail.label');
  await input('Bind Value', 'detail.owner.name');
  await click('← Back');
  await click('← Back');
  expect(
    readRecovery()!.content.pages.find((p) => p.id === page.id)!.blocks[0]
      .bindings,
  ).toEqual({
    heading: 'seo.title',
    author: 'author.name',
    groups: {
      source: 'groups',
      fields: {
        title: 'name',
        rows: {
          source: 'rows',
          fields: { label: 'detail.label', value: 'detail.owner.name' },
        },
      },
    },
  });
});

it('keeps new pages and entries outside the draft until Create, and discards cancellation or navigation', async () => {
  await mount();
  const before = readRecovery()!.content;
  await click('Add page');
  await click('Static page', host);
  expectCreation('page');
  await input('Page title', 'Uncommitted page');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(host.querySelector('table')?.textContent).not.toContain('Uncommitted');
  await click('Add page');
  await click('Generic page', host);
  await input('Page title', 'Abandoned template');
  await click('Content');
  expect(readRecovery()!.content).toEqual(before);
  await click('Journal');
  await click('Add entry');
  expectCreation('entry');
  await input('Title', 'Cancelled entry');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(editorPanel().textContent).not.toContain('Cancelled entry');
  await click('Add entry');
  await input('Title', 'Created entry');
  await click('Create entry');
  expect(readRecovery()!.content.entries).toHaveLength(2);
  expect(readRecovery()!.content.entries.at(-1)?.values.title).toBe(
    'Created entry',
  );
});

it('stages collection, object and nested field creation atomically, including single-entry provisioning', async () => {
  await mount();
  const before = readRecovery()!.content;
  await click('Schemas');
  await click('Collections');
  await click('Add single-entry collection');
  expectCreation('collection');
  await input('Name', 'Cancelled company');
  await click('Add field');
  expectCreation('field');
  await input('Label', 'Details');
  await input('Field key', 'details');
  await chooseOption('Field type', 'object');
  await click('Add field');
  await input('Label', 'Nested field');
  await input('Field key', 'nested');
  await click('Create field');
  expectCreation('field');
  expect(readRecovery()!.content).toEqual(before);
  await click('Create field');
  expectCreation('collection');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(before);
  await click('Add single-entry collection');
  await input('Name', 'Company');
  await click('Create collection');
  const committed = readRecovery()!.content;
  expect(committed.collections).toHaveLength(2);
  expect(committed.entries).toHaveLength(2);
  expect(committed.entries.at(-1)?.collectionId).toBe(
    committed.collections.at(-1)?.id,
  );
  await click('← Back');
  await click('Objects');
  await click('Add object');
  expectCreation('object');
  await input('Name', 'Cancelled object');
  await click('Add field');
  await click('Create field');
  expect(readRecovery()!.content).toEqual(committed);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(committed);
});

it('selects GitLab and clears credentials when the provider or instance changes', async () => {
  sessionStorage.setItem(
    'lean:git',
    JSON.stringify({
      repository: repositoryKey(config),
      token: 'github-test-token',
    }),
  );
  await mount();
  await click('Settings');
  await click('Connection');
  const field = (label: string) =>
    host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
  expect(field('Access token').value).toBe('github-test-token');
  expect(field('Owner').placeholder).toBe('my-username-or-org');
  expect(field('Repository').placeholder).toBe('my-site');
  expect(field('Draft branch').placeholder).toBe('draft');
  expect(field('Publish branch').placeholder).toBe('main');
  expect(field('Publish branch').value).toBe('main');
  expect(field('Access token').placeholder).toBe('github_pat_…');
  await act(async () =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Git provider"]')!
      .click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((o) => o.textContent === 'GitLab')!
      .click(),
  );
  expect(field('GitLab instance URL').value).toBe('https://gitlab.com');
  expect(field('Namespace (including subgroups)')).not.toBeNull();
  expect(field('Namespace (including subgroups)').placeholder).toBe(
    'my-team/my-subgroup',
  );
  expect(field('GitLab instance URL').placeholder).toBe('https://gitlab.com');
  expect(field('Repository').placeholder).toBe('my-site');
  expect(field('Draft branch').placeholder).toBe('draft');
  expect(field('Publish branch').value).toBe('main');
  expect(field('Access token').placeholder).toBe('glpat-…');
  expect(field('Access token').value).toBe('');
  expect(sessionStorage.getItem('lean:git')).toBeNull();
  const change = async (label: string, value: string) =>
    act(async () => {
      const element = field(label);
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )!.set!.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
  await change('Access token', 'gitlab-test-token');
  await change('GitLab instance URL', 'https://gitlab.example.com');
  expect(field('Access token').value).toBe('');
  // Partially typed URLs remain editable; validation happens on Connect.
  await change('GitLab instance URL', 'https:');
  expect(field('GitLab instance URL').value).toBe('https:');
  await change('Access token', 'gitlab-test-token');
  await change('Publish branch', 'release/live');
  expect(field('Access token').value).toBe('');
  expect(field('Publish branch').value).toBe('release/live');
  await click('Close');
  await click('Connection');
  expect(field('Publish branch').value).toBe('release/live');
});

it('restores the publish branch from the retained draft repository', async () => {
  retain({
    version: 1,
    repository: { ...config, publishBranch: 'production' },
    base: null,
    content: structuredClone(content),
  });
  await mount();
  await click('Settings');
  await click('Connection');
  expect(
    host.querySelector<HTMLInputElement>('[aria-label="Publish branch"]')!
      .value,
  ).toBe('production');
  expect(readRecovery()!.repository.publishBranch).toBe('production');
});

it('allows a fresh legacy site to reach connection validation without reporting unsaved edits', async () => {
  await mount();
  expect(host.querySelector('header')!.textContent).not.toContain('Connection');
  await click('Settings');
  expect(editorPanel().textContent).toContain('Connection');
  await click('Connection');
  await click('Connect');
  expect(host.textContent).toContain('Enter your repository and access token.');
  expect(host.textContent).not.toContain(
    'Export or discard local preview edits',
  );
});

it('confirms factory reset, retains the empty draft across reloads and allows discarding it', async () => {
  const initial = selectLayout(
    modelFixture(),
    layoutDefinitions.find((d) => d.id === 'chartr')!,
  );
  initial.media.push({
    formatVersion: 1,
    id: 'media_test',
    name: 'test.pdf',
    original: {
      key: 'media_test/original.pdf',
      url: 'https://media.example.com/test.pdf',
      mime: 'application/pdf',
      bytes: 10,
    },
    variants: [],
  });
  localStorage.setItem(adminThemeKey, 'light');
  sessionStorage.setItem(
    'lean:r2',
    JSON.stringify({ ...config.r2, accessKeyId: 'test-key' }),
  );
  const storage = sessionStorage.getItem('lean:r2');
  await mount(initial, ['chartr']);
  await click('Settings');
  const before = readRecovery()!;
  await click('Factory reset');
  const dialog = () => host.querySelector('[role="dialog"]')!;
  expect(dialog().textContent).toContain('Factory reset this site?');
  expect(dialog().textContent).toContain('Uploaded files remain in R2.');
  expect(readRecovery()).toEqual(before);
  await click('Cancel', dialog());
  expect(readRecovery()).toEqual(before);
  expect(button('Save draft').disabled).toBe(true);
  await click('Factory reset');
  await click('Reset site', dialog());
  const reset = readRecovery()!;
  expect(reset).toMatchObject({
    repository: before.repository,
    base: before.base,
    content: {
      pages: [],
      entries: [],
      collections: [],
      objects: [],
      media: [],
      site: {
        id: initial.site.id,
        globals: {},
        layout: { id: 'starter', version: 1 },
      },
    },
  });
  expect(reset.content.site.layout!.settings).toEqual(
    layoutDefinitions.find((d) => d.id === 'starter')!.defaults,
  );
  expect(button('Save draft').disabled).toBe(false);
  expect(localStorage.getItem(adminThemeKey)).toBe('light');
  expect(sessionStorage.getItem('lean:r2')).toBe(storage);
  await click('Pages');
  expect(host.textContent).not.toContain(initial.pages[0].title);
  await click('Site Layout');
  expect(editorPanel().textContent).toContain('Starter');
  for (const [label, value] of Object.entries({
    'Site title': 'Welcome',
    'Body font size': '16',
    'Body line height': '1.5',
    'Content max-width': '1200',
    'Page gutter': '0',
    'Brand name': 'Your Brand',
    'Action label': 'Contact Us',
    'Action URL': 'https://google.com',
  })) {
    expect(
      editorPanel().querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!
        .value,
    ).toBe(value);
  }
  expect(
    editorPanel().querySelector('[aria-label="Body font"]')!.textContent,
  ).toContain('Arial');
  expect(
    editorPanel().querySelector('[aria-label="Heading font"]')!.textContent,
  ).toContain('Arial');
  for (const label of ['Home', 'Journal', 'Blocks'])
    expect(button(label, editorPanel())).toBeDefined();
  await click('Publish');
  expect(host.textContent).toContain('Create a home page at /.');
  await act(async () => root.unmount());
  host.remove();
  await mount(initial);
  expect(readRecovery()!.content).toEqual(reset.content);
  await click('Settings');
  await click('Discard edits');
  await click('Continue', dialog());
  expect(readRecovery()!.content).toEqual(before.content);
});

it('cancels new fields in existing schemas and retains creation forms after rejected depth or cycle changes', async () => {
  await mount(modelFixture());
  const before = readRecovery()!.content;
  await click('Schemas');
  await click('Collections');
  const col = before.collections[0];
  await click(`${col.name} · ${col.fields.length} fields`);
  await click('Add field');
  await input('Label', 'Discarded');
  await click('Edit default value');
  await input('Discarded', 'Pending default');
  await click('← Back');
  expectCreation('field');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(before);
  await click('← Back');
  await click('Objects');
  await click('SEO · 1 fields');
  await click('Add field');
  await chooseOption('Field type', 'object');
  await chooseOption('Object definition', 'SEO');
  await click('Create field');
  expectCreation('field');
  expect(editorPanel().textContent).toContain('Recursive object');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
});

it('keeps nested list creation local to its parent until both Create actions, and cancels owned objects cleanly', async () => {
  const initial = modelFixture();
  initial.entries[0].values.seo = null;
  await mount(initial);
  await click('Content');
  await click(initial.collections[0].name);
  const entryButton = [
    ...editorPanel().querySelectorAll<HTMLButtonElement>(
      '[aria-label="Entries"] button',
    ),
  ][0];
  await act(async () => entryButton.click());
  const before = readRecovery()!.content;
  await click('Add SEO');
  expectCreation('SEO');
  await input('SEO title', 'Cancelled SEO');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  const add = [...editorPanel().querySelectorAll<HTMLButtonElement>('button')]
    .filter((b) => b.textContent === 'Add item')
    .at(-1)!;
  await act(async () => add.click());
  expectCreation('item');
  await input('Group', 'Pending group');
  await click('Add item');
  expectCreation('item');
  await click('Create item');
  expectCreation('item');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(before);
});

it('previews pending blocks and their edits without inserting into recovery until Create', async () => {
  await mount();
  await click('Home');
  const before = readRecovery()!.content;
  await click('Add block');
  await click('Quote', host);
  expectCreation('block');
  const preview = () => host.querySelector('[data-preview-island]')!;
  expect(preview()).not.toBeNull();
  expect(preview().parentElement?.dataset.selected).toBe('true');
  expect(host.textContent).not.toContain('Add a block to start building.');
  await input('Attribution', 'Uncommitted attribution');
  expect(readRecovery()!.content).toEqual(before);
  expect(JSON.parse(preview().getAttribute('data-preview-props')!).author).toBe(
    'Uncommitted attribution',
  );
  expect(button('Save draft').disabled).toBe(true);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(before);
  expect(preview()).toBeNull();
  await click('Add block');
  await click('Quote', host);
  await input('Attribution', 'Created attribution');
  const pending = preview();
  await click('Create block');
  expect(readRecovery()!.content.pages[0].blocks).toHaveLength(1);
  expect(readRecovery()!.content.pages[0].blocks[0].props.author).toBe(
    'Created attribution',
  );
  expect(host.querySelectorAll('[data-preview-island]')).toHaveLength(1);
  expect(preview()).toBe(pending);
});

it('previews an appended block on an existing page and discards it when navigating away', async () => {
  const initial = structuredClone(content);
  initial.pages[0].blocks = [
    {
      id: 'existing-quote',
      type: 'quote',
      version: 1,
      props: { author: 'Existing' },
    },
  ];
  await mount(initial);
  await click('Home');
  const before = readRecovery()!.content;
  await click('Add block');
  await click('Quote', host);
  await input('Attribution', 'Temporary quote');
  const rendered = [...host.querySelectorAll('[data-preview-island]')];
  expect(rendered).toHaveLength(2);
  expect(rendered[0].getAttribute('data-preview-island')).toBe(
    'existing-quote',
  );
  expect(
    JSON.parse(rendered[1].getAttribute('data-preview-props')!).author,
  ).toBe('Temporary quote');
  expect(readRecovery()!.content).toEqual(before);
  await click('Pages');
  await click('Home');
  expect(host.querySelectorAll('[data-preview-island]')).toHaveLength(1);
  expect(readRecovery()!.content).toEqual(before);
});

it('stages footer creation and replacement in dedicated forms without changing the live layout before Create', async () => {
  await mount();
  await click('Site Layout');
  const before = readRecovery()!.content;
  await click('Choose footer');
  await click('Four column footer', host);
  expectCreation('footer');
  expect(
    editorPanel()
      .querySelector('[aria-label="Site title"]')
      ?.closest('[hidden]'),
  ).not.toBeNull();
  await input('Brand', 'Pending brand');
  expect(readRecovery()!.content).toEqual(before);
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(before);
  await click('Choose footer');
  await click('Four column footer', host);
  await input('Brand', 'Created brand');
  await click('Create footer');
  const committed = readRecovery()!.content;
  expect((committed.site.layout!.settings.footer as any).props.brand).toBe(
    'Created brand',
  );
  await click('Change footer');
  await click('Four column footer', host);
  await input('Brand', 'Cancelled replacement');
  await click('Cancel');
  expect(readRecovery()!.content).toEqual(committed);
});
