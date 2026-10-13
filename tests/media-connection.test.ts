// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { testStorageConnection } from '../src/integrations/media';

const state = vi.hoisted(() => ({
  commands: [] as any[],
  failPut: false,
  failDelete: false,
  destroy: vi.fn(),
}));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    async send(command: any, options: any) {
      state.commands.push({ ...command, options });
      if (command.kind === 'put' ? state.failPut : state.failDelete)
        throw Error('fixture failure');
    }
    destroy = state.destroy;
  },
  PutObjectCommand: class {
    kind = 'put';
    constructor(public input: any) {}
  },
  DeleteObjectCommand: class {
    kind = 'delete';
    constructor(public input: any) {}
  },
}));
const config = {
  accountId: 'a'.repeat(32),
  bucket: 'fixture-bucket',
  publicURL: 'https://media.example.test',
  accessKeyId: 'fixture-access',
  secretAccessKey: 'fixture-secret',
  maxMB: 30,
  variantWidths: [480],
  quality: 0.8,
};
const publicRead = vi.fn();
beforeEach(() => {
  state.commands = [];
  state.failPut = state.failDelete = false;
  publicRead.mockImplementation(async () => ({
    ok: true,
    text: async () =>
      new TextDecoder().decode(
        state.commands.findLast((c) => c.kind === 'put').input.Body,
      ),
  }));
  vi.stubGlobal('fetch', publicRead);
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

it('writes a unique probe, verifies its public body without credentials and cleans up only that key', async () => {
  await testStorageConnection(config);
  const [put, remove] = state.commands;
  expect(put.kind).toBe('put');
  expect(put.input).toMatchObject({
    Bucket: config.bucket,
    ContentType: 'text/plain',
    CacheControl: 'no-store',
  });
  expect(put.input.Key).toMatch(/^connection-test\/[\da-f-]+\.txt$/);
  expect(new TextDecoder().decode(put.input.Body)).not.toContain(
    'fixture-secret',
  );
  expect(publicRead).toHaveBeenCalledExactlyOnceWith(
    `${config.publicURL}/${put.input.Key}`,
    expect.objectContaining({ credentials: 'omit', cache: 'no-store' }),
  );
  expect(remove).toMatchObject({
    kind: 'delete',
    input: { Bucket: config.bucket, Key: put.input.Key },
  });
  expect(put.options.abortSignal).toBeInstanceOf(AbortSignal);
  expect(remove.options.abortSignal).not.toBe(put.options.abortSignal);
  expect(state.destroy).toHaveBeenCalledOnce();
  await testStorageConnection(config);
  expect(state.commands[2].input.Key).not.toBe(put.input.Key);
});

it('attempts cleanup after an ambiguous failed write and skips the public read', async () => {
  state.failPut = true;
  await expect(testStorageConnection(config)).rejects.toThrow(
    'Could not upload',
  );
  expect(state.commands.map((c) => c.kind)).toEqual(['put', 'delete']);
  expect(publicRead).not.toHaveBeenCalled();
  expect(state.destroy).toHaveBeenCalledOnce();
});

it.each(['network', 'http', 'wrong body'] as const)(
  'cleans up and explains failed public reads: %s',
  async (failure) => {
    publicRead.mockImplementation(async () => {
      if (failure === 'network') throw new TypeError('Failed to fetch');
      return { ok: failure !== 'http', text: async () => 'unrelated page' };
    });
    await expect(testStorageConnection(config)).rejects.toThrow(
      'Upload worked, but the public media URL',
    );
    expect(state.commands.at(-1).kind).toBe('delete');
    expect(state.destroy).toHaveBeenCalledOnce();
  },
);

it('does not claim success when cleanup fails and identifies the one possible leftover file', async () => {
  state.failDelete = true;
  await expect(testStorageConnection(config)).rejects.toThrow(
    /Could not confirm cleanup of connection-test\//,
  );
  expect(state.destroy).toHaveBeenCalledOnce();
  state.failPut = true;
  await expect(testStorageConnection(config)).rejects.toThrow(
    /Could not upload.*Could not confirm cleanup/,
  );
});

it('rejects invalid settings before any external effects', async () => {
  await expect(
    testStorageConnection({ ...config, bucket: '' }),
  ).rejects.toThrow('bucket name');
  expect(state.commands).toEqual([]);
  expect(publicRead).not.toHaveBeenCalled();
});
