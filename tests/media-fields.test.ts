// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/editor/App';
import { migrateSite } from '../src/core/layouts';
import { upload } from '../src/integrations/media';
import { readRecovery } from '../src/editor/recovery';
import type { Block, Content, Media } from '../src/core/types';

vi.mock('../src/integrations/media', async (original) => ({
  ...(await original<typeof import('../src/integrations/media')>()),
  upload: vi.fn(),
}));
vi.mock('../src/editor/Island', () => ({
  default: ({ block }: { block: Block }) =>
    createElement('div', {
      'data-preview-island': block.id,
      'data-preview-props': JSON.stringify(block.props),
    }),
}));
const config = {
  git: null,
  encryptedAdmin: false,
  r2: null,
};
const storage = {
  accountId: 'a'.repeat(32),
  bucket: 'fixture',
  publicURL: 'https://media.example.test',
  accessKeyId: 'fixture-access',
  secretAccessKey: 'fixture-secret',
  maxMB: 30,
  variantWidths: [480, 960, 1600],
  quality: 0.8,
};
const oldMedia: Media = {
  formatVersion: 1,
  id: 'media_old',
  name: 'Old image',
  original: { key: 'old.jpg', url: '/old.jpg', mime: 'image/jpeg', bytes: 10 },
  variants: [],
};
const uploaded: Media = {
  formatVersion: 1,
  id: 'media_new',
  name: 'New image',
  original: {
    key: 'new.jpg',
    url: 'https://media.example.test/new.jpg',
    mime: 'image/jpeg',
    bytes: 10,
  },
  variants: [
    {
      key: '480.webp',
      url: 'https://media.example.test/480.webp',
      mime: 'image/webp',
      bytes: 5,
    },
  ],
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
      blocks: [
        {
          id: 'block_media',
          type: 'media',
          version: 1,
          props: {
            file: { mediaId: oldMedia.id, alt: 'Old alt' },
            caption: '',
          },
        },
        {
          id: 'block_other',
          type: 'media',
          version: 1,
          props: {
            file: { mediaId: oldMedia.id, alt: 'Other alt' },
            caption: '',
          },
        },
      ],
    },
  ],
  collections: [],
  objects: [],
  entries: [],
  media: [oldMedia],
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

let root: Root | undefined;
let host: HTMLDivElement;
async function mount(initial = content, configured = true) {
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
  vi.mocked(upload).mockResolvedValue(uploaded);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      createElement(App, {
        initial: structuredClone(initial),
        config: { ...config, r2: configured ? storage : null },
      }),
    ),
  );
}
const panel = () =>
  host.querySelector<HTMLElement>(
    '[aria-label="Site builder"], [aria-label="Admin workspace"]',
  )!;
