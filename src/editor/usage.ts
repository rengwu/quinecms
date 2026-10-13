import type { Content, Field } from '../core/types';
import { isRecord, objectFields, rowFields, type Usage } from '../core/schema';
import {
  activeLayout,
  layoutDefinition,
  contentForLayout,
} from '../core/layouts';
import { definitions } from '../generated/definitions';

export type UsageTarget =
  | { area: 'layout'; id?: string }
  | { area: 'pages' | 'content'; id: string; blockId?: string }
  | { area: 'collections' | 'objects'; id: string };

const words = (key: string) => {
  const text = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Resolve stored paths to the labels and row names people see in the editor. */
function location(
  path: string,
  fields: Field[],
  value: unknown,
  content: Content,
  defaultValue = false,
): string[] {
  const labels: string[] = [];
  for (const token of path.match(/[^.[\]]+/g) ?? []) {
    if (defaultValue && token === 'default') continue;
    if (
      token === 'props' &&
      isRecord(value) &&
      typeof value.type === 'string'
    ) {
      const block = value;
      fields =
        definitions.find(
          (d) => d.type === block.type && d.version === block.version,
        )?.fields ?? [];
      value = value.props;
      continue;
    }
    if (Array.isArray(value)) {
      const index = /^\d+$/.test(token)
        ? Number(token)
        : value.findIndex((row) => isRecord(row) && row._rowId === token);
      value = value[index];
      const name = isRecord(value)
        ? [value.label, value.title, value.name, value.question].find(
            (v) => typeof v === 'string' && v.trim(),
          )
        : undefined;
      labels.push(
        typeof name === 'string'
          ? name
          : index < 0
            ? 'Item'
            : `Item ${index + 1}`,
      );
      continue;
    }
    const field = fields.find((f) => f.key === token);
    value = (isRecord(value) ? value[token] : undefined) ?? field?.default;
    if (!(
      token === 'to' &&
      !field &&
      isRecord(value) &&
      (value.kind === 'page' || value.kind === 'entry')
    ))
      labels.push(field?.label || words(token));
    fields = field
      ? field.type === 'object'
        ? objectFields(field, content)
        : (rowFields(field, content) ?? [])
      : [];
  }
  return labels;
}

export function describeUsage(
  content: Content,
  use: Usage,
): { title: string; location: string; target?: UsageTarget } {
  const saved = content.site.layouts?.find(
    (layout) => layout.id === use.ownerId,
  );
  if (saved || use.ownerId === content.site.id) {
    const layout = saved?.design ?? activeLayout(content.site);
    let path = saved
      ? use.path.replace(/^settings\.?/, '')
      : use.path.replace(/^site\.(?:layout\.settings\.)?/, '');
    let fields =
      layoutDefinition(contentForLayout(content, layout).site)?.fields ?? [];
    let value: unknown = layout.settings;
    const prefix: string[] = [];
    return {
      title: saved?.name ?? 'Site Layout',
      location: [...prefix, ...location(path, fields, value, content)].join(
        ' › ',
      ),
      target: { area: 'layout', id: saved?.id },
    };
  }
  const page = content.pages.find((p) => p.id === use.ownerId);
  if (page) {
    if (use.path === 'layoutId')
      return {
        title: page.title || 'Untitled page',
        location: 'Pages › Site layout',
        target: { area: 'pages', id: page.id },
      };
    const match = /^blocks\[(\d+)\](?:\.props)?\.?/.exec(use.path);
    const block = match ? page.blocks[Number(match[1])] : undefined;
    const definition = definitions.find(
      (d) => d.type === block?.type && d.version === block.version,
    );
    return {
      title: page.title || 'Untitled page',
      location: [
        'Pages',
        definition?.label ?? 'Block',
        ...location(
          match ? use.path.slice(match[0].length) : '',
          definition?.fields ?? [],
          block?.props,
          content,
        ),
      ].join(' › '),
      target: { area: 'pages', id: page.id, blockId: block?.id },
    };
  }
  const entry = content.entries.find((e) => e.id === use.ownerId);
  if (entry) {
    const collection = content.collections.find(
      (c) => c.id === entry.collectionId,
    );
    return {
      title: String(
        entry.values[collection?.titleField ?? 'title'] ||
          entry.slug ||
          'Untitled entry',
      ),
      location: [
        'Content',
        collection?.name || 'Collection',
        ...location(
          use.path.replace(/^values\./, ''),
          collection?.fields ?? [],
          entry.values,
          content,
        ),
      ].join(' › '),
      target: { area: 'content', id: entry.id },
    };
  }
  const schema = [...content.collections, ...content.objects].find(
    (s) => s.id === use.ownerId,
  );
  if (schema) {
    const area = 'mode' in schema ? 'collections' : 'objects';
    return {
      title: schema.name || 'Untitled schema',
      location: [
        'Schemas',
        area === 'collections' ? 'Collections' : 'Objects',
        ...location(
          use.path.slice(schema.id.length + 1),
          schema.fields,
          {},
          content,
          use.label === `${schema.name} default`,
        ),
        ...(use.path.includes('.default.') ? ['Default value'] : []),
      ].join(' › '),
      target: { area, id: schema.id },
    };
  }
  return {
    title: 'Unavailable content',
    location: 'Reference location unavailable',
  };
}
