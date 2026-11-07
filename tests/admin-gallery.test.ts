// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Vitest does not load CSS, which Foundations reads as text. That section
// renders no editor components; the others exercise their current props.
vi.mock('../tools/admin-gallery/specimens/foundations', () => ({
  default: { id: 'foundations', title: 'Foundations', specimens: [] },
}));

function names(directory: string) {
  const files = readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => readFileSync(join(directory, file), 'utf8'));
  return new Set(
    files.flatMap((source) =>
      [
        ...source.matchAll(
          /import\s*\{([^}]*)\}\s*from\s*'(?:(?:[^']*\/ui)|@phosphor-icons\/react)'/g,
        ),
      ].flatMap((m) =>
        m[1]
          .split(',')
          .map((name) => name.replace(/^\s*type\s+/, '').trim())
          .filter(Boolean),
      ),
    ),
  );
}

it('shows every UI component and icon the editor imports', () => {
  const gallery = names('tools/admin-gallery');
  expect([...names('src/editor')].filter((name) => !gallery.has(name))).toEqual(
    [],
  );
});

it('renders every specimen state', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const { default: Gallery } = await import('../tools/admin-gallery/Gallery');
  const host = document.body.appendChild(document.createElement('div'));
  const root = createRoot(host);
  await act(async () => root.render(createElement(Gallery)));
  const failures: string[] = [];
  for (const card of host.querySelectorAll('article')) {
    for (const group of card.querySelectorAll('header [role="group"]')) {
      if (group.getAttribute('aria-label') === 'Interaction') continue;
      for (const button of group.querySelectorAll('button')) {
        await act(async () => button.click());
        const error = card.querySelector('[data-specimen-error]');
        if (error)
          failures.push(
            `${card.getAttribute('aria-label')} · ${button.textContent}: ${error.textContent}`,
          );
      }
    }
  }
  expect(failures).toEqual([]);
  act(() => root.unmount());
  vi.unstubAllGlobals();
}, 120_000);
