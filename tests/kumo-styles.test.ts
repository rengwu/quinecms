// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, it } from 'vitest';
import { scopeKumoStyles } from '../scripts/kumo-styles.mjs';

it('keeps Kumo resets and theme tokens out of preview blocks', () => {
  document.body.innerHTML =
    '<aside class="kumo-ui" data-mode="dark"><h1>Editor</h1><button>Save</button></aside><main><h1>Preview</h1><button>Counter</button></main>';
  const scoped = postcss.parse(
    scopeKumoStyles(
      ':root {--color:red} * {margin:0} h1,button {font:inherit} [data-mode="dark"] {color:white} @keyframes spin {to {transform:rotate(360deg)}}',
    ),
  );
  const matched = new Set<Element>();
  scoped.walkRules((rule) => {
    if (rule.parent?.type === 'atrule') {
      expect(rule.selector).toBe('to');
      return;
    }
    for (const element of document.querySelectorAll(rule.selector))
      matched.add(element);
  });
  expect([...matched].some((el) => el.textContent === 'Save')).toBe(true);
  expect([...matched].every((el) => el.closest('.kumo-ui'))).toBe(true);
});

it('scopes every non-keyframe rule in the shipped Kumo stylesheet', () => {
  const css = readFileSync(
    'node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css',
    'utf8',
  );
  const root = postcss.parse(scopeKumoStyles(css));
  root.walkRules((rule) => {
    for (
      let parent: postcss.AnyNode | undefined = rule.parent;
      parent;
      parent = parent.parent
    )
      if (parent.type === 'atrule' && /keyframes$/.test(parent.name)) return;
    expect(
      rule.selectors.every((selector) => selector.includes('.kumo-ui')),
    ).toBe(true);
  });
});
