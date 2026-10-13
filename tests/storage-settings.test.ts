// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import StorageSettings from '../src/editor/StorageSettings';
import {
  parseR2Account,
  testStorageConnection,
  validateStorageConfig,
} from '../src/integrations/media';

vi.mock('../src/integrations/media', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/integrations/media')>()),
  testStorageConnection: vi.fn(),
}));

const config = {
  accountId: 'a'.repeat(32),
  bucket: 'original-bucket',
  publicURL: 'https://media.example.test',
  accessKeyId: 'fixture-access',
  secretAccessKey: 'fixture-secret',
  maxMB: 30,
  variantWidths: [480, 960, 1600],
  quality: 0.8,
};
let root: Root | undefined;
let host: HTMLDivElement;
const onSave = vi.fn();
const onCancel = vi.fn();
async function mount() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(createElement(StorageSettings, { config, onSave, onCancel })),
  );
}
async function fill(id: string, value: string) {
  const input = host.querySelector<HTMLInputElement>(`#r2-${id}`)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(
    (b) => b.textContent === label,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  host?.remove();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

it('accepts account IDs and standard bucket endpoints without guessing unsupported endpoints', () => {
  expect(parseR2Account(` ${config.accountId} `)).toEqual({
    accountId: config.accountId,
  });
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
  expect(parseR2Account(endpoint)).toEqual({ accountId: config.accountId });
  expect(parseR2Account(`${endpoint}/test-bucket/`)).toEqual({
    accountId: config.accountId,
    bucket: 'test-bucket',
  });
  for (const invalid of [
    '',
    'invalid',
    endpoint.replace('https:', 'http:'),
    endpoint.replace('.r2.', '.eu.r2.'),
    `${endpoint}.example.com/bucket`,
    `${endpoint}/bucket/object`,
    `${endpoint}?query=1`,
    endpoint.replace('https://', 'https://user:pass@'),
  ])
    expect(() => parseR2Account(invalid)).toThrow('account ID');
});

it('validates setup before use and keeps custom public paths and originals-only uploads', () => {
  expect(
    validateStorageConfig({
      ...config,
      publicURL: ' https://media.example.test/assets/ ',
      variantWidths: [],
    }),
  ).toMatchObject({
    publicURL: 'https://media.example.test/assets',
    variantWidths: [],
  });
  for (const invalid of [
    { bucket: ' ' },
    { publicURL: 'not a URL' },
    { publicURL: 'http://media.example.test' },
    {
      publicURL: `https://${config.accountId}.r2.cloudflarestorage.com/bucket`,
    },
    { publicURL: 'https://media.example.test?query=1' },
    { publicURL: 'https://user:pass@media.example.test' },
    { accessKeyId: ' ' },
    { secretAccessKey: '' },
    { maxMB: 0 },
    { maxMB: Infinity },
    { quality: 0 },
    { quality: 1.1 },
    { variantWidths: [32] },
    { variantWidths: [4097] },
    { variantWidths: [NaN] },
  ])
    expect(() => validateStorageConfig({ ...config, ...invalid })).toThrow();
});

it('prefills pasted endpoints, keeps edits local, and saves only valid settings', async () => {
  await mount();
  expect(host.querySelector('details')!.open).toBe(false);
  expect(host.querySelector<HTMLInputElement>('#r2-secret')!.type).toBe(
    'password',
  );
  await fill(
    'account',
    `https://${'b'.repeat(32)}.r2.cloudflarestorage.com/new-bucket`,
  );
  expect(host.querySelector<HTMLInputElement>('#r2-account')!.value).toBe(
    'b'.repeat(32),
  );
  expect(host.querySelector<HTMLInputElement>('#r2-bucket')!.value).toBe(
    'new-bucket',
  );
  await fill('account', `https://${config.accountId}.r2.cloudflarestorage.com`);
  expect(host.querySelector<HTMLInputElement>('#r2-bucket')!.value).toBe(
    'new-bucket',
  );
  await fill('public', `https://${config.accountId}.r2.cloudflarestorage.com`);
  await click('Save settings');
  expect(onSave).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')!.textContent).toContain(
    'Public Development URL',
  );
  await fill('public', ' https://pub-fixture.r2.dev/ ');
  await fill('widths', '480,');
  expect(host.querySelector<HTMLInputElement>('#r2-widths')!.value).toBe(
    '480,',
  );
  await click('Save settings');
  expect(onSave).not.toHaveBeenCalled();
  await fill('widths', '480, 1200');
  await click('Save settings');
  expect(onSave).toHaveBeenCalledExactlyOnceWith({
    ...config,
    bucket: 'new-bucket',
    publicURL: 'https://pub-fixture.r2.dev',
    variantWidths: [480, 1200],
  });
  expect(config.bucket).toBe('original-bucket');
});

it('does not apply cancelled edits and reports storage failures without claiming success', async () => {
  await mount();
  await fill('bucket', 'cancelled-bucket');
  await click('Cancel');
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onSave).not.toHaveBeenCalled();
  onSave.mockImplementation(() => {
    throw Error('Session storage unavailable.');
  });
  await click('Save settings');
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(
    'Session storage unavailable.',
  );
  expect(host.textContent).toContain('Settings stay in this tab');
});

