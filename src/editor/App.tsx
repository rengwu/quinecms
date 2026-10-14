import { legacyBackupFormat } from './legacy-brand';
import { ModelContext } from './ModelContext';
import { fieldDefaults } from '../core/lists';
import BlockCatalog from './BlockCatalog';
import CatalogHeader from './CatalogHeader';
import DocumentCreation from './DocumentCreation';
import BlockCreation from './BlockCreation';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import SiteLayouts from './SiteLayouts';
import LayoutChoice from './LayoutChoice';
import MediaUpload, { MediaUploadContext } from './MediaUpload';
import {
  migrateSite,
  layoutDefinitions,
  activeLayout,
  layoutKey,
  siteLayouts,
  contentForPage,
} from '../core/layouts';
import { PanelNavigation } from './PanelNavigation';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { Switch } from '@cloudflare/kumo/components/switch';
import { Label } from '@cloudflare/kumo/components/label';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import Schemas from './Schemas';
import { incomingUsage } from '../core/schema';
import UsageList from './UsageList';
import type { UsageTarget } from './usage';
import { entryPath } from '../core/routes';
import PanelSection from './PanelSection';
import PageList from './PageList';
import Navigation, { type EditorArea } from './Navigation';
import { Toasty, useKumoToastManager } from '@cloudflare/kumo/components/toast';
import { KumoPortalProvider } from '@cloudflare/kumo/utils';
import { Link } from '@cloudflare/kumo/components/link';
import BlockList from './BlockList';
import '@cloudflare/kumo/styles/standalone';
import type {
  Block,
  Content,
  Entry,
  Media,
  Page,
  Snapshot,
} from '../core/types';
import {
  contextFor,
  factoryReset,
  filesFor,
  id,
  newBlock,
  schemaChanges,
  serialize,
  switchVersion,
  validate,
} from '../core/content';
import { definitions } from '../generated/definitions';
import { initialLayout } from '../generated/site-config';
const resetLayoutLabel =
  layoutDefinitions.find(
    (d) => d.id === initialLayout.id && d.version === initialLayout.version,
  )?.label ?? initialLayout.id;
