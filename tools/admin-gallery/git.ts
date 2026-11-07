import type { Content, Snapshot } from '../../src/core/types';
import {
  Conflict,
  type Repository,
  type RepositoryStore,
} from '../../src/integrations/repository';
export { repositoryKey } from '../../src/integrations/git';
import { content as initial } from './content';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const snapshot = (content: Content, sha: string): Snapshot => ({
  sha,
  treeSha: sha,
  sourceFiles: {},
  files: {},
  blobs: {},
  content: structuredClone(content),
});

/** Stands in for App's provider connection; ?git= selects the outcome. */
export async function connect(
  _token: string,
  repository: Repository,
): Promise<RepositoryStore> {
  const mode = new URLSearchParams(location.search).get('git');
  if (mode === 'connecting') return new Promise(() => {});
  if (mode === 'failed') throw Error('Could not reach the repository.');
  let current = initial;
  return {
    repository,
    load: async () => snapshot(current, 'gallery'),
    async save(_base, content) {
      await delay(400);
      if (mode === 'stale') throw new Conflict();
      current = content;
      return snapshot(content, 'gallery-saved');
    },
    publish: async () => {
      await delay(400);
    },
  };
}
