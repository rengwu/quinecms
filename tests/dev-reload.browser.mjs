import { projectFixture } from './support/project.ts';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, rm, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const evidence = resolve(process.argv[2] || '.quinecms/dev-reload-evidence');
await mkdir(evidence, { recursive: true });
const directory = await projectFixture();
const child = spawn(
  process.execPath,
  [resolve('bin/quinecms.mjs'), 'dev', '--port', '0'],
  {
    cwd: directory,
    env: { ...process.env, VITEST: '', ASTRO_TELEMETRY_DISABLED: '1' },
  },
);
let output = '';
child.stdout.on('data', (data) => (output += data));
child.stderr.on('data', (data) => (output += data));
const exited = new Promise((resolve) => child.once('exit', resolve));
let browser;
const results = [];
async function until(check, label) {
  const end = Date.now() + 25000;
  while (Date.now() < end) {
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error(label + '\n' + output);
}
try {
  await until(
    () => /QuineCMS dev: (http:\/\/127\.0\.0\.1:\d+)/.test(output),
    'start server',
  );
  const url = output.match(/QuineCMS dev: (http:\/\/127\.0\.0\.1:\d+)/)[1];
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let navigations = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations++;
  });
  await page.goto(url);
  await page.getByText('Own content', { exact: true }).waitFor();
  const homePath = join(directory, 'content/pages/page_home.json');
  const home = JSON.parse(await readFile(homePath, 'utf8'));
  let before = navigations;
  home.blocks[0].props.body = 'Browser received saved JSON';
  await writeFile(homePath, JSON.stringify(home));
  await page.getByText(home.blocks[0].props.body, { exact: true }).waitFor();
  assert(navigations > before);
  assert(!output.includes('Restarting'));
  results.push({
    scenario: 'JSON props',
    result: 'Passed',
    observed:
      'Open Chromium page refreshed automatically and displayed saved props without restarting Astro.',
  });
  before = navigations;
  home.blocks[0].props.body = 'Browser received atomic save';
  await writeFile(homePath + '.tmp', JSON.stringify(home));
  await rename(homePath + '.tmp', homePath);
  await page.getByText(home.blocks[0].props.body, { exact: true }).waitFor();
  assert(navigations > before);
  results.push({ scenario: 'Atomic file replacement', result: 'Passed' });
  await writeFile(homePath, '{ invalid JSON');
  await page.locator('vite-error-overlay').waitFor();
  home.blocks[0].props.body = 'Browser recovered after invalid JSON';
  await writeFile(homePath, JSON.stringify(home));
  await page.getByText(home.blocks[0].props.body, { exact: true }).waitFor();
  await page.locator('vite-error-overlay').waitFor({ state: 'detached' });
  results.push({
    scenario: 'Invalid JSON recovery',
    result: 'Passed',
    observed:
      'Error overlay appeared; correcting the file restored the page automatically.',
  });
  const newPath = join(directory, 'content/pages/page_new.json');
  const added = {
    ...home,
    id: 'page_new',
    path: '/new-page',
    blocks: [{ ...home.blocks[0], id: 'block_new' }],
  };
  await writeFile(newPath, JSON.stringify(added));
  await until(
    async () => (await fetch(url + '/new-page').catch(() => null))?.ok,
    'add route',
  );
  await page.goto(url + '/new-page');
  await page.getByText(added.blocks[0].props.body, { exact: true }).waitFor();
  added.blocks[0].props.body =
    'Still automatically refreshing after a new route';
  await writeFile(newPath, JSON.stringify(added));
  await page.getByText(added.blocks[0].props.body, { exact: true }).waitFor();
  results.push({
    scenario: 'Added route and subsequent save',
    result: 'Passed',
  });
  added.path = '/renamed-page';
  await writeFile(newPath, JSON.stringify(added));
  await until(
    async () => (await fetch(url + '/renamed-page').catch(() => null))?.ok,
    'rename route',
  );
  await until(
    async () =>
      (await fetch(url + '/new-page').catch(() => null))?.status === 404,
    'remove previous route',
  );
  await page.goto(url + '/renamed-page');
  added.blocks[0].props.body = 'Still refreshing after a renamed route';
  await writeFile(newPath, JSON.stringify(added));
  await page.getByText(added.blocks[0].props.body, { exact: true }).waitFor();
  await rm(newPath);
  await until(
    async () =>
      (await fetch(url + '/renamed-page').catch(() => null))?.status === 404,
    'remove route',
  );
  results.push({ scenario: 'Renamed and deleted routes', result: 'Passed' });
  await page.goto(url);
  for (let i = 0; i < 8; i++) {
    home.blocks[0].props.body = 'Rapid save ' + i;
    await writeFile(homePath, JSON.stringify(home));
    await new Promise((r) => setTimeout(r, 45));
  }
  await page.getByText('Rapid save 7', { exact: true }).waitFor();
  results.push({
    scenario: 'Rapid saves',
    result: 'Passed',
    observed: 'Final saved value rendered.',
  });
  const view = join(directory, 'extensions/local/src/blocks/text/View.tsx');
  const original = await readFile(view, 'utf8');
  await writeFile(
    view,
    original.replace(
      '<section>',
      '<section><aside>Extension refreshed</aside>',
    ),
  );
  await page.getByText('Extension refreshed', { exact: true }).waitFor();
  results.push({ scenario: 'Original extension edit', result: 'Passed' });
  await mkdir(join(directory, 'public'));
  await writeFile(
    join(directory, 'public/reload-probe.txt'),
    'New public file',
  );
  await until(
    async () =>
      (await (await fetch(url + '/reload-probe.txt')).text()) ===
      'New public file',
    'new asset',
  );
  await writeFile(
    join(directory, 'public/reload-probe.txt'),
    'Changed public file',
  );
  await until(
    async () =>
      (await (await fetch(url + '/reload-probe.txt')).text()) ===
      'Changed public file',
    'changed asset',
  );
  await rm(join(directory, 'public/reload-probe.txt'));
  await until(
    async () => (await fetch(url + '/reload-probe.txt')).status === 404,
    'removed asset',
  );
  results.push({
    scenario: 'New public directory and asset add/change/delete',
    result: 'Passed',
  });
  await page.screenshot({ path: join(evidence, 'browser.png') });
  assert.equal(child.exitCode, null);
  await writeFile(
    join(evidence, 'browser.json'),
    JSON.stringify(
      {
        result: 'Passed',
        browser: await browser.version(),
        url,
        navigations,
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ result: 'Passed', results }, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill('SIGTERM');
  await exited;
  await writeFile(join(evidence, 'browser-server.log'), output);
  await rm(directory, { recursive: true, force: true });
}
