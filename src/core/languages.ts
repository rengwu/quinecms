import type {
  Block,
  Content,
  Definition,
  Entry,
  Field,
  Issue,
  Page,
  Site,
  SiteLayout,
  Values,
} from './types';
import { isRecord, objectFields, rowFields, type Model } from './schema';
import { listRows, rowId } from './lists';
import { languagePath } from './routes';
export { languagePath };
import { layoutDefinitions } from './layouts';
import { validate } from './content';

// Language copies are sparse overlays on a record: they hold only localized
// values, with rows keyed by `_rowId`. Structure and shared values stay on the
// record, so a missing or incomplete copy falls back to the whole record.

export type Translatable = Page | Entry | SiteLayout;
export const mainLanguage = (site: Site) => site.i18n?.main ?? 'en';
/** Additional languages that are built and edited. */
export const extraLanguages = (site: Site) =>
  site.i18n?.enabled && Array.isArray(site.i18n.languages)
    ? site.i18n.languages
    : [];
export function languageName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}
export const validLanguage = (code: unknown): code is string => {
  if (typeof code !== 'string' || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(code))
    return false;
  try {
    return Intl.getCanonicalLocales(code).length === 1;
  } catch {
    return false;
  }
};

/** Text varies by default; other leaves opt in. Composition and field mappings stay shared. */
export const localized = (f: Field) =>
  (f.localized ?? (f.type === 'text' || f.type === 'richtext')) &&
  !f.collectionField &&
  f.type !== 'object' &&
  f.type !== 'list' &&
  f.type !== 'collection' &&
  !(f.type === 'array' && f.of?.type === 'object');

/** Media alt text always varies, so any media field makes values translatable. */
export function translatable(
  fields: Field[],
  model: Model,
  depth = 0,
): boolean {
  if (depth > 3 || !Array.isArray(fields)) return false;
  return fields.some(
    (f) =>
      localized(f) ||
      f.type === 'media' ||
      (f.type === 'object' &&
        translatable(objectFields(f, model), model, depth + 1)) ||
      translatable(rowFields(f, model) ?? [], model, depth + 1),
  );
}

export function mergeCopy(
  fields: Field[],
  values: Values,
  copy: Values,
  model: Model,
  depth = 0,
): Values {
  const view: Values = { ...values };
  if (depth > 3) return view;
  for (const f of fields) {
    const own = copy[f.key];
    const main = values[f.key];
    if (localized(f)) view[f.key] = own ?? null;
    else if (f.type === 'media')
      view[f.key] = isRecord(main)
        ? { ...main, alt: isRecord(own) ? (own.alt ?? '') : '' }
        : (main ?? null);
    else if (f.type === 'object') {
      if (isRecord(main))
        view[f.key] = mergeCopy(
          objectFields(f, model),
          main,
          isRecord(own) ? own : {},
          model,
          depth + 1,
        );
    } else {
      const children = rowFields(f, model);
      if (children && Array.isArray(main))
        view[f.key] = listRows(main).map((row) => {
          const rowCopy =
            isRecord(own) && row._rowId ? own[String(row._rowId)] : undefined;
          return mergeCopy(
            children,
            row,
            isRecord(rowCopy) ? rowCopy : {},
            model,
            depth + 1,
          );
        });
    }
  }
  return view;
}

/** Splits an edited view back into the record's values and the copy. */
export function splitCopy(
  fields: Field[],
  values: Values,
  view: Values,
  model: Model,
  depth = 0,
): [Values, Values] {
  const next: Values = { ...view };
  const copy: Values = {};
  if (depth > 3) return [next, copy];
  for (const f of fields) {
    const edited = view[f.key];
    const main = values[f.key];
    if (localized(f)) {
      if (f.key in values) next[f.key] = main;
      else delete next[f.key];
      if (edited != null && edited !== '') copy[f.key] = edited;
    } else if (f.type === 'media') {
      next[f.key] = isRecord(edited)
        ? {
            ...edited,
            alt:
              isRecord(main) && main.mediaId === edited.mediaId
                ? (main.alt ?? '')
                : '',
          }
        : (edited ?? null);
      if (isRecord(edited) && edited.alt) copy[f.key] = { alt: edited.alt };
    } else if (f.type === 'object') {
      if (!isRecord(edited)) continue;
      const [object, own] = splitCopy(
        objectFields(f, model),
        isRecord(main) ? main : {},
        edited,
        model,
        depth + 1,
      );
      next[f.key] = object;
      if (Object.keys(own).length) copy[f.key] = own;
    } else {
      const children = rowFields(f, model);
      if (!children || !Array.isArray(edited)) continue;
      const rows = listRows(main);
      const own: Values = {};
      next[f.key] = listRows(edited).map((row) => {
        const [values, rowCopy] = splitCopy(
          children,
          rows.find((r) => r._rowId && r._rowId === row._rowId) ?? {},
          row,
          model,
          depth + 1,
        );
        if (row._rowId && Object.keys(rowCopy).length)
          own[String(row._rowId)] = rowCopy;
        return values;
      });
      if (Object.keys(own).length) copy[f.key] = own;
    }
  }
  return [next, copy];
}

