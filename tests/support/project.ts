import { mkdir, mkdtemp, symlink, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/** A real, small site using original extensions, with no bundled designs. */
export async function projectFixture() {
  const engineVersion = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  ).version;
  const directory = await mkdtemp(join(tmpdir(), 'quinecms-site-test-'));
  const put = async (name: string, value: unknown) => {
    const path = join(directory, name);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(
      path,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  };
  await put(
    '.env',
    'ADMIN_EMAIL=fixture@example.com\nADMIN_PASSWORD=fixture-password\n',
  );
  await put('package.json', {
    name: 'fixture-site',
    type: 'module',
    dependencies: {
      quinecms: engineVersion,
    },
  });
  await put('pnpm-lock.yaml', 'lockfileVersion: "9.0"\n');
  await put('quinecms.config.json', {
    libraries: [],
    extensions: 'extensions/local',
    initialLayout: { id: 'alpha', version: 1 },
  });
  await mkdir(join(directory, 'node_modules'));
  await symlink(resolve('.'), join(directory, 'node_modules/quinecms'), 'dir');
  const blocks = [
    {
      type: 'text',
      framework: 'react',
      activation: 'never',
      component: 'View.tsx',
      dependencies: { react: '^19', 'react-dom': '^19' },
      source: `export default function View({props}:any){return <section><h1>{props.title}</h1><p>{props.body}</p></section>}`,
    },
    {
      type: 'counter',
      framework: 'react',
      activation: 'load',
      component: 'View.tsx',
      dependencies: { react: '^19', 'react-dom': '^19' },
      source: `import {useState} from 'react'; export default function View(_input:any){const [n,set]=useState(0);return <button onClick={()=>set(n+1)}>Count {n}</button>}`,
    },
    {
      type: 'svelte-fixture',
      framework: 'svelte',
      activation: 'visible',
      component: 'View.svelte',
      dependencies: { svelte: '^5' },
      source: `<script>let {props, context} = $props();</script><p>{props.title}</p>`,
    },
    {
      type: 'vue-fixture',
      framework: 'vue',
      activation: 'idle',
      component: 'View.vue',
      dependencies: { vue: '^3' },
      source: `<script setup>defineProps(['props','context'])</script><template><p>{{props.title}}</p></template>`,
    },
    {
      type: 'vanilla-fixture',
      framework: 'vanilla',
      activation: 'never',
      component: 'View.ts',
      dependencies: {},
      source: `export const render = (_props:unknown,_context:unknown) => '<p>Static HTML</p>';`,
    },
  ];
  for (const { source, ...d } of blocks) {
    await put(`extensions/local/src/blocks/${d.type}/definition.json`, {
      ...d,
      version: 1,
      label: d.type,
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'body', label: 'Body', type: 'text' },
      ],
      defaults: { title: 'Fixture', body: '' },
    });
    await put(`extensions/local/src/blocks/${d.type}/${d.component}`, source);
  }
  for (const id of ['alpha', 'beta']) {
    const base = `extensions/local/src/layouts/${id}`;
    await put(`${base}/definition.json`, {
      id,
      version: 1,
      label: id,
      description: 'Contract fixture',
      activation: 'never',
      component: 'View.tsx',
      settingsComponent: 'Settings.tsx',
      policy: 'policy.ts',
      headComponent: 'Head.astro',
      defaults: { title: 'Fixture', contentMaxWidth: 960, pageGutter: 16 },
      fields: [{ key: 'title', label: 'Title', type: 'text' }],
    });
    await put(
      `${base}/View.tsx`,
      `import type {LayoutProps} from 'quinecms/core/layout-contract'; export default function View({children,settings}:LayoutProps){return <main data-fixture-layout="${id}"><header>{String(settings.title)}</header>{children}</main>}`,
    );
    await put(
      `${base}/Settings.tsx`,
      `import Fields from 'quinecms/editor/Fields'; import type {LayoutSettingsProps} from 'quinecms/core/layout-contract';export default function Settings({settings,content,onChange}:LayoutSettingsProps){return <Fields fields={[{key:'title',label:'Title',type:'text'}]} values={settings} media={content.media} collections={content.collections} onChange={onChange}/>}`,
    );
    await put(
      `${base}/policy.ts`,
      `export default {title:(s:any)=>s.title, globals:(s:any)=>s};`,
    );
    await put(
      `${base}/Head.astro`,
      `---\n---\n<meta name="fixture-layout" content="${id}"/>`,
    );
  }
  await put('extensions/local/quinecms.library.json', {
    id: 'local',
    engine: `^${engineVersion}`,
    blocks: blocks.map((d) => `src/blocks/${d.type}`),
    layouts: ['src/layouts/alpha', 'src/layouts/beta'],
  });
  await put('content/site.json', {
    formatVersion: 1,
    id: 'site_fixture',
    globals: {},
    layouts: [
      {
        id: 'layout_alpha',
        name: 'Main',
        active: true,
        design: {
          id: 'alpha',
          version: 1,
          settings: { title: 'Fixture', contentMaxWidth: 960, pageGutter: 16 },
        },
      },
    ],
  });
  await put('content/pages/page_home.json', {
    formatVersion: 1,
    id: 'page_home',
    kind: 'static',
    title: 'Home',
    path: '/',
    layoutId: 'layout_alpha',
    blocks: blocks.map((d) => ({
      id: 'block_' + d.type,
      type: d.type,
      version: 1,
      props: { title: 'Fixture', body: 'Own content' },
    })),
  });
  await put('content/pages/page_journal.json', {
    formatVersion: 1,
    id: 'page_journal',
    kind: 'static',
    title: 'Journal',
    path: '/journal',
    layoutId: 'layout_alpha',
    blocks: [],
  });
  await put('content/pages/page_entry.json', {
    formatVersion: 1,
    id: 'page_entry',
    kind: 'generic',
    title: 'Entry',
    collectionId: 'collection_journal',
    layoutId: 'layout_alpha',
    blocks: [],
  });
  await put('content/collections/collection_journal.json', {
    formatVersion: 1,
    id: 'collection_journal',
    name: 'Journal',
    genericPageId: 'page_entry',
    mode: 'many',
    path: '/journal',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'summary', label: 'Summary', type: 'text' },
    ],
  });
  await put('content/entries/collection_journal/entry_first.json', {
    formatVersion: 1,
    id: 'entry_first',
    collectionId: 'collection_journal',
    slug: 'a-slower-way-to-build',
    values: { title: 'First entry', summary: 'Retain this content' },
  });
  return directory;
}
