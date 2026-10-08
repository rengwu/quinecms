import { sourceFiles } from '../generated/sources';
import {
  filesFor,
  parseFiles,
  recordPath,
  schemaChanges,
} from '../core/content';
import type { Content, Definition, Snapshot } from '../core/types';
import {
  checkDraft,
  checkPublication,
  Conflict,
  isSource,
  type Repository,
  type RepositoryStore,
} from './repository';
export { Conflict } from './repository';
export type { Repository } from './repository';
export type Request = (
  route: string,
  parameters: Record<string, unknown>,
) => Promise<{ data: any }>;
export class GitHubStore implements RepositoryStore {
  constructor(
    private request: Request,
    public repository: Repository,
    private definitions: Definition[],
    private expectedSources: Record<string, string> = sourceFiles,
  ) {}
  private async api(route: string, p: Record<string, unknown> = {}) {
    return (
      await this.request(route, {
        owner: this.repository.owner,
        repo: this.repository.repo,
        ...p,
      })
    ).data;
  }
  private async ref(branch: string) {
    return (
      await this.api('GET /repos/{owner}/{repo}/git/ref/{ref}', {
        ref: `heads/${branch}`,
      })
    ).object.sha as string;
  }
  async load(): Promise<Snapshot> {
    let sha: string;
    try {
      sha = await this.ref(this.repository.branch);
    } catch (e) {
      if ((e as any).status !== 404) throw e;
      const main = await this.ref('main');
      try {
        await this.api('POST /repos/{owner}/{repo}/git/refs', {
          ref: `refs/heads/${this.repository.branch}`,
          sha: main,
        });
      } catch (e) {
        if ((e as any).status !== 422) throw e;
      }
      sha = await this.ref(this.repository.branch);
    }
    return this.read(sha);
  }
  async read(sha: string): Promise<Snapshot> {
    const commit = await this.api(
      'GET /repos/{owner}/{repo}/git/commits/{commit_sha}',
      { commit_sha: sha },
    );
    const tree = await this.api(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      { tree_sha: commit.tree.sha, recursive: '1' },
    );
    if (tree.truncated)
      throw Error('This repository is too large to load safely.');
    const blobs: Record<string, string> = {},
      files: Record<string, string> = {};
    const records = tree.tree.filter(
      (f: any) => f.type === 'blob' && f.path.startsWith('content/'),
    );
    if (records.some((f: any) => !recordPath(f.path) || f.mode !== '100644'))
      throw Error('Content contains an unsupported file or link.');
    for (let i = 0; i < records.length; i += 8)
      await Promise.all(
        records.slice(i, i + 8).map(async (f: any) => {
          const blob = await this.api(
            'GET /repos/{owner}/{repo}/git/blobs/{file_sha}',
            { file_sha: f.sha },
          );
          if (blob.encoding !== 'base64')
            throw Error('Unsupported Git blob encoding');
          files[f.path] = new TextDecoder().decode(
            Uint8Array.from(atob(blob.content.replace(/\s/g, '')), (c) =>
              c.charCodeAt(0),
            ),
          );
          blobs[f.path] = f.sha;
        }),
      );
    const content = parseFiles(files);
    checkDraft(content, this.definitions);
    return {
      sha,
      treeSha: tree.sha,
      content,
      files,
      blobs,
      sourceFiles: Object.fromEntries(
        tree.tree
          .filter(
            (f: any) =>
              f.type === 'blob' && isSource(f.path, this.expectedSources),
          )
          .map((f: any) => [f.path, f.sha]),
      ),
    };
  }
  async save(base: Snapshot, content: Content): Promise<Snapshot> {
    checkDraft(content, this.definitions, base.content);
    if ((await this.ref(this.repository.branch)) !== base.sha)
      throw new Conflict();
    const files = filesFor(content);
    const changes: Object[] = [];
    for (const [path, raw] of Object.entries(files))
      if (raw !== base.files[path])
        changes.push({ path, mode: '100644', type: 'blob', content: raw });
    for (const path of Object.keys(base.files))
      if (!(path in files))
        changes.push({ path, mode: '100644', type: 'blob', sha: null });
    if (!changes.length) return base;
    const tree = await this.api('POST /repos/{owner}/{repo}/git/trees', {
      base_tree: base.treeSha,
      tree: changes,
    });
    const commit = await this.api('POST /repos/{owner}/{repo}/git/commits', {
      message: 'content: save site draft',
      tree: tree.sha,
      parents: [base.sha],
    });
    try {
      await this.api('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
        ref: `heads/${this.repository.branch}`,
        sha: commit.sha,
        force: false,
      });
    } catch (error) {
      // A dropped response may follow a successful update. Confirm before retrying.
      let head: string;
      try {
        head = await this.ref(this.repository.branch);
      } catch {
        throw Error(
          'Save could not be confirmed. Your edits are preserved. Export a backup and reload the remote draft before retrying.',
        );
      }
      if (head === base.sha)
        throw Error(
          'GitHub did not accept the save. Check your connection, token permissions, and branch rules. Your edits are preserved.',
        );
      if (head !== commit.sha) {
        let comparison: any;
        try {
          comparison = await this.api(
            'GET /repos/{owner}/{repo}/compare/{basehead}',
            { basehead: `${commit.sha}...${head}` },
          );
        } catch {
          throw Error(
            'Save could not be confirmed. Your edits are preserved. Export a backup and reload the remote draft before retrying.',
          );
        }
        if (comparison.status !== 'ahead') throw new Conflict();
      }
    }
    // Read the exact saved snapshot, never a newer draft that another editor may have saved.
    return this.read(commit.sha);
  }
  async publish(snapshot: Snapshot) {
    checkPublication(snapshot, this.definitions, this.expectedSources);
    const main = await this.ref('main');
    if (main === snapshot.sha) return;
    const mainSnapshot = await this.read(main);
    const schemaIssues = schemaChanges(mainSnapshot.content, snapshot.content);
    if (schemaIssues.length)
      throw Error(schemaIssues.map((i) => i.message).join('\n'));
    const comparison = await this.api(
      'GET /repos/{owner}/{repo}/compare/{basehead}',
      { basehead: `${main}...${snapshot.sha}` },
    );
    if (comparison.status !== 'ahead')
      throw Error(
        'The main and draft branches have diverged. Ask your developer to synchronize them, then reload and review the draft.',
      );
    try {
      await this.api('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
        ref: 'heads/main',
        sha: snapshot.sha,
        force: false,
      });
    } catch (error) {
      if ((await this.ref('main')) !== snapshot.sha)
        throw Error(
          'Publish could not be confirmed. Reload before trying again. Your draft is saved.',
        );
    }
  }
}
export async function connect(
  token: string,
  repository: Repository,
  definitions: Definition[],
) {
  if (
    !token.trim() ||
    !repository.owner.trim() ||
    !repository.repo.trim() ||
    !repository.branch.trim()
  )
    throw Error('Enter your repository and GitHub token.');
  if (repository.branch === 'main') throw Error('Use a separate draft branch.');
  const { Octokit } = await import('@octokit/rest');
  const client = new Octokit({ auth: token, request: { timeout: 30000 } });
  return new GitHubStore(
    client.request.bind(client) as Request,
    repository,
    definitions,
  );
}
