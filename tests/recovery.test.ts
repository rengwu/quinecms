// @vitest-environment jsdom
import { modelFixture } from './support/content-model';
import { it, expect, afterEach } from 'vitest';
import { readRecovery, retain, recoveryKey } from '../src/editor/recovery';
import { fixture } from './support/fixture';
afterEach(() => sessionStorage.clear());
it('rejects invalid and incompatible recovery data without throwing', () => {
  sessionStorage.setItem(recoveryKey, '{broken');
  expect(readRecovery()).toBeNull();
  sessionStorage.setItem(recoveryKey, JSON.stringify({ version: 900 }));
  expect(readRecovery()).toBeNull();
});
it('recovers incomplete content with its repository identity', () => {
  const content = fixture();
  content.pages[0].blocks[0].props.title = '';
  content.collections[0].fields[0].key = '';
  const repository = { owner: 'test', repo: 'site', branch: 'draft' };
  retain({ version: 1, repository, base: null, content });
  expect(readRecovery()?.content.collections[0].fields[0].key).toBe('');
  expect(readRecovery()?.repository).toEqual(repository);
  expect(readRecovery()?.content.pages[0].blocks[0].props.title).toBe('');
  expect(sessionStorage.getItem(recoveryKey)).not.toContain('secretAccessKey');
});

it('retains GitLab instance and namespace without credentials and rejects unknown providers', () => {
  const repository = {
    provider: 'gitlab' as const,
    instance: 'https://gitlab.example.com',
    owner: 'team/subgroup',
    repo: 'site',
    branch: 'draft',
  };
  const value = {
    version: 1 as const,
    repository,
    base: null,
    content: fixture(),
  };
  retain(value);
  expect(readRecovery()?.repository).toEqual(repository);
  sessionStorage.setItem(
    recoveryKey,
    JSON.stringify({
      ...value,
      repository: { ...repository, provider: 'unsupported' },
    }),
  );
  expect(readRecovery()).toBeNull();
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
