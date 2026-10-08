import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { factoryReset, filesFor } from '../src/core/content';
import { definitions } from '../src/generated/definitions';
import {
  GitLabStore,
  gitlabInstance,
  gitlabRequest,
  type Request,
} from '../src/integrations/gitlab';
import { Conflict } from '../src/integrations/repository';
import { repositoryKey, connect } from '../src/integrations/git';
import { fixtureFiles } from './support/fixture';
import { modelFixture } from './support/content-model';

const repository = {
  provider: 'gitlab' as const,
  instance: 'https://gitlab.example.com',
  owner: 'team/subgroup',
  repo: 'site',
  branch: 'draft',
};
function mock() {
  const initial = { ...fixtureFiles(), ...filesFor(modelFixture()) };
  const commits: Record<
    string,
    { files: Record<string, string>; parent_ids: string[] }
  > = {
    c0: { files: initial, parent_ids: [] },
  };
  const refs: Record<string, string> = { main: 'c0', draft: 'c0' };
  const blobs: Record<string, string> = {};
  const mrs: Record<string, any> = {};
  const calls: { method: string; path: string; p: any }[] = [];
  const project = { merge_method: 'ff', squash_option: 'default_off' };
  let seq = 0;
  let race = false,
    lostMerge = false,
    lostCommit = false,
    denied = false;
  const ancestor = (a: string, b: string): boolean =>
    a === b || commits[b]?.parent_ids.some((p) => ancestor(a, p)) === true;
  const missing = () => Object.assign(Error('missing'), { status: 404 });
  const request: Request = async (method, path, p = {}) => {
    calls.push({ method, path, p });
    if (method === 'GET' && path === '') return project;
    if (method === 'GET' && path.startsWith('/repository/branches/')) {
      const sha =
        refs[decodeURIComponent(path.slice('/repository/branches/'.length))];
      if (!sha) throw missing();
      return { commit: { id: sha } };
    }
    if (method === 'POST' && path === '/repository/branches') {
      if (refs[String(p.branch)]) throw Error('branch exists');
      refs[String(p.branch)] = String(p.ref);
      return { commit: { id: p.ref } };
    }
    if (method === 'GET' && path === '/repository/tree') {
      const files = commits[String(p.ref)].files;
      return Object.entries(files)
        .map(([path, raw]) => {
          const id = createHash('sha1').update(raw).digest('hex');
          blobs[id] = raw;
          return { id, path, type: 'blob', mode: '100644' };
        })
        .slice((Number(p.page) - 1) * 100, Number(p.page) * 100);
    }
    if (method === 'GET' && path.startsWith('/repository/blobs/'))
      return {
        encoding: 'base64',
        content: Buffer.from(blobs[path.split('/').at(-1)!]).toString('base64'),
      };
    if (method === 'POST' && path === '/repository/commits') {
      expect(p.force).toBe(false);
      expect(refs[String(p.branch)]).toBeUndefined();
      const files = { ...commits[String(p.start_sha)].files };
      for (const action of p.actions as any[]) {
        if (action.action === 'delete') delete files[action.file_path];
        else files[action.file_path] = action.content;
      }
      const id = `c${++seq}`;
      const commit = { files, parent_ids: [String(p.start_sha)] };
      commits[id] = commit;
      refs[String(p.branch)] = id;
      if (lostCommit) {
        lostCommit = false;
        throw Error('response lost');
      }
      return { id, parent_ids: commit.parent_ids };
    }
    if (method === 'GET' && path.startsWith('/repository/commits/')) {
      const id = path.split('/').at(-1)!;
      return { id, parent_ids: commits[id].parent_ids };
    }
    if (method === 'GET' && path === '/repository/merge_base') {
      const [a, b] = p['refs[]'] as string[];
      return { id: ancestor(a, b) ? a : ancestor(b, a) ? b : 'c0' };
    }
    if (method === 'POST' && path === '/merge_requests') {
      const iid = ++seq;
      mrs[iid] = {
        ...p,
        iid,
        sha: refs[String(p.source_branch)],
        state: 'opened',
        squash_on_merge: false,
        detailed_merge_status: 'mergeable',
      };
      return { ...mrs[iid] };
    }
    if (path.startsWith('/merge_requests/')) {
      const mr = mrs[path.split('/')[2]];
      if (method === 'GET') return { ...mr };
      if (path.endsWith('/merge')) {
        expect(p.auto_merge).toBe(false);
        expect(p.squash).toBe(false);
        expect(p.sha).toBe(mr.sha);
        if (denied)
          throw Object.assign(Error('approval required'), { status: 405 });
        if (race) {
          race = false;
          commits.other = {
            files: { ...commits[refs[mr.target_branch]].files },
            parent_ids: [refs[mr.target_branch]],
          };
          refs[mr.target_branch] = 'other';
        }
        if (!ancestor(refs[mr.target_branch], String(p.sha)))
          throw Object.assign(Error('not fast forward'), { status: 405 });
        refs[mr.target_branch] = String(p.sha);
        mr.state = 'merged';
        mr.merge_commit_sha = p.sha;
        if (p.should_remove_source_branch) delete refs[mr.source_branch];
        if (lostMerge) {
          lostMerge = false;
          throw Error('response lost');
        }
        return { ...mr };
      }
      if (p.state_event === 'close' && mr.state !== 'merged')
        mr.state = 'closed';
      return { ...mr };
    }
    throw Error(`${method} ${path}`);
  };
  return {
    store: new GitLabStore(request, repository, definitions, {}),
    request,
    refs,
    commits,
    mrs,
    calls,
    project,
    race() {
      race = true;
    },
    loseMerge() {
      lostMerge = true;
    },
    loseCommit() {
      lostCommit = true;
    },
    deny() {
      denied = true;
    },
  };
}

