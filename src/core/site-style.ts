import type { Values } from './types';

export const DEFAULT_CONTENT_MAX_WIDTH = 1200;
export const DEFAULT_BODY_FONT_SIZE = 16;
export const DEFAULT_BODY_LINE_HEIGHT = 1.6;
export const DEFAULT_PAGE_GUTTER = 24;

// Built-in stacks need no font downloads. Persist IDs, not arbitrary CSS.
export const SITE_FONTS = [
  {
    id: 'system',
    label: 'System sans',
    family:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  { id: 'arial', label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { id: 'georgia', label: 'Georgia', family: 'Georgia, serif' },
  {
    id: 'times',
    label: 'Times New Roman',
    family: "'Times New Roman', Times, serif",
  },
  {
    id: 'mono',
    label: 'Monospace',
    family: "ui-monospace, 'SFMono-Regular', Consolas, monospace",
  },
] as const;

export function validSiteFont(value: unknown): boolean {
  return SITE_FONTS.some((font) => font.id === value);
}

function fontFamily(value: unknown): string {
  return (SITE_FONTS.find((font) => font.id === value) ?? SITE_FONTS[0]).family;
}

export function validContentMaxWidth(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export const validBodyFontSize = validContentMaxWidth;
export const validBodyLineHeight = validContentMaxWidth;
export function validPageGutter(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function contentMaxWidth(globals: Values): number {
  return validContentMaxWidth(globals.contentMaxWidth)
    ? globals.contentMaxWidth
    : DEFAULT_CONTENT_MAX_WIDTH;
}

/** Apply to the public shell or preview only, never the admin controls. */
export function siteStyle(globals: Values) {
  return {
    '--site-content-max-width': `${contentMaxWidth(globals)}px`,
    '--site-body-font': fontFamily(globals.bodyFont),
    '--site-heading-font': fontFamily(globals.headingFont),
    '--site-body-font-size': `${validBodyFontSize(globals.bodyFontSize) ? globals.bodyFontSize : DEFAULT_BODY_FONT_SIZE}px`,
    '--site-body-line-height': String(
      validBodyLineHeight(globals.bodyLineHeight)
        ? globals.bodyLineHeight
        : DEFAULT_BODY_LINE_HEIGHT,
    ),
    '--site-page-gutter': `${validPageGutter(globals.pageGutter) ? globals.pageGutter : DEFAULT_PAGE_GUTTER}px`,
  };
}
