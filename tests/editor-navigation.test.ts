// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import type { Block, Content } from '../src/core/types';
import { readRecovery } from '../src/editor/recovery';
vi.mock('../src/editor/Island', () => ({
  default: ({ block }: { block: Block }) =>
    createElement('div', { 'data-preview-island': block.id }),
}));
const config = {
  owner: '',
  repo: '',
  branch: 'draft',
  passwordHash: '',
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
  collections: [
    {
      formatVersion: 1,
      id: 'collection_journal',
      name: 'Journal',
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
  vi.restoreAllMocks();
});
async function mount(initial = content) {
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
      createElement(App, { initial: structuredClone(initial), config }),
    ),
  );
}
const editorPanel = () =>
  host.querySelector<HTMLElement>(
    '[aria-label="Site builder"], [aria-label="Admin workspace"]',
  )!;
function button(label: string, scope: Element = host) {
  const found = [...scope.querySelectorAll('button')].find(
    (el) => el.textContent === label,
  );
  expect(found, `button ${label}`).toBeDefined();
  return found!;
}
async function click(label: string, scope?: Element) {
  await act(async () => button(label, scope).click());
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
  await click('First entry/one');
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

it('preserves site width across navigation and scopes it to the live preview', async () => {
  await mount();
  await click('Site');
  await input('Content max-width', '880');
  expect(readRecovery()?.content.site.globals.contentMaxWidth).toBe(880);
  await click('Pages');
  await click('Home');
  const preview = () =>
    host.querySelector<HTMLElement>('[aria-label="Live preview"]')!;
  expect(preview().style.getPropertyValue('--site-content-max-width')).toBe(
    '880px',
  );
  expect(
    host
      .querySelector<HTMLElement>('aside')!
      .style.getPropertyValue('--site-content-max-width'),
  ).toBe('');
  await click('Site');
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
  await click('Site');
  for (const [label, choice] of [
    ['Body font', 'Arial'],
    ['Heading font', 'Georgia'],
  ]) {
    await act(async () =>
      editorPanel()
        .querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!
        .click(),
    );
    await act(async () =>
      [...document.querySelectorAll<HTMLElement>('[role="option"]')]
        .find((option) => option.textContent === choice)!
        .click(),
    );
  }
  await input('Body font size', '18');
  await input('Body line height', '1.8');
  await input('Page gutter', '40');
  expect(readRecovery()?.content.site.globals).toMatchObject({
    bodyFont: 'arial',
    headingFont: 'georgia',
    bodyFontSize: 18,
    bodyLineHeight: 1.8,
    pageGutter: 40,
  });
  // A remount exercises actual tab recovery rather than passing edited initial props.
  await act(async () => root.unmount());
  host.remove();
  await mount();
  await click('Pages');
  await click('Home');
  const preview = () =>
    host.querySelector<HTMLElement>('[aria-label="Live preview"]')!;
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
  await click('Site');
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
  expect(preview().style.getPropertyValue('--site-page-gutter')).toBe('24px');
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
  expect(editorPanel().textContent).toContain('Edited entry/one');
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
  await click('Collection schemas');
  expectAdminView();
  await click('Journal1 fields');
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
  await input('Default value', 'Default summary');
  await click('← Back');
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
  await click('← Back');
  expect(
    editorPanel().querySelectorAll('[aria-label="Entries"] > li'),
  ).toHaveLength(2);
  const saved = readRecovery()!.content;
  expect(saved.collections[0].fields[0].label).toBe('Heading');
  expect(saved.entries[0].values.title).toBe('First entry');
  expect(saved.entries[1].values.field1).toBe('Default summary');
});

it('opens entries from public preview links in Content and returns deletion to the entry list', async () => {
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
  await click('Delete entry');
  await click('Continue', host);
  expect(editorPanel().textContent).toContain('No entries yet.');
  expect(editorPanel().textContent).toContain('Add entry');
  expect(editorPanel().querySelector('[aria-label="Field key"]')).toBeNull();
  await click('← Back');
  await click('Collection schemas');
  await click('Journal1 fields');
  expect(button('Delete empty collection').disabled).toBe(false);
  await click('Delete empty collection');
  expect(editorPanel().textContent).toContain('No collection schemas yet.');
  await click('Content');
  expect(editorPanel().textContent).toContain(
    'Create a collection in Collection schemas',
  );
});

it('starts at Pages and keeps navigation available outside the nested editing sidebar', async () => {
  await mount();
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  expect(
    host.querySelectorAll('[aria-label="Editor areas"] button'),
  ).toHaveLength(5);
  await click('Pages');
  expect(editorPanel()).toBeNull();
  expect(host.querySelector('[aria-label="Live preview"]')).toBeNull();
  expect(host.querySelector('table[aria-label="Pages"]')).not.toBeNull();
  await click('Home');
  expect(button('Pages').getAttribute('aria-current')).toBe('page');
  expect(
    host.querySelectorAll('[aria-label="Editor areas"] button'),
  ).toHaveLength(5);
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
  await click('Site');
  expectAdminView();
  expect(
    editorPanel().querySelector('[aria-label="Site title"]'),
  ).not.toBeNull();
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
  expect(editorPanel().textContent).toContain('← Back');
  expect(
    editorPanel().querySelector<HTMLInputElement>('[aria-label="Page title"]')
      ?.value,
  ).toBe('New page');
  await input('Page title', 'Created page');
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
  expect(host.querySelector('[aria-label="Live preview"]')).not.toBeNull();
  await input('Page title', 'Article template');
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
  await click('Collection schemas');
  await click('Journal1 fields');
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
