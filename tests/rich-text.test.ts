// @vitest-environment jsdom
import { it, expect, vi } from 'vitest';
import { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import RichText from '../src/editor/RichText';
it('mounts the extension composer and honors read-only changes', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const props = {
    value:
      '## Heading\n\nA **bold** paragraph.\n\n![Video](youtube:jNQXAC9IVRw)',
    onChange: vi.fn(),
    field: { key: 'body', label: 'Body', type: 'text' as const },
    errors: [],
    readOnly: false,
  };
  await act(async () => root.render(createElement(RichText, props)));
  expect(host.querySelector('[contenteditable="true"]')?.textContent).toContain(
    'Heading',
  );
  expect(host.querySelector('strong')?.textContent).toBe('bold');
  expect(
    host.querySelector('[aria-label="Remove embedded media"]'),
  ).not.toBeNull();
  await act(async () =>
    root.render(createElement(RichText, { ...props, readOnly: true })),
  );
  expect(host.querySelector('[contenteditable="true"]')).toBeNull();
  expect(host.querySelector('[aria-label="Remove embedded media"]')).toBeNull();
  await act(async () => root.unmount());
  host.remove();
});
it('preserves unsupported Markdown in the source fallback', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  const root = createRoot(host);
  const value = '```js\nconsole.log("hello")\n```';
  await act(async () =>
    root.render(
      createElement(RichText, {
        value,
        onChange: vi.fn(),
        field: { key: 'body', label: 'Body', type: 'text' },
        errors: [],
        readOnly: false,
      }),
    ),
  );
  expect(host.querySelector('textarea')?.value).toBe(value);
  await act(async () => root.unmount());
});

it('inserts and removes an uploaded image without losing surrounding Markdown', async () => {
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
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const onChange = vi.fn();
  await act(async () =>
    root.render(
      createElement(RichText, {
        value: 'Keep this paragraph.',
        onChange,
        field: { key: 'body', label: 'Body', type: 'richtext' },
        errors: [],
        readOnly: false,
        media: [
          {
            formatVersion: 1,
            id: 'media_cover',
            name: 'Cover',
            original: {
              key: 'cover.jpg',
              url: 'https://media.example.com/cover.jpg',
              mime: 'image/jpeg',
              bytes: 20,
            },
            variants: [],
          },
        ],
      }),
    ),
  );
  const button = (label: string) =>
    [...document.querySelectorAll('button')].find(
      (b) => b.textContent === label,
    )!;
  await act(async () => button('Image').click());
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[role="combobox"]')!.click(),
  );
  await act(async () =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((o) => o.textContent === 'Cover')!
      .click(),
  );
  expect(button('Insert image').disabled).toBe(false);
  await act(async () => button('Insert image').click());
  expect(host.querySelector('img')?.src).toBe(
    'https://media.example.com/cover.jpg',
  );
  expect(onChange.mock.lastCall?.[0]).toContain('(media:media_cover)');
  expect(onChange.mock.lastCall?.[0]).toContain('Keep this paragraph.');
  await act(async () =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Remove embedded media"]')!
      .click(),
  );
  expect(host.querySelector('img')).toBeNull();
  expect(onChange.mock.lastCall?.[0]).not.toContain('(media:media_cover)');
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
