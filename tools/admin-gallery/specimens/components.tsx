import { useState } from 'react';
import BlockList from '../../../src/editor/BlockList';
import UsageList from '../../../src/editor/UsageList';
import Navigation, { type EditorArea } from '../../../src/editor/Navigation';
import PanelSection from '../../../src/editor/PanelSection';
import FormScreen from '../../../src/editor/FormScreen';
import Fields from '../../../src/editor/Fields';
import LayoutChoice from '../../../src/editor/LayoutChoice';
import LanguageSettings from '../../../src/editor/LanguageSettings';
import SiteDesign from '../../../src/editor/SiteDesign';
import SchemaFieldEditor from '../../../src/editor/SchemaFieldEditor';
import {
  LanguageContext,
  LanguageSelect,
  replaceRecord,
  useCopy,
} from '../../../src/editor/Languages';
import { incomingUsage } from '../../../src/core/schema';
import type {
  Content,
  Entry,
  Field,
  Page,
  Values,
} from '../../../src/core/types';
import { definitions } from '../../../src/generated/definitions';
import styles from '../../../src/editor/editor.module.css';
import { content, journalFields, longText } from '../content';
import { interactions, type Section } from '../Specimen';
import { Button } from '../../../src/editor/ui';

const noop = () => {};
const field = (key: string) => journalFields.find((f) => f.key === key)!;
const home = content.pages[0];
const usage = incomingUsage(content);
const entry = content.entries[0];
const withoutCopies = (c: Content): Content => ({
  ...c,
  pages: c.pages.map(({ copies, ...page }) => page),
  entries: c.entries.map(({ copies, ...e }) => e),
});
const enabled = (c: Content, on: boolean): Content => ({
  ...c,
  site: { ...c.site, i18n: { ...c.site.i18n!, enabled: on } },
});

function Title() {
  const [values, setValues] = useState<Values>({ title: entry.values.title });
  return (
    <Fields
      fields={[field('title')]}
      values={values}
      onChange={setValues}
      media={content.media}
    />
  );
}

function Blocks({ state }: { state: string }) {
  const [blocks, setBlocks] = useState(home.blocks);
  return (
    <BlockList
      blocks={blocks}
      definitions={
        state === 'Long labels'
          ? definitions.map((d) => ({
              ...d,
              label: `${d.label} · ${longText}`,
            }))
          : definitions
      }
      disabled={state === 'Disabled'}
      onSelect={noop}
      onChange={state === 'Fixed order' ? undefined : setBlocks}
    />
  );
}

function CopyStatus({
  source,
  record,
}: {
  source: Content;
  record: Page | Entry;
}) {
  return <>{useCopy(source, 'id', record, noop).status}</>;
}

function Settings({ initial }: { initial: Content }) {
  const [value, setValue] = useState(initial);
  return (
    <LanguageSettings
      content={value}
      onChange={setValue}
      confirm={({ action }) => action()}
    />
  );
}

function Design({ section }: { section: 'typography' | 'geometry' }) {
  const [globals, setGlobals] = useState<Values>(
    structuredClone(content.site.layouts![0].design.settings),
  );
  return (
    <SiteDesign
      globals={globals}
      onChange={setGlobals}
      defaults={{ contentMaxWidth: 1200, pageGutter: 0 }}
      section={section}
    />
  );
}

function SchemaField({
  initial,
  values = [],
  creating = false,
}: {
  initial: Field;
  values?: unknown[];
  creating?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SchemaFieldEditor
      field={value}
      values={values}
      media={content.media}
      onChange={setValue}
      onBack={noop}
      onDelete={noop}
      onCreate={creating ? noop : undefined}
    />
  );
}

const schemaFields: Record<string, Field> = {
  Text: field('title'),
  Select: field('category'),
  Number: field('readingTime'),
  Reference: field('author'),
  Object: field('seo'),
  Array: field('credits'),
};

