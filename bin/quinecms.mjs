#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { engineRoot } from '../scripts/site-workspace.mjs';
import { generateSite } from '../scripts/site-generation.mjs';

const [command = 'help', ...args] = process.argv.slice(2);
if (command === 'help' || command === '--help') {
  console.log(
    'QuineCMS: dev | build | validate [--draft] [--base ref] | check | preview | check-build\nRun from a site containing quinecms.config.json.',
  );
  process.exit(0);
}
if (
  !['dev', 'build', 'validate', 'check', 'preview', 'check-build'].includes(
    command,
  )
)
  throw Error(`Unknown command: ${command}`);
const siteRoot = resolve(process.cwd());
const require = createRequire(join(engineRoot, 'package.json'));
const astro = join(
  dirname(require.resolve('astro/package.json')),
  'bin/astro.mjs',
);
let child;
function run(script, options = []) {
  return new Promise((accept, reject) => {
    child = spawn(process.execPath, [...options, script, ...args], {
      cwd: workspace,
      stdio: 'inherit',
      env: {
        ...process.env,
        QUINECMS_SITE_ROOT: siteRoot,
        QUINECMS_ENGINE_ROOT: engineRoot,
      },
    });
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0
        ? accept()
        : reject(Error(`QuineCMS ${command} failed (${signal ?? code}).`)),
    );
  });
}
let workspace = join(siteRoot, '.quinecms/workspace');
async function prepare() {
  ({ workspace } = await generateSite(siteRoot, {
    development: command !== 'build',
    registryOnly: command === 'validate',
  }));
}
try {
  if (command !== 'check-build' && command !== 'preview') await prepare();
  if (command === 'dev') {
    const cleanup = () => {
      child?.kill('SIGTERM');
    };
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    try {
      await run(join(engineRoot, 'scripts/dev-server.mjs'));
    } finally {
      process.off('SIGINT', cleanup);
      process.off('SIGTERM', cleanup);
    }
  } else if (command === 'validate')
    await run(join(workspace, 'scripts/validate-content.ts'), [
      '--import',
      require.resolve('tsx/esm'),
    ]);
  else if (command === 'check-build')
    await run(join(workspace, 'scripts/check-build.mjs'));
  else {
    args.unshift(command);
    await run(astro);
    if (command === 'build') {
      await rm(join(siteRoot, 'dist'), { recursive: true, force: true });
      await cp(join(workspace, 'dist'), join(siteRoot, 'dist'), {
        recursive: true,
      });
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
