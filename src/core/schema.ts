import type {
  ArrayItem,
  Content,
  Entry,
  Field,
  Issue,
  Json,
  ObjectShape,
  Values,
} from './types';

export type Model = Pick<Content, 'objects' | 'collections' | 'entries'>;
export const emptyModel: Model = { objects: [], collections: [], entries: [] };
export const ownedDepth = 3;
export const pathLimit = 12;
export const isRecord = (v: unknown): v is Values =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export const isEmpty = (v: unknown) =>
  v == null || (typeof v === 'string' && !v.trim());
export const hasValue = (v: unknown): boolean =>
  !isEmpty(v) && (!Array.isArray(v) || v.length > 0);

export function objectFields(
  shape: ObjectShape,
  model: Model = emptyModel,
): Field[] {
  return shape.objectId !== undefined
    ? (model.objects.find((o) => o.id === shape.objectId)?.fields ?? [])
    : Array.isArray(shape.fields)
      ? shape.fields
      : [];
}
export function rowFields(
  field: Field,
  model: Model = emptyModel,
): Field[] | undefined {
  return field.type === 'list'
    ? field.fields
    : field.type === 'array' && field.of.type === 'object'
      ? objectFields(field.of, model)
      : undefined;
}
export function entryLabel(entry: Entry, model: Model): string {
  const collection = model.collections.find((c) => c.id === entry.collectionId);
  return String(
    entry.values[collection?.titleField ?? 'title'] || entry.slug || entry.id,
  );
}

// A named definition is expanded only along its ownership path. References are leaves.
export function schemaIssues(model: Model): Issue[] {
  const issues: Issue[] = [];
  const add = (path: string, message: string) =>
    issues.push({ path, message, phase: 'structure' as const });
  function shape(
    shape: ObjectShape,
    where: string,
    depth: number,
    stack: string[],
  ) {
    if (depth > ownedDepth) {
      add(where, 'At most three owned object/list levels are supported.');
      return;
    }
    if (shape.objectId !== undefined) {
      if (shape.fields !== undefined)
        add(where, 'Choose either a named object or inline fields.');
      const definition = model.objects.find((o) => o.id === shape.objectId);
      if (!definition) {
        add(where, 'Choose an existing object definition.');
        return;
      }
      if (stack.includes(definition.id)) {
        add(
          where,
          `Recursive object definition: ${[...stack, definition.id].join(' → ')}.`,
        );
        return;
      }
      fields(definition.fields, where, depth, [...stack, definition.id]);
    } else if (Array.isArray(shape.fields))
      fields(shape.fields, where, depth, stack);
    else add(where, 'An object needs inline fields or a named definition.');
  }
  function reference(item: { collectionId: string }, where: string) {
    if (!model.collections.some((c) => c.id === item.collectionId))
      add(where, 'Choose an existing target collection.');
  }
  function fields(fs: Field[], where: string, depth: number, stack: string[]) {
    if (!Array.isArray(fs)) {
      add(where, 'Fields must be a list.');
      return;
    }
    const keys = new Set<string>();
    for (const f of fs) {
      if (
        !f ||
        typeof f !== 'object' ||
        !/^[a-zA-Z]\w*$/.test(f.key) ||
        keys.has(f.key) ||
        typeof f.label !== 'string'
      ) {
        add(where, 'Fields need a unique key and a label.');
        continue;
      }
      keys.add(f.key);
      const path = `${where}.${f.key}`;
      if (f.required !== undefined && typeof f.required !== 'boolean')
        add(path, 'Required must be true or false.');
      if (
        ![
          'text',
          'url',
          'richtext',
          'number',
          'date',
          'toggle',
          'select',
          'media',
          'object',
          'array',
          'reference',
        ].includes(f.type)
      ) {
        add(path, 'Unsupported content field type.');
        continue;
      }
      if (f.type === 'object') shape(f, path, depth + 1, stack);
      if (f.type === 'reference') reference(f, path);
      if (f.type === 'array') {
        if (f.of?.type === 'object') shape(f.of, path, depth + 1, stack);
        else if (f.of?.type === 'reference') reference(f.of, path);
        else
          add(path, 'An array needs one object shape or one reference target.');
      }
      if (f.type === 'number' || f.type === 'array') {
        for (const bound of [f.min, f.max])
          if (
            bound !== undefined &&
            (!Number.isFinite(bound) ||
              (f.type === 'array' && (!Number.isInteger(bound) || bound < 0)))
          )
            add(path, 'Invalid field limits.');
        if (f.min !== undefined && f.max !== undefined && f.min > f.max)
          add(path, 'Minimum cannot exceed maximum.');
      }
      if (
        f.type === 'select' &&
        (!Array.isArray(f.options) ||
          f.options.some(
            (o) =>
              !o ||
              typeof o.value !== 'string' ||
              !o.value ||
              typeof o.label !== 'string',
          ) ||
          new Set(f.options.map((o) => o.value)).size !== f.options.length)
      )
        add(path, 'Select options need unique nonempty values.');
    }
  }
  for (const o of model.objects) {
    if (typeof o.name !== 'string')
      add(o.id, 'Object definitions need a name.');
    fields(o.fields, o.id, 0, [o.id]);
  }
  for (const c of model.collections) fields(c.fields, c.id, 0, []);
  return issues;
}

