import { useEffect, useRef, type ReactNode } from 'react';
import BlockCatalog from '../../../src/editor/BlockCatalog';
import CatalogHeader from '../../../src/editor/CatalogHeader';
import LayoutCatalog from '../../../src/editor/LayoutCatalog';
import { catalogDefinitions } from '../../../src/editor/catalog';
import { layoutDefinitions } from '../../../src/core/layouts';
import { definitions } from '../../../src/generated/definitions';
import styles from '../../../src/editor/editor.module.css';
import { content } from '../content';
import { click, type } from '../dom';
import { interactions, Then, type Section } from '../Specimen';
import {
  Button,
  Dialog,
  PortalProvider,
  Toasts,
  useToast,
} from '../../../src/editor/ui';

const noop = () => {};
const firstBlock = catalogDefinitions(definitions, 'static', 'page')[0];

/** Overlays portal into the specimen, whose transform contains them.
 * The container precedes its provider so Toasts can resolve it on mount. */
function Contained({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={ref} />
      <PortalProvider container={ref}>{children}</PortalProvider>
    </>
  );
}

function Popup({
  catalog = false,
  children,
}: {
  catalog?: boolean;
  children: ReactNode;
}) {
  return (
    <Contained>
      <Dialog.Root open modal={false}>
        <Dialog
          size="lg"
          className={`${styles.popup} ${catalog ? styles.catalogPopup : ''}`}
        >
          {children}
        </Dialog>
      </Dialog.Root>
    </Contained>
  );
}

function Toast({ state }: { state: string }) {
  const toasts = useToast();
  useEffect(() => {
    toasts.add(
      state === 'Success'
        ? {
            title: 'All changes saved to the draft branch.',
            variant: 'success',
            timeout: 0,
          }
        : {
            title:
              state === 'Error' ? 'Unable to complete' : 'Cannot publish yet',
            description: (
              <span className={styles.toastDescription}>
                {state === 'Error'
                  ? 'The repository is unavailable. Retry the connection.'
                  : 'Home · Hero: Title is required.\nKeeping drafts in Git: Cover image is required.\nJournal entry template · Entry heading: Title source is missing.'}
              </span>
            ),
            variant: 'error',
            timeout: 0,
          },
    );
  }, []);
  return null;
}

const section: Section = {
  id: 'overlays',
  title: 'Dialogs and catalogs',
  specimens: [
    {
      title: 'Dialog',
      source: 'src/editor/ui',
      wide: true,
      height: 360,
      pickers: {
        State: ['Confirm', 'Destructive', 'Recovery'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Popup>
          <Dialog.Title>
            {State === 'Confirm'
              ? 'Publish this draft?'
              : State === 'Destructive'
                ? 'Factory reset this site?'
                : 'A newer version is available'}
          </Dialog.Title>
          <Dialog.Description>
            {State === 'Confirm'
              ? 'This updates main with the saved draft. Your hosting provider will rebuild the website.'
              : State === 'Destructive'
                ? 'This clears all pages, content, collection and object schemas, and media records from your local draft.'
                : 'Your changes weren’t saved. They’re still here—keep a backup before loading the latest version.'}
          </Dialog.Description>
          <div className={styles.dialogActions}>
            {State === 'Recovery' ? (
              <>
                <Button>Close</Button>
                <Button>Export backup</Button>
                <Button variant="primary">Load latest version</Button>
              </>
            ) : (
              <>
                <Button>Cancel</Button>
                <Button
                  variant={State === 'Destructive' ? 'destructive' : 'primary'}
                >
                  {State === 'Destructive' ? 'Reset site' : 'Continue'}
                </Button>
              </>
            )}
          </div>
        </Popup>
      ),
    },
    {
      title: 'Toast',
      source: 'src/editor/ui',
      height: 280,
      pickers: { State: ['Success', 'Error', 'Validation'] },
      render: ({ State }) => (
        <Contained>
          <Toasts>
            <Toast state={State} />
          </Toasts>
        </Contained>
      ),
    },
    {
      title: 'Block catalog',
      source: 'src/editor/BlockCatalog.tsx',
      wide: true,
      height: 960,
      pickers: {
        State: [
          'Grid',
          'Search',
          'Tag',
          'No results',
          'Preview',
          'Generic page',
        ],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Popup catalog>
          <CatalogHeader title="Add block" closeLabel="Close block library" />
          <BlockCatalog
            definitions={definitions}
            content={content}
            kind={State === 'Generic page' ? 'generic' : 'static'}
            onAdd={noop}
          />
          {State === 'Search' && (
            <Then run={(stage) => type(stage, 'Search blocks', 'hero')} />
          )}
          {State === 'No results' && (
            <Then run={(stage) => type(stage, 'Search blocks', 'pricing')} />
          )}
          {State === 'Tag' && (
            <Then run={(stage) => click(stage, 'editorial')} />
          )}
          {State === 'Preview' && (
            <Then
              run={(stage) => click(stage, `Preview ${firstBlock.label}`)}
            />
          )}
        </Popup>
      ),
    },
    {
      title: 'Layout catalog',
      source: 'src/editor/LayoutCatalog.tsx',
      wide: true,
      height: 960,
      pickers: {
        State: ['Grid', 'No results', 'Preview'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Popup catalog>
          <LayoutCatalog
            title="Add layout"
            content={content}
            page={content.pages[0]}
            onSelect={noop}
          />
          {State === 'No results' && (
            <Then run={(stage) => type(stage, 'Search layouts', 'gallery')} />
          )}
          {State === 'Preview' && (
            <Then
              run={(stage) =>
                click(stage, `Preview ${layoutDefinitions[0].label} layout`)
              }
            />
          )}
        </Popup>
      ),
    },
  ],
};
export default section;
