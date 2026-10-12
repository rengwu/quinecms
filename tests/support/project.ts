import { cp, mkdtemp, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fixtureDirectory } from './fixture';

export async function projectFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'lean-site-test-'));
  await writeFile(
    join(directory, '.env'),
    'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\n',
  );
  for (const name of ['src', 'scripts', 'public'])
    await cp(name, join(directory, name), {
      recursive: true,
      filter: (path) => !path.includes('src/generated'),
    });
  await cp(fixtureDirectory, join(directory, 'content'), { recursive: true });
  for (const name of [
    'package.json',
    'pnpm-lock.yaml',
    'astro.config.mjs',
    'blocks.config.mjs',
    'layouts.config.mjs',
    'tsconfig.json',
  ])
    await cp(name, join(directory, name));
  await symlink(
    resolve('node_modules'),
    join(directory, 'node_modules'),
    'dir',
  );
  return directory;
}