const blockFields = (block: Block, definitions: Definition[]) =>
  (
    definitions.find(
      (d) => d.type === block.type && d.version === block.version,
    )?.fields ?? []
  ).filter((f) => !block.bindings?.[f.key]);
const layoutFields = (layout: SiteLayout) =>
  layoutDefinitions.find(
    (d) => d.id === layout.design.id && d.version === layout.design.version,
  )?.fields ?? [];
const entryFields = (model: Model, entry: Entry) =>
  model.collections.find((c) => c.id === entry.collectionId)?.fields ?? [];

export const hasCopy = (record: Translatable, language: string) =>
  isRecord(record.copies) && isRecord(record.copies[language]);

/** Static pages always need copies for their visitor-facing titles. */
export function needsCopy(
  content: Model,
  record: Translatable,
  definitions: Definition[],
) {
  if ('design' in record) return translatable(layoutFields(record), content);
  if ('values' in record)
    return translatable(entryFields(content, record), content);
  return (
    record.kind === 'static' ||
    record.blocks.some((b) =>
      translatable(blockFields(b, definitions), content),
    )
  );
}

/** The record as edited or shown in one additional language. */
export function recordView<T extends Translatable>(
  content: Model,
  record: T,
  language: string,
  definitions: Definition[],
): T {
  if ('design' in record) {
    const copy = record.copies?.[language] ?? {};
    return {
      ...record,
      design: {
        ...record.design,
        settings: mergeCopy(
          layoutFields(record),
          record.design.settings,
          copy,
          content,
        ),
      },
    };
  }
  if ('values' in record)
    return {
      ...record,
      values: mergeCopy(
        entryFields(content, record),
        record.values,
        record.copies?.[language] ?? {},
        content,
      ),
    };
  const copy = record.copies?.[language] ?? {};
  return {
    ...record,
    title: record.kind === 'static' ? (copy.title ?? '') : record.title,
    blocks: record.blocks.map((b) => ({
      ...b,
      props: mergeCopy(
        blockFields(b, definitions),
        b.props,
        copy.blocks?.[b.id] ?? {},
        content,
      ),
    })),
  };
}

/** Writes an edited view back: shared values to the record, the rest to its copy. */
export function applyView<T extends Translatable>(
  content: Model,
  record: T,
  language: string,
  view: T,
  definitions: Definition[],
): T {
  if ('design' in record && 'design' in view) {
    const [settings, copy] = splitCopy(
      layoutFields(view),
      record.design.settings,
      view.design.settings,
      content,
    );
    return {
      ...view,
      design: { ...view.design, settings },
      copies: { ...record.copies, [language]: copy },
    };
  }
  if ('values' in record && 'values' in view) {
    const [values, copy] = splitCopy(
      entryFields(content, view),
      record.values,
      view.values,
      content,
    );
    return { ...view, values, copies: { ...record.copies, [language]: copy } };
  }
  const page = record as Page,
    edited = view as Page;
  const blocks: Record<string, Values> = {};
  const next = edited.blocks.map((b) => {
    const main = page.blocks.find((x) => x.id === b.id);
    const [props, copy] = splitCopy(
      blockFields(b, definitions),
      main?.props ?? {},
      b.props,
      content,
    );
    if (Object.keys(copy).length) blocks[b.id] = copy;
    return { ...b, props };
  });
  return {
    ...edited,
    title: page.kind === 'static' ? page.title : edited.title,
    blocks: next,
    copies: {
      ...page.copies,
      [language]: {
        ...(page.kind === 'static' ? { title: edited.title } : {}),
        ...(Object.keys(blocks).length ? { blocks } : {}),
      },
    },
  } as T;
}

/** Drops copy values for removed rows, blocks or fields after main-language edits. */
export function pruneCopies<T extends Translatable>(
  content: Model,
  record: T,
  definitions: Definition[],
): T {
  if (!isRecord(record.copies)) return record;
  return Object.keys(record.copies).reduce(
    (next, language) =>
      applyView(
        content,
        next,
        language,
        recordView(content, next, language, definitions),
        definitions,
      ),
    record,
  );
}

