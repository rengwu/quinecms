import { expect, it } from 'vitest';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fixtureDirectory } from './support/fixture';
import { projectFixture } from './support/project';
import { gunzipSync } from 'node:zlib';
import { decryptAdmin } from '../src/admin/crypto';

const exec = promisify(execFile);
const command = (cwd: string, args: string[]) =>
  exec(process.execPath, args, { cwd, maxBuffer: 16 * 1024 * 1024 });
const cli = resolve('bin/quinecms.mjs');
const validator = [cli, 'validate'];

it('validates unfinished drafts and baseline schema changes without modifying content', async () => {
  const directory = await projectFixture();
  try {
    const git = (args: string[]) => exec('git', args, { cwd: directory });
    await git(['init', '-q']);
    await git(['add', 'content']);
    await git([
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      '-c',
      'commit.gpgsign=false',
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '-qm',
      'fixture',
    ]);
    const pagePath = join(directory, 'content/pages/page_home.json');
    const page = JSON.parse(await readFile(pagePath, 'utf8'));
    page.title = '';
    page.path = '';
    const raw = JSON.stringify(page);
    await writeFile(pagePath, raw);
    await command(directory, [...validator, '--draft']);
    await expect(command(directory, validator)).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('[publish]'),
    });
    expect(await readFile(pagePath, 'utf8')).toBe(raw);

    const schemaPath = join(
      directory,
      'content/collections/collection_journal.json',
    );
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    schema.fields = schema.fields.filter(
      (field: { key: string }) => field.key !== 'summary',
    );
    await writeFile(schemaPath, JSON.stringify(schema));
    await command(directory, [...validator, '--draft']);
    await expect(
      command(directory, [...validator, '--draft', '--base', 'HEAD']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('This field contains content'),
    });
    schema.fields[0].key = '';
    await writeFile(schemaPath, JSON.stringify(schema));
    await expect(
      command(directory, [...validator, '--draft']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('[structure]'),
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);

it('builds an independent site, encrypts its admin, and keeps static routes free of browser JavaScript', async () => {
  const directory = await projectFixture();
  try {
    const storage = {
      accountId: 'a'.repeat(32),
      bucket: 'fixture-private-config-bucket',
      publicURL: 'https://fixture-media.example.test',
      accessKeyId: 'fixture-r2-access-do-not-publish',
      secretAccessKey: 'fixture-r2-secret-do-not-publish',
      maxMB: 12,
      variantWidths: [640],
      quality: 0.7,
    };
    const git = {
      repository: {
        provider: 'github',
        owner: 'fixture-private-owner',
        repo: 'fixture-private-repo',
        branch: 'editing',
        publishBranch: 'production',
      },
      token: 'fixture-git-secret-do-not-publish',
    };
    const configuredEnv =
      (await readFile(join(directory, '.env'), 'utf8')) +
      `GIT_OWNER=${git.repository.owner}\nGIT_REPO=${git.repository.repo}\nGIT_ACCESS_TOKEN=${git.token}\nGIT_DRAFT_BRANCH=editing\nGIT_PUBLISH_BRANCH=production\nR2_ACCOUNT_ID=${storage.accountId}\nR2_BUCKET=${storage.bucket}\nR2_PUBLIC_URL=${storage.publicURL}\nR2_ACCESS_KEY_ID=${storage.accessKeyId}\nR2_SECRET_ACCESS_KEY=${storage.secretAccessKey}\nR2_MAX_MB=12\nR2_IMAGE_WIDTHS=640\nR2_IMAGE_QUALITY=0.7\n`;
    await writeFile(join(directory, '.env'), configuredEnv);
    const build = async () => {
      await command(directory, [cli, 'validate']);
      const buildResult = await command(directory, [cli, 'build']);
      expect(buildResult.stdout + buildResult.stderr).not.toContain(
        storage.secretAccessKey,
      );
      expect(buildResult.stdout + buildResult.stderr).not.toContain(git.token);
      const html = await readFile(
        join(directory, 'dist/admin/index.html'),
        'utf8',
      );
      const envelope = JSON.parse(
        html.match(
          /<script\b[^>]*id="admin-payload"[^>]*>([\s\S]*?)<\/script>/,
        )![1],
      );
      expect(html).not.toContain('fixture@example.com');
      expect(html).not.toContain('fixture-password');
      await expect(
        decryptAdmin(envelope, 'admin@example.com', 'asdf1234').then(
          () => 'unlocked',
        ),
      ).rejects.toThrow();
      const decrypted = await decryptAdmin(
        envelope,
        'fixture@example.com',
        'fixture-password',
      );
      const admin = JSON.parse(gunzipSync(decrypted).toString());
      expect(admin.props.config.encryptedAdmin).toBe(true);
      expect(admin.props.config.r2).toEqual(storage);
      expect(admin.props.config.git).toEqual(git);
      expect(admin.code).not.toContain('Repository connection');
      expect(admin.code).not.toContain('Access token');
      expect(admin.props.config).not.toHaveProperty('passwordHash');
      expect(admin.code).not.toContain('Storage settings');
      expect(admin.code).not.toContain('Test connection');
      expect(admin.code).toContain('Lock editor');
      expect(admin.code).toContain('quinecms:recovery:v2');
      expect(admin.css.length).toBeGreaterThan(0);
      for (const file of await readdir(join(directory, 'dist'), {
        recursive: true,
        withFileTypes: true,
      })) {
        if (!file.isFile()) continue;
        const published = await readFile(join(file.parentPath, file.name));
        for (const value of [
          storage.accessKeyId,
          storage.secretAccessKey,
          storage.bucket,
          git.token,
          git.repository.owner,
          git.repository.repo,
        ])
          expect(
            published.includes(Buffer.from(value)),
            `Plaintext credential setting in ${file.name}`,
          ).toBe(false);
      }
      const result = await command(directory, [cli, 'check-build']);
      return JSON.parse(result.stdout);
    };
    const demo = await build();
    const previousOutput = await readFile(
      join(directory, 'dist/admin/index.html'),
    );
    await writeFile(
      join(directory, '.env'),
      'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\nR2_BUCKET=incomplete\n',
    );
    await expect(command(directory, [cli, 'build'])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('R2 uploads require'),
    });
    expect(await readFile(join(directory, 'dist/admin/index.html'))).toEqual(
      previousOutput,
    );
    await writeFile(
      join(directory, '.env'),
      'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\nGIT_ACCESS_TOKEN=fixture-git-secret-do-not-publish\n',
    );
    await expect(command(directory, [cli, 'build'])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Git connection requires'),
    });
    expect(await readFile(join(directory, 'dist/admin/index.html'))).toEqual(
      previousOutput,
    );
    await writeFile(join(directory, '.env'), configuredEnv);
    for (const path of [
      'journal/index.html',
      'journal/a-slower-way-to-build/index.html',
    ])
      expect(
        demo.pages.find((page: { page: string }) => page.page === path)
          ?.javascriptModules,
      ).toBe(0);
    for (const name of [
      'react',
      'react-dom',
      'svelte',
      '@vue/runtime-core',
      '@vue/runtime-dom',
    ])
      expect(demo.runtimeCopies[name]).toBe(1);

    await rm(join(directory, 'content'), { recursive: true });
    await mkdir(join(directory, 'content/pages'), { recursive: true });
    await writeFile(
      join(directory, 'content/site.json'),
      JSON.stringify({
        formatVersion: 1,
        id: 'site_client',
        globals: {},
        layout: {
          id: 'alpha',
          version: 1,
          settings: { title: 'Client site', navigation: [] },
        },
      }),
    );
    const pagePath = join(directory, 'content/pages/page_client.json');
    const page = {
      formatVersion: 1,
      id: 'page_client',
      kind: 'static',
      path: '',
      title: '',
      blocks: [],
    };
    await writeFile(pagePath, JSON.stringify(page));
    await command(directory, [cli, 'validate', '--draft']);
    await command(directory, [cli, 'validate', '--draft']);
    await expect(command(directory, [cli, 'validate'])).rejects.toMatchObject({
      code: 1,
    });
    page.title = 'Client home';
    page.path = '/';
    await writeFile(pagePath, JSON.stringify(page));
    const fresh = await build();
    expect(
      fresh.pages.map((page: { page: string }) => page.page).sort(),
    ).toEqual(['admin/index.html', 'index.html']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 90000);

it('fails the static build without both admin credentials', async () => {
  const directory = await projectFixture();
  try {
    await writeFile(join(directory, '.env'), 'ADMIN_EMAIL=\nADMIN_PASSWORD=\n');
    await command(directory, [cli, 'validate']);
    await expect(command(directory, [cli, 'build'])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('ADMIN_EMAIL and ADMIN_PASSWORD'),
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);

it.each([
  ['absent', 'ADMIN_EMAIL=\nADMIN_PASSWORD=\n'],
  ['email only', 'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=\n'],
  ['password only', 'ADMIN_EMAIL=\nADMIN_PASSWORD=fixture-password\n'],
  [
    'configured',
    'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\n',
  ],
])(
  'requires site-owned dev credentials: %s',
  async (scenario, env) => {
    const directory = await projectFixture();
    try {
      await writeFile(join(directory, '.env'), env);
      await command(directory, [cli, 'check']);
      await writeFile(
        join(directory, '.quinecms/workspace/check-dev.mjs'),
        `
      import { dev } from 'astro';
      import { writeFile } from 'node:fs/promises';
        // Astro skips its HTTP middleware when it inherits Vitest's marker.
        delete process.env.VITEST;
        process.env.QUINECMS_SITE_ROOT = ${JSON.stringify(directory)};
        const server = await dev({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
      try {
        const response = await fetch('http://127.0.0.1:' + server.address.port + '/admin/');
        await writeFile('dev-status.json', JSON.stringify(response.status));
        await writeFile('dev-admin.html', await response.text());
      } finally {
        await server.stop();
      }
    `,
      );
      const devResult = await command(join(directory, '.quinecms/workspace'), [
        'check-dev.mjs',
      ]);
      const status = JSON.parse(
        await readFile(
          join(directory, '.quinecms/workspace/dev-status.json'),
          'utf8',
        ),
      );
      const html = await readFile(
        join(directory, '.quinecms/workspace/dev-admin.html'),
        'utf8',
      );
      if (scenario !== 'configured') {
        expect(status).toBe(500);
        expect(html).not.toContain('id="admin-payload"');
        expect(devResult.stdout + devResult.stderr).toContain(
          'ADMIN_EMAIL and ADMIN_PASSWORD',
        );
        return;
      }
      expect(status).toBe(200);
      const envelope = JSON.parse(
        html.match(
          /<script\b[^>]*id="admin-payload"[^>]*>([\s\S]*?)<\/script>/,
        )![1],
      );
      const decrypted = await decryptAdmin(
        envelope,
        'fixture@example.com',
        'fixture-password',
      );
      const admin = JSON.parse(gunzipSync(decrypted).toString());
      expect(admin.props.config.encryptedAdmin).toBe(true);
      expect(admin.props.initial.pages.length).toBeGreaterThan(0);
      await expect(
        decryptAdmin(envelope, 'admin@example.com', 'asdf1234').then(
          () => 'unlocked',
        ),
      ).rejects.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);

it('reloads local content and survives route changes, atomic saves and invalid JSON', async () => {
  const directory = await projectFixture();
  // A site's additional dependencies must not be removed/re-added in the
  // generated package manifest on every content save, restarting Vite.
  const packagePath = join(directory, 'package.json');
  const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
  pkg.dependencies['fixture-extra'] = '1.0.0';
  await writeFile(packagePath, JSON.stringify(pkg));
  await mkdir(join(directory, 'node_modules/fixture-extra'));
  await writeFile(
    join(directory, 'node_modules/fixture-extra/package.json'),
    JSON.stringify({ name: 'fixture-extra', version: '1.0.0' }),
  );
  const env = { ...process.env };
  delete env.VITEST;
  const child = spawn(process.execPath, [cli, 'dev', '--port', '0'], {
    cwd: directory,
    env,
  });
  let output = '';
  let socket: WebSocket | undefined;
  child.stderr.on('data', (data) => (output += data));
  const exited = new Promise((resolve) => child.once('exit', resolve));
  try {
    const url = await new Promise<string>((accept, reject) => {
      const timer = setTimeout(
        () => reject(Error(output || 'Dev startup timed out')),
        25000,
      );
      child.stdout.on('data', (data) => {
        output += data;
        const found = output.match(/QuineCMS dev: (http:\/\/127\.0\.0\.1:\d+)/);
        if (found) {
          clearTimeout(timer);
          accept(found[1]);
        }
      });
      child.once('exit', (code) => {
        clearTimeout(timer);
        reject(Error(`Dev exited ${code}: ${output}`));
      });
    });
    const waitFor = async (
      check: () => Promise<boolean> | boolean,
      description: string,
    ) => {
      for (let attempt = 0; attempt < 150; attempt++) {
        if (await check()) return;
        expect(child.exitCode, output).toBeNull();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw Error(`Dev did not ${description}: ${output}`);
    };
    const waitForText = (path: string, expected: string) =>
      waitFor(async () => {
        // Astro can briefly reconnect while its injected route table changes.
        const response = await fetch(url + path).catch(() => null);
        return !!response?.ok && (await response.text()).includes(expected);
      }, `render ${expected}`);
    await waitForText('/', 'Own content');

    // Connect using the same public endpoint and token as Vite's browser client.
    const client = await (await fetch(url + '/@vite/client')).text();
    const token = client.match(/const wsToken = "([^"]+)"/)?.[1];
    expect(token).toBeTruthy();
    const messages: { type: string }[] = [];
    socket = new WebSocket(
      url.replace('http:', 'ws:') + '/?token=' + token,
      'vite-hmr',
    );
    socket.addEventListener('message', (event) =>
      messages.push(JSON.parse(String(event.data))),
    );
    await waitFor(
      () => messages.some((message) => message.type === 'connected'),
      'connect its reload client',
    );
    const saveAndReload = async (path: string, value: unknown) => {
      messages.length = 0;
      await writeFile(path, JSON.stringify(value));
      await waitFor(
        () => messages.some((message) => message.type === 'full-reload'),
        'notify the browser',
      );
    };
    const home = join(directory, 'content/pages/page_home.json');
    const page = JSON.parse(await readFile(home, 'utf8'));
    page.title = 'Changed from the original site';
    page.blocks[0].props.body = 'Updated JSON block props';
    await saveAndReload(home, page);
    await waitForText('/', page.title);
    await waitForText('/', page.blocks[0].props.body);
    expect(output).not.toContain('Restarting');

    // Composition edits change generated Astro code, not only disk-read props.
    page.blocks.push({
      ...page.blocks[0],
      id: 'block_added',
      props: { title: 'Inserted block', body: 'New composition' },
    });
    await saveAndReload(home, page);
    await waitForText('/', 'New composition');
    page.blocks.pop();
    await saveAndReload(home, page);
    expect(await (await fetch(url)).text()).not.toContain('New composition');

    const sitePath = join(directory, 'content/site.json');
    const site = JSON.parse(await readFile(sitePath, 'utf8'));
    site.layouts[0].design.settings.title = 'Changed layout settings';
    await saveAndReload(sitePath, site);
    await waitForText('/', 'Changed layout settings');

    const entryPath = join(
      directory,
      'content/entries/collection_journal/entry_first.json',
    );
    const entry = JSON.parse(await readFile(entryPath, 'utf8'));
    entry.values.title = 'Changed entry content';
    await saveAndReload(entryPath, entry);
    await waitForText(
      '/journal/a-slower-way-to-build',
      'Changed entry content',
    );

    // An editor may save through a temporary file and rename over the original.
    messages.length = 0;
    page.blocks[0].props.body = 'Atomic save';
    await writeFile(home + '.tmp', JSON.stringify(page));
    await rename(home + '.tmp', home);
    await waitFor(
      () => messages.some((message) => message.type === 'full-reload'),
      'reload an atomic save',
    );
    await waitForText('/', 'Atomic save');

    messages.length = 0;
    await writeFile(home, '{ invalid JSON');
    await waitFor(
      () => messages.some((message) => message.type === 'error'),
      'report invalid JSON',
    );
    page.blocks[0].props.body = 'Recovered after invalid JSON';
    await saveAndReload(home, page);
    await waitForText('/', 'Recovered after invalid JSON');

    const newPage = { ...page, id: 'page_new', path: '/new-page', blocks: [] };
    const newPath = join(directory, 'content/pages/page_new.json');
    await writeFile(newPath, JSON.stringify(newPage));
    await waitForText('/new-page', newPage.title);
    newPage.path = '/renamed-page';
    await writeFile(newPath, JSON.stringify(newPage));
    await waitForText('/renamed-page', newPage.title);
    const waitFor404 = (path: string) =>
      waitFor(
        async () => (await fetch(url + path).catch(() => null))?.status === 404,
        `remove ${path}`,
      );
    await waitFor404('/new-page');
    await rm(newPath);
    await waitFor404('/renamed-page');

    // The source watcher must remain attached after Astro refreshes its routes.
    page.blocks[0].props.body = 'Still watching after route changes';
    await writeFile(home, JSON.stringify(page));
    await waitForText('/', page.blocks[0].props.body);
    await mkdir(join(directory, 'public'));
    await writeFile(
      join(directory, 'public/new-asset.txt'),
      'New public directory',
    );
    await waitForText('/new-asset.txt', 'New public directory');
    expect(child.exitCode).toBeNull();
  } finally {
    socket?.close();
    child.kill('SIGTERM');
    await exited;
    await rm(directory, { recursive: true, force: true });
  }
}, 60000);