export interface ValueUse {
  field: Field;
  value: Json | undefined;
  path: string;
}
export function walkValues(
  fields: Field[],
  values: Values,
  model: Model,
  visit: (use: ValueUse) => void,
  path = '',
  depth = 0,
) {
  if (!isRecord(values) || depth > ownedDepth) return;
  for (const field of fields) {
    const value = values[field.key],
      at = path ? `${path}.${field.key}` : field.key;
    visit({ field, value, path: at });
    if (field.type === 'object' && isRecord(value))
      walkValues(
        objectFields(field, model),
        value,
        model,
        visit,
        at,
        depth + 1,
      );
    const children = rowFields(field, model);
    if (children && Array.isArray(value))
      value.forEach((row, i) => {
        if (isRecord(row))
          walkValues(
            children,
            row,
            model,
            visit,
            `${at}[${String(row._rowId ?? i)}]`,
            depth + 1,
          );
      });
    if (
      field.type === 'array' &&
      field.of.type === 'reference' &&
      Array.isArray(value)
    )
      value.forEach((v, i) =>
        visit({
          field: { ...field.of, key: field.key, label: field.label },
          value: v,
          path: `${at}[${i}]`,
        }),
      );
  }
}

export interface Usage {
  ownerId: string;
  path: string;
  label: string;
}
export function incomingUsage(content: Content): Map<string, Usage[]> {
  const index = new Map<string, Usage[]>();
  const add = (target: string, use: Usage) =>
    index.set(target, [...(index.get(target) ?? []), use]);
  for (const entry of content.entries) {
    const col = content.collections.find((c) => c.id === entry.collectionId);
    if (col)
      walkValues(
        col.fields,
        entry.values,
        content,
        ({ field, value, path }) => {
          if (field.type === 'reference' && typeof value === 'string' && value)
            add(value, {
              ownerId: entry.id,
              label: entryLabel(entry, content),
              path,
            });
        },
      );
  }
  function defaults(
    fields: Field[],
    ownerId: string,
    label: string,
    path: string,
  ) {
    for (const field of fields) {
      if (field.default !== undefined)
        walkValues(
          [field],
          { [field.key]: field.default },
          content,
          (use) => {
            if (
              use.field.type === 'reference' &&
              typeof use.value === 'string' &&
              use.value
            )
              add(use.value, {
                ownerId,
                label: `${label} default`,
                path: use.path,
              });
          },
          `${path}.default`,
        );
      const shape =
        field.type === 'object'
          ? field
          : field.type === 'array' && field.of?.type === 'object'
            ? field.of
            : undefined;
      if (shape?.fields)
        defaults(shape.fields, ownerId, label, `${path}.${field.key}`);
    }
  }
  for (const record of [...content.collections, ...content.objects])
    defaults(record.fields, record.id, record.name, record.id);
  // Internal links are explicit tagged values. Text and external URLs are never interpreted as references.
  function links(value: unknown, ownerId: string, path: string) {
    if (Array.isArray(value))
      return value.forEach((v, i) => links(v, ownerId, `${path}[${i}]`));
    if (!isRecord(value)) return;
    if (
      (value.kind === 'entry' || value.kind === 'page') &&
      typeof value.id === 'string'
    )
      add(value.id, { ownerId, label: ownerId, path });
    for (const [key, child] of Object.entries(value))
      links(child, ownerId, `${path}.${key}`);
  }
  links(content.site, content.site.id, 'site');
  for (const page of content.pages) links(page.blocks, page.id, 'blocks');
  for (const entry of content.entries) links(entry.values, entry.id, 'values');
  return index;
}

