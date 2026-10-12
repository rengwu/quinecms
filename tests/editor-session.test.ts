// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App, { type Config } from '../src/editor/App';
import { fixture } from './support/fixture';
import { readRecovery } from '../src/editor/recovery';
import { adminThemeKey } from '../src/editor/AdminTheme';

vi.mock('../src/editor/Island', () => ({ default: () => null }));
const config: Config = {
  owner: '',
  repo: '',
  branch: 'draft',
  encryptedAdmin: false,
  r2: { accountId: '', bucket: '', publicURL: '' },
};
let root: Root, host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  sessionStorage.clear();
  localStorage.removeItem(adminThemeKey);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(encryptedAdmin = false, onLock = vi.fn()) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('crypto', webcrypto);
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
    root.render(
      createElement(App, {
        initial: fixture(),
        config: { ...config, encryptedAdmin },
        onLock,
      }),
    ),
  );
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === label,
  );
  expect(button, label).toBeDefined();
  await act(async () => button!.click());
}
it('supports an unprotected component harness without exposing a lock action', async () => {
  await mount();
  expect(host.querySelector('[aria-label="Main navigation"]')).not.toBeNull();
  await click('Settings');
  expect(host.textContent).not.toContain('Lock editor');
  expect(host.textContent).not.toContain('Continue');
  expect(host.textContent).toContain('Discard edits');
  expect(host.textContent).toContain('Factory reset');
});

it('clears credentials on lock, preserves the draft, and returns control to the encrypted loader', async () => {
  const onLock = vi.fn();
  await mount(true, onLock);
  await click('Settings');
  const before = readRecovery();
  for (const key of ['lean:gate', 'lean:git', 'lean:github', 'lean:r2'])
    sessionStorage.setItem(key, '{}');
  await click('Lock editor');
  for (const key of ['lean:gate', 'lean:git', 'lean:github', 'lean:r2'])
    expect(sessionStorage.getItem(key)).toBeNull();
  expect(onLock).toHaveBeenCalledOnce();
  expect(readRecovery()).toEqual(before);
});
