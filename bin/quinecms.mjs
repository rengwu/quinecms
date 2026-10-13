#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { prepareSite, engineRoot } from '../scripts/site-workspace.mjs';

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
  ({ workspace } = await prepareSite(siteRoot, {
    development: command !== 'build',
  }));
  await new Promise((accept, reject) => {
    const generator = spawn(
      process.execPath,
      [
        '--import',
        require.resolve('tsx/esm'),
        join(workspace, 'scripts/generate-blocks.mjs'),
        ...(command === 'validate' ? ['--registry-only'] : []),
      ],
      { cwd: workspace, stdio: 'inherit' },
    );
    generator.on('error', reject);
    generator.on('exit', (code) =>
      code === 0 ? accept() : reject(Error('Site generation failed.')),
    );
  });
}
try {
  if (command !== 'check-build' && command !== 'preview') await prepare();
  if (command === 'dev') {
    let timer,
      busy = false,
      again = false;
    const rebuild = async () => {
      if (busy) {
        again = true;
        return;
      }
      busy = true;
      try {
        await prepare();
      } catch (error) {
        console.error(error.message);
      } finally {
        busy = false;
        if (again) {
          again = false;
          void rebuild();
        }
      }
    };
    const watcher = watch(siteRoot, { recursive: true }, (_event, name) => {
      if (!name || /^(\.quinecms|node_modules|\.git|dist)(\/|$)/.test(name))
        return;
      if (
        !/^(content\/|src\/|extensions\/|public\/|scripts\/|quinecms\.config\.json$)/.test(
          name,
        )
      )
        return;
      clearTimeout(timer);
      timer = setTimeout(rebuild, 120);
    });
    const cleanup = () => {
      clearTimeout(timer);
      watcher.close();
      child?.kill('SIGTERM');
    };
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    try {
      await run(join(engineRoot, 'scripts/dev-server.mjs'));
    } finally {
      watcher.close();
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