import { connect, repositoryKey } from '../integrations/git';
import type { Repository, RepositoryStore } from '../integrations/repository';
import { Conflict, publishBranch } from '../integrations/repository';
import type { StorageConfig } from '../integrations/media';
import type { GitConfig } from '../admin/git';
import {
  download,
  readRecovery,
  retain,
  recoveryProblem,
  discardRecovery,
  recoveryText,
} from './recovery';
import Fields from './Fields';
import BlockFields from './BlockFields';
import styles from './editor.module.css';
import {
  AdminThemeContext,
  adminThemeKey,
  readAdminMode,
  useAdminTheme,
  type AdminMode,
} from './AdminTheme';
export interface Config {
  encryptedAdmin?: boolean;
  git: GitConfig | null;
  r2: StorageConfig | null;
}
export default function App(props: {
  initial: Content;
  config: Config;
  onLock?: () => void;
}) {
  const portal = useRef<HTMLDivElement>(null);
  const [mode, updateMode] = useState(readAdminMode);
  function setMode(next: AdminMode) {
    updateMode(next);
    try {
      localStorage.setItem(adminThemeKey, next);
    } catch {
      // The current session can still change theme when storage is unavailable.
    }
  }
  return (
    <AdminThemeContext.Provider value={{ mode, setMode }}>
      <div className={styles.workspace}>
        <div
          className={`kumo-ui ${styles.adminCanvas}`}
          data-mode={mode}
          aria-hidden="true"
        />
        {/* Attach the container before Toasty's initial layout effect resolves it. */}
        <div
          ref={portal}
          className={`kumo-ui ${styles.portal}`}
          data-mode={mode}
        />
        <KumoPortalProvider container={portal}>
          <Toasty>
            <Editor
              {...props}
              onLock={() => {
                for (const key of [
                  'lean:gate',
                  'lean:github',
                  'lean:git',
                  'lean:r2',
                ]) {
                  try {
                    sessionStorage.removeItem(key);
                  } catch {}
                }
                props.onLock?.();
              }}
            />
          </Toasty>
        </KumoPortalProvider>
      </div>
    </AdminThemeContext.Provider>
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
  const { mode, setMode } = useAdminTheme();
  const [recovery] = useState(() => ({ current: readRecovery() }));
  const [content, setContent] = useState<Content>(() =>
    migrateSite(recovery.current?.content ?? initial),
  );
  const [base, setBase] = useState<Snapshot | null>(
    () => recovery.current?.base ?? null,
  );
  const repo = config.git?.repository;
  const [draftRepository, setDraftRepository] = useState<Repository>(
    () =>
      recovery.current?.repository ??
      repo ?? { owner: '', repo: '', branch: 'draft' },
  );
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'failed' | 'ready' | 'disabled'
  >(config.git ? 'connecting' : 'disabled');
  const r2 = config.r2;
  const [store, setStore] = useState<RepositoryStore | null>(null);
  const [busy, setBusy] = useState(Boolean(config.git));
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'failed' | 'stale' | 'blocked'
  >('idle');
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
  const [tab, setTab] = useState<EditorArea>('pages'),
    [selected, setSelected] = useState(''),
    [blockId, setBlockId] = useState(''),
    [collectionId, setCollectionId] = useState(''),
    [schemaId, setSchemaId] = useState(''),
    [modal, setModal] = useState(''),
    [confirm, setConfirm] = useState<{
      title: string;
      body: string;
      actionLabel?: string;
      destructive?: boolean;
      action: () => void;
    } | null>(null),
    [size, setSize] = useState('desktop');
  const importRef = useRef<HTMLInputElement>(null);
  const [layoutId, setLayoutId] = useState('');
  const [pendingDocument, setPendingDocument] = useState<Page | Entry | null>(
    null,
  );
  const [pendingBlock, setPendingBlock] = useState<Block | null>(null);
  const page = content.pages.find((p) => p.id === selected);
  const doc = page ?? content.entries.find((e) => e.id === selected);
  const selectedBlock = page?.blocks.find((b) => b.id === blockId);
  const blockDefinition =
    selectedBlock &&
    definitions.find(
      (d) =>
        d.type === selectedBlock.type && d.version === selectedBlock.version,
    );
  const collection = content.collections.find((c) => c.id === collectionId);
  const usageIndex = useMemo(() => incomingUsage(content), [content]);
  const documentUses = (usageIndex.get(doc?.id ?? '') ?? []).filter(
    (use) => use.ownerId !== doc?.id,
  );
  const editingDocument = Boolean(
    doc &&
    ((tab === 'pages' && 'kind' in doc) ||
      (tab === 'content' &&
        'values' in doc &&
        doc.collectionId === collection?.id)),
  );
  const editingBlock = editingDocument && Boolean(selectedBlock);
  const listingPages = tab === 'pages' && !editingDocument && !pendingDocument;
  const showPreview = !pendingDocument && tab === 'pages' && editingDocument;
  // Creation stays outside content/recovery until Create, but renders through
  // the same page and context as a committed block.
  const previewContent = useMemo(
    () =>
      pendingBlock && page
        ? {
            ...content,
            pages: content.pages.map((p) =>
              p.id === page.id
                ? { ...p, blocks: [...p.blocks, pendingBlock] }
                : p,
            ),
          }
        : content,
    [content, page, pendingBlock],
  );
  const previewPage = previewContent.pages.find((p) => p.id === page?.id);
  const renderContent = previewPage
    ? contentForPage(previewContent, previewPage)
    : previewContent;
  const EditorSurface = showPreview ? 'aside' : 'main';
  function openArea(area: EditorArea) {
    setSchemaId('');
    setLayoutId('');
    setPendingDocument(null);
    setPendingBlock(null);
    setModal('');
    setTab(area);
    setBlockId('');
    if (area === 'pages') setSelected('');
    if (area === 'content') {
      setSelected('');
      setCollectionId('');
    }
  }
  function openDocument(documentId: string) {
    setPendingDocument(null);
    setPendingBlock(null);
    const entry = content.entries.find((e) => e.id === documentId);
    setSelected(documentId);
    setBlockId('');
    setTab(entry ? 'content' : 'pages');
    if (entry) setCollectionId(entry.collectionId);
  }
  function openUsage(target: UsageTarget) {
    if (target.area === 'pages' || target.area === 'content') {
      openDocument(target.id);
      setBlockId(target.blockId ?? '');
    } else {
      openArea(target.area);
      if (target.area === 'layout')
        setLayoutId(target.id ?? siteLayouts(content.site)[0]?.id ?? '');
      else setSchemaId(target.id);
    }
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
    serialize(filesFor(migrateSite(base?.content ?? initial)));
  const activeRepo = store?.repository;
  const credentialsMatch =
    repo &&
    activeRepo &&
    repositoryKey(activeRepo) === repositoryKey(repo) &&
    repositoryKey(draftRepository) === repositoryKey(repo);
  useEffect(() => {
    try {
      retain({ version: 1, repository: draftRepository, base, content });
      recoveryWarning.current = false;
    } catch {
      if (!recoveryWarning.current)
        setError(
          recoveryProblem() ||
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
  async function uploadMedia(
    file: File,
    onProgress: (message: string) => void,
    onUploaded?: (media: Media) => void,
  ) {
    if (!r2) throw Error('Uploads are unavailable for this site.');
    setBusy(true);
    try {
      const { upload } = await import('../integrations/media');
      const media = await upload(file, r2, onProgress);
      // Apply the field first: layout editors can replace a whole content snapshot.
      // Append afterward so that snapshot cannot drop the new media record.
      onUploaded?.(media);
      setContent((content) => ({
        ...content,
        media: [...content.media, media],
      }));
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
  async function reconnect(cancelled = () => false) {
    if (!config.git || !repo) return;
    setBusy(true);
    setConnectionState('connecting');
    try {
      const next = await connect(config.git.token, repo, definitions);
      if (cancelled()) return;
      const remote = await next.load();
      if (cancelled()) return;
      setStore(next);
      setConnectionState('ready');
      if (
        dirty &&
        (!base || repositoryKey(draftRepository) !== repositoryKey(repo))
      ) {
        setSaveState('blocked');
        setModal('recovered');
        return;
      }
      if (dirty && base?.sha !== remote.sha) {
        setSaveState('stale');
        setModal('stale');
        return;
      }
      setDraftRepository(repo);
      setSaveState('idle');
      if (!dirty) {
        setBase(remote);
        setContent(migrateSite(remote.content));
        setSelected('');
        setCollectionId('');
        setBlockId('');
      }
    } catch (error) {
      if (cancelled()) return;
      setConnectionState('failed');
      setError(
        error instanceof Error
          ? error.message
          : 'Could not load the repository draft. Your edits are still here.',
      );
    } finally {
      if (!cancelled()) setBusy(false);
    }
  }
  useEffect(() => {
    let cancelled = false;
    void reconnect(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);
  function reloadDraft() {
    setConfirm({
      title: 'Load the latest version?',
      body: 'This replaces your browser edits with the latest saved draft. Export a backup first if you want to keep them. You will need to reapply your changes manually.',
      actionLabel: 'Load latest version',
      destructive: true,
      action: () => {
        void run(async () => {
          if (!store)
            throw Error('The repository is unavailable. Retry the connection.');
          const next = await store.load();
          setDraftRepository(store.repository);
          setBase(next);
          setContent(migrateSite(next.content));
          setSaveState('idle');
          setSelected('');
          setCollectionId('');
          setBlockId('');
          setPendingBlock(null);
          setPendingDocument(null);
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
    if (saveState === 'stale') {
      setModal('stale');
      return;
    }
    if (!validFor('save')) {
      setSaveState('failed');
      return;
    }
    await run(async () => {
      setSaveState('saving');
      try {
        if (!store || !credentialsMatch || !base)
          throw Error('The repository is unavailable. Retry the connection.');
        const next = await store.save(base, content);
        setBase(next);
        setContent(migrateSite(next.content));
        setSaveState('idle');
        setMessage('All changes saved to the draft branch.');
      } catch (error) {
        if (error instanceof Conflict) {
          setSaveState('stale');
          setModal('stale');
        } else {
          setSaveState('failed');
          throw error;
        }
      }
    });
  }
  async function publish() {
    if (!validFor('publish')) return;
    await run(async () => {
      if (!store || !credentialsMatch || !base)
        throw Error('The repository is unavailable. Retry the connection.');
      if (dirty) throw Error('Save your changes before publishing.');
      await store.publish(base);
      setMessage(
        `Published to ${publishBranch(store.repository)}. Deployment is pending on your hosting provider.`,
      );
    });
  }
  function addPage(kind: Page['kind']) {
    const available = siteLayouts(content.site).filter(
      (layout) => layout.active,
    );
    const p: Page = {
      formatVersion: 1,
      id: id('page'),
      layoutId: available.length === 1 ? available[0].id : '',
      kind,
      ...(kind === 'static'
        ? { path: '/new-page-' + content.pages.length }
        : {}),
      title: kind === 'static' ? 'New page' : 'New generic page',
      blocks: [],
    };
    setPendingDocument(p);
    setBlockId('');
    setModal('');
  }
  function addEntry() {
    if (!collection || collection.mode === 'single') return;
    const e: Entry = {
      formatVersion: 1,
      id: id('entry'),
      collectionId: collection.id,
      ...(collection.genericPageId
        ? { slug: 'entry-' + content.entries.length }
        : {}),
      values: fieldDefaults(collection.fields, content),
    };
    setPendingDocument(e);
    setBlockId('');
    setTab('content');
  }
  function createDocument() {
    if (!pendingDocument) return;
    if (
      'kind' in pendingDocument &&
      !siteLayouts(content.site).some(
        (layout) => layout.active && layout.id === pendingDocument.layoutId,
      )
    ) {
      setError('Choose a site layout before creating the page.');
      return;
    }
    setContent(
      'kind' in pendingDocument
        ? { ...content, pages: [...content.pages, pendingDocument] }
        : { ...content, entries: [...content.entries, pendingDocument] },
    );
    setSelected(pendingDocument.id);
    setPendingDocument(null);
  }
  function backup() {
    download(
      {
        format: 'quinecms-backup',
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
      if (
        !['quinecms-backup', legacyBackupFormat].includes(data.format) ||
        data.version !== 1
      )
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
  return createElement(
    MediaUploadContext.Provider,
    { value: { busy, available: r2 !== null, upload: uploadMedia } },
    <ModelContext.Provider value={content}>
      <div className={styles.app}>
        <header className={`kumo-ui ${styles.topbar}`} data-mode={mode}>
          <Button
            className={styles.navigationToggle}
            aria-label="Open navigation"
            disabled={busy}
            onClick={() => setModal('navigation')}
          >
            Menu
          </Button>
          <span className={styles.brand}>QuineCMS</span>
          {(showPreview || (tab === 'layout' && !!layoutId)) && (
            <Button
              onClick={() => setSize(size === 'desktop' ? 'mobile' : 'desktop')}
              aria-label="Toggle preview width"
            >
              {size === 'desktop' ? 'Mobile' : 'Desktop'}
            </Button>
          )}
          <div className={styles.saveControls}>
            <span role="status" className={styles.saveStatus}>
              {connectionState === 'connecting' ? (
                'Connecting…'
              ) : connectionState === 'failed' ? (
                <Button
                  variant="ghost"
                  className={styles.saveStatusAction}
                  disabled={busy}
                  onClick={() => void reconnect()}
                >
                  Retry connection
                </Button>
              ) : saveState === 'blocked' ? (
                <Button
                  variant="ghost"
                  className={styles.saveStatusAction}
                  disabled={busy}
                  onClick={() => setModal('recovered')}
                >
                  Recovered edits need attention
                </Button>
              ) : saveState === 'stale' ? (
                <Button
                  variant="ghost"
                  className={styles.saveStatusAction}
                  disabled={busy}
                  onClick={() => setModal('stale')}
                >
                  Newer draft available
                </Button>
              ) : saveState === 'saving' ? (
                'Saving…'
              ) : dirty ? (
                saveState === 'failed' ? (
                  'Not saved'
                ) : (
                  'Unsaved changes'
                )
              ) : base ? (
                'Saved to draft'
              ) : (
                'Local preview'
              )}
            </span>
            <Button
              disabled={
                busy ||
                !store ||
                !credentialsMatch ||
                !base ||
                !dirty ||
                saveState === 'stale' ||
                saveState === 'blocked'
              }
              onClick={save}
            >
              Save draft
            </Button>
          </div>
          <Button
            variant="primary"
            disabled={
              busy ||
              !store ||
              !credentialsMatch ||
              !base ||
              saveState === 'stale' ||
              saveState === 'blocked'
            }
            onClick={() => {
              if (!validFor('publish')) return;
              if (!store || !credentialsMatch || !base) {
                setError(
                  'The repository is unavailable. Retry the connection.',
                );
                return;
              }
              if (dirty) {
                setError('Save your changes before publishing.');
                return;
              }
              setConfirm({
                title: 'Publish this draft?',
                body: `This updates ${publishBranch(repo!)} with the saved draft. Your hosting provider will rebuild the website.`,
                action: () => void publish(),
              });
            }}
          >
            Publish
          </Button>
        </header>
        <aside
          className={`kumo-ui ${styles.navigation}`}
          data-mode={mode}
          aria-label="Main navigation"
        >
          <Navigation active={tab} disabled={busy} onSelect={openArea} />
        </aside>
        {tab === 'layout' ? (
          <SiteLayouts
            content={content}
            selected={layoutId}
            onSelect={setLayoutId}
            size={size}
            busy={busy}
            onChange={setContent}
            onOpen={openUsage}
          />
        ) : listingPages ? (
          <PageList
            pages={content.pages}
            layouts={siteLayouts(content.site)}
            busy={busy}
            onAdd={() => setModal('page')}
            onOpen={openDocument}
          />
        ) : (
          <>
            <EditorSurface
              className={`kumo-ui ${showPreview ? styles.drawer : styles.home}`}
              data-mode={mode}
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
                      pendingDocument?.id,
                      pendingBlock?.id,
                      layoutKey(activeLayout(renderContent.site)),
                    ].join(':')}
                  >
                    {pendingDocument ? (
                      <DocumentCreation
                        document={pendingDocument}
                        content={content}
                        onChange={setPendingDocument}
                        onCreate={createDocument}
                        onCancel={() => setPendingDocument(null)}
                      />
                    ) : pendingBlock && page ? (
                      <BlockCreation
                        block={pendingBlock}
                        content={content}
                        pageId={page.id}
                        onChange={setPendingBlock}
                        onCancel={() => setPendingBlock(null)}
                        onCreate={() => {
                          changeDoc({
                            ...page,
                            blocks: [...page.blocks, pendingBlock],
                          });
                          setBlockId(pendingBlock.id);
                          setPendingBlock(null);
                        }}
                      />
                    ) : (
                      <>
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
                            {!editingBlock &&
                              tab === 'content' &&
                              collection && (
                                <>
                                  <Button
                                    className={styles.back}
                                    variant="ghost"
                                    onClick={() => {
                                      setSelected('');
                                      setBlockId('');
                                      if (collection.mode === 'single')
                                        setCollectionId('');
                                    }}
                                  >
                                    ← Back
                                  </Button>
                                  <h2>
                                    {doc && 'values' in doc
                                      ? entryTitle(doc)
                                      : 'Entry'}
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
                                    <div className={styles.blockHeader}>
                                      <h2
                                        title={
                                          blockDefinition?.label ??
                                          'Unavailable block'
                                        }
                                      >
                                        {blockDefinition?.label ??
                                          'Unavailable block'}
                                      </h2>
                                      {selectedBlock && (
                                        <div className={styles.blockVersion}>
                                          <Select
                                            className={styles.full}
                                            id="version"
                                            aria-label="Version"
                                            renderValue={(version) =>
                                              `Version ${version}`
                                            }
                                            value={selectedBlock.version}
                                            disabled={!blockDefinition}
                                            onValueChange={(value) => {
                                              const next = definitions.find(
                                                (d) =>
                                                  d.type ===
                                                    selectedBlock.type &&
                                                  d.version ===
                                                    Number(value ?? ''),
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
                                                (d) =>
                                                  d.type === selectedBlock.type,
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
                                      )}
                                    </div>
                                    {selectedBlock && (
                                      <>
                                        {blockDefinition ? (
                                          <BlockFields
                                            pageId={page?.id}
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
                                            The block data is preserved. Install
                                            its implementation to edit it.
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
                                                  (b) =>
                                                    b.id === selectedBlock.id,
                                                );
                                              if (previous)
                                                changeBlock(
                                                  structuredClone(previous),
                                                );
                                              else {
                                                changeDoc({
                                                  ...doc,
                                                  blocks: doc.blocks.filter(
                                                    (b) =>
                                                      b.id !== selectedBlock.id,
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
                                                  (b) =>
                                                    b.id !== selectedBlock.id,
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
                                        <LayoutChoice
                                          content={content}
                                          value={doc.layoutId}
                                          onChange={(layoutId) =>
                                            changeDoc({ ...doc, layoutId })
                                          }
                                        />
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
                                        {collection?.genericPageId &&
                                          collection.mode === 'many' && (
                                            <div className={styles.field}>
                                              <Label htmlFor="slug">
                                                URL slug
                                              </Label>
                                              <Input
                                                aria-label="URL slug"
                                                id="slug"
                                                value={doc.slug ?? ''}
                                                onChange={(e) =>
                                                  changeDoc({
                                                    ...doc,
                                                    slug: e.target.value,
                                                  })
                                                }
                                              />
                                            </div>
                                          )}
                                        <Fields
                                          collections={content.collections}
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
                                    <UsageList
                                      content={content}
                                      uses={documentUses}
                                      description={
                                        'values' in doc &&
                                        collection?.mode === 'single'
                                          ? 'Other content links to this entry.'
                                          : `To delete this ${'kind' in doc ? 'page' : 'entry'}, first remove or change the links below.`
                                      }
                                      onOpen={openUsage}
                                      disabled={busy}
                                    />
                                    {!(
                                      'values' in doc &&
                                      collection?.mode === 'single'
                                    ) && (
                                      <div className={styles.actionFooter}>
                                        <Button
                                          disabled={!!documentUses.length}
                                          variant="secondary-destructive"
                                          onClick={() =>
                                            setConfirm({
                                              title: 'Delete this document?',
                                              body: 'This change is local until you save the draft.',
                                              action: () => {
                                                const next = {
                                                  ...content,
                                                  pages: content.pages.filter(
                                                    (p) => p.id !== doc.id,
                                                  ),
                                                  entries:
                                                    content.entries.filter(
                                                      (e) => e.id !== doc.id,
                                                    ),
                                                };
                                                const errors = schemaChanges(
                                                  content,
                                                  next,
                                                );
                                                if (errors.length) {
                                                  setError(
                                                    errors
                                                      .map((e) => e.message)
                                                      .join('\n'),
                                                  );
                                                  return;
                                                }
                                                setContent(next);
                                                setSelected('');
                                              },
                                            })
                                          }
                                        >
                                          Delete{' '}
                                          {'kind' in doc ? 'page' : 'entry'}
                                        </Button>
                                      </div>
                                    )}
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
                                  <h2>
                                    {collection.name || 'Untitled collection'}
                                  </h2>
                                  <Button
                                    variant="primary"
                                    icon={<PlusIcon />}
                                    disabled={collection.mode === 'single'}
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
                                    .filter(
                                      (e) => e.collectionId === collection.id,
                                    )
                                    .map((entry) => (
                                      <li key={entry.id}>
                                        <Button
                                          className={styles.recordButton}
                                          onClick={() => openDocument(entry.id)}
                                        >
                                          <span className={styles.recordLabel}>
                                            {entryTitle(entry)}
                                            <span className={styles.muted}>
                                              {entryPath(collection, entry) ??
                                                'Data only'}
                                            </span>
                                          </span>
                                          <CaretRightIcon aria-hidden="true" />
                                        </Button>
                                      </li>
                                    ))}
                                </ul>
                                {!content.entries.some(
                                  (e) => e.collectionId === collection.id,
                                ) && (
                                  <p className={styles.muted}>
                                    No entries yet.
                                  </p>
                                )}
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
                                          setSelected(
                                            c.mode === 'single'
                                              ? (content.entries.find(
                                                  (e) =>
                                                    e.collectionId === c.id,
                                                )?.id ?? '')
                                              : '',
                                          );
                                        }}
                                      >
                                        <span>
                                          {c.name || 'Untitled collection'}
                                        </span>
                                        <CaretRightIcon aria-hidden="true" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                                {!content.collections.length && (
                                  <p className={styles.muted}>
                                    Create a collection in Schemas to start
                                    adding content.
                                  </p>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {(tab === 'collections' || tab === 'objects') && (
                          <Schemas
                            key={`${tab}:${schemaId}`}
                            area={tab}
                            selectedId={schemaId}
                            onSelect={setSchemaId}
                            content={content}
                            onChange={setContent}
                            onOpenUsage={openUsage}
                          />
                        )}
                        {tab === 'media' && (
                          <PanelSection title="Media">
                            <div className={styles.formStack}>
                              <MediaUpload label="Upload file" />
                              <p className={styles.muted}>
                                {r2
                                  ? 'Uploaded files may be public before publishing.'
                                  : 'Uploads are unavailable for this site. Existing media can still be used.'}
                              </p>
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
                        {tab === 'settings' && (
                          <>
                            <PanelSection title="Appearance">
                              <Switch
                                label="Dark mode"
                                checked={mode === 'dark'}
                                onCheckedChange={(checked) =>
                                  setMode(checked ? 'dark' : 'light')
                                }
                              />
                              <p className={styles.muted}>
                                Changes the admin interface only. Your website
                                keeps its own appearance.
                              </p>
                            </PanelSection>
                            <PanelSection title="Backups">
                              <p className={styles.muted}>
                                Export or restore site content. Credentials are
                                excluded.
                              </p>
                              <div className={styles.row}>
                                <Button onClick={backup}>Export backup</Button>
                                <Button
                                  onClick={() => importRef.current?.click()}
                                >
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
                              {recoveryProblem() && (
                                <>
                                  <p role="alert">{recoveryProblem()}</p>
                                  <Button
                                    onClick={() =>
                                      download(
                                        recoveryText(),
                                        'retained-recovery.json',
                                      )
                                    }
                                  >
                                    Download retained recovery
                                  </Button>
                                </>
                              )}
                              <div className={styles.row}>
                                <Button
                                  variant="secondary-destructive"
                                  onClick={() =>
                                    setConfirm({
                                      title: 'Discard unsaved edits?',
                                      body: 'Return to the last loaded or saved content.',
                                      action: () => {
                                        discardRecovery();
                                        setContent(
                                          migrateSite(
                                            structuredClone(
                                              base?.content ?? initial,
                                            ),
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
                                {config.encryptedAdmin && (
                                  <Button onClick={onLock}>Lock editor</Button>
                                )}
                              </div>
                            </PanelSection>
                            <PanelSection title="Factory reset">
                              <p className={styles.muted}>
                                Clear all pages, content, collection and object
                                schemas, and media records. Restore{' '}
                                {resetLayoutLabel} layout and its default
                                settings.
                              </p>
                              <div className={styles.row}>
                                <Button
                                  variant="secondary-destructive"
                                  onClick={() =>
                                    setConfirm({
                                      title: 'Factory reset this site?',
                                      body: `This clears all pages, content, collection and object schemas, and media records from your local draft, and restores the ${resetLayoutLabel} layout defaults. Uploaded files remain in R2. Export a backup first if you want to keep your work. Save draft to store the reset; create a home page before publishing.`,
                                      actionLabel: 'Reset site',
                                      destructive: true,
                                      action: () => {
                                        void run(async () => {
                                          setContent(factoryReset(content));
                                          setSelected('');
                                          setCollectionId('');
                                          setLayoutId('');
                                          openArea('settings');
                                          setMessage(
                                            'Site reset. Save the draft to keep these changes.',
                                          );
                                        });
                                      },
                                    })
                                  }
                                >
                                  Factory reset
                                </Button>
                              </div>
                            </PanelSection>
                          </>
                        )}
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
                  content={renderContent}
                  onNavigate={(url, documentId) => {
                    if (busy) return;
                    if (documentId) openDocument(documentId);
                    else {
                      const id = Object.entries(
                        contextFor(renderContent, 'navigation').links,
                      ).find(([, path]) => path === url)?.[0];
                      if (id) openDocument(id);
                    }
                  }}
                >
                  <PageBlocks
                    content={renderContent}
                    page={previewPage}
                    selectedId={pendingBlock?.id ?? blockId}
                    revealId={pendingBlock?.id ?? blockId}
                    className={styles.previewBlock}
                  />
                  {!previewPage?.blocks.length && (
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
            {modal === 'blocks' && !confirm ? (
              <CatalogHeader
                title="Add block"
                closeLabel="Close block library"
              />
            ) : (
              <Dialog.Title>
                {confirm?.title ??
                  {
                    navigation: 'Navigation',
                    page: 'Add page',
                    blocks: 'Add block',
                    recovered: 'Recovered edits need attention',
                    stale: 'A newer version is available',
                  }[modal] ??
                  ''}
              </Dialog.Title>
            )}
            {confirm ? (
              <>
                <Dialog.Description>{confirm.body}</Dialog.Description>
                <div className={styles.dialogActions}>
                  <Button onClick={() => setConfirm(null)}>Cancel</Button>
                  <Button
                    variant={confirm.destructive ? 'destructive' : 'primary'}
                    onClick={() => {
                      const action = confirm.action;
                      setConfirm(null);
                      action();
                    }}
                  >
                    {confirm.actionLabel ?? 'Continue'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {(modal === 'stale' || modal === 'recovered') && (
                  <>
                    <Dialog.Description>
                      {modal === 'recovered'
                        ? 'Your browser edits are not based on the configured repository draft. They have been preserved. Export a backup before loading the latest version, then reapply the changes you want to keep.'
                        : 'Your changes weren’t saved. They’re still here—keep a backup before loading the latest version. Then reapply the changes you want to keep.'}{' '}
                      Importing a backup replaces content; it does not merge
                      your changes.
                    </Dialog.Description>
                    <div className={styles.dialogActions}>
                      <Dialog.Close render={<Button disabled={busy} />}>
                        Close
                      </Dialog.Close>
                      <Button disabled={busy} onClick={backup}>
                        Export backup
                      </Button>
                      {store ? (
                        <Button
                          variant="primary"
                          disabled={busy}
                          onClick={reloadDraft}
                        >
                          Load latest version
                        </Button>
                      ) : (
                        <Button
                          disabled={busy}
                          onClick={() => void reconnect()}
                        >
                          Retry connection
                        </Button>
                      )}
                    </div>
                  </>
                )}
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
                    <Button onClick={() => addPage('static')}>
                      Static page
                    </Button>
                    <p className={styles.muted}>
                      A public page with its own content and URL.
                    </p>
                    <Button onClick={() => addPage('generic')}>
                      Generic page
                    </Button>
                    <p className={styles.muted}>
                      A reusable layout populated by collection entries.
                    </p>
                    <div className={styles.dialogActions}>
                      <Dialog.Close render={<Button />}>Cancel</Dialog.Close>
                    </div>
                  </div>
                )}
                {modal === 'blocks' && (
                  <>
                    <BlockCatalog
                      definitions={definitions}
                      content={renderContent}
                      kind={page?.kind ?? 'static'}
                      onAdd={(d) => {
                        if (page) setPendingBlock(newBlock(d));
                        setModal('');
                      }}
                    />
                  </>
                )}
              </>
            )}
          </Dialog>
        </Dialog.Root>
      </div>
    </ModelContext.Provider>,
  );
}
