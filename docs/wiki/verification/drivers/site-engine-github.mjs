// Explicit opt-in live check on the disposable public Archline pilot only.
// Run from its assembled workspace: node --import tsx/esm /path/to/this.mjs --write
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
if (!process.argv.includes('--write')) throw Error('Pass --write to run the live pilot transaction check.');
const require = createRequire(resolve('package.json'));
const { Octokit } = require('@octokit/rest');
const { GitHubStore } = await import(pathToFileURL(resolve('src/integrations/github.ts')));
const { filesFor } = await import(pathToFileURL(resolve('src/core/content.ts')));
const { definitions } = await import(pathToFileURL(resolve('src/generated/definitions.ts')));
const expected = JSON.parse(await readFile('build-inputs.json', 'utf8'));
const auth = execFileSync('gh', ['auth', 'token'], {encoding:'utf8'}).trim();
const api = new Octokit({auth});
const repository = {owner:'rengwu',repo:'quinecms-site-archline',branch:'draft',publishBranch:'main'};
let writes = 0;
const store = new GitHubStore(async (route, args) => {
  if (!route.startsWith('GET')) writes++;
  return api.request(route,args);
}, repository, definitions, expected);
const base = await store.load();
assert.deepEqual(base.sourceFiles, expected);
const original = structuredClone(base.content);
const edited = structuredClone(original);
edited.pages[0].title += ' — verification';
const saved = await store.save(base, edited);
assert.equal((await store.load()).content.pages.find(p => p.id === edited.pages[0].id).title, edited.pages[0].title);
// Add a real site source change to the draft, then prove the old editor cannot write.
const path = 'extensions/verification-only.txt';
let sourceSha;
try {
  const added = await api.repos.createOrUpdateFileContents({owner:repository.owner,repo:repository.repo,branch:repository.branch,path,message:'test: exercise editor source mismatch guard',content:Buffer.from('Temporary source mismatch verification.\n').toString('base64')});
  sourceSha = added.data.content.sha;
  const mismatched = await store.load();
  const retained = structuredClone(edited);
  const before = writes;
  await assert.rejects(store.save(mismatched, retained), /matching editor/);
  await assert.rejects(store.publish(mismatched), /matching editor/);
  assert.equal(writes,before);
  assert.deepEqual(retained, edited);
} finally {
  if (sourceSha) await api.repos.deleteFile({owner:repository.owner,repo:repository.repo,branch:repository.branch,path,sha:sourceSha,message:'test: restore matching site sources'});
}
const matching = await store.load();
const restored = await store.save(matching, original);
await store.publish(restored);
const published = await api.git.getRef({owner:repository.owner,repo:repository.repo,ref:'heads/main'});
assert.equal(published.data.object.sha, restored.sha);
assert.deepEqual(filesFor((await store.load()).content), filesFor(original));
console.log(JSON.stringify({result:'Passed',repository:'https://github.com/rengwu/quinecms-site-archline',loaded:base.sha,saved:saved.sha,published:restored.sha,scenarios:['live content save and reload','real source mismatch blocks save and publish without API writes','unsaved input preserved','matching source restored','original content restored and exact snapshot published']},null,2));