function button(label: string, scope: ParentNode = host) {
  const result = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
    (el) =>
      !el.closest('[hidden]') &&
      (el.getAttribute('aria-label') === label ||
        el.textContent?.trim() === label),
  );
  expect(result, `Missing button: ${label}`).toBeDefined();
  return result!;
}
async function click(label: string, scope?: ParentNode) {
  await act(async () => button(label, scope).click());
  await act(async () => vi.dynamicImportSettled());
}
async function fill(label: string, value: string) {
  const input = host.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  expect(input).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function openBlock() {
  await click('Home');
  await click('Media v1', panel());
}
async function chooseFile(
  label = 'File for File',
  file: File | null = new File(['fixture'], 'photo.jpg', {
    type: 'image/jpeg',
  }),
) {
  const input = [
    ...panel().querySelectorAll<HTMLInputElement>('input[type="file"]'),
  ].find(
    (el) =>
      el.getAttribute('aria-label') === label &&
      !el.closest('[data-panel-level][hidden], [data-panel-parent][hidden]'),
  )!;
  expect(input).toBeDefined();
  await act(async () => {
    Object.defineProperty(input, 'files', {
      value: file ? [file] : [],
      configurable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
const draft = () => readRecovery()!.content;
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  host?.remove();
  sessionStorage.clear();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.mocked(upload).mockReset();
});

it('selects the uploaded file, updates its preview, and keeps it in Media after cancelling block changes', async () => {
  await mount();
  await openBlock();
  await chooseFile();
  expect(upload).toHaveBeenCalledTimes(1);
  expect(vi.mocked(upload).mock.calls[0][1]).toEqual(storage);
  expect(sessionStorage.getItem('lean:r2')).toBeNull();
  expect(JSON.stringify(readRecovery())).not.toContain(storage.secretAccessKey);
  expect(draft().pages[0].blocks[0].props.file).toEqual({
    mediaId: uploaded.id,
    alt: '',
  });
  expect(draft().pages[0].blocks[1]).toEqual(content.pages[0].blocks[1]);
  expect(draft().media).toEqual([oldMedia, uploaded]);
  expect(
    panel().querySelector('img[alt="New image"]')?.getAttribute('src'),
  ).toBe(uploaded.variants[0].url);
  expect(
    host
      .querySelector('[data-preview-island="block_media"]')
      ?.getAttribute('data-preview-props'),
  ).toContain(uploaded.id);
  await click('Cancel block changes');
  expect(draft().pages[0].blocks[0]).toEqual(content.pages[0].blocks[0]);
  expect(draft().media).toEqual([oldMedia, uploaded]);
});

it('shows progress, holds editing/navigation during upload, and restores the field after failure for retry', async () => {
  await mount();
  await openBlock();
  let reject!: (error: Error) => void;
  vi.mocked(upload).mockImplementationOnce((_file, _config, progress) => {
    progress('Uploading original.jpg…');
    return new Promise((_resolve, fail) => {
      reject = fail;
    });
  });
  await chooseFile();
  expect(panel().textContent).toContain('Uploading original.jpg…');
  expect(button('Upload for File').disabled).toBe(true);
  expect(button('Cancel block changes').matches(':disabled')).toBe(true);
  expect(button('Pages').disabled).toBe(true);
  expect(draft().media).toEqual([oldMedia]);
  await act(async () => reject(new Error('Upload failed: connection lost.')));
  expect(panel().querySelector('[role="alert"]')?.textContent).toContain(
    'connection lost',
  );
  expect(draft().pages[0].blocks[0].props.file).toEqual(
    content.pages[0].blocks[0].props.file,
  );
  expect(button('Upload for File').disabled).toBe(false);
  await chooseFile();
  expect(draft().media).toEqual([oldMedia, uploaded]);
  expect(panel().querySelector('[role="alert"]')).toBeNull();
});

it('hides upload and storage controls when the build has no storage, while preserving existing media and edits', async () => {
  // Old tab settings cannot enable uploads or override build configuration.
  sessionStorage.setItem('lean:r2', JSON.stringify(storage));
  await mount(content, false);
  await openBlock();
  await fill('Caption', 'Keep this caption');
  expect(panel().querySelector('input[type="file"]')).toBeNull();
  expect(panel().querySelector('[aria-label="Upload for File"]')).toBeNull();
  expect(panel().querySelector('img[alt="Old image"]')).not.toBeNull();
  expect(
    (panel().querySelector('[aria-label="Caption"]') as HTMLInputElement).value,
  ).toBe('Keep this caption');
  expect(upload).not.toHaveBeenCalled();
  await click('Cancel block changes');
  await click('Media');
  expect(host.textContent).toContain('Uploads are unavailable for this site.');
  expect(host.textContent).not.toContain('Storage settings');
  expect(host.textContent).not.toContain('R2 storage');
  expect(host.querySelector('input[type="file"]')).toBeNull();
  expect(draft().media).toEqual([oldMedia]);
});

it('uses encrypted build settings instead of stale session settings without exposing setup controls', async () => {
  sessionStorage.setItem(
    'lean:r2',
    JSON.stringify({
      ...storage,
      bucket: 'stale-bucket',
      secretAccessKey: 'stale-secret',
    }),
  );
  await mount();
  await click('Media');
  expect(host.textContent).not.toContain('Storage settings');
  expect(host.textContent).not.toContain('R2 storage');
  expect(host.textContent).not.toContain(storage.secretAccessKey);
  await chooseFile('File to upload');
  expect(vi.mocked(upload).mock.calls[0][1]).toEqual(storage);
});

it('updates a nested list image without changing other rows', async () => {
  const initial = structuredClone(content);
  initial.pages[0].blocks = [
    {
      id: 'gallery',
      type: 'intr-gallery',
      version: 1,
      props: {
        images: [
          {
            _rowId: 'first',
            caption: 'First image',
            image: { mediaId: oldMedia.id, alt: 'First' },
          },
          {
            _rowId: 'second',
            caption: 'Second image',
            image: { mediaId: oldMedia.id, alt: 'Second' },
          },
        ],
      },
    },
  ];
  await mount(initial);
  await click('Home');
  await click('Intr · Project gallery v1');
  await click('First image');
  await chooseFile('File for Image');
  const rows = draft().pages[0].blocks[0].props.images as any[];
  expect(rows[0].image).toEqual({ mediaId: uploaded.id, alt: '' });
  expect(rows[1]).toEqual(
    (initial.pages[0].blocks[0].props.images as any[])[1],
  );
  await click(
    '← Back',
    panel().querySelector('[data-panel-level]:not([hidden])')!,
  );
  await click('Cancel block changes');
  expect(draft().pages[0].blocks).toEqual(initial.pages[0].blocks);
  expect(draft().media).toEqual([oldMedia, uploaded]);
});

it('keeps an upload from a cancelled new block without inserting the block', async () => {
  await mount();
  await click('Home');
  await click('Add block');
  await click('Add Media');
  await chooseFile();
  expect(draft().pages[0].blocks).toEqual(content.pages[0].blocks);
  expect(
    host.querySelector('[data-preview-props*="media_new"]'),
  ).not.toBeNull();
  await click('Cancel', panel());
  expect(draft().pages[0].blocks).toEqual(content.pages[0].blocks);
  expect(draft().media).toEqual([oldMedia, uploaded]);
});

it('retains both layout settings and the uploaded record when a layout replaces its content snapshot', async () => {
  await mount();
  await click('Site Layouts');
  await click('Main layout');
  await chooseFile('File for Logo');
  expect((draft().site.layouts![0].design.settings.header as any).logo).toEqual(
    {
      mediaId: uploaded.id,
      alt: '',
    },
  );
  expect(draft().media).toEqual([oldMedia, uploaded]);
  expect(panel().querySelector('img[alt="New image"]')).not.toBeNull();
});

it('uploads from collection entry fields and keeps non-image files selectable without a thumbnail', async () => {
  const initial = structuredClone(content);
  initial.collections = [
    {
      formatVersion: 1,
      id: 'projects',
      name: 'Projects',
      mode: 'many',
      titleField: 'title',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'file', label: 'Attachment', type: 'media' },
      ],
    },
  ];
  initial.entries = [
    {
      formatVersion: 1,
      id: 'project',
      collectionId: 'projects',
      values: { title: 'Project one', file: null },
    },
  ];
  await mount(initial);
  const pdf = {
    ...uploaded,
    original: { ...uploaded.original, mime: 'application/pdf' },
    variants: [],
  };
  vi.mocked(upload).mockResolvedValueOnce(pdf);
  await click('Content');
  await click('Projects');
  await click('Project oneData only');
  await chooseFile(
    'File for Attachment',
    new File(['fixture'], 'notes.pdf', { type: 'application/pdf' }),
  );
  expect(draft().entries[0].values.file).toEqual({
    mediaId: uploaded.id,
    alt: '',
  });
  expect(panel().querySelector('img')).toBeNull();
  expect(draft().media).toEqual([oldMedia, pdf]);
});

it('uses the same upload path from Media and ignores a cancelled file selection', async () => {
  await mount();
  await click('Media');
  await chooseFile('File to upload', null);
  expect(upload).not.toHaveBeenCalled();
  await chooseFile('File to upload');
  expect(draft().pages).toEqual(migrateSite(content).pages);
  expect(draft().media).toEqual([oldMedia, uploaded]);
  expect(panel().textContent).toContain('Save the draft');
});
