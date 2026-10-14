import { checkBranches, type Repository } from '../integrations/repository';
import { gitlabInstance } from '../integrations/gitlab';

export interface GitConfig {
  repository: Repository;
  token: string;
}

/** Build-time connection, serialized only inside the encrypted admin payload. */
export function gitFromEnv(
  env: Record<string, string | undefined>,
): GitConfig | null {
  const required = ['GIT_OWNER', 'GIT_REPO', 'GIT_ACCESS_TOKEN'] as const;
  if (required.every((key) => !env[key]?.trim())) return null;
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length)
    throw Error(
      `Git connection requires ${missing.join(', ')}. Leave all three connection values blank to disable saving and publishing.`,
    );
  const provider = env.GIT_PROVIDER?.trim() || 'github';
  if (provider !== 'github' && provider !== 'gitlab')
    throw Error('GIT_PROVIDER must be github or gitlab.');
  const repository: Repository = {
    provider,
    owner: env.GIT_OWNER!.trim(),
    repo: env.GIT_REPO!.trim(),
    branch: env.GIT_DRAFT_BRANCH?.trim() || 'draft',
    publishBranch: env.GIT_PUBLISH_BRANCH?.trim() || 'main',
  };
  if (provider === 'gitlab') {
    try {
      repository.instance = gitlabInstance(env.GITLAB_URL?.trim());
    } catch {
      throw Error(
        'GITLAB_URL must be an HTTPS URL without credentials, query or fragment.',
      );
    }
  }
  checkBranches(repository);
  return { repository, token: env.GIT_ACCESS_TOKEN!.trim() };
}
