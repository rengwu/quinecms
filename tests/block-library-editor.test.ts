// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, createElement, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Fields from '../src/editor/Fields';
import BlockCatalog from '../src/editor/BlockCatalog';
import { definitions } from '../src/generated/definitions';
import { newBlock } from '../src/core/content';
import type { Content, Values } from '../src/core/types';
vi.mock('../src/editor/Island', () => ({
  default: () => createElement('div', { 'data-renderer': 'mock' }),
}));
let root: Root, host: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  vi.restoreAllMocks();
});
async function mount(component: any) {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(component));
}
const button = (name: string) =>
  [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => (b.getAttribute('aria-label') || b.textContent)?.trim() === name,
  )!;
async function click(name: string) {
  expect(button(name), name).toBeDefined();
  await act(async () => button(name).click());
}
async function input(label: string, value: string) {
  const el = host.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  expect(el).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
it('edits, adds, keyboard reorders and deletes repeatable content while keeping identities and independent input IDs', async () => {
  const d = definitions.find((d) => d.type === 'tw-faq-1')!;
  let latest: Values = {};
  function Harness() {
    const [v, set] = useState(newBlock(d).props);
    latest = v;
    return createElement(Fields, {
      fields: d.fields,
      values: v,
      onChange: set,
      media: [],
    });
  }
  await mount(createElement(Harness));
  const original = (latest.items as Values[]).map((r) => r._rowId);
  await click('Where should I begin?');
  await input('Question', 'Updated question');
  await click('← Back');
  await act(async () =>
    button('Updated question').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
      }),
    ),
  );
  expect((latest.items as Values[])[1]).toMatchObject({
    _rowId: original[0],
    question: 'Updated question',
  });
  await click('Add item');
  await input('Question', 'Another question');
  await click('← Back');
  expect(latest.items).toHaveLength(5);
  await click('Another question');
  await click('Remove item');
  expect(latest.items).toHaveLength(4);
  expect(new Set((latest.items as Values[]).map((r) => r._rowId)).size).toBe(4);
});
it('combines search/tag filters, has reset and separate preview, and only inserts on Add', async () => {
  const content: Content = {
    site: {
      id: 'site',
      formatVersion: 1,
      title: 'Site',
      globals: {},
      navigation: [],
    },
    pages: [],
    collections: [],
    entries: [],
    media: [],
  };
  const added: string[] = [];
  await mount(
    createElement(BlockCatalog, {
      definitions,
      content,
      kind: 'static',
      onAdd: (d) => added.push(d.type),
    }),
  );
  expect(button('Reset filters').disabled).toBe(true);
  await input('Search blocks', 'split');
  expect(button('Reset filters').disabled).toBe(false);
  await click('hero');
  expect(host.textContent).toContain('1 block');
  expect(button('Add Split image')).toBeDefined();
  await click('Preview Split image');
  expect(added).toEqual([]);
  await click('Desktop');
  expect(host.querySelector('[data-mobile="true"]')).not.toBeNull();
  await click('← Back');
  await input('Search blocks', 'nothing here');
  expect(host.textContent).toContain('No matching blocks');
  await click('Reset filters');
  expect(button('Reset filters').disabled).toBe(true);
  expect(
    host.querySelector<HTMLInputElement>('input[aria-label="Search blocks"]')
      ?.value,
  ).toBe('');
  expect(button('hero').getAttribute('aria-pressed')).toBe('false');
  await click('Add Split image');
  expect(added).toEqual(['tw-hero-2']);
});
