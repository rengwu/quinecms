import {
  filesFor,
  parseFiles,
  recordPath,
  schemaChanges,
} from '../core/content';
import type { Content, Definition, Snapshot } from '../core/types';
import { sourceFiles } from '../generated/sources';
import {
  checkDraft,
  checkPublication,
  Conflict,
  isSource,
  type Repository,
  type RepositoryStore,
} from './repository';

export type Request = (
  method: string,
  path: string,
  parameters?: Record<string, unknown>,
) => Promise<any>;
type TreeEntry = { id: string; path: string; type: string; mode: string };
const encode = encodeURIComponent;

export function gitlabInstance(value = 'https://gitlab.com') {
  const url = new URL(value || 'https://gitlab.com');
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw Error(
      'Use an HTTPS GitLab instance URL without credentials, query or fragment.',
    );
  return url.href.replace(/\/+$/, '');
}

export function gitlabRequest(
  token: string,
  repository: Repository,
  fetcher: typeof fetch = fetch,
): Request {
  const root = `${gitlabInstance(repository.instance)}/api/v4/projects/${encode(`${repository.owner}/${repository.repo}`)}`;
  return async (method, path, parameters = {}) => {
    const url = new URL(root + path);
    if (method === 'GET')
      for (const [key, value] of Object.entries(parameters))
        for (const item of Array.isArray(value) ? value : [value])
          url.searchParams.append(key, String(item));
    const response = await fetcher(url, {
      method,
      headers: {
        'PRIVATE-TOKEN': token,
        ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(method !== 'GET' ? { body: JSON.stringify(parameters) } : {}),
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.text();
    let data;
    try {
      data = body ? JSON.parse(body) : null;
    } catch {
      throw Error(
        `GitLab returned an unreadable response (${response.status}).`,
      );
    }
    if (!response.ok)
      throw Object.assign(
        Error(
          `GitLab request failed (${response.status}): ${typeof data?.message === 'string' ? data.message : 'Check token permissions, project settings and connectivity.'}`,
        ),
        { status: response.status },
      );
    return data;
  };
}

export class GitLabStore implements RepositoryStore {
  constructor(
    private request: Request,
    public repository: Repository,
    private definitions: Definition[],
    private expectedSources = sourceFiles,
  ) {}

  private async ref(branch: string): Promise<string> {
    return (await this.request('GET', `/repository/branches/${encode(branch)}`))
      .commit.id;
  }

  async load(): Promise<Snapshot> {
    let sha: string;
    try {
      sha = await this.ref(this.repository.branch);
    } catch (error) {
      if ((error as any).status !== 404) throw error;
      const main = await this.ref('main');
      try {
        await this.request('POST', '/repository/branches', {
          branch: this.repository.branch,
          ref: main,
        });
      } catch {
        // Another editor may have created it, or the successful response was lost.
        // Reading the branch establishes the outcome without retrying the write.
      }
      sha = await this.ref(this.repository.branch);
    }
    return this.read(sha);
  }

  async read(sha: string): Promise<Snapshot> {
    const tree: TreeEntry[] = [];
    for (let page = 1; ; page++) {
      const batch: TreeEntry[] = await this.request('GET', '/repository/tree', {
        ref: sha,
        recursive: true,
        per_page: 100,
        page,
      });
      tree.push(...batch);
      if (batch.length < 100) break;
      if (page >= 1000)
        throw Error('This repository is too large to load safely.');
    }
    const records = tree.filter(
      (f) => f.path.startsWith('content/') && f.type !== 'tree',
    );
    if (
      records.some(
        (f) => f.type !== 'blob' || f.mode !== '100644' || !recordPath(f.path),
      )
    )
      throw Error('Content contains an unsupported file or link.');
    const files: Record<string, string> = {};
    const blobs: Record<string, string> = {};
    for (let i = 0; i < records.length; i += 8)
      await Promise.all(
        records.slice(i, i + 8).map(async (f) => {
          const blob = await this.request(
            'GET',
            `/repository/blobs/${encode(f.id)}`,
          );
          if (blob.encoding !== 'base64')
            throw Error('Unsupported Git blob encoding');
          files[f.path] = new TextDecoder().decode(
            Uint8Array.from(atob(blob.content.replace(/\s/g, '')), (c) =>
              c.charCodeAt(0),
            ),
          );
          blobs[f.path] = f.id;
        }),
      );
    const content = parseFiles(files);
    checkDraft(content, this.definitions);
    return {
      sha,
      // GitLab addresses trees by commit; it does not expose GitHub's tree SHA.
      treeSha: sha,
      files,
      blobs,
      content,
      sourceFiles: Object.fromEntries(
        tree
          .filter(
            (f) => f.type !== 'tree' && isSource(f.path, this.expectedSources),
          )
          .map((f) => [f.path, f.id]),
      ),
    };
  }

  private async checkProject() {
    const project = await this.request('GET', '');
    if (project.merge_method !== 'ff' || project.squash_option === 'always')
      throw Error(
        'GitLab needs Fast-forward merge with squashing optional or disabled. Ask your developer to configure the project; no settings were changed.',
      );
  }

  private async ancestor(before: string, after: string) {
    if (before === after) return true;
    const common = await this.request('GET', '/repository/merge_base', {
      'refs[]': [before, after],
    });
    return common.id === before;
  }

  // GitLab has no public equivalent of GitHub's non-forced ref update. A
  // short-lived branch and SHA-pinned fast-forward MR preserve the same snapshot
  // semantics. Never force, rebase, squash or schedule a later automatic merge.
  private async advance(
    branch: string,
    expected: string,
    sha: string,
    source: string,
  ) {
    await this.checkProject();
    if ((await this.ref(branch)) !== expected) throw new Conflict();
    const mr = await this.request('POST', '/merge_requests', {
      source_branch: source,
      target_branch: branch,
      title:
        branch === 'main'
          ? 'content: publish site'
          : 'content: save site draft',
      squash: false,
      remove_source_branch: true,
    });
    let merged = false;
    try {
      // New MRs are prepared asynchronously. Wait briefly for preparation only;
      // project approvals/pipelines are respected and never bypassed.
      let state = mr;
      for (
        let attempt = 0;
        attempt < 10 &&
        ['checking', 'unchecked', 'preparing'].includes(
          state.detailed_merge_status,
        );
        attempt++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        state = await this.request('GET', `/merge_requests/${mr.iid}`);
      }
      if (state.sha !== sha || state.squash_on_merge === true)
        throw new Conflict();
      await this.checkProject();
      if ((await this.ref(branch)) !== expected) throw new Conflict();
      try {
        const result = await this.request(
          'PUT',
          `/merge_requests/${mr.iid}/merge`,
          {
            sha,
            squash: false,
            should_remove_source_branch: true,
            auto_merge: false,
          },
        );
        merged = result.state === 'merged' && result.merge_commit_sha === sha;
      } catch {
        const result = await this.request('GET', `/merge_requests/${mr.iid}`);
        merged = result.state === 'merged' && result.merge_commit_sha === sha;
      }
      if (!merged) {
        if ((await this.ref(branch)) !== expected) throw new Conflict();
        throw Error(
          'GitLab has not completed the merge. Check project approvals, pipelines and branch permissions, then retry. Your edits are preserved.',
        );
      }
      if (!(await this.ancestor(sha, await this.ref(branch))))
        throw Error(
          'The saved branch changed unexpectedly. Reload the remote draft before continuing.',
        );
    } finally {
      if (!merged) {
        // Closing a rejected request is best-effort. No delayed auto-merge was
        // scheduled; interrupted requests/branches may need manual cleanup.
        await this.request('PUT', `/merge_requests/${mr.iid}`, {
          state_event: 'close',
        }).catch(() => {});
      }
    }
  }

  async save(base: Snapshot, content: Content): Promise<Snapshot> {
    checkDraft(content, this.definitions, base.content);
    if ((await this.ref(this.repository.branch)) !== base.sha)
      throw new Conflict();
    const files = filesFor(content);
    const actions: Record<string, unknown>[] = [];
    for (const [file_path, value] of Object.entries(files))
      if (value !== base.files[file_path])
        actions.push({
          action: Object.hasOwn(base.files, file_path) ? 'update' : 'create',
          file_path,
          content: value,
        });
    for (const file_path of Object.keys(base.files))
      if (!Object.hasOwn(files, file_path))
        actions.push({ action: 'delete', file_path });
    if (!actions.length) return base;
    await this.checkProject();
    const source = `lean-save-${crypto.randomUUID()}`;
    let commit;
    try {
      commit = await this.request('POST', '/repository/commits', {
        branch: source,
        start_sha: base.sha,
        commit_message: 'content: save site draft',
        actions,
        force: false,
      });
    } catch (error) {
      // Resolve a lost creation response through the unique transaction branch.
      try {
        commit = await this.request(
          'GET',
          `/repository/commits/${encode(await this.ref(source))}`,
        );
      } catch {
        throw error;
      }
    }
    if (commit.parent_ids?.length !== 1 || commit.parent_ids[0] !== base.sha)
      throw new Conflict();
    const saved = await this.read(commit.id);
    const paths = new Set([...Object.keys(saved.files), ...Object.keys(files)]);
    if ([...paths].some((p) => saved.files[p] !== files[p]))
      throw new Conflict();
    await this.advance(this.repository.branch, base.sha, saved.sha, source);
    return saved;
  }

  async publish(snapshot: Snapshot) {
    checkPublication(snapshot, this.definitions, this.expectedSources);
    const main = await this.ref('main');
    if (main === snapshot.sha) return;
    const previous = await this.read(main);
    const issues = schemaChanges(previous.content, snapshot.content);
    if (issues.length) throw Error(issues.map((i) => i.message).join('\n'));
    if (!(await this.ancestor(main, snapshot.sha)))
      throw Error(
        'The main and draft branches have diverged. Ask your developer to synchronize them, then reload and review the draft.',
      );
    await this.checkProject();
    const source = `lean-publish-${crypto.randomUUID()}`;
    try {
      await this.request('POST', '/repository/branches', {
        branch: source,
        ref: snapshot.sha,
      });
    } catch (error) {
      if ((await this.ref(source).catch(() => '')) !== snapshot.sha)
        throw error;
    }
    await this.advance('main', main, snapshot.sha, source);
  }
}