// Rows need stable IDs before a copy can refer to them.
function identifyRows(
  fields: Field[],
  values: Values,
  model: Model,
  depth = 0,
): Values {
  const next: Values = { ...values };
  if (depth > 3) return next;
  for (const f of fields) {
    const value = values[f.key];
    if (f.type === 'object' && isRecord(value))
      next[f.key] = identifyRows(
        objectFields(f, model),
        value,
        model,
        depth + 1,
      );
    const children = rowFields(f, model);
    if (children && Array.isArray(value))
      next[f.key] = listRows(value).map((row) => ({
        ...identifyRows(children, row, model, depth + 1),
        _rowId: row._rowId || rowId(),
      }));
  }
  return next;
}

/** Adds an empty copy (DEC-224); main-language values are never copied into it. */
export function startCopy<T extends Translatable>(
  content: Model,
  record: T,
  language: string,
  definitions: Definition[],
): T {
  const copies = { ...record.copies, [language]: {} };
  if ('design' in record)
    return {
      ...record,
      design: {
        ...record.design,
        settings: identifyRows(
          layoutFields(record),
          record.design.settings,
          content,
        ),
      },
      copies,
    };
  if ('values' in record)
    return {
      ...record,
      values: identifyRows(
        entryFields(content, record),
        record.values,
        content,
      ),
      copies,
    };
  return {
    ...record,
    blocks: record.blocks.map((b) => ({
      ...b,
      props: identifyRows(blockFields(b, definitions), b.props, content),
    })),
    copies,
  } as T;
}

const withoutCopies = <T extends { copies?: unknown }>({
  copies: _,
  ...rest
}: T) => rest as T;

export interface Localized {
  content: Content;
  /** Records shown in the main language because their copy is unusable. */
  fallback: Set<string>;
}
function withCopies(
  content: Content,
  language: string,
  definitions: Definition[],
  usable: (id: string) => boolean,
): Localized {
  const fallback = new Set<string>();
  const pick = <T extends Translatable>(record: T): T => {
    if (hasCopy(record, language) && usable(record.id))
      return withoutCopies(recordView(content, record, language, definitions));
    if (needsCopy(content, record, definitions)) fallback.add(record.id);
    return withoutCopies(record);
  };
  const { i18n: _, ...site } = content.site;
  return {
    fallback,
    content: {
      ...content,
      site: site.layouts ? { ...site, layouts: site.layouts.map(pick) } : site,
      pages: content.pages.map((p) => {
        const page = pick(p);
        return page.kind === 'static' && typeof page.path === 'string'
          ? { ...page, path: languagePath(page.path, language) }
          : page;
      }),
      collections: content.collections.map((c) =>
        typeof c.path === 'string'
          ? { ...c, path: languagePath(c.path, language) }
          : c,
      ),
      entries: content.entries.map(pick),
    },
  };
}
export function issueRecord(content: Content, path: string) {
  const layout = /^site\.layouts\[(\d+)\]/.exec(path);
  return layout
    ? content.site.layouts?.[Number(layout[1])]?.id
    : path.split('.')[0];
}

/**
 * Content as received in one language, with prefixed paths. `draft` uses every
 * existing copy; `visitor` uses only copies that pass validation (DEC-200).
 */
export function localize(
  content: Content,
  language: string,
  definitions: Definition[],
  mode: 'visitor' | 'draft' = 'visitor',
): Localized {
  if (language === mainLanguage(content.site))
    return { content, fallback: new Set() };
  const draft = withCopies(content, language, definitions, () => true);
  if (mode === 'draft') return draft;
  const failing = new Set(
    validate(draft.content, definitions).map((issue) =>
      issueRecord(draft.content, issue.path),
    ),
  );
  return withCopies(content, language, definitions, (id) => !failing.has(id));
}

/** Issues in one language copy, keyed by record ID. */
export function copyIssues(
  content: Content,
  language: string,
  definitions: Definition[],
) {
  const draft = withCopies(content, language, definitions, () => true);
  const issues = new Map<string, Issue[]>();
  for (const issue of validate(draft.content, definitions)) {
    const id = issueRecord(draft.content, issue.path);
    if (id) issues.set(id, [...(issues.get(id) ?? []), issue]);
  }
  return issues;
}

const translatableRecords = (content: Content): [string, Translatable][] => [
  ...content.pages.map((p) => [p.id, p] as [string, Translatable]),
  ...content.entries.map((e) => [e.id, e] as [string, Translatable]),
  ...(Array.isArray(content.site.layouts) ? content.site.layouts : []).map(
    (l, i) => [`site.layouts[${i}]`, l] as [string, Translatable],
  ),
];

