// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import BlockCatalog from '../src/editor/BlockCatalog';
import Island from '../src/editor/Island';
import * as contentModule from '../src/core/content';
import { definitions } from '../src/generated/definitions';
import type { Content } from '../src/core/types';

vi.mock('../src/editor/Island', () => ({
  default: vi.fn(({ block }) =>
    createElement('div', { 'data-renderer': block.type }),
  ),
}));

let root: Root | undefined;
let host: HTMLDivElement;
const choices = ['tw-hero-1', 'tw-hero-2', 'tw-blog-1'].map((type) =>
  definitions.find((d) => d.type === type)!,
);
const content: Content = {
  site: {
    id: 'site',
    formatVersion: 1,
    title: 'Site',
    globals: {},
    navigation: [],
  },
  pages: [],
  objects: [],
  entries: [],
  media: [],
  collections: [
    {
      id: 'real',
      formatVersion: 1,
      name: 'Real collection',
      mode: 'many',
      titleField: 'title',
      fields: [],
    },
  ],
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

class Visibility {
  static instances: Visibility[] = [];
  elements = new Set<Element>();
  constructor(
    public callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit,
  ) {
    Visibility.instances.push(this);
  }
  observe = (element: Element) => this.elements.add(element);
  unobserve = (element: Element) => this.elements.delete(element);
  disconnect = vi.fn(() => this.elements.clear());
  async intersect(element: Element, isIntersecting = true) {
    await act(async () =>
      this.callback(
        [{ target: element, isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    );
  }
}
class Sizes {
  static instances: Sizes[] = [];
  elements = new Set<Element>();
  constructor(public callback: ResizeObserverCallback) {
    Sizes.instances.push(this);
  }
  observe = (element: Element) => this.elements.add(element);
  disconnect = vi.fn(() => this.elements.clear());
}
async function mount() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      createElement(BlockCatalog, {
        definitions: choices,
        content: content,
        kind: 'static',
        onAdd() {},
      }),
    ),
  );
}
function observers() {
  vi.stubGlobal('IntersectionObserver', Visibility);
  vi.stubGlobal('ResizeObserver', Sizes);
}
const thumbnails = () => [
  ...host.querySelectorAll<HTMLElement>('[inert][aria-hidden="true"]'),
];
const renderer = () => host.querySelector('[data-renderer]');
async function search(value: string) {
  const input = host.querySelector<HTMLInputElement>(
    '[aria-label="Search blocks"]',
  )!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function click(name: string) {
  const button = [...host.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || b.textContent)?.trim() === name,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  host?.remove();
  Visibility.instances = [];
  Sizes.instances = [];
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it('prepares only encountered samples, shares site context, and retains previews when scrolling or resizing', async () => {
  observers();
  const resolve = vi.spyOn(contentModule, 'contextFor');
  const clone = vi.spyOn(globalThis, 'structuredClone');
  await mount();
  expect(renderer()).toBeNull();
  expect(clone).not.toHaveBeenCalled();
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(Visibility.instances).toHaveLength(1);
  const visibility = Visibility.instances[0];
  const [first, second, blog] = thumbnails();
  expect(visibility.elements.size).toBe(3);
  expect(visibility.options.root?.contains(first)).toBe(true);
  await visibility.intersect(first);
  const rendered = renderer();
  expect(rendered).not.toBeNull();
  expect(clone).toHaveBeenCalledTimes(1);
  expect(visibility.elements.has(first)).toBe(false);
  await visibility.intersect(first, false);
  await visibility.intersect(first);
  expect(renderer()).toBe(rendered);
  expect(clone).toHaveBeenCalledTimes(1);

  Object.defineProperty(first, 'clientWidth', { value: 240 });
  await act(async () => window.dispatchEvent(new Event('resize')));
  const grid = first.closest('article')!.parentElement!;
  expect(grid.style.getPropertyValue('--catalog-scale')).toBe('0.2');
  expect(renderer()).toBe(rendered);

  await visibility.intersect(second);
  await visibility.intersect(blog);
  const props = vi.mocked(Island).mock.calls.map(([p]) => p);
  expect(props).toHaveLength(3);
  expect(props[0].context.links).toBe(props[1].context.links);
  expect(props[0].context.instanceId).not.toBe(props[1].context.instanceId);
  expect(props[0].context.preview).toBe(true);
  expect(props[0].context.collections![0].id).toBe('real');
  expect(props[2].context.collections![0].id).toBe('catalog-stories');
  expect(props[0].block.props).not.toBe(choices[0].defaults);
  expect(resolve).toHaveBeenCalledTimes(1);
});

it('releases filtered thumbnails and reconnects lazy loading after full preview or empty results', async () => {
  observers();
  await mount();
  const visibility = Visibility.instances[0];
  await visibility.intersect(thumbnails()[0]);
  await search('split');
  expect(renderer()).toBeNull();
  expect(visibility.elements.size).toBe(1);
  await visibility.intersect(thumbnails()[0]);
  await click('Preview Split image');
  expect(visibility.disconnect).toHaveBeenCalledOnce();
  expect(thumbnails()).toHaveLength(0);
  expect(renderer()).not.toBeNull();
  await click('← Back');
  expect(renderer()).toBeNull();
  const next = Visibility.instances[1];
  expect(next.elements.size).toBe(1);
  await search('no-such-block');
  expect(next.elements.size).toBe(0);
  await search('');
  expect(next.elements.size).toBe(3);
  expect(renderer()).toBeNull();
  await next.intersect(thumbnails()[0]);
  expect(renderer()).not.toBeNull();
  await act(async () => root!.unmount());
  root = undefined;
  expect(next.disconnect).toHaveBeenCalledOnce();
  expect(next.elements.size).toBe(0);
  expect(
    Sizes.instances.every((observer) => observer.elements.size === 0),
  ).toBe(true);
});

it('refreshes retained samples when site content changes without remounting the renderer', async () => {
  observers();
  await mount();
  await Visibility.instances[0].intersect(thumbnails()[0]);
  const rendered = renderer();
  const updated: Content = {
    ...content,
    site: { ...content.site, globals: { theme: 'dark', bodyFont: 'georgia' } },
  };
  updated.site.layout = {
    id: 'starter',
    version: 1,
    settings: {
      ...updated.site.globals,
      title: updated.site.title ?? 'Test',
      navigation: updated.site.navigation ?? [],
    },
  };

  await act(async () =>
    root!.render(
      createElement(BlockCatalog, {
        definitions: choices,
        content: updated,
        kind: 'static',
        onAdd() {},
      }),
    ),
  );
  expect(renderer()).toBe(rendered);
  const props = vi.mocked(Island).mock.lastCall![0];
  expect(props.context.globals.theme).toBe('dark');
  expect(rendered!.closest('.site-surface')?.getAttribute('data-theme')).toBe(
    'dark',
  );
});

it('renders usable previews when observer APIs are unavailable', async () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  vi.stubGlobal('ResizeObserver', undefined);
  await mount();
  expect(host.querySelectorAll('[data-renderer]')).toHaveLength(3);
  await search('split');
  expect(host.querySelectorAll('[data-renderer]')).toHaveLength(1);
  await click('Preview Split image');
  expect(renderer()).not.toBeNull();
});