const section: Section = {
  id: 'components',
  title: 'Components',
  specimens: [
    {
      title: 'Block list',
      source: 'src/editor/BlockList.tsx',
      width: 'drawer',
      pickers: {
        State: ['Sortable', 'Long labels', 'Fixed order', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => <Blocks state={State} />,
    },
    {
      title: 'Usage list',
      source: 'src/editor/UsageList.tsx',
      width: 'drawer',
      pickers: {
        State: ['One use', 'Several uses', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <UsageList
          content={content}
          uses={
            usage.get(State === 'One use' ? 'entry_ada' : 'layout_main') ?? []
          }
          description="To delete this entry, first remove or change the links below."
          onOpen={noop}
          disabled={State === 'Disabled'}
        />
      ),
    },
    {
      title: 'Navigation',
      source: 'src/editor/Navigation.tsx',
      width: 'sidebar',
      pickers: {
        State: ['Pages', 'Collections open', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => {
        const active: EditorArea =
          State === 'Collections open' ? 'content' : 'pages';
        return (
          <Navigation
            active={active}
            collections={content.collections}
            disabled={State === 'Disabled'}
            onSelect={noop}
          />
        );
      },
    },
    {
      title: 'Panel section',
      source: 'src/editor/PanelSection.tsx',
      width: 'drawer',
      pickers: { State: ['With action', 'Plain'] },
      render: ({ State }) => (
        <PanelSection
          title="Design"
          action={
            State === 'With action' ? <Button>Change design</Button> : undefined
          }
        >
          <strong>Starter</strong>
          <p className={styles.muted}>Version 1</p>
        </PanelSection>
      ),
    },
    {
      title: 'Form screen',
      source: 'src/editor/FormScreen.tsx',
      width: 'drawer',
      pickers: { State: ['Existing', 'Subtitle', 'Creation', 'Long title'] },
      render: ({ State }) => (
        <FormScreen
          stack={false}
          title={
            State === 'Creation'
              ? 'New entry'
              : State === 'Long title'
                ? longText
                : 'Keeping drafts in Git'
          }
          subtitle={State === 'Subtitle' ? 'Credits' : undefined}
          onBack={noop}
          creation={
            State === 'Creation'
              ? { label: 'Create entry', onCreate: noop }
              : undefined
          }
        >
          <Title />
        </FormScreen>
      ),
    },
    {
      title: 'Language select',
      source: 'src/editor/Languages.tsx',
      pickers: {
        State: ['Main language', 'Second language', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <LanguageSelect
          content={content}
          value={State === 'Second language' ? 'id' : 'en'}
          disabled={State === 'Disabled'}
          onChange={noop}
        />
      ),
    },
    {
      title: 'Copy status',
      source: 'src/editor/Languages.tsx',
      width: 'drawer',
      pickers: { State: ['No copy', 'Incomplete', 'Eligible'] },
      render: ({ State }) => {
        if (State === 'No copy')
          return <CopyStatus source={content} record={content.pages[1]} />;
        const record: Entry =
          State === 'Incomplete'
            ? { ...entry, copies: { id: { title: '' } } }
            : entry;
        return (
          <CopyStatus source={replaceRecord(content, record)} record={record} />
        );
      },
    },
    {
      title: 'Layout choice',
      source: 'src/editor/LayoutChoice.tsx',
      width: 'drawer',
      pickers: {
        State: ['Chosen', 'Empty', 'Shared'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <LanguageContext.Provider
          value={{
            main: 'en',
            language: State === 'Shared' ? 'id' : 'en',
            enabled: true,
          }}
        >
          <LayoutChoice
            content={content}
            value={State === 'Empty' ? '' : 'layout_main'}
            onChange={noop}
          />
        </LanguageContext.Provider>
      ),
    },
    {
      title: 'Language settings',
      source: 'src/editor/LanguageSettings.tsx',
      width: 'panel',
      pickers: { State: ['On', 'On with copies', 'Off', 'Off with copies'] },
      render: ({ State }) => {
        const copies = State.endsWith('with copies');
        return (
          <Settings
            initial={enabled(
              copies ? content : withoutCopies(content),
              State.startsWith('On'),
            )}
          />
        );
      },
    },
    {
      title: 'Site design',
      source: 'src/editor/SiteDesign.tsx',
      width: 'drawer',
      pickers: {
        State: ['Typography', 'Content spacing'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Design section={State === 'Typography' ? 'typography' : 'geometry'} />
      ),
    },
    {
      title: 'Schema field editor',
      source: 'src/editor/SchemaFieldEditor.tsx',
      width: 'drawer',
      pickers: {
        State: [...Object.keys(schemaFields), 'Contains content', 'New field'],
      },
      render: ({ State }) =>
        State === 'Contains content' ? (
          <SchemaField
            initial={field('title')}
            values={['Keeping drafts in Git']}
          />
        ) : State === 'New field' ? (
          <SchemaField
            initial={{ key: 'field13', label: 'New field', type: 'text' }}
            creating
          />
        ) : (
          <SchemaField initial={schemaFields[State]} />
        ),
    },
  ],
};
export default section;
