import { object, validate } from '../core/content';
import { definitions } from '../generated/definitions';
import type { Content, Snapshot } from '../core/types';
import type { Repository } from '../integrations/github';
export interface Recovery {
  version: 1;
  repository: Repository;
  base: Snapshot | null;
  content: Content;
}
export const recoveryKey = 'lean-sitebuilder:recovery:v2';
export function readRecovery(): Recovery | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(recoveryKey) ?? 'null');
    if (
      value?.version !== 1 ||
      !value.repository ||
      !['owner', 'repo', 'branch'].every(
        (k) => typeof value.repository[k] === 'string',
      )
    )
      return null;
    if (!editableShape(value.content)) return null;
    if (
      value.base &&
      (!value.base.sha ||
        !value.base.treeSha ||
        !value.base.files ||
        !value.base.sourceFiles ||
        validate(value.base.content, definitions).some(
          (i) => i.phase === 'structure',
        ))
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function retain(value: Recovery) {
  sessionStorage.setItem(recoveryKey, JSON.stringify(value));
}
export function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + '\n'], {
      type: 'application/json',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function digest(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
    ),
  )
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
}

// Recovery may contain unfinished schema edits that Save rightly rejects.
// Check renderable shape here, not publication/structural validity of those edits.
function editableShape(c: unknown): c is Content {
  if (
    !object(c) ||
    !object(c.site) ||
    !object(c.site.globals) ||
    !['pages', 'entries', 'collections', 'media'].every((k) =>
      Array.isArray(c[k]),
    )
  )
    return false;
  if (
    ![...c.pages, ...c.entries, ...c.collections, ...c.media].every(
      (r) => object(r) && typeof r.id === 'string',
    )
  )
    return false;
  if (
    !c.pages.every(
      (r: any) =>
        Array.isArray(r.blocks) &&
        r.blocks.every(
          (b: any) =>
            object(b) &&
            typeof b.id === 'string' &&
            typeof b.type === 'string' &&
            typeof b.version === 'number' &&
            object(b.props),
        ),
    )
  )
    return false;
  if (
    !c.pages.every(
      (p: any) =>
        ['static', 'generic'].includes(p.kind) &&
        (p.kind === 'generic' || typeof p.path === 'string') &&
        typeof p.title === 'string',
    ) ||
    !c.entries.every(
      (e: any) =>
        typeof e.slug === 'string' &&
        typeof e.collectionId === 'string' &&
        !('blocks' in e) &&
        object(e.values),
    )
  )
    return false;
  if (
    !c.collections.every(
      (col: any) =>
        typeof col.name === 'string' &&
        typeof col.path === 'string' &&
        Array.isArray(col.fields) &&
        col.fields.every((f: unknown) => fieldShape(f)),
    )
  )
    return false;
  if (
    c.site.layout !== undefined &&
    (!object(c.site.layout) ||
      typeof c.site.layout.id !== 'string' ||
      !Number.isInteger(c.site.layout.version) ||
      !object(c.site.layout.settings))
  )
    return false;
  if (
    c.site.layout === undefined &&
    (typeof c.site.title !== 'string' || !Array.isArray(c.site.navigation))
  )
    return false;
  if (c.site.header !== undefined && !object(c.site.header)) return false;
  if (
    c.site.footer !== undefined &&
    (!object(c.site.footer) ||
      typeof c.site.footer.type !== 'string' ||
      !object(c.site.footer.props))
  )
    return false;
  return (
    (c.site.navigation ?? []).every(
      (n: any) =>
        object(n) &&
        typeof n.id === 'string' &&
        typeof n.label === 'string' &&
        object(n.to),
    ) &&
    c.media.every(
      (m: any) =>
        typeof m.name === 'string' &&
        object(m.original) &&
        typeof m.original.mime === 'string' &&
        Array.isArray(m.variants),
    )
  );
}

function fieldShape(f: any, nested = false): boolean {
  return (
    object(f) &&
    typeof f.key === 'string' &&
    typeof f.label === 'string' &&
    [
      'text',
      'url',
      'richtext',
      'number',
      'date',
      'toggle',
      'select',
      'media',
      ...(!nested ? ['list'] : []),
    ].includes(f.type) &&
    (f.type !== 'list' ||
      (Array.isArray(f.fields) &&
        f.fields.every((child: any) => fieldShape(child, true)))) &&
    (f.type !== 'select' ||
      (Array.isArray(f.options) &&
        f.options.every(
          (o: any) =>
            object(o) &&
            typeof o.value === 'string' &&
            typeof o.label === 'string',
        )))
  );
}
