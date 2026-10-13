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
import { fixture } from './support/fixture';
import { migrateSite } from '../src/core/layouts';
import { filesFor } from '../src/core/content';
import { fixtureDirectory } from './support/fixture';

it('generates only the selected shared footer and leaves unchanged registry files in place on rerun', async () => {
  const root = process.cwd(),
    dir = await mkdtemp(join(tmpdir(), 'lean-block-generation-'));
  try {
    await mkdir(join(dir, 'src'), { recursive: true });
    await cp('src/blocks', join(dir, 'src/blocks'), { recursive: true });
    await cp('src/site-layouts', join(dir, 'src/site-layouts'), {
      recursive: true,
    });
    await cp('scripts', join(dir, 'scripts'), { recursive: true });
    await cp(fixtureDirectory, join(dir, 'content'), { recursive: true });
    await cp('public', join(dir, 'public'), { recursive: true });
    for (const f of [
      'package.json',
      'pnpm-lock.yaml',
      'astro.config.mjs',
      'blocks.config.mjs',
      'layouts.config.mjs',
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
    // Assign separate saved layouts to static and generic pages. Generated
    // entry routes must import their generic page's design and head directly.
    const multiple = migrateSite(fixture());
    multiple.site.layouts!.push({
      id: 'layout_chartr',
      name: 'Journal',
      active: true,
      design: { id: 'chartr', version: 1, settings: {} },
    });
    multiple.pages.find((page) => page.kind === 'generic')!.layoutId =
      'layout_chartr';
    for (const [path, body] of Object.entries(filesFor(multiple))) {
      await writeFile(join(dir, path), body);
    }
    generate();
    const home = await readFile(
      join(dir, 'src/generated/pages/page_home.astro'),
      'utf8',
    );
    const entry = await readFile(
      join(dir, `src/generated/pages/${multiple.entries[0].id}.astro`),
      'utf8',
    );
    expect(home).toContain("from '../Layout0.astro'");
    expect(entry).toContain("from '../Layout1.astro'");
    expect(entry).toContain("from '../LayoutHead1.astro'");
    expect(entry).toContain('contentForPage(fullContent,page)');
    // Installing another retained implementation must not silently upgrade the
    // public renderer or remove the prior settings editor from the registry.
    await cp(
      join(dir, 'src/site-layouts/starter/v1'),
      join(dir, 'src/site-layouts/starter/v2'),
      { recursive: true },
    );
    const newer = JSON.parse(
      await readFile(
        join(dir, 'src/site-layouts/starter/v2/definition.json'),
        'utf8',
      ),
    );
    newer.version = 2;
    await writeFile(
      join(dir, 'src/site-layouts/starter/v2/definition.json'),
      JSON.stringify(newer),
    );
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
      import { writeFile } from 'node:fs/promises';
      import { generateLayouts } from ${JSON.stringify(resolve(root, 'scripts/generate-layouts.mjs'))};
      await generateLayouts(writeFile, { layout: { id: 'starter', version: 1 } }, ['starter/v1', 'starter/v2']);
    `,
      ],
      { cwd: dir, stdio: 'pipe' },
    );
    expect(
      await readFile(join(dir, 'src/generated/Layout0.astro'), 'utf8'),
    ).toContain('starter/v1/View.tsx');
    expect(
      await readFile(join(dir, 'src/generated/layout-browser.ts'), 'utf8'),
    ).toContain('starter/v2/Settings.tsx');
    expect(
      await readFile(join(dir, 'src/generated/layout-browser.ts'), 'utf8'),
    ).toContain('starter/v1/Settings.tsx');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}, 15000);
