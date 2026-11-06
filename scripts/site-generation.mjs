import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { prepareSite } from './site-workspace.mjs';

const require = createRequire(import.meta.url);

export async function generateSite(siteRoot, options = {}) {
  const prepared = await prepareSite(siteRoot, options);
  await new Promise((accept, reject) => {
    const generator = spawn(
      process.execPath,
      [
        '--import',
        require.resolve('tsx/esm'),
        join(prepared.workspace, 'scripts/generate-blocks.mjs'),
        ...(options.registryOnly ? ['--registry-only'] : []),
      ],
      { cwd: prepared.workspace, stdio: 'inherit' },
    );
    generator.on('error', reject);
    generator.on('exit', (code) =>
      code === 0 ? accept() : reject(Error('Site generation failed.')),
    );
  });
  return prepared;
}
