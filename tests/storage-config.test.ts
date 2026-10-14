import { expect, it } from 'vitest';
import {
  parseR2Account,
  validateStorageConfig,
} from '../src/integrations/media';
import { storageFromEnv } from '../src/admin/storage';

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
const env = {
  R2_ACCOUNT_ID: config.accountId,
  R2_BUCKET: config.bucket,
  R2_PUBLIC_URL: config.publicURL,
  R2_ACCESS_KEY_ID: config.accessKeyId,
  R2_SECRET_ACCESS_KEY: config.secretAccessKey,
};

it('disables uploads when connection values are blank, even with documented upload defaults', () => {
  expect(storageFromEnv({})).toBeNull();
  expect(
    storageFromEnv({
      R2_ACCOUNT_ID: ' ',
      R2_MAX_MB: '30',
      R2_IMAGE_WIDTHS: '480,960,1600',
      R2_IMAGE_QUALITY: '0.8',
    }),
  ).toBeNull();
});

it('requires complete credentials without printing supplied secrets', () => {
  const partial = { R2_SECRET_ACCESS_KEY: config.secretAccessKey };
  expect(() => storageFromEnv(partial)).toThrow(
    'R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL, R2_ACCESS_KEY_ID',
  );
  try {
    storageFromEnv(partial);
  } catch (error) {
    expect(String(error)).not.toContain(config.secretAccessKey);
  }
});

it('applies defaults and parses explicit upload settings', () => {
  expect(storageFromEnv(env)).toEqual(config);
  expect(
    storageFromEnv({
      ...env,
      R2_MAX_MB: '12.5',
      R2_IMAGE_WIDTHS: '640, 1280',
      R2_IMAGE_QUALITY: '0.7',
    }),
  ).toMatchObject({ maxMB: 12.5, variantWidths: [640, 1280], quality: 0.7 });
  expect(
    storageFromEnv({ ...env, R2_IMAGE_WIDTHS: '' })?.variantWidths,
  ).toEqual([]);
});

it.each([
  { R2_MAX_MB: 'no' },
  { R2_MAX_MB: '0' },
  { R2_IMAGE_WIDTHS: '480,,960' },
  { R2_IMAGE_WIDTHS: '1' },
  { R2_IMAGE_QUALITY: 'NaN' },
  { R2_PUBLIC_URL: 'http://media.example.test' },
])(
  'rejects invalid environment configuration before producing a usable editor: %j',
  (invalid) => {
    expect(() => storageFromEnv({ ...env, ...invalid })).toThrow(
      'Invalid R2 configuration:',
    );
  },
);
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
