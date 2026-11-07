import type { Block, Content, Field, Media } from '../../src/core/types';
import type { StorageConfig } from '../../src/integrations/media';
import { newBlock } from '../../src/core/content';
import { layoutDefinitions } from '../../src/core/layouts';
import { definitions } from '../../src/generated/definitions';

const block = (type: string, id: string, props = {}): Block => {
  const definition = definitions.find((d) => d.type === type)!;
  const created = newBlock(definition);
  return { ...created, id, props: { ...created.props, ...props } };
};
const image = (id: string, name: string, file: string): Media => {
  const original = {
    key: `${id}/${name}`,
    url: `/media/${file}`,
    mime: 'image/svg+xml',
    bytes: 48_213,
    width: 320,
    height: 200,
  };
  return { formatVersion: 1, id, name, original, variants: [original] };
};
const starter = layoutDefinitions.find((d) => d.id === 'starter')!;
const intr = layoutDefinitions.find((d) => d.id === 'intr')!;

/** Empty R2 settings: uploads are offered, and fail validation before any request. */
export const storage: StorageConfig = {
  accountId: '',
  bucket: '',
  publicURL: '',
  accessKeyId: '',
  secretAccessKey: '',
  maxMB: 10,
  variantWidths: [],
  quality: 80,
};

export const longText =
  'A deliberately long value that keeps going so wrapping, truncation and overflow are visible in narrow controls';

export const journalFields: Field[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    localized: true,
  },
  {
    key: 'summary',
    label: 'Summary',
    type: 'text',
    multiline: true,
    localized: true,
  },
  { key: 'body', label: 'Body', type: 'richtext', localized: true },
  { key: 'published', label: 'Published', type: 'date' },
  {
    key: 'readingTime',
    label: 'Reading time',
    type: 'number',
    min: 1,
    max: 60,
  },
  { key: 'featured', label: 'Featured', type: 'toggle' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'notes', label: 'Notes' },
      { value: 'essays', label: 'Essays' },
    ],
  },
  { key: 'source', label: 'Source link', type: 'url' },
  { key: 'cover', label: 'Cover image', type: 'media', localized: true },
  {
    key: 'author',
    label: 'Author',
    type: 'reference',
    collectionId: 'collection_authors',
  },
  {
    key: 'related',
    label: 'Related entries',
    type: 'array',
    of: { type: 'reference', collectionId: 'collection_journal' },
  },
  { key: 'seo', label: 'SEO', type: 'object', objectId: 'object_seo' },
  {
    key: 'credits',
    label: 'Credits',
    type: 'array',
    max: 4,
    of: {
      type: 'object',
      fields: [
        { key: 'name', label: 'Name', type: 'text', localized: true },
        { key: 'role', label: 'Role', type: 'text', localized: true },
      ],
    },
  },
];

const body =
  '## Notes from the studio\n\nWe keep **every draft** in Git and *review* it before publishing.\n\n- Plan the page\n- Write the copy\n\n[Read the guide](https://example.com/guide)';

