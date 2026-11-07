import { useState, type ReactNode } from 'react';
import Fields from '../../../src/editor/Fields';
import BlockFields from '../../../src/editor/BlockFields';
import MediaUpload, {
  MediaUploadContext,
} from '../../../src/editor/MediaUpload';
import { LanguageContext } from '../../../src/editor/Languages';
import type { Block, Field, Media, Values } from '../../../src/core/types';
import { definitions } from '../../../src/generated/definitions';
import { content, journalFields, longText, storage } from '../content';
import { choose, click } from '../dom';
import { interactions, Then, type Section } from '../Specimen';
import css from '../gallery.module.css';

const field = (key: string) => journalFields.find((f) => f.key === key)!;
const uploaded = content.media[1];
type Upload = (
  file: File,
  progress: (message: string) => void,
  done?: (media: Media) => void,
) => Promise<void>;
const uploads: Record<string, Upload> = {
  success: async (file, progress, done) => {
    progress(`Uploading ${file.name}…`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    done?.(uploaded);
  },
  pending: async (file, progress) => {
    progress(`Uploading ${file.name}…`);
    return new Promise(() => {});
  },
  // The real upload and its real configuration error.
  failed: async (file, progress) => {
    const { upload } = await import('../../../src/integrations/media');
    await upload(file, storage, progress);
  },
};

function Uploads({
  upload = uploads.success,
  available = true,
  children,
}: {
  upload?: Upload;
  available?: boolean;
  children: ReactNode;
}) {
  return (
    <MediaUploadContext.Provider value={{ busy: false, available, upload }}>
      {children}
    </MediaUploadContext.Provider>
  );
}

function Form({
  fields,
  values: initial,
  readOnly = false,
  language = 'en',
  depth,
  available,
}: {
  fields: Field[];
  values: Values;
  readOnly?: boolean;
  language?: string;
  depth?: number;
  available?: boolean;
}) {
  const [values, setValues] = useState(initial);
  return (
    <LanguageContext.Provider value={{ main: 'en', language, enabled: true }}>
      <Uploads available={available}>
        <Fields
          fields={fields}
          values={values}
          onChange={setValues}
          media={content.media}
          readOnly={readOnly}
          depth={depth}
        />
      </Uploads>
    </LanguageContext.Provider>
  );
}

const sample = content.entries[0].values;
const pick = (keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, sample[key]]));
const empty = (keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, null]));
const then = (text: string) => <Then run={(stage) => click(stage, text)} />;

const basic = ['title', 'source', 'readingTime', 'published'];
const embeds = `${sample.body}\n\n![Harbour at dusk](media:media_harbour) ![YouTube video](youtube:aqz-KE-bpKQ)`;
const credits = (names: string[]) =>
  names.map((name, i) => ({ _rowId: `row_${i}`, name, role: 'Editor' }));
const heading = content.pages[2].blocks[0];

function Bindings({ bindings }: { bindings: Block['bindings'] }) {
  const [block, setBlock] = useState<Block>({ ...heading, bindings });
  return (
    <BlockFields
      block={block}
      fields={definitions.find((d) => d.type === heading.type)!.fields}
      generic
      onChange={setBlock}
      media={content.media}
      collections={content.collections}
      readOnly={false}
      pageId="page_entry"
    />
  );
}

