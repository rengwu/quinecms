import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { Badge } from '@cloudflare/kumo/components/badge';
import { Button } from '@cloudflare/kumo/components/button';
import { Input, InputArea } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Select } from '@cloudflare/kumo/components/select';
import { Tabs } from '@cloudflare/kumo/components/tabs';
import { CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import BlockList from '../../src/editor/BlockList';
import FormScreen from '../../src/editor/FormScreen';
import { PanelLevel } from '../../src/editor/PanelNavigation';
import PanelSection from '../../src/editor/PanelSection';
import styles from '../../src/editor/editor.module.css';
import spike from './spike.module.css';
import {
  blank,
  blockType,
  copyBox,
  docFields,
  docTitle,
  isLocal,
  languageName,
  mainBox,
  publicPath,
  rowLabel,
  secondary,
  status,
  writeCopy,
  writeMain,
  type Content,
  type Copy,
  type Doc,
  type FieldDef,
  type Row,
  type Scope,
  type StatusKind,
} from './model';

export type Presentation = 'switcher' | 'compare' | 'stacked';
type Part = 'value' | 'image' | 'alt' | 'list';
interface Edit {
  content: Content;
  doc: Doc;
  copy?: Copy;
  lang: string;
  main: boolean;
  presentation: Presentation;
  creating: boolean;
  bar: ReactNode;
  onMain(doc: Doc): void;
  onCopy(copy: Copy): void;
}
const EditContext = createContext<Edit>(null!);

const statusText: Record<StatusKind, string> = {
  main: 'Main',
  eligible: 'Eligible',
  incomplete: 'Incomplete',
  none: 'No copy',
};
export function StatusBadge({ kind }: { kind: StatusKind }) {
  const variant = { main: 'secondary', eligible: 'success', incomplete: 'warning', none: 'outline' } as const;
  return <Badge variant={variant[kind]}>{statusText[kind]}</Badge>;
}

export function LanguageTabs({
  content,
  doc,
  lang,
  setLang,
}: {
  content: Content;
  doc: Doc;
  lang: string;
  setLang(lang: string): void;
}) {
  return (
    <Tabs
      variant="segmented"
      size="sm"
      className={spike.languageTabs}
      value={lang}
      onValueChange={setLang}
      tabs={content.settings.languages.map((l) => {
        const kind = status(content, doc, l.code).kind;
        return {
          value: l.code,
          label: (
            <span className={spike.tabLabel}>
              {l.name}
              <span className={spike.statusMark} data-kind={kind} aria-hidden="true" />
              <span className={styles.srOnly}>, {statusText[kind]}</span>
            </span>
          ),
        };
      })}
    />
  );
}

/** Secondary-language copies only; main-language editing keeps the current convention. */
export function StatusLine({ content, doc, lang }: { content: Content; doc: Doc; lang: string }) {
  const s = status(content, doc, lang);
  if (s.kind === 'main') return null;
  return (
    <div role="status" className={spike.status}>
      {s.kind === 'none' ? (
        <Badge variant="outline">No {languageName(content, lang)} copy</Badge>
      ) : (
        <StatusBadge kind={s.kind} />
      )}
      {s.kind === 'incomplete' && <span>Missing {s.missing.join(', ')}</span>}
    </div>
  );
}

// A media value is presented as two parts: the image follows the field setting,
// alternative text is per language whenever i18n is on.
const parts = (f: FieldDef): Part[] =>
  f.type === 'list' ? ['list'] : f.type === 'media' ? ['image', 'alt'] : ['value'];
function partLocal(c: Content, f: FieldDef, part: Part) {
  if (part === 'list') return f.rows!.some((r) => isLocal(c, r));
  return isLocal(c, f) && !(part === 'image' && f.localize === 'shared');
}
function get(e: Edit, s: Scope, f: FieldDef, part: Part, main = e.main): any {
  const local = !main && partLocal(e.content, f, part);
  const v = local ? copyBox(e.copy, s)?.[f.key] : mainBox(e.doc, s)[f.key];
  if (f.type !== 'media') return v;
  return v?.[part === 'image' ? 'mediaId' : 'alt'] ?? '';
}
function set(e: Edit, s: Scope, f: FieldDef, part: Part, value: unknown) {
  const local = !e.main && partLocal(e.content, f, part);
  let next = value;
  if (f.type === 'media') {
    const box = local ? copyBox(e.copy, s)?.[f.key] : mainBox(e.doc, s)[f.key];
    next = { ...box, [part === 'image' ? 'mediaId' : 'alt']: value };
  }
  if (local) e.onCopy(writeCopy(e.copy ?? { values: {}, blocks: {} }, s, f.key, next));
  else e.onMain(writeMain(e.doc, s, f.key, next));
}
function display(c: Content, f: FieldDef, part: Part, value: any) {
  if (blank(value)) return '';
  if (part === 'image') return c.media.find((m) => m.id === value)?.name ?? '';
  if (f.type === 'reference') {
    const doc = c.docs.find((d) => d.id === value);
    return doc ? docTitle(doc) : '';
  }
  return String(value);
}

function Control({ f, part, id, label, value, readOnly, onChange }: {
  f: FieldDef;
  part: Part;
  id: string;
  label: string;
  value: any;
  readOnly: boolean;
  onChange(value: unknown): void;
}) {
  const { content } = useContext(EditContext);
  const choices =
    part === 'image'
      ? content.media.map((m) => ({ value: m.id, label: m.name }))
      : f.type === 'reference'
        ? content.docs
            .filter((d) => d.collectionId === f.collectionId)
            .map((d) => ({ value: d.id, label: docTitle(d) }))
        : f.type === 'select'
          ? f.options!.map((o) => ({ value: o, label: o }))
          : null;
  if (choices)
    return (
      <Select
        id={id}
        className={styles.full}
        aria-label={label}
        value={String(value ?? '')}
        disabled={readOnly}
        placeholder="Choose…"
        renderValue={(v) => choices.find((x) => x.value === v)?.label || 'Choose…'}
        onValueChange={(v) => onChange(v || null)}
      >
        <Select.Option value="">Choose…</Select.Option>
        {choices.map((x) => (
          <Select.Option key={x.value} value={x.value}>
            {x.label}
          </Select.Option>
        ))}
      </Select>
    );
  if (f.type === 'textarea')
    return (
      <InputArea
        id={id}
        aria-label={label}
        rows={3}
        value={String(value ?? '')}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  return (
    <Input
      id={id}
      aria-label={label}
      value={String(value ?? '')}
      disabled={readOnly}
      placeholder={part === 'alt' ? 'Alternative text' : undefined}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Tag({ local }: { local: boolean }) {
  const e = useContext(EditContext);
  if (!e.content.settings.enabled) return null;
  return local ? (
    <Badge variant="info">{languageName(e.content, e.lang)}</Badge>
  ) : (
    <Badge variant="secondary">Shared</Badge>
  );
}

function FieldRow({ f, part, s, local, compare }: { f: FieldDef; part: Part; s: Scope; local: boolean; compare: boolean }) {
  const e = useContext(EditContext);
  const id = useId();
  if (part === 'list') return <ListRows f={f} s={s} local={local} />;
  const label = part === 'alt' ? `${f.label} alt text` : f.label;
  const value = get(e, s, f, part);
  const required = !!f.required && part !== 'alt';
  const pair = compare && local;
  const mainName = languageName(e.content, e.content.settings.main);
  return (
    <div className={pair ? spike.pair : spike.single}>
      {pair && (
        <div className={spike.source}>
          <span className={spike.sourceLabel}>
            {label} · {mainName}
          </span>
          <p>{display(e.content, f, part, get(e, s, f, part, true)) || '—'}</p>
        </div>
      )}
      <div className={styles.field}>
        <div className={spike.labelRow}>
          <Label htmlFor={id}>
            {label}
            {required ? ' *' : ''}
          </Label>
          <Tag local={local} />
        </div>
        <Control
          f={f}
          part={part}
          id={id}
          label={label}
          value={value}
          readOnly={e.creating && !local}
          onChange={(v) => set(e, s, f, part, v)}
        />
      </div>
    </div>
  );
}

export function LangFields({ fields, s }: { fields: FieldDef[]; s: Scope }) {
  const e = useContext(EditContext);
  const compare = e.presentation !== 'switcher' && !e.main;
  const entries = fields.flatMap((f) =>
    parts(f).map((part) => ({ f, part, local: partLocal(e.content, f, part) })),
  );
  const local = entries.filter((x) => x.local);
  const shared = entries.filter((x) => !x.local);
  const mainName = languageName(e.content, e.content.settings.main);
  const nodes: ReactNode[] = [];
  // Keyed siblings keep nested list state when the grouping changes.
  if (compare && local.length)
    nodes.push(
      <div key="compare-head" className={spike.compareHead} aria-hidden="true">
        <span>{mainName} · main, read only</span>
        <span>{languageName(e.content, e.lang)}</span>
      </div>,
    );
  for (const x of compare ? [...local, ...shared] : entries) {
    if (e.creating && !x.local) continue;
    if (compare && x === shared[0] && !e.creating)
      nodes.push(
        <h3 key="shared-head" className={spike.sharedHead}>
          Shared by all languages
        </h3>,
      );
    nodes.push(<FieldRow key={`${x.f.key}:${x.part}`} {...x} s={s} compare={compare} />);
  }
  const stacked = e.presentation === 'stacked' ? spike.stacked : '';
  return <div className={`${styles.formStack} ${spike.langForm} ${stacked}`}>{nodes}</div>;
}

function ListRows({ f, s, local }: { f: FieldDef; s: Scope; local: boolean }) {
  const e = useContext(EditContext);
  const [open, setOpen] = useState('');
  const [pending, setPending] = useState<Row | null>(null);
  const rows = (mainBox(e.doc, s)[f.key] as Row[]) ?? [];
  const scope = (rowId: string): Scope => ({ ...s, list: f.key, rowId });
  const labels = rows.map((r, i) =>
    rowLabel(e.content, e.doc, e.copy, scope(r._rowId), f.rows!, e.main, i),
  );
  const index = rows.findIndex((r) => r._rowId === open);
  const mainName = languageName(e.content, e.content.settings.main);
  // Copies left incomplete by a new item with required per-language text (DEC-223).
  const affected = f.rows!.some((r) => r.required && isLocal(e.content, r))
    ? secondary(e.content).filter((l) => e.doc.copies[l.code])
    : [];
  const titles = labels.map((l) => (l.source ? `${l.text} · not translated` : l.text));
  return (
    <div className={styles.field}>
      <div className={spike.labelRow}>
        <span className={spike.groupLabel}>{f.label}</span>
        {e.content.settings.enabled && (
          <Badge variant="secondary">{local ? 'Shared items · text per language' : 'Shared'}</Badge>
        )}
      </div>
      {!rows.length ? (
        <p className={styles.muted}>No items yet.</p>
      ) : e.creating ? (
        <ul className={styles.recordList} aria-label={f.label}>
          {rows.map((r, i) => (
            <li key={r._rowId}>
              <Button className={styles.recordButton} onClick={() => setOpen(r._rowId)}>
                <span>{titles[i]}</span>
                <CaretRightIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <BlockList
          label={f.label}
          showVersion={false}
          disabled={false}
          blocks={rows.map((r) => ({ id: r._rowId, type: r._rowId, version: 1, props: r }))}
          definitions={rows.map((r, i) => ({ type: r._rowId, version: 1, label: titles[i] }))}
          onSelect={setOpen}
          onChange={(next) => e.onMain(writeMain(e.doc, s, f.key, next.map((b) => b.props)))}
        />
      )}
      {!e.main && <p className={styles.muted}>Add or remove items in {mainName}.</p>}
      {e.main && (
        <Button
          variant="primary"
          icon={<PlusIcon />}
          className={spike.alignStart}
          onClick={() => setPending({ _rowId: `row-${Date.now().toString(36)}` })}
        >
          Add item
        </Button>
      )}
      {index >= 0 && (
        <PanelLevel
          title={labels[index].source ? labels[index].text : titles[index]}
          context={f.label}
          onBack={() => setOpen('')}
        >
          {e.bar}
          <LangFields fields={f.rows!} s={scope(open)} />
          {e.main && !e.creating && (
            <Button
              variant="secondary-destructive"
              onClick={() => {
                setOpen('');
                e.onMain(writeMain(e.doc, s, f.key, rows.filter((r) => r._rowId !== open)));
              }}
            >
              Remove item
            </Button>
          )}
        </PanelLevel>
      )}
      {pending && (
        <PanelLevel
          title="New item"
          context={f.label}
          onBack={() => setPending(null)}
          creation={{
            label: 'Create item',
            onCreate: () => {
              e.onMain(writeMain(e.doc, s, f.key, [...rows, pending]));
              setPending(null);
            },
          }}
        >
          <EditContext.Provider
            value={{
              ...e,
              doc: writeMain(e.doc, s, f.key, [...rows, pending]),
              onMain: (doc) => setPending(mainBox(doc, scope(pending._rowId)) as Row),
            }}
          >
            <LangFields fields={f.rows!} s={scope(pending._rowId)} />
          </EditContext.Provider>
          {affected.length > 0 && (
            <p className={styles.muted}>
              Leaves {affected.map((l) => l.name).join(', ')} incomplete until translated.
            </p>
          )}
        </PanelLevel>
      )}
    </div>
  );
}

function BlockRows() {
  const e = useContext(EditContext);
  const [open, setOpen] = useState('');
  const block = e.doc.blocks.find((b) => b.id === open);
  const labels = e.doc.blocks.map((b) => blockType(e.content, b).label);
  return (
    <PanelSection title="Blocks">
      {e.creating ? (
        <ul className={styles.recordList} aria-label="Blocks">
          {e.doc.blocks.map((b, i) => (
            <li key={b.id}>
              <Button className={styles.recordButton} onClick={() => setOpen(b.id)}>
                <span>{labels[i]}</span>
                <CaretRightIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <BlockList
          blocks={e.doc.blocks.map((b) => ({ id: b.id, type: b.type, version: 1, props: b.values }))}
          definitions={e.doc.blocks.map((b, i) => ({ type: b.type, version: 1, label: labels[i] }))}
          showVersion={false}
          disabled={false}
          onSelect={setOpen}
          onChange={(next) =>
            e.onMain({ ...e.doc, blocks: next.map((n) => e.doc.blocks.find((b) => b.id === n.id)!) })
          }
        />
      )}
      {!e.main && <p className={styles.muted}>Blocks and their order are shared by all languages.</p>}
      {block && (
        <PanelLevel
          title={blockType(e.content, block).label}
          onBack={() => setOpen('')}
        >
          {e.bar}
          <LangFields fields={blockType(e.content, block).fields} s={{ blockId: block.id }} />
        </PanelLevel>
      )}
    </PanelSection>
  );
}

export interface ItemEditorProps {
  content: Content;
  doc: Doc;
  lang: string;
  presentation: Presentation;
  showTabs: boolean;
  pending: Copy | null;
  setLang(lang: string): void;
  setPending(copy: Copy | null): void;
  onDoc(doc: Doc): void;
  onBack(): void;
  onRemoveCopy(): void;
}
export function ItemEditor(props: ItemEditorProps) {
  const { content, doc, lang, pending } = props;
  const enabled = content.settings.enabled;
  const main = !enabled || lang === content.settings.main;
  const copy = main ? undefined : (pending ?? doc.copies[lang]);
  const creating = !!pending;
  const langName = languageName(content, lang);
  const statusDoc = copy ? { ...doc, copies: { ...doc.copies, [lang]: copy } } : doc;
  const tabs = enabled && props.showTabs && !creating;
  const bar = tabs || !main ? (
    <div className={spike.languageBar}>
      {tabs && <LanguageTabs content={content} doc={doc} lang={lang} setLang={props.setLang} />}
      <StatusLine content={content} doc={statusDoc} lang={lang} />
    </div>
  ) : null;
  const edit: Edit = {
    content,
    doc,
    copy,
    lang,
    main,
    presentation: props.presentation,
    creating,
    bar,
    onMain: props.onDoc,
    onCopy: (next) =>
      creating ? props.setPending(next) : props.onDoc({ ...doc, copies: { ...doc.copies, [lang]: next } }),
  };
  const collection = content.collections.find((c) => c.id === doc.collectionId);
  const template = content.docs.find((d) => d.id === collection?.templateId);
  const fields = (
    <>
      <LangFields fields={docFields(content, doc)} s={{}} />
      {doc.blocks.length > 0 && <BlockRows />}
    </>
  );
  if (creating)
    return (
      <EditContext.Provider value={edit}>
        <FormScreen
          title={`New ${langName} copy`}
          subtitle={docTitle(doc)}
          onBack={() => props.setPending(null)}
          creation={{
            label: `Create ${langName} copy`,
            onCreate: () => {
              props.onDoc({ ...doc, copies: { ...doc.copies, [lang]: pending! } });
              props.setPending(null);
            },
          }}
        >
          {bar}
          {fields}
        </FormScreen>
      </EditContext.Provider>
    );
  const path = publicPath(content, doc, lang);
  return (
    <EditContext.Provider value={edit}>
      <Button className={styles.back} variant="ghost" onClick={props.onBack}>
        ← Back
      </Button>
      <div className={styles.formHeading}>
        <h2 tabIndex={-1}>{docTitle(doc)}</h2>
        <p>
          {[collection?.name ?? (doc.kind === 'page' ? 'Page' : 'Site Layout'), path ?? (doc.kind === 'entry' ? 'Data only' : null)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {bar}
      {!copy && !main ? (
        <Button variant="primary" icon={<PlusIcon />} className={spike.alignStart} onClick={() => props.setPending({ values: {}, blocks: {} })}>
          Add {langName} copy
        </Button>
      ) : (
        <>
          {template && <p className={styles.muted}>Template: {docTitle(template)}</p>}
          {doc.kind === 'entry' && collection?.prefix && (
            <div className={styles.field}>
              <div className={spike.labelRow}>
                <Label htmlFor="slug">URL slug</Label>
                {enabled && <Badge variant="secondary">Shared</Badge>}
              </div>
              <Input id="slug" aria-label="URL slug" value={doc.path} onChange={(event) => props.onDoc({ ...doc, path: event.target.value })} />
            </div>
          )}
          {fields}
          {!main && (
            <Button variant="secondary-destructive" className={spike.alignStart} onClick={props.onRemoveCopy}>
              Remove {langName} copy
            </Button>
          )}
        </>
      )}
    </EditContext.Provider>
  );
}