it('copies CORS for the current editor origin and offers manual copy if clipboard access fails', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal(
    'navigator',
    Object.assign(Object.create(navigator), { clipboard: { writeText } }),
  );
  await mount();
  await click('Copy CORS policy');
  const policy = JSON.parse(writeText.mock.calls[0][0]);
  expect(policy).toEqual([
    {
      AllowedOrigins: [window.location.origin],
      AllowedMethods: ['GET', 'HEAD', 'PUT', 'DELETE'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ]);
  expect(host.querySelector('[role="status"]')!.textContent).toBe(
    'CORS policy copied.',
  );
  expect(onSave).not.toHaveBeenCalled();
  writeText.mockRejectedValue(Error('Clipboard denied'));
  await click('Copy CORS policy');
  expect(
    JSON.parse(host.querySelector<HTMLTextAreaElement>('#r2-cors')!.value),
  ).toEqual(policy);
  expect(host.querySelector('[role="status"]')!.textContent).toBe('');
});

it('tests unsaved settings without saving, prevents concurrent edits and clears success after editing', async () => {
  let finish!: () => void;
  vi.mocked(testStorageConnection).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await mount();
  await fill('bucket', 'unsaved-bucket');
  await click('Test connection');
  expect(testStorageConnection).toHaveBeenCalledExactlyOnceWith({
    ...config,
    bucket: 'unsaved-bucket',
  });
  expect(host.querySelector('fieldset')!.disabled).toBe(true);
  expect(
    host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled,
  ).toBe(true);
  expect(host.textContent).toContain('Testing connection…');
  expect(onSave).not.toHaveBeenCalled();
  await act(async () => finish());
  expect(host.textContent).toContain(
    'Connection works. Upload, public read and cleanup succeeded.',
  );
  expect(host.querySelector('fieldset')!.disabled).toBe(false);
  await fill('public', 'https://different.example.test');
  expect(host.textContent).not.toContain('Connection works.');
  expect(onSave).not.toHaveBeenCalled();
});

it('shows validation errors before starting a connection test', async () => {
  await mount();
  await fill('account', '');
  await click('Test connection');
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    'account ID',
  );
  expect(testStorageConnection).not.toHaveBeenCalled();
});

it('shows test failures, allows retry, and leaves settings available to save', async () => {
  vi.mocked(testStorageConnection)
    .mockRejectedValueOnce(Error('Check the CORS policy.'))
    .mockResolvedValueOnce();
  await mount();
  await click('Test connection');
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(
    'Check the CORS policy.',
  );
  expect(host.querySelector('fieldset')!.disabled).toBe(false);
  await click('Test connection');
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain('Connection works.');
  expect(onSave).not.toHaveBeenCalled();
  await click('Save settings');
  expect(onSave).toHaveBeenCalledExactlyOnceWith(config);
});

it('allows dismissal during a test without saving or interrupting its cleanup', async () => {
  let finish!: () => void;
  vi.mocked(testStorageConnection).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await mount();
  await click('Test connection');
  await click('Cancel');
  expect(onCancel).toHaveBeenCalledOnce();
  await act(async () => root!.unmount());
  root = undefined;
  await act(async () => finish());
  expect(onSave).not.toHaveBeenCalled();
});
