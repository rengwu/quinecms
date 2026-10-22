// Prototype-only model and resolution. This is NOT a proposed storage format:
// it exists so the presentations can show shared/localized values, whole-item
// fallback and automatic eligibility against the same in-memory fixtures.

/** shared: one value for all languages. language: one value per language.
 * For media, this sets the image; alt text is per language whenever i18n is on (DEC-222). */
export type Localize = 'shared' | 'language';
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'reference'
  | 'media'
  | 'list';
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  localize: Localize;
  required?: boolean;
  options?: string[];
  collectionId?: string;
  rows?: FieldDef[];
}
export type Values = Record<string, any>;
export interface Row extends Values {
  _rowId: string;
}
export interface Block {
  id: string;
  type: string;
  values: Values;
}
/** Localized values only. Rows are keyed by stable row ID, blocks by block ID. */
export interface Copy {
  values: Values;
  blocks: Record<string, Values>;
}
export interface Doc {
  id: string;
  kind: 'entry' | 'page' | 'layout';
  collectionId?: string;
  name?: string;
  path: string;
  values: Values;
  blocks: Block[];
  copies: Record<string, Copy>;
}
export interface Collection {
  id: string;
  name: string;
  prefix?: string;
  templateId?: string;
  fields: FieldDef[];
}
export interface BlockType {
  type: string;
  label: string;
  fields: FieldDef[];
}
export interface Language {
  code: string;
  name: string;
}
export interface Settings {
  enabled: boolean;
  main: string;
  languages: Language[];
  policy: 'fallback' | 'strict';
}
export interface MediaItem {
  id: string;
  name: string;
  hue: number;
}
export interface Content {
  settings: Settings;
  collections: Collection[];
  blockTypes: BlockType[];
  pageFields: FieldDef[];
  layoutFields: FieldDef[];
  media: MediaItem[];
  docs: Doc[];
}
export interface Scope {
  blockId?: string;
  list?: string;
  rowId?: string;
}

export const blank = (v: unknown) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
export const languageName = (c: Content, code: string) =>
  c.settings.languages.find((l) => l.code === code)?.name ?? code.toUpperCase();
export const secondary = (c: Content) =>
  c.settings.enabled
    ? c.settings.languages.filter((l) => l.code !== c.settings.main)
    : [];
export const isLocal = (c: Content, f: FieldDef) =>
  c.settings.enabled && (f.localize === 'language' || f.type === 'media');

export function docFields(c: Content, doc: Doc) {
  if (doc.kind === 'page') return c.pageFields;
  if (doc.kind === 'layout') return c.layoutFields;
  return c.collections.find((x) => x.id === doc.collectionId)?.fields ?? [];
}
export const blockType = (c: Content, block: Block) =>
  c.blockTypes.find((t) => t.type === block.type)!;

export function mainBox(doc: Doc, s: Scope): Values {
  let box = s.blockId
    ? doc.blocks.find((b) => b.id === s.blockId)!.values
    : doc.values;
  if (s.list)
    box = (box[s.list] as Row[]).find((r) => r._rowId === s.rowId) ?? {};
  return box;
}
export function copyBox(copy: Copy | undefined, s: Scope): Values | undefined {
  let box: any = s.blockId ? copy?.blocks[s.blockId] : copy?.values;
  if (s.list) box = box?.[s.list]?.[s.rowId!];
  return box;
}
/** The value an editor sees for one field in one language. */
export function read(
  c: Content,
  doc: Doc,
  copy: Copy | undefined,
  s: Scope,
  f: FieldDef,
  main: boolean,
): any {
  const value = mainBox(doc, s)[f.key];
  if (main || !isLocal(c, f)) return value;
  const local = copyBox(copy, s)?.[f.key];
  if (f.type === 'media' && f.localize === 'shared')
    return value ? { ...value, alt: local?.alt ?? '' } : null;
  return local;
}
export function writeMain(doc: Doc, s: Scope, key: string, value: unknown) {
  const next = structuredClone(doc);
  mainBox(next, s)[key] = value;
  return next;
}
export function writeCopy(copy: Copy, s: Scope, key: string, value: unknown) {
  const next = structuredClone(copy);
  let box: any = s.blockId ? (next.blocks[s.blockId] ??= {}) : next.values;
  if (s.list) box = (box[s.list] ??= {})[s.rowId!] ??= {};
  box[key] = value;
  return next;
}

export function rowLabel(
  c: Content,
  doc: Doc,
  copy: Copy | undefined,
  s: Scope,
  fields: FieldDef[],
  main: boolean,
  index: number,
) {
  for (const f of fields) {
    if (f.type === 'text') {
      const v = read(c, doc, copy, s, f, main);
      if (!blank(v)) return { text: String(v), source: false };
      const source = mainBox(doc, s)[f.key];
      if (!main && !blank(source)) return { text: String(source), source: true };
    }
    if (f.type === 'reference') {
      const target = c.docs.find((d) => d.id === mainBox(doc, s)[f.key]);
      if (target) return { text: docTitle(target), source: false };
    }
  }
  return { text: `Item ${index + 1}`, source: false };
}