describe('GitLab transactions (mock API)', () => {
  it('saves a factory reset by removing all old content records from the draft', async () => {
    const m = mock();
    const base = await m.store.load();
    const reset = factoryReset(base.content);
    const saved = await m.store.save(base, reset);
    expect(saved.content).toEqual(reset);
    expect((await m.store.load()).files).toEqual(filesFor(reset));
    expect(m.refs.main).toBe('c0');
  });
  it('creates a missing draft from main and loads paginated trees at one commit', async () => {
    const m = mock();
    for (let i = 0; i < 105; i++)
      m.commits.c0.files[`public/asset-${i}.txt`] = `${i}`;
    delete m.refs.draft;
    const base = await m.store.load();
    expect(base.sha).toBe('c0');
    expect(m.refs.draft).toBe('c0');
    const calls = m.calls.filter((c) => c.path === '/repository/tree');
    expect(calls.map((c) => c.p.page)).toEqual([1, 2]);
    expect(calls.every((c) => c.p.ref === 'c0')).toBe(true);
  });

  it('saves additions, updates and deletions atomically in one commit and cleans its branch', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.site.title = 'Changed';
    content.pages.push({
      formatVersion: 1,
      id: 'page_extra',
      kind: 'static',
      path: '/extra',
      title: 'Extra',
      blocks: [],
    });
    content.pages = content.pages.filter((p) => p.id !== 'page_blocks');
    content.site.navigation = content.site.navigation?.filter(
      (n) => n.to.kind !== 'page' || n.to.id !== 'page_blocks',
    );
    const saved = await m.store.save(base, content);
    expect(filesFor(saved.content)).toEqual(filesFor(content));
    expect(saved.sha).toBe(m.refs.draft);
    expect(m.refs.main).toBe('c0');
    const saves = m.calls.filter(
      (c) => c.method === 'POST' && c.path === '/repository/commits',
    );
    expect(saves).toHaveLength(1);
    expect(new Set(saves[0].p.actions.map((a: any) => a.action))).toEqual(
      new Set(['create', 'update', 'delete']),
    );
    expect(Object.keys(m.refs).sort()).toEqual(['draft', 'main']);
  });

  it('rejects a stale snapshot before making any writes', async () => {
    const m = mock(),
      base = await m.store.load();
    m.refs.draft = 'other';
    await expect(m.store.save(base, base.content)).rejects.toBeInstanceOf(
      Conflict,
    );
    expect(m.calls.some((c) => c.method !== 'GET')).toBe(false);
  });

  it('rejects a save race without overwriting newer work or leaving an open MR', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.site.title = 'Mine';
    m.race();
    await expect(m.store.save(base, content)).rejects.toBeInstanceOf(Conflict);
    expect(m.refs.draft).toBe('other');
    expect(Object.values(m.mrs).every((mr) => mr.state === 'closed')).toBe(
      true,
    );
    expect(content.site.title).toBe('Mine');
  });

  it.each(['commit', 'merge'])(
    'confirms a lost %s response without duplicating the commit',
    async (phase) => {
      const m = mock(),
        base = await m.store.load(),
        content = structuredClone(base.content);
      content.site.title = 'Saved';
      if (phase === 'commit') m.loseCommit();
      else m.loseMerge();
      const saved = await m.store.save(base, content);
      expect(saved.sha).toBe(m.refs.draft);
      expect(
        m.calls.filter(
          (c) => c.method === 'POST' && c.path === '/repository/commits',
        ),
      ).toHaveLength(1);
    },
  );

  it('publishes exactly the validated snapshot while leaving newer drafts intact', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.site.title = 'Ready';
    const saved = await m.store.save(base, content);
    content.site.title = 'Later draft';
    const later = await m.store.save(saved, content);
    await m.store.publish(saved);
    expect(m.refs.main).toBe(saved.sha);
    expect(m.refs.draft).toBe(later.sha);
    expect(Object.keys(m.refs).sort()).toEqual(['draft', 'main']);
  });

  it('rejects incomplete publication, source mismatches and divergent main', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.pages.find((p) => p.kind === 'static')!.title = '';
    const saved = await m.store.save(base, content);
    await expect(m.store.publish(saved)).rejects.toThrow('title is required');
    await expect(
      m.store.publish({ ...base, sourceFiles: { 'src/changed.ts': 'new' } }),
    ).rejects.toThrow('different editor');
    content.pages.find((p) => p.kind === 'static')!.title = 'Ready';
    const ready = await m.store.save(saved, content);
    m.commits.other = { files: m.commits.c0.files, parent_ids: ['c0'] };
    m.refs.main = 'other';
    await expect(m.store.publish(ready)).rejects.toThrow('diverged');
    expect(m.refs.main).toBe('other');
  });

  it('rejects a race on main and preserves the saved draft', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.site.title = 'Ready';
    const saved = await m.store.save(base, content);
    m.race();
    await expect(m.store.publish(saved)).rejects.toBeInstanceOf(Conflict);
    expect(m.refs.main).toBe('other');
    expect(m.refs.draft).toBe(saved.sha);
  });

  it('respects project merge settings and required approvals', async () => {
    const m = mock(),
      base = await m.store.load(),
      content = structuredClone(base.content);
    content.site.title = 'Ready';
    m.project.merge_method = 'merge';
    await expect(m.store.save(base, content)).rejects.toThrow('Fast-forward');
    expect(m.calls.some((c) => c.method !== 'GET')).toBe(false);
    m.project.merge_method = 'ff';
    m.project.squash_option = 'always';
    await expect(m.store.save(base, content)).rejects.toThrow('squashing');
    m.project.squash_option = 'default_off';
    m.deny();
    await expect(m.store.save(base, content)).rejects.toThrow('not completed');
    expect(m.refs.draft).toBe(base.sha);
    expect(Object.values(m.mrs).every((mr) => mr.state === 'closed')).toBe(
      true,
    );
  });
});

