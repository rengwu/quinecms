// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import { legacyBackupFormat } from '../src/editor/legacy-brand';
import styles from '../src/editor/editor.module.css';
import { filesFor } from '../src/core/content';
import type { Content, Snapshot } from '../src/core/types';
import { connect } from '../src/integrations/git';
import { Conflict } from '../src/integrations/repository';
import { download, readRecovery, retain } from '../src/editor/recovery';
import { fixture } from './support/fixture';

vi.mock('../src/editor/Island', () => ({ default: () => null }));
vi.mock('../src/integrations/git', async (original) => ({
  ...(await original<typeof import('../src/integrations/git')>()),
  connect: vi.fn(),
}));
vi.mock('../src/editor/recovery', async (original) => ({
  ...(await original<typeof import('../src/editor/recovery')>()),
  download: vi.fn(),
}));
const config = {
  provider: 'github' as const,
  owner: 'example',
  repo: 'site',
  branch: 'draft',
  publishBranch: 'main',
  r2: null,
};
const snapshot = (sha: string, content = fixture()): Snapshot => ({
  sha,
  content,
  treeSha: `tree-${sha}`,
  files: filesFor(content),
  blobs: {},
  sourceFiles: {},
});
const store = {
  repository: config,
  load: vi.fn<() => Promise<Snapshot>>(),
  save: vi.fn<(base: Snapshot, content: Content) => Promise<Snapshot>>(),
  publish: vi.fn<() => Promise<void>>(),
};
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.mocked(connect).mockResolvedValue(store);
  store.load.mockResolvedValue(snapshot('base'));
  store.save.mockImplementation(async (_, content) =>
    snapshot('saved', content),
  );
  store.publish.mockResolvedValue();
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  sessionStorage.clear();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});
async function mount() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(createElement(App, { initial: fixture(), config })),
  );
}
function button(label: string, scope: Element = host) {
  const result = [...scope.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === label && !b.closest('[hidden]'),
  );
  expect(result, label).toBeDefined();
  return result!;
}
const status = () => host.querySelector('header [role="status"]')?.textContent;
const dialog = () => host.querySelector(`.${styles.popup}`)!;
async function click(label: string, scope = host as Element) {
  await act(async () => button(label, scope).click());
}
async function input(label: string, value: string) {
  const el = host.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  expect(el, label).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function connection() {
  await click('Settings');
  await click('Connection');
  await click('Connect');
}
async function edit() {
  await click('Pages');
  await click('Home');
  await input('Page title', 'My pending work');
}
async function stale() {
  await mount();
  await connection();
  await edit();
  store.save.mockRejectedValueOnce(new Conflict());
  await click('Save draft');
}

it('shows local, pending, saving and confirmed statuses without polling', async () => {
  await mount();
  expect(status()).toBe('Local preview');
  await connection();
  expect(status()).toBe('Saved to draft');
  expect(host.textContent).toContain('example/site');
  expect(host.textContent).toContain('Draft: draft · Publish: main');
  await edit();
  expect(status()).toBe('Unsaved changes');
  const pending = readRecovery()!;
  let finish!: (value: Snapshot) => void;
  store.save.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  await click('Save draft');
  expect(status()).toBe('Saving…');
  expect(button('Save draft').disabled).toBe(true);
  expect(readRecovery()).toEqual(pending);
  await act(async () => finish(snapshot('saved', pending.content)));
  expect(status()).toBe('Saved to draft');
  expect(readRecovery()!.base!.sha).toBe('saved');
  expect(button('Save draft').disabled).toBe(true);
  expect(store.load).toHaveBeenCalledTimes(1);
});

it('keeps stale edits, exports their original base, and reopens recovery after dismissal', async () => {
  await stale();
  const pending = readRecovery()!;
  expect(status()).toBe('Newer draft available');
  expect(dialog().textContent).toContain('A newer version is available');
  expect(dialog().textContent).toContain('does not merge');
  expect(button('Save draft').disabled).toBe(true);
  expect(button('Publish').disabled).toBe(true);
  await click('Export backup', dialog());
  expect(download).toHaveBeenCalledWith(
    {
      format: 'quinecms-backup',
      version: 1,
      repository: pending.repository,
      baseSha: 'base',
      content: pending.content,
    },
    'site-backup.json',
  );
  expect(readRecovery()).toEqual(pending);
  await click('Close', dialog());
  await click('Newer draft available');
  expect(dialog().textContent).toContain('A newer version is available');
  await click('Load latest version', dialog());
  expect(dialog().textContent).toContain('This replaces your browser edits');
  await click('Cancel', dialog());
  expect(readRecovery()).toEqual(pending);
  expect(store.load).toHaveBeenCalledTimes(1);
  expect(store.save).toHaveBeenCalledTimes(1);
});

it('preserves edits on failed reload and replaces them only after a successful confirmed load', async () => {
  await stale();
  const pending = readRecovery()!;
  store.load.mockRejectedValueOnce(Error('Network unavailable'));
  await click('Load latest version', dialog());
  await click('Load latest version', dialog());
  expect(readRecovery()).toEqual(pending);
  expect(status()).toBe('Newer draft available');
  expect(host.textContent).toContain('Network unavailable');
  const newer = snapshot('newer');
  newer.content.pages[0].title = 'New remote title';
  store.load.mockResolvedValueOnce(newer);
  await click('Load latest version', dialog());
  await click('Load latest version', dialog());
  expect(readRecovery()!.base!.sha).toBe('newer');
  expect(readRecovery()!.content.pages[0].title).toBe('New remote title');
  expect(status()).toBe('Saved to draft');
  expect(button('Save draft').disabled).toBe(true);
  expect(download).not.toHaveBeenCalled(); // Export is optional, never assumed complete.
});

it.each(['Network unavailable', 'Token permission denied'])(
  'allows retry after %s without claiming a stale draft',
  async (message) => {
    await mount();
    await connection();
    await edit();
    const pending = readRecovery()!;
    store.save.mockRejectedValueOnce(Error(message));
    await click('Save draft');
    expect(status()).toBe('Not saved');
    expect(host.textContent).toContain(message);
    expect(host.textContent).not.toContain('A newer version is available');
    expect(readRecovery()).toEqual(pending);
    expect(button('Save draft').disabled).toBe(false);
    await click('Save draft');
    expect(status()).toBe('Saved to draft');
  },
);

it('detects outdated recovered edits when reconnecting without attempting a save', async () => {
  const base = snapshot('old');
  const content = structuredClone(base.content);
  content.pages[0].title = 'Recovered work';
  retain({ version: 1, repository: config, base, content });
  await mount();
  await connection();
  expect(status()).toBe('Newer draft available');
  expect(dialog().textContent).toContain('A newer version is available');
  expect(readRecovery()!.content.pages[0].title).toBe('Recovered work');
  expect(store.save).not.toHaveBeenCalled();
});

it('does not describe a different repository as newer or replace edits when connecting', async () => {
  await mount();
  await connection();
  await edit();
  const pending = readRecovery()!;
  await click('Settings');
  await click('Connection');
  await input('Repository', 'other-site');
  vi.mocked(connect).mockResolvedValueOnce({
    ...store,
    repository: { ...config, repo: 'other-site' },
  });
  await click('Connect');
  expect(host.textContent).toContain('remote draft differs');
  expect(status()).toBe('Unsaved changes');
  expect(readRecovery()).toEqual(pending);
  await click('Close', dialog());
  await click('Save draft');
  expect(host.textContent).toContain('Connect to the repository first');
  expect(store.save).not.toHaveBeenCalled();
});

it.each(['quinecms-backup', legacyBackupFormat])(
  'imports %s backups after confirmation without losing content',
  async (format) => {
    await mount();
    await click('Settings');
    const restored = fixture();
    restored.pages[0].title = 'Restored client work';
    const upload = host.querySelector<HTMLInputElement>(
      'input[type="file"][accept="application/json"]',
    )!;
    expect(upload).not.toBeNull();
    Object.defineProperty(upload, 'files', {
      configurable: true,
      value: [
        {
          text: async () =>
            JSON.stringify({ format, version: 1, content: restored }),
        },
      ],
    });
    await act(async () =>
      upload.dispatchEvent(new Event('change', { bubbles: true })),
    );
    expect(dialog().textContent).toContain('Restore this backup?');
    expect(readRecovery()?.content.pages[0].title).not.toBe(
      'Restored client work',
    );
    await click('Continue', dialog());
    expect(readRecovery()?.content.pages[0].title).toBe('Restored client work');
  },
);
