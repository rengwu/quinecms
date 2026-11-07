import { legacyBackupFormat } from './legacy-brand';
import Logo from './Logo';
import {
  PreviewProvider,
  PreviewToggle,
  Workbench,
  Preview,
} from './PreviewWorkspace';
import { DotsThreeIcon, SidebarSimpleIcon } from '@phosphor-icons/react';
import { ModelContext } from './ModelContext';
import { fieldDefaults } from '../core/lists';
import BlockCatalog from './BlockCatalog';
import DocumentCreation from './DocumentCreation';
import EntryFields from './EntryFields';
import BlockCreation from './BlockCreation';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import SiteLayouts from './SiteLayouts';
import LayoutChoice from './LayoutChoice';
import MediaUpload, { MediaUploadContext } from './MediaUpload';
import {
  migrateSite,
  layoutDefinitions,
  siteLayouts,
  contentForPage,
} from '../core/layouts';
import { PanelLevel, PanelNavigation } from './PanelNavigation';
import { EditorBusyContext } from './Stack';
import { BackDepth, useBrowserBack } from './browser-back';
import {
  createElement,
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import Schemas from './Schemas';
import PageHeader from './PageHeader';
import { incomingUsage } from '../core/schema';
import UsageList from './UsageList';
import type { UsageTarget } from './usage';
import { entryPath } from '../core/routes';
import PanelSection from './PanelSection';
import PageList from './PageList';
import Navigation, {
  readSidebarWidth,
  SidebarResizeHandle,
  type EditorArea,
} from './Navigation';
import BlockList from './BlockList';
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
import BlockFields from './BlockFields';
import FormScreen from './FormScreen';
import LanguageSettings from './LanguageSettings';
import {
  CopyBadge,
  LanguageContext,
  LanguageSelect,
  replaceRecord,
  SharedBadge,
  useCopy,
} from './Languages';
import {
  copyIssues,
  copyState,
  extraLanguages,
  languageName,
  localize,
  mainLanguage,
  pruneCopies,
} from '../core/languages';
import styles from './editor.module.css';
import {
  AdminThemeContext,
  adminThemeKey,
  readAdminMode,
  useAdminTheme,
  type AdminMode,
} from './AdminTheme';
import {
  Button,
  Dialog,
  Input,
  Label,
  Link,
  PortalProvider,
  Select,
  Switch,
  Tabs,
  Toasts,
  useToast,
} from './ui';
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
  const workspace = useRef<HTMLDivElement>(null);
  useBrowserBack(workspace);
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
      <div ref={workspace} className={styles.workspace}>
        <div
          className={`admin-ui ${styles.adminCanvas}`}
          data-mode={mode}
          aria-hidden="true"
        />
        {/* Attach the container before Toasts's initial layout effect resolves it. */}
        <div
          ref={portal}
          className={`admin-ui ${styles.portal}`}
          data-mode={mode}
        />
        <PortalProvider container={portal}>
          <PreviewProvider>
            <Toasts>
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
            </Toasts>
          </PreviewProvider>
        </PortalProvider>
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
  const toasts = useToast();
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
      /** The confirmation publishes, so it keeps the Publish colour. */
      accent?: boolean;
      action: () => void;
    } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    // Main sections share one document, but must not inherit its scroll position.
    document.scrollingElement?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [tab]);
  const [mediaId, setMediaId] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth);
  const [navigationOpen, setNavigationOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 800,
  );
  const narrow = () =>
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(max-width: 799px)').matches;
  useEffect(() => {
    // Below 800px the sidebar overlays the editor, so it starts closed.
    const query = window.matchMedia?.('(max-width: 799px)');
    if (!query?.addEventListener) return;
    const close = () => query.matches && setNavigationOpen(false);
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, []);
  const [entryQuery, setEntryQuery] = useState('');
  const [layoutId, setLayoutId] = useState('');
  const [pendingDocument, setPendingDocument] = useState<Page | Entry | null>(
    null,
  );
  const [pendingBlock, setPendingBlock] = useState<Block | null>(null);
  const [language, setLanguage] = useState('');
  const [previewMode, setPreviewMode] = useState<'draft' | 'visitor'>('draft');
  const main = mainLanguage(content.site);
  const editing = extraLanguages(content.site).includes(language)
    ? language
    : main;
  const secondary = editing !== main;
  const enabled = content.site.i18n?.enabled === true;
  const page = content.pages.find((p) => p.id === selected);
  const doc = page ?? content.entries.find((e) => e.id === selected);
  const copy = useCopy(content, editing, doc, changeDoc);
  const form = copy.view;
  const changeForm = copy.change;
  const formBlock =
    form && 'kind' in form
      ? form.blocks.find((b) => b.id === blockId)
      : undefined;
  const copyStates = useMemo(
    () => (secondary ? copyIssues(content, editing, definitions) : undefined),
    [content, editing, secondary],
  );
  const listStatus = (record: Page | Entry) => {
    const state =
      copyStates &&
      copyState(content, record, editing, copyStates, definitions);
    return state && <CopyBadge state={state} />;
  };
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
  const backDepth =
    tab === 'pages'
      ? editingBlock || pendingBlock
        ? 2
        : editingDocument || pendingDocument
          ? 1
          : 0
      : tab === 'content'
        ? collection
          ? 1 +
            Number(
              collection.mode !== 'single' &&
                !!(editingDocument || pendingDocument),
            )
          : 0
        : tab === 'layout'
          ? Number(!!layoutId)
          : Number(!!schemaId);
  const listingPages = tab === 'pages' && !editingDocument;
  const previewEntry =
    tab === 'content'
      ? pendingDocument && 'values' in pendingDocument
        ? pendingDocument
        : editingDocument && doc && 'values' in doc
          ? doc
          : undefined
      : undefined;
  const templateId = previewEntry && collection?.genericPageId;
  const showPreview = Boolean(
    (tab === 'pages' && editingDocument) || templateId,
  );
  // Creation stays outside content/recovery until Create, but renders through
  // the same page and context as a committed block.
  const previewContent = useMemo(
    () =>
      pendingDocument && previewEntry
        ? { ...content, entries: [...content.entries, previewEntry] }
        : pendingBlock && page
          ? {
              ...content,
              pages: content.pages.map((p) =>
                p.id === page.id
                  ? { ...p, blocks: [...p.blocks, pendingBlock] }
                  : p,
              ),
            }
          : content,
    [content, page, pendingBlock, pendingDocument, previewEntry],
  );
  // Additional languages preview the draft copy, or what visitors get (DEC-220).
  const pendingCopy = copy.creation?.record;
  const localized = useMemo(() => {
    const source = pendingCopy
      ? replaceRecord(previewContent, pendingCopy)
      : previewContent;
    return secondary
      ? localize(source, editing, definitions, previewMode)
      : { content: source, fallback: new Set<string>() };
  }, [previewContent, pendingCopy, secondary, editing, previewMode]);
  const previewPage = localized.content.pages.find((p) =>
    previewEntry
      ? p.id === templateId && p.kind === 'generic'
      : p.id === page?.id,
  );
  const shownEntry =
    previewEntry &&
    (localized.content.entries.find((e) => e.id === previewEntry.id) ??
      previewEntry);
  const shownFallback = localized.fallback.has(
    (previewEntry ?? page)?.id ?? '',
  );
  let renderContent = localized.content;
  let previewError = '';
  if (showPreview) {
    if (!previewPage)
      previewError =
        'The shared template is unavailable. Choose a generic page in the collection schema.';
    else {
      try {
        renderContent = contentForPage(localized.content, previewPage);
      } catch (error) {
        previewError = error instanceof Error ? error.message : String(error);
      }
    }
  }
  const EditorSurface = 'main';
  function openArea(area: EditorArea) {
    setMediaId('');
    if (window.innerWidth < 800) setNavigationOpen(false);
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
  function changeDoc(record: Page | Entry) {
    if (busy) return;
    setContent((c) => {
      // Copy values for removed rows, blocks or fields go with them.
      const next = pruneCopies(c, record, definitions);
      return {
        ...c,
        ...('kind' in next
          ? { pages: c.pages.map((p) => (p.id === next.id ? next : p)) }
          : {
              entries: c.entries.map((e) => (e.id === next.id ? next : e)),
            }),
      };
    });
  }
  function changeBlock(next: Block) {
    if (form && 'kind' in form)
      changeForm({
        ...form,
        blocks: form.blocks.map((b) => (b.id === next.id ? next : b)),
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
        actionLabel: 'Restore backup',
        action: () => {
          setContent(migrateSite(data.content));
          setSelected('');
          setBlockId('');
          setMessage('Backup restored as unsaved edits.');
        },
      });
    });
  }
  const editor = createElement(
    MediaUploadContext.Provider,
    { value: { busy, available: r2 !== null, upload: uploadMedia } },
    <ModelContext.Provider value={content}>
      <LanguageContext.Provider value={{ main, language: editing, enabled }}>
        <div
          className={styles.app}
          data-navigation={navigationOpen}
          style={{ '--navigation-width': `${sidebarWidth}px` } as CSSProperties}
        >
          <header className={`admin-ui ${styles.topbar}`} data-mode={mode}>
            <Button
              className={styles.navigationToggle}
              aria-label="Toggle navigation"
              aria-expanded={navigationOpen}
              disabled={busy}
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <SidebarSimpleIcon />
            </Button>
            <Logo className={styles.brand} />
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Button
                disabled={busy}
                variant="ghost"
                data-editor-back={
                  editingDocument || layoutId || schemaId || collectionId
                    ? 1
                    : undefined
                }
                onClick={() => openArea(tab)}
              >
                {
                  {
                    pages: 'Pages',
                    content: 'Collections',
                    collections: 'Collection schemas',
                    objects: 'Objects',
                    media: 'Media',
                    layout: 'Layouts',
                    settings: 'Settings',
                  }[tab]
                }
              </Button>
              {tab === 'content' && collection && (
                <>
                  <span className={styles.breadcrumbSeparator} aria-hidden>
                    /
                  </span>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    data-editor-back={
                      editingDocument && collection.mode !== 'single'
                        ? 2
                        : undefined
                    }
                    onClick={() => {
                      setSelected('');
                      setBlockId('');
                    }}
                  >
                    {collection.name}
                  </Button>
                </>
              )}
              {(editingDocument || layoutId || schemaId) && (
                <>
                  <span className={styles.breadcrumbSeparator} aria-hidden>
                    /
                  </span>
                  <span aria-current="page">
                    {editingDocument && doc
                      ? 'kind' in doc
                        ? doc.title
                        : entryTitle(doc)
                      : tab === 'layout'
                        ? siteLayouts(content.site).find(
                            (l) => l.id === layoutId,
                          )?.name || 'New layout'
                        : [...content.collections, ...content.objects].find(
                            (r) => r.id === schemaId,
                          )?.name}
                  </span>
                </>
              )}
            </nav>
            {(showPreview || (tab === 'layout' && !!layoutId)) && (
              <PreviewToggle />
            )}
            <LanguageSelect
              content={content}
              value={editing}
              disabled={busy || !!pendingDocument || !!copy.creation}
              onChange={setLanguage}
            />
            <div className={styles.saveControls}>
              <span
                role="status"
                className={styles.saveStatus}
                data-state={
                  connectionState === 'failed' ||
                  saveState === 'blocked' ||
                  saveState === 'stale' ||
                  (dirty && saveState === 'failed')
                    ? 'problem'
                    : dirty
                      ? 'dirty'
                      : base
                        ? 'saved'
                        : 'local'
                }
              >
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
              variant="accent"
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
                  body: `The saved draft goes live on ${publishBranch(repo!)}. Your hosting provider then rebuilds the website.`,
                  actionLabel: 'Publish',
                  accent: true,
                  action: () => void publish(),
                });
              }}
            >
              Publish
            </Button>
          </header>
          <aside
            className={`admin-ui ${styles.navigation}`}
            data-mode={mode}
            aria-label="Main navigation"
          >
            <div className={styles.navigationScroll}>
              <Navigation
                active={tab}
                disabled={busy}
                onSelect={(area) => {
                  openArea(area);
                  if (narrow()) setNavigationOpen(false);
                }}
                collections={content.collections}
                selectedCollection={collectionId}
                onCollection={(id) => {
                  if (narrow()) setNavigationOpen(false);
                  setEntryQuery('');
                  openArea('content');
                  setCollectionId(id);
                  const c = content.collections.find((c) => c.id === id);
                  setSelected(
                    c?.mode === 'single'
                      ? (content.entries.find((e) => e.collectionId === id)
                          ?.id ?? '')
                      : '',
                  );
                }}
              />
            </div>
            <SidebarResizeHandle
              width={sidebarWidth}
              onChange={(width) => {
                setSidebarWidth(width);
                try {
                  localStorage.setItem('quinecms:sidebar-width', String(width));
                } catch {}
              }}
            />
          </aside>
          {navigationOpen && (
            <button
              type="button"
              className={styles.navigationScrim}
              aria-label="Close navigation"
              tabIndex={-1}
              onClick={() => setNavigationOpen(false)}
            />
          )}
          <EditorBusyContext.Provider value={busy}>
            <Workbench
              preview={showPreview || (tab === 'layout' && !!layoutId)}
            >
              <PanelNavigation
                key={`${tab}:${selected}:${collectionId}:${schemaId}`}
              >
                {pendingDocument && (
                  <LanguageContext.Provider
                    value={{ main, language: main, enabled }}
                  >
                    <DocumentCreation
                      document={pendingDocument}
                      content={content}
                      onChange={setPendingDocument}
                      onCreate={createDocument}
                      onCancel={() => setPendingDocument(null)}
                    />
                  </LanguageContext.Provider>
                )}
                {modal === 'blocks' && page && (
                  <FormScreen
                    stack
                    done={false}
                    title="Add block"
                    backDepth={backDepth + 1}
                    onBack={() => setModal('')}
                  >
                    <BlockCatalog
                      embedded
                      definitions={definitions}
                      content={renderContent}
                      kind={page.kind}
                      onAdd={(d) => {
                        setPendingBlock(newBlock(d));
                        setModal('');
                      }}
                    />
                  </FormScreen>
                )}
                {pendingBlock && page && (
                  <LanguageContext.Provider
                    value={{ main, language: main, enabled }}
                  >
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
                  </LanguageContext.Provider>
                )}
                {tab === 'layout' ? (
                  <SiteLayouts
                    content={content}
                    selected={layoutId}
                    onSelect={setLayoutId}
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
                    status={secondary ? listStatus : undefined}
                  />
                ) : (
                  <>
                    <EditorSurface
                      data-editor-surface
                      className={`admin-ui ${showPreview ? styles.drawer : styles.home}`}
                      data-mode={mode}
                      aria-label={
                        showPreview ? 'Site builder' : 'Admin workspace'
                      }
                    >
                      <div className={styles.adminPanel}>
                        <fieldset disabled={busy} className={styles.panelBody}>
                          {(tab === 'pages' ||
                            (tab === 'content' && editingDocument)) && (
                            <>
                              {editingDocument && !form && !copy.creation && (
                                <>
                                  <h1>
                                    {doc &&
                                      ('kind' in doc
                                        ? doc.title
                                        : entryTitle(doc))}
                                  </h1>
                                  {copy.status}
                                </>
                              )}
                              {editingDocument && copy.start && (
                                <Button
                                  variant="secondary"
                                  className={styles.alignStart}
                                  onClick={copy.start}
                                >
                                  Add {languageName(editing)} copy
                                </Button>
                              )}
                              {editingDocument && form && copy.creation && (
                                <FormScreen
                                  title={copy.creation.title}
                                  backDepth={backDepth + 1}
                                  onBack={copy.creation.cancel}
                                  creation={{
                                    label: 'Create',
                                    onCreate: copy.creation.create,
                                  }}
                                >
                                  {copy.status}
                                  {'kind' in form ? (
                                    form.kind === 'static' && (
                                      <div className={styles.field}>
                                        <Label htmlFor="copy-title">
                                          Page title
                                        </Label>
                                        <Input
                                          id="copy-title"
                                          aria-label="Page title"
                                          value={form.title}
                                          onChange={(e) =>
                                            changeForm({
                                              ...form,
                                              title: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <EntryFields
                                      entry={form}
                                      content={content}
                                      onChange={changeForm}
                                    />
                                  )}
                                </FormScreen>
                              )}
                              {editingDocument && form && !copy.creation && (
                                <>
                                  {editingBlock && 'kind' in form && (
                                    <FormScreen
                                      stack
                                      title={
                                        blockDefinition?.label ??
                                        'Unavailable block'
                                      }
                                      onBack={() => setBlockId('')}
                                      backDepth={2}
                                      actions={
                                        selectedBlock && !secondary ? (
                                          <>
                                            <Button
                                              variant="secondary-destructive"
                                              onClick={() => {
                                                changeForm({
                                                  ...form,
                                                  blocks: form.blocks.filter(
                                                    (b) =>
                                                      b.id !== selectedBlock.id,
                                                  ),
                                                });
                                                setBlockId('');
                                              }}
                                            >
                                              Remove block
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                const previous = (
                                                  base?.content ?? initial
                                                ).pages
                                                  .find((d) => d.id === form.id)
                                                  ?.blocks.find(
                                                    (b) =>
                                                      b.id === selectedBlock.id,
                                                  );
                                                if (previous)
                                                  changeBlock(
                                                    structuredClone(previous),
                                                  );
                                                else
                                                  changeForm({
                                                    ...form,
                                                    blocks: form.blocks.filter(
                                                      (b) =>
                                                        b.id !==
                                                        selectedBlock.id,
                                                    ),
                                                  });
                                                setBlockId('');
                                              }}
                                            >
                                              Discard changes
                                            </Button>
                                          </>
                                        ) : undefined
                                      }
                                    >
                                      <div className={styles.blockHeader}>
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
                                              disabled={
                                                !blockDefinition || secondary
                                              }
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
                                                    d.type ===
                                                    selectedBlock.type,
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
                                              block={formBlock ?? selectedBlock}
                                              generic={form.kind === 'generic'}
                                              onChange={changeBlock}
                                              collections={content.collections}
                                              media={content.media}
                                              readOnly={busy}
                                            />
                                          ) : (
                                            <p className={styles.muted}>
                                              The block data is preserved.
                                              Install its implementation to edit
                                              it.
                                            </p>
                                          )}
                                        </>
                                      )}
                                    </FormScreen>
                                  )}
                                  <div className={styles.recordEditor}>
                                    <PageHeader
                                      title={
                                        'kind' in form
                                          ? form.title || 'Untitled page'
                                          : entryTitle(form)
                                      }
                                      menuLabel="Document actions"
                                      menuHint={
                                        documentUses.length &&
                                        !secondary &&
                                        !(
                                          'values' in form &&
                                          collection?.mode === 'single'
                                        )
                                          ? `Remove the links listed under “Used in” before deleting this ${'kind' in form ? 'page' : 'entry'}.`
                                          : undefined
                                      }
                                      menu={[
                                        ...(copy.remove
                                          ? [
                                              {
                                                label: `Remove ${languageName(editing)} copy`,
                                                destructive: true,
                                                onSelect: () =>
                                                  setConfirm({
                                                    title: `Remove ${languageName(editing)} copy?`,
                                                    body: `Its ${languageName(editing)} values are removed from the draft.`,
                                                    actionLabel: 'Remove copy',
                                                    destructive: true,
                                                    action: () =>
                                                      copy.remove?.(),
                                                  }),
                                              },
                                            ]
                                          : []),
                                        ...(!secondary &&
                                        !(
                                          'values' in form &&
                                          collection?.mode === 'single'
                                        )
                                          ? [
                                              {
                                                label: `Delete ${'kind' in form ? 'page' : 'entry'}`,
                                                destructive: true,
                                                disabled: !!documentUses.length,
                                                onSelect: () =>
                                                  setConfirm({
                                                    title: `Delete this ${'kind' in form ? 'page' : 'entry'}?`,
                                                    body: `“${'kind' in form ? form.title || 'Untitled page' : entryTitle(form)}” is removed from the draft. Saving the draft keeps the change.`,
                                                    actionLabel: `Delete ${'kind' in form ? 'page' : 'entry'}`,
                                                    destructive: true,
                                                    action: () => {
                                                      const next = {
                                                        ...content,
                                                        pages:
                                                          content.pages.filter(
                                                            (p) =>
                                                              p.id !== form.id,
                                                          ),
                                                        entries:
                                                          content.entries.filter(
                                                            (e) =>
                                                              e.id !== form.id,
                                                          ),
                                                      };
                                                      const errors =
                                                        schemaChanges(
                                                          content,
                                                          next,
                                                        );
                                                      if (errors.length) {
                                                        setError(
                                                          errors
                                                            .map(
                                                              (e) => e.message,
                                                            )
                                                            .join('\n'),
                                                        );
                                                        return;
                                                      }
                                                      setContent(next);
                                                      setSelected('');
                                                    },
                                                  }),
                                              },
                                            ]
                                          : []),
                                      ]}
                                    />
                                    <div className={styles.recordMain}>
                                      {'kind' in form ? (
                                        <>
                                          <div className={styles.field}>
                                            <Label htmlFor="page-title">
                                              Page title
                                            </Label>
                                            <Input
                                              aria-label="Page title"
                                              id="page-title"
                                              value={form.title}
                                              onChange={(e) =>
                                                changeForm({
                                                  ...form,
                                                  title: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <EntryFields
                                          section="fields"
                                          entry={form}
                                          content={content}
                                          onChange={changeForm}
                                          readOnly={busy}
                                          onEditTemplate={
                                            previewPage
                                              ? () =>
                                                  openDocument(previewPage.id)
                                              : undefined
                                          }
                                        />
                                      )}
                                      {'kind' in form && (
                                        <>
                                          <div className={styles.sectionHeader}>
                                            <h2>Blocks</h2>
                                            {!secondary && (
                                              <Button
                                                variant="secondary"
                                                icon={<PlusIcon />}
                                                onClick={() =>
                                                  setModal('blocks')
                                                }
                                              >
                                                Add block
                                              </Button>
                                            )}
                                          </div>
                                          <BlockList
                                            blocks={form.blocks}
                                            definitions={definitions}
                                            disabled={busy}
                                            onSelect={setBlockId}
                                            onChange={
                                              secondary
                                                ? undefined
                                                : (blocks) =>
                                                    changeForm({
                                                      ...form,
                                                      blocks,
                                                    })
                                            }
                                          />
                                        </>
                                      )}
                                    </div>
                                    <aside
                                      className={styles.recordMeta}
                                      aria-label="Document settings"
                                    >
                                      {'values' in form && (
                                        <EntryFields
                                          section="meta"
                                          entry={form}
                                          content={content}
                                          onChange={changeForm}
                                          readOnly={busy}
                                          onEditTemplate={
                                            previewPage
                                              ? () =>
                                                  openDocument(previewPage.id)
                                              : undefined
                                          }
                                        />
                                      )}
                                      {copy.status}
                                      {'kind' in form && (
                                        <>
                                          <dl className={styles.properties}>
                                            <dt>Type</dt>
                                            <dd>
                                              {form.kind === 'generic'
                                                ? 'Generic page'
                                                : 'Static page'}
                                            </dd>
                                          </dl>
                                          <LayoutChoice
                                            content={content}
                                            value={form.layoutId}
                                            onChange={(layoutId) =>
                                              changeForm({
                                                ...form,
                                                layoutId,
                                              })
                                            }
                                          />
                                          {form.kind === 'static' && (
                                            <div className={styles.field}>
                                              <Label htmlFor="page-path">
                                                URL path
                                                <SharedBadge />
                                              </Label>
                                              <Input
                                                aria-label="URL path"
                                                id="page-path"
                                                value={form.path ?? ''}
                                                onChange={(e) =>
                                                  changeForm({
                                                    ...form,
                                                    path: e.target.value,
                                                  })
                                                }
                                              />
                                            </div>
                                          )}
                                        </>
                                      )}
                                      <UsageList
                                        content={content}
                                        uses={documentUses}
                                        description={
                                          'values' in form &&
                                          collection?.mode === 'single'
                                            ? 'Other content links to this entry.'
                                            : `To delete this ${'kind' in form ? 'page' : 'entry'}, first remove or change the links below.`
                                        }
                                        onOpen={openUsage}
                                        disabled={busy}
                                      />
                                    </aside>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          {tab === 'content' && !editingDocument && (
                            <>
                              {collection ? (
                                <>
                                  <PageHeader
                                    title={
                                      collection.name || 'Untitled collection'
                                    }
                                    actions={
                                      <Button
                                        variant="secondary"
                                        icon={<PlusIcon />}
                                        disabled={collection.mode === 'single'}
                                        onClick={addEntry}
                                      >
                                        Add entry
                                      </Button>
                                    }
                                  />
                                  {(() => {
                                    const all = content.entries.filter(
                                      (e) => e.collectionId === collection.id,
                                    );
                                    const query = entryQuery
                                      .trim()
                                      .toLowerCase();
                                    const shown = query
                                      ? all.filter((entry) =>
                                          [
                                            entryTitle(entry),
                                            entryPath(collection, entry) ?? '',
                                          ].some((text) =>
                                            text.toLowerCase().includes(query),
                                          ),
                                        )
                                      : all;
                                    return (
                                      <>
                                        {all.length > 0 && (
                                          <div className={styles.listTools}>
                                            <Input
                                              type="search"
                                              aria-label="Search entries"
                                              placeholder={`Search ${all.length} ${all.length === 1 ? 'entry' : 'entries'}`}
                                              value={entryQuery}
                                              onChange={(e) =>
                                                setEntryQuery(e.target.value)
                                              }
                                            />
                                          </div>
                                        )}
                                        <ul
                                          className={styles.recordList}
                                          aria-label="Entries"
                                        >
                                          {shown.map((entry) => (
                                            <li key={entry.id}>
                                              <Button
                                                className={styles.recordButton}
                                                onClick={() =>
                                                  openDocument(entry.id)
                                                }
                                              >
                                                <span
                                                  className={styles.recordLabel}
                                                >
                                                  <span>
                                                    {entryTitle(entry)}
                                                  </span>
                                                  <span
                                                    className={styles.muted}
                                                  >
                                                    {entryPath(
                                                      collection,
                                                      entry,
                                                    ) ?? 'Data only'}
                                                  </span>
                                                </span>
                                                <span
                                                  className={styles.recordEnd}
                                                >
                                                  {listStatus(entry)}
                                                  <CaretRightIcon aria-hidden="true" />
                                                </span>
                                              </Button>
                                            </li>
                                          ))}
                                        </ul>
                                        {!all.length && (
                                          <p className={styles.muted}>
                                            No entries yet.
                                          </p>
                                        )}
                                        {!!all.length && !shown.length && (
                                          <p className={styles.muted}>
                                            No entries match “{entryQuery}”.
                                          </p>
                                        )}
                                      </>
                                    );
                                  })()}
                                </>
                              ) : (
                                <>
                                  <PageHeader title="Collections" />
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
                            <LanguageContext.Provider
                              value={{ main, language: main, enabled }}
                            >
                              <Schemas
                                key={`${tab}:${schemaId}`}
                                area={tab}
                                selectedId={schemaId}
                                onSelect={setSchemaId}
                                content={content}
                                onChange={setContent}
                                onOpenUsage={openUsage}
                              />
                            </LanguageContext.Provider>
                          )}
                          {tab === 'media' && (
                            <>
                              <PageHeader
                                title="Media"
                                description={
                                  r2
                                    ? 'Uploaded files may be public before publishing.'
                                    : 'Uploads are unavailable for this site. Existing media can still be used.'
                                }
                                actions={<MediaUpload label="Upload file" />}
                              />
                              {content.media
                                .filter((m) => m.id === mediaId)
                                .map((m) => (
                                  <PanelLevel
                                    key={m.id}
                                    title={m.name}
                                    onBack={() => setMediaId('')}
                                  >
                                    {m.original.mime.startsWith('image/') && (
                                      <img
                                        className={styles.mediaDetailImage}
                                        src={m.original.url}
                                        alt={m.name}
                                      />
                                    )}
                                    <dl className={styles.properties}>
                                      <dt>Type</dt>
                                      <dd>{m.original.mime}</dd>
                                      <dt>Size</dt>
                                      <dd>
                                        {Math.round(m.original.bytes / 1024)} KB
                                      </dd>
                                      <dt>Files</dt>
                                      <dd className={styles.row}>
                                        <Link
                                          href={m.original.url}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open original
                                        </Link>
                                        {m.variants.map((v, index) => (
                                          <Link
                                            key={index}
                                            href={v.url}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            Variant {index + 1}
                                          </Link>
                                        ))}
                                      </dd>
                                    </dl>
                                  </PanelLevel>
                                ))}
                              <div className={styles.mediaGrid}>
                                {content.media.map((m) => (
                                  <Button
                                    key={m.id}
                                    className={styles.mediaCard}
                                    aria-label={m.name}
                                    onClick={() => setMediaId(m.id)}
                                  >
                                    <span className={styles.mediaThumb}>
                                      {m.original.mime.startsWith('image/') ? (
                                        <img
                                          src={
                                            m.variants[0]?.url ?? m.original.url
                                          }
                                          alt=""
                                        />
                                      ) : (
                                        (m.name.split('.').pop() ?? 'file')
                                      )}
                                    </span>
                                    <span
                                      className={styles.mediaName}
                                      title={m.name}
                                    >
                                      {m.name}
                                    </span>
                                    <span className={styles.mediaFacts}>
                                      {Math.round(m.original.bytes / 1024)} KB
                                      {m.variants.length
                                        ? ` · ${m.variants.length} ${m.variants.length === 1 ? 'size' : 'sizes'}`
                                        : ''}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                              {!content.media.length && (
                                <p className={styles.muted}>No media yet.</p>
                              )}
                            </>
                          )}
                          {tab === 'settings' && (
                            <>
                              <PageHeader title="Settings" />
                              <LanguageSettings
                                content={content}
                                onChange={setContent}
                                confirm={setConfirm}
                              />
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
                                  Export or restore site content. Credentials
                                  are excluded.
                                </p>
                                <div className={styles.row}>
                                  <Button onClick={backup}>
                                    Export backup
                                  </Button>
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
                                        actionLabel: 'Discard edits',
                                        destructive: true,
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
                                    <Button onClick={onLock}>
                                      Lock editor
                                    </Button>
                                  )}
                                </div>
                              </PanelSection>
                              <PanelSection title="Factory reset">
                                <p className={styles.muted}>
                                  Clear all pages, content, collection and
                                  object schemas, and media records. Restore{' '}
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
                        </fieldset>
                      </div>
                    </EditorSurface>
                    {showPreview && (
                      <Preview
                        toolbar={
                          secondary ? (
                            <Tabs
                              size="sm"
                              value={previewMode}
                              onValueChange={(value) =>
                                setPreviewMode(value as 'draft' | 'visitor')
                              }
                              tabs={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'visitor', label: 'Visitor' },
                              ]}
                            />
                          ) : undefined
                        }
                        onClickCapture={(event) => {
                          if (
                            pendingDocument &&
                            (event.target as Element).closest('a')
                          ) {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                      >
                        {previewError ? (
                          <p role="alert">{previewError}</p>
                        ) : (
                          <LayoutSurface
                            content={renderContent}
                            onNavigate={(url, documentId) => {
                              if (busy || pendingDocument) return;
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
                              entry={shownEntry}
                              selectedId={pendingBlock?.id ?? blockId}
                              revealId={pendingBlock?.id ?? blockId}
                              className={styles.previewBlock}
                              fallback={
                                shownFallback ? languageName(main) : undefined
                              }
                            />
                            {!previewPage?.blocks.length && (
                              <div className={styles.empty}>
                                {previewEntry
                                  ? 'The shared template has no blocks yet.'
                                  : 'Add a block to start building.'}
                              </div>
                            )}
                          </LayoutSurface>
                        )}
                      </Preview>
                    )}
                  </>
                )}
              </PanelNavigation>
            </Workbench>
          </EditorBusyContext.Provider>
          <Dialog.Root
            open={(!!modal && modal !== 'blocks') || !!confirm}
            onOpenChange={(open) => {
              if (!open && !busy) {
                setModal('');
                setConfirm(null);
              }
            }}
          >
            <Dialog size="lg" className={styles.popup}>
              {
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
              }
              {confirm ? (
                <>
                  <Dialog.Description>{confirm.body}</Dialog.Description>
                  <div className={styles.dialogActions}>
                    <Button onClick={() => setConfirm(null)}>Cancel</Button>
                    <Button
                      variant={
                        confirm.destructive
                          ? 'destructive'
                          : confirm.accent
                            ? 'accent'
                            : 'primary'
                      }
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
                </>
              )}
            </Dialog>
          </Dialog.Root>
        </div>
      </LanguageContext.Provider>
    </ModelContext.Provider>,
  );
  return createElement(BackDepth.Provider, { value: backDepth }, editor);
}
