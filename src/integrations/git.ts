import type { Definition } from '../core/types';
import type { Repository, RepositoryStore } from './repository';

export function repositoryKey(repo: Repository) {
  return JSON.stringify([
    repo.provider ?? 'github',
    repo.provider === 'gitlab'
      ? (repo.instance || 'https://gitlab.com').trim().replace(/\/+$/, '')
      : 'https://github.com',
    repo.owner,
    repo.repo,
    repo.branch,
  ]);
}

export async function connect(
  token: string,
  repository: Repository,
  definitions: Definition[],
): Promise<RepositoryStore> {
  if (
    !token.trim() ||
    !repository.owner.trim() ||
    !repository.repo.trim() ||
    !repository.branch.trim()
  )
    throw Error('Enter your repository and access token.');
  if (repository.branch === 'main') throw Error('Use a separate draft branch.');
  if (repository.provider === 'gitlab') {
    const { GitLabStore, gitlabRequest } = await import('./gitlab');
    return new GitLabStore(
      gitlabRequest(token, repository),
      repository,
      definitions,
    );
  }
  if (repository.provider && repository.provider !== 'github')
    throw Error('Choose GitHub or GitLab.');
  const { connect: githubConnect } = await import('./github');
  return githubConnect(token, repository, definitions);
}
