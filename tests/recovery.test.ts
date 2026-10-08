// @vitest-environment jsdom
import { modelFixture } from './support/content-model';
import { it, expect, afterEach } from 'vitest';
import { readRecovery, retain, recoveryKey } from '../src/editor/recovery';
import { parseFiles } from '../src/core/content';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
afterEach(() => sessionStorage.clear());
it('rejects invalid and incompatible recovery data without throwing', () => {
  sessionStorage.setItem(recoveryKey, '{broken');
  expect(readRecovery()).toBeNull();
  sessionStorage.setItem(recoveryKey, JSON.stringify({ version: 900 }));
  expect(readRecovery()).toBeNull();
});
it('recovers incomplete content with its repository identity', () => {
  const files: Record<string, string> = {};
  function walk(dir: string) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, f.name);
      if (f.isDirectory()) walk(path);
      else if (path.endsWith('.json')) files[path] = readFileSync(path, 'utf8');
    }
  }
  walk('content');
  const content = parseFiles(files);
  content.pages[0].blocks[0].props.title = '';
  content.collections[0].fields[0].key = '';
  const repository = { owner: 'test', repo: 'site', branch: 'draft' };
  retain({ version: 1, repository, base: null, content });
  expect(readRecovery()?.content.collections[0].fields[0].key).toBe('');
  expect(readRecovery()?.repository).toEqual(repository);
  expect(readRecovery()?.content.pages[0].blocks[0].props.title).toBe('');
  expect(sessionStorage.getItem(recoveryKey)).not.toContain('secretAccessKey');
});

it('recovers unfinished recursive definitions without expanding them and preserves unreadable drafts', () => {
  const content = modelFixture();
  content.objects[0].fields.push({
    key: 'self',
    label: 'Self',
    type: 'object',
    objectId: content.objects[0].id,
  });
  retain({
    version: 1,
    repository: { owner: '', repo: '', branch: 'draft' },
    base: null,
    content,
  });
  expect(readRecovery()?.content).toEqual(content);
  sessionStorage.setItem(recoveryKey, '{broken');
  expect(readRecovery()).toBeNull();
  expect(() =>
    retain({
      version: 1,
      repository: { owner: '', repo: '', branch: 'draft' },
      base: null,
      content,
    }),
  ).toThrow('preserved');
  expect(sessionStorage.getItem(recoveryKey)).toBe('{broken');
});
