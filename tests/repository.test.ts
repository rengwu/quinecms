import { expect, it } from 'vitest';
import { checkBranches, publishBranch } from '../src/integrations/repository';
import { connect, repositoryKey } from '../src/integrations/git';
import { definitions } from '../src/generated/definitions';

const repository = { owner: 'team', repo: 'site', branch: 'draft' };
it('defaults publication to main and binds credentials to both branch choices', () => {
  expect(publishBranch(repository)).toBe('main');
  expect(repositoryKey(repository)).toBe(
    repositoryKey({ ...repository, publishBranch: 'main' }),
  );
  expect(repositoryKey(repository)).not.toBe(
    repositoryKey({ ...repository, publishBranch: 'production' }),
  );
  expect(() =>
    checkBranches({
      ...repository,
      branch: 'main',
      publishBranch: 'production',
    }),
  ).not.toThrow();
});

it.each(['github', 'gitlab'] as const)(
  'rejects missing or identical branches before connecting to %s',
  async (provider) => {
    for (const publishBranch of ['', '  ', 'draft', ' draft ']) {
      await expect(
        connect(
          'test-token',
          { ...repository, provider, publishBranch },
          definitions,
        ),
      ).rejects.toThrow(/branch/);
    }
    await expect(
      connect(
        'test-token',
        { ...repository, provider, branch: 'main' },
        definitions,
      ),
    ).rejects.toThrow('separate draft');
  },
);
