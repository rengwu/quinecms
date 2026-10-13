import { initialLayout } from '../generated/site-config';
import { normalizeLists } from './lists';
import {
  layoutDefinition,
  layoutPolicy,
  layoutGlobals,
  layoutDefinitions,
  siteLayouts,
  contentForLayout,
  contentForPage,
  migrateSite,
} from './layouts';
import { entryPath } from './routes';
export { entryPath } from './routes';
import {
  bindingCompatible,
  bindingShape,
  bindingSource,
  bindingValid,
  resolveBlock,
} from './bindings';
import {
  emptyModel,
  objectFields,
  rowFields,
  schemaIssues,
  incomingUsage,
  definitionUses,
  collectionUses,
  resolvePath,
  entryLabel,
  hasValue,
  type Model,
} from './schema';
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
  /^content\/(?:site\.json|(?:pages|collections|objects|media)\/[\w-]+\.json|entries\/[\w-]+\/[\w-]+\.json)$/.test(
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
    ['objects', c.objects],
    ['media', c.media],
  ] as const)
    for (const r of records)
      files[`content/${kind}/${r.id}.json`] = serialize(r);
  for (const r of c.entries)
    files[`content/entries/${r.collectionId}/${r.id}.json`] = serialize(r);
  return files;
}
/** A fresh site draft; retain its identity so it can replace the saved snapshot. */
export function factoryReset(content: Content): Content {
  const starting = layoutDefinitions.find(
    (layout) =>
      layout.id === initialLayout.id &&
      layout.version === initialLayout.version,
  );
  if (!starting)
    throw Error(
      'Install the configured initial layout before resetting the site.',
    );
  return migrateSite({
    site: {
      formatVersion: 1,
      id: content.site.id,
      globals: {},
      layout: {
        id: starting.id,
        version: starting.version,
        settings: structuredClone(starting.defaults),
      },
    },
    pages: [],
    collections: [],
    objects: [],
    entries: [],
    media: [],
  });
}
export function parseFiles(files: Record<string, string>): Content {
  const c: Content = {
    site: null as unknown as Content['site'],
    pages: [],
    collections: [],
    objects: [],
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
        'pages' | 'collections' | 'objects' | 'entries' | 'media';
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
  const owner = c.pages.find((page) =>
    page.blocks.some((block) => block.id === instanceId),
  );
  if (!c.site.layout && owner) c = contentForPage(c, owner);
  const block =
    c.pages.flatMap((p) => p.blocks).find((b) => b.id === instanceId) ??
    (c.site.footer?.id === instanceId ? c.site.footer : undefined);
  const mappedKeys = [
    'titleField',
    'summaryField',
    'imageField',
    'dateField',
    'urlField',
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
          title: entryLabel(e, c),
          ...(block?.props.collection === col.id
            ? {
                values: Object.fromEntries(
                  mappedKeys.map((key) => [
                    key,
                    resolvePath(
                      key,
                      { fields: col.fields, values: e.values },
                      c,
                    )?.value ?? null,
                  ]),
                ),
              }
            : {}),
          ...(contentTemplate(c, col) && entryPath(col, e)
            ? { url: entryPath(col, e) }
            : {}),
        })),
    })),
    links: Object.fromEntries([
      ...c.pages.filter((p) => p.kind === 'static').map((p) => [p.id, p.path!]),
      ...c.entries.flatMap((e) => {
        const col = c.collections.find((x) => x.id === e.collectionId);
        const path = col && contentTemplate(c, col) && entryPath(col, e);
        return path ? [[e.id, path]] : [];
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
export function compatible(
  f: Field,
  v: unknown,
  model: Model = emptyModel,
  depth = 0,
): boolean {
  if (depth > 4) return false;
  if (!f || typeof f !== 'object') return false;
  if (blank(v)) return true;
  switch (f.type) {
    case 'url':
      return safeURL(v);
    case 'reference':
      return typeof v === 'string' && /^[\w-]+$/.test(v);
    case 'object':
      return (
        object(v) &&
        objectFields(f, model).every((child) =>
          compatible(child, v[child.key], model, depth + 1),
        )
      );
    case 'array':
      if (!Array.isArray(v) || (f.max !== undefined && v.length > f.max))
        return false;
      if (f.of?.type === 'reference')
        return (
          v.every((id) => typeof id === 'string' && /^[\w-]+$/.test(id)) &&
          new Set(v).size === v.length
        );
      if (f.of?.type !== 'object') return false;
      return compatible(
        { ...f, type: 'list', fields: objectFields(f.of, model) },
        v,
        model,
        depth,
      );
    case 'list':
      return (
        Array.isArray(v) &&
        Array.isArray(f.fields) &&
        (f.max === undefined || v.length <= f.max) &&
        v.every(
          (row) =>
            object(row) &&
            f.fields.every((child) =>
              compatible(child, row[child.key], model, depth + 1),
            ),
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
  let unusedLayout = false;
  let layoutPath: string | undefined;
  const add = (
    path: string,
    message: string,
    phase: Issue['phase'] = 'structure',
  ) => {
    if (unusedLayout && phase === 'publish') return;
    issues.push({
      path: layoutPath
        ? path.replace(/^site\.layout\.settings/, layoutPath)
        : path,
      message,
      phase,
    });
  };
  if (
    !object(content) ||
    !object(content.site) ||
    !['pages', 'entries', 'collections', 'objects', 'media'].every((k) =>
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
    ...content.objects,
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
  if (content.site.layouts !== undefined) {
    if (content.site.layout !== undefined)
      add('site.layout', 'Store layout instances in site.layouts only.');
    if (!Array.isArray(content.site.layouts)) {
      add('site.layouts', 'Site layouts must be a list.');
      return issues;
    }
    for (const [index, layout] of content.site.layouts.entries()) {
      const path = `site.layouts[${index}]`;
      if (
        !object(layout) ||
        typeof layout.id !== 'string' ||
        !/^[\w-]+$/.test(layout.id) ||
        typeof layout.name !== 'string' ||
        !layout.name.trim() ||
        typeof layout.active !== 'boolean' ||
        !object(layout.design) ||
        typeof layout.design.id !== 'string' ||
        !Number.isInteger(layout.design.version) ||
        layout.design.version < 1 ||
        !object(layout.design.settings)
      ) {
        add(
          path,
          'A site layout needs an ID, name, active state and design with version and settings.',
        );
        continue;
      }
      if (ids.has(layout.id)) add(path, 'Duplicate record ID.');
      ids.add(layout.id);
    }
    if (!content.site.layouts.some((layout) => layout?.active === true))
      add('site.layouts', 'At least one layout must stay active.');
    for (const page of content.pages) {
      if (
        !content.site.layouts.some(
          (layout) => layout?.id === page.layoutId && layout.active === true,
        )
      )
        add(`${page.id}.layoutId`, 'Choose an existing active site layout.');
    }
  } else if (
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
      if (!compatible(f, v, content))
        add(
          `${where}.${f.key}`,
          `${f.label} has an incompatible value.`,
          phase,
        );
      if (
        f.required &&
        (blank(v) ||
          ((f.type === 'list' || f.type === 'array') &&
            Array.isArray(v) &&
            v.length === 0))
      )
        add(`${where}.${f.key}`, `${f.label} is required.`, 'publish');
      if (f.type === 'object' && object(v))
        fields(
          objectFields(f, content),
          v as Values,
          `${where}.${f.key}`,
          phase,
        );
      const children = rowFields(f, content);
      if ((f.type === 'array' || f.type === 'list') && Array.isArray(v)) {
        if (f.min !== undefined && v.length < f.min)
          add(
            `${where}.${f.key}`,
            `${f.label} needs at least ${f.min} items.`,
            'publish',
          );
        if (children)
          for (const [index, row] of v.entries())
            fields(
              children,
              row as Values,
              `${where}.${f.key}.${index}`,
              phase,
            );
      }
      const reference =
        f.type === 'reference'
          ? f
          : f.type === 'array' && f.of.type === 'reference'
            ? f.of
            : undefined;
      if (reference)
        for (const target of Array.isArray(v) ? v : blank(v) ? [] : [v]) {
          if (
            !content.entries.some(
              (e) =>
                e.id === target && e.collectionId === reference.collectionId,
            )
          )
            add(
              `${where}.${f.key}`,
              'Select an existing entry from the target collection.',
              'publish',
            );
        }
      if (f.collectionField && !blank(v)) {
        const col = content.collections.find(
          (c) => c.id === values[f.collectionField!.collectionKey],
        );
        const mapped =
          col && typeof v === 'string'
            ? resolvePath(v, { fields: col.fields, values: {} }, content)?.field
            : undefined;
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
          Object.values(b.bindings).some((v) => !bindingShape(v)))
      ) {
        add(
          `${where}.${b.id}`,
          'Bindings must use valid forward paths or typed array projections.',
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
        if (!d.fields.some((f) => f.key === key) || !bindingShape(source))
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
  issues.push(...schemaIssues(content));
  for (const c of content.collections) {
    if (!object(c)) continue;
    if (c.genericPageId && !safePublicPath(c.path))
      add(
        c.id,
        c.mode === 'single'
          ? 'Choose a valid public path.'
          : 'Choose a valid collection URL prefix.',
        'publish',
      );
    if (
      typeof c.name !== 'string' ||
      !['many', 'single'].includes(c.mode) ||
      (c.path !== undefined && typeof c.path !== 'string') ||
      (c.genericPageId !== undefined && typeof c.genericPageId !== 'string') ||
      'template' in c ||
      !Array.isArray(c.fields)
    ) {
      add(c.id, 'Invalid collection definition.');
      continue;
    }
    if (
      c.mode === 'single' &&
      content.entries.filter((e) => e.collectionId === c.id).length !== 1
    )
      add(c.id, 'A single-entry collection must contain exactly one entry.');
    if (!c.fields.some((f) => f && f.key === c.titleField && f.type === 'text'))
      add(c.id, 'Choose a text field for entry titles.');
  }
  if (issues.some((i) => i.phase === 'structure')) return issues;
  const defaults = (fs: Field[], where: string, depth = 0) => {
    if (depth > 3) return;
    for (const f of fs) {
      if (f.default !== undefined)
        fields(
          [{ ...f, required: false }],
          { [f.key]: f.default },
          where + '.default',
        );
      const children =
        f.type === 'object' ? objectFields(f, content) : rowFields(f, content);
      if (children) defaults(children, where + '.' + f.key, depth + 1);
    }
  };
  for (const o of content.objects) defaults(o.fields, o.id);
  for (const c of content.collections) defaults(c.fields, c.id);
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
        if (
          !target ||
          !bindingValid(
            source,
            target,
            { fields: c.fields, values: {} },
            content,
          )
        )
          add(
            `${template.id}.${b.id}.${key}`,
            `${c.name}: binding "${bindingSource(source)}" is missing or has an incompatible field type.`,
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
    if (contentTemplate(content, c)) {
      if (
        c.mode === 'many' &&
        (typeof e.slug !== 'string' || !/^[\w-]+$/.test(e.slug))
      )
        add(e.id, 'Choose an entry slug.', 'publish');
      else if (c.path) route(entryPath(c, e), e.id);
    }
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
            resolveBlock(b, e.values, content, c.fields).props,
            `${e.id}.${b.id}`,
            'publish',
          );
        }
      }
    if ('blocks' in e) add(e.id, 'Entries contain schema fields only.');
  }
  if (!object(content.site.globals))
    add('site.globals', 'Invalid shared settings.');
  else
    for (const [index, layout] of siteLayouts(content.site).entries()) {
      const view = contentForLayout(content, layout.design);
      const definition = layoutDefinition(view.site);
      const path = content.site.layouts
        ? `site.layouts[${index}].design.settings`
        : content.site.layout
          ? 'site.layout.settings'
          : 'site.globals';
      const used = content.site.layouts
        ? content.pages.some((page) => page.layoutId === layout.id)
        : content.pages.length > 0;
      unusedLayout = !used;
      layoutPath = content.site.layouts ? path : undefined;
      if (!definition)
        add(
          path,
          `Layout ${layout.design.id}@${layout.design.version} is not installed. Restore its retained implementation.`,
        );
      else {
        fields(definition.fields, layout.design.settings, path);
        // Preserve the legacy policy's paths only while validating that old format.
        layoutPolicy(view.site)?.validate?.(
          layout.design.settings,
          content.site.layouts ? view : content,
          { fields, blocks, add },
        );
      }
      const rules: [string, (value: unknown) => boolean, string][] = [
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
      for (const [key, valid, message] of rules)
        if (
          layout.design.settings[key] != null &&
          !valid(layout.design.settings[key])
        )
          add(`${path}.${key}`, message);
      unusedLayout = false;
      layoutPath = undefined;
    }
  for (const m of content.media) {
    if (!object(m) || !Array.isArray(m.variants) || !object(m.original)) {
      add('media', 'Invalid media record.');
      continue;
    }
    for (const f of [m.original, ...m.variants])
      if (
        !object(f) ||
        !safeURL(f.url) ||
        !/^(https:\/\/|\/(?!\/))/.test(f.url) ||
        typeof f.key !== 'string' ||
        typeof f.mime !== 'string' ||
        !Number.isFinite(f.bytes) ||
        f.bytes < 0
      )
        add(m.id, 'Invalid media file metadata.');
  }
  if (!content.pages.some((p) => p.kind === 'static' && p.path === '/'))
    add('pages', 'Create a home page at /.', 'publish');
  return issues;
}
export function schemaChanges(before: Content, after: Content): Issue[] {
  const issues: Issue[] = [];
  const add = (path: string, message: string) =>
    issues.push({ path, message, phase: 'structure' as const });
  const uses = incomingUsage(after);
  for (const entry of before.entries)
    if (!after.entries.some((e) => e.id === entry.id)) {
      for (const use of uses.get(entry.id) ?? [])
        add(
          use.path,
          `Remove the reference from ${use.label} before deleting this entry.`,
        );
    }
  for (const old of before.collections)
    if (!after.collections.some((c) => c.id === old.id)) {
      if (after.entries.some((e) => e.collectionId === old.id))
        add(old.id, 'Remove the entries before deleting this collection.');
      for (const use of collectionUses(after, old.id))
        add(use.path, `This collection is a reference target in ${use.label}.`);
    }
  for (const old of before.objects)
    if (!after.objects.some((o) => o.id === old.id)) {
      for (const use of definitionUses(after, old.id))
        add(use.path, `This object definition is used by ${use.label}.`);
    }
  function compare(
    fs: Field[],
    next: Field[],
    values: Values,
    where: string,
    depth = 0,
  ) {
    if (!object(values) || depth > 3) return;
    for (const f of fs) {
      const value = values[f.key];
      if (!hasValue(value)) continue;
      const nf = next.find((n) => n.key === f.key);
      const path = `${where}.${f.key}`;
      if (
        !nf ||
        nf.type !== f.type ||
        !compatible(nf, value, after) ||
        (f.type === 'reference' &&
          nf.type === 'reference' &&
          f.collectionId !== nf.collectionId) ||
        (f.type === 'array' &&
          nf.type === 'array' &&
          (f.of.type !== nf.of.type ||
            (f.of.type === 'reference' &&
              nf.of.type === 'reference' &&
              f.of.collectionId !== nf.of.collectionId)))
      ) {
        add(
          path,
          'This field contains content. Keep its key, type, and existing values compatible.',
        );
        continue;
      }
      if (f.type === 'object' && nf.type === 'object')
        compare(
          objectFields(f, before),
          objectFields(nf, after),
          value as Values,
          path,
          depth + 1,
        );
      const oldFields = rowFields(f, before),
        newFields = rowFields(nf, after);
      if (oldFields && newFields && Array.isArray(value))
        value.forEach((row, i) =>
          compare(
            oldFields,
            newFields,
            row as Values,
            `${path}[${i}]`,
            depth + 1,
          ),
        );
    }
  }
  for (const entry of after.entries) {
    const old = before.collections.find((c) => c.id === entry.collectionId),
      next = after.collections.find((c) => c.id === entry.collectionId);
    if (old && next) compare(old.fields, next.fields, entry.values, entry.id);
  }
  function compareDefaults(
    old: Field[],
    next: Field[],
    where: string,
    depth = 0,
  ) {
    if (depth > 3) return;
    for (const f of next) {
      const previous = old.find((o) => o.key === f.key);
      if (!previous) continue;
      if (hasValue(f.default))
        compare(
          [previous],
          [f],
          { [f.key]: f.default! },
          where + '.default',
          depth,
        );
      const a =
        previous.type === 'object'
          ? objectFields(previous, before)
          : rowFields(previous, before);
      const b =
        f.type === 'object' ? objectFields(f, after) : rowFields(f, after);
      if (a && b) compareDefaults(a, b, `${where}.${f.key}`, depth + 1);
    }
  }
  for (const next of [...after.collections, ...after.objects]) {
    const old = [...before.collections, ...before.objects].find(
      (o) => o.id === next.id,
    );
    if (old) compareDefaults(old.fields, next.fields, next.id);
  }
  return issues;
}
