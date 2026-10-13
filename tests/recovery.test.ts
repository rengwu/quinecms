// @vitest-environment jsdom
import { modelFixture } from './support/content-model';
import { it, expect, afterEach, vi } from 'vitest';
import {
  readRecovery,
  retain,
  recoveryKey,
  recoveryText,
  discardRecovery,
  recoveryProblem,
} from '../src/editor/recovery';
import { legacyRecoveryKey } from '../src/editor/legacy-brand';
import { fixture } from './support/fixture';
afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
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
    publishBranch: 'release/live',
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

it('rejects a malformed publish branch in retained repository settings', () => {
  retain({
    version: 1,
    repository: { owner: 'team', repo: 'site', branch: 'draft' },
    base: null,
    content: fixture(),
  });
  const recovered = JSON.parse(sessionStorage.getItem(recoveryKey)!);
  recovered.repository.publishBranch = 42;
  sessionStorage.setItem(recoveryKey, JSON.stringify(recovered));
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

it('recovers pre-rename drafts and migrates only after the new record is stored', () => {
  const value = {
    version: 1 as const,
    repository: { owner: '', repo: '', branch: 'draft' },
    base: null,
    content: fixture(),
  };
  value.content.pages[0].title = 'Unsaved client work';
  sessionStorage.setItem(legacyRecoveryKey, JSON.stringify(value));
  expect(readRecovery()).toEqual(value);
  expect(sessionStorage.getItem(recoveryKey)).toBeNull();
  const write = vi
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementationOnce(() => {
      throw Error('Storage is full');
    });
  expect(() => retain(value)).toThrow('Storage is full');
  expect(sessionStorage.getItem(legacyRecoveryKey)).toBe(JSON.stringify(value));
  write.mockRestore();
  retain(value);
  expect(readRecovery()).toEqual(value);
  expect(sessionStorage.getItem(recoveryKey)).toBe(JSON.stringify(value));
  expect(sessionStorage.getItem(legacyRecoveryKey)).toBeNull();
});

it('preserves unreadable pre-rename drafts for download and explicit discard', () => {
  sessionStorage.setItem(legacyRecoveryKey, '{unreadable');
  expect(readRecovery()).toBeNull();
  expect(recoveryProblem()).toContain('preserved');
  expect(recoveryText()).toBe('{unreadable');
  expect(() =>
    retain({
      version: 1,
      repository: { owner: '', repo: '', branch: 'draft' },
      base: null,
      content: fixture(),
    }),
  ).toThrow('preserved');
  expect(sessionStorage.getItem(legacyRecoveryKey)).toBe('{unreadable');
  discardRecovery();
  expect(recoveryText()).toBeNull();
  expect(recoveryProblem()).toBe('');
});

it('prefers the current draft over an older retained draft', () => {
  const value = {
    version: 1 as const,
    repository: { owner: '', repo: '', branch: 'draft' },
    base: null,
    content: fixture(),
  };
  retain(value);
  sessionStorage.setItem(legacyRecoveryKey, '{obsolete');
  expect(readRecovery()).toEqual(value);
  discardRecovery();
  expect(sessionStorage.getItem(recoveryKey)).toBeNull();
  expect(sessionStorage.getItem(legacyRecoveryKey)).toBeNull();
});
