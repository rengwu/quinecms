// @vitest-environment jsdom
import { it, expect, vi, beforeEach } from 'vitest';
import { upload } from '../src/integrations/media';
const state = vi.hoisted(() => ({ commands: [] as any[], failAt: 0 }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    async send(command: any) {
      state.commands.push(command);
      if (state.failAt === state.commands.length) throw Error('network failed');
    }
    destroy() {}
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
  bucket: 'test',
  publicURL: 'https://media.example.com',
  accessKeyId: 'fixture',
  secretAccessKey: 'fixture',
  maxMB: 30,
  variantWidths: [480, 960, 1600],
  quality: 0.8,
};
function file() {
  const f = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
  Object.defineProperty(f, 'arrayBuffer', {
    value: async () => new ArrayBuffer(4),
  });
  return f;
}
beforeEach(() => {
  state.commands = [];
  state.failAt = 0;
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width: 1200, height: 800, close: vi.fn() })),
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as any);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (callback) => {
      const blob = new Blob(['variant'], { type: 'image/webp' });
      Object.defineProperty(blob, 'arrayBuffer', {
        value: async () => new ArrayBuffer(7),
      });
      callback(blob);
    },
  );
});
it('uploads original plus only smaller configured variants and returns stable metadata', async () => {
  const result = await upload(file(), config, () => {});
  expect(result.original.width).toBe(1200);
  expect(result.variants.map((v) => v.width)).toEqual([480, 960]);
  expect(state.commands.filter((c) => c.kind === 'put')).toHaveLength(3);
  expect(result.original.url).toBe(
    'https://media.example.com/' + result.original.key,
  );
  expect(JSON.stringify(result)).not.toContain('fixture');
});
it('cleans up completed objects when a later upload fails', async () => {
  state.failAt = 2;
  await expect(upload(file(), config, () => {})).rejects.toThrow(
    'network failed',
  );
  expect(state.commands.at(-1).kind).toBe('delete');
});
it('rejects executable document types before network calls', async () => {
  await expect(
    upload(
      new File(['<script>'], 'bad.svg', { type: 'image/svg+xml' }),
      config,
      () => {},
    ),
  ).rejects.toThrow('Choose');
  expect(state.commands).toHaveLength(0);
});
it('rejects invalid storage settings before decoding or uploading', async () => {
  await expect(
    upload(
      file(),
      {
        ...config,
        publicURL: 'https://' + config.accountId + '.r2.cloudflarestorage.com',
      },
      () => {},
    ),
  ).rejects.toThrow('Public Development URL');
  expect(createImageBitmap).not.toHaveBeenCalled();
  expect(state.commands).toHaveLength(0);
});
it('keeps the original when image decoding fails', async () => {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => {
      throw Error('unsupported');
    }),
  );
  const result = await upload(file(), config, () => {});
  expect(result.variants).toEqual([]);
  expect(state.commands).toHaveLength(1);
});
