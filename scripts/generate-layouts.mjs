import { readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import installed from '../layouts.config.mjs';

export async function generateLayouts(writeFile, site, registry = installed) {
  const definitions = [];
  const keys = new Set();
  for (const directory of registry) {
    const base = resolve(directory);
    const d = JSON.parse(
      await readFile(resolve(base, 'definition.json'), 'utf8'),
    );
    const key = `${d.id}@${d.version}`;
    if (
      !/^[a-z][a-z0-9-]*$/.test(d.id) ||
      !Number.isInteger(d.version) ||
      d.version < 1 ||
      typeof d.label !== 'string' ||
      !['never', 'load'].includes(d.activation) ||
      !d.defaults ||
      Array.isArray(d.defaults) ||
      !Array.isArray(d.fields) ||
      keys.has(key)
    )
      throw new Error(`Invalid or duplicate layout definition: ${directory}`);
    keys.add(key);
    const sources = {};
    for (const name of [
      'component',
      'settingsComponent',
      'policy',
      ...(d.headComponent ? ['headComponent'] : []),
    ]) {
      if (typeof d[name] !== 'string')
        throw new Error(`Missing ${name} in ${key}`);
      const file = resolve(base, d[name]);
      if (!file.startsWith(base + '/'))
        throw new Error(`Layout source must stay in ${directory}`);
      await readFile(file);
      sources[name] = '../' + relative(resolve('src'), file);
    }
    definitions.push({ definition: d, sources });
  }
  await writeFile(
    'src/generated/layouts.ts',
    `import type { LayoutDefinition } from '../core/types';
import type { LayoutPolicy } from '../core/layout-contract';
${definitions.map(({ sources }, i) => `import policy${i} from ${JSON.stringify(sources.policy)};`).join('\n')}
export const layoutDefinitions: LayoutDefinition[] = ${JSON.stringify(
      definitions.map((d) => d.definition),
      null,
      2,
    )};
export const layoutPolicies: Record<string, LayoutPolicy> = {${definitions.map(({ definition: d }, i) => `${JSON.stringify(`${d.id}@${d.version}`)}: policy${i}`).join(',')}};
`,
  );
  await writeFile(
    'src/generated/layout-browser.ts',
    `export const layoutRenderers = {
${definitions.map(({ definition: d, sources }) => `${JSON.stringify(`${d.id}@${d.version}`)}: () => import(${JSON.stringify(sources.component)})`).join(',\n')}
};
export const layoutEditors = {
${definitions.map(({ definition: d, sources }) => `${JSON.stringify(`${d.id}@${d.version}`)}: () => import(${JSON.stringify(sources.settingsComponent)})`).join(',\n')}
};
`,
  );
  console.log(`Registered ${definitions.length} layout versions.`);
  // Registry-only generation lets the validator inspect unfinished site drafts.
  if (!site) return;
  for (const [index, selected] of definitions.entries()) {
    await writeFile(
      `src/generated/LayoutHead${index}.astro`,
      selected.sources.headComponent
        ? `---
import Head from ${JSON.stringify(selected.sources.headComponent)};
import { activeLayout } from '../core/layouts';
const { content } = Astro.props;
---
<Head settings={activeLayout(content.site).settings} content={content} />
`
        : '---\n---\n',
    );
    await writeFile(
      `src/generated/Layout${index}.astro`,
      `---
import Layout from ${JSON.stringify(selected.sources.component)};
import { activeLayout } from '../core/layouts';
const { content } = Astro.props;
const { settings } = activeLayout(content.site);
---
<Layout {content} {settings} ${selected.definition.activation === 'never' ? '' : 'client:load'}><slot /></Layout>
`,
    );
  }
  return definitions.map(({ definition }) => definition);
}
