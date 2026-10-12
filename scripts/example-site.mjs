import { cp, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));

/** Stage an ordinary, disposable builder checkout. Never swap the active content,
 * copy private .env files, or add a second content-root contract to the CMS. */
export async function prepareExample(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw Error('Invalid example name.');
  const source = join(root, 'examples', name, 'content');
  await readFile(join(source, 'site.json'));
  const directory = await mkdtemp(join(tmpdir(), `lean-example-${name}-`));
  for (const path of [
    'src',
    'scripts',
    'public',
    'package.json',
    'pnpm-lock.yaml',
    'astro.config.mjs',
    'blocks.config.mjs',
    'layouts.config.mjs',
    'tsconfig.json',
  ])
    await cp(join(root, path), join(directory, path), {
      recursive: true,
      filter: (path) => !path.startsWith(join(root, 'src/generated')),
    });
  await cp(source, join(directory, 'content'), { recursive: true });
  await symlink(
    join(root, 'node_modules'),
    join(directory, 'node_modules'),
    'dir',
  );
  await writeFile(
    join(directory, '.env'),
    'ADMIN_EMAIL=quine@example.test\nADMIN_PASSWORD=quine-preview\n',
  );
  return directory;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [name = 'quine', action = 'dev'] = process.argv.slice(2);
  if (!['prepare', 'dev', 'build'].includes(action))
    throw Error(
      'Usage: node scripts/example-site.mjs quine [prepare|dev|build]',
    );
  const directory = await prepareExample(name);
  console.log(`Isolated example: ${directory}`);
  console.log(
    action === 'build'
      ? 'Built demo editor: quine@example.test / quine-preview (do not deploy).'
      : 'Development editor: admin@example.com / asdf1234.',
  );
  if (action !== 'prepare') {
    const run = (args) =>
      new Promise((resolve, reject) => {
        const child = spawn('pnpm', args, {
          cwd: directory,
          stdio: 'inherit',
          env: {
            ...process.env,
            ADMIN_EMAIL: 'quine@example.test',
            ADMIN_PASSWORD: 'quine-preview',
            PUBLIC_GIT_NAMESPACE: '',
            PUBLIC_GIT_REPO: '',
            PUBLIC_GITHUB_OWNER: '',
            PUBLIC_GITHUB_REPO: '',
            SITE_LAYOUT_WHITELIST: 'quine',
          },
        });
        const stop = () => child.kill('SIGTERM');
        process.once('SIGINT', stop);
        process.once('SIGTERM', stop);
        child.once('error', reject);
        child.once('exit', (code, signal) => {
          process.removeListener('SIGINT', stop);
          process.removeListener('SIGTERM', stop);
          code === 0 || signal === 'SIGTERM'
            ? resolve()
            : reject(Error(`pnpm ${args.join(' ')} exited ${code}`));
        });
      });
    await run(['validate:content']);
    if (action === 'build') {
      await run(['build']);
      await run(['check:build']);
      console.log(`Built example: ${directory}/dist`);
    } else await run(['dev', '--port', '4322']);
  }
}
