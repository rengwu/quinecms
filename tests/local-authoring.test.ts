import { expect, it } from 'vitest';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
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
  [
    'different',
    'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\n',
  ],
])(
  'uses the single fixed dev login with %s configured credentials',
  async (_, env) => {
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
        if (!response.ok) throw Error('Admin returned HTTP ' + response.status);
        await writeFile('dev-admin.html', await response.text());
      } finally {
        await server.stop();
      }
    `,
      );
      await command(join(directory, '.quinecms/workspace'), ['check-dev.mjs']);
      const html = await readFile(
        join(directory, '.quinecms/workspace/dev-admin.html'),
        'utf8',
      );
      const envelope = JSON.parse(
        html.match(
          /<script\b[^>]*id="admin-payload"[^>]*>([\s\S]*?)<\/script>/,
        )![1],
      );
      const decrypted = await decryptAdmin(
        envelope,
        'admin@example.com',
        'asdf1234',
      );
      const admin = JSON.parse(gunzipSync(decrypted).toString());
      expect(admin.props.config.encryptedAdmin).toBe(true);
      expect(admin.props.initial.pages.length).toBeGreaterThan(0);
      await expect(
        decryptAdmin(envelope, 'fixture@example.com', 'fixture-password').then(
          () => 'unlocked',
        ),
      ).rejects.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);

it('keeps the dev server and watcher together while local content and routes change', async () => {
  const directory = await projectFixture();
  const env = { ...process.env };
  delete env.VITEST;
  const child = spawn(process.execPath, [cli, 'dev', '--port', '0'], {
    cwd: directory,
    env,
  });
  let output = '';
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
    const home = join(directory, 'content/pages/page_home.json');
    const page = JSON.parse(await readFile(home, 'utf8'));
    page.title = 'Changed from the original site';
    await writeFile(home, JSON.stringify(page));
    const waitForText = async (path: string, expected: string) => {
      for (let attempt = 0; attempt < 80; attempt++) {
        const response = await fetch(url + path);
        if (response.ok && (await response.text()).includes(expected)) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw Error(`Dev did not render ${expected}: ${output}`);
    };
    await waitForText('/', page.title);
    page.id = 'page_new';
    page.path = '/new-page';
    page.blocks = [];
    await writeFile(
      join(directory, 'content/pages/page_new.json'),
      JSON.stringify(page),
    );
    await waitForText('/new-page', page.title);
    expect(child.exitCode).toBeNull();
  } finally {
    child.kill('SIGTERM');
    await exited;
    await rm(directory, { recursive: true, force: true });
  }
}, 60000);
