import { modelFixture } from './support/content-model';
import { factoryReset, filesFor } from '../src/core/content';
import { it, expect, describe } from 'vitest';
import { fixtureFiles } from './support/fixture';
import { definitions } from '../src/generated/definitions';
import { GitHubStore, Conflict } from '../src/integrations/github';
import type { Request } from '../src/integrations/github';
function mock(model = false) {
  const initial = fixtureFiles();
  if (model) Object.assign(initial, filesFor(modelFixture()));
  const commits: Record<string, { tree: string; parents: string[] }> = {
    c0: { tree: 't0', parents: [] },
  };
  const trees: Record<string, Record<string, string>> = { t0: initial };
  const refs: Record<string, string> = { main: 'c0', draft: 'c0' };
  const blobs: Record<string, string> = {};
  let seq = 0;
  let lost = false,
    race = false;
  const calls: { route: string; p: any }[] = [];
  const ancestor = (a: string, b: string): boolean =>
    a === b || commits[b]?.parents.some((p) => ancestor(a, p)) === true;
  const request: Request = async (route, p) => {
    calls.push({ route, p });
    let data: any;
    if (route.includes('/git/ref/')) {
      const sha = refs[String(p.ref).slice(6)];
      if (!sha) throw Object.assign(Error('missing'), { status: 404 });
      data = { object: { sha } };
    } else if (route.startsWith('GET') && route.includes('/git/commits/')) {
      data = { tree: { sha: commits[String(p.commit_sha)].tree } };
    } else if (route.startsWith('GET') && route.includes('/git/trees/')) {
      const key = commits[String(p.tree_sha)]?.tree ?? String(p.tree_sha);
      data = {
        sha: key,
        truncated: false,
        tree: Object.entries(trees[key]).map(([path, content]) => {
          const sha = 'blob' + seq++;
          blobs[sha] = content;
          return { path, sha, type: 'blob', mode: '100644' };
        }),
      };
    } else if (route.includes('/git/blobs/'))
      data = {
        encoding: 'base64',
        content: Buffer.from(blobs[String(p.file_sha)]).toString('base64'),
      };
    else if (route.startsWith('POST') && route.endsWith('/git/trees')) {
      expect(trees[String(p.base_tree)]).toBeDefined();
      const tree = { ...trees[String(p.base_tree)] };
      for (const f of p.tree as any[]) {
        if (f.sha === null) delete tree[f.path];
        else tree[f.path] = f.content;
      }
      const sha = 't' + seq++;
      trees[sha] = tree;
      data = { sha };
    } else if (route.startsWith('POST') && route.endsWith('/git/commits')) {
      const sha = 'c' + seq++;
      commits[sha] = { tree: String(p.tree), parents: p.parents as string[] };
      data = { sha };
    } else if (route.startsWith('POST') && route.endsWith('/git/refs')) {
      refs[String(p.ref).slice(11)] = String(p.sha);
      data = {};
    } else if (route.startsWith('PATCH')) {
      const branch = String(p.ref).slice(6);
      expect(p.force).toBe(false);
      if (race) {
        race = false;
        commits.other = { tree: 't0', parents: [refs[branch]] };
        refs[branch] = 'other';
      }
      if (!ancestor(refs[branch], String(p.sha)))
        throw Object.assign(Error('non-fast-forward'), { status: 422 });
      refs[branch] = String(p.sha);
      if (lost) {
        lost = false;
        throw Error('response lost');
      }
      data = {};
    } else if (route.includes('/compare/')) {
      const [base, head] = String(p.basehead).split('...');
      data = {
        status:
          base === head
            ? 'identical'
            : ancestor(base, head)
              ? 'ahead'
              : ancestor(head, base)
                ? 'behind'
                : 'diverged',
      };
    } else throw Error(route);
    return { data };
  };
  return {
    store: new GitHubStore(
      request,
      { owner: 'test', repo: 'site', branch: 'draft' },
      definitions,
      {},
    ),
    refs,
    commits,
    trees,
    calls,
    loseResponse() {
      lost = true;
    },
    race() {
      race = true;
    },
  };
}
describe('Git transactions (mock transport)', () => {
  it('saves a factory reset by removing all old content records from the draft', async () => {
    const m = mock(true);
    const base = await m.store.load();
    const reset = factoryReset(base.content);
    const saved = await m.store.save(base, reset);
    expect(saved.content).toEqual(reset);
    expect((await m.store.load()).files).toEqual(filesFor(reset));
    expect(m.refs.main).toBe('c0');
  });
  it('creates a missing draft from main', async () => {
    const m = mock();
    delete m.refs.draft;
    expect((await m.store.load()).sha).toBe('c0');
    expect(m.refs.draft).toBe('c0');
  });
  it('saves multiple records atomically in exactly one commit', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.site.title = 'Changed';
    next.pages[0].title = 'Changed too';
    const saved = await m.store.save(base, next);
    expect(saved.sha).toBe(m.refs.draft);
    expect(saved.content).toEqual(next);
    expect(
      m.calls.filter((c) => c.route.endsWith('/git/commits')),
    ).toHaveLength(1);
    expect(m.refs.main).toBe('c0');
  });
  it('rejects an already stale base before creating a commit', async () => {
    const m = mock(),
      base = await m.store.load();
    m.refs.draft = 'other';
    await expect(m.store.save(base, base.content)).rejects.toBeInstanceOf(
      Conflict,
    );
    expect(m.calls.some((c) => c.route.endsWith('/git/commits'))).toBe(false);
  });
  it('rejects a race at ref update without overwriting another editor', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.site.title = 'Mine';
    m.race();
    await expect(m.store.save(base, next)).rejects.toBeInstanceOf(Conflict);
    expect(m.refs.draft).toBe('other');
    expect(next.site.title).toBe('Mine');
  });
  it('confirms a successful update after a dropped response', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.site.title = 'Saved';
    m.loseResponse();
    const result = await m.store.save(base, next);
    expect(result.sha).toBe(m.refs.draft);
    expect(
      m.calls.filter((c) => c.route.endsWith('/git/commits')),
    ).toHaveLength(1);
  });
  it('allows an incomplete draft but refuses to publish it', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.pages[0].blocks[0].props.title = '';
    const saved = await m.store.save(base, next);
    await expect(m.store.publish(saved)).rejects.toThrow('required');
    expect(m.refs.main).toBe('c0');
  });
  it('publishes the validated snapshot without resetting newer draft work', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.site.title = 'Publish me';
    const saved = await m.store.save(base, next);
    const later = structuredClone(next);
    later.site.title = 'Still draft';
    const savedLater = await m.store.save(saved, later);
    await m.store.publish(saved);
    expect(m.refs.main).toBe(saved.sha);
    expect(m.refs.draft).toBe(savedLater.sha);
  });
  it('rejects source changes the current editor cannot validate', async () => {
    const m = mock(),
      base = await m.store.load();
    base.sourceFiles = { 'src/unknown.ts': 'new' };
    await expect(m.store.publish(base)).rejects.toThrow('different editor');
    expect(m.refs.main).toBe('c0');
  });
  it('refuses divergent main', async () => {
    const m = mock(),
      base = await m.store.load(),
      next = structuredClone(base.content);
    next.site.title = 'Draft';
    const saved = await m.store.save(base, next);
    m.commits.other = { tree: 't0', parents: ['c0'] };
    m.refs.main = 'other';
    await expect(m.store.publish(saved)).rejects.toThrow('diverged');
    expect(m.refs.main).toBe('other');
  });
});

it('saves, reloads and publishes object definitions and nested relations through the Git transport', async () => {
  const m = mock(true),
    base = await m.store.load(),
    next = structuredClone(base.content);
  next.objects[0].fields.push({
    key: 'description',
    label: 'Description',
    type: 'text',
  });
  next.entries[0].values.seo = {
    title: 'Updated SEO',
    description: 'Description',
  };
  const saved = await m.store.save(base, next);
  const reloaded = await m.store.load();
  expect(reloaded.content).toEqual(next);
  expect(reloaded.files['content/objects/object_seo.json']).toContain(
    'description',
  );
  await m.store.publish(saved);
  expect((await m.store.read(m.refs.main)).content).toEqual(next);
});
