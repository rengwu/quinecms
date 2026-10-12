// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('../src/admin/crypto', () => {
  throw new Error('The crypto module could not be fetched.');
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

it('keeps login usable and reports a crypto module load failure without submitting credentials', async () => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('DecompressionStream', class {});
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
  document.body.innerHTML = `
    <main id="login-screen"><form id="admin-login" method="post">
      <input name="email" value="fixture@example.test">
      <input name="password" value="fixture-password">
      <button disabled>Unlock editor</button>
      <p id="login-error"></p>
    </form></main><div id="editor-root" hidden></div>`;
  const form = document.querySelector('form')!;
  const button = document.querySelector('button')!;
  await import('../src/admin/login');
  expect(button.disabled).toBe(false);
  const submit = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submit);
  expect(submit.defaultPrevented).toBe(true);
  expect(button.disabled).toBe(true);
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  expect(document.querySelector('#login-error')?.textContent).toContain(
    'The sign-in module could not load. Reload this page and try again.',
  );
  expect(form.querySelector<HTMLInputElement>('[name="password"]')!.value).toBe(
    '',
  );
  expect(form.hasAttribute('aria-busy')).toBe(false);
  expect(document.querySelector<HTMLElement>('#editor-root')!.hidden).toBe(
    true,
  );
});
