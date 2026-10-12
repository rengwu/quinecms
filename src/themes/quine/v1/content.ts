import type { Context, Json, Values } from '../../../core/types';
import { safeURL } from '../../../core/content';

export const text = (value: unknown) =>
  typeof value === 'string' ? value : '';
export const href = (value: unknown) => (safeURL(value) ? value : undefined);
export const rows = (value: Json | undefined): Values[] =>
  Array.isArray(value)
    ? value.filter(
        (row): row is Values =>
          !!row && typeof row === 'object' && !Array.isArray(row),
      )
    : [];
export function image(value: Json | undefined, context: Context) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  const record = context.media.find((media) => media.id === value.mediaId);
  if (
    !record?.original.mime.startsWith('image/') ||
    !safeURL(record.original.url)
  )
    return undefined;
  return {
    ...record.original,
    alt: text(value.alt),
    variants: record.variants,
  };
}
export const anchor = (value: unknown) =>
  text(value).trim().replace(/^#/, '') || undefined;