/** Required values missing for one language copy (or the main item). */
export function missing(
  c: Content,
  doc: Doc,
  copy: Copy | undefined,
  main: boolean,
) {
  const out: string[] = [];
  const check = (fields: FieldDef[], s: Scope, prefix: string) => {
    for (const f of fields) {
      if (f.type === 'list') {
        ((mainBox(doc, s)[f.key] as Row[]) ?? []).forEach((row, i) => {
          const scope = { ...s, list: f.key, rowId: row._rowId };
          const name = rowLabel(c, doc, undefined, scope, f.rows!, true, i).text;
          check(f.rows!, scope, `${prefix}${f.label} › ${name} › `);
        });
        continue;
      }
      if (!f.required || (!main && f.localize === 'shared')) continue;
      const v = read(c, doc, copy, s, f, main);
      if (f.type === 'media' ? !v?.mediaId : blank(v)) out.push(prefix + f.label);
    }
  };
  check(docFields(c, doc), {}, '');
  for (const block of doc.blocks)
    check(blockType(c, block).fields, { blockId: block.id }, `${blockType(c, block).label} › `);
  return out;
}

export type StatusKind = 'main' | 'none' | 'incomplete' | 'eligible';
export function status(c: Content, doc: Doc, lang: string) {
  if (lang === c.settings.main)
    return { kind: 'main' as StatusKind, missing: missing(c, doc, undefined, true) };
  const copy = doc.copies[lang];
  if (!copy) return { kind: 'none' as StatusKind, missing: [] };
  const m = missing(c, doc, copy, false);
  return { kind: (m.length ? 'incomplete' : 'eligible') as StatusKind, missing: m };
}

export interface View {
  lang: string;
  values: Values;
  blocks: { id: string; type: string; values: Values }[];
}
/** Plain values for rendering. Blank localized values stay blank (no per-field fallback). */
export function view(c: Content, doc: Doc, lang: string, copy = doc.copies[lang]): View {
  const main = lang === c.settings.main || !c.settings.enabled;
  const resolve = (fields: FieldDef[], s: Scope): Values =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        f.type === 'list'
          ? ((mainBox(doc, s)[f.key] as Row[]) ?? []).map((r) => ({
              _rowId: r._rowId,
              ...resolve(f.rows!, { ...s, list: f.key, rowId: r._rowId }),
            }))
          : read(c, doc, copy, s, f, main),
      ]),
    );
  return {
    lang: main ? c.settings.main : lang,
    values: resolve(docFields(c, doc), {}),
    blocks: doc.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      values: resolve(blockType(c, b).fields, { blockId: b.id }),
    })),
  };
}
/** What a visitor would receive after Publish, under the current policy. */
export function visitor(c: Content, doc: Doc, lang: string) {
  const main = c.settings.main;
  if (!c.settings.enabled || lang === main)
    return { view: view(c, doc, main), fallback: null, blocked: false };
  const s = status(c, doc, lang);
  if (s.kind === 'eligible')
    return { view: view(c, doc, lang), fallback: null, blocked: false };
  return {
    view: view(c, doc, main),
    fallback: s.kind as 'none' | 'incomplete',
    blocked: c.settings.policy === 'strict',
  };
}

export function docTitle(doc: Doc, v: Values = doc.values) {
  if (doc.kind === 'layout') return doc.name ?? 'Layout';
  return String(v.name || v.title || 'Untitled');
}
export function publicPath(c: Content, doc: Doc, lang: string) {
  let path: string | null = doc.path;
  if (doc.kind === 'entry') {
    const prefix = c.collections.find((x) => x.id === doc.collectionId)?.prefix;
    path = prefix ? `/${prefix}/${doc.path}` : null;
  }
  if (doc.kind === 'layout' || (doc.kind === 'page' && !path?.startsWith('/')))
    path = null;
  if (!path || !c.settings.enabled || lang === c.settings.main) return path;
  return `/${lang}${path === '/' ? '' : path}`;
}
export const translationsExist = (c: Content) =>
  c.docs.some((d) => Object.keys(d.copies).length);

export function publishReport(c: Content) {
  const main = c.docs
    .map((doc) => ({ doc, missing: status(c, doc, c.settings.main).missing }))
    .filter((x) => x.missing.length);
  const languages = secondary(c).map((language) => {
    const rows = c.docs.map((doc) => ({ doc, ...status(c, doc, language.code) }));
    return {
      language,
      eligible: rows.filter((r) => r.kind === 'eligible'),
      fallback: rows.filter((r) => r.kind !== 'eligible'),
    };
  });
  const strictBlocked =
    c.settings.policy === 'strict' && languages.some((l) => l.fallback.length);
  return { main, languages, blocked: !!main.length || strictBlocked };
}
