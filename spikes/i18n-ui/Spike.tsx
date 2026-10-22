import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge } from '@cloudflare/kumo/components/badge';
import { Button } from '@cloudflare/kumo/components/button';
import { Checkbox } from '@cloudflare/kumo/components/checkbox';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Radio } from '@cloudflare/kumo/components/radio';
import { Select } from '@cloudflare/kumo/components/select';
import { Switch } from '@cloudflare/kumo/components/switch';
import { Table } from '@cloudflare/kumo/components/table';
import { Toasty, useKumoToastManager } from '@cloudflare/kumo/components/toast';
import { KumoPortalProvider } from '@cloudflare/kumo/utils';
import { CaretRightIcon, DesktopIcon, DeviceMobileIcon, PlusIcon } from '@phosphor-icons/react';
import FormScreen from '../../src/editor/FormScreen';
import Navigation, { type EditorArea } from '../../src/editor/Navigation';
import { PanelNavigation } from '../../src/editor/PanelNavigation';
import PanelSection from '../../src/editor/PanelSection';
import styles from '../../src/editor/editor.module.css';
import spike from './spike.module.css';
import { fixtures, scenarios, type Scenario } from './fixtures';
import { ItemEditor, StatusBadge, type Presentation } from './ItemEditor';
import Preview, { type PreviewMode } from './Preview';
import {
  docTitle,
  languageName,
  publicPath,
  publishReport,
  secondary,
  status,
  translationsExist,
  type Content,
  type Copy,
  type Doc,
  type FieldDef,
  type Localize,
} from './model';

type Scope = 'item' | 'portal';
const letter: Record<Presentation, string> = { switcher: 'A', compare: 'B', stacked: 'C' };
const params = new URLSearchParams(location.search);

export default function Spike() {
  const portal = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'dark' | 'light'>(params.get('theme') === 'light' ? 'light' : 'dark');
  return (
    <div className={styles.workspace}>
      <div className={`kumo-ui ${styles.adminCanvas}`} data-mode={mode} aria-hidden="true" />
      <div ref={portal} className={`kumo-ui ${styles.portal}`} data-mode={mode} />
      <KumoPortalProvider container={portal}>
        <Toasty>
          <Shell mode={mode} setMode={setMode} />
        </Toasty>
      </KumoPortalProvider>
    </div>
  );
}