export const content: Content = {
  site: {
    formatVersion: 1,
    id: 'site',
    globals: {},
    i18n: { enabled: true, main: 'en', languages: ['id'], missing: 'fallback' },
    layouts: [
      {
        id: 'layout_main',
        name: 'Main layout',
        active: true,
        design: {
          id: starter.id,
          version: starter.version,
          settings: structuredClone(starter.defaults),
        },
      },
      {
        id: 'layout_campaign',
        name: 'Campaign landing pages with a deliberately long layout name',
        active: false,
        design: {
          id: intr.id,
          version: intr.version,
          settings: structuredClone(intr.defaults),
        },
      },
    ],
  },
  pages: [
    {
      formatVersion: 1,
      id: 'page_home',
      kind: 'static',
      path: '/',
      title: 'Home',
      layoutId: 'layout_main',
      blocks: [
        block('hero', 'block_hero', {
          eyebrow: 'Studio',
          title: 'Calm publishing for small teams',
          description: 'Edit, preview and publish from one place.',
        }),
        block('text', 'block_text', {
          body: 'Every page is built from blocks.',
        }),
        block('media', 'block_media', {
          file: { mediaId: 'media_harbour', alt: 'Harbour at dusk' },
          caption: 'Harbour at dusk',
        }),
        block('switcher', 'block_switcher', { title: longText }),
      ],
      copies: { id: { title: 'Beranda' } },
    },
    {
      formatVersion: 1,
      id: 'page_about',
      kind: 'static',
      path: '/about/our-team-and-the-way-we-work-together',
      title: longText,
      layoutId: 'layout_main',
      blocks: [block('text', 'block_about', { body: 'About us.' })],
    },
    {
      formatVersion: 1,
      id: 'page_entry',
      kind: 'generic',
      title: 'Journal entry template',
      layoutId: 'layout_main',
      blocks: [
        {
          ...block('generic-heading', 'block_entry_heading'),
          bindings: {
            title: 'title',
            description: 'summary',
            date: 'published',
          },
        },
      ],
    },
  ],
  objects: [
    {
      formatVersion: 1,
      id: 'object_seo',
      name: 'SEO',
      fields: [
        { key: 'title', label: 'Search title', type: 'text' },
        {
          key: 'description',
          label: 'Search description',
          type: 'text',
          multiline: true,
        },
      ],
    },
  ],
  collections: [
    {
      formatVersion: 1,
      id: 'collection_journal',
      name: 'Journal',
      mode: 'many',
      path: '/journal',
      titleField: 'title',
      genericPageId: 'page_entry',
      fields: journalFields,
    },
    {
      formatVersion: 1,
      id: 'collection_authors',
      name: 'Authors',
      mode: 'many',
      titleField: 'name',
      fields: [{ key: 'name', label: 'Name', type: 'text', required: true }],
    },
    {
      formatVersion: 1,
      id: 'collection_contact',
      name: 'Contact details',
      mode: 'single',
      titleField: 'email',
      fields: [{ key: 'email', label: 'Email', type: 'text' }],
    },
  ],
  entries: [
    {
      formatVersion: 1,
      id: 'entry_drafts',
      collectionId: 'collection_journal',
      slug: 'keeping-drafts',
      values: {
        title: 'Keeping drafts in Git',
        summary: 'Why every change starts as a draft.',
        body,
        published: '2026-10-06',
        readingTime: 4,
        featured: true,
        category: 'essays',
        source: 'https://example.com/drafts',
        cover: { mediaId: 'media_harbour', alt: 'Harbour at dusk' },
        author: 'entry_ada',
        related: ['entry_long'],
        seo: { title: 'Drafts in Git', description: '' },
        credits: [
          { _rowId: 'row_editor', name: 'Grace', role: 'Editor' },
          { _rowId: 'row_photo', name: 'Ada', role: 'Photography' },
        ],
      },
      copies: { id: { title: 'Menyimpan draf di Git' } },
    },
    {
      formatVersion: 1,
      id: 'entry_long',
      collectionId: 'collection_journal',
      slug: 'a-deliberately-long-entry-slug-for-wrapping',
      values: {
        title: longText,
        published: '2026-09-12',
        author: 'entry_grace',
        related: [],
        credits: [],
      },
    },
    {
      formatVersion: 1,
      id: 'entry_ada',
      collectionId: 'collection_authors',
      values: { name: 'Ada Lovelace' },
    },
    {
      formatVersion: 1,
      id: 'entry_grace',
      collectionId: 'collection_authors',
      values: { name: 'Grace Hopper' },
    },
    {
      formatVersion: 1,
      id: 'entry_contact',
      collectionId: 'collection_contact',
      values: { email: 'studio@example.com' },
    },
  ],
  media: [
    image('media_harbour', 'harbour-at-dusk.jpg', 'harbour.svg'),
    image(
      'media_field',
      'a-very-long-file-name-for-the-summer-field-photograph.jpg',
      'field.svg',
    ),
    {
      formatVersion: 1,
      id: 'media_brochure',
      name: 'brochure.pdf',
      original: {
        key: 'media_brochure/brochure.pdf',
        url: '/media/brochure.pdf',
        mime: 'application/pdf',
        bytes: 812_000,
      },
      variants: [],
    },
  ],
};