it('encodes nested project paths and sends tokens only in headers to the selected HTTPS instance', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response('{}', { status: 200 }));
  const request = gitlabRequest('test-token', repository, fetcher);
  await request('GET', '/repository/tree', { ref: 'a-sha', page: 2 });
  const [url, options] = fetcher.mock.calls[0];
  expect(String(url)).toBe(
    'https://gitlab.example.com/api/v4/projects/team%2Fsubgroup%2Fsite/repository/tree?ref=a-sha&page=2',
  );
  expect(options?.headers).toEqual({ 'PRIVATE-TOKEN': 'test-token' });
  expect(options?.credentials).toBe('omit');
  expect(options?.redirect).toBe('error');
  expect(() => gitlabInstance('http://gitlab.example.com')).toThrow('HTTPS');
  expect(() =>
    gitlabInstance('https://user:secret@gitlab.example.com'),
  ).toThrow('credentials');
  expect(repositoryKey(repository)).not.toBe(
    repositoryKey({ ...repository, instance: 'https://other.example.com' }),
  );
  expect(repositoryKey(repository)).not.toBe(
    repositoryKey({ ...repository, provider: 'github' }),
  );
  await expect(connect('', repository, definitions)).rejects.toThrow(
    'access token',
  );
  await expect(
    connect('test-token', { ...repository, branch: 'main' }, definitions),
  ).rejects.toThrow('separate draft');
});
