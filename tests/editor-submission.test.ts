// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import type { Content } from '../src/core/types';
import { retain } from '../src/editor/recovery';

// Preview adapters have separate lifecycle tests; this covers real Kumo controls/portals.
vi.mock('../src/editor/Island', () => ({ default: () => null }));
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
    navigation: [],
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
  entries: [],
  objects: [],
  collections: [],
  media: [],
};
let root: Root;
let host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  sessionStorage.clear();
});
async function mount(recovered: Content) {
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
  retain({ version: 1, repository: config, base: null, content: recovered });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(createElement(App, { initial: content, config })),
  );
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(
    (el) => el.textContent === label,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}

it('recovers silently and puts submission errors inside the styled portal', async () => {
  const recovered = structuredClone(content);
  recovered.pages[0].title = '';
  await mount(recovered);
  expect(host.textContent).not.toMatch(
    /Recovered|Cannot publish|Page title is required/,
  );
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Unsaved changes',
  );
  await click('Publish');
  const title = [...document.querySelectorAll('h2')].find(
    (el) => el.textContent === 'Cannot publish yet',
  )!;
  expect(title).toBeDefined();
  expect(title.closest('.kumo-ui')).not.toBeNull();
  expect(title.closest('[data-mode="dark"]')).not.toBeNull();
  expect(host.textContent).toContain('Page title is required.');
  expect(host.querySelector('[aria-modal="true"]')).toBeNull();
  await click('Save draft');
  // Incomplete fields are legal in a draft; Save reaches the connection check.
  expect(host.textContent).toContain('Connect to the repository first.');
  expect(host.textContent).not.toContain('Cannot save yet');
});

it('blocks a structurally invalid save with a toast before contacting a provider', async () => {
  const recovered = structuredClone(content);
  recovered.collections.push({
    formatVersion: 1,
    id: 'collection_journal',
    name: 'Journal',
    mode: 'many',
    path: '/journal',
    titleField: 'title',
    fields: [{ key: '', label: 'Title', type: 'text' }],
  });
  await mount(recovered);
  await click('Save draft');
  expect(host.textContent).toContain('Cannot save yet');
  expect(host.textContent).not.toContain('Connect to the repository first.');
});