export function definitionUses(model: Model, objectId: string): Usage[] {
  const uses: Usage[] = [];
  function scan(
    fs: Field[],
    ownerId: string,
    label: string,
    path: string,
    stack: string[],
  ) {
    for (const f of fs) {
      const at = `${path}.${f.key}`;
      const shape =
        f.type === 'object'
          ? f
          : f.type === 'array' && f.of?.type === 'object'
            ? f.of
            : undefined;
      if (!shape) continue;
      if (shape.objectId === objectId) uses.push({ ownerId, label, path: at });
      if (shape.objectId && stack.includes(shape.objectId)) continue;
      scan(
        objectFields(shape, model),
        ownerId,
        label,
        at,
        shape.objectId ? [...stack, shape.objectId] : stack,
      );
    }
  }
  for (const c of model.collections) scan(c.fields, c.id, c.name, c.id, []);
  for (const o of model.objects) scan(o.fields, o.id, o.name, o.id, [o.id]);
  return uses;
}
export function collectionUses(model: Model, collectionId: string): Usage[] {
  const uses: Usage[] = [];
  function scan(fs: Field[], ownerId: string, label: string, path: string) {
    for (const f of fs) {
      const at = `${path}.${f.key}`;
      if (
        (f.type === 'reference' && f.collectionId === collectionId) ||
        (f.type === 'array' &&
          f.of?.type === 'reference' &&
          f.of.collectionId === collectionId)
      )
        uses.push({ ownerId, label, path: at });
      const shape =
        f.type === 'object'
          ? f
          : f.type === 'array' && f.of?.type === 'object'
            ? f.of
            : undefined;
      if (shape?.fields) scan(shape.fields, ownerId, label, at);
    }
  }
  for (const c of model.collections) scan(c.fields, c.id, c.name, c.id);
  for (const o of model.objects) scan(o.fields, o.id, o.name, o.id);
  return uses;
}

export interface Scope {
  fields: Field[];
  values: Values;
}
export function referenceScope(
  item: { collectionId: string },
  value: unknown,
  model: Model,
): Scope | undefined {
  const collection = model.collections.find((c) => c.id === item.collectionId);
  if (!collection) return;
  const entry = model.entries.find(
    (e) => e.id === value && e.collectionId === item.collectionId,
  );
  return { fields: collection.fields, values: entry?.values ?? {} };
}
export function itemScope(
  item: ArrayItem,
  value: unknown,
  model: Model,
): Scope | undefined {
  return item.type === 'reference'
    ? referenceScope(item, value, model)
    : {
        fields: objectFields(item, model),
        values: isRecord(value) ? value : {},
      };
}
export function resolvePath(
  path: string,
  scope: Scope,
  model: Model,
): { field: Field; value: Json | undefined } | undefined {
  const parts = path.split('.');
  if (parts.length > pathLimit || !parts.every((p) => /^[a-zA-Z]\w*$/.test(p)))
    return;
  let current = scope;
  for (let i = 0; i < parts.length; i++) {
    const field = current.fields.find((f) => f.key === parts[i]);
    if (!field) return;
    const value = current.values[field.key];
    if (i === parts.length - 1) return { field, value };
    if (field.type === 'object')
      current = {
        fields: objectFields(field, model),
        values: isRecord(value) ? value : {},
      };
    else if (field.type === 'reference') {
      const next = referenceScope(field, value, model);
      if (!next) return;
      current = next;
    } else return;
  }
}
export function fieldPaths(
  fields: Field[],
  model: Model,
  prefix = '',
  seen: string[] = [],
  depth = 0,
): { path: string; field: Field }[] {
  if (depth >= pathLimit) return [];
  return fields.flatMap((field) => {
    const path = prefix ? `${prefix}.${field.key}` : field.key;
    let nested: Field[] = [];
    let marker = '';
    if (field.type === 'object') {
      marker = `object:${field.objectId ?? path}`;
      nested = objectFields(field, model);
    }
    if (field.type === 'reference') {
      marker = `reference:${field.collectionId}`;
      nested =
        model.collections.find((c) => c.id === field.collectionId)?.fields ??
        [];
    }
    return [
      { path, field },
      ...(!seen.includes(marker)
        ? fieldPaths(nested, model, path, [...seen, marker], depth + 1)
        : []),
    ];
  });
}
