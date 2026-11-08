// Optional real-library browser check; see docs/wiki/verification/setup.md.
import { projectFixture } from './support/project.ts';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, rm, cp, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const evidence = resolve(process.argv[2] || '.quinecms/localization-evidence');
const library = resolve(process.argv[3] || '../quinecms-library');
await mkdir(evidence, { recursive: true });
const directory = await projectFixture();
await rm(join(directory, 'content'), { recursive: true });
await cp(
  join(library, 'presets/tessera/v1/content'),
  join(directory, 'content'),
  { recursive: true },
);
await symlink(library, join(directory, 'node_modules/quinecms-library'), 'dir');
const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
pkg.dependencies['quinecms-library'] = JSON.parse(
  await readFile(join(library, 'package.json'), 'utf8'),
).version;
await writeFile(join(directory, 'package.json'), JSON.stringify(pkg));
await writeFile(
  join(directory, 'quinecms.config.json'),
  JSON.stringify({
    libraries: ['quinecms-library'],
    initialLayout: { id: 'tessera', version: 1 },
  }),
);
const homeFile = join(directory, 'content/pages/page_tessera_home.json');
const before = await readFile(homeFile, 'utf8');
const child = spawn(
  process.execPath,
  [resolve('bin/quinecms.mjs'), 'dev', '--port', '0'],
  {
    cwd: directory,
    env: { ...process.env, VITEST: '', ASTRO_TELEMETRY_DISABLED: '1' },
  },
);
let output = '',
  browser;
child.stdout.on('data', (data) => (output += data));
child.stderr.on('data', (data) => (output += data));
const exited = new Promise((done) => child.once('exit', done));
const results = [];
try {
  const deadline = Date.now() + 60000;
  while (!/QuineCMS dev: (http:\/\/127\.0\.0\.1:\d+)/.test(output)) {
    if (Date.now() > deadline || child.exitCode !== null)
      throw Error('Server did not start: ' + output);
    await new Promise((done) => setTimeout(done, 100));
  }
  const url = output.match(/QuineCMS dev: (http:\/\/127\.0\.0\.1:\d+)/)[1];
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url + '/admin/');
  const unlock = async () => {
    await page.getByLabel('Email', { exact: true }).fill('fixture@example.com');
    await page.getByLabel('Password', { exact: true }).fill('fixture-password');
    await page
      .getByRole('button', { name: 'Unlock editor', exact: true })
      .click();
  };
  await unlock();
  const navigation = page.getByRole('navigation', { name: 'Editor areas' });
  await navigation.getByText('Settings', { exact: true }).click();
  await page
    .getByRole('switch', { name: 'Publish in multiple languages' })
    .check();
  await page
    .getByRole('combobox', { name: 'Add language', exact: true })
    .click();
  await page.getByRole('option', { name: 'Chinese', exact: true }).click();
  const language = async (name) => {
    await page.getByRole('combobox', { name: 'Editing language' }).click();
    await page.getByRole('option', { name, exact: true }).click();
  };
  await language('Chinese');
  await navigation.getByText('Pages', { exact: true }).click();
  await page.getByRole('button', { name: /^Home/ }).click();
  await page
    .getByRole('button', { name: 'Add Chinese copy', exact: true })
    .click();
  await page.getByLabel('Page title', { exact: true }).fill('取消的副本');
  await page
    .getByRole('button', { name: 'Cancel', exact: true })
    .press('Enter');
  await page
    .getByRole('button', { name: 'Add Chinese copy', exact: true })
    .waitFor();
  results.push({ scenario: 'Cancel a new Chinese copy', result: 'Passed' });
  await page
    .getByRole('button', { name: 'Add Chinese copy', exact: true })
    .click();
  await page.getByLabel('Page title', { exact: true }).fill('首页');
  await page
    .getByRole('button', { name: 'Create', exact: true })
    .press('Enter');
  await page.getByRole('button', { name: /Hero/ }).click();
  const heading = page.getByRole('textbox', { name: 'Heading', exact: true });
  assert.equal(await heading.inputValue(), '');
  assert.doesNotMatch(await heading.locator('..').innerText(), /Shared/);
  const command = page.getByRole('textbox', { name: 'Command', exact: true });
  assert.match(await command.locator('..').innerText(), /Shared/);
  assert.equal(await command.inputValue(), 'npm create tessera@latest');
  await heading.fill('定义你的架构。');
  await page
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill('中文介绍');
  await page
    .getByRole('textbox', { name: 'Actionlabel', exact: true })
    .fill('开始构建');
  await page.screenshot({ path: join(evidence, 'chinese-hero.png') });
  await language('English');
  assert.equal(await heading.inputValue(), 'Define your schema.');
  assert.equal(
    await page
      .getByRole('textbox', { name: 'Description', exact: true })
      .inputValue(),
    'Tessera turns a typed schema into a database, API, auth, and realtime. No glue code, no drift.',
  );
  await language('Chinese');
  assert.equal(await heading.inputValue(), '定义你的架构。');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  // Authentication is repeated; the retained tab draft survives reload.
  await unlock();
  await navigation.getByText('Pages', { exact: true }).waitFor();
  await language('Chinese');
  await page.getByRole('button', { name: /^Home/ }).click();
  await page.getByRole('button', { name: /Hero/ }).click();
  assert.equal(await heading.inputValue(), '定义你的架构。');
  const recovery = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('quinecms:recovery:v2')),
  );
  const saved = recovery.content.pages.find((p) => p.path === '/');
  const hero = saved.blocks.find((b) => b.type === 'tessera-hero');
  assert.equal(hero.props.heading, 'Define your schema.');
  assert.equal(saved.copies.zh.blocks[hero.id].heading, '定义你的架构。');
  assert.equal(saved.copies.zh.blocks[hero.id].command, undefined);
  assert.equal(await readFile(homeFile, 'utf8'), before);
  results.push({
    scenario: 'Create, edit, switch languages and recover Chinese hero text',
    result: 'Passed',
    observed:
      'English values and local source content unchanged; Chinese values retained in the tab draft; commands shared.',
  });
  assert.deepEqual(errors, []);
  await writeFile(
    join(evidence, 'browser.json'),
    JSON.stringify(
      { browser: await browser.version(), url, results },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(results));
} catch (error) {
  if (browser) {
    const page = browser.contexts()[0]?.pages()[0];
    if (page) {
      await page.screenshot({ path: join(evidence, 'failure.png') });
      await writeFile(
        join(evidence, 'failure.txt'),
        await page.locator('body').innerText(),
      );
    }
  }
  throw error;
} finally {
  await browser?.close();
  child.kill('SIGTERM');
  await exited;
  await writeFile(join(evidence, 'browser-server.log'), output);
  await rm(directory, { recursive: true, force: true });
}
