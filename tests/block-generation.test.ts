import { expect, it } from 'vitest';
import {
  mkdtemp,
  cp,
  mkdir,
  readFile,
  writeFile,
  stat,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

it('generates only the selected shared footer and leaves unchanged registry files in place on rerun', async () => {
  const root = process.cwd(),
    dir = await mkdtemp(join(tmpdir(), 'lean-block-generation-'));
  try {
    await mkdir(join(dir, 'src'), { recursive: true });
    await cp('src/blocks', join(dir, 'src/blocks'), { recursive: true });
    await cp('scripts', join(dir, 'scripts'), { recursive: true });
    await cp('content', join(dir, 'content'), { recursive: true });
    for (const f of [
      'package.json',
      'pnpm-lock.yaml',
      'astro.config.mjs',
      'blocks.config.mjs',
      'tsconfig.json',
    ])
      await cp(f, join(dir, f));
    const site = JSON.parse(
      await readFile(join(dir, 'content/site.json'), 'utf8'),
    );
    const d = JSON.parse(
      await readFile('src/blocks/tw-footer-2/v1/definition.json', 'utf8'),
    );
    site.footer = {
      id: 'test-footer',
      type: d.type,
      version: d.version,
      props: d.defaults,
    };
    await writeFile(join(dir, 'content/site.json'), JSON.stringify(site));
    const generate = () =>
      execFileSync(
        process.execPath,
        [resolve(root, 'scripts/generate-blocks.mjs')],
        { cwd: dir, stdio: 'pipe' },
      );
    generate();
    const footer = await readFile(
      join(dir, 'src/generated/Footer.astro'),
      'utf8',
    );
    expect(footer).toContain('content.site.footer.props');
    expect(footer).not.toContain('browser');
    const wrapper = footer.match(/from '(\.\/Block\d+\.astro)'/)![1];
    expect(
      await readFile(join(dir, 'src/generated', wrapper), 'utf8'),
    ).toContain('tw-footer-2/v1/View.tsx');
    const before = (await stat(join(dir, 'src/generated/definitions.ts')))
      .mtimeMs;
    await writeFile(join(dir, 'src/generated/stale.astro'), 'obsolete');
    generate();
    expect(
      (await stat(join(dir, 'src/generated/definitions.ts'))).mtimeMs,
    ).toBe(before);
    await expect(
      stat(join(dir, 'src/generated/stale.astro')),
    ).rejects.toThrow();
    const routes = await readFile(
      join(dir, 'src/generated/pages/page_home.astro'),
      'utf8',
    );
    expect(routes).toContain('<Public');
    expect(routes).not.toContain('renderers');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