function Shell({ mode, setMode }: { mode: 'dark' | 'light'; setMode(mode: 'dark' | 'light'): void }) {
  const toasts = useKumoToastManager();
  const [content, setContent] = useState(fixtures);
  const [saved, setSaved] = useState(content);
  const [area, setArea] = useState<EditorArea>('content');
  const [collectionId, setCollectionId] = useState('');
  const [docId, setDocId] = useState('');
  const [fieldPath, setFieldPath] = useState('');
  const [lang, setLangState] = useState('en');
  const [presentation, setPresentation] = useState<Presentation>(params.get('p') === 'b' ? 'compare' : params.get('p') === 'c' ? 'stacked' : 'switcher');
  const [scope, setScope] = useState<Scope>(params.get('scope') === 'item' ? 'item' : 'portal');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('draft');
  const [size, setSize] = useState<'desktop' | 'mobile'>('desktop');
  const [pending, setPending] = useState<Copy | null>(null);
  const [modal, setModal] = useState<'' | 'prototype' | 'navigation' | 'publish'>('');
  const [confirm, setConfirm] = useState<{ title: string; body: ReactNode; label: string; action(): void } | null>(null);
  const [addingLanguage, setAddingLanguage] = useState<{ name: string; code: string } | null>(null);

  const settings = content.settings;
  const main = settings.main;
  const effectiveLang =
    settings.enabled && settings.languages.some((l) => l.code === lang) ? lang : main;
  const doc = content.docs.find((d) => d.id === docId);
  const collection = content.collections.find((c) => c.id === (doc?.collectionId ?? collectionId));
  const hasPreview =
    !!doc && (doc.kind !== 'entry' || !!collection?.templateId) && (area !== 'layout' || doc.kind === 'layout');

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('p', letter[presentation].toLowerCase());
    url.searchParams.set('scope', scope);
    url.searchParams.delete('s');
    url.searchParams.delete('quiet');
    history.replaceState(null, '', url);
  }, [presentation, scope]);
  useEffect(() => {
    const id = params.get('s');
    const scenario = scenarios.find((s) => s.id === id);
    if (scenario) openScenario(scenario, params.has('quiet'));
    // Only the initial URL selects a scenario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLang(next: string) {
    setPending(null);
    setLangState(next);
  }
  function openArea(next: EditorArea) {
    setArea(next);
    setCollectionId('');
    setDocId('');
    setFieldPath('');
    setPending(null);
    setAddingLanguage(null);
    if (scope === 'item') setLangState(main);
    setModal('');
    window.scrollTo(0, 0);
  }
  function openDoc(id: string) {
    setDocId(id);
    setPending(null);
    if (scope === 'item') setLangState(main);
  }
  function changeDoc(next: Doc) {
    setContent((c) => ({ ...c, docs: c.docs.map((d) => (d.id === next.id ? next : d)) }));
  }
  function openScenario(s: Scenario, quiet = false) {
    const fresh = fixtures();
    setContent(fresh);
    setSaved(fresh);
    openArea(s.open.area);
    const target = fresh.docs.find((d) => d.id === s.open.doc);
    if (target) {
      setCollectionId(target.collectionId ?? '');
      setDocId(target.id);
    }
    if (s.open.field) {
      setCollectionId('products');
      setFieldPath(s.open.field);
    }
    setLangState(s.lang ?? 'en');
    setPreviewMode('draft');
    setModal('');
    if (!quiet) toasts.add({ title: s.title, description: s.try, variant: 'info', timeout: 12000 });
  }
  function publish() {
    if (content !== saved) {
      toasts.add({
        title: 'Unable to complete',
        description: 'Save your changes before publishing. (Simulated, matching the current editor.)',
        variant: 'error',
        timeout: 0,
      });
      return;
    }
    setModal('publish');
  }

  const languageSelect = settings.enabled && scope === 'portal' && (
    <div className={spike.topbarLanguage}>
      <Select
        aria-label="Editing language"
        value={effectiveLang}
        disabled={!!pending}
        renderValue={(code) => (
          <>
            <span className={spike.wideOnly}>{languageName(content, String(code))}</span>
            <span className={spike.narrowOnly}>{String(code).toUpperCase()}</span>
          </>
        )}
        onValueChange={(code) => setLang(String(code))}
      >
        {settings.languages.map((l) => (
          <Select.Option key={l.code} value={l.code}>
            {l.name}
            {l.code === main ? ' · main' : ''}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const editor = doc && (
    <ItemEditor
      key={doc.id}
      content={content}
      doc={doc}
      lang={effectiveLang}
      presentation={presentation}
      showTabs={scope === 'item'}
      pending={pending}
      setLang={setLang}
      setPending={setPending}
      onDoc={changeDoc}
      onBack={() => {
        setDocId('');
        setPending(null);
      }}
      onRemoveCopy={() =>
        setConfirm({
          title: `Remove the ${languageName(content, effectiveLang)} copy?`,
          body: `Its ${languageName(content, effectiveLang)} values are removed from the draft.`,
          label: 'Remove copy',
          action: () => {
            const { [effectiveLang]: _removed, ...copies } = doc.copies;
            changeDoc({ ...doc, copies });
          },
        })
      }
    />
  );

  let body: ReactNode;
  if (area === 'pages' && !doc) body = <PagesTable content={content} onOpen={openDoc} />;
  else if (area === 'layout' && !doc) body = <LayoutsTable content={content} onOpen={openDoc} />;
  else if (area === 'content' && !doc)
    body = (
      <ContentLists
        content={content}
        collectionId={collectionId}
        setCollectionId={setCollectionId}
        onOpen={openDoc}
      />
    );
  else if (area === 'collections')
    body = (
      <SchemaArea
        content={content}
        setContent={setContent}
        collectionId={collectionId}
        setCollectionId={setCollectionId}
        fieldPath={fieldPath}
        setFieldPath={setFieldPath}
      />
    );
  else if (area === 'settings')
    body = addingLanguage ? (
      <FormScreen
        title="New language"
        onBack={() => setAddingLanguage(null)}
        creation={{
          label: 'Create language',
          onCreate: () => {
            const code = addingLanguage.code.trim().toLowerCase();
            if (!/^[a-z]{2,3}(-[a-z0-9]+)?$/.test(code) || settings.languages.some((l) => l.code === code)) {
              toasts.add({ title: 'Unable to complete', description: 'Use a new language code such as “ms” or “ja”.', variant: 'error' });
              return;
            }
            setContent((c) => ({
              ...c,
              settings: { ...c.settings, languages: [...c.settings.languages, { code, name: addingLanguage.name.trim() || code }] },
            }));
            setAddingLanguage(null);
          },
        }}
      >
        <div className={styles.field}>
          <Label htmlFor="language-name">Name</Label>
          <Input id="language-name" value={addingLanguage.name} onChange={(e) => setAddingLanguage({ ...addingLanguage, name: e.target.value })} />
        </div>
        <div className={styles.field}>
          <Label htmlFor="language-code">Code and URL prefix</Label>
          <Input id="language-code" value={addingLanguage.code} onChange={(e) => setAddingLanguage({ ...addingLanguage, code: e.target.value })} />
          <p className={styles.muted}>Pages in this language use /{addingLanguage.code.trim().toLowerCase() || 'code'}/ before the shared path.</p>
        </div>
      </FormScreen>
    ) : (
      <SettingsArea content={content} setContent={setContent} mode={mode} setMode={setMode} setConfirm={setConfirm} onAdd={() => setAddingLanguage({ name: '', code: '' })} />
    );
  else if (area === 'objects' || area === 'media')
    body = (
      <>
        <h2>{area === 'media' ? 'Media' : 'Objects'}</h2>
        <p className={styles.muted}>Not part of this internationalization spike.</p>
      </>
    );
  else body = editor;

  const compareWide = presentation === 'compare' && settings.enabled && effectiveLang !== main;
  const previewCopy = effectiveLang === main ? undefined : (pending ?? doc?.copies[effectiveLang]);
  return (
    <div className={styles.app}>
      <header className={`kumo-ui ${styles.topbar}`} data-mode={mode}>
        <Button className={styles.navigationToggle} aria-label="Open navigation" onClick={() => setModal('navigation')}>
          Menu
        </Button>
        <span className={styles.brand}>QuineCMS</span>
        <Button className={spike.prototypeButton} onClick={() => setModal('prototype')}>
          <span className={spike.wideOnly}>Prototype </span>
          {letter[presentation]}
        </Button>
        {languageSelect}
        {hasPreview && (
          <Button
            aria-label="Toggle preview width"
            icon={size === 'desktop' ? <DeviceMobileIcon /> : <DesktopIcon />}
            onClick={() => setSize(size === 'desktop' ? 'mobile' : 'desktop')}
          >
            <span className={spike.wideOnly}>{size === 'desktop' ? 'Mobile' : 'Desktop'}</span>
          </Button>
        )}
        <div className={styles.saveControls}>
          <span role="status" className={styles.saveStatus}>
            {content !== saved ? 'Unsaved changes' : 'Saved to draft'}
            <span className={spike.wideOnly}> · simulated</span>
          </span>
          <Button disabled={content === saved} onClick={() => setSaved(content)}>
            Save draft
          </Button>
        </div>
        <Button variant="primary" onClick={publish}>
          Publish
        </Button>
      </header>
      <aside className={`kumo-ui ${styles.navigation}`} data-mode={mode} aria-label="Main navigation">
        <Navigation active={area} disabled={false} onSelect={openArea} />
      </aside>
      <div className={compareWide ? spike.compare : undefined} style={{ display: 'contents' }}>
        {hasPreview ? (
          <aside className={`kumo-ui ${styles.drawer}`} data-mode={mode} aria-label="Site builder">
            <div className={styles.panelBody}>
              <PanelNavigation key={`${area}:${docId}:${pending ? 'new' : ''}`}>{body}</PanelNavigation>
            </div>
          </aside>
        ) : (
          <main className={`kumo-ui ${styles.home}`} data-mode={mode} aria-label="Admin workspace">
            <div className={styles.adminPanel}>
              <div className={styles.panelBody}>
                <PanelNavigation key={`${area}:${docId}:${collectionId}:${fieldPath}:${pending ? 'new' : ''}`}>{body}</PanelNavigation>
              </div>
            </div>
          </main>
        )}
        {hasPreview && doc && (
          <main className={styles.preview} data-size={size} aria-label="Live preview">
            <Preview
              content={content}
              doc={doc}
              lang={effectiveLang}
              copy={previewCopy}
              mode={previewMode}
              setMode={setPreviewMode}
              admin={mode}
            />
          </main>
        )}
      </div>
      <Dialog.Root
        open={!!modal || !!confirm}
        onOpenChange={(open) => {
          if (!open) {
            setModal('');
            setConfirm(null);
          }
        }}
      >
        <Dialog size="lg" className={styles.popup}>
          <Dialog.Title>
            {confirm?.title ??
              { prototype: 'Prototype controls', navigation: 'Navigation', publish: 'Publish (simulated)', '': '' }[modal]}
          </Dialog.Title>
          {confirm ? (
            <>
              <Dialog.Description>{confirm.body}</Dialog.Description>
              <div className={styles.dialogActions}>
                <Button onClick={() => setConfirm(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    confirm.action();
                    setConfirm(null);
                  }}
                >
                  {confirm.label}
                </Button>
              </div>
            </>
          ) : modal === 'navigation' ? (
            <>
              <Navigation active={area} disabled={false} onSelect={openArea} />
              <div className={styles.dialogActions}>
                <Button className={spike.narrowOnly} onClick={() => setModal('prototype')}>
                  Prototype controls
                </Button>
                <Dialog.Close render={<Button />}>Close</Dialog.Close>
              </div>
            </>
          ) : modal === 'publish' ? (
            <PublishReport
              content={content}
              onOpen={(d, code) => {
                setModal('');
                openArea(d.kind === 'entry' ? 'content' : d.kind === 'page' ? 'pages' : 'layout');
                setCollectionId(d.collectionId ?? '');
                setDocId(d.id);
                setLangState(code);
              }}
              onPublish={() => {
                setModal('');
                toasts.add({ title: 'Published (simulated)', description: 'Nothing was written or deployed.', variant: 'success' });
              }}
            />
          ) : modal === 'prototype' ? (
            <PrototypeControls
              presentation={presentation}
              setPresentation={setPresentation}
              scope={scope}
              setScope={setScope}
              onScenario={openScenario}
              onReset={() => openScenario({ ...scenarios[0], title: 'Content reset', try: 'Fixtures restored.' })}
            />
          ) : null}
        </Dialog>
      </Dialog.Root>
    </div>
  );
}

function LanguageCells({ content, doc }: { content: Content; doc: Doc }) {
  return (
    <>
      {secondary(content).map((l) => (
        <Table.Cell key={l.code}>
          <StatusBadge kind={status(content, doc, l.code).kind} />
        </Table.Cell>
      ))}
    </>
  );
}

function PagesTable({ content, onOpen }: { content: Content; onOpen(id: string): void }) {
  return (
    <>
      <div className={styles.pageOverview}>
        <div className={styles.sectionHeader}>
          <h1>Pages</h1>
          <Button variant="primary" icon={<PlusIcon />} disabled>
            Add page
          </Button>
        </div>
        <div className={styles.pageTable}>
          <Table aria-label="Pages">
            <Table.Header>
              <Table.Row>
                <Table.Head>Page title</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>URL path</Table.Head>
                {secondary(content).map((l) => (
                  <Table.Head key={l.code}>{l.name}</Table.Head>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {content.docs
                .filter((d) => d.kind === 'page')
                .map((d) => (
                  <Table.Row key={d.id} className={styles.pageRow} onClick={() => onOpen(d.id)}>
                    <Table.Cell>
                      <Button variant="ghost" className={styles.pageTitle} onClick={(e) => { e.stopPropagation(); onOpen(d.id); }}>
                        {docTitle(d)}
                      </Button>
                    </Table.Cell>
                    <Table.Cell>{d.path.startsWith('/') ? 'Static' : 'Generic'}</Table.Cell>
                    <Table.Cell>{d.path.startsWith('/') ? d.path : '—'}</Table.Cell>
                    <LanguageCells content={content} doc={d} />
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </>
  );
}

function LayoutsTable({ content, onOpen }: { content: Content; onOpen(id: string): void }) {
  return (
    <>
      <h2>Site Layouts</h2>
      <div className={styles.pageTable}>
        <Table aria-label="Site Layouts">
          <Table.Header>
            <Table.Row>
              <Table.Head>Layout name</Table.Head>
              <Table.Head>Design</Table.Head>
              {secondary(content).map((l) => (
                <Table.Head key={l.code}>{l.name}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {content.docs
              .filter((d) => d.kind === 'layout')
              .map((d) => (
                <Table.Row key={d.id} className={styles.pageRow} onClick={() => onOpen(d.id)}>
                  <Table.Cell>
                    <Button variant="ghost" className={styles.pageTitle} onClick={(e) => { e.stopPropagation(); onOpen(d.id); }}>
                      {docTitle(d)}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>Spike design</Table.Cell>
                  <LanguageCells content={content} doc={d} />
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>
    </>
  );
}

function ContentLists({ content, collectionId, setCollectionId, onOpen }: {
  content: Content;
  collectionId: string;
  setCollectionId(id: string): void;
  onOpen(id: string): void;
}) {
  const collection = content.collections.find((c) => c.id === collectionId);
  if (!collection)
    return (
      <>
        <h2>Content</h2>
        <ul className={styles.recordList} aria-label="Content collections">
          {content.collections.map((c) => (
            <li key={c.id}>
              <Button className={styles.recordButton} onClick={() => setCollectionId(c.id)}>
                <span>{c.name}</span>
                <CaretRightIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </>
    );
  return (
    <>
      <Button className={styles.back} variant="ghost" onClick={() => setCollectionId('')}>
        ← Back
      </Button>
      <div className={styles.sectionHeader}>
        <h2>{collection.name}</h2>
        <Button variant="primary" icon={<PlusIcon />} disabled>
          Add entry
        </Button>
      </div>
      <ul className={styles.recordList} aria-label="Entries">
        {content.docs
          .filter((d) => d.collectionId === collection.id)
          .map((d) => (
            <li key={d.id}>
              <Button className={styles.recordButton} onClick={() => onOpen(d.id)}>
                <span className={styles.recordLabel}>
                  {docTitle(d)}
                  <span className={styles.muted}>{publicPath(content, d, content.settings.main) ?? 'Data only'}</span>
                </span>
                <span className={spike.rowStatus}>
                  {secondary(content).map((l) => (
                    <span key={l.code} className={spike.rowStatusItem}>
                      <span className={styles.muted}>{l.code.toUpperCase()}</span>
                      <StatusBadge kind={status(content, d, l.code).kind} />
                    </span>
                  ))}
                  <CaretRightIcon aria-hidden="true" />
                </span>
              </Button>
            </li>
          ))}
      </ul>
    </>
  );
}

// Schema field paths: "size" or "ingredients.name" for list item fields.
function flatFields(fields: FieldDef[]) {
  return fields.flatMap((f) =>
    f.type === 'list'
      ? f.rows!.map((r) => ({ path: `${f.key}.${r.key}`, field: r, parent: f }))
      : [{ path: f.key, field: f, parent: undefined as FieldDef | undefined }],
  );
}
const localizeLabel: Record<Localize, string> = {
  shared: 'Shared',
  language: 'Per language',
};

function SchemaArea({ content, setContent, collectionId, setCollectionId, fieldPath, setFieldPath }: {
  content: Content;
  setContent(update: (c: Content) => Content): void;
  collectionId: string;
  setCollectionId(id: string): void;
  fieldPath: string;
  setFieldPath(path: string): void;
}) {
  const collection = content.collections.find((c) => c.id === collectionId);
  if (!collection)
    return (
      <>
        <h2>Collections</h2>
        <ul className={styles.recordList} aria-label="Collections">
          {content.collections.map((c) => (
            <li key={c.id}>
              <Button className={styles.recordButton} onClick={() => setCollectionId(c.id)}>
                <span>{c.name}</span>
                <CaretRightIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        <p className={styles.muted}>Block and Site Layout fields set their localization in their code definitions; only collection schemas are edited here.</p>
      </>
    );
  const rows = flatFields(collection.fields);
  const selected = rows.find((r) => r.path === fieldPath);
  if (!selected)
    return (
      <>
        <Button className={styles.back} variant="ghost" onClick={() => setCollectionId('')}>
          ← Back
        </Button>
        <h2>{collection.name}</h2>
        <ul className={styles.recordList} aria-label="Fields">
          {rows.map((r) => (
            <li key={r.path}>
              <Button className={styles.recordButton} onClick={() => setFieldPath(r.path)}>
                <span className={styles.recordLabel}>
                  {r.parent ? `${r.parent.label} › ${r.field.label}` : r.field.label}
                  <span className={styles.muted}>
                    {r.path} · {r.field.type}
                    {r.field.required ? ' · required' : ''}
                  </span>
                </span>
                <span className={spike.rowStatus}>
                  {content.settings.enabled && (
                    <Badge variant={r.field.localize === 'shared' ? 'secondary' : 'info'}>
                      {r.field.type === 'media' && r.field.localize === 'shared' ? 'Shared image' : localizeLabel[r.field.localize]}
                    </Badge>
                  )}
                  <CaretRightIcon aria-hidden="true" />
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </>
    );
  const f = selected.field;
  const update = (patch: Partial<FieldDef>) =>
    setContent((c) => ({
      ...c,
      collections: c.collections.map((x) =>
        x.id !== collection.id
          ? x
          : {
              ...x,
              fields: x.fields.map((field) =>
                field.key === selected.path.split('.')[0]
                  ? selected.parent
                    ? { ...field, rows: field.rows!.map((r) => (r.key === f.key ? { ...r, ...patch } : r)) }
                    : { ...field, ...patch }
                  : field,
              ),
            },
      ),
    }));
  // Copies this field's setting leaves incomplete (DEC-223); nothing is copied from the main language.
  const missingHere = (entry: string) =>
    selected.parent ? entry.startsWith(`${selected.parent.label} › `) && entry.endsWith(` › ${f.label}`) : entry === f.label;
  const affected = content.docs
    .filter((d) => d.collectionId === collection.id)
    .flatMap((d) =>
      secondary(content)
        .filter((l) => d.copies[l.code] && status(content, d, l.code).missing.some(missingHere))
        .map((l) => ({ d, l })),
    );
  return (
    <FormScreen title={selected.parent ? `${selected.parent.label} › ${f.label}` : f.label} onBack={() => setFieldPath('')}>
      <div className={styles.field}>
        <Label htmlFor="field-label">Label</Label>
        <Input id="field-label" value={f.label} onChange={(e) => update({ label: e.target.value })} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="field-key">Field key</Label>
        <Input id="field-key" value={selected.path} disabled />
      </div>
      <div className={styles.field}>
        <Label htmlFor="field-type">Field type</Label>
        <Input id="field-type" value={f.type} disabled />
      </div>
      <Checkbox label="Required" checked={!!f.required} onCheckedChange={(checked) => update({ required: checked === true })} />
      {content.settings.enabled ? (
        <>
          <Radio legend="Languages" value={f.localize} onValueChange={(v) => update({ localize: v as Localize })}>
            <Radio.Item value="shared" label="Shared by all languages" />
            <Radio.Item value="language" label="Separate value per language" />
          </Radio>
          {f.type === 'media' && <p className={styles.muted}>Alt text is always per language.</p>}
          <div className={spike.consequence} role="status">
            <strong>Copies missing this field</strong>
            <p>{affected.length ? affected.map(({ d, l }) => `${docTitle(d)} (${l.name})`).join(', ') : 'None'}</p>
          </div>
        </>
      ) : (
        <p className={styles.muted}>Turn on multiple languages in Settings to choose which fields vary by language.</p>
      )}
    </FormScreen>
  );
}

function SettingsArea({ content, setContent, mode, setMode, setConfirm, onAdd }: {
  content: Content;
  setContent(update: (c: Content) => Content): void;
  mode: 'dark' | 'light';
  setMode(mode: 'dark' | 'light'): void;
  setConfirm(confirm: { title: string; body: ReactNode; label: string; action(): void }): void;
  onAdd(): void;
}) {
  const s = content.settings;
  const mainName = languageName(content, s.main);
  const locked = translationsExist(content);
  const setSettings = (patch: Partial<typeof s>) => setContent((c) => ({ ...c, settings: { ...c.settings, ...patch } }));
  const stored = content.docs.reduce((n, d) => n + Object.keys(d.copies).length, 0);
  return (
    <>
      <PanelSection title="Languages">
        <Switch label="Publish in multiple languages" checked={s.enabled} onCheckedChange={(enabled) => setSettings({ enabled })} />
        {!s.enabled && (
          <p className={styles.muted}>
            {stored} stored language {stored === 1 ? 'copy' : 'copies'} kept <Badge variant="beta">Assumption</Badge>
          </p>
        )}
        <div className={styles.field}>
          <Label htmlFor="main-language">Main language</Label>
          <Select
            id="main-language"
            aria-label="Main language"
            value={s.main}
            disabled={locked}
            renderValue={(code) => languageName(content, String(code))}
            onValueChange={(code) => setSettings({ main: String(code) })}
          >
            {s.languages.map((l) => (
              <Select.Option key={l.code} value={l.code}>
                {l.name}
              </Select.Option>
            ))}
          </Select>
          {locked && <p className={styles.muted}>Fixed once translations exist.</p>}
        </div>
        {s.enabled && (
          <>
            <div className={styles.field}>
              <span className={spike.groupLabel}>Additional languages</span>
              {secondary(content).map((l) => {
                const counts = { eligible: 0, incomplete: 0, none: 0, main: 0 };
                for (const d of content.docs) counts[status(content, d, l.code).kind]++;
                return (
                  <div key={l.code} className={styles.usageRow}>
                    <div>
                      <strong>
                        {l.name} · /{l.code}/
                      </strong>
                      <span>
                        {counts.eligible} eligible · {counts.incomplete} incomplete · {counts.none} without a copy
                      </span>
                    </div>
                    <Button
                      variant="secondary-destructive"
                      onClick={() =>
                        setConfirm({
                          title: `Remove ${l.name}?`,
                          body: (
                            <>
                              /{l.code}/ pages stop being published after the next Publish. Stored {l.name} copies are kept{' '}
                              <Badge variant="beta">Assumption</Badge>
                            </>
                          ),
                          label: `Remove ${l.name}`,
                          action: () => setSettings({ languages: s.languages.filter((x) => x.code !== l.code) }),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
              {!secondary(content).length && <p className={styles.muted}>No additional languages.</p>}
              <Button variant="primary" icon={<PlusIcon />} className={spike.alignStart} onClick={onAdd}>
                Add language
              </Button>
            </div>
            <Radio
              legend="When a translation is unavailable"
              value={s.policy}
              onValueChange={(policy) => setSettings({ policy: policy as 'fallback' | 'strict' })}
            >
              <Radio.Item value="fallback" label={`Show the whole ${mainName} item`} />
              <Radio.Item value="strict" label="Require every language before publishing" />
            </Radio>
          </>
        )}
      </PanelSection>
      <PanelSection title="Appearance">
        <Switch label="Dark mode" checked={mode === 'dark'} onCheckedChange={(dark) => setMode(dark ? 'dark' : 'light')} />
        <p className={styles.muted}>Changes the admin interface only.</p>
      </PanelSection>
    </>
  );
}

function PublishReport({ content, onOpen, onPublish }: { content: Content; onOpen(doc: Doc, lang: string): void; onPublish(): void }) {
  const report = publishReport(content);
  const strict = content.settings.policy === 'strict';
  const mainName = languageName(content, content.settings.main);
  return (
    <>
      <Dialog.Description>
        Simulated: nothing is written to Git or deployed. {report.blocked ? 'Publishing is blocked.' : 'This would publish the saved draft.'}
      </Dialog.Description>
      {report.main.length > 0 && (
        <div className={styles.usage}>
          <h3>{mainName} values required</h3>
          {report.main.map(({ doc, missing }) => (
            <div key={doc.id} className={styles.usageRow}>
              <div>
                <strong>{docTitle(doc)}</strong>
                <span>{missing.join(', ')}</span>
              </div>
              <Button onClick={() => onOpen(doc, content.settings.main)}>Open</Button>
            </div>
          ))}
        </div>
      )}
      {report.languages.map(({ language, eligible, fallback }) => (
        <div key={language.code} className={styles.usage}>
          <h3>
            {language.name} · {eligible.length} {eligible.length === 1 ? 'copy' : 'copies'} used
          </h3>
          <p>
            {fallback.length === 0
              ? 'Every item has an eligible copy.'
              : strict
                ? `Blocked: every item needs a complete ${language.name} copy.`
                : `${fallback.length} ${fallback.length === 1 ? 'item uses' : 'items use'} the whole ${mainName} item at /${language.code}/.`}
          </p>
          {fallback.map((x) => (
            <div key={x.doc.id} className={styles.usageRow}>
              <div>
                <strong>{docTitle(x.doc)}</strong>
                <span>{x.kind === 'none' ? `No ${language.name} copy` : `Incomplete: ${x.missing.join(', ')}`}</span>
              </div>
              <Button onClick={() => onOpen(x.doc, language.code)}>Open</Button>
            </div>
          ))}
        </div>
      ))}
      <div className={styles.dialogActions}>
        <Dialog.Close render={<Button />}>Cancel</Dialog.Close>
        <Button variant="primary" disabled={report.blocked} onClick={onPublish}>
          Publish (simulated)
        </Button>
      </div>
    </>
  );
}

function PrototypeControls({ presentation, setPresentation, scope, setScope, onScenario, onReset }: {
  presentation: Presentation;
  setPresentation(p: Presentation): void;
  scope: Scope;
  setScope(s: Scope): void;
  onScenario(s: Scenario): void;
  onReset(): void;
}) {
  return (
    <>
      <Dialog.Description>
        Spike-only controls. Content is in memory; Save draft and Publish are simulated.
      </Dialog.Description>
      <Radio legend="Presentation" value={presentation} onValueChange={(v) => setPresentation(v as Presentation)}>
        <Radio.Item value="switcher" label="A · One language at a time (selected)" />
        <Radio.Item value="compare" label="B · Main language beside the translation (wider drawer from 1280px)" />
        <Radio.Item value="stacked" label="C · Main language above each translated field (standard drawer)" />
      </Radio>
      <Radio legend="Language selection" value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <Radio.Item value="item" label="Per item: tabs in each editor, reset to the main language when opening another item" />
        <Radio.Item value="portal" label="Portal-wide: one selector in the top bar, kept across navigation (selected)" />
      </Radio>
      <div className={styles.usage}>
        <h3>Scenarios (each starts from fresh fixtures)</h3>
        {scenarios.map((s) => (
          <div key={s.id} className={styles.usageRow}>
            <div>
              <strong>{s.title}</strong>
              <span>{s.try}</span>
            </div>
            <Button onClick={() => onScenario(s)}>Open</Button>
          </div>
        ))}
      </div>
      <div className={styles.dialogActions}>
        <Button onClick={onReset}>Reset content</Button>
        <Dialog.Close render={<Button variant="primary" />}>Done</Dialog.Close>
      </div>
    </>
  );
}
