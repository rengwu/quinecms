import { fieldDefaults } from '../core/lists';
import BlockCatalog from './BlockCatalog';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import LayoutSettings from './LayoutSettings';
import { migrateSite, activeLayout, layoutKey } from '../core/layouts';
import { PanelNavigation } from './PanelNavigation';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Label } from '@cloudflare/kumo/components/label';
import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { CaretRightIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import CollectionSchema from './CollectionSchema';
import PanelSection from './PanelSection';
import PageList from './PageList';
import Navigation from './Navigation';
import { Toasty, useKumoToastManager } from '@cloudflare/kumo/components/toast';
import { KumoPortalProvider } from '@cloudflare/kumo/utils';
import { Link } from '@cloudflare/kumo/components/link';
import BlockList from './BlockList';
import '@cloudflare/kumo/styles/standalone';
import type {
  Block,
  Collection,
  Content,
  Entry,
  Page,
  Snapshot,
} from '../core/types';
import {
  contextFor,
  filesFor,
  id,
  newBlock,
  schemaChanges,
  serialize,
  switchVersion,
  validate,
} from '../core/content';
import { definitions } from '../generated/definitions';
import { connect, GitHubStore } from '../integrations/github';
import type { Repository } from '../integrations/github';
import type { StorageConfig } from '../integrations/media';
import { digest, download, readRecovery, retain } from './recovery';
import Fields from './Fields';
import BlockFields from './BlockFields';
import SiteDesign from './SiteDesign';
import styles from './editor.module.css';
export interface Config extends Repository {
  passwordHash: string;
  allowedLayoutIds?: string[];
  r2: Pick<StorageConfig, 'accountId' | 'bucket' | 'publicURL'>;
}
function stored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
function stash(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}
export default function App(props: { initial: Content; config: Config }) {
  const portal = useRef<HTMLDivElement>(null);
  return (
    <div className={styles.workspace}>
      {/* Attach the container before Toasty's initial layout effect resolves it. */}
      <div
        ref={portal}
        className={`kumo-ui ${styles.portal}`}
        data-mode="dark"
      />
      <KumoPortalProvider container={portal}>
        <Toasty>
          <Session {...props} />
        </Toasty>
      </KumoPortalProvider>
    </div>
  );
}
function Session({ initial, config }: { initial: Content; config: Config }) {
  const [unlocked, setUnlocked] = useState(
      () =>
        !config.passwordHash || stored('lean:gate', '') === config.passwordHash,
    ),
    [password, setPassword] = useState('');
  const toasts = useKumoToastManager();
  if (!unlocked)
    return (
      <div className={`kumo-ui ${styles.app}`} data-mode="dark">
        <div className={styles.gate}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                !config.passwordHash ||
                (await digest(password)) === config.passwordHash
              ) {
                try {
                  stash('lean:gate', config.passwordHash);
                } catch {}
                setUnlocked(true);
              } else
                toasts.add({
                  title: 'That password does not match.',
                  variant: 'error',
                });
            }}
          >
            <h1>Site editor</h1>
            {config.passwordHash && (
              <>
                <Label htmlFor="password">Password</Label>
                <Input
                  aria-label="Password"
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            )}
            <Button type="submit" variant="primary">
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  return (
    <Editor
      initial={initial}
      config={config}
      onLock={() => {
        try {
          sessionStorage.removeItem('lean:gate');
          sessionStorage.removeItem('lean:github');
          sessionStorage.removeItem('lean:r2');
        } catch {}
        setUnlocked(false);
      }}
    />
  );
}
function Editor({
  initial,
  config,
  onLock,
}: {
  initial: Content;
  config: Config;
  onLock(): void;
}) {
  const recovery = useRef(readRecovery());
  const [content, setContent] = useState<Content>(() =>
    migrateSite(recovery.current?.content ?? initial),
  );
  const [base, setBase] = useState<Snapshot | null>(
    () => recovery.current?.base ?? null,
  );
  const [repo, setRepo] = useState<Repository>(
    () =>
      recovery.current?.repository ?? {
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
      },
  );
  const [draftRepository, setDraftRepository] = useState(repo);
  const [token, setToken] = useState(() => stored('lean:github', ''));
  const [r2, setR2] = useState<StorageConfig>(() =>
    stored('lean:r2', {
      ...config.r2,
      accessKeyId: '',
      secretAccessKey: '',
      maxMB: 30,
      variantWidths: [480, 960, 1600],
      quality: 0.8,
    }),
  );
  const [store, setStore] = useState<GitHubStore | null>(null);
  const [busy, setBusy] = useState(false);
  const toasts = useKumoToastManager();
  function setError(description: string) {
    toasts.add({
      title: 'Unable to complete',
      description: (
        <span className={styles.toastDescription}>{description}</span>
      ),
      variant: 'error',
      timeout: 0,
    });
  }
  function setMessage(title: string) {
    toasts.add({ title, variant: 'success' });
  }
  const recoveryWarning = useRef(false);
  const [tab, setTab] = useState('pages'),
    [selected, setSelected] = useState(''),
    [blockId, setBlockId] = useState(''),
    [collectionId, setCollectionId] = useState(''),
    [schemaId, setSchemaId] = useState(''),
    [modal, setModal] = useState(''),
    [confirm, setConfirm] = useState<{
      title: string;
      body: string;
      action: () => void;
    } | null>(null),
    [size, setSize] = useState('desktop');
  const importRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [layoutPageId, setLayoutPageId] = useState('');
  const page =
    tab === 'layout'
      ? (content.pages.find((p) => p.id === layoutPageId) ??
        content.pages.find((p) => p.id === selected) ??
        content.pages.find((p) => p.path === '/') ??
        content.pages[0])
      : content.pages.find((p) => p.id === selected);
  const doc = page ?? content.entries.find((e) => e.id === selected);
  const selectedBlock = page?.blocks.find((b) => b.id === blockId);
  const blockDefinition =
    selectedBlock &&
    definitions.find(
      (d) =>
        d.type === selectedBlock.type && d.version === selectedBlock.version,
    );
  const collection = content.collections.find((c) => c.id === collectionId);
  const schema = content.collections.find((c) => c.id === schemaId);
  const editingDocument = Boolean(
    doc &&
    ((tab === 'pages' && 'kind' in doc) ||
      (tab === 'content' &&
        'values' in doc &&
        doc.collectionId === collection?.id)),
  );
  const editingBlock = editingDocument && Boolean(selectedBlock);
  const listingPages = tab === 'pages' && !editingDocument;
  const showPreview = (tab === 'pages' && editingDocument) || tab === 'layout';
  const EditorSurface = showPreview ? 'aside' : 'main';
  function openArea(area: string) {
    setModal('');
    setTab(area);
    setBlockId('');
    if (area === 'pages') setSelected('');
    if (area === 'content') {
      setSelected('');
      setCollectionId('');
    }
    if (area === 'schemas') setSchemaId('');
  }
  function openDocument(documentId: string) {
    const entry = content.entries.find((e) => e.id === documentId);
    setSelected(documentId);
    setBlockId('');
    setTab(entry ? 'content' : 'pages');
    if (entry) setCollectionId(entry.collectionId);
  }
  function entryTitle(entry: Entry) {
    const model = content.collections.find((c) => c.id === entry.collectionId);
    return String(
      entry.values[model?.titleField ?? 'title'] ||
        entry.slug ||
        'Untitled entry',
    );
  }

  const dirty =
    serialize(filesFor(content)) !==
    serialize(filesFor(base?.content ?? initial));
  const activeRepo = store?.repository;
  const credentialsMatch =
    activeRepo &&
    activeRepo.owner === repo.owner &&
    activeRepo.repo === repo.repo &&
    activeRepo.branch === repo.branch &&
    JSON.stringify(draftRepository) === JSON.stringify(repo);
  useEffect(() => {
    try {
      retain({ version: 1, repository: draftRepository, base, content });
      recoveryWarning.current = false;
    } catch {
      if (!recoveryWarning.current)
        setError(
          'Tab recovery is unavailable. Export a backup before closing or reloading.',
        );
      recoveryWarning.current = true;
    }
  }, [content, base, draftRepository]);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'The operation failed. Your edits are still here.',
      );
    } finally {
      setBusy(false);
    }
  }
  function changeDoc(next: Page | Entry) {
    if (busy) return;
    setContent((c) => ({
      ...c,
      ...('kind' in next
        ? { pages: c.pages.map((p) => (p.id === next.id ? next : p)) }
        : { entries: c.entries.map((e) => (e.id === next.id ? next : e)) }),
    }));
  }
  function changeBlock(next: Block) {
    if (page)
      changeDoc({
        ...page,
        blocks: page.blocks.map((b) => (b.id === next.id ? next : b)),
      });
  }
  function changeCollection(next: Collection) {
    const after = {
      ...content,
      collections: content.collections.map((c) =>
        c.id === next.id ? next : c,
      ),
    };
    const errors = schemaChanges(content, after);
    if (errors.length) {
      setError(errors.map((e) => e.message).join('\n'));
      return;
    }
    setContent(after);
  }
  async function reconnect() {
    await run(async () => {
      if (dirty && !base)
        throw Error(
          'Export or discard local preview edits before loading a repository draft.',
        );
      const next = await connect(token, repo, definitions);
      const remote = await next.load();
      if (
        base &&
        dirty &&
        (base.sha !== remote.sha ||
          JSON.stringify(draftRepository) !== JSON.stringify(repo))
      ) {
        setStore(next);
        throw Error(
          'The remote draft differs from your recovered work. Your edits are preserved. Export a backup, then reload the draft to reconcile them.',
        );
      }
      try {
        stash('lean:github', token);
      } catch {
        setError('Credentials could not be retained for this tab.');
      }
      setStore(next);
      setDraftRepository(repo);
      if (!dirty) {
        setBase(remote);
        setContent(migrateSite(remote.content));
        setSelected('');
        setCollectionId('');
        setSchemaId('');
        setBlockId('');
      }
      recovery.current = {
        version: 1,
        repository: repo,
        base: dirty ? base : remote,
        content: dirty ? content : remote.content,
      };
      setMessage('Connected to the draft branch.');
      setModal('');
    });
  }
  function reloadDraft() {
    setConfirm({
      title: 'Reload the remote draft?',
      body: 'This replaces local edits. Export a backup first if you want to keep them.',
      action: () => {
        void run(async () => {
          if (!store) throw Error('Connect to GitHub first.');
          const next = await store.load();
          setDraftRepository(store.repository);
          setBase(next);
          setContent(migrateSite(next.content));
          setBlockId('');
          setMessage('Loaded the latest draft.');
          setModal('');
        });
      },
    });
  }
  function validFor(action: 'save' | 'publish') {
    const errors = validate(content, definitions).filter(
      (i) => action === 'publish' || i.phase === 'structure',
    );
    if (!errors.length) return true;
    toasts.add({
      title: action === 'publish' ? 'Cannot publish yet' : 'Cannot save yet',
      description: (
        <span className={styles.toastDescription}>
          {errors
            .map((issue) => {
              const [recordId, blockId] = issue.path.split('.');
              const page = content.pages.find((p) => p.id === recordId);
              const entry = content.entries.find((e) => e.id === recordId);
              const collection = content.collections.find(
                (c) => c.id === recordId || c.id === entry?.collectionId,
              );
              const title =
                page?.title ||
                (entry
                  ? String(
                      entry.values[collection?.titleField ?? 'title'] ??
                        entry.slug,
                    )
                  : collection?.name);
              const block = page?.blocks.find((b) => b.id === blockId);
              const label =
                block &&
                definitions.find(
                  (d) => d.type === block.type && d.version === block.version,
                )?.label;
              const location = [title, label].filter(Boolean).join(' · ');
              return `${location ? location + ': ' : ''}${issue.message}`;
            })
            .join('\n')}
        </span>
      ),
      variant: 'error',
      timeout: 0,
    });
    return false;
  }
  async function save() {
    if (!validFor('save')) return;
    await run(async () => {
      if (!store || !credentialsMatch || !base)
        throw Error('Connect to the repository first.');
      const next = await store.save(base, content);
      setBase(next);
      setContent(migrateSite(next.content));
      setMessage('All changes saved to the draft branch.');
    });
  }
  async function publish() {
    if (!validFor('publish')) return;
    await run(async () => {
      if (!store || !credentialsMatch || !base)
        throw Error('Connect to the repository first.');
      if (dirty) throw Error('Save your changes before publishing.');
      await store.publish(base);
      setMessage(
        'Published to Git. Deployment is pending on your hosting provider.',
      );
    });
  }
  function addPage(kind: Page['kind']) {
    const p: Page = {
      formatVersion: 1,
      id: id('page'),
      kind,
      ...(kind === 'static'
        ? { path: '/new-page-' + content.pages.length }
        : {}),
      title: kind === 'static' ? 'New page' : 'New generic page',
      blocks: [],
    };
    setContent({ ...content, pages: [...content.pages, p] });
    setSelected(p.id);
    setBlockId('');
    setModal('');
  }
  function addCollection() {
    const c: Collection = {
      formatVersion: 1,
      id: id('collection'),
      name: 'New collection',
      path: '/collection-' + content.collections.length,
      titleField: 'title',
      fields: [{ key: 'title', label: 'Title', type: 'text', required: true }],
    };
    setContent({ ...content, collections: [...content.collections, c] });
    setSchemaId(c.id);
  }
  function addEntry() {
    if (!collection) return;
    const e: Entry = {
      formatVersion: 1,
      id: id('entry'),
      collectionId: collection.id,
      slug: 'entry-' + content.entries.length,
      values: fieldDefaults(collection.fields),
    };
    setContent({ ...content, entries: [...content.entries, e] });
    setSelected(e.id);
    setBlockId('');
    setTab('content');
  }
  function backup() {
    download(
      {
        format: 'lean-sitebuilder-backup',
        version: 1,
        repository: draftRepository,
        baseSha: base?.sha ?? null,
        content,
      },
      'site-backup.json',
    );
  }
  async function importBackup(file: File) {
    await run(async () => {
      const data = JSON.parse(await file.text());
      if (data.format !== 'lean-sitebuilder-backup' || data.version !== 1)
        throw Error('Choose a site backup created by this editor.');
      const errors = validate(data.content, definitions).filter(
        (i) => i.phase === 'structure',
      );
      if (errors.length) throw Error(errors.map((i) => i.message).join('\n'));
      if (base) {
        const incompatible = schemaChanges(base.content, data.content);
        if (incompatible.length)
          throw Error(incompatible.map((i) => i.message).join('\n'));
      }
      setConfirm({
        title: 'Restore this backup?',
        body: 'The backup replaces local content. Review it before saving; your current repository connection stays the same.',
        action: () => {
          setContent(migrateSite(data.content));
          setSelected('');
          setBlockId('');
          setMessage('Backup restored as unsaved edits.');
        },
      });
    });
  }
  return (
    <div className={styles.app}>
      <header className={`kumo-ui ${styles.topbar}`} data-mode="dark">
        <Button
          className={styles.navigationToggle}
          aria-label="Open navigation"
          disabled={busy}
          onClick={() => setModal('navigation')}
        >
          Menu
        </Button>
        <span className={styles.brand}>lean-sitebuilder</span>
        {showPreview && (
          <Button
            onClick={() => setSize(size === 'desktop' ? 'mobile' : 'desktop')}
            aria-label="Toggle preview width"
          >
            {size === 'desktop' ? 'Mobile' : 'Desktop'}
          </Button>
        )}
        <Button disabled={busy} onClick={() => setModal('connection')}>
          Connection
        </Button>
        <Button disabled={busy || !dirty} onClick={save}>
          Save draft
        </Button>
        <Button
          variant="primary"
          disabled={busy}
          onClick={() => {
            if (!validFor('publish')) return;
            if (!store || !credentialsMatch || !base) {
              setError('Connect to the repository first.');
              return;
            }
            if (dirty) {
              setError('Save your changes before publishing.');
              return;
            }
            setConfirm({
              title: 'Publish this draft?',
              body: 'This updates main with the saved draft. Your hosting provider will rebuild the website.',
              action: () => void publish(),
            });
          }}
        >
          Publish
        </Button>
      </header>
      <aside
        className={`kumo-ui ${styles.navigation}`}
        data-mode="dark"
        aria-label="Main navigation"
      >
        <Navigation active={tab} disabled={busy} onSelect={openArea} />
      </aside>
      {listingPages ? (
        <PageList
          pages={content.pages}
          busy={busy}
          onAdd={() => setModal('page')}
          onOpen={openDocument}
        />
      ) : (
        <>
          <EditorSurface
            className={`kumo-ui ${showPreview ? styles.drawer : styles.home}`}
            data-mode="dark"
            aria-label={showPreview ? 'Site builder' : 'Admin workspace'}
          >
            <div className={showPreview ? undefined : styles.adminPanel}>
              <fieldset disabled={busy} className={styles.panelBody}>
                <PanelNavigation
                  key={[
                    tab,
                    selected,
                    blockId,
                    collectionId,
                    schemaId,
                    layoutKey(activeLayout(content.site)),
                  ].join(':')}
                >
                  {(tab === 'pages' ||
                    (tab === 'content' && editingDocument)) && (
                    <>
                      {!editingBlock && tab === 'pages' && (
                        <>
                          <Button
                            className={styles.back}
                            variant="ghost"
                            onClick={() => openArea('pages')}
                          >
                            ← Back
                          </Button>
                          <h2>
                            {doc && 'kind' in doc
                              ? doc.title || 'Untitled page'
                              : 'Page'}
                          </h2>
                        </>
                      )}
                      {!editingBlock && tab === 'content' && collection && (
                        <>
                          <Button
                            className={styles.back}
                            variant="ghost"
                            onClick={() => {
                              setSelected('');
                              setBlockId('');
                            }}
                          >
                            ← Back
                          </Button>
                          <h2>
                            {doc && 'values' in doc ? entryTitle(doc) : 'Entry'}
                          </h2>
                        </>
                      )}
                      {editingDocument && doc && (
                        <>
                          {editingBlock && 'kind' in doc ? (
                            <>
                              <Button
                                className={styles.back}
                                variant="ghost"
                                onClick={() => setBlockId('')}
                              >
                                ← Back
                              </Button>
                              <h2>
                                {blockDefinition?.label ?? 'Unavailable block'}
                              </h2>
                              {selectedBlock && (
                                <>
                                  <div className={styles.field}>
                                    <Label htmlFor="version">Version</Label>
                                    <Select
                                      className={styles.full}
                                      id="version"
                                      renderValue={(version) =>
                                        `Version ${version}`
                                      }
                                      value={selectedBlock.version}
                                      disabled={!blockDefinition}
                                      onValueChange={(value) => {
                                        const next = definitions.find(
                                          (d) =>
                                            d.type === selectedBlock.type &&
                                            d.version === Number(value ?? ''),
                                        );
                                        if (blockDefinition && next)
                                          changeBlock(
                                            switchVersion(
                                              selectedBlock,
                                              blockDefinition,
                                              next,
                                            ),
                                          );
                                      }}
                                    >
                                      {definitions
                                        .filter(
                                          (d) => d.type === selectedBlock.type,
                                        )
                                        .map((d) => (
                                          <Select.Option
                                            value={d.version}
                                            key={d.version}
                                          >
                                            Version {d.version}
                                            {d.deprecated
                                              ? ' · deprecated'
                                              : ''}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </div>
                                  {blockDefinition ? (
                                    <BlockFields
                                      key={
                                        selectedBlock.id +
                                        '@' +
                                        selectedBlock.version
                                      }
                                      fields={blockDefinition.fields}
                                      block={selectedBlock}
                                      generic={doc.kind === 'generic'}
                                      onChange={changeBlock}
                                      collections={content.collections}
                                      media={content.media}
                                      readOnly={busy}
                                    />
                                  ) : (
                                    <p className={styles.muted}>
                                      The block data is preserved. Install its
                                      implementation to edit it.
                                    </p>
                                  )}
                                  <div className={styles.actionFooter}>
                                    <Button
                                      onClick={() => {
                                        const previous = (
                                          base?.content ?? initial
                                        ).pages
                                          .find((d) => d.id === doc.id)
                                          ?.blocks.find(
                                            (b) => b.id === selectedBlock.id,
                                          );
                                        if (previous)
                                          changeBlock(
                                            structuredClone(previous),
                                          );
                                        else {
                                          changeDoc({
                                            ...doc,
                                            blocks: doc.blocks.filter(
                                              (b) => b.id !== selectedBlock.id,
                                            ),
                                          });
                                          setBlockId('');
                                        }
                                      }}
                                    >
                                      Cancel block changes
                                    </Button>
                                    <Button
                                      variant="secondary-destructive"
                                      onClick={() => {
                                        changeDoc({
                                          ...doc,
                                          blocks: doc.blocks.filter(
                                            (b) => b.id !== selectedBlock.id,
                                          ),
                                        });
                                        setBlockId('');
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {'kind' in doc ? (
                                <>
                                  <div className={styles.field}>
                                    <Label htmlFor="page-title">
                                      Page title
                                    </Label>
                                    <Input
                                      aria-label="Page title"
                                      id="page-title"
                                      value={doc.title}
                                      onChange={(e) =>
                                        changeDoc({
                                          ...doc,
                                          title: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  {doc.kind === 'static' && (
                                    <div className={styles.field}>
                                      <Label htmlFor="page-path">
                                        URL path
                                      </Label>
                                      <Input
                                        aria-label="URL path"
                                        id="page-path"
                                        value={doc.path ?? ''}
                                        onChange={(e) =>
                                          changeDoc({
                                            ...doc,
                                            path: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className={styles.field}>
                                    <Label htmlFor="slug">URL slug</Label>
                                    <Input
                                      aria-label="URL slug"
                                      id="slug"
                                      value={doc.slug}
                                      onChange={(e) =>
                                        changeDoc({
                                          ...doc,
                                          slug: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <Fields
                                    fields={
                                      content.collections.find(
                                        (c) => c.id === doc.collectionId,
                                      )?.fields ?? []
                                    }
                                    values={doc.values}
                                    onChange={(values) =>
                                      changeDoc({ ...doc, values })
                                    }
                                    media={content.media}
                                    readOnly={busy}
                                  />
                                </>
                              )}
                              {'kind' in doc && (
                                <>
                                  <div className={styles.sectionHeader}>
                                    <h2>Blocks</h2>
                                    <Button
                                      variant="primary"
                                      icon={<PlusIcon />}
                                      onClick={() => setModal('blocks')}
                                    >
                                      Add block
                                    </Button>
                                  </div>
                                  <BlockList
                                    blocks={doc.blocks}
                                    definitions={definitions}
                                    disabled={busy}
                                    onSelect={setBlockId}
                                    onChange={(blocks) =>
                                      changeDoc({ ...doc, blocks })
                                    }
                                  />
                                </>
                              )}
                              <div className={styles.actionFooter}>
                                <Button
                                  variant="secondary-destructive"
                                  onClick={() =>
                                    setConfirm({
                                      title: 'Delete this document?',
                                      body: 'This change is local until you save the draft.',
                                      action: () => {
                                        setContent({
                                          ...content,
                                          pages: content.pages.filter(
                                            (p) => p.id !== doc.id,
                                          ),
                                          entries: content.entries.filter(
                                            (e) => e.id !== doc.id,
                                          ),
                                        });
                                        setSelected('');
                                      },
                                    })
                                  }
                                >
                                  Delete {'kind' in doc ? 'page' : 'entry'}
                                </Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {tab === 'content' && !editingDocument && (
                    <>
                      {collection ? (
                        <>
                          <Button
                            className={styles.back}
                            variant="ghost"
                            onClick={() => {
                              setCollectionId('');
                              setSelected('');
                            }}
                          >
                            ← Back
                          </Button>
                          <div className={styles.sectionHeader}>
                            <h2>{collection.name || 'Untitled collection'}</h2>
                            <Button
                              variant="primary"
                              icon={<PlusIcon />}
                              onClick={addEntry}
                            >
                              Add entry
                            </Button>
                          </div>
                          <ul
                            className={styles.recordList}
                            aria-label="Entries"
                          >
                            {content.entries
                              .filter((e) => e.collectionId === collection.id)
                              .map((entry) => (
                                <li key={entry.id}>
                                  <Button
                                    className={styles.recordButton}
                                    onClick={() => openDocument(entry.id)}
                                  >
                                    <span className={styles.recordLabel}>
                                      {entryTitle(entry)}
                                      <span className={styles.muted}>
                                        /{entry.slug}
                                      </span>
                                    </span>
                                    <CaretRightIcon aria-hidden="true" />
                                  </Button>
                                </li>
                              ))}
                          </ul>
                          {!content.entries.some(
                            (e) => e.collectionId === collection.id,
                          ) && <p className={styles.muted}>No entries yet.</p>}
                        </>
                      ) : (
                        <>
                          <h2>Content</h2>
                          <ul
                            className={styles.recordList}
                            aria-label="Content collections"
                          >
                            {content.collections.map((c) => (
                              <li key={c.id}>
                                <Button
                                  className={styles.recordButton}
                                  onClick={() => {
                                    setCollectionId(c.id);
                                    setSelected('');
                                  }}
                                >
                                  <span>{c.name || 'Untitled collection'}</span>
                                  <CaretRightIcon aria-hidden="true" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                          {!content.collections.length && (
                            <p className={styles.muted}>
                              Create a collection in Collection schemas to start
                              adding content.
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {tab === 'schemas' &&
                    (schema ? (
                      <CollectionSchema
                        key={schema.id}
                        collection={schema}
                        pages={content.pages}
                        entries={content.entries.filter(
                          (e) => e.collectionId === schema.id,
                        )}
                        media={content.media}
                        onChange={changeCollection}
                        onBack={() => setSchemaId('')}
                        onDelete={() => {
                          setContent({
                            ...content,
                            collections: content.collections.filter(
                              (c) => c.id !== schema.id,
                            ),
                          });
                          setSchemaId('');
                        }}
                      />
                    ) : (
                      <>
                        <div className={styles.sectionHeader}>
                          <h2>Collection schemas</h2>
                          <Button
                            variant="primary"
                            icon={<PlusIcon />}
                            onClick={addCollection}
                          >
                            Add collection
                          </Button>
                        </div>
                        <ul
                          className={styles.recordList}
                          aria-label="Collection schemas"
                        >
                          {content.collections.map((c) => (
                            <li key={c.id}>
                              <Button
                                className={styles.recordButton}
                                onClick={() => setSchemaId(c.id)}
                              >
                                <span className={styles.recordLabel}>
                                  {c.name || 'Untitled collection'}
                                  <span className={styles.muted}>
                                    {c.fields.length} fields
                                  </span>
                                </span>
                                <CaretRightIcon aria-hidden="true" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        {!content.collections.length && (
                          <p className={styles.muted}>
                            No collection schemas yet.
                          </p>
                        )}
                      </>
                    ))}
                  {tab === 'media' && (
                    <PanelSection
                      title="Media"
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModal('storage')}
                        >
                          Storage settings
                        </Button>
                      }
                    >
                      <div className={styles.formStack}>
                        <Button
                          variant="primary"
                          onClick={() => uploadRef.current?.click()}
                        >
                          Upload file
                        </Button>
                        <p className={styles.muted}>
                          Uploads go to R2 and may be public before publishing.
                        </p>
                        <input
                          ref={uploadRef}
                          hidden
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void run(async () => {
                              const { upload } =
                                await import('../integrations/media');
                              const media = await upload(file, r2, () => {});
                              setContent((c) => ({
                                ...c,
                                media: [...c.media, media],
                              }));
                              setMessage(
                                'Upload complete. Save the draft to record it.',
                              );
                            });
                            e.target.value = '';
                          }}
                        />
                      </div>
                      <div className={styles.formStack}>
                        {content.media.map((m) => (
                          <div className={styles.mediaCard} key={m.id}>
                            {m.original.mime.startsWith('image/') && (
                              <img
                                src={m.variants[0]?.url ?? m.original.url}
                                alt={m.name}
                              />
                            )}
                            <p>{m.name}</p>
                            <p className={styles.muted}>
                              {Math.round(m.original.bytes / 1024)} KB ·{' '}
                              {m.variants.length} variants
                            </p>
                            <Link
                              href={m.original.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open original
                            </Link>
                          </div>
                        ))}
                      </div>
                    </PanelSection>
                  )}
                  {tab === 'layout' && (
                    <LayoutSettings
                      content={content}
                      allowedIds={config.allowedLayoutIds}
                      previewPage={page}
                      onPreviewPage={setLayoutPageId}
                      onChange={setContent}
                    />
                  )}
                  {tab === 'settings' && (
                    <>
                      <SiteDesign
                        globals={content.site.globals}
                        onChange={(globals) =>
                          setContent({
                            ...content,
                            site: { ...content.site, globals },
                          })
                        }
                      />
                      <PanelSection title="Backups">
                        <p className={styles.muted}>
                          Export or restore site content. Credentials are
                          excluded.
                        </p>
                        <div className={styles.row}>
                          <Button onClick={backup}>Export backup</Button>
                          <Button onClick={() => importRef.current?.click()}>
                            Import backup
                          </Button>
                        </div>
                        <input
                          ref={importRef}
                          hidden
                          type="file"
                          accept="application/json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void importBackup(file);
                            e.target.value = '';
                          }}
                        />
                      </PanelSection>
                      <PanelSection title="Session">
                        <div className={styles.row}>
                          <Button
                            variant="secondary-destructive"
                            onClick={() =>
                              setConfirm({
                                title: 'Discard unsaved edits?',
                                body: 'Return to the last loaded or saved content.',
                                action: () => {
                                  setContent(
                                    migrateSite(
                                      structuredClone(base?.content ?? initial),
                                    ),
                                  );
                                  setBlockId('');
                                  setMessage('Local edits discarded.');
                                },
                              })
                            }
                          >
                            Discard edits
                          </Button>
                          <Button onClick={onLock}>Lock editor</Button>
                        </div>
                      </PanelSection>
                    </>
                  )}
                </PanelNavigation>
              </fieldset>
            </div>
          </EditorSurface>
          {showPreview && (
            <main
              className={styles.preview}
              data-size={size}
              aria-label="Live preview"
            >
              <LayoutSurface
                content={content}
                onNavigate={(url, documentId) => {
                  if (documentId) openDocument(documentId);
                  else {
                    const id = Object.entries(
                      contextFor(content, 'navigation').links,
                    ).find(([, path]) => path === url)?.[0];
                    if (id) openDocument(id);
                  }
                }}
              >
                <PageBlocks
                  content={content}
                  page={page}
                  selectedId={blockId}
                  className={styles.previewBlock}
                />
                {!page?.blocks.length && (
                  <div className={styles.empty}>
                    Add a block to start building.
                  </div>
                )}
              </LayoutSurface>
            </main>
          )}
        </>
      )}
      <Dialog.Root
        open={!!modal || !!confirm}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setModal('');
            setConfirm(null);
          }
        }}
      >
        <Dialog
          size="lg"
          className={`${styles.popup} ${modal === 'blocks' ? styles.catalogPopup : ''}`}
        >
          <Dialog.Title
            className={
              modal === 'blocks' && !confirm ? styles.srOnly : undefined
            }
          >
            {confirm?.title ??
              {
                navigation: 'Navigation',
                page: 'Add page',
                blocks: 'Add a block',
                connection: 'Repository connection',
                storage: 'R2 storage',
              }[modal] ??
              ''}
          </Dialog.Title>
          {confirm ? (
            <>
              <Dialog.Description>{confirm.body}</Dialog.Description>
              <div className={styles.dialogActions}>
                <Button onClick={() => setConfirm(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const action = confirm.action;
                    setConfirm(null);
                    action();
                  }}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              {modal === 'navigation' && (
                <>
                  <Navigation
                    active={tab}
                    disabled={busy}
                    onSelect={openArea}
                  />
                  <div className={styles.dialogActions}>
                    <Dialog.Close render={<Button />}>Close</Dialog.Close>
                  </div>
                </>
              )}
              {modal === 'page' && (
                <div className={styles.formStack}>
                  <Button onClick={() => addPage('static')}>Static page</Button>
                  <p className={styles.muted}>
                    A public page with its own content and URL.
                  </p>
                  <Button onClick={() => addPage('generic')}>
                    Generic page
                  </Button>
                  <p className={styles.muted}>
                    A reusable layout populated by collection entries.
                  </p>
                </div>
              )}
              {modal === 'blocks' && (
                <>
                  <Dialog.Close
                    render={
                      <Button
                        variant="ghost"
                        shape="square"
                        className={styles.catalogClose}
                        aria-label="Close block library"
                      />
                    }
                  >
                    <XIcon size={20} />
                  </Dialog.Close>
                  <BlockCatalog
                    definitions={definitions}
                    content={content}
                    kind={page?.kind ?? 'static'}
                    onAdd={(d) => {
                      const b = newBlock(d);
                      if (page) {
                        changeDoc({ ...page, blocks: [...page.blocks, b] });
                        setBlockId(b.id);
                      }
                      setModal('');
                    }}
                  />
                </>
              )}
              {modal === 'connection' && (
                <>
                  <p className={styles.muted}>
                    Use a GitHub token with repository contents read and write
                    access. Private drafts are fetched directly from GitHub.
                  </p>
                  {(['owner', 'repo', 'branch'] as const).map((key) => (
                    <div className={styles.field} key={key}>
                      <Label>
                        {key === 'owner'
                          ? 'Owner'
                          : key === 'repo'
                            ? 'Repository'
                            : 'Draft branch'}
                        <Input
                          aria-label={
                            key === 'owner'
                              ? 'Owner'
                              : key === 'repo'
                                ? 'Repository'
                                : 'Draft branch'
                          }
                          autoComplete="off"
                          value={repo[key]}
                          onChange={(e) => {
                            setStore(null);
                            setRepo({ ...repo, [key]: e.target.value });
                          }}
                        />
                      </Label>
                    </div>
                  ))}
                  <div className={styles.field}>
                    <Label>
                      GitHub token
                      <Input
                        aria-label="GitHub token"
                        type="password"
                        autoComplete="off"
                        value={token}
                        onChange={(e) => {
                          setStore(null);
                          setToken(e.target.value);
                        }}
                      />
                    </Label>
                  </div>
                  <p className={styles.muted}>
                    Credentials remain in this browser tab until you lock the
                    editor or close the tab. The site password is a convenience
                    gate; repository permissions control writing.
                  </p>
                  <div className={styles.row}>
                    <Button disabled={busy || !store} onClick={reloadDraft}>
                      Reload draft
                    </Button>
                    <Button onClick={backup}>Export backup</Button>
                  </div>
                  <div className={styles.dialogActions}>
                    <Dialog.Close render={<Button />}>Close</Dialog.Close>
                    <Button
                      variant="primary"
                      disabled={busy}
                      onClick={reconnect}
                    >
                      Connect
                    </Button>
                  </div>
                </>
              )}
              {modal === 'storage' && (
                <>
                  {(
                    [
                      'accountId',
                      'bucket',
                      'publicURL',
                      'accessKeyId',
                      'secretAccessKey',
                    ] as const
                  ).map((key) => (
                    <div className={styles.field} key={key}>
                      <Label>
                        {
                          {
                            accountId: 'Account ID',
                            bucket: 'Bucket',
                            publicURL: 'Public URL',
                            accessKeyId: 'Access key ID',
                            secretAccessKey: 'Secret access key',
                          }[key]
                        }
                        <Input
                          aria-label={
                            {
                              accountId: 'Account ID',
                              bucket: 'Bucket',
                              publicURL: 'Public URL',
                              accessKeyId: 'Access key ID',
                              secretAccessKey: 'Secret access key',
                            }[key]
                          }
                          type={key === 'secretAccessKey' ? 'password' : 'text'}
                          autoComplete="off"
                          value={r2[key]}
                          onChange={(e) =>
                            setR2({ ...r2, [key]: e.target.value })
                          }
                        />
                      </Label>
                    </div>
                  ))}
                  <div className={styles.field}>
                    <Label>
                      Upload limit (MB)
                      <Input
                        aria-label="Upload limit (MB)"
                        type="number"
                        min="1"
                        value={r2.maxMB}
                        onChange={(e) =>
                          setR2({ ...r2, maxMB: Number(e.target.value) })
                        }
                      />
                    </Label>
                  </div>
                  <div className={styles.field}>
                    <Label>
                      Image widths
                      <Input
                        aria-label="Image widths"
                        value={r2.variantWidths.join(', ')}
                        onChange={(e) =>
                          setR2({
                            ...r2,
                            variantWidths: e.target.value
                              .split(',')
                              .map(Number),
                          })
                        }
                      />
                    </Label>
                  </div>
                  <div className={styles.field}>
                    <Label>
                      Image quality
                      <Input
                        aria-label="Image quality"
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={r2.quality}
                        onChange={(e) =>
                          setR2({ ...r2, quality: Number(e.target.value) })
                        }
                      />
                    </Label>
                  </div>
                  <div className={styles.dialogActions}>
                    <Dialog.Close render={<Button />}>Close</Dialog.Close>
                    <Button
                      variant="primary"
                      onClick={() => {
                        try {
                          stash('lean:r2', r2);
                          setModal('');
                          setMessage('Storage settings retained for this tab.');
                        } catch {
                          setError(
                            'Could not retain credentials. Settings remain usable until reload.',
                          );
                        }
                      }}
                    >
                      Use settings
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </Dialog>
      </Dialog.Root>
    </div>
  );
}
