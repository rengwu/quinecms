// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import type { Block, Content } from '../src/core/types';
import { readRecovery } from '../src/editor/recovery';
vi.mock('../src/editor/Island', () => ({
  default: ({ block }: { block: Block }) =>
    createElement('div', {
      'data-preview-island': block.id,
      'data-preview-props': JSON.stringify(block.props),
    }),
}));

const content: Content = {
  site: {
    formatVersion: 1,
    id: 'site',
    globals: {},
    i18n: { enabled: true, main: 'en', languages: ['id'], missing: 'fallback' },
    layout: {
      id: 'starter',
      version: 1,
      settings: { title: 'Site', navigation: [] },
    },
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
      titleField: 'title',
      fields: [
        {
          key: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          localized: true,
        },
        { key: 'summary', label: 'Summary', type: 'text' },
      ],
    },
  ],
  entries: [
    {
      formatVersion: 1,
      id: 'entry_one',
      collectionId: 'collection_journal',
      values: { title: 'First entry', summary: 'Shared summary' },
    },
  ],
  media: [],
};

let root: Root, host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  sessionStorage.clear();
});
async function mount() {
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
        initial: structuredClone(content),
        config: { git: null, encryptedAdmin: false, r2: null },
      }),
    ),
  );
}
const visible = () =>
  [...host.querySelectorAll('button')].filter((b) => !b.closest('[hidden]'));
async function click(label: string | RegExp) {
  const found = visible().find((b) =>
    typeof label === 'string'
      ? b.textContent?.trim() === label
      : label.test(b.textContent ?? ''),
  );
  expect(found, `button ${label}`).toBeDefined();
  await act(async () => found!.click());
  await act(async () => vi.dynamicImportSettled());
}
async function language(name: string) {
  await act(async () =>
    host.querySelector<HTMLElement>('[aria-label="Editing language"]')!.click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((o) => o.textContent === name)!
      .click(),
  );
}
const field = (label: string) =>
  host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
async function type(label: string, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(field(label), value);
    field(label).dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('creates and edits a language copy from the top-bar language without changing shared values', async () => {
  await mount();
  await language('Indonesian');
  await click('Content');
  await click('Journal');
  expect(host.textContent).toContain('No copy');
  await click(/^First entry/);
  expect(host.textContent).toContain('No Indonesian copy');
  expect(field('Title')).toBeNull();

  // An uncommitted New copy form starts blank; Cancel leaves nothing (DEC-224).
  await click('Add Indonesian copy');
  expect(host.textContent).toContain('New Indonesian copy');
  expect(field('Title').value).toBe('');
  expect(field('Summary').value).toBe('Shared summary');
  expect(field('Summary').closest('div')!.textContent).toContain('Shared');
  await click('Cancel');
  expect(readRecovery()?.content.entries[0].copies).toBeUndefined();

  await click('Add Indonesian copy');
  await type('Title', 'Entri pertama');
  await click('Create');
  expect(host.textContent).toContain('Eligible');
  await type('Summary', 'Changed everywhere');
  const saved = readRecovery()!.content.entries[0];
  expect(saved.values).toEqual({
    title: 'First entry',
    summary: 'Changed everywhere',
  });
  expect(saved.copies).toEqual({ id: { title: 'Entri pertama' } });

  // Switching language keeps the item open and shows each language's values.
  await language('English');
  expect(field('Title').value).toBe('First entry');
  expect(host.textContent).not.toContain('Eligible');
  await language('Indonesian');
  expect(field('Title').value).toBe('Entri pertama');
});
