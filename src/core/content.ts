import { normalizeLists } from './lists';
import {
  activeLayout,
  layoutDefinition,
  layoutPolicy,
  layoutGlobals,
} from './layouts';
import { entryPath } from './routes';
export { entryPath } from './routes';
import { bindingCompatible, resolveBlock } from './bindings';
import { embedDestination, embeddedDestinations } from './embeds';
import { customValidators } from './custom-fields';
import { validContentMaxWidth, validPageGutter } from './site-style';
import type {
  Block,
  Collection,
  Content,
  Context,
  Definition,
  Field,
  Issue,
  Link,
  Values,
} from './types';
export const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
export const recordPath = (path: string) =>
  /^content\/(?:site\.json|(?:pages|collections|media)\/[\w-]+\.json|entries\/[\w-]+\/[\w-]+\.json)$/.test(
    path,
  );
export function serialize(value: unknown): string {
  return (
    JSON.stringify(
      value,
      (_key, v) =>
        object(v)
          ? Object.fromEntries(
              Object.keys(v)
                .sort()
                .map((k) => [k, v[k]]),
            )
          : v,
      2,
    ) + '\n'
  );
}
export function filesFor(c: Content): Record<string, string> {
  const files: Record<string, string> = {
    'content/site.json': serialize(c.site),
  };
  for (const [kind, records] of [
    ['pages', c.pages],
    ['collections', c.collections],
    ['media', c.media],
  ] as const)
    for (const r of records)
      files[`content/${kind}/${r.id}.json`] = serialize(r);
  for (const r of c.entries)
    files[`content/entries/${r.collectionId}/${r.id}.json`] = serialize(r);
  return files;
}
export function parseFiles(files: Record<string, string>): Content {
  const c: Content = {
    site: null as unknown as Content['site'],
    pages: [],
    collections: [],
    entries: [],
    media: [],
  };
  for (const [path, raw] of Object.entries(files)) {
    if (!recordPath(path)) throw new Error(`Unsupported content path: ${path}`);
    const r = JSON.parse(raw);
    if (path === 'content/site.json') c.site = r;
    else {
      if (path.split('/').at(-1) !== `${r.id}.json`)
        throw new Error(`Record ID does not match ${path}`);
      if (
        path.startsWith('content/entries/') &&
        path.split('/')[2] !== r.collectionId
      )
        throw new Error(`Collection does not match ${path}`);
      const key = path.split('/')[1] as
        'pages' | 'collections' | 'entries' | 'media';
      (c[key] as unknown[]).push(r);
    }
  }
  if (!c.site) throw new Error('The repository has no content/site.json');
  c.pages.sort((a, b) =>
    String(a.path ?? a.title).localeCompare(String(b.path ?? b.title), 'en'),
  );
  return c;
}
export function resolveLink(c: Content, ref: Link): string | undefined {
  if (!object(ref)) return undefined;
  if (ref.kind !== 'page' && ref.kind !== 'entry' && ref.kind !== 'external')
    return undefined;
  if (ref.kind === 'external') return safeURL(ref.url) ? ref.url : undefined;
  const page = c.pages.find((p) => p.id === ref.id);
  const entry = c.entries.find((e) => e.id === ref.id);
  const collection =
    entry && c.collections.find((x) => x.id === entry.collectionId);
  const path =
    ref.kind === 'page'
      ? page?.kind === 'static'
        ? page.path
        : undefined
      : entry && collection && contentTemplate(c, collection)
        ? entryPath(collection, entry)
        : undefined;
  return path
    ? path + (ref.fragment ? '#' + encodeURIComponent(ref.fragment) : '')
    : undefined;
}
export function contextFor(c: Content, instanceId: string): Context {
  const block =
    c.pages.flatMap((p) => p.blocks).find((b) => b.id === instanceId) ??
    (c.site.footer?.id === instanceId ? c.site.footer : undefined);
  const mappedKeys = [
    'titleField',
    'summaryField',
    'imageField',
    'dateField',
  ].flatMap((key) =>
    typeof block?.props[key] === 'string' ? [String(block.props[key])] : [],
  );
  return {
    instanceId,
    globals: layoutGlobals(c.site),
    media: c.media,
    collections: c.collections.map((col) => ({
      id: col.id,
      name: col.name,
      entries: c.entries
        .filter((e) => e.collectionId === col.id)
        .map((e) => ({
          id: e.id,
          title: String(e.values[col.titleField] ?? e.slug),
          ...(block?.props.collection === col.id
            ? {
                values: Object.fromEntries(
                  mappedKeys.map((key) => [key, e.values[key] ?? null]),
                ),
              }
            : {}),
          ...(contentTemplate(c, col) ? { url: entryPath(col, e) } : {}),
        })),
    })),
    links: Object.fromEntries([
      ...c.pages.filter((p) => p.kind === 'static').map((p) => [p.id, p.path!]),
      ...c.entries.flatMap((e) => {
        const col = c.collections.find((x) => x.id === e.collectionId);
        return col && contentTemplate(c, col)
          ? [[e.id, entryPath(col, e)]]
          : [];
      }),
    ]),
  };
}
export const contentTemplate = (c: Content, col: Collection) =>
  c.pages.find((p) => p.id === col.genericPageId && p.kind === 'generic');