const section: Section = {
  id: 'fields',
  title: 'Fields',
  specimens: [
    {
      title: 'Text, URL, number and date',
      source: 'src/editor/Fields.tsx',
      width: 'drawer',
      pickers: {
        State: [
          'Filled',
          'Empty',
          'Required',
          'Read-only',
          'Long text',
          'Shared',
        ],
        Interaction: interactions,
      },
      render: ({ State }) => {
        const fields = basic.map(field);
        if (State === 'Required')
          return (
            <>
              <Form
                fields={fields.map((f) => ({ ...f, required: true }))}
                values={empty(basic)}
              />
              <p className={css.note}>
                No error is shown for blank required fields.
              </p>
            </>
          );
        if (State === 'Long text')
          return (
            <Form
              fields={fields.map((f) => ({
                ...f,
                label: `${f.label} shown to visitors in search results`,
              }))}
              values={{
                ...pick(basic),
                title: longText,
                source: `https://example.com/${longText.replaceAll(' ', '-')}`,
              }}
            />
          );
        return (
          <Form
            fields={fields}
            values={State === 'Empty' ? empty(basic) : pick(basic)}
            readOnly={State === 'Read-only'}
            language={State === 'Shared' ? 'id' : 'en'}
          />
        );
      },
    },
    {
      title: 'Multiline text',
      source: 'src/editor/Fields.tsx',
      width: 'drawer',
      pickers: {
        State: ['Filled', 'Empty', 'Read-only', 'Long text'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Form
          fields={[field('summary')]}
          values={{
            summary:
              State === 'Empty'
                ? null
                : State === 'Long text'
                  ? `${longText}. ${longText}.`
                  : sample.summary,
          }}
          readOnly={State === 'Read-only'}
        />
      ),
    },
    {
      title: 'Toggle',
      source: 'src/editor/Fields.tsx',
      width: 'drawer',
      pickers: {
        State: ['On', 'Off', 'Read-only', 'Shared'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Form
          fields={[field('featured')]}
          values={{ featured: State !== 'Off' }}
          readOnly={State === 'Read-only'}
          language={State === 'Shared' ? 'id' : 'en'}
        />
      ),
    },
    {
      title: 'Select',
      source: 'src/editor/Fields.tsx',
      width: 'drawer',
      pickers: {
        State: ['Chosen', 'Empty', 'Open', 'Read-only', 'Shared'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <>
          <Form
            fields={[field('category')]}
            values={{ category: State === 'Empty' ? null : 'essays' }}
            readOnly={State === 'Read-only'}
            language={State === 'Shared' ? 'id' : 'en'}
          />
          {State === 'Open' && then('Category')}
        </>
      ),
    },
    {
      title: 'Collection and collection field',
      source: 'src/editor/Fields.tsx',
      width: 'drawer',
      pickers: { State: ['Chosen', 'Empty', 'Open', 'Read-only'] },
      render: ({ State }) => (
        <>
          <Form
            fields={[
              { key: 'collection', label: 'Collection', type: 'collection' },
              {
                key: 'titleField',
                label: 'Title field',
                type: 'text',
                collectionField: {
                  collectionKey: 'collection',
                  types: ['text'],
                },
              },
            ]}
            values={
              State === 'Empty'
                ? { collection: null, titleField: null }
                : { collection: 'collection_journal', titleField: 'title' }
            }
            readOnly={State === 'Read-only'}
          />
          {State === 'Open' && then('Title field')}
        </>
      ),
    },
    {
      title: 'Media',
      source: 'src/editor/MediaField.tsx',
      width: 'drawer',
      pickers: {
        State: [
          'Image',
          'Empty',
          'Read-only',
          'Shared image',
          'Uploads unavailable',
        ],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Form
          fields={[{ ...field('cover'), localized: State !== 'Shared image' }]}
          values={{ cover: State === 'Empty' ? null : sample.cover }}
          readOnly={State === 'Read-only'}
          language={State === 'Shared image' ? 'id' : 'en'}
          available={State !== 'Uploads unavailable'}
        />
      ),
    },
    {
      title: 'Upload',
      source: 'src/editor/MediaUpload.tsx',
      width: 'drawer',
      pickers: {
        State: ['Library', 'Field', 'Uploading', 'Uploaded', 'Failed'],
        Interaction: interactions,
      },
      render: ({ State }) => {
        if (State === 'Library')
          return (
            <Uploads>
              <MediaUpload label="Upload file" />
            </Uploads>
          );
        const upload = {
          Uploading: uploads.pending,
          Uploaded: uploads.success,
          Failed: uploads.failed,
        }[State];
        return (
          <Uploads upload={upload}>
            <MediaUpload fieldLabel="Cover image" />
            {upload && (
              <Then
                run={async (stage) =>
                  choose(
                    stage,
                    'File for Cover image',
                    new File(['gallery'], 'harbour.jpg', {
                      type: 'image/jpeg',
                    }),
                  )
                }
              />
            )}
          </Uploads>
        );
      },
    },
    {
      title: 'Rich text',
      source: 'src/editor/RichText.tsx',
      width: 'drawer',
      pickers: {
        State: [
          'Formatted',
          'Empty',
          'Embeds',
          'Image form',
          'YouTube form',
          'Unsupported Markdown',
          'Read-only',
        ],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <>
          <Form
            fields={[field('body')]}
            values={{
              body:
                State === 'Empty'
                  ? ''
                  : State === 'Embeds'
                    ? embeds
                    : State === 'Unsupported Markdown'
                      ? '> A quoted passage the visual editor cannot change.'
                      : sample.body,
            }}
            readOnly={State === 'Read-only'}
          />
          {State === 'Image form' && then('Image')}
          {State === 'YouTube form' && then('YouTube')}
        </>
      ),
    },
    {
      title: 'Reference',
      source: 'src/editor/ReferenceField.tsx',
      width: 'drawer',
      pickers: {
        State: ['Selected', 'Empty', 'Missing entry', 'Picker', 'Read-only'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <>
          <Form
            fields={[field('author')]}
            values={{
              author:
                State === 'Empty'
                  ? null
                  : State === 'Missing entry'
                    ? 'entry_missing'
                    : 'entry_ada',
            }}
            readOnly={State === 'Read-only'}
          />
          {State === 'Picker' && then('Ada Lovelace')}
        </>
      ),
    },
    {
      title: 'References',
      source: 'src/editor/ReferenceField.tsx',
      width: 'drawer',
      pickers: { State: ['Selected', 'Empty', 'Picker'] },
      render: ({ State }) => (
        <>
          <Form
            fields={[field('related')]}
            values={{
              related: State === 'Empty' ? [] : ['entry_long', 'entry_drafts'],
            }}
          />
          {State === 'Picker' && then('2 selected · Related entries')}
        </>
      ),
    },
    {
      title: 'Object',
      source: 'src/editor/ObjectField.tsx',
      width: 'drawer',
      pickers: {
        State: [
          'Filled',
          'Empty',
          'Open',
          'New',
          'Missing definition',
          'Read-only',
        ],
      },
      render: ({ State }) => {
        const seo = field('seo');
        return (
          <>
            <Form
              fields={[
                State === 'Missing definition'
                  ? ({ ...seo, objectId: 'object_missing' } as Field)
                  : seo,
              ]}
              values={{
                seo: State === 'Empty' || State === 'New' ? null : sample.seo,
              }}
              readOnly={State === 'Read-only'}
            />
            {State === 'Open' && then('Edit SEO')}
            {State === 'New' && then('Add SEO')}
          </>
        );
      },
    },
    {
      title: 'List',
      source: 'src/editor/ListField.tsx',
      width: 'drawer',
      pickers: {
        State: [
          'Rows',
          'Empty',
          'Long text',
          'Item',
          'New item',
          'Maximum',
          'Fixed order',
          'Read-only',
          'Nesting limit',
        ],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <>
          <Form
            fields={[field('credits')]}
            values={{
              credits:
                State === 'Empty' || State === 'New item'
                  ? []
                  : State === 'Long text'
                    ? credits([longText, 'Ada'])
                    : State === 'Maximum'
                      ? credits(['Grace', 'Ada', 'Hedy', 'Katherine'])
                      : sample.credits,
            }}
            readOnly={State === 'Read-only'}
            language={State === 'Fixed order' ? 'id' : 'en'}
            depth={State === 'Nesting limit' ? 3 : 0}
          />
          {State === 'Item' && then('Grace')}
          {State === 'New item' && then('Add item')}
        </>
      ),
    },
    {
      title: 'Generic block bindings',
      source: 'src/editor/BlockFields.tsx',
      width: 'drawer',
      pickers: { State: ['Bound', 'Unbound', 'Invalid source'] },
      render: ({ State }) => (
        <Bindings
          bindings={
            State === 'Bound'
              ? heading.bindings
              : State === 'Invalid source'
                ? { title: 'subtitle' }
                : undefined
          }
        />
      ),
    },
  ],
};
export default section;
