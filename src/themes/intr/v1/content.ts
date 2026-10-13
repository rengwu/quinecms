import type { Context, Json, Values } from '../../../core/types';
import { safeURL } from '../../../core/content';
import { listRows } from '../../../core/lists';

export const text = (value: unknown) =>
  typeof value === 'string' ? value : '';
export const href = (value: unknown) => (safeURL(value) ? value : undefined);
export const rows = (value: unknown): Values[] => listRows(value);
export const anchor = (value: unknown) =>
  text(value).trim().replace(/^#/, '') || undefined;
export function asset(value: Json | undefined, context: Context) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const media = context.media.find((item) => item.id === value.mediaId);
  if (
    !media?.original.mime.startsWith('image/') ||
    !safeURL(media.original.url)
  )
    return;
  return { ...media.original, variants: media.variants, alt: text(value.alt) };
}