export function languageIssues(
  content: Content,
  definitions: Definition[],
): Issue[] {
  const issues: Issue[] = [];
  const add = (path: string, message: string, phase: Issue['phase']) =>
    issues.push({ path, message, phase });
  const i18n = content.site.i18n;
  if (
    i18n !== undefined &&
    (!isRecord(i18n) ||
      typeof i18n.enabled !== 'boolean' ||
      !validLanguage(i18n.main) ||
      !Array.isArray(i18n.languages) ||
      !i18n.languages.every(validLanguage) ||
      new Set([i18n.main, ...i18n.languages]).size !==
        i18n.languages.length + 1 ||
      !['fallback', 'strict'].includes(i18n.missing))
  )
    return [
      {
        path: 'site.i18n',
        message:
          'Choose valid, distinct language codes and a missing-translation policy.',
        phase: 'structure',
      },
    ];
  const known = new Set(i18n?.languages ?? []);
  for (const [path, record] of translatableRecords(content))
    if (
      record.copies !== undefined &&
      (!isRecord(record.copies) ||
        Object.entries(record.copies).some(
          ([code, copy]) => !known.has(code) || !isRecord(copy),
        ))
    )
      add(
        `${path}.copies`,
        "Language copies must use the site's additional languages.",
        'structure',
      );
  if (issues.length || !i18n?.enabled || i18n.missing !== 'strict')
    return issues;
  for (const language of i18n.languages) {
    const name = languageName(language);
    const found = copyIssues(content, language, definitions);
    for (const [path, record] of translatableRecords(content)) {
      if (!needsCopy(content, record, definitions)) continue;
      if (!hasCopy(record, language))
        add(path, `${name} copy is missing.`, 'publish');
      else
        for (const issue of found.get(record.id) ?? [])
          add(issue.path, `${name}: ${issue.message}`, 'publish');
    }
  }
  return issues;
}

export const countCopies = (content: Content, language: string) =>
  translatableRecords(content).filter(([, r]) => hasCopy(r, language)).length;

/** The record without its copy in one language. */
export function dropCopy<T extends Translatable>(
  record: T,
  language: string,
): T {
  if (!hasCopy(record, language)) return record;
  const { [language]: _, ...copies } = record.copies as Record<string, unknown>;
  const { copies: __, ...rest } = record;
  return (Object.keys(copies).length ? { ...rest, copies } : rest) as T;
}

/** Deletes one language's copies from every record (DEC-226). */
export function removeCopies(content: Content, language: string): Content {
  const drop = <T extends Translatable>(record: T) =>
    dropCopy(record, language);
  return {
    ...content,
    site: content.site.layouts
      ? { ...content.site, layouts: content.site.layouts.map(drop) }
      : content.site,
    pages: content.pages.map(drop),
    entries: content.entries.map(drop),
  };
}

/** Names an issue's field with its block, row or object, e.g. "Key ingredients › Name". */
export function issueLabel(
  content: Content,
  path: string,
  definitions: Definition[],
): string | undefined {
  const [first, ...rest] = path.split('.');
  const entry = content.entries.find((e) => e.id === first);
  const page = content.pages.find((p) => p.id === first);
  const labels: string[] = [];
  let fields: Field[] = [];
  let keys = rest;
  if (entry) fields = entryFields(content, entry);
  else if (page) {
    if (!rest.length) return 'Page title';
    const block = page.blocks.find((b) => b.id === rest[0]);
    if (!block) return;
    const definition = definitions.find(
      (d) => d.type === block.type && d.version === block.version,
    );
    if (definition) labels.push(definition.label);
    fields = blockFields(block, definitions);
    keys = rest.slice(1);
  } else if (first === 'site') {
    const layout = content.site.layouts?.[Number(/\d+/.exec(rest[0])?.[0])];
    fields = layout ? layoutFields(layout) : [];
    keys = rest.slice(3);
  }
  for (let i = 0; i < keys.length; i++) {
    const f = fields.find((x) => x.key === keys[i]);
    if (!f) break;
    labels.push(f.label);
    fields =
      (f.type === 'object'
        ? objectFields(f, content)
        : rowFields(f, content)) ?? [];
    if (/^\d+$/.test(keys[i + 1] ?? '')) i++;
  }
  return labels.join(' › ') || undefined;
}

export type CopyState = 'eligible' | 'incomplete' | 'none';
/** Undefined when the record looks the same in every language. */
export function copyState(
  content: Content,
  record: Translatable,
  language: string,
  issues: Map<string, Issue[]>,
  definitions: Definition[],
): CopyState | undefined {
  if (!needsCopy(content, record, definitions)) return undefined;
  if (!hasCopy(record, language)) return 'none';
  return issues.get(record.id)?.length ? 'incomplete' : 'eligible';
}
