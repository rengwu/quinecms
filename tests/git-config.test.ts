import { expect, it } from 'vitest';
import { gitFromEnv } from '../src/admin/git';

const env = {
  GIT_OWNER: ' team ',
  GIT_REPO: ' site ',
  GIT_ACCESS_TOKEN: ' secret-token ',
};

it('disables Git when connection values are absent, even with optional defaults', () => {
  expect(gitFromEnv({})).toBeNull();
  expect(
    gitFromEnv({
      GIT_PROVIDER: 'github',
      GIT_DRAFT_BRANCH: 'draft',
      GIT_OWNER: ' ',
      GIT_ACCESS_TOKEN: '',
    }),
  ).toBeNull();
});

it('normalizes complete GitHub settings and defaults its branches', () => {
  expect(gitFromEnv(env)).toEqual({
    token: 'secret-token',
    repository: {
      provider: 'github',
      owner: 'team',
      repo: 'site',
      branch: 'draft',
      publishBranch: 'main',
    },
  });
});

it('supports GitLab subgroups, self-managed instances and explicit branches', () => {
  expect(
    gitFromEnv({
      ...env,
      GIT_PROVIDER: 'gitlab',
      GIT_OWNER: 'team/subgroup',
      GITLAB_URL: 'https://git.example.test/gitlab/',
      GIT_DRAFT_BRANCH: 'editing',
      GIT_PUBLISH_BRANCH: 'release/live',
    }),
  ).toEqual({
    token: 'secret-token',
    repository: {
      provider: 'gitlab',
      owner: 'team/subgroup',
      repo: 'site',
      instance: 'https://git.example.test/gitlab',
      branch: 'editing',
      publishBranch: 'release/live',
    },
  });
  expect(
    gitFromEnv({ ...env, GIT_PROVIDER: 'gitlab' })?.repository.instance,
  ).toBe('https://gitlab.com');
});

it.each(['GIT_OWNER', 'GIT_REPO', 'GIT_ACCESS_TOKEN'])(
  'rejects partial configuration missing %s without exposing credentials',
  (key) => {
    expect(() => gitFromEnv({ ...env, [key]: '' })).toThrow(key);
    try {
      gitFromEnv({ ...env, [key]: '' });
    } catch (error) {
      expect(String(error)).not.toContain('secret-token');
    }
  },
);

it('rejects unsupported providers, identical branches and unsafe GitLab URLs', () => {
  expect(() => gitFromEnv({ ...env, GIT_PROVIDER: 'other' })).toThrow(
    'GIT_PROVIDER',
  );
  expect(() => gitFromEnv({ ...env, GIT_DRAFT_BRANCH: 'main' })).toThrow(
    'separate draft',
  );
  for (const GITLAB_URL of [
    'not a URL',
    'http://git.example.test',
    'https://user:secret-token@git.example.test',
    'https://git.example.test?token=secret-token',
    'https://git.example.test/#secret-token',
  ]) {
    expect(() =>
      gitFromEnv({ ...env, GIT_PROVIDER: 'gitlab', GITLAB_URL }),
    ).toThrow(
      'GITLAB_URL must be an HTTPS URL without credentials, query or fragment.',
    );
  }
});