export const blank = (v: unknown) =>
  v === undefined || v === null || (typeof v === 'string' && !v.trim());
export const safeURL = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(v) &&
  !/[\\\u0000-\u0020]/.test(v);
export function safeFormEndpoint(v: unknown): v is string {
  if (!safeURL(v)) return false;
  try {
    const url = new URL(v);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export const safePublicPath = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]*$/.test(v) &&
  !/^\/(admin|_astro|assets)(\/|$)/.test(v);
export function compatible(f: Field, v: unknown): boolean {
  if (!f || typeof f !== 'object') return false;
  if (blank(v)) return true;
  switch (f.type) {
    case 'url':
      return safeURL(v);
    case 'list':
      return (
        Array.isArray(v) &&
        Array.isArray(f.fields) &&
        (f.max === undefined || v.length <= f.max) &&
        v.every(
          (row) =>
            object(row) &&
            f.fields.every((child) => compatible(child, row[child.key])),
        ) &&
        v.every(
          (row) => row._rowId === undefined || typeof row._rowId === 'string',
        ) &&
        new Set(v.filter((row) => row._rowId).map((row) => row._rowId)).size ===
          v.filter((row) => row._rowId).length
      );
    case 'richtext':
    case 'collection':
    case 'text':
      return typeof v === 'string';
    case 'date':
      return (
        typeof v === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(v) &&
        Number.isFinite(Date.parse(v + 'T00:00:00Z')) &&
        new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v
      );
    case 'number':
      return (
        typeof v === 'number' &&
        Number.isFinite(v) &&
        (f.min === undefined || v >= f.min) &&
        (f.max === undefined || v <= f.max)
      );
    case 'toggle':
      return typeof v === 'boolean';
    case 'select':
      return (
        typeof v === 'string' &&
        Array.isArray(f.options) &&
        f.options.some((o) => o?.value === v)
      );
    case 'custom':
      return !!customValidators[f.validator]?.(v);
    case 'media':
      return (
        object(v) &&
        typeof v.mediaId === 'string' &&
        (v.alt === undefined || typeof v.alt === 'string')
      );
    default:
      return false;
  }
}
export const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function switchVersion(
  block: Block,
  from: Definition,
  to: Definition,
): Block {
  const props: Values = {};
  for (const f of to.fields) {
    const old = from.fields.find((x) => x.key === f.key);
    props[f.key] =
      old?.type === f.type && compatible(f, block.props[f.key])
        ? (block.props[f.key] ?? null)
        : null;
  }
  const bindings = Object.fromEntries(
    Object.entries(block.bindings ?? {}).filter(([key]) => {
      const old = from.fields.find((f) => f.key === key),
        next = to.fields.find((f) => f.key === key);
      return old && next && bindingCompatible(old, next);
    }),
  );
  return {
    ...block,
    version: to.version,
    props,
    ...(block.bindings ? { bindings } : {}),
  };
}
export function newBlock(d: Definition): Block {
  return {
    id: id('block'),
    type: d.type,
    version: d.version,
    props: Object.fromEntries(
      d.fields.map((f) => [
        f.key,
        normalizeLists(
          f,
          structuredClone(d.defaults[f.key] ?? f.default ?? null),
        ),
      ]),
    ),
  };
}
export function validate(content: Content, definitions: Definition[]): Issue[] {
  const issues: Issue[] = [];
  const add = (
    path: string,
    message: string,
    phase: Issue['phase'] = 'structure',
  ) => issues.push({ path, message, phase });
  if (
    !object(content) ||
    !object(content.site) ||
    !['pages', 'entries', 'collections', 'media'].every((k) =>
      Array.isArray((content as any)[k]),
    )
  )
    return [
      {
        path: 'content',
        message: 'Invalid content structure.',
        phase: 'structure',
      },
    ];
  const ids = new Set<string>(),
    routes = new Set<string>();
  const records = [
    content.site,
    ...content.pages,
    ...content.entries,
    ...content.collections,
    ...content.media,
  ];
  for (const r of records) {
    if (
      !object(r) ||
      r.formatVersion !== 1 ||
      typeof r.id !== 'string' ||
      !/^[\w-]+$/.test(r.id)
    ) {
      add('content', 'Unsupported record or ID.');
      continue;
    }
    if (ids.has(r.id)) add(r.id, 'Duplicate record ID.');
    ids.add(r.id);
  }
  if (issues.length) return issues;
  const route = (p: unknown, where: string) => {
    if (typeof p !== 'string') add(where, 'URL paths must be text.');
    else if (!safePublicPath(p))
      add(where, 'Choose a valid public path.', 'publish');
    else {
      const normalized = p.replace(/\/$/, '') || '/';
      if (routes.has(normalized))
        add(where, 'This URL is already used.', 'publish');
      routes.add(normalized);
    }
  };
  const fields = (
    fs: Field[],
    values: Values,
    where: string,
    phase: Issue['phase'] = 'structure',
  ) => {
    if (!object(values)) {
      add(where, 'Field values must be an object.');
      return;
    }
    for (const f of fs) {
      const v = values[f.key];
      if (!compatible(f, v))
        add(
          `${where}.${f.key}`,
          `${f.label} has an incompatible value.`,
          phase,
        );
      if (
        f.required &&
        (blank(v) || (f.type === 'list' && Array.isArray(v) && v.length === 0))
      )
        add(`${where}.${f.key}`, `${f.label} is required.`, 'publish');
      if (f.type === 'list' && Array.isArray(f.fields) && Array.isArray(v)) {
        if (f.min !== undefined && v.length < f.min)
          add(
            `${where}.${f.key}`,
            `${f.label} needs at least ${f.min} items.`,
            'publish',
          );
        for (const [index, row] of v.entries())
          fields(f.fields, row as Values, `${where}.${f.key}.${index}`, phase);
      }
      if (f.collectionField && !blank(v)) {
        const col = content.collections.find(
          (c) => c.id === values[f.collectionField!.collectionKey],
        );
        const mapped = col?.fields.find((field) => field.key === v);
        if (!mapped || !f.collectionField.types.includes(mapped.type))
          add(
            `${where}.${f.key}`,
            `${f.label}: choose a compatible collection field.`,
            'publish',
          );
      }
      if (f.format === 'form-endpoint' && !blank(v) && !safeFormEndpoint(v))
        add(
          `${where}.${f.key}`,
          'Form endpoint must be an HTTP or HTTPS URL.',
          'publish',
        );
      if (
        (f.type === 'richtext' || f.widget === 'markdown') &&
        typeof v === 'string'
      ) {
        for (const destination of embeddedDestinations(v)) {
          const embed = embedDestination(destination);
          if (
            !embed ||
            (embed.kind === 'media' &&
              !content.media.some(
                (m) =>
                  m.id === embed.id && m.original?.mime?.startsWith('image/'),
              ))
          )
            add(
              `${where}.${f.key}`,
              'Choose an uploaded image or a valid YouTube video for embedded media.',
              'publish',
            );
        }
      }
      if (
        f.type === 'collection' &&
        !blank(v) &&
        !content.collections.some((c) => c.id === v)
      )
        add(`${where}.${f.key}`, 'Select an existing collection.', 'publish');
      if (
        f.type === 'media' &&
        !blank(v) &&
        object(v) &&
        !content.media.some(
          (m) => m.id === (v as Record<string, unknown>).mediaId,
        )
      )
        add(`${where}.${f.key}`, 'Select an existing media file.', 'publish');
    }
  };
  const blocks = (
    bs: Block[],
    where: string,
    kind: 'static' | 'generic',
    placement: 'page' | 'footer' = 'page',
  ) => {
    if (!Array.isArray(bs)) {
      add(where, 'Blocks must be an ordered list.');
      return;
    }
    const seen = new Set<string>();
    for (const b of bs) {
      if (
        !object(b) ||
        typeof b.id !== 'string' ||
        !/^[\w-]+$/.test(b.id) ||
        seen.has(b.id) ||
        typeof b.type !== 'string' ||
        !Number.isInteger(b.version) ||
        !object(b.props)
      ) {
        add(where, 'Invalid or duplicate block instance.');
        continue;
      }
      seen.add(b.id);
      const d = definitions.find(
        (d) => d.type === b.type && d.version === b.version,
      );
      if (!d) {
        add(
          `${where}.${b.id}`,
          'This block version is not installed. Its data is preserved.',
          'publish',
        );
        continue;
      }
      if ((d.placement ?? 'page') !== placement)
        add(
          `${where}.${b.id}`,
          `This block belongs in the ${d.placement ?? 'page'}.`,
          'publish',
        );
      if ((d.kind ?? 'static') !== kind)
        add(
          `${where}.${b.id}`,
          `This block is only available on ${d.kind ?? 'static'} pages.`,
          'publish',
        );
      if (
        b.bindings !== undefined &&
        (!object(b.bindings) ||
          Object.values(b.bindings).some((v) => typeof v !== 'string'))
      ) {
        add(
          `${where}.${b.id}`,
          'Bindings must map block field keys to schema field names.',
        );
        continue;
      }
      if (kind !== 'generic' && Object.keys(b.bindings ?? {}).length)
        add(
          `${where}.${b.id}`,
          'Only generic blocks can bind schema fields.',
          'publish',
        );
      for (const [key, source] of Object.entries(b.bindings ?? {})) {
        if (
          !d.fields.some((f) => f.key === key) ||
          !/^[a-zA-Z][\w]*$/.test(source)
        )
          add(
            `${where}.${b.id}.${key}`,
            'Choose an existing block field and a valid schema field key.',
            'publish',
          );
      }
      fields(
        d.fields.map((f) =>
          b.bindings?.[f.key] ? { ...f, required: false } : f,
        ),
        b.props,
        `${where}.${b.id}`,
      );
    }
  };
  function validateSchema(fs: Field[], where: string, depth = 0) {
    const keys = new Set<string>();
    for (const f of fs) {
      if (
        !object(f) ||
        !/^[a-zA-Z][\w]*$/.test(f.key) ||
        keys.has(f.key) ||
        typeof f.label !== 'string' ||
        ![
          'text',
          'url',
          'richtext',
          'number',
          'date',
          'toggle',
          'select',
          'media',
          ...(depth === 0 ? ['list'] : []),
        ].includes(f.type)
      ) {
        add(where, 'Invalid or duplicate field definition.');
        continue;
      }
      keys.add(f.key);
      if (
        (f.type === 'number' || f.type === 'list') &&
        ((f.min !== undefined && !Number.isFinite(f.min)) ||
          (f.max !== undefined && !Number.isFinite(f.max)) ||
          (f.min !== undefined && f.max !== undefined && f.min > f.max))
      )
        add(where, 'Invalid number limits.');
      if (f.type === 'list') {
        if (!Array.isArray(f.fields))
          add(where, 'List fields must define their item fields.');
        else validateSchema(f.fields, where + '.' + f.key, depth + 1);
      }
      if (
        f.type === 'select' &&
        (!Array.isArray(f.options) ||
          f.options.some(
            (o) =>
              !object(o) ||
              typeof o.value !== 'string' ||
              !o.value ||
              typeof o.label !== 'string',
          ) ||
          new Set(f.options.map((o) => o.value)).size !== f.options.length)
      )
        add(where, 'Select options must have unique values.');
      if (f.default !== undefined)
        fields(
          [{ ...f, required: false }],
          { [f.key]: f.default },
          where + '.default',
        );
    }
  }
  for (const c of content.collections) {
    if (!object(c)) continue;
    if (!safePublicPath(c.path))
      add(c.id, 'Choose a valid collection URL prefix.', 'publish');
    if (
      typeof c.name !== 'string' ||
      (c.genericPageId !== undefined && typeof c.genericPageId !== 'string') ||
      'template' in c ||
      !Array.isArray(c.fields)
    ) {
      add(c.id, 'Invalid collection definition.');
      continue;
    }
    validateSchema(c.fields, c.id);
    if (!c.fields.some((f) => f && f.key === c.titleField && f.type === 'text'))
      add(c.id, 'Choose a text field for entry titles.');
  }
  if (issues.some((i) => i.phase === 'structure')) return issues;
  for (const p of content.pages) {
    if (!object(p)) continue;
    if (!['static', 'generic'].includes(p.kind))
      add(p.id, 'Choose a static or generic page type.');
    if (p.kind === 'static') route(p.path, p.id);
    else if (p.path !== undefined)
      add(p.id, 'Generic pages cannot have a public URL path.');
    if (typeof p.title !== 'string') add(p.id, 'Page title must be text.');
    else if (!p.title.trim()) add(p.id, 'Page title is required.', 'publish');
    blocks(p.blocks, p.id, p.kind);
  }
  for (const c of content.collections) {
    if (!c.genericPageId) continue;
    const template = contentTemplate(content, c);
    if (!template) {
      add(c.id, 'Select an existing generic page.', 'publish');
      continue;
    }
    for (const b of Array.isArray(template.blocks) ? template.blocks : []) {
      const d = definitions.find(
        (d) => d.type === b?.type && d.version === b.version,
      );
      if (!d || !object(b.bindings)) continue;
      for (const [key, source] of Object.entries(b.bindings)) {
        const target = d.fields.find((f) => f.key === key);
        const field = c.fields.find((f) => f.key === source);
        if (!target || !field || !bindingCompatible(field, target))
          add(
            `${template.id}.${b.id}.${key}`,
            `${c.name}: binding "${source}" is missing or has an incompatible field type.`,
            'publish',
          );
      }
    }
  }
  for (const e of content.entries) {
    if (!object(e)) continue;
    const c = content.collections.find((c) => c.id === e.collectionId);
    if (!c) {
      add(e.id, 'Collection is missing.', 'publish');
      continue;
    }
    if (typeof e.slug !== 'string' || !/^[\w-]+$/.test(e.slug))
      add(e.id, 'Choose an entry slug.', 'publish');
    else if (contentTemplate(content, c)) route(entryPath(c, e), e.id);
    if (Array.isArray(c.fields)) fields(c.fields, e.values, e.id);
    const template = contentTemplate(content, c);
    if (template && object(e.values))
      for (const b of Array.isArray(template.blocks) ? template.blocks : []) {
        const d = definitions.find(
          (d) => d.type === b?.type && d.version === b.version,
        );
        if (
          d &&
          object(b.props) &&
          (b.bindings === undefined || object(b.bindings))
        ) {
          fields(
            d.fields
              .filter((f) => b.bindings?.[f.key])
              .map((f) => ({ ...f, required: false })),
            resolveBlock(b, e.values).props,
            `${e.id}.${b.id}`,
            'publish',
          );
        }
      }
    if ('blocks' in e)
      add(
        e.id,
        'Entries contain schema fields only. Legacy block content must be mapped explicitly before importing.',
      );
  }
  if (!object(content.site.globals))
    add('site.globals', 'Invalid shared settings.');
  else if (
    content.site.layout !== undefined &&
    (!object(content.site.layout) ||
      typeof content.site.layout.id !== 'string' ||
      !Number.isInteger(content.site.layout.version) ||
      !object(content.site.layout.settings))
  )
    add(
      'site.layout',
      'A layout needs an ID, installed version and settings object.',
    );
  else {
    const active = activeLayout(content.site);
    const definition = layoutDefinition(content.site);
    if (!definition)
      add(
        'site.layout',
        `Layout ${active.id}@${active.version} is not installed. Restore its retained implementation.`,
      );
    else {
      fields(definition.fields, active.settings, 'site.layout.settings');
      layoutPolicy(content.site)?.validate?.(active.settings, content, {
        fields,
        blocks,
        add,
      });
    }
  }
  for (const m of content.media) {
    if (!object(m) || !Array.isArray(m.variants) || !object(m.original)) {
      add('media', 'Invalid media record.');
      continue;
    }
    for (const f of [m.original, ...m.variants])
      if (
        !object(f) ||
        !/^https:\/\//.test(f.url) ||
        typeof f.key !== 'string' ||
        typeof f.mime !== 'string' ||
        !Number.isFinite(f.bytes) ||
        f.bytes < 0
      )
        add(m.id, 'Invalid media file metadata.');
  }
  if (object(content.site.globals)) {
    const settings: [string, (value: unknown) => boolean, string][] = [
      [
        'contentMaxWidth',
        validContentMaxWidth,
        'Content max-width must be a positive number in pixels.',
      ],
      [
        'pageGutter',
        validPageGutter,
        'Page gutter must be zero or a positive number in pixels.',
      ],
    ];
    for (const [key, valid, message] of settings) {
      if (
        content.site.globals[key] != null &&
        !valid(content.site.globals[key])
      )
        add(`site.globals.${key}`, message);
    }
  }
  if (!content.pages.some((p) => p.kind === 'static' && p.path === '/'))
    add('pages', 'Create a home page at /.', 'publish');
  return issues;
}
export function schemaChanges(before: Content, after: Content): Issue[] {
  const issues: Issue[] = [];
  for (const old of before.collections) {
    const next = after.collections.find((c) => c.id === old.id);
    const entries = before.entries.filter((e) => e.collectionId === old.id);
    if (!entries.length) continue;
    if (!next) {
      issues.push({
        path: old.id,
        message: 'Remove the entries before deleting this collection.',
        phase: 'structure',
      });
      continue;
    }
    for (const f of old.fields) {
      if (!entries.some((e) => !blank(e.values[f.key]))) continue;
      const nf = next.fields.find((x) => x.key === f.key);
      if (
        !nf ||
        nf.type !== f.type ||
        entries.some((e) => !compatible(nf, e.values[f.key])) ||
        (f.type === 'list' &&
          nf.type === 'list' &&
          f.fields.some(
            (child) =>
              entries.some(
                (e) =>
                  Array.isArray(e.values[f.key]) &&
                  (e.values[f.key] as Values[]).some(
                    (row) => !blank(row[child.key]),
                  ),
              ) &&
              !nf.fields.some(
                (next) => next.key === child.key && next.type === child.type,
              ),
          ))
      )
        issues.push({
          path: old.id + '.' + f.key,
          message:
            'This field contains content. Keep its key, type, and existing values compatible.',
          phase: 'structure',
        });
    }
  }
  return issues;
}
