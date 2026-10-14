// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import type { Content } from '../src/core/types';
import { filesFor } from '../src/core/content';
import { connect } from '../src/integrations/git';
import { retain } from '../src/editor/recovery';

// Preview adapters have separate lifecycle tests; this covers real Kumo controls/portals.
vi.mock('../src/editor/Island', () => ({ default: () => null }));
vi.mock('../src/integrations/git', async (original) => ({
  ...(await original<typeof import('../src/integrations/git')>()),
  connect: vi.fn(),
}));
const repository = { owner: 'test', repo: 'site', branch: 'draft' };
const save = vi.fn();
const config = {
  git: { repository, token: 'test-token' },
  encryptedAdmin: false,
  r2: null,
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
content.site.layout ??= {
  id: 'starter',
  version: 1,
  settings: {
    ...content.site.globals,
    title: content.site.title ?? 'Test',
    navigation: content.site.navigation ?? [],
  },
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
  const base = {
    sha: 'base',
    treeSha: 'tree-base',
    content,
    files: filesFor(content),
    blobs: {},
    sourceFiles: {},
  };
  save.mockReset();
  save.mockResolvedValue({
    ...base,
    content: recovered,
    files: filesFor(recovered),
  });
  vi.mocked(connect).mockResolvedValue({
    repository,
    load: async () => base,
    save,
    publish: vi.fn(),
  });
  retain({ version: 1, repository, base, content: recovered });
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
  // Incomplete fields are legal in a draft and reach the provider.
  expect(save).toHaveBeenCalledOnce();
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
  expect(save).not.toHaveBeenCalled();
});
