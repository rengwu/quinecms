import { click, type } from './dom';

export interface Screen {
  label: string;
  /** The stand-in repository connection; omitted means no Git configuration. */
  git?: 'ready' | 'connecting' | 'failed' | 'stale';
  /** The control only exists at narrow widths. */
  narrow?: boolean;
  steps?(root: Document): Promise<void>;
}

const page = async (root: Document) => click(root, 'Home');
const entry = async (root: Document) => {
  await click(root, 'Collections');
  await click(root, 'Journal');
  await click(root, 'Keeping drafts in Git');
};
const collection = async (root: Document) => {
  await click(root, 'Collection schemas');
  await click(root, 'Journal');
};
const edit = async (root: Document) => {
  await page(root);
  await type(root, 'Page title', 'Home, edited');
};

/** Real App screens, reached the way an editor reaches them. */
export const screens: Record<string, Record<string, Screen>> = {
  pages: {
    list: { label: 'Pages' },
    page: { label: 'Page', steps: page },
    block: {
      label: 'Block',
      steps: async (root) => {
        await page(root);
        await click(root, 'Hero');
      },
    },
    add: {
      label: 'New page',
      steps: async (root) => {
        await click(root, 'Add page');
        await click(root, 'Static page');
      },
    },
    stacked: {
      label: 'New block stack',
      steps: async (root) => {
        await page(root);
        await click(root, 'Add block');
        await click(root, 'Hero');
      },
    },
    catalog: {
      label: 'Add block',
      steps: async (root) => {
        await page(root);
        await click(root, 'Add block');
      },
    },
    delete: {
      label: 'Delete confirmation',
      steps: async (root) => {
        await page(root);
        await click(root, 'Document actions');
        await click(root, 'Delete page');
      },
    },
  },
  preview: {
    split: {
      label: 'Split',
      steps: async (root) => {
        await page(root);
      },
    },
    floating: {
      label: 'Float',
      steps: async (root) => {
        await page(root);
        await click(root, 'Float preview');
      },
    },
    floatingMobile: {
      label: 'Float · mobile',
      steps: async (root) => {
        await page(root);
        await click(root, 'Float preview');
        await click(root, 'Toggle preview width');
      },
    },
    mobile: {
      label: 'Mobile canvas',
      steps: async (root) => {
        await page(root);
        await click(root, 'Toggle preview width');
      },
    },
    off: {
      label: 'Off',
      steps: async (root) => {
        await page(root);
        await click(root, 'Close preview');
      },
    },
  },
  content: {
    collections: {
      label: 'Collections',
      steps: (root) => click(root, 'Collections'),
    },
    entries: {
      label: 'Entries',
      steps: async (root) => {
        await click(root, 'Collections');
        await click(root, 'Journal');
      },
    },
    entry: { label: 'Entry', steps: entry },
    item: {
      label: 'List item',
      steps: async (root) => {
        await entry(root);
        await click(root, 'Grace');
      },
    },
    single: {
      label: 'Single entry',
      steps: async (root) => {
        await click(root, 'Collections');
        await click(root, 'Contact details');
      },
    },
  },
  schemas: {
    collection: { label: 'Collection', steps: collection },
    field: {
      label: 'Field',
      steps: async (root) => {
        await collection(root);
        await click(root, 'Category');
      },
    },
    objects: {
      label: 'Objects',
      steps: async (root) => {
        await click(root, 'Objects');
      },
    },
  },
  areas: {
    media: { label: 'Media', steps: (root) => click(root, 'Media') },
    layouts: {
      label: 'Site Layouts',
      steps: (root) => click(root, 'Layouts'),
    },
    layout: {
      label: 'Layout',
      steps: async (root) => {
        await click(root, 'Layouts');
        await click(root, 'Main layout');
      },
    },
    settings: { label: 'Settings', steps: (root) => click(root, 'Settings') },
    menu: {
      label: 'Menu',
      narrow: true,
      steps: (root) => click(root, 'Toggle navigation'),
    },
  },
  topbar: {
    local: { label: 'Local preview' },
    connecting: { label: 'Connecting', git: 'connecting' },
    failed: { label: 'Connection failed', git: 'failed' },
    saved: { label: 'Saved', git: 'ready' },
    unsaved: { label: 'Unsaved', git: 'ready', steps: edit },
    stale: {
      label: 'Newer draft',
      git: 'stale',
      steps: async (root) => {
        await edit(root);
        await click(root, 'Save draft');
      },
    },
    publish: {
      label: 'Publish confirmation',
      git: 'ready',
      steps: (root) => click(root, 'Publish'),
    },
    language: {
      label: 'Second language',
      steps: async (root) => {
        await click(root, 'Editing language');
        await click(root, 'Indonesian');
        await page(root);
      },
    },
  },
};
